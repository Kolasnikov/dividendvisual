#!/usr/bin/env python3
"""Update dividend category flags and collections without re-ingesting prices."""

import os
import requests
from dotenv import load_dotenv
from dividend_classifications import (
    DIVIDEND_ARISTOCRATS,
    DIVIDEND_KINGS,
    DIVIDEND_STREAK_YEARS,
)

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
    return {"type": "text", "value": str(v)}


def stmt(sql: str, args: list | None = None) -> dict:
    statement = {"sql": sql}
    if args:
        statement["args"] = [_encode_arg(arg) for arg in args]
    return statement


def turso_execute(statements: list[dict]) -> dict:
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
    return data


def flush(statements: list[dict], batch_size: int = 50) -> None:
    for i in range(0, len(statements), batch_size):
        turso_execute(statements[i : i + batch_size])


def main() -> None:
    symbols = sorted(set(DIVIDEND_KINGS) | set(DIVIDEND_ARISTOCRATS) | set(DIVIDEND_STREAK_YEARS))
    statements = [
        stmt(
            "UPDATE companies SET is_dividend_king = 0, is_dividend_aristocrat = 0, is_blue_chip = 0"
        ),
        stmt("DELETE FROM collections WHERE slug IN ('dividend-kings', 'dividend-aristocrats')"),
    ]

    for symbol in symbols:
        is_king = int(symbol in DIVIDEND_KINGS)
        is_aristocrat = int(symbol in DIVIDEND_ARISTOCRATS)
        is_blue_chip = int(is_king or is_aristocrat)
        streak = DIVIDEND_STREAK_YEARS.get(symbol)
        if streak is None:
            statements.append(stmt(
                """UPDATE companies
                   SET is_dividend_king = ?, is_dividend_aristocrat = ?, is_blue_chip = ?
                   WHERE symbol = ?""",
                [is_king, is_aristocrat, is_blue_chip, symbol],
            ))
        else:
            statements.append(stmt(
                """UPDATE companies
                   SET is_dividend_king = ?, is_dividend_aristocrat = ?, is_blue_chip = ?,
                       years_increasing_dividends = MAX(years_increasing_dividends, ?)
                   WHERE symbol = ?""",
                [is_king, is_aristocrat, is_blue_chip, streak, symbol],
            ))

    for symbol in DIVIDEND_KINGS:
        statements.append(stmt(
            "INSERT OR REPLACE INTO collections (slug, symbol) VALUES ('dividend-kings', ?)",
            [symbol],
        ))

    for symbol in DIVIDEND_ARISTOCRATS:
        statements.append(stmt(
            "INSERT OR REPLACE INTO collections (slug, symbol) VALUES ('dividend-aristocrats', ?)",
            [symbol],
        ))

    flush(statements)
    print(f"Updated {len(DIVIDEND_KINGS)} Kings and {len(DIVIDEND_ARISTOCRATS)} Aristocrats.")


if __name__ == "__main__":
    main()
