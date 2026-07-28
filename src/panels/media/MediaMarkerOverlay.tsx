import { useCallback, useEffect, useRef } from 'react'

import type { MediaMarkerDraft } from '@/context/MediaMarkerFlowContext'
import { markerRgba, PRELIMINARY_MARKER_COLOR } from '@/panels/map/markerColors'

const MARKER_SIZE_PX = 20

type MediaMarkerOverlayProps = {
  draft: MediaMarkerDraft
  /** Normalized 0–1 position for flat image */
  mediaPosition?: { x: number; y: number }
  /** Screen position for pano (percent of container) */
  screenPosition?: { xPct: number; yPct: number }
  draggable?: boolean
  onMove?: (position: { x: number; y: number }) => void
  onMoveScreen?: (position: { xPct: number; yPct: number }) => void
}

function CrosshairOverlay({ color }: { color: string }) {
  return (
    <svg
      className="pointer-events-none absolute left-1/2 top-1/2 z-20"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      style={{ transform: 'translate(-50%, -50%)' }}
      aria-hidden
    >
      <line x1="16" y1="4" x2="16" y2="28" stroke={color} strokeWidth="1.5" opacity="0.9" />
      <line x1="4" y1="16" x2="28" y2="16" stroke={color} strokeWidth="1.5" opacity="0.9" />
    </svg>
  )
}

export function MediaMarkerOverlay({
  draft,
  mediaPosition,
  screenPosition,
  draggable = false,
  onMove,
  onMoveScreen,
}: MediaMarkerOverlayProps) {
  const draggingRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const fillColor = draft.isPreliminary ? PRELIMINARY_MARKER_COLOR : (draft.color ?? PRELIMINARY_MARKER_COLOR)
  const strokeColor = fillColor

  const positionStyle =
    mediaPosition != null
      ? {
          left: `${mediaPosition.x * 100}%`,
          top: `${mediaPosition.y * 100}%`,
        }
      : screenPosition != null
        ? {
            left: `${screenPosition.xPct * 100}%`,
            top: `${screenPosition.yPct * 100}%`,
          }
        : { left: '50%', top: '50%' }

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!draggable) return
      e.preventDefault()
      e.stopPropagation()
      draggingRef.current = true
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    [draggable],
  )

  useEffect(() => {
    if (!draggable) return

    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return
      const container = containerRef.current?.parentElement
      if (container == null) return
      const rect = container.getBoundingClientRect()
      const xPct = (e.clientX - rect.left) / rect.width
      const yPct = (e.clientY - rect.top) / rect.height
      const clamped = {
        xPct: Math.min(1, Math.max(0, xPct)),
        yPct: Math.min(1, Math.max(0, yPct)),
      }
      if (onMove != null) {
        onMove({ x: clamped.xPct, y: clamped.yPct })
      }
      onMoveScreen?.(clamped)
    }

    const onPointerUp = () => {
      draggingRef.current = false
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [draggable, onMove, onMoveScreen])

  return (
    <div
      ref={containerRef}
      className="pointer-events-auto absolute z-30"
      style={{
        ...positionStyle,
        transform: 'translate(-50%, -50%)',
      }}
      onPointerDown={handlePointerDown}
    >
      <CrosshairOverlay color={strokeColor} />
      <div
        className="relative z-10 rounded-full border-2"
        style={{
          width: MARKER_SIZE_PX,
          height: MARKER_SIZE_PX,
          borderColor: markerRgba(strokeColor, 1),
          backgroundColor: markerRgba(fillColor, 0.9),
          cursor: draggable ? 'grab' : 'default',
        }}
        aria-hidden
      />
    </div>
  )
}

export const MEDIA_MARKER_PLACEMENT_INSTRUCTION =
  'Click on the media to place a marker at the desired location. Press Esc to cancel.'
