const ETORO_LINKS: Record<string, string> = {
  US: 'https://med.etoro.com/B12690_A129936_TClick_SeToro%20US%20-%20DividendVisual.aspx',
  ES: 'https://med.etoro.com/B15708_A129812_TClick.aspx',
  EN: 'https://med.etoro.com/B19645_A129812_TClick.aspx',
  FR: 'https://med.etoro.com/B20116_A129812_TClick.aspx',
  IT: 'https://med.etoro.com/B16707_A129812_TClick.aspx',
  DE: 'https://med.etoro.com/B13557_A129812_TClick.aspx',
  NL: 'https://med.etoro.com/B18633_A129812_TClick.aspx',
  PL: 'https://med.etoro.com/B14140_A129812_TClick.aspx',
}

// Countries that map to the EN link
const EN_COUNTRIES = new Set(['GB', 'IE', 'AU', 'NZ', 'CA'])

export function getEtoroLink(country: string | null): string {
  if (!country) return ETORO_LINKS.EN
  if (EN_COUNTRIES.has(country)) return ETORO_LINKS.EN
  return ETORO_LINKS[country] ?? ETORO_LINKS.EN
}
