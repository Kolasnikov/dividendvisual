'use client'

import { useEffect } from 'react'
import { trackNewsletterEvent } from '@/components/analytics/useNewsletterFunnel'

export function NewsletterConfirmedTracking({ source, symbol }: { source: string; symbol?: string }) {
  useEffect(() => {
    trackNewsletterEvent('newsletter_confirmation_viewed', source || 'unknown', {
      symbol: symbol || 'none',
    })
  }, [source, symbol])

  return null
}
