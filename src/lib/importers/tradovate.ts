import Papa from 'papaparse'
import type { ParsedTrade } from './metatrader'

// Performance CSV format (matched trades):
// symbol, buyFillId, sellFillId, qty, buyPrice, sellPrice, pnl, boughtTimestamp, soldTimestamp

const POINT_VALUES: Record<string, number> = {
  MES:  5,
  ES:   50,
  MNQ:  2,
  NQ:   20,
  MYM:  0.5,
  YM:   5,
  M2K:  5,
  RTY:  50,
  MGC:  10,
  GC:   100,
  MCL:  100,
  CL:   1000,
  SI:   5000,
  ZB:   1000,
  ZN:   1000,
  ZF:   1000,
  ZC:   50,
  ZS:   50,
  ZW:   50,
  NG:   10000,
}

const MONTH_CODES = new Set(['F','G','H','J','K','M','N','Q','U','V','X','Z'])

function getBaseSymbol(symbol: string): string {
  const s = symbol.toUpperCase()
  if (s.length >= 3) {
    const last = s[s.length - 1]
    const month = s[s.length - 2]
    if (/\d/.test(last) && MONTH_CODES.has(month)) return s.slice(0, -2)
  }
  return s
}

function getPointValue(symbol: string): number {
  return POINT_VALUES[getBaseSymbol(symbol)] ?? 1
}

// Parse "$690.00" → 690, "$(6.00)" → -6
function parsePnl(raw: string): number {
  if (!raw) return 0
  const negative = raw.includes('(')
  const cleaned = raw.replace(/[$(),]/g, '').trim()
  const value = parseFloat(cleaned)
  return negative ? -Math.abs(value) : value
}

// Parse "05/18/2026 07:57:20" → ISO string (treat as ET/local, store as UTC)
function parseTimestamp(ts: string): string {
  // MM/DD/YYYY HH:MM:SS
  const [datePart, timePart] = ts.trim().split(' ')
  const [month, day, year] = datePart.split('/')
  return new Date(`${year}-${month}-${day}T${timePart}`).toISOString()
}

export function parseTradovateCSV(rawCsv: string): { trades: ParsedTrade[]; errors: string[] } {
  const errors: string[] = []

  const result = Papa.parse<Record<string, string>>(rawCsv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim(),
    transform: v => v.trim(),
  })

  const trades: ParsedTrade[] = []

  result.data.forEach((row, i) => {
    const symbol     = row['symbol']?.toUpperCase()
    const buyFillId  = parseInt(row['buyFillId']  ?? '0', 10)
    const sellFillId = parseInt(row['sellFillId'] ?? '0', 10)
    const qty        = parseFloat(row['qty'])
    const buyPrice   = parseFloat(row['buyPrice'])
    const sellPrice  = parseFloat(row['sellPrice'])
    const pnl        = parsePnl(row['pnl'])
    const boughtTs   = row['boughtTimestamp']
    const soldTs     = row['soldTimestamp']

    if (!symbol || isNaN(qty) || isNaN(buyPrice) || isNaN(sellPrice)) {
      errors.push(`Row ${i + 2}: missing or invalid fields`)
      return
    }

    // Direction: if buyFillId < sellFillId → bought first → LONG
    // if sellFillId < buyFillId → sold first → SHORT
    const isLong = buyFillId < sellFillId

    trades.push({
      broker_trade_id: `${buyFillId}-${sellFillId}`,
      symbol,
      direction:   isLong ? 'long' : 'short',
      asset_class: 'futures',
      quantity:    qty,
      entry_price: isLong ? buyPrice  : sellPrice,
      exit_price:  isLong ? sellPrice : buyPrice,
      entry_at:    parseTimestamp(isLong ? boughtTs : soldTs),
      exit_at:     parseTimestamp(isLong ? soldTs   : boughtTs),
      pnl,
      commission:  0,
      stop_loss:   null,
      status:      'closed',
      point_value: getPointValue(symbol),
      broker_id:   'tradovate',
    })
  })

  return { trades, errors }
}
