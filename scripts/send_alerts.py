#!/usr/bin/env python3
"""
DividendVisual — Signal Alert Script
Detects tickers that just transitioned to 'undervalued' (quality >= 60)
and sends a digest email to all subscribers via Resend Broadcasts.

Run AFTER compute_bands.py:
    python scripts/send_alerts.py

Requires env vars: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, RESEND_API_KEY, RESEND_AUDIENCE_ID
Optional:          ALERT_FROM_EMAIL (default: alerts@dividendvisual.com)
"""

import os
import sys
import json
import requests
from datetime import date
from dotenv import load_dotenv

load_dotenv(".env.local")

TURSO_URL   = os.environ["TURSO_DATABASE_URL"]
TURSO_TOKEN = os.environ["TURSO_AUTH_TOKEN"]
RESEND_KEY  = os.environ["RESEND_API_KEY"]
AUDIENCE_ID = os.environ["RESEND_AUDIENCE_ID"]
FROM_EMAIL  = os.getenv("ALERT_FROM_EMAIL", "alerts@dividendvisual.com")
SITE_URL    = "https://dividendvisual.com"

HTTP_URL = TURSO_URL.replace("libsql://", "https://") + "/v2/pipeline"

MIN_QUALITY = 60  # only alert on quality >= 60


# ─── Turso ────────────────────────────────────────────────────────────────────

def turso_query(sql: str, args: list | None = None) -> list[dict]:
    def encode(v):
        if v is None: return {"type": "null"}
        if isinstance(v, int): return {"type": "integer", "value": str(v)}
        if isinstance(v, float): return {"type": "float", "value": v}
        return {"type": "text", "value": str(v)}

    stmt = {"sql": sql}
    if args:
        stmt["args"] = [encode(a) for a in args]

    payload = {"requests": [{"type": "execute", "stmt": stmt}, {"type": "close"}]}
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

    def decode(v):
        t, val = v.get("type"), v.get("value")
        if t == "null" or val is None: return None
        if t == "integer": return int(val)
        if t == "float": return float(val)
        return val

    return [dict(zip(cols, [decode(v) for v in row])) for row in rows]


# ─── Resend Broadcasts ────────────────────────────────────────────────────────

def resend_request(method: str, path: str, body: dict | None = None) -> dict:
    resp = requests.request(
        method,
        f"https://api.resend.com{path}",
        headers={
            "Authorization": f"Bearer {RESEND_KEY}",
            "Content-Type": "application/json",
        },
        json=body,
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


def send_broadcast(subject: str, html: str) -> str:
    broadcast = resend_request("POST", "/broadcasts", {
        "audience_id": AUDIENCE_ID,
        "from": f"DividendVisual <{FROM_EMAIL}>",
        "name": f"Signal Alert {date.today().isoformat()}",
        "subject": subject,
        "html": html,
    })
    broadcast_id = broadcast["id"]
    resend_request("POST", f"/broadcasts/{broadcast_id}/send", {})
    return broadcast_id


# ─── Email HTML ───────────────────────────────────────────────────────────────

def signal_badge(signal: str) -> str:
    colors = {
        "undervalued": ("22c55e", "Undervalued"),
        "fair":        ("f59e0b", "Fair Value"),
        "overvalued":  ("ef4444", "Overvalued"),
    }
    color, label = colors.get(signal, ("71717a", signal.title()))
    return (
        f'<span style="display:inline-block;background:#{color}20;color:#{color};'
        f'border:1px solid #{color}40;border-radius:4px;padding:2px 8px;'
        f'font-size:11px;font-weight:600;">{label}</span>'
    )


def ticker_card(t: dict) -> str:
    yield_pct  = f"{t['current_yield']*100:.2f}%" if t.get("current_yield") else "—"
    price      = f"${t['current_price']:.2f}"     if t.get("current_price")  else "—"
    quality    = t.get("quality_score", "—")
    cagr       = f"{t['dividend_cagr_5y']*100:.1f}% CAGR" if t.get("dividend_cagr_5y") else ""
    ticker_url = f"{SITE_URL}/analysis/{t['symbol'].lower()}"

    return f"""
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #f0f0f0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;">
              <a href="{ticker_url}" style="text-decoration:none;">
                <span style="font-family:monospace;font-size:18px;font-weight:700;color:#6366f1;">
                  {t['symbol']}
                </span>
              </a>
              &nbsp;{signal_badge(t.get('weiss_signal',''))}
              <div style="color:#555;font-size:13px;margin-top:4px;">{t['name']}</div>
              <div style="color:#888;font-size:12px;margin-top:2px;">{t.get('sector') or ''}</div>
            </td>
            <td style="vertical-align:top;text-align:right;white-space:nowrap;">
              <div style="font-size:16px;font-weight:700;color:#111;">{yield_pct}</div>
              <div style="font-size:12px;color:#888;">yield · {price}</div>
              <div style="font-size:12px;color:#888;margin-top:2px;">
                Quality <strong style="color:{'#22c55e' if isinstance(quality,int) and quality>=80 else '#6366f1' if isinstance(quality,int) and quality>=60 else '#f59e0b'}">{quality}/100</strong>
                {f'· {cagr}' if cagr else ''}
              </div>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding-top:10px;">
              <a href="{ticker_url}"
                 style="display:inline-block;background:#6366f1;color:#fff;
                        text-decoration:none;border-radius:6px;
                        padding:7px 16px;font-size:13px;font-weight:600;">
                View full analysis →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>"""


def build_email(tickers: list[dict]) -> tuple[str, str]:
    count = len(tickers)
    today = date.today().strftime("%B %d, %Y")

    subject = (
        f"{count} dividend stock{'s' if count != 1 else ''} just entered undervalued territory"
    )

    cards = "\n".join(ticker_card(t) for t in tickers)

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{subject}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:#09090b;padding:24px 32px;">
            <a href="{SITE_URL}" style="text-decoration:none;">
              <span style="font-size:18px;font-weight:700;color:#fff;letter-spacing:-0.3px;">
                Dividend<span style="color:#6366f1;">Visual</span>
              </span>
            </a>
            <div style="color:#71717a;font-size:12px;margin-top:4px;">
              Weiss method · Signal alert · {today}
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 0;">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;line-height:1.3;">
              {"New undervalued opportunity" if count == 1 else f"{count} new undervalued opportunities"}
            </h1>
            <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
              {"The following stock has" if count == 1 else "The following stocks have"} just crossed
              into historically undervalued territory by the Weiss dividend yield method,
              with a quality score of {MIN_QUALITY}+.
              {"This is" if count == 1 else "These are"} the kind of entry point the method is designed to identify.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0">
              {cards}
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:24px 32px;">
            <a href="{SITE_URL}/opportunities"
               style="display:inline-block;background:#09090b;color:#fff;
                      text-decoration:none;border-radius:8px;
                      padding:12px 24px;font-size:14px;font-weight:600;">
              View all current opportunities →
            </a>
          </td>
        </tr>

        <!-- Methodology note -->
        <tr>
          <td style="padding:0 32px 24px;">
            <div style="background:#f9f9f9;border-radius:8px;padding:16px;font-size:12px;color:#888;line-height:1.6;">
              <strong style="color:#555;">How the Weiss signal works:</strong>
              A stock enters undervalued territory when its current dividend yield exceeds
              the 90th percentile of its own 10-year yield history — meaning the price is
              historically low relative to the income it generates.
              <a href="{SITE_URL}/methodology" style="color:#6366f1;">Full methodology →</a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f9;padding:20px 32px;border-top:1px solid #eee;">
            <p style="margin:0;font-size:11px;color:#aaa;line-height:1.6;">
              You're receiving this because you subscribed to DividendVisual signal alerts.
              <a href="{{{{unsubscribe}}}}" style="color:#6366f1;">Unsubscribe</a>
              &nbsp;·&nbsp;
              <a href="{SITE_URL}/privacy" style="color:#aaa;">Privacy</a>
              &nbsp;·&nbsp;
              <a href="{SITE_URL}" style="color:#aaa;">dividendvisual.com</a>
              <br><br>
              Not financial advice. All signals reflect historical data only.
              Always do your own research before investing.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""

    return subject, html


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("Checking for new undervalued transitions...\n")

    # Tickers that just flipped to undervalued (were not undervalued before)
    # previous_weiss_signal must be explicitly 'fair' or 'overvalued' — NULL means
    # no baseline yet (first compute_bands run), so we skip those to avoid spam.
    newly_undervalued = turso_query(f"""
        SELECT
            cm.symbol, c.name, c.sector,
            cm.weiss_signal, cm.previous_weiss_signal,
            cm.current_price, cm.current_yield,
            cm.quality_score, cm.dividend_cagr_5y,
            cm.years_no_cut
        FROM computed_metrics cm
        JOIN companies c ON cm.symbol = c.symbol
        WHERE cm.weiss_signal = 'undervalued'
          AND cm.previous_weiss_signal IN ('fair', 'overvalued')
          AND cm.quality_score >= {MIN_QUALITY}
        ORDER BY cm.quality_score DESC
    """)

    if not newly_undervalued:
        print("No new undervalued transitions today. No email sent.")
        return

    print(f"Found {len(newly_undervalued)} newly undervalued ticker(s):")
    for t in newly_undervalued:
        print(f"  {t['symbol']:6s}  {t['previous_weiss_signal']} → undervalued  quality={t['quality_score']}")

    subject, html = build_email(newly_undervalued)
    print(f"\nSending broadcast: \"{subject}\"")

    broadcast_id = send_broadcast(subject, html)
    print(f"Broadcast sent. ID: {broadcast_id}")


if __name__ == "__main__":
    main()
