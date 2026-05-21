#!/usr/bin/env python3
"""
DividendVisual — Data Ingestion Script
Downloads price history, dividends, and fundamentals for all tickers via yfinance.
Stores data in Turso via HTTP API.
Run: python scripts/ingest.py
"""

import os
import sys
import time
import json
import signal
import argparse
import requests
import base64
import pandas as pd
import yfinance as yf
from contextlib import contextmanager
from dotenv import load_dotenv
from dividend_classifications import (
    DIVIDEND_ARISTOCRATS,
    DIVIDEND_KINGS,
    DIVIDEND_STREAK_YEARS,
)

load_dotenv(".env.local")

TURSO_URL = os.environ["TURSO_DATABASE_URL"]
TURSO_TOKEN = os.environ["TURSO_AUTH_TOKEN"]
DEFAULT_TICKER_TIMEOUT_SECONDS = int(os.getenv("INGEST_TICKER_TIMEOUT_SECONDS", "90"))
YFINANCE_REQUEST_TIMEOUT_SECONDS = int(os.getenv("YFINANCE_REQUEST_TIMEOUT_SECONDS", "30"))
TURSO_REQUEST_TIMEOUT_SECONDS = int(os.getenv("TURSO_REQUEST_TIMEOUT_SECONDS", "20"))
TURSO_MAX_RETRIES = int(os.getenv("TURSO_MAX_RETRIES", "3"))
REQUEST_PAUSE_SECONDS = float(os.getenv("INGEST_REQUEST_PAUSE_SECONDS", "1"))
DEFAULT_MAX_FAILURES = int(os.getenv("INGEST_MAX_FAILURES", "25"))
INCREMENTAL_PRICE_LOOKBACK_DAYS = int(os.getenv("INGEST_INCREMENTAL_PRICE_LOOKBACK_DAYS", "21"))
INCREMENTAL_DIVIDEND_LOOKBACK_DAYS = int(os.getenv("INGEST_INCREMENTAL_DIVIDEND_LOOKBACK_DAYS", "120"))

# Convert libsql:// to https://
HTTP_URL = TURSO_URL.replace("libsql://", "https://") + "/v2/pipeline"

TICKERS = [
    # ── Dividend Kings / Aristocrats (original) ──────────────────────────────
    "KO", "PEP", "JNJ", "PG", "MMM", "MCD", "WMT", "HD", "LOW",
    "ABT", "MDT", "ABBV", "XOM", "CVX", "T", "VZ",
    "SO", "DUK", "NEE", "O", "FRT",
    "GPC", "CLX", "SYY", "TGT", "MO", "PM",
    "MAIN", "BEN", "VFC",
    "KMB", "CL", "HRL", "MKC", "HSY", "CPB",
    "BMY", "PFE", "AMGN", "BDX", "SYK",
    "EMR", "ITW", "CTAS", "GD", "CAT", "PH",
    "USB", "AFL", "TROW", "CB", "AMP",
    "NNN", "AMT", "ADC",
    "AWK", "WEC", "AEP", "D",
    "TXN", "MSFT", "ECL", "ATO",

    # ── Dividend Kings (50+ years, new additions) ─────────────────────────────
    "AWR",   # American States Water — 69 years, longest streak ever
    "DOV",   # Dover Corporation — 68 years
    "CINF",  # Cincinnati Financial — 63 years
    "NDSN",  # Nordson — 61 years
    "LANC",  # Lancaster Colony — 61 years
    "GWW",   # W.W. Grainger — 53 years
    "PPG",   # PPG Industries — 52 years
    "RPM",   # RPM International — 51 years
    "MSA",   # MSA Safety — 52 years
    "NUE",   # Nucor — 50 years
    "CBSH",  # Commerce Bancshares — 56 years

    # ── Dividend Aristocrats (25+ years, new additions) ───────────────────────
    "SHW",   # Sherwin-Williams — 45 years
    "ED",    # Consolidated Edison — 49 years
    "ADP",   # Automatic Data Processing — 48 years
    "SPGI",  # S&P Global — 50 years
    "CHD",   # Church & Dwight — 29 years
    "ROP",   # Roper Technologies — 30 years
    "AOS",   # A.O. Smith — 30 years
    "EXPD",  # Expeditors International — 28 years
    "PAYX",  # Paychex — 33 years
    "BRO",   # Brown & Brown — 30 years

    # ── Consumer Discretionary / Staples ──────────────────────────────────────
    "GIS",   # General Mills
    "SJM",   # J.M. Smucker
    "DEO",   # Diageo ADR
    "TJX",   # TJX Companies — 27 years
    "SBUX",  # Starbucks — 13 years
    "FAST",  # Fastenal — 23 years

    # ── Healthcare ────────────────────────────────────────────────────────────
    "UNH",   # UnitedHealth Group
    "CVS",   # CVS Health
    "DGX",   # Quest Diagnostics
    "MCK",   # McKesson

    # ── Financials ────────────────────────────────────────────────────────────
    "BLK",   # BlackRock — 14 years
    "ICE",   # Intercontinental Exchange — 11 years
    "CME",   # CME Group — 14 years
    "MMC",   # Marsh & McLennan — 14 years
    "PNC",   # PNC Financial — 12 years
    "JPM",   # JPMorgan Chase — 13 years
    "MTB",   # M&T Bank — 11 years
    "FITB",  # Fifth Third Bancorp — 11 years
    "ALL",   # Allstate — 12 years
    "TRV",   # Travelers — 18 years
    "HBAN",  # Huntington Bancshares — 11 years

    # ── Industrials ───────────────────────────────────────────────────────────
    "HON",   # Honeywell — 13 years
    "ETN",   # Eaton — 14 years
    "LMT",   # Lockheed Martin — 21 years
    "NOC",   # Northrop Grumman — 20 years
    "UPS",   # United Parcel Service — 15 years
    "UNP",   # Union Pacific — 16 years
    "NSC",   # Norfolk Southern — 22 years
    "CSX",   # CSX — 16 years
    "ROK",   # Rockwell Automation — 13 years
    "AME",   # AMETEK — 13 years

    # ── Technology ────────────────────────────────────────────────────────────
    "CSCO",  # Cisco Systems — 13 years
    "QCOM",  # Qualcomm — 21 years
    "AVGO",  # Broadcom — 13 years
    "IBM",   # IBM — decades-long payer
    "AAPL",  # Apple — 11 years
    "ACN",   # Accenture — 14 years

    # ── Payments / Fintech ────────────────────────────────────────────────────
    "V",     # Visa — 15 years, ~20% CAGR
    "MA",    # Mastercard — 13 years, ~20% CAGR
    "AXP",   # American Express — 32 years (Aristocrat)
    "SCHW",  # Charles Schwab — 15 years
    "MCO",   # Moody's — 15 years

    # ── Consumer Discretionary ────────────────────────────────────────────────
    "COST",  # Costco — 21 years, special dividends
    "NKE",   # Nike — 22 years
    "DE",    # Deere & Company — 3 years post-reset

    # ── Healthcare / Pharma ───────────────────────────────────────────────────
    "MRK",   # Merck — 14 years

    # ── Technology / Semiconductors ───────────────────────────────────────────
    "AMAT",  # Applied Materials — 10 years

    # ── Energy / Midstream ────────────────────────────────────────────────────
    "OKE",   # ONEOK — 25 years
    "PSX",   # Phillips 66 — 12 years
    "VLO",   # Valero Energy — 10 years
    "EPD",   # Enterprise Products Partners — 24 years (MLP)

    # ── Utilities (new) ───────────────────────────────────────────────────────
    "ETR",   # Entergy — 20 years
    "CMS",   # CMS Energy — 15 years
    "XEL",   # Xcel Energy — 19 years
    "LNT",   # Alliant Energy — 20 years
    "SRE",   # Sempra Energy — 20 years
    "PNW",   # Pinnacle West Capital — 30 years
    "OGE",   # OGE Energy — 15 years

    # ── REITs (new) ───────────────────────────────────────────────────────────
    "PSA",   # Public Storage — 20 years
    "DLR",   # Digital Realty — 17 years
    "PLD",   # Prologis — 13 years
    "STAG",  # STAG Industrial — 12 years (monthly)
    "EXR",   # Extra Space Storage — 13 years
    "MAA",   # Mid-America Apartment — 13 years
    "OHI",   # Omega Healthcare — 12 years
    "IRM",   # Iron Mountain — 12 years
    "ESS",   # Essex Property Trust — 29 years

    # ── Waste / Environmental ─────────────────────────────────────────────────
    "WM",    # Waste Management — 20 years
    "RSG",   # Republic Services — 14 years
]

COLLECTIONS = {
    "dividend-kings": DIVIDEND_KINGS,
    "dividend-aristocrats": DIVIDEND_ARISTOCRATS,
    "buffett-style": [
        "KO", "JNJ", "PG", "MCD", "WMT", "AMGN",
        "AAPL", "BLK", "UNH",
    ],
    "utilities": [
        "SO", "DUK", "NEE", "AWK", "WEC", "AEP", "D",
        "ETR", "CMS", "XEL", "LNT", "SRE", "PNW", "OGE", "ED",
    ],
    "reits": [
        "O", "FRT", "NNN", "AMT", "ADC",
        "PSA", "DLR", "PLD", "STAG", "EXR", "MAA", "OHI", "IRM", "ESS",
    ],
    "high-yield": [
        "MO", "T", "VZ", "MAIN", "BMY", "PFE",
        "OKE", "EPD", "OHI", "IRM", "STAG",
    ],
    "low-payout-compounders": [
        "HD", "LOW", "TGT", "ABT", "TXN", "MSFT", "CTAS",
        "CSCO", "QCOM", "ACN", "FAST", "ROP", "AAPL", "UNH",
    ],
    "monthly-dividend-payers": [
        "O", "MAIN", "STAG", "ADC",
    ],
}


class TickerTimeoutError(TimeoutError):
    pass


class TursoStatementError(RuntimeError):
    pass


def _timeout_handler(signum, frame):
    raise TickerTimeoutError("Ticker ingest timed out")


@contextmanager
def ticker_time_limit(seconds: int):
    previous_handler = signal.signal(signal.SIGALRM, _timeout_handler)
    signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)
        signal.signal(signal.SIGALRM, previous_handler)


def ticker_history(ticker: yf.Ticker, **kwargs) -> pd.DataFrame:
    """Call yfinance history with a request timeout when supported."""
    try:
        return ticker.history(timeout=YFINANCE_REQUEST_TIMEOUT_SECONDS, **kwargs)
    except TypeError:
        return ticker.history(**kwargs)


def turso_execute(statements: list[dict]) -> dict:
    """Execute a batch of SQL statements against Turso HTTP API."""
    payload = {"requests": [{"type": "execute", "stmt": s} for s in statements]}
    payload["requests"].append({"type": "close"})

    last_error = None
    for attempt in range(1, TURSO_MAX_RETRIES + 1):
        try:
            resp = requests.post(
                HTTP_URL,
                headers={
                    "Authorization": f"Bearer {TURSO_TOKEN}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=TURSO_REQUEST_TIMEOUT_SECONDS,
            )
            resp.raise_for_status()
            data = resp.json()
            for result in data.get("results", []):
                if result.get("type") == "error":
                    raise TursoStatementError(result.get("error", {}).get("message", "Unknown Turso error"))
            return data
        except TursoStatementError:
            raise
        except Exception as exc:
            last_error = exc
            if attempt == TURSO_MAX_RETRIES:
                break
            sleep_for = min(2 ** attempt, 8)
            print(f"    Turso request failed ({exc}); retrying in {sleep_for}s...")
            time.sleep(sleep_for)
    raise last_error


def _decode_turso_value(value: dict):
    kind = value.get("type")
    raw = value.get("value")
    if kind == "null" or raw is None:
        return None
    if kind == "integer":
        return int(raw)
    if kind == "float":
        return float(raw)
    return raw


def turso_query_one(sql: str, args: list | None = None) -> dict:
    data = turso_execute([stmt(sql, args)])
    result = data["results"][0]["response"].get("result")
    if not result or not result.get("rows"):
        return {}
    cols = [col["name"] for col in result["cols"]]
    values = [_decode_turso_value(value) for value in result["rows"][0]]
    return dict(zip(cols, values))


def stmt(sql: str, args: list | None = None) -> dict:
    """Build a Turso statement dict."""
    s: dict = {"sql": sql}
    if args:
        s["args"] = [_encode_arg(a) for a in args]
    return s


def _encode_arg(v) -> dict:
    if v is None:
        return {"type": "null"}
    if isinstance(v, bool):
        return {"type": "integer", "value": str(int(v))}
    if isinstance(v, int):
        return {"type": "integer", "value": str(v)}
    if isinstance(v, float):
        return {"type": "float", "value": v}  # JSON number, NOT string
    return {"type": "text", "value": str(v)}


def init_schema():
    print("Initializing schema...")
    statements = [
        stmt("""CREATE TABLE IF NOT EXISTS companies (
            symbol TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            sector TEXT,
            industry TEXT,
            is_dividend_king INTEGER DEFAULT 0,
            is_dividend_aristocrat INTEGER DEFAULT 0,
            is_blue_chip INTEGER DEFAULT 0,
            years_increasing_dividends INTEGER DEFAULT 0,
            updated_at TEXT DEFAULT (datetime('now'))
        )"""),
        stmt("""CREATE TABLE IF NOT EXISTS price_history (
            symbol TEXT NOT NULL,
            date TEXT NOT NULL,
            close REAL NOT NULL,
            PRIMARY KEY (symbol, date)
        )"""),
        stmt("""CREATE TABLE IF NOT EXISTS dividend_history (
            symbol TEXT NOT NULL,
            date TEXT NOT NULL,
            amount REAL NOT NULL,
            is_special INTEGER DEFAULT 0,
            PRIMARY KEY (symbol, date)
        )"""),
        stmt("""CREATE TABLE IF NOT EXISTS computed_metrics (
            symbol TEXT PRIMARY KEY,
            current_price REAL,
            annual_dividend REAL,
            current_yield REAL,
            historical_max_yield REAL,
            historical_min_yield REAL,
            median_yield REAL,
            undervalued_price REAL,
            overvalued_price REAL,
            weiss_signal TEXT,
            quality_score INTEGER,
            quality_category TEXT,
            payout_ratio REAL,
            fcf_payout REAL,
            dividend_cagr_5y REAL,
            dividend_cagr_10y REAL,
            years_no_cut INTEGER,
            why_now_text TEXT,
            updated_at TEXT DEFAULT (datetime('now'))
        )"""),
        stmt("""CREATE TABLE IF NOT EXISTS weiss_chart_data (
            symbol TEXT NOT NULL,
            date TEXT NOT NULL,
            price REAL,
            undervalued_band REAL,
            overvalued_band REAL,
            annual_dividend REAL,
            PRIMARY KEY (symbol, date)
        )"""),
        stmt("""CREATE TABLE IF NOT EXISTS collections (
            slug TEXT NOT NULL,
            symbol TEXT NOT NULL,
            PRIMARY KEY (slug, symbol)
        )"""),
    ]
    turso_execute(statements)
    for sql in [
        "ALTER TABLE companies ADD COLUMN payout_ratio REAL",
        "ALTER TABLE companies ADD COLUMN fcf_payout REAL",
    ]:
        try:
            turso_execute([stmt(sql)])
        except Exception:
            pass
    print("Schema ready.")


def detect_special_dividends(div_series: pd.Series) -> pd.Series:
    """Return boolean mask for special dividends.

    A payment is considered special if:
    - It is > 1.8x the median regular payment, OR
    - It is > 1.5x the 90th percentile of all payments (catches large one-offs
      even when the median itself is elevated by past specials).
    """
    if div_series.empty:
        return pd.Series(dtype=bool)
    median = div_series.median()
    if median == 0:
        return pd.Series([False] * len(div_series), index=div_series.index)
    p90 = div_series.quantile(0.90)
    return (div_series > (1.8 * median)) | (div_series > (1.5 * p90))


def get_ticker_info(ticker: yf.Ticker) -> dict:
    """Safely extract .info fields."""
    try:
        info = ticker.info
    except Exception:
        info = {}
    payout_ratio = info.get("payoutRatio")
    fcf = info.get("freeCashflow")
    shares = info.get("sharesOutstanding")
    div_rate = info.get("dividendRate")
    fcf_payout = None
    if fcf and shares and div_rate and shares > 0 and fcf > 0:
        fcf_per_share = fcf / shares
        ratio = div_rate / fcf_per_share
        if 0 < ratio < 2.0:
            fcf_payout = ratio
    return {
        "name": info.get("longName") or info.get("shortName") or "",
        "sector": info.get("sector"),
        "industry": info.get("industry"),
        "payout_ratio": payout_ratio,
        "fcf_payout": fcf_payout,
        "trailing_eps": info.get("trailingEps"),
        "free_cashflow": info.get("freeCashflow"),
        "dividends_per_share": info.get("dividendRate"),
    }


def latest_ingested_dates(symbol: str) -> tuple[str | None, str | None]:
    row = turso_query_one("""
        SELECT
          (SELECT MAX(date) FROM price_history WHERE symbol = ?) AS latest_price_date,
          (SELECT MAX(date) FROM dividend_history WHERE symbol = ?) AS latest_dividend_date
    """, [symbol, symbol])
    return row.get("latest_price_date"), row.get("latest_dividend_date")


def incremental_cutoff(latest_date: str | None, lookback_days: int):
    if not latest_date:
        return None
    return pd.to_datetime(latest_date) - pd.Timedelta(days=lookback_days)


def ingest_ticker(symbol: str, timeout_seconds: int = DEFAULT_TICKER_TIMEOUT_SECONDS, full_refresh: bool = False) -> bool:
    print(f"  [{symbol}] Downloading...")
    started_at = time.monotonic()
    try:
        with ticker_time_limit(timeout_seconds):
            tk = yf.Ticker(symbol)

            # --- Price history + dividends (10 years, weekly) ---
            # Using history() for both so dividends are period-limited and split-adjusted consistently
            hist = ticker_history(tk, period="15y", interval="1wk", auto_adjust=True)
            if hist.empty:
                print(f"  [{symbol}] No price data, skipping.")
                return False
            prices = hist[["Close"]].dropna()
            prices.index = pd.to_datetime(prices.index).tz_localize(None)

            # Dividends: use daily history to get all dividend events in the 15Y window
            hist_daily = ticker_history(tk, period="15y", interval="1d", auto_adjust=True)
            divs_raw = hist_daily["Dividends"] if "Dividends" in hist_daily.columns else pd.Series(dtype=float)
            divs = divs_raw[divs_raw > 0].copy()
            if not divs.empty:
                divs.index = pd.to_datetime(divs.index).tz_localize(None)
                divs = divs.sort_index()

            # --- Info ---
            info = get_ticker_info(tk)
            name = info["name"] or symbol

            # --- Determine badges ---
            is_king = int(symbol in DIVIDEND_KINGS)
            is_aristocrat = int(symbol in DIVIDEND_ARISTOCRATS)
            is_blue_chip = int(is_king or is_aristocrat)

            # --- Years increasing dividends (consecutive annual increases, completed years only) ---
            years_increasing = 0
            if symbol in DIVIDEND_STREAK_YEARS:
                years_increasing = DIVIDEND_STREAK_YEARS[symbol]
            elif not divs.empty:
                annual = divs.resample("YE").sum()
                current_year = pd.Timestamp.now().year
                annual = annual[annual.index.year < current_year]  # exclude partial current year
                annual = annual[annual > 0]
                streak = 0
                for i in range(len(annual) - 1, 0, -1):
                    if annual.iloc[i] >= annual.iloc[i - 1]:
                        streak += 1
                    else:
                        break
                years_increasing = streak

            latest_price_date, latest_dividend_date = (None, None) if full_refresh else latest_ingested_dates(symbol)
            price_cutoff = incremental_cutoff(latest_price_date, INCREMENTAL_PRICE_LOOKBACK_DAYS)
            dividend_cutoff = incremental_cutoff(latest_dividend_date, INCREMENTAL_DIVIDEND_LOOKBACK_DAYS)

            def flush_in_batches(stmts: list, batch_size: int = 40):
                for i in range(0, len(stmts), batch_size):
                    turso_execute(stmts[i : i + batch_size])

            # Upsert company (single statement, flush immediately)
            turso_execute([stmt(
                """INSERT OR REPLACE INTO companies
                   (symbol, name, sector, industry,
                    is_dividend_king, is_dividend_aristocrat, is_blue_chip,
                    years_increasing_dividends, payout_ratio, fcf_payout, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))""",
                [symbol, name, info["sector"], info["industry"],
                 is_king, is_aristocrat, is_blue_chip, years_increasing,
                 info.get("payout_ratio"), info.get("fcf_payout")],
            )])

            # Price history — flush in real batches of 40
            price_rows = [
                (symbol, str(d.date()), float(c))
                for d, c in zip(prices.index, prices["Close"])
                if price_cutoff is None or d >= price_cutoff
            ]
            price_stmts = [
                stmt(
                    "INSERT OR REPLACE INTO price_history (symbol, date, close) VALUES (?, ?, ?)",
                    list(row),
                )
                for row in price_rows
            ]
            flush_in_batches(price_stmts)

            # Dividend history — flush in real batches of 40
            if not divs.empty:
                special_mask = detect_special_dividends(divs)
                div_stmts = []
                for date_idx, amount in divs.items():
                    if dividend_cutoff is not None and date_idx < dividend_cutoff:
                        continue
                    is_sp = bool(special_mask.loc[date_idx]) if date_idx in special_mask.index else False
                    div_stmts.append(stmt(
                        """INSERT OR REPLACE INTO dividend_history
                           (symbol, date, amount, is_special) VALUES (?, ?, ?, ?)""",
                        [symbol, str(date_idx.date()), float(amount), int(is_sp)],
                    ))
                flush_in_batches(div_stmts)

        elapsed = time.monotonic() - started_at
        refresh_mode = "full" if full_refresh else "incremental"
        print(f"  [{symbol}] OK — {len(price_rows)} price points, {len(div_stmts) if not divs.empty else 0} dividends ({refresh_mode}, {elapsed:.1f}s)")
        return True

    except TickerTimeoutError:
        print(f"  [{symbol}] TIMEOUT after {timeout_seconds}s")
        return False
    except Exception as e:
        print(f"  [{symbol}] ERROR: {e}")
        return False


def ingest_collections():
    print("Inserting collections...")
    statements = []
    for slug, symbols in COLLECTIONS.items():
        for symbol in symbols:
            statements.append(stmt(
                "INSERT OR REPLACE INTO collections (slug, symbol) VALUES (?, ?)",
                [slug, symbol],
            ))
    turso_execute(statements)
    print(f"Collections ready: {list(COLLECTIONS.keys())}")


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--tickers", help="Comma-separated ticker list. Defaults to the full DividendVisual universe.")
    parser.add_argument("--limit", type=int, help="Limit the number of tickers processed, useful for smoke tests.")
    parser.add_argument("--ticker-timeout", type=int, default=DEFAULT_TICKER_TIMEOUT_SECONDS)
    parser.add_argument("--max-failures", type=int, default=DEFAULT_MAX_FAILURES)
    parser.add_argument("--fail-on-errors", action="store_true", help="Exit non-zero if any ticker fails.")
    parser.add_argument("--full-refresh", action="store_true", help="Rewrite the full 15-year history instead of recent rows only.")
    return parser.parse_args()


def selected_tickers(args) -> list[str]:
    if args.tickers:
        tickers = [symbol.strip().upper() for symbol in args.tickers.split(",") if symbol.strip()]
    else:
        tickers = TICKERS[:]
    if args.limit:
        tickers = tickers[: args.limit]
    return tickers


def main():
    args = parse_args()
    tickers = selected_tickers(args)
    init_schema()
    print(f"\nIngesting {len(tickers)} tickers...")
    print(
        f"Ticker timeout: {args.ticker_timeout}s | Request timeout: {YFINANCE_REQUEST_TIMEOUT_SECONDS}s | "
        f"Turso timeout: {TURSO_REQUEST_TIMEOUT_SECONDS}s | Pause: {REQUEST_PAUSE_SECONDS}s | "
        f"Max failures: {args.max_failures} | Mode: {'full' if args.full_refresh else 'incremental'}\n"
    )

    ok, failed = 0, []
    started_at = time.monotonic()
    for index, symbol in enumerate(tickers, start=1):
        print(f"[{index}/{len(tickers)}]")
        success = ingest_ticker(symbol, args.ticker_timeout, args.full_refresh)
        if success:
            ok += 1
        else:
            failed.append(symbol)
        time.sleep(REQUEST_PAUSE_SECONDS)  # rate limiting

    ingest_collections()

    elapsed = time.monotonic() - started_at
    print(f"\nDone. {ok}/{len(tickers)} tickers OK in {elapsed / 60:.1f} min.")
    if failed:
        print(f"Failed: {failed}")
    if ok == 0:
        print("No tickers were ingested successfully.", file=sys.stderr)
        sys.exit(1)
    if args.fail_on_errors and failed:
        sys.exit(1)
    if len(failed) > args.max_failures:
        print(f"Failure count {len(failed)} exceeded max failures {args.max_failures}.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
