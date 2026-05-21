#!/usr/bin/env python3
"""
DividendVisual - Automated Welcome Sequence

Sends onboarding emails to new newsletter subscribers through Resend transactional email.

Run:
    python scripts/send_welcome_sequence.py
    python scripts/send_welcome_sequence.py --dry-run
    python scripts/send_welcome_sequence.py --limit 25

Requires env vars:
    TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, RESEND_API_KEY

Optional:
    NEWSLETTER_FROM_EMAIL (default: newsletter@dividendvisual.com)
    NEXT_PUBLIC_BASE_URL (default: https://dividendvisual.com)
    NEWSLETTER_UNSUBSCRIBE_SECRET (default: RESEND_API_KEY)
"""

from __future__ import annotations

import argparse
import hashlib
import hmac
import html
import os
import sys
from datetime import datetime, timezone
from typing import Any
from urllib.parse import quote

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
FROM_EMAIL = env_value("NEWSLETTER_FROM_EMAIL", env_value("ALERT_FROM_EMAIL", "newsletter@dividendvisual.com"))
SITE_URL = env_value("NEXT_PUBLIC_BASE_URL", "https://dividendvisual.com").rstrip("/")
UNSUBSCRIBE_SECRET = env_value("NEWSLETTER_UNSUBSCRIBE_SECRET", RESEND_KEY)

HTTP_URL = TURSO_URL.replace("libsql://", "https://") + "/v2/pipeline"


WELCOME_STEPS = [
    {
        "delay_days": 0,
        "subject": "Welcome to DividendVisual: start with the signal, then check the risk",
        "preheader": "A practical guide to reading DividendVisual's dividend signals.",
        "title": "Start with the signal, then check the risk",
        "intro": (
            "DividendVisual is built for one job: helping you find dividend stocks whose current yield "
            "looks attractive versus their own history, without ignoring quality and payout risk."
        ),
        "sections": [
            (
                "1. Weiss valuation signal",
                "A stock is marked undervalued when its current dividend yield is high versus its own historical yield range. "
                "That usually means the market is offering more income per dollar invested than usual.",
            ),
            (
                "2. Quality score",
                "The quality score keeps the signal honest. A high yield is only interesting when dividend history, payout coverage, "
                "growth, and balance-sheet context support it.",
            ),
            (
                "3. Payout safety",
                "Before treating a high yield as attractive, check whether earnings and free cash flow can actually fund the dividend.",
            ),
        ],
        "cta_label": "Open current opportunities",
        "cta_url": "/undervalued-dividend-stocks",
    },
    {
        "delay_days": 2,
        "subject": "The dividend trap checklist",
        "preheader": "A high yield can be an opportunity or a warning sign. Here is how to separate them.",
        "title": "The dividend trap checklist",
        "intro": (
            "Most dividend mistakes start the same way: the yield looks irresistible, but the market is already pricing in a future cut. "
            "Use this checklist before trusting any high-yield setup."
        ),
        "sections": [
            (
                "Coverage first",
                "If payout ratio or free-cash-flow payout is stretched, the yield may be high because the dividend is under pressure.",
            ),
            (
                "Growth matters",
                "A dividend that has barely grown for years can lose purchasing power, even if the starting yield looks fine.",
            ),
            (
                "Compare inside the sector",
                "A 4% yield means different things for a utility, a REIT, a bank, and a healthcare company. Peer context keeps the signal grounded.",
            ),
        ],
        "cta_label": "Use the dividend screener",
        "cta_url": "/dividend-screener",
    },
    {
        "delay_days": 3,
        "subject": "A simple weekly workflow for dividend research",
        "preheader": "Turn DividendVisual into a repeatable dividend watchlist routine.",
        "title": "A simple weekly workflow for dividend research",
        "intro": (
            "You do not need to watch every ticker every day. A good dividend process is repeatable: screen, shortlist, compare, then wait for price."
        ),
        "sections": [
            (
                "Build the first shortlist",
                "Start with undervalued or fair-value stocks above your minimum quality threshold. Ignore weak setups even when the yield is tempting.",
            ),
            (
                "Compare two candidates",
                "When two stocks look similar, compare yield history, payout safety, dividend growth, and quality score side by side.",
            ),
            (
                "Let alerts do the boring work",
                "Keep a watchlist and let the weekly email surface fresh changes. The edge is consistency, not frantic checking.",
            ),
        ],
        "cta_label": "Review the methodology",
        "cta_url": "/methodology",
    },
]


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
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          email TEXT PRIMARY KEY,
          source TEXT NOT NULL,
          symbol TEXT,
          path TEXT,
          referer TEXT,
          status TEXT NOT NULL DEFAULT 'active',
          welcome_step INTEGER NOT NULL DEFAULT 0,
          last_welcome_sent_at TEXT,
          subscribed_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
    """)
    turso_query("""
        CREATE TABLE IF NOT EXISTS newsletter_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL,
          event_type TEXT NOT NULL,
          metadata TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    """)


def due_subscribers(limit: int) -> list[dict]:
    return turso_query("""
        SELECT email, source, symbol, path, welcome_step, subscribed_at, last_welcome_sent_at
        FROM newsletter_subscribers
        WHERE status = 'active'
          AND welcome_step < ?
          AND (
            welcome_step = 0
            OR (welcome_step = 1 AND last_welcome_sent_at IS NOT NULL AND datetime(last_welcome_sent_at) <= datetime('now', '-2 days'))
            OR (welcome_step = 2 AND last_welcome_sent_at IS NOT NULL AND datetime(last_welcome_sent_at) <= datetime('now', '-3 days'))
          )
        ORDER BY subscribed_at ASC
        LIMIT ?
    """, [len(WELCOME_STEPS), limit])


def escape(value: Any) -> str:
    return html.escape("" if value is None else str(value), quote=True)


def unsubscribe_token(email: str) -> str:
    return hmac.new(UNSUBSCRIBE_SECRET.encode("utf-8"), email.encode("utf-8"), hashlib.sha256).hexdigest()


def unsubscribe_url(email: str) -> str:
    return f"{SITE_URL}/api/newsletter/unsubscribe?email={quote(email)}&token={unsubscribe_token(email)}"


def source_note(subscriber: dict) -> str:
    source = subscriber.get("source") or "DividendVisual"
    symbol = subscriber.get("symbol")
    if symbol:
        return f"You joined from {source} while viewing {symbol}."
    return f"You joined from {source}."


def build_email(subscriber: dict, step_index: int) -> tuple[str, str, str]:
    step = WELCOME_STEPS[step_index]
    cta_url = f"{SITE_URL}{step['cta_url']}"
    unsub = unsubscribe_url(subscriber["email"])

    sections_html = "".join(
        f"""
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #e5e7eb;">
            <h2 style="margin:0 0 6px;font-size:15px;line-height:1.35;color:#111827;">{escape(title)}</h2>
            <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.6;">{escape(body)}</p>
          </td>
        </tr>
        """
        for title, body in step["sections"]
    )

    html_body = f"""<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">{escape(step['preheader'])}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:28px 14px;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="width:100%;max-width:620px;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="background:#09090b;padding:24px 28px;">
            <a href="{SITE_URL}" style="color:#ffffff;text-decoration:none;font-size:19px;font-weight:800;">Dividend<span style="color:#6366f1;">Visual</span></a>
            <div style="color:#a1a1aa;font-size:12px;margin-top:5px;">Dividend research onboarding</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:#111827;">{escape(step['title'])}</h1>
            <p style="margin:0 0 18px;color:#374151;font-size:15px;line-height:1.65;">{escape(step['intro'])}</p>
            <table width="100%" cellpadding="0" cellspacing="0">{sections_html}</table>
            <p style="margin:22px 0;color:#6b7280;font-size:13px;line-height:1.55;">{escape(source_note(subscriber))}</p>
            <a href="{cta_url}" style="display:inline-block;background:#09090b;color:#ffffff;text-decoration:none;border-radius:8px;padding:12px 18px;font-size:14px;font-weight:700;">{escape(step['cta_label'])}</a>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:18px 28px;">
            <p style="margin:0;color:#6b7280;font-size:11px;line-height:1.6;">
              Educational research only. Not financial, investment, or tax advice.
              <a href="{SITE_URL}/methodology" style="color:#4f46e5;">Methodology</a>
              &middot; <a href="{unsub}" style="color:#4f46e5;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""

    text = f"""{step['title']}

{step['intro']}

""" + "\n\n".join(f"{title}\n{body}" for title, body in step["sections"]) + f"""

{source_note(subscriber)}

{step['cta_label']}: {cta_url}
Unsubscribe: {unsub}
"""
    return step["subject"], html_body, text


def resend_email(email: str, subject: str, html_body: str, text: str, step_index: int) -> str:
    idempotency_digest = hashlib.sha256(f"{email}:{step_index}".encode("utf-8")).hexdigest()
    response = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {RESEND_KEY}",
            "Content-Type": "application/json",
            "Idempotency-Key": f"welcome-{idempotency_digest}",
        },
        json={
            "from": f"DividendVisual <{FROM_EMAIL}>",
            "to": [email],
            "subject": subject,
            "html": html_body,
            "text": text,
            "tags": [
                {"name": "sequence", "value": "welcome"},
                {"name": "step", "value": str(step_index + 1)},
            ],
        },
        timeout=30,
    )
    if response.status_code >= 400:
        print(f"Resend API error {response.status_code}: {response.text}", file=sys.stderr)
    response.raise_for_status()
    return response.json()["id"]


def mark_sent(email: str, step_index: int, resend_id: str) -> None:
    next_step = step_index + 1
    sent_at = datetime.now(timezone.utc).isoformat()
    turso_query("""
        UPDATE newsletter_subscribers
        SET welcome_step = ?, last_welcome_sent_at = ?, updated_at = datetime('now')
        WHERE email = ?
    """, [next_step, sent_at, email])
    turso_query("""
        INSERT INTO newsletter_events (email, event_type, metadata)
        VALUES (?, 'welcome_email_sent', ?)
    """, [email, f'{{"step":{next_step},"resend_id":"{resend_id}"}}'])


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Print due subscribers without sending or updating state.")
    parser.add_argument("--limit", type=int, default=50, help="Maximum welcome emails to send in this run.")
    args = parser.parse_args()

    ensure_tables()
    subscribers = due_subscribers(args.limit)
    if not subscribers:
        print("No welcome emails due.")
        return

    print(f"{len(subscribers)} welcome email(s) due.")
    for subscriber in subscribers:
        email = subscriber["email"]
        step_index = int(subscriber.get("welcome_step") or 0)
        subject, html_body, text = build_email(subscriber, step_index)
        print(f"- step {step_index + 1}: {email} - {subject}")
        if args.dry_run:
            continue

        resend_id = resend_email(email, subject, html_body, text, step_index)
        mark_sent(email, step_index, resend_id)
        print(f"  sent {resend_id}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Welcome sequence failed: {exc}", file=sys.stderr)
        sys.exit(1)
