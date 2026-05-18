import LegalPage from '@/components/legal/LegalPage'

export const metadata = {
  title: 'Terms of Service — ZB Capital',
  description: 'Terms governing your use of the ZB Capital trading journal platform.',
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      subtitle="The rules governing your use of ZB Capital"
      lastUpdated="May 17, 2026"
      sections={[
        {
          title: 'Agreement to Terms',
          content: (
            <>
              <p>
                By accessing or using ZB Capital (the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, do not use the Service.
              </p>
              <p>
                ZB Capital is operated by <strong>ZB Capital S.R.L.</strong>, a company registered in Italy (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). These Terms constitute a binding agreement between you and ZB Capital S.R.L.
              </p>
            </>
          ),
        },
        {
          title: 'Eligibility',
          content: (
            <>
              <p>
                You must be at least 18 years of age to use the Service. By using the Service you represent and warrant that you meet this requirement and that you have the legal capacity to enter into a binding agreement.
              </p>
              <p>
                If you are using the Service on behalf of a legal entity, you represent that you have the authority to bind that entity to these Terms.
              </p>
            </>
          ),
        },
        {
          title: 'Description of Service',
          content: (
            <>
              <p>
                ZB Capital is a trading journal and performance analytics platform designed to help traders track, analyse, and improve their trading discipline. The Service includes:
              </p>
              <ul>
                <li>Trade logging and tagging tools</li>
                <li>Performance metrics and visualisations</li>
                <li>Psychological pattern detection</li>
                <li>Journal and notebook features</li>
                <li>Optional broker integrations (where available)</li>
              </ul>
              <p>
                ZB Capital is a <strong>personal productivity and journaling tool</strong>. It does not provide financial advice, investment recommendations, or brokerage services. See our <a href="/disclosures">Disclosures</a>.
              </p>
            </>
          ),
        },
        {
          title: 'Account Registration',
          content: (
            <>
              <p>
                You must create an account to access most features of the Service. You agree to:
              </p>
              <ul>
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password confidential and not share access with others</li>
                <li>Notify us immediately at <a href="mailto:support@disapline.com">support@disapline.com</a> of any unauthorised use of your account</li>
              </ul>
              <p>
                You are solely responsible for all activity that occurs under your account.
              </p>
            </>
          ),
        },
        {
          title: 'Subscription and Payment',
          content: (
            <>
              <p>
                Certain features of the Service require a paid subscription. Prices, billing cycles, and included features are described on our pricing page and may be updated from time to time with reasonable notice.
              </p>
              <ul>
                <li>Subscriptions are billed in advance on a monthly or annual basis</li>
                <li>Payment is processed by our third-party payment processor (Stripe). We do not store payment card details</li>
                <li>All prices are shown in EUR inclusive of applicable VAT where required by Italian and EU law</li>
                <li>Subscriptions renew automatically unless cancelled before the renewal date</li>
              </ul>
            </>
          ),
        },
        {
          title: 'Right of Withdrawal — EU Consumers',
          content: (
            <>
              <p>
                If you are a consumer resident in the European Union, you have the right to withdraw from a subscription contract without giving any reason within <strong>14 days</strong> of the date of purchase, pursuant to EU Directive 2011/83/EU and the Italian Codice del Consumo (Legislative Decree 206/2005), Articles 52–58.
              </p>
              <p>
                <strong>Waiver of withdrawal right:</strong> By activating a subscription and accessing the paid features of the Service immediately after purchase, you expressly request that performance begin before the withdrawal period expires and acknowledge that you lose your right of withdrawal once the service has been fully performed. Where the service has not been fully performed, a pro-rata deduction for the portion already delivered will apply to any refund.
              </p>
              <p>
                To exercise the right of withdrawal (where applicable), contact us at <a href="mailto:support@disapline.com">support@disapline.com</a> before the 14-day period expires.
              </p>
            </>
          ),
        },
        {
          title: 'Cancellation and Refunds',
          content: (
            <>
              <p>
                You may cancel your subscription at any time from your account settings. Upon cancellation:
              </p>
              <ul>
                <li>Access to paid features continues until the end of the current billing period</li>
                <li>No partial refunds are issued for unused time within a billing period, except where required by applicable EU consumer law (see Right of Withdrawal above) or where we have materially failed to deliver the Service</li>
                <li>Your data is retained for 30 days after the subscription ends and then deleted, unless you request earlier deletion</li>
              </ul>
            </>
          ),
        },
        {
          title: 'Acceptable Use',
          content: (
            <>
              <p>You agree not to:</p>
              <ul>
                <li>Use the Service for any unlawful purpose or in violation of applicable Italian or EU law</li>
                <li>Attempt to gain unauthorised access to any part of the Service or its infrastructure</li>
                <li>Reverse-engineer, decompile, or disassemble any part of the Service</li>
                <li>Scrape, crawl, or systematically extract data from the Service without our written permission</li>
                <li>Use the Service to store or transmit malicious code, viruses, or harmful content</li>
                <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
                <li>Use the Service in a manner that could damage, disable, or impair its availability or performance</li>
              </ul>
            </>
          ),
        },
        {
          title: 'Intellectual Property',
          content: (
            <>
              <p>
                The Service, including its design, source code, algorithms, analytics logic, branding, and documentation, is the exclusive intellectual property of ZB Capital S.R.L. and is protected by Italian and EU intellectual property law, including the Italian Industrial Property Code (Legislative Decree 30/2005) and EU Directive 2019/790.
              </p>
              <p>
                <strong>Your content:</strong> You retain all rights to the trade data, notes, and content you input into the Service. You grant us a limited, non-exclusive licence to process that content solely to provide the Service to you. We do not claim ownership of your data.
              </p>
              <p>
                Copyright © 2026 ZB Capital S.R.L. All rights reserved.
              </p>
            </>
          ),
        },
        {
          title: 'No Financial Advice',
          content: (
            <>
              <p>
                ZB Capital is a journaling and analytics tool. Nothing on the platform constitutes financial advice, investment advice, or a recommendation to buy or sell any financial instrument. See our <a href="/disclosures">Risk Disclosures</a> for full details.
              </p>
              <p>
                ZB Capital S.R.L. is not a regulated investment firm, broker, or financial adviser under Italian law (TUF — Testo Unico della Finanza, Legislative Decree 58/1998) or EU MiFID II (Directive 2014/65/EU).
              </p>
            </>
          ),
        },
        {
          title: 'Third-Party Integrations',
          content: (
            <>
              <p>
                The Service may integrate with third-party services (e.g., brokers, data providers). These integrations are provided for convenience. We are not responsible for the availability, accuracy, or conduct of third-party services, and their use is governed by their own terms and policies.
              </p>
            </>
          ),
        },
        {
          title: 'Disclaimer of Warranties',
          content: (
            <>
              <p>
                The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement, to the maximum extent permitted by Italian and EU law.
              </p>
              <p>
                We do not warrant that the Service will be uninterrupted, error-free, or that any data, metrics, or analytics will be accurate. Trading involves risk; any statistics or patterns shown in the Service are derived from data you provide and are for informational purposes only.
              </p>
            </>
          ),
        },
        {
          title: 'Limitation of Liability',
          content: (
            <>
              <p>
                To the maximum extent permitted by applicable law, ZB Capital S.R.L. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill, arising out of or in connection with your use of the Service.
              </p>
              <p>
                Our aggregate liability to you for any claim arising out of or in connection with these Terms or the Service shall not exceed the amount you paid us in the 12 months preceding the claim.
              </p>
              <p>
                Nothing in these Terms limits or excludes our liability for death or personal injury caused by our negligence, fraud, or any other liability that cannot be excluded under Italian or EU mandatory consumer protection law.
              </p>
            </>
          ),
        },
        {
          title: 'Consumer Protections — Codice del Consumo',
          content: (
            <>
              <p>
                If you are a consumer within the meaning of Italian Legislative Decree 206/2005 (Codice del Consumo), you benefit from mandatory consumer protections under Italian and EU law that cannot be waived by contract. These Terms do not affect those rights. In particular:
              </p>
              <ul>
                <li>Unfair contract terms are void pursuant to Articles 33–37 of the Codice del Consumo</li>
                <li>You are entitled to clear, transparent pre-contractual information (Art. 49)</li>
                <li>Your statutory rights for defective digital services under EU Directive 2019/770 remain unaffected</li>
              </ul>
            </>
          ),
        },
        {
          title: 'Governing Law and Jurisdiction',
          content: (
            <>
              <p>
                These Terms are governed by and construed in accordance with the laws of <strong>Italy</strong>, without regard to conflict of law principles, and subject to applicable EU regulations.
              </p>
              <p>
                Any dispute arising out of or in connection with these Terms or the Service shall be subject to the exclusive jurisdiction of the courts of <strong>Italy</strong>, subject to any mandatory jurisdiction rules under EU Regulation 1215/2012 (Brussels I Recast) that may apply to consumer disputes.
              </p>
              <p>
                EU consumers may also use the European Commission&apos;s online dispute resolution platform at <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>.
              </p>
            </>
          ),
        },
        {
          title: 'Termination',
          content: (
            <>
              <p>
                We may suspend or terminate your account at any time if we believe you have violated these Terms, with or without prior notice. You may also close your account at any time from your account settings.
              </p>
              <p>
                Upon termination, your right to use the Service ceases immediately. Provisions that by their nature should survive (intellectual property, limitation of liability, governing law) shall survive termination.
              </p>
            </>
          ),
        },
        {
          title: 'Changes to These Terms',
          content: (
            <>
              <p>
                We may update these Terms from time to time. We will notify you of material changes by email or in-app notice at least <strong>15 days</strong> before the new Terms take effect. Continued use of the Service after the effective date constitutes acceptance of the revised Terms.
              </p>
              <p>
                If you do not agree to the revised Terms, you may cancel your account before the effective date.
              </p>
            </>
          ),
        },
        {
          title: 'Contact',
          content: (
            <>
              <p>
                For questions about these Terms, contact us at:
              </p>
              <ul>
                <li><a href="mailto:support@disapline.com">support@disapline.com</a></li>
              </ul>
            </>
          ),
        },
      ]}
    />
  )
}
