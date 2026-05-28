import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import type { FloorPlanMarker } from '@/context/MapCaptureMarkersContext'
import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import { useFloorPlanLocationPick } from '@/context/FloorPlanLocationPickContext'
import type { FloorPlanId } from '@/panels/map/mapFloorPlans'
import { markerRgba } from '@/panels/map/markerColors'

const MIN_SCALE = 0.25
const MAX_SCALE = 8
const FIT_VIEW_PADDING_PX = 56
const FOCUS_SCALE_MULTIPLIER = 2.8
const VIEW_ANIMATION_MS = 700

const DEFAULT_FILL_OPACITY = 0.32
const DIM_OPACITY = 0.35
const HIGHLIGHT_FILL_OPACITY = 1
const MARKER_DIAMETER_PX = 12

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

function focusViewOnMarker(
  containerW: number,
  containerH: number,
  imageW: number,
  imageH: number,
  marker: { x: number; y: number },
  fitScale: number,
): ViewState {
  const scale = clamp(fitScale * FOCUS_SCALE_MULTIPLIER, MIN_SCALE, MAX_SCALE)
  const mx = marker.x * imageW
  const my = marker.y * imageH
  return {
    scale,
    panX: containerW / 2 - mx * scale,
    panY: containerH / 2 - my * scale,
  }
}

type FloorPlanCaptureMarkerProps = {
  marker: FloorPlanMarker
  linkedFeatureId: string | null
  openedFeatureId: string | null
  locationPickActive: boolean
  onEnter: (id: string) => void
  onLeave: () => void
  onSelect: (id: string) => void
}

function FloorPlanCaptureMarker({
  marker,
  linkedFeatureId,
  openedFeatureId,
  locationPickActive,
  onEnter,
  onLeave,
  onSelect,
}: FloorPlanCaptureMarkerProps) {
  const isOpened = openedFeatureId === marker.id
  const isLinked = linkedFeatureId === marker.id
  const hasOpenFocus = openedFeatureId != null
  const hasHoverFocus = linkedFeatureId != null && openedFeatureId == null

  let fillOpacity = DEFAULT_FILL_OPACITY
  let strokeOpacity = 1

  if (hasOpenFocus) {
    fillOpacity = isOpened ? HIGHLIGHT_FILL_OPACITY : DIM_OPACITY
    strokeOpacity = isOpened ? 1 : DIM_OPACITY
  } else if (hasHoverFocus) {
    fillOpacity = isLinked ? HIGHLIGHT_FILL_OPACITY : DIM_OPACITY
    strokeOpacity = isLinked ? 1 : DIM_OPACITY
  }

  return (
    <button
      type="button"
      data-floor-marker
      className="absolute z-10 block rounded-full border-2 p-0 transition-opacity duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-highlight/40"
      style={{
        left: `${marker.x * 100}%`,
        top: `${marker.y * 100}%`,
        width: MARKER_DIAMETER_PX,
        height: MARKER_DIAMETER_PX,
        transform: 'translate(-50%, -50%)',
        borderColor: markerRgba(marker.strokeColor, strokeOpacity),
        backgroundColor: markerRgba(marker.color, fillOpacity),
        cursor: locationPickActive ? 'crosshair' : 'pointer',
        pointerEvents: locationPickActive ? 'none' : 'auto',
      }}
      aria-label={`Feature capture point ${marker.id}`}
      onMouseEnter={() => onEnter(marker.id)}
      onMouseLeave={onLeave}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(marker.id)
      }}
    />
  )
}

type MapFloorPlanViewerProps = {
  floorPlanSrc: string
  floorPlanLabel: string
  floorPlanId: FloorPlanId
  floorMarkers: FloorPlanMarker[]
}

function MapFloorPlanViewer({
  floorPlanSrc,
  floorPlanLabel,
  floorPlanId,
  floorMarkers,
}: MapFloorPlanViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)
  const [view, setView] = useState<ViewState>({ scale: 1, panX: 0, panY: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const prevOpenedFeatureIdRef = useRef<string | null | undefined>(undefined)
  const dragRef = useRef<DragRef>({
    active: false,
    startX: 0,
    startY: 0,
    origPanX: 0,
    origPanY: 0,
  })

  const {
    linkedFeatureId,
    openedFeatureId,
    setMapHoveredFeatureId,
    setOpenedFeatureId,
    openFeatureFromMap,
  } = useFeatureMapHover()

  const {
    isPickingFloorPlanLocation,
    reportFloorPlanLocationPick,
    cancelFloorPlanLocationPick,
  } = useFloorPlanLocationPick()

  const applyView = (next: ViewState) => {
    setView(next)
  }

  const containerSize = () => {
    const el = containerRef.current
    if (el == null) return null
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) return null
    return { w: r.width, h: r.height }
  }

  useEffect(() => {
    setNaturalSize(null)
    setView({ scale: 1, panX: 0, panY: 0 })
  }, [floorPlanSrc])

  useLayoutEffect(() => {
    if (naturalSize == null) return
    const el = containerRef.current
    if (el == null) return

    const runFit = () => {
      const size = containerSize()
      if (size == null || naturalSize == null) return false
      applyView(
        fitViewToImage(size.w, size.h, naturalSize.w, naturalSize.h, FIT_VIEW_PADDING_PX),
      )
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
    if (naturalSize == null) return
    const size = containerSize()
    if (size == null) return

    const prevOpened = prevOpenedFeatureIdRef.current
    prevOpenedFeatureIdRef.current = openedFeatureId

    if (prevOpened === undefined) return

    if (openedFeatureId != null) {
      const marker = floorMarkers.find((m) => m.id === openedFeatureId)
      if (marker != null) {
        const fit = fitViewToImage(
          size.w,
          size.h,
          naturalSize.w,
          naturalSize.h,
          FIT_VIEW_PADDING_PX,
        )
        applyView(
          focusViewOnMarker(size.w, size.h, naturalSize.w, naturalSize.h, marker, fit.scale),
        )
      }
      return
    }

    if (prevOpened != null) {
      applyView(
        fitViewToImage(size.w, size.h, naturalSize.w, naturalSize.h, FIT_VIEW_PADDING_PX),
      )
    }
  }, [openedFeatureId, floorMarkers, naturalSize])

  useEffect(() => {
    if (!isPickingFloorPlanLocation) return

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault()
        cancelFloorPlanLocationPick()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isPickingFloorPlanLocation, cancelFloorPlanLocationPick])

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
    if (isPickingFloorPlanLocation) return
    if (e.button !== 0) return
    if ((e.target as HTMLElement).closest('[data-floor-marker]')) return
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

  const onMarkerSelect = (id: string) => {
    setOpenedFeatureId(id)
    openFeatureFromMap(id)
    if (naturalSize == null) return
    const size = containerSize()
    const marker = floorMarkers.find((m) => m.id === id)
    if (size == null || marker == null) return
    const fit = fitViewToImage(
      size.w,
      size.h,
      naturalSize.w,
      naturalSize.h,
      FIT_VIEW_PADDING_PX,
    )
    applyView(focusViewOnMarker(size.w, size.h, naturalSize.w, naturalSize.h, marker, fit.scale))
  }

  const onPlanClick = (e: React.MouseEvent) => {
    if (!isPickingFloorPlanLocation || naturalSize == null) return
    const el = containerRef.current
    if (el == null) return
    const rect = el.getBoundingClientRect()
    const localX = e.clientX - rect.left
    const localY = e.clientY - rect.top
    const ix = (localX - view.panX) / view.scale
    const iy = (localY - view.panY) / view.scale
    if (ix < 0 || iy < 0 || ix > naturalSize.w || iy > naturalSize.h) return
    reportFloorPlanLocationPick(floorPlanId, ix / naturalSize.w, iy / naturalSize.h)
  }

  const { scale, panX, panY } = view
  const nw = naturalSize?.w
  const nh = naturalSize?.h

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      <div
        ref={containerRef}
        className={
          'relative min-h-0 w-full min-w-0 flex-1 touch-none overflow-hidden bg-panel select-none ' +
          (isPickingFloorPlanLocation
            ? 'cursor-crosshair'
            : isDragging
              ? 'cursor-grabbing'
              : 'cursor-grab')
        }
        role="region"
        aria-label="Floor plan"
        onClick={onPlanClick}
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
          transition: isDragging ? 'none' : `transform ${VIEW_ANIMATION_MS}ms ease`,
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
        {naturalSize != null
          ? floorMarkers.map((marker) => (
              <FloorPlanCaptureMarker
                key={marker.id}
                marker={marker}
                linkedFeatureId={linkedFeatureId}
                openedFeatureId={openedFeatureId}
                locationPickActive={isPickingFloorPlanLocation}
                onEnter={setMapHoveredFeatureId}
                onLeave={() => setMapHoveredFeatureId(null)}
                onSelect={onMarkerSelect}
              />
            ))
          : null}
      </div>
      </div>
      {isPickingFloorPlanLocation ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-panel-padding"
          role="status"
          aria-live="polite"
        >
          <div className="max-w-md rounded-panel border border-stroke bg-panel/95 px-3 py-2 text-center font-sans text-standard text-fg shadow-sm backdrop-blur-sm">
            Click the floor plan to set where this photo was taken. Press Esc to cancel.
          </div>
        </div>
      ) : null}
    </div>
  )
}

type MapContentProps = {
  activeTab: string
  floorPlanSrc: string
  floorPlanLabel: string
  floorPlanId: FloorPlanId
  floorPlanMarkers: FloorPlanMarker[]
}

export function MapContent({
  activeTab,
  floorPlanSrc,
  floorPlanLabel,
  floorPlanId,
  floorPlanMarkers,
}: MapContentProps) {
  const floorMarkers = floorPlanMarkers.filter((m) => m.floorPlanId === floorPlanId)

  if (activeTab !== '2d') {
    return (
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden bg-panel" role="region" aria-label="3D point cloud" />
    )
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <MapFloorPlanViewer
        floorPlanSrc={floorPlanSrc}
        floorPlanLabel={floorPlanLabel}
        floorPlanId={floorPlanId}
        floorMarkers={floorMarkers}
      />
    </div>
  )
}
