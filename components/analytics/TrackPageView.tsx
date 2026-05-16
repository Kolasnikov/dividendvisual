'use client'

import { useEffect } from 'react'
import { track } from '@vercel/analytics'

interface Props {
  event: string
  properties?: Record<string, string | number | boolean>
}

export function TrackPageView({ event, properties }: Props) {
  useEffect(() => {
    track(event, properties)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
