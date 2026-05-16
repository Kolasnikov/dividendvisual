import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using DividendVisual.',
  alternates: { canonical: 'https://dividendvisual.com/terms' },
}

const LAST_UPDATED = 'May 16, 2026'

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Terms of Service' }]} />

      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[#f4f4f5] mb-2">Terms of Service</h1>
        <p className="text-xs text-[#52525b]">Last updated: {LAST_UPDATED}</p>
      </header>

      <article className="prose-dv">

        <p>
          These Terms of Service (&quot;Terms&quot;) govern your use of dividendvisual.com (the &quot;Service&quot;).
          By accessing or using the Service, you agree to be bound by these Terms. If you do not agree,
          do not use the Service.
        </p>

        <h2>1. Nature of the Service</h2>
        <p>
          DividendVisual provides informational tools for analyzing dividend-paying stocks using the
          Geraldine Weiss yield method. The Service displays historical dividend yield data, computed
          valuation signals, quality scores, and income projections for informational and educational
          purposes only.
        </p>
        <p>
          <strong>DividendVisual is not a financial advisor, broker, or investment advisor.</strong> Nothing
          on this site constitutes financial advice, investment recommendations, or an offer to buy or sell
          any security. All content is provided for informational purposes only.
        </p>

        <h2>2. No Investment Advice</h2>
        <p>
          The Weiss valuation signals, quality scores, DRIP projections, and all other content on
          DividendVisual reflect historical data and computed metrics — not predictions of future
          performance. Past dividend history and yield patterns do not guarantee future dividends or
          returns.
        </p>
        <p>
          You should conduct your own independent research and consult a qualified financial advisor
          before making any investment decision. DividendVisual expressly disclaims any liability for
          investment decisions made based on information provided by this Service.
        </p>

        <h2>3. Accuracy of Information</h2>
        <p>
          We strive to keep stock data, dividend histories, and computed metrics accurate and up to date.
          Data is sourced from publicly available market data and updated daily. However, we make no
          representations or warranties, express or implied, regarding the completeness, accuracy, or
          timeliness of any information on the Service.
        </p>
        <p>
          Market data may be delayed, contain errors, or fail to update due to technical issues. Do not
          rely solely on DividendVisual for time-sensitive trading decisions.
        </p>

        <h2>4. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Scrape, crawl, or systematically download data from the Service in a manner that places
          excessive load on our servers or circumvents access controls</li>
          <li>Use automated tools to bulk-access the API in a way that degrades service for other users</li>
          <li>Reproduce, republish, or commercially redistribute the Service&apos;s content without written permission</li>
          <li>Attempt to reverse engineer, decompile, or extract proprietary algorithms or data from the Service</li>
          <li>Use the Service in any way that violates applicable laws or regulations</li>
        </ul>

        <h2>5. Intellectual Property</h2>
        <p>
          The DividendVisual name, logo, design, written content, and proprietary algorithms (including
          the quality score and DRIP calculator methodology) are owned by DividendVisual and protected
          by applicable intellectual property laws. Stock data and financial information displayed on the
          Service is sourced from publicly available market data.
        </p>

        <h2>6. Disclaimer of Warranties</h2>
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER
          EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
          PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE
          UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, DIVIDENDVISUAL SHALL NOT BE LIABLE FOR ANY
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO
          INVESTMENT LOSSES, LOSS OF DATA, OR LOSS OF PROFITS, ARISING FROM YOUR USE OF OR INABILITY TO
          USE THE SERVICE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>

        <h2>8. External Links</h2>
        <p>
          The Service may contain links to third-party websites, including broker platforms and financial
          services. These links are provided for convenience only. We do not endorse or assume
          responsibility for the content, privacy practices, or terms of any third-party site. Some links
          may be affiliate links through which we receive compensation if you open an account or make a
          purchase.
        </p>

        <h2>9. Modifications to the Service</h2>
        <p>
          We reserve the right to modify, suspend, or discontinue any part of the Service at any time
          without notice. We may also update these Terms at any time. Continued use of the Service after
          changes to these Terms constitutes acceptance of the updated Terms.
        </p>

        <h2>10. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with applicable law. Any disputes
          arising from these Terms or your use of the Service shall be resolved through good-faith
          negotiation before pursuing formal legal remedies.
        </p>

        <h2>11. Contact</h2>
        <p>
          For questions about these Terms, contact us at:{' '}
          <a href="mailto:legal@dividendvisual.com" className="text-[#6366f1] hover:text-[#818cf8]">
            legal@dividendvisual.com
          </a>
        </p>

      </article>
    </div>
  )
}
