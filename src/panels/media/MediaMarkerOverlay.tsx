import { useCallback, useEffect, useRef } from 'react'

import {
  CrosshairTargetMarker,
  crosshairTargetMarkerColor,
} from '@/components/CrosshairTargetMarker'
import type { MediaMarkerDraft } from '@/context/MediaMarkerFlowContext'

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

  const markerColor = crosshairTargetMarkerColor(draft.color, draft.isPreliminary)

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
        cursor: draggable ? 'grab' : 'default',
      }}
      onPointerDown={handlePointerDown}
      aria-hidden
    >
      <CrosshairTargetMarker color={markerColor} />
    </div>
  )
}

export const MEDIA_MARKER_PLACEMENT_INSTRUCTION =
  'Click on the media to place a marker at the desired location. Press Esc to cancel.'
