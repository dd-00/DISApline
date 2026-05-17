import Papa from 'papaparse'
import type { ParsedTrade } from './metatrader'

// ── Detailed Executions format ────────────────────────────────────────────────
interface NTExecutionRow {
  Account:        string
  Instrument:     string   // e.g. "ES 06-26", "MES 06-26"
  Action:         string   // Buy | Sell
  Quantity:       string
  Price:          string
  Time:           string   // "2026-05-15 10:30:15.222"
  Commission:     string
  'Execution ID': string
}

// ── Trade Performance format ──────────────────────────────────────────────────
interface NTTradeRow {
  Account:     string
  Instrument:  string
  Strategy:    string
  Direction:   string   // Long | Short
  'Entry Time':string   // "2026-05-15 09:15:00"
  'Exit Time': string
  Quantity:    string
  PnL:         string
}

// Shared point value table (same futures contracts as Tradovate)
const POINT_VALUES: Record<string, number> = {
  MES: 5, ES: 50, MNQ: 2, NQ: 20, MYM: 0.5, YM: 5,
  M2K: 5, RTY: 50, MGC: 10, GC: 100, MCL: 100, CL: 1000,
  SI: 5000, HG: 25000, ZB: 1000, ZN: 1000, ZF: 1000,
  ZC: 50, ZS: 50, ZW: 50, NG: 10000,
}

// "ES 06-26" → "ES"
function getBaseSymbol(instrument: string): string {
  return instrument.split(' ')[0].toUpperCase()
}

function getPointValue(instrument: string): number {
  return POINT_VALUES[getBaseSymbol(instrument)] ?? 1
}

// "ES 06-26" → "ES_06-26" for storage as symbol
function normalizeSymbol(instrument: string): string {
  return instrument.replace(/\s+/, '_').toUpperCase()
}

function parseNTDate(dt: string): string {
  // Handles "2026-05-15 10:30:15.222" and "2026-05-15 09:15:00"
  return new Date(dt.replace(' ', 'T')).toISOString()
}

// ── Detect which NinjaTrader format ──────────────────────────────────────────
function detectNTFormat(headers: string[]): 'executions' | 'performance' | 'unknown' {
  const h = headers.map(s => s.toLowerCase())
  if (h.includes('action') && h.includes('execution id')) return 'executions'
  if (h.includes('entry time') && h.includes('exit time') && h.includes('pnl')) return 'performance'
  return 'unknown'
}

// ── Parse Trade Performance (already-complete trades) ────────────────────────
function parsePerformance(rows: NTTradeRow[]): { trades: ParsedTrade[]; errors: string[] } {
  const errors: string[] = []
  const trades: ParsedTrade[] = []

  rows.forEach((row, i) => {
    const pnl      = parseFloat(row.PnL)
    const qty      = parseFloat(row.Quantity)
    const dir      = row.Direction?.toLowerCase()

    if (isNaN(pnl) || isNaN(qty)) {
      errors.push(`Row ${i + 2}: invalid numeric fields`)
      return
    }
    if (dir !== 'long' && dir !== 'short') {
      errors.push(`Row ${i + 2}: unknown direction "${row.Direction}"`)
      return
    }

    try {
      trades.push({
        broker_trade_id: `NT-${row['Entry Time']}-${row.Instrument}`.replace(/\s/g, ''),
        symbol:          normalizeSymbol(row.Instrument),
        direction:       dir as 'long' | 'short',
        asset_class:     'futures',
        quantity:        qty,
        entry_price:     0,   // not available in performance export
        exit_price:      0,
        entry_at:        parseNTDate(row['Entry Time']),
        exit_at:         parseNTDate(row['Exit Time']),
        pnl,
        commission:      0,   // not available in performance export
        stop_loss:       null,
        status:          'closed',
        point_value:     getPointValue(row.Instrument),
        broker_id:       'ninjatrader',
      })
    } catch {
      errors.push(`Row ${i + 2}: invalid date`)
    }
  })

  return { trades, errors }
}

// ── Parse Detailed Executions (pair Buy/Sell fills) ──────────────────────────
function parseExecutions(rows: NTExecutionRow[]): { trades: ParsedTrade[]; errors: string[] } {
  const errors: string[] = []

  // Sort chronologically (handle millisecond timestamps)
  rows.sort((a, b) => new Date(a.Time).getTime() - new Date(b.Time).getTime())

  // Group by instrument
  const byInstrument = new Map<string, NTExecutionRow[]>()
  for (const row of rows) {
    const key = row.Instrument?.toUpperCase()
    if (!key) continue
    if (!byInstrument.has(key)) byInstrument.set(key, [])
    byInstrument.get(key)!.push(row)
  }

  const trades: ParsedTrade[] = []

  byInstrument.forEach((instrRows, instrument) => {
    const openLongs:  { date: string; price: number; commission: number; execId: string }[] = []
    const openShorts: { date: string; price: number; commission: number; execId: string }[] = []
    const pv = getPointValue(instrument)
    const sym = normalizeSymbol(instrument)

    instrRows.forEach((row, i) => {
      const action = row.Action?.toLowerCase()
      const qty    = parseFloat(row.Quantity)
      const price  = parseFloat(row.Price)
      const comm   = Math.abs(parseFloat(row.Commission) || 0)

      if (isNaN(qty) || isNaN(price)) {
        errors.push(`Row ${i + 2} (${instrument}): invalid numeric fields`)
        return
      }

      if (action === 'buy') {
        if (openShorts.length > 0) {
          const entry = openShorts.shift()!
          const pnl   = (entry.price - price) * qty * pv
          trades.push({
            broker_trade_id: entry.execId,
            symbol:          sym,
            direction:       'short',
            asset_class:     'futures',
            quantity:        qty,
            entry_price:     entry.price,
            exit_price:      price,
            entry_at:        parseNTDate(entry.date),
            exit_at:         parseNTDate(row.Time),
            pnl:             Math.round(pnl * 100) / 100,
            commission:      entry.commission + comm,
            stop_loss:       null,
            status:          'closed',
            point_value:     pv,
            broker_id:       'ninjatrader',
          })
        } else {
          openLongs.push({ date: row.Time, price, commission: comm, execId: row['Execution ID'] })
        }
      } else if (action === 'sell') {
        if (openLongs.length > 0) {
          const entry = openLongs.shift()!
          const pnl   = (price - entry.price) * qty * pv
          trades.push({
            broker_trade_id: entry.execId,
            symbol:          sym,
            direction:       'long',
            asset_class:     'futures',
            quantity:        qty,
            entry_price:     entry.price,
            exit_price:      price,
            entry_at:        parseNTDate(entry.date),
            exit_at:         parseNTDate(row.Time),
            pnl:             Math.round(pnl * 100) / 100,
            commission:      entry.commission + comm,
            stop_loss:       null,
            status:          'closed',
            point_value:     pv,
            broker_id:       'ninjatrader',
          })
        } else {
          openShorts.push({ date: row.Time, price, commission: comm, execId: row['Execution ID'] })
        }
      }
    })

    if (openLongs.length > 0 || openShorts.length > 0) {
      errors.push(`${instrument}: ${openLongs.length + openShorts.length} open position(s) skipped`)
    }
  })

  return { trades, errors }
}

// ── Main entry point ──────────────────────────────────────────────────────────
export function parseNinjaTraderCSV(rawCsv: string): { trades: ParsedTrade[]; errors: string[] } {
  const result = Papa.parse<Record<string, string>>(rawCsv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim(),
    transform: v => v.trim(),
  })

  const headers = result.meta.fields ?? []
  const format  = detectNTFormat(headers)

  if (format === 'performance') {
    return parsePerformance(result.data as unknown as NTTradeRow[])
  } else if (format === 'executions') {
    return parseExecutions(result.data as unknown as NTExecutionRow[])
  }

  return { trades: [], errors: ['Could not detect NinjaTrader export format. Use Detailed Executions or Trade Performance CSV.'] }
}
