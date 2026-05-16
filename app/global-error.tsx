'use client'

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#09090b', color: '#f4f4f5', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '1rem' }}>
        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠</p>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Something went wrong</h1>
        <p style={{ color: '#71717a', fontSize: '0.875rem', maxWidth: '24rem', marginBottom: '1.5rem' }}>
          A critical error occurred. Please try again or return to the homepage.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => unstable_retry()}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#6366f1', color: '#fff', border: 'none', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#1e1e2e', color: '#f4f4f5', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}
          >
            Go home
          </a>
        </div>
      </body>
    </html>
  )
}
