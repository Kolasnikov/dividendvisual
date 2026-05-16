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
import requests
import base64
import pandas as pd
import yfinance as yf
from dotenv import load_dotenv

load_dotenv(".env.local")

TURSO_URL = os.environ["TURSO_DATABASE_URL"]
TURSO_TOKEN = os.environ["TURSO_AUTH_TOKEN"]

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
    "dividend-kings": [
        # Original Kings
        "KO", "PEP", "MMM", "GPC", "MO", "BEN", "FRT", "CLX",
        "KMB", "CL", "HRL", "BDX", "EMR", "ITW", "AFL",
        # New Kings
        "AWR", "DOV", "CINF", "NDSN", "LANC", "GWW", "PPG", "RPM", "MSA", "NUE", "CBSH",
    ],
    "dividend-aristocrats": [
        # Original Aristocrats
        "JNJ", "PG", "MCD", "WMT", "HD", "ABT", "MDT", "XOM",
        "CVX", "T", "SO", "DUK", "NEE", "ABBV", "PM", "SYY", "LOW",
        "MKC", "CTAS", "GD", "CAT", "TROW", "NNN", "ECL", "ATO", "SYK", "CB",
        # New Aristocrats (25+ years, not yet Kings)
        "SHW", "ED", "ADP", "SPGI", "CHD", "ROP", "AOS", "EXPD",
        "PAYX", "BRO", "MMC", "LMT", "NOC", "ESS", "TJX", "FAST",
    ],
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
}


def turso_execute(statements: list[dict]) -> dict:
    """Execute a batch of SQL statements against Turso HTTP API."""
    payload = {"requests": [{"type": "execute", "stmt": s} for s in statements]}
    payload["requests"].append({"type": "close"})

    resp = requests.post(
        HTTP_URL,
        headers={
            "Authorization": f"Bearer {TURSO_TOKEN}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


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
    return {
        "name": info.get("longName") or info.get("shortName") or "",
        "sector": info.get("sector"),
        "industry": info.get("industry"),
        "payout_ratio": info.get("payoutRatio"),
        "trailing_eps": info.get("trailingEps"),
        "free_cashflow": info.get("freeCashflow"),
        "dividends_per_share": info.get("dividendRate"),
    }


def ingest_ticker(symbol: str) -> bool:
    print(f"  [{symbol}] Downloading...")
    try:
        tk = yf.Ticker(symbol)

        # --- Price history + dividends (10 years, weekly) ---
        # Using history() for both so dividends are period-limited and split-adjusted consistently
        hist = tk.history(period="15y", interval="1wk", auto_adjust=True)
        if hist.empty:
            print(f"  [{symbol}] No price data, skipping.")
            return False
        prices = hist[["Close"]].dropna()
        prices.index = pd.to_datetime(prices.index).tz_localize(None)

        # Dividends: use daily history to get all dividend events in the 15Y window
        hist_daily = tk.history(period="15y", interval="1d", auto_adjust=True)
        divs_raw = hist_daily["Dividends"] if "Dividends" in hist_daily.columns else pd.Series(dtype=float)
        divs = divs_raw[divs_raw > 0].copy()
        if not divs.empty:
            divs.index = pd.to_datetime(divs.index).tz_localize(None)
            divs = divs.sort_index()

        # --- Info ---
        info = get_ticker_info(tk)
        name = info["name"] or symbol

        # --- Determine badges ---
        is_king = int(symbol in COLLECTIONS["dividend-kings"])
        is_aristocrat = int(symbol in COLLECTIONS["dividend-aristocrats"])
        is_blue_chip = int(is_king or is_aristocrat)

        # --- Years increasing dividends (consecutive annual increases, completed years only) ---
        years_increasing = 0
        if not divs.empty:
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

        def flush_in_batches(stmts: list, batch_size: int = 40):
            for i in range(0, len(stmts), batch_size):
                turso_execute(stmts[i : i + batch_size])

        # Upsert company (single statement, flush immediately)
        turso_execute([stmt(
            """INSERT OR REPLACE INTO companies
               (symbol, name, sector, industry,
                is_dividend_king, is_dividend_aristocrat, is_blue_chip,
                years_increasing_dividends, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))""",
            [symbol, name, info["sector"], info["industry"],
             is_king, is_aristocrat, is_blue_chip, years_increasing],
        )])

        # Price history — flush in real batches of 40
        price_rows = [
            (symbol, str(d.date()), float(c))
            for d, c in zip(prices.index, prices["Close"])
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
                is_sp = bool(special_mask.loc[date_idx]) if date_idx in special_mask.index else False
                div_stmts.append(stmt(
                    """INSERT OR REPLACE INTO dividend_history
                       (symbol, date, amount, is_special) VALUES (?, ?, ?, ?)""",
                    [symbol, str(date_idx.date()), float(amount), int(is_sp)],
                ))
            flush_in_batches(div_stmts)

        print(f"  [{symbol}] OK — {len(price_rows)} price points, {len(divs)} dividends")
        return True

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


def main():
    init_schema()
    print(f"\nIngesting {len(TICKERS)} tickers...\n")

    ok, failed = 0, []
    for symbol in TICKERS:
        success = ingest_ticker(symbol)
        if success:
            ok += 1
        else:
            failed.append(symbol)
        time.sleep(1)  # rate limiting

    ingest_collections()

    print(f"\nDone. {ok}/{len(TICKERS)} tickers OK.")
    if failed:
        print(f"Failed: {failed}")


if __name__ == "__main__":
    main()
