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

TURSO_URL = os.environ["TURSO_DATABASE_URL"]
TURSO_TOKEN = os.environ["TURSO_AUTH_TOKEN"]
RESEND_KEY = os.environ["RESEND_API_KEY"]
AUDIENCE_ID = os.environ["RESEND_AUDIENCE_ID"]
FROM_EMAIL = os.getenv("NEWSLETTER_FROM_EMAIL", os.getenv("ALERT_FROM_EMAIL", "newsletter@dividendvisual.com"))
SITE_URL = os.getenv("NEXT_PUBLIC_BASE_URL", "https://dividendvisual.com").rstrip("/")
MIN_QUALITY = int(os.getenv("NEWSLETTER_MIN_QUALITY", "60"))

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


def e(value: Any) -> str:
    return html.escape("" if value is None else str(value), quote=True)


def ticker_url(symbol: str) -> str:
    return f"{SITE_URL}/ticker/{symbol}"


def why_now(row: dict) -> str:
    if row.get("why_now_text"):
        return row["why_now_text"]
    signal = row.get("weiss_signal")
    symbol = row["symbol"]
    if signal == "undervalued":
        return f"{symbol} is offering a yield near the high end of its own history. That can be attractive if payout coverage still supports the dividend."
    if signal == "overvalued":
        return f"{symbol} is priced at a low income return versus its own history. The dividend may be fine, but the entry yield is less compelling."
    return f"{symbol} is near fair value. Dividend safety, payout coverage, and peer alternatives matter more than the headline yield this week."


def risk_note(row: dict) -> str:
    payout = row.get("payout_ratio")
    fcf = row.get("fcf_payout")
    cagr = row.get("dividend_cagr_5y")
    if payout is not None and payout > 0.8 and payout <= 2.0:
        return f"Payout ratio is elevated at {pct(payout, 0)}, leaving less room if earnings weaken."
    if fcf is not None and fcf > 0.9 and fcf <= 2.0:
        return f"Free-cash-flow payout is high at {pct(fcf, 0)}, so cash coverage deserves a closer look."
    if cagr is not None and cagr < 0.03:
        return f"Dividend growth has been slow at {pct(cagr, 1)} over five years, which limits income compounding."
    if row.get("quality_score", 0) < 65:
        return "Quality score is below the preferred threshold, so treat the signal as a watchlist candidate rather than a clean setup."
    return "Main risk: a high yield only matters if the dividend remains well covered and the business quality holds."


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
              <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">Setup #{rank}</div>
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


def build_email(current_issue: str, rows: list[dict], watchlist: dict) -> tuple[str, str, str]:
    today = date.today().strftime("%B %d, %Y")
    top = watchlist["top"]
    new = watchlist["new"]
    risky = watchlist["risky"]
    educational_title, educational_body = educational_snippet(current_issue)

    subject = (
        f"{len(new)} new undervalued dividend setup{'s' if len(new) != 1 else ''} this week"
        if new else
        f"{len(watchlist['undervalued'])} undervalued dividend setup{'s' if len(watchlist['undervalued']) != 1 else ''} to review"
    )

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
            <table width="100%" cellpadding="0" cellspacing="8" style="margin:0 0 22px;">
              <tr>
                {stat_box('Stocks tracked', str(len(rows)))}
                {stat_box('Undervalued now', str(len(watchlist['undervalued'])))}
                {stat_box('New this week', str(len(new)))}
              </tr>
            </table>
            <p style="margin:0 0 18px;color:#6b7280;font-size:13px;line-height:1.5;">
              <strong>Sector concentration:</strong> {e(sector_line)}
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
New this week: {len(new)}

Top setups:
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
    previous = get_previous_snapshot(current_issue)
    save_snapshot(current_issue, today, rows)
    watchlist = build_watchlist(rows, previous)
    subject, html_body, text = build_email(current_issue, rows, watchlist)

    print(f"Subject: {subject}")
    print(f"Tracked: {len(rows)} | Undervalued: {len(watchlist['undervalued'])} | New: {len(watchlist['new'])}")

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
