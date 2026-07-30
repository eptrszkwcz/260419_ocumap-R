import { DEFAULT_MARKER_COLOR, normalizeMarkerColor } from '@/panels/map/markerColors'

const VIEWBOX_SIZE = 32
export const CROSSHAIR_TARGET_MARKER_SIZE = VIEWBOX_SIZE
/** 25% smaller than media overlay markers — used on map and floor plan. */
export const MAP_CROSSHAIR_TARGET_MARKER_SIZE = VIEWBOX_SIZE * 0.75
const VIEWBOX_CENTER = VIEWBOX_SIZE / 2
const CIRCLE_RADIUS = 7
const STROKE_WIDTH = 2.5
const OUTLINE_COLOR = '#ffffff'
const OUTLINE_STROKE_WIDTH = STROKE_WIDTH + 3
/** Original arm length was 14 (2→30 from center 16); shortened by 20%. */
const CROSSHAIR_ARM = 14 * 0.8
const CROSSHAIR_MIN = VIEWBOX_CENTER - CROSSHAIR_ARM
const CROSSHAIR_MAX = VIEWBOX_CENTER + CROSSHAIR_ARM

export type CrosshairTargetMarkerProps = {
  color?: string
  size?: number
  className?: string
}

export function crosshairTargetMarkerColor(
  color: string | undefined,
  isPreliminary?: boolean,
): string {
  if (isPreliminary) return DEFAULT_MARKER_COLOR
  return normalizeMarkerColor(color)
}

function crosshairTargetMarkerShapes(color: string, strokeWidth: number): string {
  return `<circle cx="${VIEWBOX_CENTER}" cy="${VIEWBOX_CENTER}" r="${CIRCLE_RADIUS}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" />
  <line x1="${VIEWBOX_CENTER}" y1="${CROSSHAIR_MIN}" x2="${VIEWBOX_CENTER}" y2="${CROSSHAIR_MAX}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" />
  <line x1="${CROSSHAIR_MIN}" y1="${VIEWBOX_CENTER}" x2="${CROSSHAIR_MAX}" y2="${VIEWBOX_CENTER}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" />`
}

export function crosshairTargetMarkerSvgMarkup(
  color: string,
  size = VIEWBOX_SIZE,
): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  ${crosshairTargetMarkerShapes(OUTLINE_COLOR, OUTLINE_STROKE_WIDTH)}
  ${crosshairTargetMarkerShapes(color, STROKE_WIDTH)}
</svg>`
}

export function createCrosshairTargetMarkerElement(
  color: string,
  options?: { size?: number; cursor?: string },
): HTMLDivElement {
  const size = options?.size ?? VIEWBOX_SIZE
  const el = document.createElement('div')
  el.style.width = `${size}px`
  el.style.height = `${size}px`
  el.style.cursor = options?.cursor ?? 'grab'
  el.innerHTML = crosshairTargetMarkerSvgMarkup(color, size)
  return el
}

export function CrosshairTargetMarker({
  color = DEFAULT_MARKER_COLOR,
  size = VIEWBOX_SIZE,
  className,
}: CrosshairTargetMarkerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      className={className}
      aria-hidden
    >
      <circle
        cx={VIEWBOX_CENTER}
        cy={VIEWBOX_CENTER}
        r={CIRCLE_RADIUS}
        fill="none"
        stroke={OUTLINE_COLOR}
        strokeWidth={OUTLINE_STROKE_WIDTH}
      />
      <line
        x1={VIEWBOX_CENTER}
        y1={CROSSHAIR_MIN}
        x2={VIEWBOX_CENTER}
        y2={CROSSHAIR_MAX}
        stroke={OUTLINE_COLOR}
        strokeWidth={OUTLINE_STROKE_WIDTH}
        strokeLinecap="round"
      />
      <line
        x1={CROSSHAIR_MIN}
        y1={VIEWBOX_CENTER}
        x2={CROSSHAIR_MAX}
        y2={VIEWBOX_CENTER}
        stroke={OUTLINE_COLOR}
        strokeWidth={OUTLINE_STROKE_WIDTH}
        strokeLinecap="round"
      />
      <circle
        cx={VIEWBOX_CENTER}
        cy={VIEWBOX_CENTER}
        r={CIRCLE_RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
      />
      <line
        x1={VIEWBOX_CENTER}
        y1={CROSSHAIR_MIN}
        x2={VIEWBOX_CENTER}
        y2={CROSSHAIR_MAX}
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
      />
      <line
        x1={CROSSHAIR_MIN}
        y1={VIEWBOX_CENTER}
        x2={CROSSHAIR_MAX}
        y2={VIEWBOX_CENTER}
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
      />
    </svg>
  )
}
