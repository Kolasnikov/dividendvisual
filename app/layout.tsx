import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { TickerTape } from '@/components/layout/TickerTape'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

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
    'Geraldine Weiss dividend yield valuation for 150+ stocks. Visual tools for income investors — Weiss valuation bands, quality scores, and dividend projections.',
  metadataBase: new URL('https://dividendvisual.com'),
  openGraph: {
    type: 'website',
    siteName: 'DividendVisual',
    title: 'DividendVisual — Find Undervalued Dividend Stocks',
    description:
      'Geraldine Weiss dividend yield valuation for 150+ stocks. Visual tools for income investors — Weiss valuation bands, quality scores, and dividend projections.',
    url: 'https://dividendvisual.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DividendVisual — Understand dividend valuation visually',
    description:
      'Visual tools for dividend investors. Weiss valuation bands, quality scores, and income projections for 150+ dividend stocks.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <meta name="impact-site-verification" {...{ value: '90a5328e-ebe8-4d09-9ef3-01dfb9d330f9' } as any} />
        {GA_MEASUREMENT_ID && (
          <>
            <link rel="preconnect" href="https://www.googletagmanager.com" />
            <link rel="preconnect" href="https://www.google-analytics.com" />
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col bg-[#09090b] text-[#f4f4f5] antialiased">
        <Navbar />
        <TickerTape />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
        <Script
          id="impact-tracking"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `(function(i,m,p,a,c,t){c.ire_o=p;c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};t=a.createElement(m);var z=a.getElementsByTagName(m)[0];t.async=1;t.src=i;z.parentNode.insertBefore(t,z)})('https://utt.impactcdn.com/P-A7315834-642d-4f20-8880-679e251c2d381.js','script','impactStat',document,window);impactStat('transformLinks');impactStat('trackImpression');`,
          }}
        />
        <Script
          src="https://www.dwin2.com/pub.2899577.min.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}
