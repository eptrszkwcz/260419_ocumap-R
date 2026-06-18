/** Screen-up = 0°, clockwise — matches DirectionBeam convention. */
export function directionDegFromPointer(
  originX: number,
  originY: number,
  pointerX: number,
  pointerY: number,
): number {
  const dx = pointerX - originX
  const dy = pointerY - originY
  const rad = Math.atan2(dx, -dy)
  return ((rad * 180) / Math.PI + 360) % 360
}

/** Horizontal offset (%) for a narrow pano slice centered on referenceDirectionDeg. */
export function panoramaThumbnailOffsetPercent(referenceDirectionDeg: number): number {
  const normalized = ((referenceDirectionDeg % 360) + 360) % 360
  return (normalized / 360) * 100
}
