/** Default fill for capture points on map and floor plan. */
export const DEFAULT_MARKER_COLOR = '#2563eb'

/** OcuMap brand orange — matches `--color-ocumap-orange` in `index.css`. */
export const OCUMAP_ORANGE = '#f97316'

/** Orange fill for preliminary media annotation markers before confirm. */
export const PRELIMINARY_MARKER_COLOR = OCUMAP_ORANGE

/** Preset swatches shown in the marker color picker popover. */
export const PRESET_MARKER_COLORS = [
  '#3a4abf', // OcuMap blue
  OCUMAP_ORANGE, // OcuMap orange
  '#6b7c3e', // Olive green
  '#dc2626', // Red
  '#9333ea', // Purple
  '#0d9488', // Teal
  '#db2777', // Pink
] as const

export function normalizeMarkerColor(value: string | undefined): string {
  if (value == null) return DEFAULT_MARKER_COLOR
  const v = value.trim()
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) return v.toLowerCase()
  if (/^#[0-9A-Fa-f]{3}$/.test(v)) {
    const r = v[1]
    const g = v[2]
    const b = v[3]
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return DEFAULT_MARKER_COLOR
}

export function markerStrokeColor(fillHex: string): string {
  const hex = normalizeMarkerColor(fillHex).replace('#', '')
  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)
  const factor = 0.82
  const dr = Math.round(r * factor)
  const dg = Math.round(g * factor)
  const db = Math.round(b * factor)
  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`
}

export function markerColorsFromAsset(color: string | undefined): { fill: string; stroke: string } {
  const fill = normalizeMarkerColor(color)
  return { fill, stroke: markerStrokeColor(fill) }
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = normalizeMarkerColor(hex).replace('#', '')
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  }
}

export function markerRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
