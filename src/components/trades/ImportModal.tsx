'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { parseMetaTraderCSV, type ParsedTrade } from '@/lib/importers/metatrader'
import { parseTradovateCSV } from '@/lib/importers/tradovate'
import { parseIBKRCSV } from '@/lib/importers/ibkr'
import { parseNinjaTraderCSV } from '@/lib/importers/ninjatrader'
import { parseThinkorswimCSV } from '@/lib/importers/thinkorswim'

interface Props {
  userId: string
  onClose: () => void
  onImported: () => void
}

type Step = 'upload' | 'preview' | 'importing' | 'done'

export default function ImportModal({ userId, onClose, onImported }: Props) {
  const supabase = createClient()
  const fileRef  = useRef<HTMLInputElement>(null)

  const [step, setStep]         = useState<Step>('upload')
  const [trades, setTrades]     = useState<ParsedTrade[]>([])
  const [errors, setErrors]     = useState<string[]>([])
  const [imported, setImported] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  function detectBroker(text: string): 'metatrader' | 'tradovate' | 'ibkr' | 'ninjatrader' | 'thinkorswim' | 'unknown' {
    const firstLine = text.split('\n')[0] ?? ''
    if (firstLine.includes('Ticket') && firstLine.includes('Open Time')) return 'metatrader'
    if (firstLine.includes('DataDiscriminator')) return 'ibkr'
    if (firstLine.includes('Instrument') && (firstLine.includes('Action') || firstLine.includes('Entry Time'))) return 'ninjatrader'
    if (firstLine.includes('Net Amount') && firstLine.includes('Date') && firstLine.includes('Time')) return 'thinkorswim'
    if (firstLine.includes('Trade Id') || firstLine.includes('Side')) return 'tradovate'
    return 'unknown'
  }

  function processFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const broker = detectBroker(text)

      let parsed: ParsedTrade[] = []
      let errs:   string[]      = []

      if (broker === 'metatrader') {
        ;({ trades: parsed, errors: errs } = parseMetaTraderCSV(text))
      } else if (broker === 'tradovate') {
        ;({ trades: parsed, errors: errs } = parseTradovateCSV(text))
      } else if (broker === 'ibkr') {
        ;({ trades: parsed, errors: errs } = parseIBKRCSV(text))
      } else if (broker === 'ninjatrader') {
        ;({ trades: parsed, errors: errs } = parseNinjaTraderCSV(text))
      } else if (broker === 'thinkorswim') {
        ;({ trades: parsed, errors: errs } = parseThinkorswimCSV(text))
      } else {
        errs = ['Could not detect broker format. Supported: MetaTrader 4/5, Tradovate, IBKR, NinjaTrader, ThinkOrSwim.']
      }

      setTrades(parsed)
      setErrors(errs)
      setStep('preview')
    }
    reader.readAsText(file)
  }

  function handleFile(file: File | undefined) {
    if (!file) return
    if (!file.name.endsWith('.csv')) { setErrors(['Please upload a .csv file']); return }
    processFile(file)
  }

  async function handleImport() {
    setStep('importing')
    let count = 0

    for (const trade of trades) {
      // Check for existing trade with same broker_trade_id to avoid duplicates
      const { data: existing } = await supabase
        .from('trades')
        .select('id')
        .eq('user_id', userId)
        .eq('broker_trade_id', trade.broker_trade_id)
        .maybeSingle()

      if (existing) continue

      await supabase.from('trades').insert({
        user_id:         userId,
        symbol:          trade.symbol,
        direction:       trade.direction,
        asset_class:     trade.asset_class,
        quantity:        trade.quantity,
        entry_price:     trade.entry_price,
        exit_price:      trade.exit_price,
        entry_at:        trade.entry_at,
        exit_at:         trade.exit_at,
        pnl:             trade.pnl,
        commission:      trade.commission,
        stop_loss:       trade.stop_loss,
        status:          trade.status,
        point_value:     trade.point_value,
        broker_id:       trade.broker_id,
        broker_trade_id: trade.broker_trade_id,
        pnl_percent:     null,
        setup:           null,
        timeframe:       null,
        notes:           null,
        screenshot_url:  null,
      })
      count++
    }

    setImported(count)
    setStep('done')
    onImported()
  }

  const mono: React.CSSProperties = { fontFamily: "'Martian Mono', monospace" }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div style={{ background: 'var(--bg-el)', border: '1px solid var(--bdr)', borderRadius: '14px', padding: '32px', width: '100%', maxWidth: '560px', maxHeight: '80vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ ...mono, fontSize: '14px', fontWeight: 500, color: 'var(--chalk)', letterSpacing: '0.04em', marginBottom: '4px' }}>Import trades</h2>
            <p style={{ ...mono, fontSize: '10px', fontWeight: 300, color: 'var(--smoke)' }}>Supports MT4/5, Tradovate, IBKR, NinjaTrader, ThinkOrSwim — auto-detected</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--smoke)', cursor: 'pointer', fontSize: '18px', padding: '0 4px', lineHeight: 1 }}>×</button>
        </div>

        {/* STEP: Upload */}
        {step === 'upload' && (
          <>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--gold)' : 'var(--bdr)'}`,
                borderRadius: '10px',
                padding: '48px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                background: dragOver ? 'rgba(201,162,39,0.04)' : 'transparent',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>📂</div>
              <p style={{ ...mono, fontSize: '11px', fontWeight: 400, color: 'var(--chalk)', marginBottom: '6px' }}>
                Drop your CSV file here
              </p>
              <p style={{ ...mono, fontSize: '10px', fontWeight: 300, color: 'var(--smoke)' }}>
                or click to browse
              </p>
              <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])} />
            </div>

            <div style={{ ...mono, fontSize: '10px', fontWeight: 300, color: 'var(--smoke)', marginTop: '16px', lineHeight: 1.8 }}>
              <p style={{ marginBottom: '4px', color: 'var(--chalk)', fontWeight: 400 }}>Broker format is auto-detected. How to export:</p>
              <p><span style={{ color: 'var(--gold)' }}>MetaTrader 5:</span> History tab → right-click → Save as Report → Detailed (CSV)</p>
              <p><span style={{ color: 'var(--gold)' }}>MetaTrader 4:</span> Account History → right-click → Save as Detailed Report</p>
              <p><span style={{ color: 'var(--gold)' }}>Tradovate:</span> Accounts tab → gear icon → Orders → date range → Download CSV</p>
              <p><span style={{ color: 'var(--gold)' }}>IBKR:</span> Client Portal → Reports → Flex Queries → Activity Flex Query → Trades → Run → CSV</p>
              <p><span style={{ color: 'var(--gold)' }}>NinjaTrader:</span> Control Center → New → Trade Performance → Generate → Executions tab → right-click → Export → To Excel (CSV)</p>
              <p><span style={{ color: 'var(--gold)' }}>ThinkOrSwim:</span> Monitor → Account Statement → date range → hamburger menu → Export to file</p>
            </div>

            {errors.length > 0 && (
              <p style={{ ...mono, fontSize: '10.5px', color: 'var(--red)', background: 'rgba(200,80,80,0.08)', border: '1px solid rgba(200,80,80,0.2)', padding: '10px 12px', borderRadius: '6px', marginTop: '16px' }}>
                {errors[0]}
              </p>
            )}
          </>
        )}

        {/* STEP: Preview */}
        {step === 'preview' && (
          <>
            <div style={{ background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.2)', borderRadius: '8px', padding: '14px 16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ ...mono, fontSize: '11px', color: 'var(--chalk)' }}>
                <strong style={{ color: 'var(--gold)' }}>{trades.length}</strong> trades found
              </span>
              {errors.length > 0 && (
                <span style={{ ...mono, fontSize: '10px', color: 'var(--smoke)' }}>{errors.length} rows skipped</span>
              )}
            </div>

            {/* Preview table */}
            <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Symbol', 'Dir', 'Lots', 'Entry', 'Exit', 'P&L'].map(h => (
                      <th key={h} style={{ ...mono, fontSize: '9px', fontWeight: 500, color: 'var(--smoke)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--bdr)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trades.slice(0, 8).map((t, i) => (
                    <tr key={i}>
                      <td style={{ ...mono, fontSize: '10px', color: 'var(--chalk)', padding: '7px 8px' }}>{t.symbol}</td>
                      <td style={{ ...mono, fontSize: '10px', color: t.direction === 'long' ? '#5DB87A' : '#E07070', padding: '7px 8px', textTransform: 'uppercase' }}>{t.direction}</td>
                      <td style={{ ...mono, fontSize: '10px', color: 'var(--smoke)', padding: '7px 8px' }}>{t.quantity}</td>
                      <td style={{ ...mono, fontSize: '10px', color: 'var(--smoke)', padding: '7px 8px' }}>{t.entry_price}</td>
                      <td style={{ ...mono, fontSize: '10px', color: 'var(--smoke)', padding: '7px 8px' }}>{t.exit_price}</td>
                      <td style={{ ...mono, fontSize: '10px', color: t.pnl >= 0 ? '#5DB87A' : '#E07070', padding: '7px 8px' }}>{t.pnl >= 0 ? '+' : ''}{t.pnl.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {trades.length > 8 && (
                <p style={{ ...mono, fontSize: '9.5px', color: 'var(--smoke)', textAlign: 'center', marginTop: '8px' }}>
                  …and {trades.length - 8} more
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setStep('upload'); setTrades([]); setErrors([]) }} style={{ flex: 1, ...mono, fontSize: '10.5px', color: 'var(--smoke)', background: 'transparent', border: '1px solid var(--bdr)', borderRadius: '6px', padding: '11px', cursor: 'pointer' }}>
                Choose different file
              </button>
              <button onClick={handleImport} disabled={trades.length === 0} style={{ flex: 2, ...mono, fontSize: '10.5px', fontWeight: 500, color: '#06060A', background: 'var(--gold)', border: 'none', borderRadius: '6px', padding: '11px', cursor: 'pointer' }}>
                Import {trades.length} trades
              </button>
            </div>
          </>
        )}

        {/* STEP: Importing */}
        {step === 'importing' && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ ...mono, fontSize: '11px', color: 'var(--smoke)', marginBottom: '12px' }}>Importing trades…</div>
            <div style={{ width: '40px', height: '40px', border: '2px solid var(--bdr)', borderTop: '2px solid var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* STEP: Done */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>✓</div>
            <p style={{ ...mono, fontSize: '13px', fontWeight: 400, color: 'var(--chalk)', marginBottom: '6px' }}>
              {imported} trades imported
            </p>
            <p style={{ ...mono, fontSize: '10px', fontWeight: 300, color: 'var(--smoke)', marginBottom: '24px' }}>
              {trades.length - imported > 0 ? `${trades.length - imported} duplicates skipped` : 'No duplicates found'}
            </p>
            <button onClick={onClose} style={{ ...mono, fontSize: '10.5px', fontWeight: 500, color: '#06060A', background: 'var(--gold)', border: 'none', borderRadius: '6px', padding: '11px 28px', cursor: 'pointer' }}>
              View trades
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
