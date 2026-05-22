'use client'

import { useEffect } from 'react'
import { track } from '@vercel/analytics'

interface Props {
  landing: string
}

function firstValue(params: URLSearchParams, key: string) {
  return params.get(key)?.slice(0, 80)
}

export function TrackNewsletterLanding({ landing }: Props) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    if (params.get('utm_source') !== 'newsletter') return

    track('newsletter_landing_viewed', {
      landing,
      campaign: firstValue(params, 'utm_campaign') ?? 'unknown',
      content: firstValue(params, 'utm_content') ?? 'unknown',
    })
  }, [landing])

  return null
}
