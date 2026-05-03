/** Human-readable file size (e.g. 2.4 MB). */
export function formatBytes(bytes: number, fractionDigits = 1): string {
  if (bytes < 0 || !Number.isFinite(bytes)) return '—'
  if (bytes === 0) return '0 B'
  const k = 1024
  const units = ['B', 'KB', 'MB', 'GB'] as const
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    units.length - 1,
  )
  const n = bytes / k ** i
  const rounded = n >= 10 || i === 0 ? Math.round(n) : Number(n.toFixed(fractionDigits))
  return `${rounded} ${units[i]}`
}
