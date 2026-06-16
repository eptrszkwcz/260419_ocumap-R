import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import type { FloorPlanMarker } from '@/context/MapCaptureMarkersContext'
import { useFeatureDraw } from '@/context/FeatureDrawContext'
import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import { useFloorPlanLocationPick } from '@/context/FloorPlanLocationPickContext'
import { useMarkerStylePreview } from '@/context/MarkerStylePreviewContext'
import type { FloorPlanDrawnGeometry } from '@/panels/library/assetGeometryHelpers'
import { FeatureDrawConfirmPanel } from '@/panels/map/FeatureDrawConfirmPanel'
import { FEATURE_DRAW_INSTRUCTION } from '@/panels/map/featureDrawUtils'
import { MapOverlayControlBar } from '@/panels/map/MapOverlayControlBar'
import type { FloorPlanId } from '@/panels/map/mapFloorPlans'
import {
  mapOverlayInsetBottomClassName,
  mapOverlayInsetXClassName,
} from '@/panels/map/mapOverlayLayout'
import { markerColorsFromAsset, markerRgba } from '@/panels/map/markerColors'

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
  floorDrawnGeometries: FloorPlanDrawnGeometry[]
}

function FloorPlanDrawnGeometryLayer({
  geometries,
  naturalSize,
  linkedFeatureId,
  openedFeatureId,
  hoverEnabled,
  onEnter,
  onLeave,
}: {
  geometries: FloorPlanDrawnGeometry[]
  naturalSize: { w: number; h: number }
  linkedFeatureId: string | null
  openedFeatureId: string | null
  hoverEnabled: boolean
  onEnter: (id: string) => void
  onLeave: () => void
}) {
  const { w, h } = naturalSize
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[5] h-full w-full overflow-visible"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      {geometries.map((g) => {
        const isOpened = openedFeatureId === g.id
        const isLinked = linkedFeatureId === g.id
        const hasOpenFocus = openedFeatureId != null
        const hasHoverFocus = linkedFeatureId != null && openedFeatureId == null
        let opacity = 0.55
        if (hasOpenFocus) opacity = isOpened ? 0.85 : 0.2
        else if (hasHoverFocus) opacity = isLinked ? 0.85 : 0.25

        const points = g.coordinates.map((c) => `${c.x * w},${c.y * h}`).join(' ')
        const hoverHandlers = hoverEnabled
          ? {
              pointerEvents: 'all' as const,
              style: { cursor: 'pointer' },
              onMouseEnter: () => onEnter(g.id),
              onMouseLeave: onLeave,
              onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
            }
          : { pointerEvents: 'none' as const }

        if (g.geometryType === 'polygon') {
          return (
            <polygon
              key={g.id}
              points={points}
              fill={markerRgba(g.color, opacity * 0.35)}
              stroke={markerRgba(g.strokeColor, opacity)}
              strokeWidth={2}
              {...hoverHandlers}
            />
          )
        }
        return (
          <g key={g.id}>
            {hoverEnabled ? (
              <polyline
                points={points}
                fill="none"
                stroke="transparent"
                strokeWidth={12}
                pointerEvents="stroke"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => onEnter(g.id)}
                onMouseLeave={onLeave}
                onPointerDown={(e) => e.stopPropagation()}
              />
            ) : null}
            <polyline
              points={points}
              fill="none"
              stroke={markerRgba(g.strokeColor, opacity)}
              strokeWidth={2}
              pointerEvents="none"
            />
          </g>
        )
      })}
    </svg>
  )
}

function FloorPlanDrawPreview({
  vertices,
  geometryType,
  naturalSize,
  color,
  strokeColor,
}: {
  vertices: { x: number; y: number }[]
  geometryType: 'point' | 'line' | 'polygon' | null
  naturalSize: { w: number; h: number }
  color: string
  strokeColor: string
}) {
  if (vertices.length === 0) return null
  const { w, h } = naturalSize
  const points = vertices.map((v) => `${v.x * w},${v.y * h}`).join(' ')

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[6] h-full w-full overflow-visible"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      {geometryType === 'polygon' && vertices.length >= 3 ? (
        <polygon
          points={points}
          fill={markerRgba(color, 0.25)}
          stroke={markerRgba(strokeColor, 0.9)}
          strokeWidth={2}
        />
      ) : vertices.length >= 2 ? (
        <polyline
          points={points}
          fill="none"
          stroke={markerRgba(strokeColor, 0.9)}
          strokeWidth={2}
        />
      ) : null}
      {vertices.map((v, i) => (
        <circle
          key={i}
          cx={v.x * w}
          cy={v.y * h}
          r={6}
          fill={markerRgba(color, 0.9)}
          stroke={markerRgba(strokeColor, 1)}
          strokeWidth={2}
        />
      ))}
    </svg>
  )
}

function FloorPlanVertexHandles({
  mode,
  vertices,
  geometryType,
  naturalSize,
  view,
  containerRef,
  color,
  strokeColor,
  onMoveVertex,
  onClosePolygon,
  onVertexDragEnd,
}: {
  mode: 'edit' | 'collecting'
  vertices: { x: number; y: number }[]
  geometryType?: 'point' | 'line' | 'polygon' | null
  naturalSize: { w: number; h: number }
  view: ViewState
  containerRef: React.RefObject<HTMLDivElement | null>
  color: string
  strokeColor: string
  onMoveVertex: (index: number, x: number, y: number) => void
  onClosePolygon?: () => void
  onVertexDragEnd?: (index: number, previous: { x: number; y: number }) => void
}) {
  const dragIndexRef = useRef<number | null>(null)
  const dragMovedRef = useRef(false)
  const dragStartVertexRef = useRef<{ index: number; vertex: { x: number; y: number } } | null>(
    null,
  )
  const canClosePolygon =
    mode === 'collecting' && vertices.length >= 3 && geometryType === 'line'

  const vertexFromClient = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current
      if (el == null) return null
      const rect = el.getBoundingClientRect()
      const localX = clientX - rect.left
      const localY = clientY - rect.top
      const ix = (localX - view.panX) / view.scale
      const iy = (localY - view.panY) / view.scale
      if (ix < 0 || iy < 0 || ix > naturalSize.w || iy > naturalSize.h) return null
      return {
        x: clamp(ix / naturalSize.w, 0, 1),
        y: clamp(iy / naturalSize.h, 0, 1),
      }
    },
    [containerRef, naturalSize.h, naturalSize.w, view.panX, view.panY, view.scale],
  )

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const idx = dragIndexRef.current
      if (idx == null) return
      dragMovedRef.current = true
      const coords = vertexFromClient(e.clientX, e.clientY)
      if (coords == null) return
      onMoveVertex(idx, coords.x, coords.y)
    }

    const onUp = () => {
      if (dragIndexRef.current != null && dragMovedRef.current) {
        const start = dragStartVertexRef.current
        if (start != null) {
          onVertexDragEnd?.(start.index, start.vertex)
        }
      }
      dragIndexRef.current = null
      dragMovedRef.current = false
      dragStartVertexRef.current = null
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [onMoveVertex, onVertexDragEnd, vertexFromClient])

  const { w, h } = naturalSize

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[7] h-full w-full overflow-visible"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      {vertices.map((v, i) => {
        if (mode === 'collecting' && i === 0 && !canClosePolygon) {
          return null
        }

        const isCloseHandle = mode === 'collecting' && i === 0 && canClosePolygon
        const radius = isCloseHandle ? 10 : 8

        return (
          <circle
            key={i}
            cx={v.x * w}
            cy={v.y * h}
            r={radius}
            className={
              isCloseHandle
                ? 'pointer-events-auto cursor-pointer'
                : 'pointer-events-auto cursor-grab active:cursor-grabbing'
            }
            fill={markerRgba(color, isCloseHandle ? 0.85 : 0.95)}
            stroke={markerRgba(strokeColor, 1)}
            strokeWidth={isCloseHandle ? 2 : 2}
            strokeDasharray={isCloseHandle ? '4 3' : undefined}
            aria-label={isCloseHandle ? 'Close polygon' : undefined}
            onPointerDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (isCloseHandle) return
              dragMovedRef.current = false
              dragStartVertexRef.current = { index: i, vertex: { x: v.x, y: v.y } }
              dragIndexRef.current = i
              ;(e.currentTarget as SVGCircleElement).setPointerCapture(e.pointerId)
            }}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (isCloseHandle) {
                onClosePolygon?.()
              }
            }}
          />
        )
      })}
    </svg>
  )
}

function MapFloorPlanViewer({
  floorPlanSrc,
  floorPlanLabel,
  floorPlanId,
  floorMarkers,
  floorDrawnGeometries,
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
  const suppressPlanClickRef = useRef(false)

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

  const {
    isDrawing,
    isEditingFeature,
    editingFeatureId,
    drawPhase,
    floorPlanVertices,
    geometryType,
    draftMarkerColor,
    addFloorPlanVertex,
    closePolygon,
    cancelDraw,
    cancelEditFeature,
    requestEditConfirm,
    redrawGeometry,
    updateFloorPlanVertex,
    recordDrawVertexMove,
  } = useFeatureDraw()

  const { markerStylePreview } = useMarkerStylePreview()
  const previewColor = markerStylePreview?.color ?? draftMarkerColor
  const { fill: previewFill, stroke: previewStroke } = markerColorsFromAsset(previewColor)

  const isEditingThisFeature =
    isEditingFeature && editingFeatureId != null && editingFeatureId === openedFeatureId
  const isCollectingGeometry =
    (isDrawing && (drawPhase === 'collecting' || drawPhase === 'awaitingConfirm')) ||
    (isEditingFeature && drawPhase === 'collecting')
  const showDrawPreview =
    (isDrawing || isEditingFeature) && floorPlanVertices.length > 0 && drawPhase !== 'idle'
  const interactionLocked =
    isPickingFloorPlanLocation || isDrawing || (isEditingFeature && drawPhase === 'collecting')

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
    if (!isPickingFloorPlanLocation && !isDrawing && !isEditingFeature) return

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault()
        if (isEditingFeature) {
          cancelEditFeature()
        } else if (isDrawing) {
          cancelDraw()
        } else {
          cancelFloorPlanLocationPick()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    isPickingFloorPlanLocation,
    isDrawing,
    isEditingFeature,
    cancelDraw,
    cancelEditFeature,
    cancelFloorPlanLocationPick,
  ])

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
    if (interactionLocked) return
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

  const planCoordsFromEvent = (e: React.MouseEvent) => {
    if (naturalSize == null) return null
    const el = containerRef.current
    if (el == null) return null
    const rect = el.getBoundingClientRect()
    const localX = e.clientX - rect.left
    const localY = e.clientY - rect.top
    const ix = (localX - view.panX) / view.scale
    const iy = (localY - view.panY) / view.scale
    if (ix < 0 || iy < 0 || ix > naturalSize.w || iy > naturalSize.h) return null
    return {
      x: ix / naturalSize.w,
      y: iy / naturalSize.h,
      ix,
      iy,
    }
  }

  const onPlanClick = (e: React.MouseEvent) => {
    if (isPickingFloorPlanLocation) {
      const coords = planCoordsFromEvent(e)
      if (coords == null) return
      reportFloorPlanLocationPick(floorPlanId, coords.x, coords.y)
      return
    }

    if (!isCollectingGeometry || naturalSize == null) {
      return
    }
    if (e.detail > 1) return
    if (suppressPlanClickRef.current) {
      suppressPlanClickRef.current = false
      return
    }

    const coords = planCoordsFromEvent(e)
    if (coords == null) return

    addFloorPlanVertex(floorPlanId, coords.x, coords.y)
  }

  const visibleDrawnGeometries = floorDrawnGeometries.filter((g) => {
    if (g.floorPlanId !== floorPlanId) return false
    if (isEditingThisFeature && g.id === editingFeatureId) return false
    return true
  })
  const visibleFloorMarkers = floorMarkers.filter(
    (m) => !(isEditingThisFeature && m.id === editingFeatureId),
  )

  const { scale, panX, panY } = view
  const nw = naturalSize?.w
  const nh = naturalSize?.h

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      <div
        ref={containerRef}
        className={
          'relative min-h-0 w-full min-w-0 flex-1 touch-none overflow-hidden bg-panel select-none ' +
          (interactionLocked
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
        {naturalSize != null ? (
          <>
            <FloorPlanDrawnGeometryLayer
              geometries={visibleDrawnGeometries}
              naturalSize={naturalSize}
              linkedFeatureId={linkedFeatureId}
              openedFeatureId={openedFeatureId}
              hoverEnabled={!interactionLocked}
              onEnter={setMapHoveredFeatureId}
              onLeave={() => setMapHoveredFeatureId(null)}
            />
            {showDrawPreview ? (
              <FloorPlanDrawPreview
                vertices={floorPlanVertices}
                geometryType={geometryType}
                naturalSize={naturalSize}
                color={previewFill}
                strokeColor={previewStroke}
              />
            ) : null}
            {isEditingThisFeature && drawPhase === 'editing' ? (
              <FloorPlanVertexHandles
                mode="edit"
                vertices={floorPlanVertices}
                naturalSize={naturalSize}
                view={view}
                containerRef={containerRef}
                color={previewFill}
                strokeColor={previewStroke}
                onMoveVertex={updateFloorPlanVertex}
              />
            ) : null}
            {isDrawing && drawPhase === 'collecting' && geometryType !== 'polygon' && floorPlanVertices.length > 0 ? (
              <FloorPlanVertexHandles
                mode="collecting"
                vertices={floorPlanVertices}
                geometryType={geometryType}
                naturalSize={naturalSize}
                view={view}
                containerRef={containerRef}
                color={previewFill}
                strokeColor={previewStroke}
                onMoveVertex={updateFloorPlanVertex}
                onClosePolygon={closePolygon}
                onVertexDragEnd={(index, previous) => {
                  suppressPlanClickRef.current = true
                  recordDrawVertexMove('floorPlan', index, previous)
                }}
              />
            ) : null}
          </>
        ) : null}
        {naturalSize != null
          ? visibleFloorMarkers.map((marker) => (
              <FloorPlanCaptureMarker
                key={marker.id}
                marker={marker}
                linkedFeatureId={linkedFeatureId}
                openedFeatureId={openedFeatureId}
                locationPickActive={interactionLocked}
                onEnter={setMapHoveredFeatureId}
                onLeave={() => setMapHoveredFeatureId(null)}
                onSelect={onMarkerSelect}
              />
            ))
          : null}
      </div>
      </div>
      <MapOverlayControlBar floorPlanId={floorPlanId} />
      <FeatureDrawConfirmPanel />
      {isPickingFloorPlanLocation ? (
        <div
          className={
            'pointer-events-none absolute z-20 flex justify-center ' +
            mapOverlayInsetXClassName +
            ' ' +
            mapOverlayInsetBottomClassName
          }
          role="status"
          aria-live="polite"
        >
          <div className="max-w-md rounded-panel bg-fg-highlight px-3 py-2 text-center font-sans text-standard text-white shadow-sm">
            Click the floor plan to set where this photo was taken. Press Esc to cancel.
          </div>
        </div>
      ) : isEditingThisFeature && drawPhase === 'editing' ? (
        <div
          className={
            'pointer-events-none absolute z-20 flex justify-center ' +
            mapOverlayInsetXClassName +
            ' ' +
            mapOverlayInsetBottomClassName
          }
          role="status"
          aria-live="polite"
        >
          <div className="pointer-events-auto flex max-w-xl flex-wrap items-center justify-center gap-2 rounded-panel bg-fg-highlight px-3 py-2 text-center font-sans text-standard text-white shadow-sm">
            <span>
              Drag vertices to move. Click Review changes when done, or Redraw to start over. Esc to
              cancel.
            </span>
            <button
              type="button"
              onClick={requestEditConfirm}
              className="rounded-panel bg-white px-3 py-1 font-sans text-standard text-fg-highlight transition-colors hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
            >
              Review changes
            </button>
            <button
              type="button"
              onClick={redrawGeometry}
              className="rounded-panel border border-white/60 px-3 py-1 font-sans text-standard text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
            >
              Redraw
            </button>
          </div>
        </div>
      ) : isCollectingGeometry ? (
        <div
          className={
            'pointer-events-none absolute z-20 flex justify-center ' +
            mapOverlayInsetXClassName +
            ' ' +
            mapOverlayInsetBottomClassName
          }
          role="status"
          aria-live="polite"
        >
          <div className="max-w-lg rounded-panel bg-fg-highlight px-3 py-2 text-center font-sans text-standard text-white shadow-sm">
            {FEATURE_DRAW_INSTRUCTION}
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
  floorDrawnGeometries: FloorPlanDrawnGeometry[]
}

export function MapContent({
  activeTab,
  floorPlanSrc,
  floorPlanLabel,
  floorPlanId,
  floorPlanMarkers,
  floorDrawnGeometries,
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
        floorDrawnGeometries={floorDrawnGeometries}
      />
    </div>
  )
}
