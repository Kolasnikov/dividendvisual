import { createClient } from '@supabase/supabase-js'

const BOT_UA_PATTERN =
  /bot|crawl|spider|slurp|facebookexternalhit|preview|whatsapp|telegrambot|discordbot|linkedinbot|embedly/i

type ClickEvent = {
  site: string
  partner: string
  placement: string | null
  destinationUrl: string
  referrerPath: string | null
  userAgent: string
  country: string | null
}

export async function trackAffiliateClick(event: ClickEvent) {
  const url = process.env.AFFILIATE_TRACKING_URL
  const key = process.env.AFFILIATE_TRACKING_KEY
  if (!url || !key) return

  const supabase = createClient(url, key)

  await supabase.from('affiliate_clicks').insert({
    site: event.site,
    partner: event.partner,
    placement: event.placement,
    destination_url: event.destinationUrl,
    referrer_path: event.referrerPath,
    user_agent: event.userAgent,
    is_bot: BOT_UA_PATTERN.test(event.userAgent),
    country: event.country,
  })
}
