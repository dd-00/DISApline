import Papa from 'papaparse'
import type { ParsedTrade } from './metatrader'

interface TradovateRow {
  Account:       string
  Date:          string
  Side:          string   // BUY | SELL
  Symbol:        string
  Quantity:      string
  Price:         string
  'Order Type':  string
  Status:        string   // FILLED | CANCELLED | REJECTED
  Commission:    string
  Pnl:           string   // empty on entry leg, value on exit leg
  'Trade Id':    string
}

interface OpenLeg {
  date:       string
  side:       'BUY' | 'SELL'
  quantity:   number
  price:      number
  commission: number
  tradeId:    string
}

// Point value per base contract symbol
const POINT_VALUES: Record<string, number> = {
  MES:  5,       // Micro E-mini S&P 500
  ES:   50,      // E-mini S&P 500
  MNQ:  2,       // Micro E-mini Nasdaq
  NQ:   20,      // E-mini Nasdaq
  MYM:  0.5,     // Micro E-mini Dow
  YM:   5,       // E-mini Dow
  M2K:  5,       // Micro E-mini Russell 2000
  RTY:  50,      // E-mini Russell 2000
  MGC:  10,      // Micro Gold
  GC:   100,     // Gold
  MCL:  100,     // Micro Crude Oil
  CL:   1000,    // Crude Oil
  MHG:  2500,    // Micro Copper
  HG:   25000,   // Copper
  SI:   5000,    // Silver
  ZB:   1000,    // 30-Year T-Bond
  ZN:   1000,    // 10-Year T-Note
  ZF:   1000,    // 5-Year T-Note
  ZC:   50,      // Corn
  ZS:   50,      // Soybeans
  ZW:   50,      // Wheat
  NG:   10000,   // Natural Gas
}

// Strip futures month/year suffix: MESM6 → MES, ESM6 → ES, NQU5 → NQ
const MONTH_CODES = new Set(['F','G','H','J','K','M','N','Q','U','V','X','Z'])

function getBaseSymbol(symbol: string): string {
  const s = symbol.toUpperCase()
  if (s.length >= 3) {
    const last = s[s.length - 1]
    const monthCode = s[s.length - 2]
    if (/\d/.test(last) && MONTH_CODES.has(monthCode)) {
      return s.slice(0, -2)
    }
  }
  return s
}

function getPointValue(symbol: string): number {
  const base = getBaseSymbol(symbol)
  return POINT_VALUES[base] ?? 1
}

function parseDate(dt: string): string {
  // Tradovate format: "2026-05-15 10:30:21"
  return new Date(dt.replace(' ', 'T') + 'Z').toISOString()
}

export function parseTradovateCSV(rawCsv: string): { trades: ParsedTrade[]; errors: string[] } {
  const errors: string[] = []

  const result = Papa.parse<TradovateRow>(rawCsv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim(),
    transform: v => v.trim(),
  })

  // Only process filled orders
  const filled = result.data.filter(r => r.Status?.toUpperCase() === 'FILLED')

  // Sort chronologically
  filled.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())

  // Group fills by symbol — we'll pair legs per symbol
  const bySymbol = new Map<string, TradovateRow[]>()
  for (const row of filled) {
    const sym = row.Symbol?.toUpperCase()
    if (!sym) continue
    if (!bySymbol.has(sym)) bySymbol.set(sym, [])
    bySymbol.get(sym)!.push(row)
  }

  const trades: ParsedTrade[] = []

  bySymbol.forEach((rows, symbol) => {
    // Open legs queue — FIFO
    const openLongs:  OpenLeg[] = []
    const openShorts: OpenLeg[] = []

    rows.forEach((row, i) => {
      const side = row.Side?.toUpperCase() as 'BUY' | 'SELL'
      const qty  = parseFloat(row.Quantity)
      const price = parseFloat(row.Price)
      const comm  = Math.abs(parseFloat(row.Commission) || 0)
      const pnl   = parseFloat(row.Pnl)

      if (isNaN(qty) || isNaN(price)) {
        errors.push(`Row ${i + 2} (${symbol}): invalid numeric fields`)
        return
      }

      if (side === 'BUY') {
        // Check if this closes an open short
        if (openShorts.length > 0) {
          const entry = openShorts.shift()!
          const tradePnl = isNaN(pnl) ? (entry.price - price) * qty * getPointValue(symbol) : pnl
          trades.push({
            broker_trade_id: entry.tradeId || row['Trade Id'],
            symbol,
            direction:       'short',
            asset_class:     'futures',
            quantity:        qty,
            entry_price:     entry.price,
            exit_price:      price,
            entry_at:        parseDate(entry.date),
            exit_at:         parseDate(row.Date),
            pnl:             tradePnl,
            commission:      entry.commission + comm,
            stop_loss:       null,
            status:          'closed',
            point_value:     getPointValue(symbol),
            broker_id:       'tradovate',
          })
        } else {
          // Opening a long
          openLongs.push({ date: row.Date, side, quantity: qty, price, commission: comm, tradeId: row['Trade Id'] })
        }
      } else if (side === 'SELL') {
        // Check if this closes an open long
        if (openLongs.length > 0) {
          const entry = openLongs.shift()!
          const tradePnl = isNaN(pnl) ? (price - entry.price) * qty * getPointValue(symbol) : pnl
          trades.push({
            broker_trade_id: entry.tradeId || row['Trade Id'],
            symbol,
            direction:       'long',
            asset_class:     'futures',
            quantity:        qty,
            entry_price:     entry.price,
            exit_price:      price,
            entry_at:        parseDate(entry.date),
            exit_at:         parseDate(row.Date),
            pnl:             tradePnl,
            commission:      entry.commission + comm,
            stop_loss:       null,
            status:          'closed',
            point_value:     getPointValue(symbol),
            broker_id:       'tradovate',
          })
        } else {
          // Opening a short
          openShorts.push({ date: row.Date, side, quantity: qty, price, commission: comm, tradeId: row['Trade Id'] })
        }
      }
    })

    // Any leftover open legs are still-open trades — skip for now
    if (openLongs.length > 0 || openShorts.length > 0) {
      errors.push(`${symbol}: ${openLongs.length + openShorts.length} open position(s) skipped (not yet closed)`)
    }
  })

  return { trades, errors }
}
