import { useRef, useState, type ReactNode } from 'react'

import { publishedMiniPanelClassName } from '@/panels/map/mapOverlayLayout'

const RESIZE_HANDLE_HIT_PX = 20
const RESIZE_TRIANGLE_PX = 18

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}

type PublishedMiniPanelProps = {
  width: number
  height: number
  maxWidth: number
  maxHeight: number
  minWidth: number
  minHeight: number
  onResize: (size: { width: number; height: number }) => void
  onResizeEnd?: () => void
  children: ReactNode
}

export function PublishedMiniPanel({
  width,
  height,
  maxWidth,
  maxHeight,
  minWidth,
  minHeight,
  onResize,
  onResizeEnd,
  children,
}: PublishedMiniPanelProps) {
  const [dragging, setDragging] = useState(false)
  const [hovered, setHovered] = useState(false)
  const dragStartRef = useRef<{
    pointerX: number
    pointerY: number
    width: number
    height: number
  } | null>(null)

  const effectiveMaxWidth = Math.max(minWidth, maxWidth)
  const effectiveMaxHeight = Math.max(minHeight, maxHeight)
  const handleHighlighted = hovered || dragging

  return (
    <div
      className={'relative flex min-h-0 flex-col ' + publishedMiniPanelClassName}
      style={{ width, height }}
    >
      {children}
      <div
        className="absolute top-0 right-0 z-10 cursor-nesw-resize touch-none select-none"
        style={{ width: RESIZE_HANDLE_HIT_PX, height: RESIZE_HANDLE_HIT_PX }}
        role="separator"
        aria-label="Resize map preview"
        aria-valuenow={width}
        aria-valuemin={minWidth}
        aria-valuemax={effectiveMaxWidth}
        tabIndex={0}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={(e) => {
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) setHovered(false)
        }}
        onPointerDown={(e) => {
          if (e.button !== 0) return
          e.preventDefault()
          e.stopPropagation()
          const target = e.currentTarget
          target.setPointerCapture(e.pointerId)
          dragStartRef.current = {
            pointerX: e.clientX,
            pointerY: e.clientY,
            width,
            height,
          }
          setDragging(true)
        }}
        onPointerMove={(e) => {
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
          const start = dragStartRef.current
          if (start == null) return
          const deltaX = e.clientX - start.pointerX
          const deltaY = e.clientY - start.pointerY
          onResize({
            width: clamp(minWidth, start.width + deltaX, effectiveMaxWidth),
            height: clamp(minHeight, start.height - deltaY, effectiveMaxHeight),
          })
        }}
        onPointerUp={(e) => {
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
          try {
            e.currentTarget.releasePointerCapture(e.pointerId)
          } catch {
            /* ignore */
          }
          dragStartRef.current = null
          setDragging(false)
          setHovered(false)
          onResizeEnd?.()
        }}
        onPointerCancel={(e) => {
          try {
            e.currentTarget.releasePointerCapture(e.pointerId)
          } catch {
            /* ignore */
          }
          dragStartRef.current = null
          setDragging(false)
          setHovered(false)
          onResizeEnd?.()
        }}
      >
        <svg
          className="pointer-events-none absolute top-0 right-0"
          width={RESIZE_TRIANGLE_PX}
          height={RESIZE_TRIANGLE_PX}
          viewBox={`0 0 ${RESIZE_TRIANGLE_PX} ${RESIZE_TRIANGLE_PX}`}
          aria-hidden
        >
          <path
            d={`M ${RESIZE_TRIANGLE_PX} 0 L ${RESIZE_TRIANGLE_PX} ${RESIZE_TRIANGLE_PX} L 0 0 Z`}
            className={
              'stroke-fg-highlight transition-[fill,opacity] duration-150 ' +
              (handleHighlighted ? 'fill-fg-highlight/90' : 'fill-fg-highlight')
            }
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  )
}
