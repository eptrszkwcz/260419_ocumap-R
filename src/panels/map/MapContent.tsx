import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import {
  CrosshairTargetMarker,
  crosshairTargetMarkerColor,
  MAP_CROSSHAIR_TARGET_MARKER_SIZE,
} from '@/components/CrosshairTargetMarker'
import type { FloorPlanMarker } from '@/context/MapCaptureMarkersContext'
import { useFeatureDraw } from '@/context/FeatureDrawContext'
import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import { useFloorPlanLocationPick } from '@/context/FloorPlanLocationPickContext'
import { useMediaMarkerFlow } from '@/context/MediaMarkerFlowContext'
import { useMarkerStylePreview } from '@/context/MarkerStylePreviewContext'
import { useViewDirectionAdjust } from '@/context/ViewDirectionAdjustContext'
import { usePrefersHover } from '@/hooks/usePrefersHover'
import type { FloorPlanDrawnGeometry } from '@/panels/library/assetGeometryHelpers'
import { FeatureDrawConfirmPanel } from '@/panels/map/FeatureDrawConfirmPanel'
import { FeatureMapHoverPopup } from '@/panels/map/FeatureMapHoverPopup'
import { featureHoverInfoFromFloorPlanData } from '@/panels/map/featureHoverDisplay'
import { FEATURE_DRAW_INSTRUCTION } from '@/panels/map/featureDrawUtils'
import { MapOverlayControlBar } from '@/panels/map/MapOverlayControlBar'
import type { FloorPlanId } from '@/panels/map/mapFloorPlans'
import {
  mapOverlayInsetBottomClassName,
  mapOverlayInsetXClassName,
} from '@/panels/map/mapOverlayLayout'
import { markerColorsFromAsset, markerRgba } from '@/panels/map/markerColors'
import { MEDIA_MARKER_DRAFT_ID } from '@/panels/map/mergeMediaMarkerPreview'
import { DirectionAdjustBanner } from '@/panels/map/DirectionAdjustBanner'
import { DirectionAdjustMarkerOverlay } from '@/panels/map/DirectionAdjustMarkerOverlay'
import { DirectionBeam, effectiveViewDirectionDeg } from '@/panels/map/DirectionBeam'

const MIN_SCALE = 0.25
const MAX_SCALE = 8
const FIT_VIEW_PADDING_PX = 56
const FOCUS_SCALE_MULTIPLIER = 2.8
/** Minimum bbox span (image px) when fitting lines/polygons so zero-height boxes still zoom sensibly. */
const MIN_FOCUS_BBOX_SPAN_PX = 48
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
    panX: Math.round((containerW - imageW * scale) / 2),
    panY: Math.round((containerH - imageH * scale) / 2),
  }
}

function maxFocusScale(fitScale: number): number {
  return clamp(fitScale * FOCUS_SCALE_MULTIPLIER, MIN_SCALE, MAX_SCALE)
}

function focusViewOnMarker(
  containerW: number,
  containerH: number,
  imageW: number,
  imageH: number,
  marker: { x: number; y: number },
  fitScale: number,
): ViewState {
  const scale = maxFocusScale(fitScale)
  const mx = marker.x * imageW
  const my = marker.y * imageH
  return {
    scale,
    panX: containerW / 2 - mx * scale,
    panY: containerH / 2 - my * scale,
  }
}

function focusViewOnGeometry(
  containerW: number,
  containerH: number,
  imageW: number,
  imageH: number,
  coordinates: { x: number; y: number }[],
  fitScale: number,
  padding: number = FIT_VIEW_PADDING_PX,
): ViewState {
  if (coordinates.length === 0) {
    return fitViewToImage(containerW, containerH, imageW, imageH, padding)
  }
  if (coordinates.length === 1) {
    return focusViewOnMarker(containerW, containerH, imageW, imageH, coordinates[0], fitScale)
  }

  const xs = coordinates.map((c) => c.x * imageW)
  const ys = coordinates.map((c) => c.y * imageH)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const bboxW = Math.max(maxX - minX, MIN_FOCUS_BBOX_SPAN_PX)
  const bboxH = Math.max(maxY - minY, MIN_FOCUS_BBOX_SPAN_PX)

  const innerW = containerW - padding * 2
  const innerH = containerH - padding * 2
  const fitToBboxScale =
    innerW > 0 && innerH > 0
      ? Math.min(innerW / bboxW, innerH / bboxH)
      : fitScale
  const scale = clamp(fitToBboxScale, MIN_SCALE, maxFocusScale(fitScale))

  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  return {
    scale,
    panX: containerW / 2 - cx * scale,
    panY: containerH / 2 - cy * scale,
  }
}

type FloorPlanCaptureMarkerProps = {
  marker: FloorPlanMarker
  linkedFeatureId: string | null
  openedFeatureId: string | null
  locationPickActive: boolean
  onEnter: (id: string, clientX: number, clientY: number) => void
  onLeave: () => void
  onSelect: (id: string, clientX: number, clientY: number) => void
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
  const { viewDirectionBaseDeg, viewDirectionLiveOffsetDeg } = useFeatureMapHover()
  const { isAdjustingDirection, adjustingFeatureId } = useViewDirectionAdjust()
  const isOpened = openedFeatureId === marker.id
  const isDirectionAdjustTarget = isAdjustingDirection && adjustingFeatureId === marker.id
  const isLinked = linkedFeatureId === marker.id
  const hasOpenFocus = openedFeatureId != null
  const hasHoverFocus = linkedFeatureId != null && openedFeatureId == null
  const showDirectionBeam =
    isOpened &&
    viewDirectionBaseDeg != null &&
    (marker.kind === 'image' || marker.kind === 'panorama') &&
    !isDirectionAdjustTarget
  const directionDeg =
    viewDirectionBaseDeg != null
      ? effectiveViewDirectionDeg(viewDirectionBaseDeg, viewDirectionLiveOffsetDeg)
      : 0

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
    <div
      className="absolute z-10 overflow-visible"
      style={{
        left: `${marker.x * 100}%`,
        top: `${marker.y * 100}%`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: locationPickActive && !isDirectionAdjustTarget ? 'none' : 'auto',
      }}
      onMouseEnter={(e) => {
        if (!locationPickActive && !isDirectionAdjustTarget) {
          onEnter(marker.id, e.clientX, e.clientY)
        }
      }}
      onMouseLeave={onLeave}
    >
      {isDirectionAdjustTarget ? <DirectionAdjustMarkerOverlay /> : null}
      {showDirectionBeam ? (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-0"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <DirectionBeam directionDeg={directionDeg} />
        </div>
      ) : null}
      <button
        type="button"
        data-floor-marker
        className="relative z-10 block rounded-full border-2 p-0 transition-opacity duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-highlight/40"
        style={{
          width: MARKER_DIAMETER_PX,
          height: MARKER_DIAMETER_PX,
          borderColor: markerRgba(marker.strokeColor, strokeOpacity),
          backgroundColor: markerRgba(marker.color, fillOpacity),
          cursor: locationPickActive ? 'crosshair' : 'pointer',
        }}
        aria-label={`Feature capture point ${marker.id}`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          if (locationPickActive || isDirectionAdjustTarget) return
          onSelect(marker.id, e.clientX, e.clientY)
        }}
      />
    </div>
  )
}

type MapFloorPlanViewerProps = {
  floorPlanSrc: string
  floorPlanLabel: string
  floorPlanId: FloorPlanId
  floorMarkers: FloorPlanMarker[]
  floorDrawnGeometries: FloorPlanDrawnGeometry[]
  readOnly?: boolean
  /** Bumped when the published map container changes size (e.g. full vs mini layout). */
  viewResizeToken?: number
}

function FloorPlanDrawnGeometryLayer({
  geometries,
  naturalSize,
  linkedFeatureId,
  openedFeatureId,
  hoverEnabled,
  onEnter,
  onLeave,
  onSelect,
}: {
  geometries: FloorPlanDrawnGeometry[]
  naturalSize: { w: number; h: number }
  linkedFeatureId: string | null
  openedFeatureId: string | null
  hoverEnabled: boolean
  onEnter: (id: string, clientX: number, clientY: number) => void
  onLeave: () => void
  onSelect: (id: string, clientX: number, clientY: number) => void
}) {
  const { w, h } = naturalSize
  const enter = (id: string, e: React.MouseEvent) => onEnter(id, e.clientX, e.clientY)
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
              onMouseEnter: (e: React.MouseEvent) => enter(g.id, e),
              onMouseLeave: onLeave,
              onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation()
                onSelect(g.id, e.clientX, e.clientY)
              },
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
                onMouseEnter={(e) => enter(g.id, e)}
                onMouseLeave={onLeave}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(g.id, e.clientX, e.clientY)
                }}
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
  readOnly = false,
  viewResizeToken = 0,
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
  const draftMarkerDragRef = useRef(false)

  const {
    mapHoveredFeatureId,
    linkedFeatureId,
    openedFeatureId,
    setMapHoveredFeatureId,
    setOpenedFeatureId,
    openFeatureFromMap,
  } = useFeatureMapHover()
  const prefersHover = usePrefersHover()

  const [hoverAnchor, setHoverAnchor] = useState<{ clientX: number; clientY: number } | null>(null)

  const hoverLookup = useMemo(
    () => featureHoverInfoFromFloorPlanData(floorMarkers, floorDrawnGeometries),
    [floorMarkers, floorDrawnGeometries],
  )

  const handleMapFeatureEnter = useCallback(
    (id: string, clientX: number, clientY: number) => {
      if (!prefersHover) return
      setMapHoveredFeatureId(id)
      setHoverAnchor({ clientX, clientY })
    },
    [prefersHover, setMapHoveredFeatureId],
  )

  const handleMapFeatureLeave = useCallback(() => {
    if (!prefersHover) return
    setMapHoveredFeatureId(null)
    setHoverAnchor(null)
  }, [prefersHover, setMapHoveredFeatureId])

  useEffect(() => {
    if (mapHoveredFeatureId == null) setHoverAnchor(null)
  }, [mapHoveredFeatureId])

  const {
    isPickingFloorPlanLocation,
    reportFloorPlanLocationPick,
    cancelFloorPlanLocationPick,
  } = useFloorPlanLocationPick()

  const {
    isAdjustingMediaMarker,
    draftMarker,
    updateDraftMarker,
    parentAssetId,
    cancelFlow: cancelMediaMarkerFlow,
    requestCloseMarkerPanel,
  } = useMediaMarkerFlow()

  const { isAdjustingDirection, cancelDirectionAdjust } = useViewDirectionAdjust()

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
    isPickingFloorPlanLocation ||
    isAdjustingDirection ||
    isDrawing ||
    isAdjustingMediaMarker ||
    (isEditingFeature && drawPhase === 'collecting')

  const applyView = (next: ViewState) => {
    const rounded: ViewState = {
      scale: Math.round(next.scale * 1e6) / 1e6,
      panX: Math.round(next.panX),
      panY: Math.round(next.panY),
    }
    setView((prev) => {
      if (
        prev.scale === rounded.scale &&
        prev.panX === rounded.panX &&
        prev.panY === rounded.panY
      ) {
        return prev
      }
      return rounded
    })
  }

  const containerSize = () => {
    const el = containerRef.current
    if (el == null) return null
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) return null
    return { w: r.width, h: r.height }
  }

  const applyViewForContext = useCallback(
    (featureId?: string | null) => {
      if (naturalSize == null) return false
      const size = containerSize()
      if (size == null) return false

      const targetId = featureId !== undefined ? featureId : openedFeatureId
      const fit = fitViewToImage(
        size.w,
        size.h,
        naturalSize.w,
        naturalSize.h,
        FIT_VIEW_PADDING_PX,
      )

      if (targetId != null) {
        const marker = floorMarkers.find((m) => m.id === targetId)
        const geometry = floorDrawnGeometries.find(
          (g) => g.id === targetId && g.floorPlanId === floorPlanId,
        )
        if (
          isAdjustingMediaMarker &&
          draftMarker?.floorPlanPosition != null &&
          draftMarker.floorPlanPosition.floorPlanId === floorPlanId &&
          parentAssetId === targetId &&
          marker != null
        ) {
          applyView(
            focusViewOnGeometry(
              size.w,
              size.h,
              naturalSize.w,
              naturalSize.h,
              [
                { x: marker.x, y: marker.y },
                {
                  x: draftMarker.floorPlanPosition.x,
                  y: draftMarker.floorPlanPosition.y,
                },
              ],
              fit.scale,
            ),
          )
          return true
        }
        if (marker != null) {
          applyView(
            focusViewOnMarker(size.w, size.h, naturalSize.w, naturalSize.h, marker, fit.scale),
          )
          return true
        }
        if (geometry != null) {
          applyView(
            focusViewOnGeometry(
              size.w,
              size.h,
              naturalSize.w,
              naturalSize.h,
              geometry.coordinates,
              fit.scale,
            ),
          )
          return true
        }
      }

      applyView(fit)
      return true
    },
    [openedFeatureId, floorMarkers, floorDrawnGeometries, floorPlanId, naturalSize, isAdjustingMediaMarker, draftMarker, parentAssetId],
  )

  const applyViewForContextRef = useRef(applyViewForContext)
  applyViewForContextRef.current = applyViewForContext

  useEffect(() => {
    setNaturalSize(null)
    setView({ scale: 1, panX: 0, panY: 0 })
  }, [floorPlanSrc])

  useLayoutEffect(() => {
    if (naturalSize == null) return
    const el = containerRef.current
    if (el == null) return

    const apply = () => {
      applyViewForContextRef.current()
    }

    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [naturalSize, floorPlanSrc])

  useEffect(() => {
    if (naturalSize == null) return

    const prevOpened = prevOpenedFeatureIdRef.current
    prevOpenedFeatureIdRef.current = openedFeatureId

    if (prevOpened === undefined) return

    if (openedFeatureId != null || prevOpened != null) {
      applyViewForContext()
    }
  }, [openedFeatureId, naturalSize, applyViewForContext])

  useEffect(() => {
    if (viewResizeToken === 0) return
    applyViewForContext()
  }, [viewResizeToken, applyViewForContext])

  useEffect(() => {
    if (!isPickingFloorPlanLocation && !isAdjustingDirection && !isDrawing && !isEditingFeature && !isAdjustingMediaMarker) return

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault()
        if (isAdjustingMediaMarker) {
          requestCloseMarkerPanel()
        } else if (isAdjustingDirection) {
          cancelDirectionAdjust()
        } else if (isEditingFeature) {
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
    isAdjustingDirection,
    isAdjustingMediaMarker,
    isDrawing,
    isEditingFeature,
    cancelMediaMarkerFlow,
    requestCloseMarkerPanel,
    cancelDirectionAdjust,
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
    if (mapHoveredFeatureId != null) {
      setHoverAnchor({ clientX: e.clientX, clientY: e.clientY })
    }
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

  const focusOpenedFeature = (featureId: string) => {
    applyViewForContext(featureId)
  }

  const onFeatureSelect = (id: string, clientX: number, clientY: number) => {
    if (!prefersHover) {
      setMapHoveredFeatureId(id)
      setHoverAnchor({ clientX, clientY })
      return
    }
    setOpenedFeatureId(id)
    openFeatureFromMap(id)
    focusOpenedFeature(id)
  }

  const openFeatureFromTouchPreview = () => {
    if (mapHoveredFeatureId == null) return
    const id = mapHoveredFeatureId
    setOpenedFeatureId(id)
    openFeatureFromMap(id)
    focusOpenedFeature(id)
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
      if (!prefersHover) {
        setMapHoveredFeatureId(null)
        setHoverAnchor(null)
      }
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
    (m) =>
      !(isEditingThisFeature && m.id === editingFeatureId) && m.id !== MEDIA_MARKER_DRAFT_ID,
  )

  const draftFloorMarker =
    isAdjustingMediaMarker &&
    draftMarker?.floorPlanPosition != null &&
    draftMarker.floorPlanPosition.floorPlanId === floorPlanId
      ? draftMarker
      : null
  const draftMediaMarkerColor = crosshairTargetMarkerColor(
    draftFloorMarker?.color,
    draftFloorMarker?.isPreliminary,
  )

  useEffect(() => {
    if (!isAdjustingMediaMarker) return
    applyViewForContext(openedFeatureId)
  }, [isAdjustingMediaMarker, viewResizeToken, applyViewForContext, openedFeatureId])

  useEffect(() => {
    if (!isAdjustingMediaMarker || draftFloorMarker?.floorPlanPosition == null) return

    const onPointerMove = (e: PointerEvent) => {
      if (!draftMarkerDragRef.current) return
      const el = containerRef.current
      if (el == null || naturalSize == null) return
      const rect = el.getBoundingClientRect()
      const localX = e.clientX - rect.left
      const localY = e.clientY - rect.top
      const ix = (localX - view.panX) / view.scale
      const iy = (localY - view.panY) / view.scale
      if (ix < 0 || iy < 0 || ix > naturalSize.w || iy > naturalSize.h) return
      updateDraftMarker({
        floorPlanPosition: {
          floorPlanId,
          x: ix / naturalSize.w,
          y: iy / naturalSize.h,
        },
      })
    }

    const onPointerUp = () => {
      draftMarkerDragRef.current = false
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [
    draftFloorMarker?.floorPlanPosition,
    floorPlanId,
    isAdjustingMediaMarker,
    naturalSize,
    updateDraftMarker,
    view.panX,
    view.panY,
    view.scale,
  ])

  const { scale, panX, panY } = view
  const showHoverPopup =
    !interactionLocked &&
    mapHoveredFeatureId != null &&
    openedFeatureId == null &&
    hoverAnchor != null

  const hoverPopupContent =
    mapHoveredFeatureId != null ? hoverLookup.get(mapHoveredFeatureId) : undefined

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
              onEnter={handleMapFeatureEnter}
              onLeave={handleMapFeatureLeave}
              onSelect={onFeatureSelect}
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
                locationPickActive={isPickingFloorPlanLocation}
                onEnter={handleMapFeatureEnter}
                onLeave={handleMapFeatureLeave}
                onSelect={onFeatureSelect}
              />
            ))
          : null}
        {draftFloorMarker?.floorPlanPosition != null ? (
          <div
            className="absolute z-20 overflow-visible"
            style={{
              left: `${draftFloorMarker.floorPlanPosition.x * 100}%`,
              top: `${draftFloorMarker.floorPlanPosition.y * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <button
              type="button"
              data-floor-marker
              className="block cursor-grab border-0 bg-transparent p-0"
              aria-label="Adjust marker location"
              onPointerDown={(e) => {
                e.stopPropagation()
                draftMarkerDragRef.current = true
                ;(e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId)
              }}
            >
              <CrosshairTargetMarker
                color={draftMediaMarkerColor}
                size={MAP_CROSSHAIR_TARGET_MARKER_SIZE}
              />
            </button>
          </div>
        ) : null}
      </div>
      </div>
      <MapOverlayControlBar floorPlanId={floorPlanId} readOnly={readOnly} />
      <FeatureDrawConfirmPanel />
      {isAdjustingDirection ? (
        <DirectionAdjustBanner />
      ) : isPickingFloorPlanLocation ? (
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
              className="cursor-pointer rounded-panel bg-white px-3 py-1 font-sans text-standard text-fg-highlight transition-colors hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
            >
              Review changes
            </button>
            <button
              type="button"
              onClick={redrawGeometry}
              className="cursor-pointer rounded-panel border border-white/60 px-3 py-1 font-sans text-standard text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
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
      {showHoverPopup && hoverAnchor != null ? (
        <FeatureMapHoverPopup
          title={hoverPopupContent?.title ?? ''}
          typeLabel={hoverPopupContent?.typeLabel}
          previewUrl={hoverPopupContent?.previewUrl}
          anchor={hoverAnchor}
          onViewFeature={prefersHover ? undefined : openFeatureFromTouchPreview}
        />
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
  readOnly?: boolean
  viewResizeToken?: number
}

export function MapContent({
  activeTab,
  floorPlanSrc,
  floorPlanLabel,
  floorPlanId,
  floorPlanMarkers,
  floorDrawnGeometries,
  readOnly = false,
  viewResizeToken = 0,
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
        readOnly={readOnly}
        viewResizeToken={viewResizeToken}
      />
    </div>
  )
}
