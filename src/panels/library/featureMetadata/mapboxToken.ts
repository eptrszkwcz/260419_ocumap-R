export function mapboxTokenPresent(): boolean {
  const t = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
  return typeof t === 'string' && t.trim() !== ''
}
