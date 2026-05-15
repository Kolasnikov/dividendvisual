#!/usr/bin/env python3
"""
DividendVisual — Band Computation Script
Computes Weiss valuation bands, Quality Score, and Why Now text.
Run AFTER ingest.py: python scripts/compute_bands.py
"""

import os
import sys
import time
import requests
import pandas as pd
import numpy as np
from dotenv import load_dotenv

load_dotenv(".env.local")

TURSO_URL = os.environ["TURSO_DATABASE_URL"]
TURSO_TOKEN = os.environ["TURSO_AUTH_TOKEN"]
HTTP_URL = TURSO_URL.replace("libsql://", "https://") + "/v2/pipeline"

WINDOW_YEARS = 10
PERCENTILE_HIGH = 90
PERCENTILE_LOW = 10


# ─── Turso helpers ────────────────────────────────────────────────────────────

def turso_query(sql: str, args: list | None = None) -> list[dict]:
    """Execute a SELECT and return rows as list of dicts."""
    payload = {
        "requests": [
            {"type": "execute", "stmt": _stmt(sql, args)},
            {"type": "close"},
        ]
    }
    resp = requests.post(
        HTTP_URL,
        headers={"Authorization": f"Bearer {TURSO_TOKEN}", "Content-Type": "application/json"},
        json=payload,
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    result = data["results"][0]
    if result["type"] == "error":
        raise RuntimeError(result["error"]["message"])
    cols = [c["name"] for c in result["response"]["result"]["cols"]]
    rows = result["response"]["result"]["rows"]
    return [dict(zip(cols, [_decode(v) for v in row])) for row in rows]


def turso_execute(statements: list[dict]):
    """Execute multiple write statements."""
    payload = {
        "requests": [{"type": "execute", "stmt": s} for s in statements]
    }
    payload["requests"].append({"type": "close"})
    resp = requests.post(
        HTTP_URL,
        headers={"Authorization": f"Bearer {TURSO_TOKEN}", "Content-Type": "application/json"},
        json=payload,
        timeout=60,
    )
    resp.raise_for_status()


def _stmt(sql: str, args: list | None = None) -> dict:
    s: dict = {"sql": sql}
    if args:
        s["args"] = [_encode(a) for a in args]
    return s


def _encode(v) -> dict:
    if v is None:
        return {"type": "null"}
    if isinstance(v, bool):
        return {"type": "integer", "value": str(int(v))}
    if isinstance(v, int):
        return {"type": "integer", "value": str(v)}
    if isinstance(v, float):
        if np.isnan(v) or np.isinf(v):
            return {"type": "null"}
        return {"type": "float", "value": v}  # JSON number, NOT string
    return {"type": "text", "value": str(v)}


def _decode(v: dict):
    t = v.get("type")
    val = v.get("value")
    if t == "null" or val is None:
        return None
    if t == "integer":
        return int(val)
    if t == "float":
        return float(val)
    return val


# ─── Core computation ─────────────────────────────────────────────────────────

def load_prices(symbol: str) -> pd.DataFrame:
    rows = turso_query(
        "SELECT date, close FROM price_history WHERE symbol = ? ORDER BY date",
        [symbol],
    )
    if not rows:
        return pd.DataFrame()
    df = pd.DataFrame(rows)
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date").sort_index()

    # Remove obvious price outliers — weekly closes that deviate >50% from the
    # centred 5-week rolling median (catches bad yfinance data points).
    if len(df) >= 5:
        rolling_med = df["close"].rolling(window=5, min_periods=3, center=True).median()
        ratio = df["close"] / rolling_med
        df = df[(ratio >= 0.5) & (ratio <= 2.0)]

    return df


def load_dividends(symbol: str) -> pd.DataFrame:
    rows = turso_query(
        "SELECT date, amount, is_special FROM dividend_history WHERE symbol = ? ORDER BY date",
        [symbol],
    )
    if not rows:
        return pd.DataFrame()
    df = pd.DataFrame(rows)
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date").sort_index()
    return df


def compute_trailing_annual_dividend(div_df: pd.DataFrame, date: pd.Timestamp) -> float:
    """Annualised dividend for a given date using a capped trailing-13M window.

    Uses 13 months (not 12) to avoid missing a payment that falls just outside a
    calendar-year boundary due to declaration timing.  A year-over-year cap of 2×
    prevents un-filtered special dividends or yfinance data artifacts from spiking
    the bands — a legitimate 100 %+ YoY dividend raise is extremely rare.
    """
    if div_df.empty:
        return 0.0

    regular = div_df[div_df["is_special"] == 0]["amount"]

    # Current window: trailing 13 months
    window_start = date - pd.DateOffset(months=13)
    current = regular[(regular.index >= window_start) & (regular.index <= date)]
    current_sum = float(current.sum()) if not current.empty else 0.0

    if current_sum == 0.0:
        return 0.0

    # Prior-year window for cap (13 months ending 12 months ago)
    prior_end   = date - pd.DateOffset(months=12)
    prior_start = prior_end - pd.DateOffset(months=13)
    prior = regular[(regular.index >= prior_start) & (regular.index < prior_end)]
    prior_sum = float(prior.sum()) if not prior.empty else 0.0

    # Cap: annual dividend cannot more than double year-over-year
    if prior_sum > 0:
        current_sum = min(current_sum, prior_sum * 2.0)

    return current_sum


def compute_weiss_bands(symbol: str, price_df: pd.DataFrame, div_df: pd.DataFrame) -> pd.DataFrame:
    """
    For each weekly price point, compute:
    - annual_dividend (trailing 12M, regular only)
    - yield = annual_dividend / price
    - rolling percentile 90/10 yields (window = WINDOW_YEARS years)
    - undervalued_band = annual_dividend / max_yield
    - overvalued_band  = annual_dividend / min_yield
    """
    if price_df.empty:
        return pd.DataFrame()

    records = []
    window_bars = WINDOW_YEARS * 52  # ~52 weeks per year

    # Precompute annual dividends per date for efficiency
    dates = price_df.index.tolist()
    annual_divs = [compute_trailing_annual_dividend(div_df, d) for d in dates]

    prices = price_df["close"].values

    # Compute yields array
    yields = []
    for i, (price, ann_div) in enumerate(zip(prices, annual_divs)):
        y = ann_div / price if price > 0 and ann_div > 0 else np.nan
        yields.append(y)

    yields_arr = np.array(yields, dtype=float)

    for i in range(len(dates)):
        date = dates[i]
        price = float(prices[i])
        ann_div = annual_divs[i]

        # Rolling window for yield percentiles
        window_start = max(0, i - window_bars)
        window_yields = yields_arr[window_start : i + 1]
        valid_yields = window_yields[~np.isnan(window_yields)]

        if len(valid_yields) < 10 or ann_div == 0:
            # Not enough data yet
            records.append({
                "date": date,
                "price": price,
                "undervalued_band": None,
                "overvalued_band": None,
                "annual_dividend": ann_div if ann_div > 0 else None,
            })
            continue

        max_yield = np.percentile(valid_yields, PERCENTILE_HIGH)
        min_yield = np.percentile(valid_yields, PERCENTILE_LOW)

        undervalued = ann_div / max_yield if max_yield > 0 else None
        overvalued = ann_div / min_yield if min_yield > 0 else None

        records.append({
            "date": date,
            "price": price,
            "undervalued_band": undervalued,
            "overvalued_band": overvalued,
            "annual_dividend": ann_div,
        })

    return pd.DataFrame(records)


def compute_current_metrics(symbol: str, price_df: pd.DataFrame, div_df: pd.DataFrame, band_df: pd.DataFrame) -> dict:
    """Derive computed_metrics from the latest row of band_df."""
    if band_df.empty or price_df.empty:
        return {}

    last = band_df.iloc[-1]
    current_price = float(last["price"]) if last["price"] else 0
    ann_div = float(last["annual_dividend"]) if last["annual_dividend"] else 0
    current_yield = ann_div / current_price if current_price > 0 else 0

    undervalued_price = float(last["undervalued_band"]) if last["undervalued_band"] else 0
    overvalued_price = float(last["overvalued_band"]) if last["overvalued_band"] else 0

    # Historical yield range from all valid data
    valid_rows = band_df.dropna(subset=["undervalued_band", "overvalued_band"])
    if not valid_rows.empty and ann_div > 0:
        # Recompute yields for the full history
        all_yields = (band_df["annual_dividend"] / band_df["price"]).dropna()
        historical_max_yield = float(all_yields.quantile(0.90))
        historical_min_yield = float(all_yields.quantile(0.10))
        median_yield = float(all_yields.median())
    else:
        historical_max_yield = current_yield
        historical_min_yield = current_yield
        median_yield = current_yield

    # Weiss signal
    if current_price <= undervalued_price * 1.05:
        signal = "undervalued"
    elif current_price >= overvalued_price * 0.95:
        signal = "overvalued"
    else:
        signal = "fair"

    # Dividend CAGR
    cagr_5y = compute_dividend_cagr(div_df, years=5)
    cagr_10y = compute_dividend_cagr(div_df, years=10)

    # Years without dividend cut
    years_no_cut = compute_years_no_cut(div_df)

    return {
        "current_price": current_price,
        "annual_dividend": ann_div,
        "current_yield": current_yield,
        "historical_max_yield": historical_max_yield,
        "historical_min_yield": historical_min_yield,
        "median_yield": median_yield,
        "undervalued_price": undervalued_price,
        "overvalued_price": overvalued_price,
        "weiss_signal": signal,
        "dividend_cagr_5y": cagr_5y,
        "dividend_cagr_10y": cagr_10y,
        "years_no_cut": years_no_cut,
    }


def _completed_annual(regular: pd.Series) -> pd.Series:
    """Resample to annual sums, excluding the current partial year."""
    annual = regular.resample("YE").sum()
    current_year = pd.Timestamp.now().year
    annual = annual[annual.index.year < current_year]
    return annual[annual > 0]


def compute_dividend_cagr(div_df: pd.DataFrame, years: int) -> float | None:
    if div_df.empty:
        return None
    regular = div_df[div_df["is_special"] == 0]["amount"]
    if regular.empty:
        return None
    try:
        annual = _completed_annual(regular)
        if len(annual) < years + 1:
            return None
        start = float(annual.iloc[-years - 1])
        end = float(annual.iloc[-1])
        if start <= 0:
            return None
        return float((end / start) ** (1 / years) - 1)
    except Exception:
        return None


def compute_years_no_cut(div_df: pd.DataFrame) -> int:
    if div_df.empty:
        return 0
    regular = div_df[div_df["is_special"] == 0]["amount"]
    if regular.empty:
        return 0
    try:
        annual = _completed_annual(regular)
        streak = 0
        for i in range(len(annual) - 1, 0, -1):
            if annual.iloc[i] >= annual.iloc[i - 1] * 0.99:  # 1% tolerance
                streak += 1
            else:
                break
        return streak
    except Exception:
        return 0


# ─── Quality Score ─────────────────────────────────────────────────────────────

def compute_quality_score(metrics: dict) -> tuple[int, str]:
    score = 0

    # 1. Payout ratio (25 pts)
    pr = metrics.get("payout_ratio") or 1.0
    if pr < 0.40:   score += 25
    elif pr < 0.55: score += 20
    elif pr < 0.70: score += 12
    elif pr < 0.85: score += 5

    # 2. Years without cut (25 pts)
    years = metrics.get("years_no_cut") or 0
    if years >= 25:   score += 25
    elif years >= 10: score += 20
    elif years >= 5:  score += 12
    elif years >= 2:  score += 5

    # 3. Dividend CAGR 5y (20 pts)
    cagr = metrics.get("dividend_cagr_5y") or 0
    if cagr >= 0.08:   score += 20
    elif cagr >= 0.05: score += 15
    elif cagr >= 0.02: score += 8
    elif cagr >= 0:    score += 3

    # 4. Yield vs history (15 pts)
    current_yield = metrics.get("current_yield") or 0
    max_yield = metrics.get("historical_max_yield") or 1
    ratio = current_yield / max_yield if max_yield > 0 else 0
    if ratio >= 0.85:   score += 15
    elif ratio >= 0.70: score += 10
    elif ratio >= 0.50: score += 5

    # 5. FCF payout (15 pts)
    fcf = metrics.get("fcf_payout")
    if fcf is not None:
        if fcf < 0.50:   score += 15
        elif fcf < 0.70: score += 10
        elif fcf < 0.85: score += 5

    score = min(score, 100)
    if score >= 80:   category = "Excellent"
    elif score >= 60: category = "Good"
    elif score >= 40: category = "Average"
    else:             category = "Risky"

    return score, category


# ─── Why Now text ──────────────────────────────────────────────────────────────

def generate_why_now_text(name: str, metrics: dict) -> str:
    signal = metrics.get("weiss_signal", "fair")
    current_yield = metrics.get("current_yield") or 0
    max_yield = metrics.get("historical_max_yield") or 0
    years_no_cut = metrics.get("years_no_cut") or 0
    payout = metrics.get("payout_ratio")

    # Line 1 — Weiss signal
    if signal == "undervalued":
        line1 = f"{name} is trading near its historical undervaluation band."
    elif signal == "overvalued":
        line1 = f"{name} is trading near its historical overvaluation band."
    else:
        line1 = f"{name} is trading at a fair valuation relative to its dividend history."

    # Line 2 — Yield vs history
    if max_yield > 0:
        pct = (current_yield / max_yield) * 100
        line2 = (
            f"Current yield {current_yield*100:.1f}% vs historical max {max_yield*100:.1f}% "
            f"({pct:.0f}% of maximum)."
        )
    else:
        line2 = f"Current yield: {current_yield*100:.1f}%."

    # Line 3 — Streak
    if years_no_cut >= 25:
        line3 = f"{years_no_cut} consecutive years of dividend growth — Dividend King territory."
    elif years_no_cut >= 10:
        line3 = f"{years_no_cut} consecutive years without a dividend cut."
    elif years_no_cut >= 2:
        line3 = f"{years_no_cut} years of uninterrupted dividends."
    else:
        line3 = "Recent dividend history shows no sustained growth streak."

    # Line 4 — Payout
    if payout is not None:
        if payout < 0.60:
            adj = "conservative"
        elif payout < 0.75:
            adj = "reasonable"
        else:
            adj = "elevated"
        line4 = f"{adj.capitalize()} payout ratio of {payout*100:.0f}%."
    else:
        line4 = "Payout ratio data unavailable."

    return "\n".join([line1, line2, line3, line4])


# ─── Persistence ──────────────────────────────────────────────────────────────

def save_weiss_chart_data(symbol: str, band_df: pd.DataFrame):
    """Save band data to weiss_chart_data, keeping last 5 years for API."""
    if band_df.empty:
        return
    # Store all data (ingest keeps 10y; API filters to 5y by default)
    statements = []
    for _, row in band_df.iterrows():
        statements.append(_stmt(
            """INSERT OR REPLACE INTO weiss_chart_data
               (symbol, date, price, undervalued_band, overvalued_band, annual_dividend)
               VALUES (?, ?, ?, ?, ?, ?)""",
            [
                symbol,
                str(row["date"].date()) if hasattr(row["date"], "date") else str(row["date"]),
                row["price"],
                row["undervalued_band"],
                row["overvalued_band"],
                row["annual_dividend"],
            ],
        ))
    # Flush in chunks of 50
    for i in range(0, len(statements), 50):
        turso_execute(statements[i : i + 50])


def save_computed_metrics(symbol: str, metrics: dict, score: int, category: str, why_now: str):
    turso_execute([_stmt(
        """INSERT OR REPLACE INTO computed_metrics (
               symbol, current_price, annual_dividend, current_yield,
               historical_max_yield, historical_min_yield, median_yield,
               undervalued_price, overvalued_price, weiss_signal,
               quality_score, quality_category,
               payout_ratio, fcf_payout, dividend_cagr_5y, dividend_cagr_10y,
               years_no_cut, why_now_text, updated_at
           ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))""",
        [
            symbol,
            metrics.get("current_price"),
            metrics.get("annual_dividend"),
            metrics.get("current_yield"),
            metrics.get("historical_max_yield"),
            metrics.get("historical_min_yield"),
            metrics.get("median_yield"),
            metrics.get("undervalued_price"),
            metrics.get("overvalued_price"),
            metrics.get("weiss_signal"),
            score,
            category,
            metrics.get("payout_ratio"),
            metrics.get("fcf_payout"),
            metrics.get("dividend_cagr_5y"),
            metrics.get("dividend_cagr_10y"),
            metrics.get("years_no_cut"),
            why_now,
        ],
    )])


# ─── Main ─────────────────────────────────────────────────────────────────────

def get_fundamentals_from_yf(symbol: str) -> dict:
    """Fetch payout_ratio and FCF payout from yfinance .info."""
    try:
        import yfinance as yf
        info = yf.Ticker(symbol).info
        payout = info.get("payoutRatio")
        # FCF payout: annualDividend / (freeCashflow / sharesOutstanding)
        fcf = info.get("freeCashflow")
        shares = info.get("sharesOutstanding")
        div_rate = info.get("dividendRate")
        fcf_payout = None
        if fcf and shares and div_rate and shares > 0 and fcf > 0:
            fcf_per_share = fcf / shares
            ratio = div_rate / fcf_per_share
            if 0 < ratio < 2.0:  # sanity check — ignore implausible values
                fcf_payout = ratio
        return {"payout_ratio": payout, "fcf_payout": fcf_payout}
    except Exception:
        return {"payout_ratio": None, "fcf_payout": None}


def process_ticker(symbol: str, company_name: str) -> bool:
    try:
        price_df = load_prices(symbol)
        div_df = load_dividends(symbol)

        if price_df.empty:
            print(f"  [{symbol}] No price data in DB, skipping.")
            return False

        # Compute bands
        band_df = compute_weiss_bands(symbol, price_df, div_df)

        # Current metrics
        metrics = compute_current_metrics(symbol, price_df, div_df, band_df)
        if not metrics:
            print(f"  [{symbol}] Could not compute metrics.")
            return False

        # Add fundamentals from yfinance .info
        fundamentals = get_fundamentals_from_yf(symbol)
        metrics.update(fundamentals)

        # Quality score
        score, category = compute_quality_score(metrics)

        # Why Now
        why_now = generate_why_now_text(company_name, metrics)

        # Save
        save_weiss_chart_data(symbol, band_df)
        save_computed_metrics(symbol, metrics, score, category, why_now)

        print(
            f"  [{symbol}] OK — signal={metrics['weiss_signal']}, "
            f"yield={metrics['current_yield']*100:.1f}%, score={score} ({category})"
        )
        return True

    except Exception as e:
        print(f"  [{symbol}] ERROR: {e}")
        import traceback; traceback.print_exc()
        return False


def main():
    companies = turso_query("SELECT symbol, name FROM companies ORDER BY symbol")
    if not companies:
        print("No companies found. Run ingest.py first.")
        sys.exit(1)

    print(f"Computing bands for {len(companies)} tickers...\n")
    ok, failed = 0, []

    for row in companies:
        symbol = row["symbol"]
        name = row["name"]
        success = process_ticker(symbol, name)
        if success:
            ok += 1
        else:
            failed.append(symbol)

    print(f"\nDone. {ok}/{len(companies)} tickers computed.")
    if failed:
        print(f"Failed: {failed}")


if __name__ == "__main__":
    main()
