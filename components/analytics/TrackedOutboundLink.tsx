'use client'

import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { track } from '@vercel/analytics'

type AnalyticsValue = string | number | boolean

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode
  event: string
  properties: Record<string, AnalyticsValue>
}

function currentNewsletterAttribution() {
  const params = new URLSearchParams(window.location.search)

  return {
    source: params.get('utm_source') === 'newsletter' ? 'newsletter' : 'site',
    campaign: params.get('utm_campaign')?.slice(0, 80) ?? 'none',
    content: params.get('utm_content')?.slice(0, 80) ?? 'none',
  }
}

export function TrackedOutboundLink({
  children,
  event,
  onClick,
  properties,
  ...linkProps
}: Props) {
  return (
    <a
      {...linkProps}
      onClick={(clickEvent) => {
        track(event, {
          ...properties,
          ...currentNewsletterAttribution(),
        })
        onClick?.(clickEvent)
      }}
    >
      {children}
    </a>
  )
}
