import LegalPage from '@/components/legal/LegalPage'

export const metadata = {
  title: 'Cookie Policy — ZB Capital',
  description: 'How ZB Capital uses cookies and similar technologies on its platform.',
}

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      subtitle="How we use cookies and similar tracking technologies"
      lastUpdated="May 17, 2026"
      sections={[
        {
          title: 'What Are Cookies',
          content: (
            <>
              <p>
                Cookies are small text files placed on your device by a website when you visit it. They are widely used to make websites function, improve efficiency, and provide information to the website owner.
              </p>
              <p>
                This Cookie Policy explains how ZB Capital S.R.L. uses cookies and similar technologies (such as local storage and session storage) on the ZB Capital platform, in accordance with the GDPR (EU Regulation 2016/679), the Italian Privacy Code (Legislative Decree 196/2003 as amended), and the Garante&apos;s guidelines on cookies (Provvedimento del 10 giugno 2021).
              </p>
            </>
          ),
        },
        {
          title: 'Cookies We Use',
          content: (
            <>
              <p>We use the following categories of cookies:</p>

              <p><strong>Strictly Necessary Cookies</strong></p>
              <p>
                These cookies are essential for the operation of the Service and cannot be disabled. They include:
              </p>
              <ul>
                <li><strong>Authentication session token</strong> — set by Supabase to keep you logged in during a session. Without this cookie, you would need to log in on every page. Duration: session.</li>
                <li><strong>CSRF protection token</strong> — prevents cross-site request forgery attacks. Duration: session.</li>
                <li><strong>Cookie consent preference</strong> — remembers your cookie consent choice so we do not re-prompt on every visit. Duration: 12 months.</li>
              </ul>
              <p>
                Strictly necessary cookies do not require your consent under GDPR and the Garante&apos;s guidelines because they are indispensable to provide the service you requested.
              </p>

              <p><strong>Functional Cookies</strong></p>
              <p>
                These cookies enable enhanced functionality and personalisation. If disabled, some features may not work correctly:
              </p>
              <ul>
                <li><strong>UI preferences</strong> — stores your preferred theme, timezone, and display settings in local storage. Duration: persistent until cleared.</li>
              </ul>

              <p><strong>Analytics Cookies</strong></p>
              <p>
                With your consent, we use anonymised analytics to understand how users interact with the Service, so we can improve it. These cookies:
              </p>
              <ul>
                <li>Do not identify you personally</li>
                <li>IP addresses are truncated before storage</li>
                <li>Data is never sold to or shared with advertisers</li>
              </ul>
              <p>
                You may opt out of analytics cookies at any time (see &ldquo;Managing Cookies&rdquo; below).
              </p>

              <p><strong>Cookies We Do Not Use</strong></p>
              <p>
                ZB Capital does not use advertising cookies, behavioural targeting cookies, social media tracking pixels, or third-party remarketing tags of any kind.
              </p>
            </>
          ),
        },
        {
          title: 'Legal Basis',
          content: (
            <>
              <p>
                Under GDPR Art. 6 and the Garante&apos;s cookie guidelines:
              </p>
              <ul>
                <li><strong>Strictly necessary cookies</strong> — legal basis: contract performance (Art. 6(1)(b)) and our legitimate interest in maintaining security (Art. 6(1)(f)). No consent required.</li>
                <li><strong>Functional cookies</strong> — legal basis: legitimate interest (Art. 6(1)(f)) in providing a coherent user experience. You may disable them via browser settings.</li>
                <li><strong>Analytics cookies</strong> — legal basis: your consent (Art. 6(1)(a)). These are only set after you click &ldquo;Accept&rdquo; in our cookie banner. You may withdraw consent at any time.</li>
              </ul>
            </>
          ),
        },
        {
          title: 'Cookie Duration',
          content: (
            <>
              <p>Cookies set by ZB Capital have the following lifespans:</p>
              <ul>
                <li><strong>Session cookies</strong> — deleted automatically when you close your browser</li>
                <li><strong>Consent preference cookie</strong> — 12 months from the date of consent</li>
                <li><strong>Analytics cookies</strong> — up to 13 months, in line with Garante guidelines</li>
                <li><strong>Local storage (UI preferences)</strong> — persistent until you clear your browser data or use the in-app reset option</li>
              </ul>
            </>
          ),
        },
        {
          title: 'Third-Party Cookies',
          content: (
            <>
              <p>
                ZB Capital does not allow third parties to set advertising or tracking cookies on our platform. Authentication and session management is handled by Supabase, which may set cookies strictly necessary for those functions. Supabase acts as a data processor on our behalf under a Data Processing Agreement.
              </p>
              <p>
                If you connect a third-party broker integration, that broker&apos;s own cookie policy will apply to any session you initiate on their platform.
              </p>
            </>
          ),
        },
        {
          title: 'Managing Cookies',
          content: (
            <>
              <p>
                You can control cookies in several ways:
              </p>

              <p><strong>Cookie Banner</strong></p>
              <p>
                When you first visit ZB Capital, a cookie consent banner allows you to accept or decline non-essential cookies. You can revisit this choice at any time via the cookie settings link in the footer.
              </p>

              <p><strong>Browser Settings</strong></p>
              <p>
                Most browsers allow you to refuse or delete cookies. Instructions for common browsers:
              </p>
              <ul>
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
              </ul>
              <p>
                Note: disabling strictly necessary cookies will prevent you from logging in or using core features of the Service.
              </p>

              <p><strong>Do Not Track</strong></p>
              <p>
                We honour the DNT (Do Not Track) browser signal. If your browser sends a DNT signal, we will not set analytics cookies even if you have not explicitly opted out via our banner.
              </p>
            </>
          ),
        },
        {
          title: 'Your Rights',
          content: (
            <>
              <p>
                With respect to cookies and the personal data they may process, you have the same rights as described in our <a href="/privacy">Privacy Policy</a> under GDPR Art. 15–21: access, rectification, erasure, restriction, portability, and objection.
              </p>
              <p>
                You also have the right to lodge a complaint with the <strong>Garante per la protezione dei dati personali</strong> (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">www.garanteprivacy.it</a>) if you believe your rights have been violated.
              </p>
            </>
          ),
        },
        {
          title: 'Changes to This Policy',
          content: (
            <>
              <p>
                We may update this Cookie Policy when we introduce new cookies or change how we use existing ones. Material changes will be communicated via the cookie consent banner on your next visit, giving you the opportunity to review and update your preferences.
              </p>
              <p>
                The effective date of the current version is shown at the top of this page.
              </p>
            </>
          ),
        },
        {
          title: 'Contact',
          content: (
            <>
              <p>
                For questions about this Cookie Policy or to exercise your data rights, contact us at:
              </p>
              <ul>
                <li><a href="mailto:support@disapline.eu">support@disapline.eu</a></li>
              </ul>
            </>
          ),
        },
      ]}
    />
  )
}
