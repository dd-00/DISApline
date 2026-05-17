import Papa from 'papaparse'
import type { AssetClass, Direction } from '@/types'

interface MT5Row {
  Ticket:      string
  'Open Time': string
  Type:        string
  Size:        string
  Item:        string
  Price:       string   // entry — Papa gives us the first occurrence
  'S/L':       string
  'T/P':       string
  'Close Time':string
  Price_close: string   // we remap the duplicate header below
  Commission:  string
  Swap:        string
  Profit:      string
}

export interface ParsedTrade {
  broker_trade_id: string
  symbol:          string
  direction:       Direction
  asset_class:     AssetClass
  quantity:        number
  entry_price:     number
  exit_price:      number
  entry_at:        string
  exit_at:         string
  pnl:             number
  commission:      number
  stop_loss:       number | null
  status:          'closed'
  point_value:     number
  broker_id:       string
}

function detectAssetClass(symbol: string): AssetClass {
  const s = symbol.toUpperCase()
  const cryptoBases = ['BTC', 'ETH', 'XRP', 'LTC', 'BNB', 'SOL', 'ADA', 'DOT']
  if (cryptoBases.some(c => s.startsWith(c))) return 'crypto'
  const indices = ['US30', 'US500', 'NAS100', 'GER40', 'UK100', 'JPN225', 'SPX', 'NDX', 'DAX', 'FTSE']
  if (indices.some(i => s.includes(i))) return 'futures'
  const forexCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD', 'SEK', 'NOK', 'DKK']
  const isForex = forexCurrencies.some(c => s.startsWith(c)) && forexCurrencies.some(c => s.endsWith(c))
  if (isForex) return 'forex'
  const commodities = ['GOLD', 'XAUUSD', 'SILVER', 'XAGUSD', 'OIL', 'WTI', 'BRENT']
  if (commodities.some(c => s.includes(c))) return 'other'
  return 'forex' // safe default for MT5
}

// MT5 CSVs have two columns both named "Price" — we handle the duplicate manually
function remapDuplicateHeaders(raw: string): string {
  const lines = raw.split('\n')
  if (!lines[0]) return raw
  // Replace second occurrence of "Price" in header with "Price_close"
  let replaced = false
  lines[0] = lines[0].replace(/"Price"/g, (match) => {
    if (!replaced) { replaced = true; return match }
    return '"Price_close"'
  })
  return lines.join('\n')
}

function parseDateTime(dt: string): string {
  // MT5 format: "2026.04.12 08:35:10"
  return new Date(dt.replace(/\./g, '-')).toISOString()
}

export function parseMetaTraderCSV(rawCsv: string): { trades: ParsedTrade[]; errors: string[] } {
  const errors: string[] = []
  const fixed = remapDuplicateHeaders(rawCsv)

  const result = Papa.parse<MT5Row>(fixed, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim().replace(/^"|"$/g, ''),
    transform: v => v.trim().replace(/^"|"$/g, ''),
  })

  const trades: ParsedTrade[] = []

  result.data.forEach((row, i) => {
    // Skip summary rows (no ticket or non-numeric ticket)
    if (!row.Ticket || isNaN(Number(row.Ticket))) return
    // Skip balance/deposit rows
    const type = row.Type?.toLowerCase()
    if (!type || !['buy', 'sell', 'buy limit', 'sell limit', 'buy stop', 'sell stop'].some(t => type.includes(t))) return
    // Skip open trades (no close time)
    if (!row['Close Time'] || row['Close Time'] === '0') return

    const pnl        = parseFloat(row.Profit)
    const commission = parseFloat(row.Commission) + parseFloat(row.Swap || '0')
    const entryPrice = parseFloat(row.Price)
    const exitPrice  = parseFloat(row.Price_close)
    const size       = parseFloat(row.Size)
    const sl         = parseFloat(row['S/L'])

    if ([pnl, commission, entryPrice, exitPrice, size].some(isNaN)) {
      errors.push(`Row ${i + 2}: could not parse numeric fields`)
      return
    }

    try {
      trades.push({
        broker_trade_id: row.Ticket,
        symbol:          row.Item.toUpperCase(),
        direction:       type.includes('buy') ? 'long' : 'short',
        asset_class:     detectAssetClass(row.Item),
        quantity:        size,
        entry_price:     entryPrice,
        exit_price:      exitPrice,
        entry_at:        parseDateTime(row['Open Time']),
        exit_at:         parseDateTime(row['Close Time']),
        pnl,
        commission:      Math.abs(commission),
        stop_loss:       isNaN(sl) || sl === 0 ? null : sl,
        status:          'closed',
        point_value:     1,
        broker_id:       'metatrader',
      })
    } catch {
      errors.push(`Row ${i + 2}: invalid date format`)
    }
  })

  return { trades, errors }
}
