import { useState } from 'react'

type DashboardResizeHandleProps = {
  onDrag: (clientX: number) => void
  onNudge?: (deltaPx: number) => void
  onDragEnd?: () => void
}

/** Hit target width; parent layout must subtract this from the row when computing column widths. */
export const DASHBOARD_RESIZE_HANDLE_HIT_PX = 16

/**
 * Narrow vertical splitter between dashboard columns; subtle at rest, stronger on hover / drag.
 */
export function DashboardResizeHandle({ onDrag, onNudge, onDragEnd }: DashboardResizeHandleProps) {
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)

  const active = hovered || dragging

  return (
    <div
      className="relative z-10 box-border flex h-full min-h-0 shrink-0 cursor-col-resize touch-none flex-col pt-[100px] outline-none select-none"
      style={{ width: DASHBOARD_RESIZE_HANDLE_HIT_PX }}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize library and map columns"
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
        onDrag(e.clientX)
      }}
      onPointerMove={(e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
        onDrag(e.clientX)
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
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          onNudge(-step)
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          onNudge(step)
        }
      }}
    >
      <div className="relative flex min-h-0 flex-1 justify-center">
        <div
          className={
            'pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 rounded-full bg-stroke transition-[width,opacity,background-color] duration-150 ' +
            (active ? 'w-0.5 opacity-100 bg-fg-muted' : 'w-px opacity-[0.35]')
          }
          aria-hidden
        />
      </div>
    </div>
  )
}
