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
