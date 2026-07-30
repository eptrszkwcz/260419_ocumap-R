import { useState } from 'react'

import { MARKER_FLOW_RESIZE_HANDLE_HIT_PX } from '@/panels/map/mapOverlayLayout'

type MapMarkerResizeHandleProps = {
  onDrag: (clientY: number) => void
  onNudge?: (deltaPx: number) => void
  onDragEnd?: () => void
}

export { MARKER_FLOW_RESIZE_HANDLE_HIT_PX }

/**
 * Horizontal splitter between map and marker panels; subtle at rest, stronger on hover / drag.
 */
export function MapMarkerResizeHandle({ onDrag, onNudge, onDragEnd }: MapMarkerResizeHandleProps) {
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)

  const active = hovered || dragging

  return (
    <div
      className="relative z-10 box-border flex w-full shrink-0 cursor-row-resize touch-none flex-col justify-center bg-page outline-none select-none"
      style={{ height: MARKER_FLOW_RESIZE_HANDLE_HIT_PX }}
      role="separator"
      aria-orientation="horizontal"
      aria-label="Resize map and marker panels"
      tabIndex={0}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={(e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) setHovered(false)
      }}
      onPointerDown={(e) => {
        if (e.button !== 0) return
        e.preventDefault()
        const target = e.currentTarget
        target.setPointerCapture(e.pointerId)
        setDragging(true)
        onDrag(e.clientY)
      }}
      onPointerMove={(e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
        onDrag(e.clientY)
      }}
      onPointerUp={(e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
        try {
          e.currentTarget.releasePointerCapture(e.pointerId)
        } catch {
          /* ignore */
        }
        setDragging(false)
        onDragEnd?.()
      }}
      onPointerCancel={(e) => {
        try {
          e.currentTarget.releasePointerCapture(e.pointerId)
        } catch {
          /* ignore */
        }
        setDragging(false)
        onDragEnd?.()
      }}
      onKeyDown={(e) => {
        if (onNudge == null) return
        const step = e.shiftKey ? 32 : 8
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          onNudge(-step)
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          onNudge(step)
        }
      }}
    >
      <div className="relative flex w-full justify-center">
        <div
          className={
            'pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-full bg-stroke transition-[height,opacity,background-color] duration-150 ' +
            (active ? 'h-0.5 opacity-100 bg-fg-muted' : 'h-px opacity-[0.35]')
          }
          aria-hidden
        />
      </div>
    </div>
  )
}
