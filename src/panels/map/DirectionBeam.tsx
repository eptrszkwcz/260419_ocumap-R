import { useId } from 'react'

type DirectionBeamProps = {
  directionDeg: number
  className?: string
  interactive?: boolean
  onPointerDown?: (e: React.PointerEvent) => void
}

const BEAM_LENGTH = 48
const BEAM_SPREAD_DEG = 70
const HALF_SPREAD = BEAM_SPREAD_DEG / 2

/** Blue flashlight wedge indicating viewing direction (0° = up, clockwise). */
export function effectiveViewDirectionDeg(baseDeg: number, offsetDeg: number): number {
  return ((baseDeg + offsetDeg) % 360 + 360) % 360
}

export function DirectionBeam({
  directionDeg,
  className,
  interactive = false,
  onPointerDown,
}: DirectionBeamProps) {
  const gradientId = `direction-beam-${useId().replace(/:/g, '')}`
  const halfRad = (HALF_SPREAD * Math.PI) / 180
  const tipX = BEAM_LENGTH * Math.sin(halfRad)
  const tipY = -BEAM_LENGTH * Math.cos(halfRad)
  const pathD = `M 0 0 L ${-tipX} ${tipY} A ${BEAM_LENGTH} ${BEAM_LENGTH} 0 0 1 ${tipX} ${tipY} Z`

  return (
    <svg
      className={className}
      width={BEAM_LENGTH * 2}
      height={BEAM_LENGTH * 2}
      viewBox={`${-BEAM_LENGTH} ${-BEAM_LENGTH} ${BEAM_LENGTH * 2} ${BEAM_LENGTH * 2}`}
      aria-hidden
      style={{
        transform: `rotate(${directionDeg}deg)`,
        transformOrigin: 'center center',
        pointerEvents: interactive ? 'auto' : 'none',
        cursor: interactive ? 'grab' : undefined,
        overflow: 'visible',
      }}
      onPointerDown={interactive ? onPointerDown : undefined}
    >
      <defs>
        <radialGradient
          id={gradientId}
          cx="0"
          cy="0"
          r={BEAM_LENGTH}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
          <stop offset="55%" stopColor="#3b82f6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
        </radialGradient>
      </defs>
      <path d={pathD} fill={`url(#${gradientId})`} />
    </svg>
  )
}
