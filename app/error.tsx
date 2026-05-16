'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl font-bold text-[#ef4444] mb-4">⚠</p>
      <h1 className="text-2xl font-bold text-[#f4f4f5] mb-3">Something went wrong</h1>
      <p className="text-[#71717a] text-sm max-w-sm mb-2">
        An unexpected error occurred. This is usually a temporary issue.
      </p>
      {error.digest && (
        <p className="text-[#3e3e4e] text-xs mb-6 font-mono">ref: {error.digest}</p>
      )}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => unstable_retry()}
          className="px-4 py-2 rounded-lg bg-[#6366f1] text-white text-sm font-medium hover:bg-[#818cf8] transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg bg-[#1e1e2e] text-[#f4f4f5] text-sm font-medium hover:bg-[#27273a] transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
