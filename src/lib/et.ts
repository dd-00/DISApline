const TZ = 'America/New_York'

// Current ET time formatted for a datetime-local input
export function nowET(): string {
  return dateToETInput(new Date())
}

// Date → "YYYY-MM-DDTHH:MM" in ET
export function dateToETInput(date: Date): string {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
  const p = f.formatToParts(date)
  const v = (t: string) => p.find(x => x.type === t)?.value ?? '00'
  const h = v('hour') === '24' ? '00' : v('hour')
  return `${v('year')}-${v('month')}-${v('day')}T${h}:${v('minute')}`
}

// ET offset in hours (-5 EST, -4 EDT)
function etOffset(date: Date): number {
  const s = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, timeZoneName: 'shortOffset',
  }).format(date)
  const m = s.match(/GMT([+-])(\d+)/)
  if (!m) return -5
  return (m[1] === '+' ? 1 : -1) * parseInt(m[2])
}

// "YYYY-MM-DDTHH:MM" (entered as ET) → UTC ISO string for storage
export function etInputToISO(etStr: string): string {
  if (!etStr) return new Date().toISOString()
  const ref = new Date(etStr + ':00Z')          // parse as UTC for reference
  const off = etOffset(ref)                      // get ET offset at that moment
  return new Date(ref.getTime() - off * 3_600_000).toISOString()
}

// ISO string → ET display string
export function formatET(iso: string, style: 'date' | 'short' | 'datetime' = 'datetime'): string {
  const d = new Date(iso)
  if (style === 'date')
    return new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'short', day: 'numeric', year: 'numeric' }).format(d)
  if (style === 'short')
    return new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'short', day: 'numeric' }).format(d)
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(d) + ' ET'
}

// ET hour (0-23) from ISO string
export function getETHour(iso: string): number {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', hour12: false })
    .formatToParts(new Date(iso))
  const h = parseInt(p.find(x => x.type === 'hour')?.value ?? '0', 10)
  return h === 24 ? 0 : h
}

// ET minute (0-59) from ISO string
export function getETMinute(iso: string): number {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: TZ, minute: 'numeric' })
    .formatToParts(new Date(iso))
  return parseInt(p.find(x => x.type === 'minute')?.value ?? '0', 10)
}

// ET day of week (0=Sun … 6=Sat) from ISO string
export function getETDayOfWeek(iso: string): number {
  const day = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(new Date(iso))
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day)
}

// Session classification (all times in ET)
// Asia:   18:00 – 02:59 ET
// London: 03:00 – 09:29 ET
// US:     09:30 – 16:59 ET
export function getSession(iso: string): 'Asia' | 'London' | 'US' | null {
  const h = getETHour(iso)
  const m = getETMinute(iso)
  if (h >= 18 || h <= 2) return 'Asia'
  if (h >= 3 && (h < 9 || (h === 9 && m < 30))) return 'London'
  if ((h === 9 && m >= 30) || (h >= 10 && h <= 16)) return 'US'
  return null   // 17:00–17:59 ET gap between sessions
}
