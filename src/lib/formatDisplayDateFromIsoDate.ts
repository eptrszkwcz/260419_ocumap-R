/**
 * `YYYY-MM-DD` (from `<input type="date">`) → long form used in the feature table, e.g. "July 22, 2025".
 */
export function formatDisplayDateFromIsoDate(isoDate: string): string {
  if (!isoDate.trim()) return ''
  const d = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Long-form locale dates (e.g. "July 22, 2025"), ISO `YYYY-MM-DD`, or other strings
 * `Date` can parse → `YYYY-MM-DD` for `<input type="date">`. Returns "" if unknown.
 */
export function parseToIsoDate(input: string): string {
  const t = input.trim()
  if (!t) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t
  const d = new Date(t.includes('T') ? t : `${t}T12:00:00`)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}
