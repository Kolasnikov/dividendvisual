import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How DividendVisual collects, uses, and protects your personal information.',
  alternates: { canonical: 'https://dividendvisual.com/privacy' },
}

const LAST_UPDATED = 'May 16, 2026'

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />

      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[#f4f4f5] mb-2">Privacy Policy</h1>
        <p className="text-xs text-[#52525b]">Last updated: {LAST_UPDATED}</p>
      </header>

      <article className="prose-dv">

        <p>
          DividendVisual (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. This policy
          explains what information we collect, how we use it, and your rights regarding that information.
          By using dividendvisual.com, you agree to the practices described here.
        </p>

        <h2>Information We Collect</h2>

        <h3>Email Address (optional)</h3>
        <p>
          If you subscribe to our newsletter, we collect your email address and basic signup context,
          such as the page or feature where you subscribed. Email addresses are stored via{' '}
          <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-[#6366f1] hover:text-[#818cf8]">Resend</a>,
          our email service provider, and may also be stored in our database for subscription analytics.
          We do not sell, share, or rent your email address to third parties.
        </p>

        <h3>Usage Data</h3>
        <p>
          We use <a href="https://vercel.com/analytics" target="_blank" rel="noopener noreferrer" className="text-[#6366f1] hover:text-[#818cf8]">Vercel Analytics</a> to
          collect anonymized data about how visitors use the site — pages visited, referral sources, and
          general geographic region (country level). This data does not contain personally identifiable
          information and cannot be used to identify individual users.
        </p>

        <h3>No User Accounts</h3>
        <p>
          DividendVisual does not currently require or offer user accounts. We do not collect names,
          passwords, financial information, or any other personal data beyond what is listed above.
        </p>

        <h2>How We Use Your Information</h2>
        <ul>
          <li><strong>Email address and signup context:</strong> To send newsletter updates, understand which pages convert subscribers, and improve the newsletter. You can unsubscribe at any time using the link in any email we send.</li>
          <li><strong>Usage data:</strong> To understand how the site is used, identify popular features, and improve the product. This data is aggregated and anonymous.</li>
        </ul>

        <h2>Cookies</h2>
        <p>
          DividendVisual does not set cookies directly. Vercel, our hosting provider, may set functional
          cookies necessary to serve the website (e.g., for caching or performance). We do not use
          advertising cookies, tracking cookies, or third-party analytics cookies beyond Vercel Analytics.
        </p>

        <h2>Data Storage and Security</h2>
        <p>
          Financial data (stock prices, dividends, computed metrics) is stored in Turso, a cloud-hosted
          SQLite database. Email addresses collected via newsletter signup are stored by Resend, which is
          SOC 2 compliant, and limited signup metadata may be stored in Turso for analytics and debugging.
          We do not store payment information — DividendVisual does not currently process any transactions.
        </p>
        <p>
          While we take reasonable measures to protect your information, no internet transmission is
          completely secure. We cannot guarantee absolute security of any data transmitted to our site.
        </p>

        <h2>Your Rights</h2>
        <p>
          If you have subscribed to our newsletter and would like to have your email address removed from
          our records, you can:
        </p>
        <ul>
          <li>Click the unsubscribe link in any newsletter email, or</li>
          <li>Contact us directly at the email address below.</li>
        </ul>
        <p>
          If you are located in the European Union, you have additional rights under the GDPR, including
          the right to access, correct, or delete your personal data. Contact us to exercise these rights.
        </p>

        <h2>Third-Party Services</h2>
        <p>We use the following third-party services, each with their own privacy policies:</p>
        <ul>
          <li><strong>Vercel</strong> — Hosting and analytics. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#6366f1] hover:text-[#818cf8]">Vercel Privacy Policy</a></li>
          <li><strong>Resend</strong> — Email delivery. <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#6366f1] hover:text-[#818cf8]">Resend Privacy Policy</a></li>
          <li><strong>Turso</strong> — Database hosting. <a href="https://turso.tech/privacy" target="_blank" rel="noopener noreferrer" className="text-[#6366f1] hover:text-[#818cf8]">Turso Privacy Policy</a></li>
        </ul>

        <h2>Children&apos;s Privacy</h2>
        <p>
          DividendVisual is not directed at children under 13. We do not knowingly collect personal
          information from children. If you believe a child has provided personal information, please
          contact us and we will delete it promptly.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this policy periodically. We will update the &quot;Last updated&quot; date at the top
          of this page when changes are made. Continued use of the site after changes constitutes
          acceptance of the updated policy.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy-related questions or requests, contact us at:{' '}
          <a href="mailto:privacy@dividendvisual.com" className="text-[#6366f1] hover:text-[#818cf8]">
            privacy@dividendvisual.com
          </a>
        </p>

      </article>
    </div>
  )
}
