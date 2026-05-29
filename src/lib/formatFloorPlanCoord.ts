export function formatFloorPlanCoord(n: number | undefined): string {
  if (n == null || !Number.isFinite(n)) return ''
  return n.toFixed(3)
}
