import LegalPage from '@/components/legal/LegalPage'

export const metadata = {
  title: 'Risk Disclosures — ZB Capital',
  description: 'Important risk disclosures and regulatory notices for ZB Capital users.',
}

export default function DisclosuresPage() {
  return (
    <LegalPage
      title="Risk Disclosures"
      subtitle="Important notices you must read before using ZB Capital"
      lastUpdated="May 17, 2026"
      sections={[
        {
          title: 'Not Financial Advice',
          content: (
            <>
              <p>
                <strong>ZB Capital is a personal trading journal and analytics tool. It does not provide financial advice, investment advice, tax advice, or legal advice of any kind.</strong>
              </p>
              <p>
                Nothing displayed on the ZB Capital platform — including metrics, pattern alerts, performance statistics, win rates, expectancy figures, psychological insights, or any other output — constitutes a recommendation to buy, sell, or hold any financial instrument, security, derivative, cryptocurrency, or other asset.
              </p>
              <p>
                All data shown is derived solely from information you have entered. ZB Capital performs no independent analysis of markets and takes no view on any financial instrument.
              </p>
            </>
          ),
        },
        {
          title: 'No Regulated Activity',
          content: (
            <>
              <p>
                ZB Capital S.R.L. is not a licensed or authorised investment firm, portfolio manager, financial intermediary, broker, or financial adviser under:
              </p>
              <ul>
                <li>Italian law — Testo Unico della Finanza (TUF), Legislative Decree 58/1998</li>
                <li>EU law — MiFID II Directive 2014/65/EU and MiFID II Regulation (EU) 600/2014</li>
                <li>Any other national or supranational regulatory framework</li>
              </ul>
              <p>
                ZB Capital is registered and operated as a software services company. Its activities are limited to the provision of productivity and journaling software tools and do not constitute any regulated financial activity.
              </p>
            </>
          ),
        },
        {
          title: 'Trading Risk Warning',
          content: (
            <>
              <p>
                Trading financial instruments — including but not limited to equities, futures, options, contracts for difference (CFDs), foreign exchange (forex), and cryptocurrencies — carries a high degree of risk. You should be aware that:
              </p>
              <ul>
                <li>You can lose some or all of your invested capital</li>
                <li>Past performance is not indicative of future results</li>
                <li>Leveraged products can result in losses that exceed your initial deposit</li>
                <li>Market conditions can change rapidly and unpredictably</li>
                <li>Statistical patterns identified in your historical journal data may not repeat in the future</li>
              </ul>
              <p>
                Before trading, you should carefully consider your objectives, financial situation, experience, and risk tolerance. If in doubt, seek independent advice from a qualified financial adviser authorised in your jurisdiction.
              </p>
            </>
          ),
        },
        {
          title: 'Accuracy of Data and Metrics',
          content: (
            <>
              <p>
                All metrics, analytics, and pattern detection shown in ZB Capital are computed from the trade data you enter. We do not independently verify the accuracy of your inputs. Accordingly:
              </p>
              <ul>
                <li>Metrics are only as accurate as the data you provide</li>
                <li>Calculation methodologies are described in our documentation and may be updated</li>
                <li>No guarantee is made that any metric is error-free or suitable for any particular trading decision</li>
              </ul>
              <p>
                If you identify a calculation error, please report it to <a href="mailto:support@disapline.eu">support@disapline.eu</a>.
              </p>
            </>
          ),
        },
        {
          title: 'Broker Integration Disclaimer',
          content: (
            <>
              <p>
                Where ZB Capital offers integrations with third-party brokerage platforms, such integrations are provided solely as a data import convenience. ZB Capital:
              </p>
              <ul>
                <li>Does not execute trades on your behalf</li>
                <li>Does not access or transmit funds</li>
                <li>Does not store brokerage credentials in plain text</li>
                <li>Is not responsible for the accuracy, availability, or actions of third-party brokers</li>
              </ul>
              <p>
                Your relationship with any broker is governed entirely by the terms and agreements between you and that broker. ZB Capital is not a party to those agreements.
              </p>
            </>
          ),
        },
        {
          title: 'Psychological and Behavioural Insights',
          content: (
            <>
              <p>
                ZB Capital may surface behavioural patterns and psychological insights based on your journaled data. These are intended as reflective tools to support self-awareness and discipline — they are:
              </p>
              <ul>
                <li>Not a substitute for professional psychological or therapeutic support</li>
                <li>Based on general trading psychology research and your self-reported data, not a clinical assessment</li>
                <li>Informational in nature; you retain full responsibility for any decisions made in response to these insights</li>
              </ul>
            </>
          ),
        },
        {
          title: 'Tax and Regulatory Compliance',
          content: (
            <>
              <p>
                ZB Capital does not provide tax advice or assist with regulatory compliance. You are solely responsible for:
              </p>
              <ul>
                <li>Reporting trading gains and losses to the relevant tax authorities in your jurisdiction</li>
                <li>Complying with all applicable regulations governing your trading activities</li>
                <li>Determining whether the use of any financial instrument is lawful in your jurisdiction</li>
              </ul>
              <p>
                Consult a qualified tax adviser and, where applicable, a licensed financial adviser for guidance specific to your situation.
              </p>
            </>
          ),
        },
        {
          title: 'No Guarantee of Outcomes',
          content: (
            <>
              <p>
                Using ZB Capital does not guarantee improved trading performance, profitability, or any specific outcome. The platform is a tool to support discipline and self-reflection. Trading results depend on many factors outside the scope of this platform, including but not limited to market conditions, your personal trading strategy, risk management, and emotional discipline.
              </p>
            </>
          ),
        },
        {
          title: 'Contact',
          content: (
            <>
              <p>
                For questions about these disclosures, contact us at:
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
