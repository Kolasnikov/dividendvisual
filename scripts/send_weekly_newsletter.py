#!/usr/bin/env python3
"""
DividendVisual — Weekly Undervalued Dividend Watchlist

Builds and sends an automated weekly newsletter via Resend Broadcasts.

Run:
    python scripts/send_weekly_newsletter.py
    python scripts/send_weekly_newsletter.py --dry-run
    python scripts/send_weekly_newsletter.py --force

Requires env vars:
    TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, RESEND_API_KEY, RESEND_AUDIENCE_ID

Optional:
    NEWSLETTER_FROM_EMAIL (default: newsletter@dividendvisual.com)
    NEWSLETTER_MIN_QUALITY (default: 60)
    NEWSLETTER_MAX_DATA_AGE_DAYS (default: 7)
"""

from __future__ import annotations

import argparse
import html
import os
import sys
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv

load_dotenv(".env.local")


def env_value(name: str, fallback: str | None = None) -> str:
    value = os.getenv(name)
    if value and value.strip():
        return value.strip()
    return fallback or ""


TURSO_URL = os.environ["TURSO_DATABASE_URL"]
TURSO_TOKEN = os.environ["TURSO_AUTH_TOKEN"]
RESEND_KEY = os.environ["RESEND_API_KEY"]
AUDIENCE_ID = os.environ["RESEND_AUDIENCE_ID"]
FROM_EMAIL = env_value("NEWSLETTER_FROM_EMAIL", env_value("ALERT_FROM_EMAIL", "newsletter@dividendvisual.com"))
SITE_URL = env_value("NEXT_PUBLIC_BASE_URL", "https://dividendvisual.com").rstrip("/")
MIN_QUALITY = int(os.getenv("NEWSLETTER_MIN_QUALITY", "60"))
MAX_DATA_AGE_DAYS = int(os.getenv("NEWSLETTER_MAX_DATA_AGE_DAYS", "7"))

HTTP_URL = TURSO_URL.replace("libsql://", "https://") + "/v2/pipeline"


def issue_key(today: date) -> str:
    year, week, _ = today.isocalendar()
    return f"{year}-W{week:02d}"


def encode_arg(value: Any) -> dict:
    if value is None:
        return {"type": "null"}
    if isinstance(value, bool):
        return {"type": "integer", "value": "1" if value else "0"}
    if isinstance(value, int):
        return {"type": "integer", "value": str(value)}
    if isinstance(value, float):
        return {"type": "float", "value": value}
    return {"type": "text", "value": str(value)}


def decode_value(value: dict) -> Any:
    kind = value.get("type")
    raw = value.get("value")
    if kind == "null" or raw is None:
        return None
    if kind == "integer":
        return int(raw)
    if kind == "float":
        return float(raw)
    return raw


def turso_query(sql: str, args: list[Any] | None = None) -> list[dict]:
    stmt: dict[str, Any] = {"sql": sql}
    if args:
        stmt["args"] = [encode_arg(arg) for arg in args]

    payload = {"requests": [{"type": "execute", "stmt": stmt}, {"type": "close"}]}
    response = requests.post(
        HTTP_URL,
        headers={"Authorization": f"Bearer {TURSO_TOKEN}", "Content-Type": "application/json"},
        json=payload,
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()
    result = data["results"][0]
    if result["type"] == "error":
        raise RuntimeError(result["error"]["message"])

    response_result = result["response"].get("result")
    if not response_result:
        return []

    cols = [col["name"] for col in response_result["cols"]]
    rows = response_result["rows"]
    return [dict(zip(cols, [decode_value(value) for value in row])) for row in rows]


def ensure_tables() -> None:
    turso_query("""
        CREATE TABLE IF NOT EXISTS newsletter_signal_snapshots (
          issue_key TEXT NOT NULL,
          snapshot_date TEXT NOT NULL,
          symbol TEXT NOT NULL,
          name TEXT NOT NULL,
          sector TEXT,
          current_price REAL,
          current_yield REAL,
          weiss_signal TEXT,
          quality_score INTEGER,
          payout_ratio REAL,
          fcf_payout REAL,
          dividend_cagr_5y REAL,
          undervalued_price REAL,
          overvalued_price REAL,
          why_now_text TEXT,
          PRIMARY KEY (issue_key, symbol)
        )
    """)
    turso_query("""
        CREATE TABLE IF NOT EXISTS newsletter_issues (
          issue_key TEXT PRIMARY KEY,
          sent_at TEXT NOT NULL,
          subject TEXT NOT NULL,
          broadcast_id TEXT
        )
    """)


def get_current_rows() -> list[dict]:
    return turso_query("""
        SELECT
          c.symbol, c.name, c.sector,
          cm.current_price, cm.current_yield, cm.weiss_signal,
          cm.quality_score, cm.payout_ratio, cm.fcf_payout,
          cm.dividend_cagr_5y, cm.undervalued_price, cm.overvalued_price,
          cm.why_now_text
        FROM companies c
        JOIN computed_metrics cm ON c.symbol = cm.symbol
        WHERE cm.current_yield IS NOT NULL
          AND cm.current_price IS NOT NULL
        ORDER BY cm.quality_score DESC NULLS LAST
    """)


def parse_turso_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    normalized = value.replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(normalized)
    except ValueError:
        try:
            parsed = datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def get_data_freshness() -> dict:
    rows = turso_query("""
        SELECT MAX(updated_at) AS latest_updated_at, COUNT(*) AS metrics_count
        FROM computed_metrics
        WHERE current_yield IS NOT NULL
          AND current_price IS NOT NULL
    """)
    row = rows[0] if rows else {}
    latest = parse_turso_datetime(row.get("latest_updated_at"))
    age_days = None
    is_stale = True
    if latest:
        age_seconds = (datetime.now(timezone.utc) - latest).total_seconds()
        age_days = max(0, age_seconds / 86400)
        is_stale = age_days > MAX_DATA_AGE_DAYS
    return {
        "latest_updated_at": latest,
        "age_days": age_days,
        "is_stale": is_stale,
        "metrics_count": row.get("metrics_count") or 0,
    }


def freshness_label(freshness: dict) -> str:
    latest = freshness.get("latest_updated_at")
    age_days = freshness.get("age_days")
    if not latest or age_days is None:
        return "Data freshness could not be verified."
    if age_days < 1:
        age = "today"
    elif age_days < 2:
        age = "1 day ago"
    else:
        age = f"{int(age_days)} days ago"
    return f"Data refreshed {age} ({latest.date().isoformat()} UTC)."


def get_previous_snapshot(current_issue: str) -> dict[str, dict]:
    previous = turso_query("""
        SELECT issue_key
        FROM newsletter_signal_snapshots
        WHERE issue_key < ?
        GROUP BY issue_key
        ORDER BY issue_key DESC
        LIMIT 1
    """, [current_issue])
    if not previous:
        return {}

    previous_key = previous[0]["issue_key"]
    rows = turso_query("""
        SELECT *
        FROM newsletter_signal_snapshots
        WHERE issue_key = ?
    """, [previous_key])
    return {row["symbol"]: row for row in rows}


def save_snapshot(current_issue: str, today: date, rows: list[dict]) -> None:
    for row in rows:
        turso_query("""
            INSERT OR REPLACE INTO newsletter_signal_snapshots (
              issue_key, snapshot_date, symbol, name, sector,
              current_price, current_yield, weiss_signal, quality_score,
              payout_ratio, fcf_payout, dividend_cagr_5y,
              undervalued_price, overvalued_price, why_now_text
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [
            current_issue,
            today.isoformat(),
            row["symbol"],
            row["name"],
            row.get("sector"),
            row.get("current_price"),
            row.get("current_yield"),
            row.get("weiss_signal"),
            row.get("quality_score"),
            row.get("payout_ratio"),
            row.get("fcf_payout"),
            row.get("dividend_cagr_5y"),
            row.get("undervalued_price"),
            row.get("overvalued_price"),
            row.get("why_now_text"),
        ])


def was_sent(current_issue: str) -> bool:
    rows = turso_query("SELECT issue_key FROM newsletter_issues WHERE issue_key = ?", [current_issue])
    return len(rows) > 0


def mark_sent(current_issue: str, subject: str, broadcast_id: str | None) -> None:
    turso_query("""
        INSERT OR REPLACE INTO newsletter_issues (issue_key, sent_at, subject, broadcast_id)
        VALUES (?, ?, ?, ?)
    """, [current_issue, datetime.now(timezone.utc).isoformat(), subject, broadcast_id])


def pct(value: float | None, digits: int = 2) -> str:
    if value is None:
        return "n/a"
    return f"{value * 100:.{digits}f}%"


def money(value: float | None) -> str:
    if value is None:
        return "n/a"
    return f"${value:.2f}"


def number(value: float | None, digits: int = 1) -> str:
    if value is None:
        return "n/a"
    return f"{value:.{digits}f}"


def e(value: Any) -> str:
    return html.escape("" if value is None else str(value), quote=True)


def ticker_url(symbol: str) -> str:
    return f"{SITE_URL}/ticker/{symbol}"


def why_now(row: dict) -> str:
    symbol = row["symbol"]
    name = row.get("name") or symbol
    sector = row.get("sector") or "dividend"
    current_price = row.get("current_price")
    current_yield = row.get("current_yield")
    undervalued_price = row.get("undervalued_price")
    quality = row.get("quality_score") or 0
    payout = row.get("payout_ratio")
    fcf = row.get("fcf_payout")
    cagr = row.get("dividend_cagr_5y")

    if quality >= 85:
        quality_phrase = "an elite quality score"
    elif quality >= 75:
        quality_phrase = "a strong quality score"
    elif quality >= 65:
        quality_phrase = "a solid quality score"
    else:
        quality_phrase = "a quality score that still needs caution"

    if undervalued_price and current_price:
        margin = (undervalued_price - current_price) / current_price
        if margin > 0.25:
            valuation_phrase = f"is well below the model's undervalued reference level near {money(undervalued_price)}"
        elif margin > 0.05:
            valuation_phrase = (
                f"is about {number(margin * 100, 0)}% below the model's undervalued reference level "
                f"of {money(undervalued_price)}"
            )
        elif margin >= -0.03:
            valuation_phrase = f"is sitting almost exactly on its undervalued reference level near {money(undervalued_price)}"
        else:
            valuation_phrase = f"is still close enough to its undervalued band to deserve a review"
    else:
        valuation_phrase = "is flagged as undervalued by its own dividend-yield history"

    if payout is not None and payout <= 0.55:
        coverage_phrase = f"earnings payout is comfortable at {pct(payout, 0)}"
    elif payout is not None and payout <= 0.8:
        coverage_phrase = f"earnings payout is acceptable but worth tracking at {pct(payout, 0)}"
    elif payout is not None and payout <= 2:
        coverage_phrase = f"earnings payout is elevated at {pct(payout, 0)}"
    elif fcf is not None and fcf <= 0.75:
        coverage_phrase = f"free-cash-flow payout looks manageable at {pct(fcf, 0)}"
    else:
        coverage_phrase = "coverage needs a closer look before treating the yield as clean"

    growth_phrase = ""
    if cagr is not None:
        if cagr >= 0.08:
            growth_phrase = f" Five-year dividend growth is still healthy at {pct(cagr, 1)}, which adds an income-growth angle."
        elif cagr >= 0.03:
            growth_phrase = f" Dividend growth is moderate at {pct(cagr, 1)} over five years, so valuation matters more than acceleration."
        else:
            growth_phrase = f" Dividend growth is slow at {pct(cagr, 1)} over five years, so this is more of a yield/valuation setup than a compounding story."

    return (
        f"{name} stands out because it {valuation_phrase} while carrying {quality_phrase}. "
        f"The current yield is {pct(current_yield)} in {sector}, and {coverage_phrase}."
        f"{growth_phrase}"
    )


def risk_note(row: dict) -> str:
    payout = row.get("payout_ratio")
    fcf = row.get("fcf_payout")
    cagr = row.get("dividend_cagr_5y")
    quality = row.get("quality_score", 0) or 0
    current_yield = row.get("current_yield")
    sector = row.get("sector") or "sector"
    if payout is not None and payout > 0.8 and payout <= 2.0:
        return f"Payout ratio is elevated at {pct(payout, 0)}, leaving less room if earnings weaken."
    if fcf is not None and fcf > 0.9 and fcf <= 2.0:
        return f"Free-cash-flow payout is high at {pct(fcf, 0)}, so cash coverage deserves a closer look."
    if cagr is not None and cagr < 0.03:
        return f"Dividend growth has been slow at {pct(cagr, 1)} over five years, which limits income compounding."
    if quality < 65:
        return "Quality score is below the preferred threshold, so treat the signal as a watchlist candidate rather than a clean setup."
    if current_yield is not None and current_yield < 0.015:
        return "Yield is low in absolute terms, so the setup needs capital appreciation or dividend growth to justify attention."
    if quality >= 80:
        return f"The main risk is paying up for quality too early; compare the setup against other {sector} names before acting."
    return "The signal is attractive, but verify the latest earnings trend and balance-sheet context before treating it as actionable."


def educational_snippet(current_issue: str) -> tuple[str, str]:
    snippets = [
        (
            "How to read this week's watchlist",
            "A Weiss undervalued signal means the stock's current dividend yield is high relative to its own history. That often means price is low relative to income, but it is not automatically a buy signal. Quality score, payout ratio, and free-cash-flow coverage decide whether the high yield looks healthy or stressed.",
        ),
        (
            "Yield trap check",
            "The easiest dividend mistake is treating every high yield as cheap. If a yield is high because the payout is at risk, the apparent bargain can disappear after a dividend cut. This is why every DividendVisual watchlist idea includes quality and coverage context.",
        ),
        (
            "Why peer comparison matters",
            "Dividend stocks should be compared inside their sector. A 4% utility yield, a 4% REIT yield, and a 4% pharma yield can mean different things because the business risks and cash-flow profiles are different.",
        ),
    ]
    week_num = int(current_issue.split("W")[-1])
    return snippets[week_num % len(snippets)]


def build_watchlist(rows: list[dict], previous: dict[str, dict]) -> dict:
    undervalued = [
        row for row in rows
        if row.get("weiss_signal") == "undervalued" and (row.get("quality_score") or 0) >= MIN_QUALITY
    ]
    undervalued.sort(key=lambda row: (row.get("quality_score") or 0, row.get("current_yield") or 0), reverse=True)

    new = [
        row for row in undervalued
        if previous.get(row["symbol"], {}).get("weiss_signal") != "undervalued"
    ]
    continuing = [
        row for row in undervalued
        if previous.get(row["symbol"], {}).get("weiss_signal") == "undervalued"
    ]
    current_symbols = {row["symbol"] for row in undervalued}
    dropped = [
        row for row in previous.values()
        if row.get("weiss_signal") == "undervalued" and row.get("symbol") not in current_symbols
    ]

    risky = [
        row for row in rows
        if (row.get("current_yield") or 0) >= 0.04
        and (
            (row.get("quality_score") or 0) < MIN_QUALITY
            or ((row.get("payout_ratio") or 0) > 0.85 and (row.get("payout_ratio") or 0) <= 2.0)
            or ((row.get("fcf_payout") or 0) > 0.95 and (row.get("fcf_payout") or 0) <= 2.0)
        )
    ]
    risky.sort(key=lambda row: row.get("current_yield") or 0, reverse=True)

    sectors: dict[str, int] = {}
    for row in undervalued:
        sector = row.get("sector") or "Other"
        sectors[sector] = sectors.get(sector, 0) + 1

    return {
        "undervalued": undervalued,
        "new": new,
        "continuing": continuing,
        "dropped": dropped,
        "has_previous": bool(previous),
        "top": undervalued[:5],
        "risky": risky[:1],
        "sectors": sectors,
    }


def stat_box(label: str, value: str) -> str:
    return f"""
      <td style="padding:10px;border:1px solid #e5e7eb;border-radius:8px;background:#fafafa;">
        <div style="font-size:20px;font-weight:700;color:#111827;">{e(value)}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:2px;">{e(label)}</div>
      </td>
    """


def setup_card(row: dict, rank: int) -> str:
    symbol = row["symbol"]
    return f"""
    <tr>
      <td style="padding:18px 0;border-bottom:1px solid #e5e7eb;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;">
              <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">Top setup #{rank}</div>
              <a href="{ticker_url(symbol)}" style="font-family:monospace;font-size:20px;font-weight:700;color:#4f46e5;text-decoration:none;">{e(symbol)}</a>
              <span style="font-size:13px;color:#111827;font-weight:600;"> {e(row['name'])}</span>
              <div style="font-size:12px;color:#6b7280;margin-top:3px;">{e(row.get('sector') or 'Dividend stock')}</div>
            </td>
            <td style="vertical-align:top;text-align:right;white-space:nowrap;">
              <div style="font-size:18px;font-weight:700;color:#111827;">{pct(row.get('current_yield'))}</div>
              <div style="font-size:12px;color:#6b7280;">yield at {money(row.get('current_price'))}</div>
              <div style="font-size:12px;color:#6b7280;margin-top:3px;">Quality <strong>{row.get('quality_score', 'n/a')}/100</strong></div>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding-top:12px;">
              <p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.55;">{e(why_now(row))}</p>
              <p style="margin:0 0 12px;color:#6b7280;font-size:13px;line-height:1.5;"><strong>Risk note:</strong> {e(risk_note(row))}</p>
              <a href="{ticker_url(symbol)}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;padding:8px 14px;font-size:13px;font-weight:600;">View Weiss chart →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    """


def symbol_list(rows: list[dict], limit: int = 8) -> str:
    symbols = [row["symbol"] for row in rows[:limit]]
    if len(rows) > limit:
        symbols.append(f"+{len(rows) - limit} more")
    return ", ".join(symbols) if symbols else "None"


def what_changed_html(watchlist: dict) -> str:
    if not watchlist["has_previous"]:
        return f"""
          <h2 style="margin:26px 0 8px;font-size:18px;color:#111827;">What changed</h2>
          <p style="margin:0 0 18px;color:#374151;font-size:14px;line-height:1.6;">
            This first issue creates the baseline. Future editions will separate fresh entrants,
            names that remain attractive, and stocks that left the undervalued zone.
          </p>
        """

    return f"""
      <h2 style="margin:26px 0 8px;font-size:18px;color:#111827;">What changed</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;">
            <div style="font-size:12px;color:#6b7280;font-weight:700;text-transform:uppercase;">New entrants</div>
            <div style="font-size:14px;color:#111827;margin-top:4px;">{e(symbol_list(watchlist['new']))}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e5e7eb;">
            <div style="font-size:12px;color:#6b7280;font-weight:700;text-transform:uppercase;">Still undervalued</div>
            <div style="font-size:14px;color:#111827;margin-top:4px;">{e(symbol_list(watchlist['continuing']))}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:12px;">
            <div style="font-size:12px;color:#6b7280;font-weight:700;text-transform:uppercase;">Left the zone</div>
            <div style="font-size:14px;color:#111827;margin-top:4px;">{e(symbol_list(watchlist['dropped']))}</div>
          </td>
        </tr>
      </table>
    """


def what_changed_text(watchlist: dict) -> str:
    if not watchlist["has_previous"]:
        return (
            "What changed:\n"
            "This first issue creates the baseline. Future editions will separate fresh entrants, "
            "still-undervalued names, and stocks that left the undervalued zone.\n"
        )
    return (
        "What changed:\n"
        f"New entrants: {symbol_list(watchlist['new'])}\n"
        f"Still undervalued: {symbol_list(watchlist['continuing'])}\n"
        f"Left the zone: {symbol_list(watchlist['dropped'])}\n"
    )


def build_email(current_issue: str, rows: list[dict], watchlist: dict, freshness: dict) -> tuple[str, str, str]:
    today = date.today().strftime("%B %d, %Y")
    top = watchlist["top"]
    new = watchlist["new"]
    risky = watchlist["risky"]
    educational_title, educational_body = educational_snippet(current_issue)

    if freshness.get("is_stale"):
        subject = f"{len(watchlist['undervalued'])} dividend setups to review"
    else:
        subject = f"{len(watchlist['undervalued'])} undervalued dividend setup{'s' if len(watchlist['undervalued']) != 1 else ''} on this week's watchlist"

    cards = "".join(setup_card(row, index + 1) for index, row in enumerate(top))
    if not cards:
        cards = """
        <tr><td style="padding:18px 0;border-bottom:1px solid #e5e7eb;">
          <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">
            No high-quality dividend stocks crossed DividendVisual's undervalued threshold this week.
            That is useful information: patience is part of the strategy.
          </p>
        </td></tr>
        """

    trap_html = ""
    if risky:
        row = risky[0]
        trap_html = f"""
          <h2 style="margin:28px 0 8px;font-size:18px;color:#111827;">Yield trap watch</h2>
          <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6;">
            <a href="{ticker_url(row['symbol'])}" style="color:#4f46e5;font-weight:700;text-decoration:none;">{e(row['symbol'])}</a>
            yields {pct(row.get('current_yield'))}, but the setup needs extra caution.
            {e(risk_note(row))}
          </p>
        """

    sector_line = ", ".join(
        f"{sector}: {count}" for sector, count in sorted(watchlist["sectors"].items(), key=lambda item: item[1], reverse=True)[:4]
    ) or "No undervalued sectors this week"
    freshness_text = freshness_label(freshness)
    changed_html = what_changed_html(watchlist)
    change_stat_label = "New this week" if watchlist["has_previous"] else "Baseline names"
    stale_html = ""
    if freshness.get("is_stale"):
        stale_html = f"""
            <p style="margin:0 0 18px;color:#92400e;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px 12px;font-size:13px;line-height:1.5;">
              <strong>Data freshness note:</strong> {e(freshness_text)}
              The watchlist is still useful for research, but verify live prices before making any decision.
            </p>
        """

    preheader = "A data-driven dividend watchlist built from Weiss valuation, quality score, and payout safety."
    html_body = f"""<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">{e(preheader)}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:28px 14px;">
    <tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#fff;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="background:#09090b;padding:24px 28px;">
            <a href="{SITE_URL}" style="color:#fff;text-decoration:none;font-size:19px;font-weight:800;">Dividend<span style="color:#6366f1;">Visual</span></a>
            <div style="color:#a1a1aa;font-size:12px;margin-top:5px;">Weekly Undervalued Dividend Watchlist · {today}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <h1 style="margin:0 0 10px;font-size:24px;line-height:1.25;color:#111827;">This week's dividend watchlist</h1>
            <p style="margin:0 0 22px;color:#374151;font-size:15px;line-height:1.6;">
              Dividend stocks entering or remaining in historically attractive yield territory,
              filtered through quality score, payout coverage, and risk context.
            </p>
            {stale_html}
            <table width="100%" cellpadding="0" cellspacing="8" style="margin:0 0 22px;">
              <tr>
                {stat_box('Stocks tracked', str(len(rows)))}
                {stat_box('Undervalued now', str(len(watchlist['undervalued'])))}
                {stat_box(change_stat_label, str(len(new)))}
              </tr>
            </table>
            <p style="margin:0 0 18px;color:#6b7280;font-size:13px;line-height:1.5;">
              <strong>Sector concentration:</strong> {e(sector_line)}
              <br><strong>Data freshness:</strong> {e(freshness_text)}
            </p>
            {changed_html}
            <h2 style="margin:26px 0 4px;font-size:18px;color:#111827;">Top 5 setups to review</h2>
            <p style="margin:0 0 4px;color:#6b7280;font-size:13px;line-height:1.5;">
              Ranked by quality first, then by current yield. Open the screener to review the full list of {len(watchlist['undervalued'])}.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              {cards}
            </table>
            {trap_html}
            <h2 style="margin:28px 0 8px;font-size:18px;color:#111827;">{e(educational_title)}</h2>
            <p style="margin:0 0 22px;color:#374151;font-size:14px;line-height:1.6;">{e(educational_body)}</p>
            <a href="{SITE_URL}/dividend-screener" style="display:inline-block;background:#09090b;color:#fff;text-decoration:none;border-radius:8px;padding:12px 18px;font-size:14px;font-weight:700;">Open the full screener →</a>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:18px 28px;">
            <p style="margin:0;color:#6b7280;font-size:11px;line-height:1.6;">
              Educational research only. Not financial, investment, or tax advice.
              <a href="{SITE_URL}/methodology" style="color:#4f46e5;">Methodology</a>
              · <a href="{SITE_URL}/newsletter" style="color:#4f46e5;">Newsletter</a>
              · <a href="{{{{RESEND_UNSUBSCRIBE_URL}}}}" style="color:#4f46e5;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""

    text = f"""DividendVisual Weekly Watchlist — {today}

Stocks tracked: {len(rows)}
Undervalued now: {len(watchlist['undervalued'])}
{change_stat_label}: {len(new)}
Data freshness: {freshness_text}

{"Data freshness note: verify live prices before making any decision." if freshness.get("is_stale") else ""}

{what_changed_text(watchlist)}

Top 5 setups to review:
""" + "\n".join(
        f"- {row['symbol']} ({row['name']}): {pct(row.get('current_yield'))} yield, quality {row.get('quality_score')}/100. {why_now(row)} {ticker_url(row['symbol'])}"
        for row in top
    ) + f"""

{educational_title}
{educational_body}

Open the screener: {SITE_URL}/dividend-screener
Unsubscribe: {{{{RESEND_UNSUBSCRIBE_URL}}}}
"""
    return subject, html_body, text


def resend_request(method: str, path: str, body: dict | None = None) -> dict:
    response = requests.request(
        method,
        f"https://api.resend.com{path}",
        headers={"Authorization": f"Bearer {RESEND_KEY}", "Content-Type": "application/json"},
        json=body,
        timeout=30,
    )
    if response.status_code >= 400:
        print(f"Resend API error {response.status_code}: {response.text}", file=sys.stderr)
    response.raise_for_status()
    return response.json()


def send_broadcast(current_issue: str, subject: str, html_body: str, text: str) -> str:
    broadcast = resend_request("POST", "/broadcasts", {
        "audience_id": AUDIENCE_ID,
        "from": f"DividendVisual <{FROM_EMAIL}>",
        "name": f"Weekly Watchlist {current_issue}",
        "subject": subject,
        "html": html_body,
        "text": text,
    })
    broadcast_id = broadcast["id"]
    resend_request("POST", f"/broadcasts/{broadcast_id}/send", {})
    return broadcast_id


def write_preview(subject: str, html_body: str, text: str, current_issue: str) -> None:
    preview_dir = Path("tmp/newsletter-preview")
    preview_dir.mkdir(parents=True, exist_ok=True)
    (preview_dir / f"{current_issue}.html").write_text(html_body, encoding="utf-8")
    (preview_dir / f"{current_issue}.txt").write_text(f"Subject: {subject}\n\n{text}", encoding="utf-8")
    print(f"Preview written to {preview_dir}/{current_issue}.html")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Generate the issue and preview files without sending.")
    parser.add_argument("--force", action="store_true", help="Send even if this ISO week has already been sent.")
    args = parser.parse_args()

    today = date.today()
    current_issue = issue_key(today)
    print(f"Building weekly newsletter issue {current_issue}")

    ensure_tables()
    if was_sent(current_issue) and not args.force and not args.dry_run:
        print(f"Issue {current_issue} has already been sent. Use --force to resend.")
        return

    rows = get_current_rows()
    freshness = get_data_freshness()
    print(f"Data freshness: {freshness_label(freshness)}")
    if freshness.get("is_stale"):
        print(
            f"WARNING: computed_metrics data is older than {MAX_DATA_AGE_DAYS} days. "
            "Newsletter will still send using the latest available data."
        )
    previous = get_previous_snapshot(current_issue)
    save_snapshot(current_issue, today, rows)
    watchlist = build_watchlist(rows, previous)
    subject, html_body, text = build_email(current_issue, rows, watchlist, freshness)

    print(f"Subject: {subject}")
    change_label = "New" if watchlist["has_previous"] else "Baseline"
    print(f"Tracked: {len(rows)} | Undervalued: {len(watchlist['undervalued'])} | {change_label}: {len(watchlist['new'])}")

    if args.dry_run:
        write_preview(subject, html_body, text, current_issue)
        return

    broadcast_id = send_broadcast(current_issue, subject, html_body, text)
    mark_sent(current_issue, subject, broadcast_id)
    print(f"Broadcast sent. ID: {broadcast_id}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Newsletter send failed: {exc}", file=sys.stderr)
        raise
