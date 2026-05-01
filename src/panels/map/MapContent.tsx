import { useEffect, useLayoutEffect, useRef, useState } from 'react'

type MapContentProps = {
  activeTab: string
  floorPlanSrc: string
  floorPlanLabel: string
}

const MIN_SCALE = 0.25
const MAX_SCALE = 8
/** Padding from viewer edges so the whole floor plan has space around it when first fitted. */
const FIT_VIEW_PADDING_PX = 56

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}

type ViewState = { scale: number; panX: number; panY: number }

type DragRef = {
  active: boolean
  startX: number
  startY: number
  origPanX: number
  origPanY: number
}

function fitViewToImage(
  containerW: number,
  containerH: number,
  imageW: number,
  imageH: number,
  padding: number,
): ViewState {
  const innerW = containerW - padding * 2
  const innerH = containerH - padding * 2
  if (innerW <= 0 || innerH <= 0 || imageW <= 0 || imageH <= 0) {
    return { scale: 1, panX: 0, panY: 0 }
  }
  const rawScale = Math.min(innerW / imageW, innerH / imageH)
  const scale = clamp(rawScale, MIN_SCALE, MAX_SCALE)
  return {
    scale,
    panX: (containerW - imageW * scale) / 2,
    panY: (containerH - imageH * scale) / 2,
  }
}

function MapFloorPlanViewer({
  floorPlanSrc,
  floorPlanLabel,
}: {
  floorPlanSrc: string
  floorPlanLabel: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)
  const [view, setView] = useState<ViewState>({ scale: 1, panX: 0, panY: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<DragRef>({
    active: false,
    startX: 0,
    startY: 0,
    origPanX: 0,
    origPanY: 0,
  })

  useEffect(() => {
    setNaturalSize(null)
    setView({ scale: 1, panX: 0, panY: 0 })
  }, [floorPlanSrc])

  useLayoutEffect(() => {
    if (naturalSize == null) return
    const el = containerRef.current
    if (el == null) return

    const runFit = () => {
      const r = el.getBoundingClientRect()
      const cw = r.width
      const ch = r.height
      if (cw < 2 || ch < 2) return false
      setView(fitViewToImage(cw, ch, naturalSize.w, naturalSize.h, FIT_VIEW_PADDING_PX))
      return true
    }

    if (runFit()) return

    const ro = new ResizeObserver(() => {
      if (runFit()) ro.disconnect()
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [naturalSize, floorPlanSrc])

  useEffect(() => {
    const el = containerRef.current
    if (el == null) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      const factor = e.deltaY > 0 ? 0.92 : 1.08

      setView((v) => {
        const next = clamp(v.scale * factor, MIN_SCALE, MAX_SCALE)
        if (Math.abs(next - v.scale) < 1e-9) return v
        const cx = (mx - v.panX) / v.scale
        const cy = (my - v.panY) / v.scale
        return { scale: next, panX: mx - cx * next, panY: my - cy * next }
      })
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    setIsDragging(true)
    ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origPanX: view.panX,
      origPanY: view.panY,
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return
    const { startX, startY, origPanX, origPanY } = dragRef.current
    setView((v) => ({
      ...v,
      panX: origPanX + (e.clientX - startX),
      panY: origPanY + (e.clientY - startY),
    }))
  }

  const endDrag = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    setIsDragging(false)
    try {
      ;(e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
  }

  const { scale, panX, panY } = view
  const nw = naturalSize?.w
  const nh = naturalSize?.h

  return (
    <div
      ref={containerRef}
      className={
        'relative min-h-0 w-full min-w-0 flex-1 touch-none overflow-hidden bg-panel select-none ' +
        (isDragging ? 'cursor-grabbing' : 'cursor-grab')
      }
      role="region"
      aria-label="2D map"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={() => {
        dragRef.current.active = false
        setIsDragging(false)
      }}
    >
      <div
        className="will-change-transform"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
          transformOrigin: '0 0',
          width: nw ?? undefined,
          height: nh ?? undefined,
        }}
      >
        <img
          key={floorPlanSrc}
          src={floorPlanSrc}
          alt={`Floor plan ${floorPlanLabel}`}
          width={nw ?? undefined}
          height={nh ?? undefined}
          onLoad={onImageLoad}
          className={
            'pointer-events-none block max-w-none select-none ' +
            (naturalSize ? 'h-auto w-full' : 'h-auto w-full opacity-0')
          }
          decoding="async"
          draggable={false}
        />
      </div>
    </div>
  )
}

export function MapContent({ activeTab, floorPlanSrc, floorPlanLabel }: MapContentProps) {
  if (activeTab !== '2d') {
    return (
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden bg-panel" role="region" aria-label="3D map" />
    )
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <MapFloorPlanViewer floorPlanSrc={floorPlanSrc} floorPlanLabel={floorPlanLabel} />
    </div>
  )
}
