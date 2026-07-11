#!/usr/bin/env python3
"""Apply small documented data overrides for provider gaps.

Use this for narrow fixes where the market-data provider returns missing data
for an otherwise important ticker. Keep overrides sparse and source-backed.
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv(".env.local")

TURSO_URL = os.environ["TURSO_DATABASE_URL"]
TURSO_TOKEN = os.environ["TURSO_AUTH_TOKEN"]
HTTP_URL = TURSO_URL.replace("libsql://", "https://") + "/v2/pipeline"


def _encode_arg(v) -> dict:
    if v is None:
        return {"type": "null"}
    if isinstance(v, bool):
        return {"type": "integer", "value": str(int(v))}
    if isinstance(v, int):
        return {"type": "integer", "value": str(v)}
    if isinstance(v, float):
        return {"type": "float", "value": v}
    return {"type": "text", "value": str(v)}


def stmt(sql: str, args: list | None = None) -> dict:
    statement = {"sql": sql}
    if args:
        statement["args"] = [_encode_arg(arg) for arg in args]
    return statement


def execute(statements: list[dict]) -> None:
    payload = {"requests": [{"type": "execute", "stmt": s} for s in statements]}
    payload["requests"].append({"type": "close"})
    response = requests.post(
        HTTP_URL,
        headers={
            "Authorization": f"Bearer {TURSO_TOKEN}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()
    for result in data.get("results", []):
        if result.get("type") == "error":
            raise RuntimeError(result.get("error", {}).get("message", "Unknown Turso error"))


def main() -> None:
    # yfinance currently returns empty info/history for LANC. Lancaster Colony's
    # investor dividend history and May 14, 2025 dividend release show a regular
    # quarterly dividend of $0.95, or $3.80 annualized.
    lanc_price = 172.77000427246094
    lanc_annual_dividend = 3.80
    lanc_yield = lanc_annual_dividend / lanc_price

    execute([
        stmt(
            """UPDATE companies
               SET name = ?, sector = ?, industry = ?, years_increasing_dividends = ?,
                   is_dividend_king = 1, is_blue_chip = 1
               WHERE symbol = 'LANC'""",
            ['Lancaster Colony Corporation', 'Consumer Defensive', 'Packaged Foods', 62],
        ),
        stmt(
            """UPDATE computed_metrics
               SET annual_dividend = ?, current_yield = ?, historical_max_yield = ?,
                   historical_min_yield = ?, median_yield = ?, weiss_signal = ?,
                   why_now_text = ?, updated_at = datetime('now')
               WHERE symbol = 'LANC'""",
            [
                lanc_annual_dividend,
                lanc_yield,
                lanc_yield,
                lanc_yield,
                lanc_yield,
                'fair',
                'Lancaster Colony Corporation has a manually verified dividend because the market data provider is missing LANC dividend history. Current annualized dividend is $3.80 based on the regular $0.95 quarterly dividend. Re-run data quality checks after provider data recovers.',
            ],
        ),
    ])

    print('Applied LANC data override.')


if __name__ == '__main__':
    main()
