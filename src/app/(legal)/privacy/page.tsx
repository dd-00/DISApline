import LegalPage from '@/components/legal/LegalPage'

export const metadata = {
  title: 'Privacy Policy — DISApline',
  description: 'How DISApline S.R.L. collects, processes, and protects your personal data under GDPR.',
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your personal data"
      lastUpdated="May 17, 2026"
      sections={[
        {
          title: 'Data Controller',
          content: (
            <>
              <p>
                The data controller for personal data collected through DISApline is:
              </p>
              <ul>
                <li><strong>DISApline S.R.L.</strong></li>
                <li>Registered in Italy</li>
                <li>Contact: <a href="mailto:support@disapline.com">support@disapline.com</a></li>
              </ul>
              <p>
                DISApline S.R.L. is responsible for the lawful, fair, and transparent processing of your personal data in accordance with EU Regulation 2016/679 (GDPR) and the Italian Legislative Decree 196/2003 as amended by Legislative Decree 101/2018.
              </p>
            </>
          ),
        },
        {
          title: 'Data We Collect',
          content: (
            <>
              <p>We collect only the data necessary to provide our service:</p>
              <ul>
                <li><strong>Account data:</strong> email address and password (stored as a hashed credential) when you create an account</li>
                <li><strong>Trading journal data:</strong> trade entries, notes, performance metrics, and any other content you voluntarily input into the platform</li>
                <li><strong>Usage data:</strong> log data, IP address, browser type, operating system, pages visited, and timestamps — collected automatically when you access the service</li>
                <li><strong>Device data:</strong> device identifiers, screen resolution, and timezone, used solely to deliver and improve the service</li>
              </ul>
              <p>
                We do <strong>not</strong> collect financial account credentials, brokerage access tokens (unless you explicitly connect a broker integration), or payment card details (payment is processed directly by our payment processor and we do not store card data).
              </p>
            </>
          ),
        },
        {
          title: 'Legal Basis for Processing',
          content: (
            <>
              <p>Under GDPR Art. 6, we process your data on the following legal bases:</p>
              <ul>
                <li><strong>Contract performance (Art. 6(1)(b)):</strong> processing your account data and journal content is necessary to deliver the service you signed up for</li>
                <li><strong>Legitimate interests (Art. 6(1)(f)):</strong> we process usage and device data to maintain security, prevent fraud, and improve our service</li>
                <li><strong>Consent (Art. 6(1)(a)):</strong> for optional analytics cookies and marketing communications, only where you have given explicit consent</li>
                <li><strong>Legal obligation (Art. 6(1)(c)):</strong> we may process data when required to comply with Italian or EU legal requirements</li>
              </ul>
            </>
          ),
        },
        {
          title: 'How We Use Your Data',
          content: (
            <>
              <p>Your personal data is used exclusively to:</p>
              <ul>
                <li>Create and maintain your account and provide access to the platform</li>
                <li>Store and display your trade journal entries and performance analytics</li>
                <li>Send transactional emails (account verification, password reset, service notices)</li>
                <li>Diagnose technical issues, monitor service health, and prevent abuse</li>
                <li>Comply with legal and regulatory obligations</li>
              </ul>
              <p>
                We do <strong>not</strong> sell, rent, or trade your personal data to third parties for marketing purposes. We do not use your trading data to train AI models or share it with financial institutions.
              </p>
            </>
          ),
        },
        {
          title: 'Third-Party Processors',
          content: (
            <>
              <p>
                We use a limited number of trusted sub-processors to deliver the service. Each has been assessed for GDPR compliance and is bound by a Data Processing Agreement (DPA):
              </p>
              <ul>
                <li><strong>Supabase, Inc. (USA):</strong> database hosting and authentication. Data is stored in EU-region servers where available. Transfers to the US are covered by Standard Contractual Clauses (SCCs) adopted by the European Commission (Decision 2021/914/EU).</li>
                <li><strong>Vercel, Inc. (USA):</strong> application hosting and edge delivery. Transfers covered by SCCs.</li>
                <li><strong>Stripe, Inc. (USA):</strong> payment processing. Stripe is responsible for PCI-DSS compliance on payment data. We receive only a tokenised reference, not card details. Transfers covered by SCCs.</li>
              </ul>
              <p>
                Analytics data, where collected, is anonymised before processing and is never associated with an identifiable individual.
              </p>
            </>
          ),
        },
        {
          title: 'International Data Transfers',
          content: (
            <>
              <p>
                DISApline is based in Italy (EU). Some of our sub-processors are located in the United States, which does not provide an adequacy decision equivalent to the EU. For all such transfers we rely on:
              </p>
              <ul>
                <li>Standard Contractual Clauses (SCCs) pursuant to European Commission Implementing Decision 2021/914/EU</li>
                <li>Transfer impact assessments conducted on a per-processor basis</li>
                <li>Technical safeguards including encryption in transit (TLS 1.2+) and at rest (AES-256)</li>
              </ul>
              <p>
                You may request a copy of the applicable SCCs by contacting us at <a href="mailto:support@disapline.com">support@disapline.com</a>.
              </p>
            </>
          ),
        },
        {
          title: 'Data Retention',
          content: (
            <>
              <p>We retain personal data only for as long as necessary:</p>
              <ul>
                <li><strong>Account and journal data:</strong> retained for the duration of your account and deleted within 30 days of account closure upon request</li>
                <li><strong>Usage logs:</strong> retained for up to 12 months for security and diagnostic purposes, then automatically deleted</li>
                <li><strong>Billing records:</strong> retained for 10 years as required by Italian fiscal law (D.P.R. 633/1972)</li>
                <li><strong>Legal hold:</strong> data subject to a legal proceeding may be retained beyond these periods until resolution</li>
              </ul>
            </>
          ),
        },
        {
          title: 'Your Rights Under GDPR',
          content: (
            <>
              <p>
                As a data subject under GDPR you have the following rights, exercisable at any time by contacting <a href="mailto:support@disapline.com">support@disapline.com</a>:
              </p>
              <ul>
                <li><strong>Right of access (Art. 15):</strong> obtain confirmation of whether we process your data and receive a copy</li>
                <li><strong>Right to rectification (Art. 16):</strong> request correction of inaccurate or incomplete data</li>
                <li><strong>Right to erasure (Art. 17):</strong> request deletion of your data where no overriding legal basis applies</li>
                <li><strong>Right to restriction (Art. 18):</strong> request that we limit processing in certain circumstances</li>
                <li><strong>Right to data portability (Art. 20):</strong> receive your data in a structured, machine-readable format</li>
                <li><strong>Right to object (Art. 21):</strong> object to processing based on legitimate interests or for direct marketing</li>
                <li><strong>Right to withdraw consent (Art. 7(3)):</strong> withdraw consent at any time without affecting lawfulness of prior processing</li>
              </ul>
              <p>
                We will respond to verifiable requests within 30 days. We may need to verify your identity before processing the request.
              </p>
            </>
          ),
        },
        {
          title: 'Right to Lodge a Complaint',
          content: (
            <>
              <p>
                If you believe we have processed your data unlawfully, you have the right to lodge a complaint with the competent supervisory authority:
              </p>
              <ul>
                <li>
                  <strong>Garante per la protezione dei dati personali</strong><br />
                  Piazza Venezia 11, 00187 Roma, Italy<br />
                  Web: <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">www.garanteprivacy.it</a><br />
                  Tel: +39 06 696771
                </li>
              </ul>
              <p>
                You may also contact the supervisory authority of your EU member state of habitual residence.
              </p>
            </>
          ),
        },
        {
          title: 'Security',
          content: (
            <>
              <p>
                We implement appropriate technical and organisational measures to protect your personal data, including:
              </p>
              <ul>
                <li>Encryption in transit using TLS 1.2 or higher</li>
                <li>Encryption at rest using AES-256</li>
                <li>Password hashing using bcrypt with salting</li>
                <li>Row-level security (RLS) policies ensuring users can only access their own data</li>
                <li>Regular security assessments and access control reviews</li>
              </ul>
              <p>
                In the event of a personal data breach that is likely to result in a risk to your rights and freedoms, we will notify the Garante within 72 hours and, where required, notify affected individuals without undue delay.
              </p>
            </>
          ),
        },
        {
          title: 'Cookies',
          content: (
            <>
              <p>
                We use cookies and similar technologies to operate the service and, where you consent, to analyse usage. For full details see our <a href="/cookies">Cookie Policy</a>.
              </p>
            </>
          ),
        },
        {
          title: 'Changes to This Policy',
          content: (
            <>
              <p>
                We may update this Privacy Policy from time to time. Where changes are material, we will notify you by email or by a prominent notice on the platform at least 15 days before the change takes effect. Continued use of the service after the effective date constitutes acceptance of the revised policy.
              </p>
              <p>
                The current version and its effective date are shown at the top of this page.
              </p>
            </>
          ),
        },
        {
          title: 'Contact',
          content: (
            <>
              <p>
                For any questions about this Privacy Policy or to exercise your rights, contact us at:
              </p>
              <ul>
                <li><a href="mailto:support@disapline.com">support@disapline.com</a></li>
              </ul>
              <p>
                We aim to respond to all enquiries within 5 business days.
              </p>
            </>
          ),
        },
      ]}
    />
  )
}
