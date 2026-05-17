import Papa from 'papaparse'
import type { ParsedTrade } from './metatrader'
import type { AssetClass } from '@/types'

interface IBKRRow {
  Header:             string   // "Traders"
  DataDiscriminator:  string   // "Data"
  'Asset Category':   string   // STK | FUT | OPT | CASH | BOND | CFD
  Currency:           string
  Symbol:             string
  Description:        string
  'Date/Time':        string   // "2026-05-14, 10:30:15"
  Quantity:           string   // positive = buy, negative = sell
  'Trade Price':      string
  'Trade Money':      string   // negative for buys, positive for sells
  Commission:         string   // always negative
  'Order Type':       string
  'Execution ID':     string
}

interface OpenLeg {
  date:        string
  quantity:    number
  price:       number
  tradeMoney:  number
  commission:  number
  execId:      string
  assetClass:  AssetClass
}

function mapAssetClass(category: string): AssetClass {
  switch (category.toUpperCase()) {
    case 'STK':  return 'stocks'
    case 'FUT':  return 'futures'
    case 'OPT':  return 'options'
    case 'CASH': return 'forex'
    default:     return 'other'
  }
}

function parseIBKRDate(dt: string): string {
  // IBKR format: "2026-05-14, 10:30:15" — remove comma
  return new Date(dt.replace(', ', 'T') + 'Z').toISOString()
}

export function parseIBKRCSV(rawCsv: string): { trades: ParsedTrade[]; errors: string[] } {
  const errors: string[] = []

  const result = Papa.parse<IBKRRow>(rawCsv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim().replace(/^"|"$/g, ''),
    transform: v => v.trim().replace(/^"|"$/g, ''),
  })

  // Only process actual trade data rows — filter out totals/summaries
  const rows = result.data.filter(
    r => r.Header === 'Traders' && r.DataDiscriminator === 'Data' && r.Symbol
  )

  // Sort chronologically
  rows.sort((a, b) => new Date(a['Date/Time'].replace(', ', 'T')).getTime() -
                      new Date(b['Date/Time'].replace(', ', 'T')).getTime())

  // Group by symbol
  const bySymbol = new Map<string, IBKRRow[]>()
  for (const row of rows) {
    const sym = row.Symbol?.toUpperCase()
    if (!sym) continue
    if (!bySymbol.has(sym)) bySymbol.set(sym, [])
    bySymbol.get(sym)!.push(row)
  }

  const trades: ParsedTrade[] = []

  bySymbol.forEach((symRows, symbol) => {
    const openLongs:  OpenLeg[] = []
    const openShorts: OpenLeg[] = []

    symRows.forEach((row, i) => {
      const qty        = parseFloat(row.Quantity)
      const price      = parseFloat(row['Trade Price'])
      const tradeMoney = parseFloat(row['Trade Money'])
      const commission = parseFloat(row.Commission) // negative
      const assetClass = mapAssetClass(row['Asset Category'])

      if (isNaN(qty) || isNaN(price)) {
        errors.push(`Row ${i + 2} (${symbol}): invalid numeric fields`)
        return
      }

      const isBuy = qty > 0
      const absQty = Math.abs(qty)

      if (isBuy) {
        if (openShorts.length > 0) {
          // Closing a short
          const entry = openShorts.shift()!
          // P&L = sum of trade money flows + sum of commissions
          const pnl = entry.tradeMoney + tradeMoney + entry.commission + commission
          trades.push({
            broker_trade_id: entry.execId,
            symbol,
            direction:       'short',
            asset_class:     assetClass,
            quantity:        absQty,
            entry_price:     entry.price,
            exit_price:      price,
            entry_at:        parseIBKRDate(entry.date),
            exit_at:         parseIBKRDate(row['Date/Time']),
            pnl:             Math.round(pnl * 100) / 100,
            commission:      Math.abs(entry.commission + commission),
            stop_loss:       null,
            status:          'closed',
            point_value:     1,
            broker_id:       'ibkr',
          })
        } else {
          openLongs.push({
            date:       row['Date/Time'],
            quantity:   absQty,
            price,
            tradeMoney,
            commission,
            execId:     row['Execution ID'],
            assetClass,
          })
        }
      } else {
        if (openLongs.length > 0) {
          // Closing a long
          const entry = openLongs.shift()!
          const pnl = entry.tradeMoney + tradeMoney + entry.commission + commission
          trades.push({
            broker_trade_id: entry.execId,
            symbol,
            direction:       'long',
            asset_class:     assetClass,
            quantity:        absQty,
            entry_price:     entry.price,
            exit_price:      price,
            entry_at:        parseIBKRDate(entry.date),
            exit_at:         parseIBKRDate(row['Date/Time']),
            pnl:             Math.round(pnl * 100) / 100,
            commission:      Math.abs(entry.commission + commission),
            stop_loss:       null,
            status:          'closed',
            point_value:     1,
            broker_id:       'ibkr',
          })
        } else {
          openShorts.push({
            date:       row['Date/Time'],
            quantity:   absQty,
            price,
            tradeMoney,
            commission,
            execId:     row['Execution ID'],
            assetClass,
          })
        }
      }
    })

    if (openLongs.length > 0 || openShorts.length > 0) {
      errors.push(`${symbol}: ${openLongs.length + openShorts.length} open position(s) skipped`)
    }
  })

  return { trades, errors }
}
