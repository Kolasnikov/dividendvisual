"""Curated dividend status lists for DividendVisual.

Definitions:
- Dividend King: 50+ consecutive annual dividend increases.
- Dividend Aristocrat: current S&P 500 Dividend Aristocrats/NOBL constituent.

Sources checked May 19, 2026:
- StockAnalysis Dividend Kings list.
- ProShares NOBL holdings page.
- Lancaster Colony company dividend press release for LANC.
"""

DIVIDEND_KINGS = [
    "AWR", "DOV", "GPC", "PG", "PH", "EMR", "CINF", "JNJ", "KO", "CL",
    "NDSN", "HRL", "LANC", "FRT", "CBSH", "MO", "SYY", "ITW", "MSA",
    "GWW", "PPG", "TGT", "ABBV", "ABT", "BDX", "KMB", "LOW", "PEP",
    "ED", "NUE", "RPM", "SPGI", "WMT", "ADP", "MCD",
]

DIVIDEND_ARISTOCRATS = [
    "BEN", "CL", "ADP", "NUE", "KO", "SJM", "XOM", "GWW", "CAT", "ESS",
    "GD", "CVX", "EXPD", "CHD", "FRT", "TROW", "WMT", "AFL", "ABBV",
    "JNJ", "CINF", "CB", "PG", "KMB", "CTAS", "ED", "SYY", "NEE",
    "NDSN", "ATO", "O", "FAST", "PEP", "HRL", "DOV", "ABT", "MDT",
    "SPGI", "MCD", "PPG", "TGT", "CLX", "ITW", "ECL", "EMR", "ROP",
    "BDX", "SHW", "MKC", "AOS", "IBM", "LOW", "BRO", "GPC",
]

DIVIDEND_STREAK_YEARS = {
    # Dividend Kings, from StockAnalysis list unless noted.
    "AWR": 72,
    "DOV": 71,
    "GPC": 70,
    "PG": 70,
    "PH": 70,
    "EMR": 69,
    "CINF": 65,
    "JNJ": 64,
    "KO": 64,
    "CL": 63,
    "NDSN": 63,
    "LANC": 62,
    "HRL": 60,
    "FRT": 59,
    "CBSH": 58,
    "MO": 57,
    "SYY": 57,
    "ITW": 56,
    "MSA": 56,
    "GWW": 55,
    "PPG": 55,
    "TGT": 55,
    "ABBV": 54,
    "ABT": 54,
    "BDX": 54,
    "KMB": 54,
    "LOW": 54,
    "PEP": 54,
    "ED": 53,
    "NUE": 53,
    "RPM": 53,
    "SPGI": 53,
    "WMT": 53,
    "ADP": 51,
    "MCD": 51,
    # Non-King Aristocrats where exact/current streak was separately checked.
    "BEN": 46,
    "CLX": 49,
}

for symbol in DIVIDEND_ARISTOCRATS:
    DIVIDEND_STREAK_YEARS.setdefault(symbol, 25)
