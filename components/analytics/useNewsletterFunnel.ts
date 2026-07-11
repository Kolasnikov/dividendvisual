'use client'

import { useEffect, useRef } from 'react'
import { track } from '@vercel/analytics'

type FunnelProperties = Record<string, string | number | boolean>

function currentPath() {
  return typeof window === 'undefined' ? 'unknown' : window.location.pathname.slice(0, 160)
}

export function trackNewsletterEvent(event: string, source: string, properties: FunnelProperties = {}) {
  track(event, {
    source,
    path: currentPath(),
    ...properties,
  })
}

export function useNewsletterFunnel(source: string) {
  const containerRef = useRef<HTMLElement>(null)
  const viewedRef = useRef(false)
  const startedRef = useRef(false)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || viewedRef.current) return
        viewedRef.current = true
        trackNewsletterEvent('newsletter_cta_viewed', source)
        observer.disconnect()
      },
      { threshold: 0.5 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [source])

  function trackStarted() {
    if (startedRef.current) return
    startedRef.current = true
    trackNewsletterEvent('newsletter_form_started', source)
  }

  return { containerRef, trackStarted }
}
