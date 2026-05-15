import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { TickerTape } from '@/components/layout/TickerTape'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'DividendVisual — Understand dividend valuation visually',
    template: '%s | DividendVisual',
  },
  description:
    'Visual tools for dividend investors. Weiss valuation bands, quality scores, and income projections for 30+ dividend stocks.',
  metadataBase: new URL('https://dividendvisual.com'),
  openGraph: {
    type: 'website',
    siteName: 'DividendVisual',
    title: 'DividendVisual — Understand dividend valuation visually',
    description:
      'Visual tools for dividend investors. Weiss valuation bands, quality scores, and income projections for 30+ dividend stocks.',
    url: 'https://dividendvisual.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DividendVisual — Understand dividend valuation visually',
    description:
      'Visual tools for dividend investors. Weiss valuation bands, quality scores, and income projections for 30+ dividend stocks.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#09090b] text-[#f4f4f5] antialiased">
        <Navbar />
        <TickerTape />
        <main className="flex-1">{children}</main>
        <Analytics />
      </body>
    </html>
  )
}
