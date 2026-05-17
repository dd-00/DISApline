import Papa from 'papaparse'
import type { ParsedTrade } from './metatrader'
import type { AssetClass } from '@/types'

interface TOSRow {
  Date:         string   // "2026-05-15"
  Time:         string   // "10:30:05"
  Account:      string
  Symbol:       string
  Type:         string   // STOCK | OPTION | FUTURE | FOREX
  Side:         string   // BUY | SELL | BUY TO OPEN | SELL TO CLOSE | BUY TO CLOSE | SELL TO OPEN
  Quantity:     string   // can be negative for spread legs
  Price:        string
  Commission:   string
  'Net Amount': string   // negative = cash out (buy), positive = cash in (sell)
}

interface OpenLeg {
  datetime:   string
  quantity:   number
  price:      number
  netAmount:  number
  commission: number
  id:         string    // Date+Time+Symbol for broker_trade_id
  assetClass: AssetClass
}

function mapAssetClass(type: string): AssetClass {
  switch (type.toUpperCase()) {
    case 'STOCK':  return 'stocks'
    case 'OPTION': return 'options'
    case 'FUTURE': return 'futures'
    case 'FOREX':  return 'forex'
    default:       return 'other'
  }
}

function parseTOSDate(date: string, time: string): string {
  return new Date(`${date}T${time}`).toISOString()
}

// Classify side into one of 4 actions
type SideAction = 'buy_open' | 'sell_open' | 'sell_close' | 'buy_close' | 'unknown'

function classifySide(side: string): SideAction {
  const s = side.toUpperCase().trim()
  if (s === 'BUY TO OPEN' || s === 'BUY')             return 'buy_open'
  if (s === 'SELL TO OPEN')                             return 'sell_open'
  if (s === 'SELL TO CLOSE' || s === 'SELL')           return 'sell_close'
  if (s === 'BUY TO CLOSE')                             return 'buy_close'
  return 'unknown'
}

export function parseThinkorswimCSV(rawCsv: string): { trades: ParsedTrade[]; errors: string[] } {
  const errors: string[] = []

  const result = Papa.parse<TOSRow>(rawCsv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim(),
    transform: v => v.trim(),
  })

  // Sort chronologically
  const rows = result.data
    .filter(r => r.Symbol && r.Side)
    .sort((a, b) => {
      const ta = new Date(`${a.Date}T${a.Time}`).getTime()
      const tb = new Date(`${b.Date}T${b.Time}`).getTime()
      return ta - tb
    })

  // Group by symbol
  const bySymbol = new Map<string, TOSRow[]>()
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
      const rawQty    = parseFloat(row.Quantity)
      const qty       = Math.abs(rawQty)           // absolute — use Side for direction
      const price     = parseFloat(row.Price)
      const netAmount = parseFloat(row['Net Amount'])
      const comm      = Math.abs(parseFloat(row.Commission) || 0)
      const action    = classifySide(row.Side)
      const assetClass = mapAssetClass(row.Type)
      const datetime  = `${row.Date}T${row.Time}`
      const legId     = `TOS-${row.Date}-${row.Time}-${symbol}`.replace(/\s/g, '')

      if (isNaN(qty) || isNaN(price) || isNaN(netAmount)) {
        errors.push(`Row ${i + 2} (${symbol}): invalid numeric fields`)
        return
      }
      if (action === 'unknown') {
        errors.push(`Row ${i + 2} (${symbol}): unknown side "${row.Side}" — skipped`)
        return
      }

      if (action === 'buy_open') {
        // Opening a long position
        // But first check if there's an open short to close
        if (openShorts.length > 0 && row.Side.toUpperCase() === 'BUY') {
          const entry = openShorts.shift()!
          const pnl   = entry.netAmount + netAmount
          trades.push(buildTrade(entry, { datetime, price, netAmount, commission: comm, assetClass }, qty, 'short', symbol, pnl, legId))
        } else {
          openLongs.push({ datetime, quantity: qty, price, netAmount, commission: comm, id: legId, assetClass })
        }

      } else if (action === 'sell_close') {
        if (openLongs.length > 0) {
          const entry = openLongs.shift()!
          const pnl   = entry.netAmount + netAmount
          trades.push(buildTrade(entry, { datetime, price, netAmount, commission: comm, assetClass }, qty, 'long', symbol, pnl, legId))
        } else {
          // Plain SELL with no open long → treat as short open
          openShorts.push({ datetime, quantity: qty, price, netAmount, commission: comm, id: legId, assetClass })
        }

      } else if (action === 'sell_open') {
        openShorts.push({ datetime, quantity: qty, price, netAmount, commission: comm, id: legId, assetClass })

      } else if (action === 'buy_close') {
        if (openShorts.length > 0) {
          const entry = openShorts.shift()!
          const pnl   = entry.netAmount + netAmount
          trades.push(buildTrade(entry, { datetime, price, netAmount, commission: comm, assetClass }, qty, 'short', symbol, pnl, legId))
        } else {
          errors.push(`Row ${i + 2} (${symbol}): BUY TO CLOSE with no open short — skipped`)
        }
      }
    })

    if (openLongs.length > 0 || openShorts.length > 0) {
      errors.push(`${symbol}: ${openLongs.length + openShorts.length} open position(s) skipped`)
    }
  })

  return { trades, errors }
}

function buildTrade(
  entry: OpenLeg,
  exit:  { datetime: string; price: number; netAmount: number; commission: number; assetClass: AssetClass },
  qty:   number,
  direction: 'long' | 'short',
  symbol: string,
  pnl:   number,
  exitId: string,
): ParsedTrade {
  return {
    broker_trade_id: entry.id,
    symbol,
    direction,
    asset_class:     entry.assetClass,
    quantity:        qty,
    entry_price:     entry.price,
    exit_price:      exit.price,
    entry_at:        parseTOSDate(entry.datetime.split('T')[0], entry.datetime.split('T')[1]),
    exit_at:         parseTOSDate(exit.datetime.split('T')[0], exit.datetime.split('T')[1]),
    pnl:             Math.round(pnl * 100) / 100,
    commission:      entry.commission + exit.commission,
    stop_loss:       null,
    status:          'closed',
    point_value:     1,
    broker_id:       'thinkorswim',
  }
}
