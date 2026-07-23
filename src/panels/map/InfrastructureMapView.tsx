import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'

import type { MapCaptureMarker } from '@/context/MapCaptureMarkersContext'
import { useFeatureDraw } from '@/context/FeatureDrawContext'
import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import { useMapLocationPick } from '@/context/MapLocationPickContext'
import { useMarkerStylePreview } from '@/context/MarkerStylePreviewContext'
import { useViewDirectionAdjust } from '@/context/ViewDirectionAdjustContext'
import type { MapDrawnGeometry } from '@/panels/library/assetGeometryHelpers'
import { DirectionAdjustBanner } from '@/panels/map/DirectionAdjustBanner'
import { DirectionAdjustMarkerOverlay } from '@/panels/map/DirectionAdjustMarkerOverlay'
import { DirectionBeam, effectiveViewDirectionDeg } from '@/panels/map/DirectionBeam'
import { FeatureDrawConfirmPanel } from '@/panels/map/FeatureDrawConfirmPanel'
import { FeatureMapHoverPopup } from '@/panels/map/FeatureMapHoverPopup'
import { featureHoverInfoFromMapData } from '@/panels/map/featureHoverDisplay'
import { FEATURE_DRAW_INSTRUCTION } from '@/panels/map/featureDrawUtils'
import { MapOverlayControlBar } from '@/panels/map/MapOverlayControlBar'
import {
  DRAWN_FILL_LAYER_ID,
  DRAWN_LINE_LAYER_ID,
  resyncAllDrawLayers,
} from '@/panels/map/mapDrawLayers'
import { markerColorsFromAsset, markerRgba } from '@/panels/map/markerColors'
import {
  mapOverlayInsetBottomClassName,
  mapOverlayInsetXClassName,
} from '@/panels/map/mapOverlayLayout'

const CAPTURE_SOURCE_ID = 'ocumap-capture-markers'
const CAPTURE_LAYER_ID = 'ocumap-capture-markers-circle'

function createPolygonCloseMarkerElement(fillColor: string, strokeColor: string): HTMLDivElement {
  const el = document.createElement('div')
  el.style.width = '20px'
  el.style.height = '20px'
  el.style.borderRadius = '50%'
  el.style.backgroundColor = markerRgba(fillColor, 0.85)
  el.style.border = `2px dashed ${markerRgba(strokeColor, 1)}`
  el.style.cursor = 'pointer'
  el.style.boxSizing = 'border-box'
  el.setAttribute('role', 'button')
  el.setAttribute('aria-label', 'Close polygon')
  return el
}

function captureMarkersFeatureCollection(markers: MapCaptureMarker[]) {
  return {
    type: 'FeatureCollection' as const,
    features: markers.map((m) => ({
      type: 'Feature' as const,
      properties: { id: m.id, fillColor: m.color, strokeColor: m.strokeColor },
      geometry: { type: 'Point' as const, coordinates: [m.lng, m.lat] as [number, number] },
    })),
  }
}

const DEFAULT_FILL_OPACITY = 0.32
const DIM_OPACITY = 0.35
const HIGHLIGHT_FILL_OPACITY = 1
const NON_HOVERED_STROKE_OPACITY = 0.6
const FEATURE_FOCUS_MAX_ZOOM = 16
const FIT_ALL_MARKERS_PADDING = 56
const FLY_DURATION_MS = 700

function captureMarkerIdFromFeature(feature: mapboxgl.MapboxGeoJSONFeature | undefined): string | null {
  if (feature == null) return null
  const raw = feature.properties?.id ?? feature.id
  if (raw == null) return null
  return String(raw)
}

function zoomToOpenedFeature(
  map: mapboxgl.Map,
  markers: MapCaptureMarker[],
  geometries: MapDrawnGeometry[],
  featureId: string,
) {
  const marker = markers.find((m) => m.id === featureId)
  if (marker != null) {
    if (map.getMaxZoom() < FEATURE_FOCUS_MAX_ZOOM) {
      map.setMaxZoom(FEATURE_FOCUS_MAX_ZOOM)
    }
    map.flyTo({
      center: [marker.lng, marker.lat],
      zoom: FEATURE_FOCUS_MAX_ZOOM,
      duration: FLY_DURATION_MS,
      essential: true,
    })
    return
  }

  const geometry = geometries.find((g) => g.id === featureId)
  if (geometry == null || geometry.coordinates.length === 0) return

  if (geometry.coordinates.length === 1) {
    const c = geometry.coordinates[0]
    if (map.getMaxZoom() < FEATURE_FOCUS_MAX_ZOOM) {
      map.setMaxZoom(FEATURE_FOCUS_MAX_ZOOM)
    }
    map.flyTo({
      center: [c.lng, c.lat],
      zoom: FEATURE_FOCUS_MAX_ZOOM,
      duration: FLY_DURATION_MS,
      essential: true,
    })
    return
  }

  const first = geometry.coordinates[0]
  const bounds = geometry.coordinates.reduce(
    (b, c) => b.extend([c.lng, c.lat]),
    new mapboxgl.LngLatBounds([first.lng, first.lat], [first.lng, first.lat]),
  )
  map.fitBounds(bounds, {
    padding: FIT_ALL_MARKERS_PADDING,
    maxZoom: FEATURE_FOCUS_MAX_ZOOM,
    duration: FLY_DURATION_MS,
  })
}

function fitAllCaptureMarkers(map: mapboxgl.Map, markers: MapCaptureMarker[]) {
  if (markers.length === 0) return
  if (markers.length === 1) {
    const m = markers[0]
    map.flyTo({
      center: [m.lng, m.lat],
      zoom: Math.min(13, map.getMaxZoom()),
      duration: FLY_DURATION_MS,
    })
    return
  }
  const bounds = markers.reduce(
    (b, m) => b.extend([m.lng, m.lat]),
    new mapboxgl.LngLatBounds([markers[0].lng, markers[0].lat], [markers[0].lng, markers[0].lat]),
  )
  map.fitBounds(bounds, {
    padding: FIT_ALL_MARKERS_PADDING,
    maxZoom: FEATURE_FOCUS_MAX_ZOOM,
    duration: FLY_DURATION_MS,
  })
}

function applyCaptureMarkerPaint(
  map: mapboxgl.Map,
  linkedFeatureId: string | null,
  openedFeatureId: string | null,
) {
  if (!map.getLayer(CAPTURE_LAYER_ID)) return
  try {
    if (openedFeatureId) {
      map.setPaintProperty(CAPTURE_LAYER_ID, 'circle-opacity', [
        'case',
        ['==', ['get', 'id'], openedFeatureId],
        HIGHLIGHT_FILL_OPACITY,
        DIM_OPACITY,
      ])
      map.setPaintProperty(CAPTURE_LAYER_ID, 'circle-stroke-opacity', [
        'case',
        ['==', ['get', 'id'], openedFeatureId],
        1,
        DIM_OPACITY,
      ])
    } else {
      const linkedId = linkedFeatureId ?? ''
      map.setPaintProperty(CAPTURE_LAYER_ID, 'circle-opacity', [
        'case',
        ['==', ['get', 'id'], linkedId],
        HIGHLIGHT_FILL_OPACITY,
        DEFAULT_FILL_OPACITY,
      ])
      if (linkedFeatureId) {
        map.setPaintProperty(CAPTURE_LAYER_ID, 'circle-stroke-opacity', [
          'case',
          ['==', ['get', 'id'], linkedId],
          1,
          NON_HOVERED_STROKE_OPACITY,
        ])
      } else {
        map.setPaintProperty(CAPTURE_LAYER_ID, 'circle-stroke-opacity', 1)
      }
    }
  } catch {
    /* rare: style does not accept paint updates */
  }
}

function syncCaptureMarkersLayer(
  map: mapboxgl.Map,
  markers: MapCaptureMarker[],
  linkedFeatureId: string | null,
  openedFeatureId: string | null,
) {
  const data = captureMarkersFeatureCollection(markers)
  try {
    const existingLayer = map.getLayer(CAPTURE_LAYER_ID)
    const existingSource = map.getSource(CAPTURE_SOURCE_ID)

    if (existingLayer != null && existingSource != null) {
      const src = existingSource as mapboxgl.GeoJSONSource
      src.setData(data)
      map.setPaintProperty(CAPTURE_LAYER_ID, 'circle-color', ['get', 'fillColor'])
      map.setPaintProperty(CAPTURE_LAYER_ID, 'circle-stroke-color', ['get', 'strokeColor'])
      applyCaptureMarkerPaint(map, linkedFeatureId, openedFeatureId)
      return
    }

    if (existingLayer != null) {
      map.removeLayer(CAPTURE_LAYER_ID)
    }
    if (existingSource != null) {
      map.removeSource(CAPTURE_SOURCE_ID)
    }

    map.addSource(CAPTURE_SOURCE_ID, { type: 'geojson', data })
    map.addLayer({
      id: CAPTURE_LAYER_ID,
      type: 'circle',
      source: CAPTURE_SOURCE_ID,
      paint: {
        'circle-radius': 6,
        'circle-color': ['get', 'fillColor'],
        'circle-opacity': 0.32,
        'circle-stroke-width': 2,
        'circle-stroke-color': ['get', 'strokeColor'],
      },
    })
    applyCaptureMarkerPaint(map, linkedFeatureId, openedFeatureId)
  } catch {
    /* style still loading or style does not accept custom layers */
  }
}

type InfrastructureMapViewProps = {
  styleUrl: string
  /** Incremented when column splitter drag ends; triggers an immediate `resize()` after layout. */
  splitCommitToken: number
  /** Feature capture points (WGS84) shown as blue circles on the map. */
  captureMarkers: MapCaptureMarker[]
  mapDrawnGeometries: MapDrawnGeometry[]
  readOnly?: boolean
}

function mapboxAccessToken(): string | undefined {
  const t = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
  if (typeof t !== 'string') return undefined
  const s = t.trim()
  return s === '' ? undefined : s
}

export function InfrastructureMapView({
  styleUrl,
  splitCommitToken,
  captureMarkers,
  mapDrawnGeometries,
  readOnly = false,
}: InfrastructureMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const styleUrlRef = useRef(styleUrl)
  const appliedStyleUrlRef = useRef<string | null>(null)
  const captureMarkersRef = useRef(captureMarkers)
  const linkedFeatureIdRef = useRef<string | null>(null)
  const openedFeatureIdRef = useRef<string | null>(null)
  const prevOpenedFeatureIdRef = useRef<string | null | undefined>(undefined)
  const resizeRafRef = useRef<number>(0)

  const {
    mapHoveredFeatureId,
    linkedFeatureId,
    openedFeatureId,
    viewDirectionBaseDeg,
    viewDirectionLiveOffsetDeg,
    setMapHoveredFeatureId,
    setOpenedFeatureId,
    openFeatureFromMap,
  } = useFeatureMapHover()

  const [hoverAnchor, setHoverAnchor] = useState<{ clientX: number; clientY: number } | null>(null)

  const hoverLookup = useMemo(
    () => featureHoverInfoFromMapData(captureMarkers, mapDrawnGeometries),
    [captureMarkers, mapDrawnGeometries],
  )

  useLayoutEffect(() => {
    styleUrlRef.current = styleUrl
  }, [styleUrl])

  useLayoutEffect(() => {
    captureMarkersRef.current = captureMarkers
  }, [captureMarkers])

  useLayoutEffect(() => {
    linkedFeatureIdRef.current = linkedFeatureId
  }, [linkedFeatureId])

  useLayoutEffect(() => {
    openedFeatureIdRef.current = openedFeatureId
  }, [openedFeatureId])

  const token = mapboxAccessToken()
  const { isPickingLocation, reportLocationPick, cancelLocationPick } = useMapLocationPick()
  const { isAdjustingDirection, adjustingFeatureId, cancelDirectionAdjust } =
    useViewDirectionAdjust()
  const {
    isDrawing,
    isEditingFeature,
    editingFeatureId,
    drawPhase,
    mapVertices,
    geometryType,
    draftMarkerColor,
    addMapVertex,
    closePolygon,
    cancelDraw,
    cancelEditFeature,
    requestEditConfirm,
    redrawGeometry,
    updateMapVertex,
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
  const showPreviewSession = (isDrawing || isEditingFeature) && mapVertices.length > 0
  const visibleCaptureMarkers = captureMarkers.filter(
    (m) => !(isEditingThisFeature && m.id === editingFeatureId),
  )
  const visibleMapDrawnGeometries = mapDrawnGeometries.filter(
    (g) => !(isEditingThisFeature && g.id === editingFeatureId),
  )
  const mapInteractionLocked =
    isPickingLocation || isAdjustingDirection || isDrawing || isEditingFeature

  useEffect(() => {
    if (mapHoveredFeatureId == null || mapInteractionLocked || openedFeatureId != null) {
      setHoverAnchor(null)
    }
  }, [mapHoveredFeatureId, mapInteractionLocked, openedFeatureId])

  const editVertexMarkersRef = useRef<mapboxgl.Marker[]>([])
  const collectingVertexMarkersRef = useRef<mapboxgl.Marker[]>([])
  const directionBeamMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const directionBeamRootRef = useRef<Root | null>(null)
  const suppressMapClickRef = useRef(false)

  const mapDrawnGeometriesRef = useRef(visibleMapDrawnGeometries)
  const drawPreviewRef = useRef({
    showPreview: showPreviewSession,
    mapVertices,
    geometryType,
    previewFill,
    previewStroke,
  })

  useLayoutEffect(() => {
    mapDrawnGeometriesRef.current = visibleMapDrawnGeometries
  }, [visibleMapDrawnGeometries])

  useLayoutEffect(() => {
    drawPreviewRef.current = {
      showPreview: showPreviewSession,
      mapVertices,
      geometryType,
      previewFill,
      previewStroke,
    }
  }, [showPreviewSession, mapVertices, geometryType, previewFill, previewStroke])

  useEffect(() => {
    if (token == null) return
    const el = containerRef.current
    if (el == null) return

    mapboxgl.accessToken = token

    const initialStyleUrl = styleUrlRef.current
    appliedStyleUrlRef.current = initialStyleUrl

    const map = new mapboxgl.Map({
      container: el,
      style: initialStyleUrl,
      center: [-95.80992002324031, 29.783350113603223],
      zoom: 12.8,
    })
    mapRef.current = map

    const resyncMarkersAfterStyleLoad = () => {
      syncCaptureMarkersLayer(
        map,
        captureMarkersRef.current,
        linkedFeatureIdRef.current,
        openedFeatureIdRef.current,
      )
      const preview = drawPreviewRef.current
      resyncAllDrawLayers(
        map,
        mapDrawnGeometriesRef.current,
        preview.mapVertices,
        preview.showPreview,
        preview.geometryType,
        preview.previewFill,
        preview.previewStroke,
      )
    }

    map.on('style.load', resyncMarkersAfterStyleLoad)

    const scheduleResize = () => {
      if (resizeRafRef.current !== 0) return
      resizeRafRef.current = requestAnimationFrame(() => {
        resizeRafRef.current = 0
        map.resize()
      })
    }

    const ro = new ResizeObserver(() => {
      scheduleResize()
    })
    ro.observe(el)

    return () => {
      map.off('style.load', resyncMarkersAfterStyleLoad)
      cancelAnimationFrame(resizeRafRef.current)
      resizeRafRef.current = 0
      ro.disconnect()
      map.remove()
      mapRef.current = null
      appliedStyleUrlRef.current = null
    }
  }, [token])

  useEffect(() => {
    const map = mapRef.current
    if (map == null) return
    if (styleUrl === appliedStyleUrlRef.current) return

    appliedStyleUrlRef.current = styleUrl
    map.setStyle(styleUrl)
  }, [styleUrl])

  useEffect(() => {
    const map = mapRef.current
    if (map == null) return

    const removeDirectionBeam = () => {
      directionBeamRootRef.current?.unmount()
      directionBeamRootRef.current = null
      directionBeamMarkerRef.current?.remove()
      directionBeamMarkerRef.current = null
    }

    const beamFeatureId =
      isAdjustingDirection && adjustingFeatureId != null ? adjustingFeatureId : openedFeatureId

    if (beamFeatureId == null || viewDirectionBaseDeg == null) {
      removeDirectionBeam()
      return
    }

    const captureMarker = visibleCaptureMarkers.find((m) => m.id === beamFeatureId)
    if (
      captureMarker == null ||
      (captureMarker.kind !== 'image' && captureMarker.kind !== 'panorama')
    ) {
      removeDirectionBeam()
      return
    }

    const isDirectionAdjustTarget =
      isAdjustingDirection && adjustingFeatureId === beamFeatureId

    const directionDeg = effectiveViewDirectionDeg(
      viewDirectionBaseDeg,
      viewDirectionLiveOffsetDeg,
    )

    if (directionBeamMarkerRef.current == null) {
      const el = document.createElement('div')
      el.style.pointerEvents = isDirectionAdjustTarget ? 'auto' : 'none'
      el.style.overflow = 'visible'
      directionBeamMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([captureMarker.lng, captureMarker.lat])
        .addTo(map)
      directionBeamRootRef.current = createRoot(el)
    } else {
      directionBeamMarkerRef.current.setLngLat([captureMarker.lng, captureMarker.lat])
      const el = directionBeamMarkerRef.current.getElement()
      el.style.pointerEvents = isDirectionAdjustTarget ? 'auto' : 'none'
      el.style.overflow = 'visible'
    }

    directionBeamRootRef.current?.render(
      isDirectionAdjustTarget ? (
        <DirectionAdjustMarkerOverlay />
      ) : (
        <DirectionBeam directionDeg={directionDeg} />
      ),
    )
  }, [
    openedFeatureId,
    isAdjustingDirection,
    adjustingFeatureId,
    viewDirectionBaseDeg,
    viewDirectionLiveOffsetDeg,
    visibleCaptureMarkers,
  ])

  useEffect(() => {
    return () => {
      directionBeamRootRef.current?.unmount()
      directionBeamRootRef.current = null
      directionBeamMarkerRef.current?.remove()
      directionBeamMarkerRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (map == null) return
    syncCaptureMarkersLayer(map, visibleCaptureMarkers, linkedFeatureId, openedFeatureId)
  }, [visibleCaptureMarkers, linkedFeatureId, openedFeatureId])

  useEffect(() => {
    const map = mapRef.current
    if (map == null) return
    applyCaptureMarkerPaint(map, linkedFeatureId, openedFeatureId)
  }, [linkedFeatureId, openedFeatureId])

  useEffect(() => {
    const map = mapRef.current
    if (map == null) return

    const prevOpened = prevOpenedFeatureIdRef.current
    prevOpenedFeatureIdRef.current = openedFeatureId

    if (openedFeatureId != null) {
      zoomToOpenedFeature(
        map,
        captureMarkersRef.current,
        mapDrawnGeometriesRef.current,
        openedFeatureId,
      )
      return
    }

    if (prevOpened === undefined) return
    if (prevOpened != null) {
      fitAllCaptureMarkers(map, captureMarkersRef.current)
    }
  }, [openedFeatureId, captureMarkers, mapDrawnGeometries])

  useEffect(() => {
    const map = mapRef.current
    if (map == null) return
    resyncAllDrawLayers(
      map,
      visibleMapDrawnGeometries,
      mapVertices,
      showPreviewSession,
      geometryType,
      previewFill,
      previewStroke,
    )
  }, [
    visibleMapDrawnGeometries,
    mapVertices,
    showPreviewSession,
    geometryType,
    previewFill,
    previewStroke,
  ])

  useEffect(() => {
    const map = mapRef.current
    if (map == null || !isEditingThisFeature || drawPhase !== 'editing') {
      editVertexMarkersRef.current.forEach((m) => m.remove())
      editVertexMarkersRef.current = []
      return
    }

    editVertexMarkersRef.current.forEach((m) => m.remove())
    editVertexMarkersRef.current = mapVertices.map((v, i) => {
      const marker = new mapboxgl.Marker({ draggable: true, color: previewFill })
        .setLngLat([v.lng, v.lat])
        .addTo(map)
      marker.on('drag', () => {
        const ll = marker.getLngLat()
        updateMapVertex(i, ll.lng, ll.lat)
      })
      return marker
    })

    return () => {
      editVertexMarkersRef.current.forEach((m) => m.remove())
      editVertexMarkersRef.current = []
    }
  }, [
    isEditingThisFeature,
    drawPhase,
    editingFeatureId,
    mapVertices.length,
    previewFill,
    updateMapVertex,
  ])

  const showCollectingVertexMarkers =
    isDrawing && drawPhase === 'collecting' && geometryType !== 'polygon' && mapVertices.length > 0
  const canClosePolygon = mapVertices.length >= 3 && geometryType === 'line'

  useEffect(() => {
    const map = mapRef.current
    if (map == null || !showCollectingVertexMarkers) {
      collectingVertexMarkersRef.current.forEach((m) => m.remove())
      collectingVertexMarkersRef.current = []
      return
    }

    collectingVertexMarkersRef.current.forEach((m) => m.remove())
    collectingVertexMarkersRef.current = []

    const closeListeners: Array<{ el: HTMLDivElement; handler: (e: MouseEvent) => void }> = []

    for (let i = 0; i < mapVertices.length; i++) {
      const v = mapVertices[i]
      if (v == null) continue

      if (i === 0 && !canClosePolygon) continue

      if (i === 0 && canClosePolygon) {
        const el = createPolygonCloseMarkerElement(previewFill, previewStroke)
        const onCloseClick = (e: MouseEvent) => {
          e.stopPropagation()
          closePolygon()
        }
        el.addEventListener('click', onCloseClick)
        closeListeners.push({ el, handler: onCloseClick })
        const marker = new mapboxgl.Marker({ element: el, draggable: false })
          .setLngLat([v.lng, v.lat])
          .addTo(map)
        collectingVertexMarkersRef.current.push(marker)
        continue
      }

      const marker = new mapboxgl.Marker({ draggable: true, color: previewFill })
        .setLngLat([v.lng, v.lat])
        .addTo(map)
      const index = i
      let dragStart: { lng: number; lat: number } | null = null
      marker.on('dragstart', () => {
        const ll = marker.getLngLat()
        dragStart = { lng: ll.lng, lat: ll.lat }
      })
      marker.on('drag', () => {
        const ll = marker.getLngLat()
        updateMapVertex(index, ll.lng, ll.lat)
      })
      marker.on('dragend', () => {
        suppressMapClickRef.current = true
        if (dragStart != null) {
          const ll = marker.getLngLat()
          if (ll.lng !== dragStart.lng || ll.lat !== dragStart.lat) {
            recordDrawVertexMove('map', index, dragStart)
          }
        }
        dragStart = null
      })
      collectingVertexMarkersRef.current.push(marker)
    }

    return () => {
      for (const { el, handler } of closeListeners) {
        el.removeEventListener('click', handler)
      }
      collectingVertexMarkersRef.current.forEach((m) => m.remove())
      collectingVertexMarkersRef.current = []
    }
  }, [
    showCollectingVertexMarkers,
    canClosePolygon,
    mapVertices.length,
    previewFill,
    previewStroke,
    closePolygon,
    updateMapVertex,
    recordDrawVertexMove,
  ])

  useEffect(() => {
    const map = mapRef.current
    if (map == null || isPickingLocation || isAdjustingDirection || isDrawing || isEditingFeature) return

    const onClick = (e: mapboxgl.MapLayerMouseEvent) => {
      const id = captureMarkerIdFromFeature(e.features?.[0])
      if (id == null) return
      setOpenedFeatureId(id)
      zoomToOpenedFeature(
        map,
        captureMarkersRef.current,
        mapDrawnGeometriesRef.current,
        id,
      )
      openFeatureFromMap(id)
    }

    map.on('click', CAPTURE_LAYER_ID, onClick)
    map.on('click', DRAWN_FILL_LAYER_ID, onClick)
    map.on('click', DRAWN_LINE_LAYER_ID, onClick)

    return () => {
      map.off('click', CAPTURE_LAYER_ID, onClick)
      map.off('click', DRAWN_FILL_LAYER_ID, onClick)
      map.off('click', DRAWN_LINE_LAYER_ID, onClick)
    }
  }, [isPickingLocation, isAdjustingDirection, isDrawing, isEditingFeature, openFeatureFromMap, setOpenedFeatureId, styleUrl])

  useEffect(() => {
    const map = mapRef.current
    if (map == null || isPickingLocation || isAdjustingDirection || isDrawing || isEditingFeature) return

    const canvas = map.getCanvas()
    let prevCursor = ''
    const hoverLayerIds = [CAPTURE_LAYER_ID, DRAWN_FILL_LAYER_ID, DRAWN_LINE_LAYER_ID]

    const setAnchorFromEvent = (e: mapboxgl.MapLayerMouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      setHoverAnchor({
        clientX: rect.left + e.point.x,
        clientY: rect.top + e.point.y,
      })
    }

    const onMouseEnter = (e: mapboxgl.MapLayerMouseEvent) => {
      const id = captureMarkerIdFromFeature(e.features?.[0])
      if (id == null) return
      setMapHoveredFeatureId(id)
      setAnchorFromEvent(e)
      prevCursor = canvas.style.cursor
      canvas.style.cursor = 'pointer'
    }

    const onMouseMove = (e: mapboxgl.MapLayerMouseEvent) => {
      const id = captureMarkerIdFromFeature(e.features?.[0])
      if (id == null) return
      setMapHoveredFeatureId(id)
      setAnchorFromEvent(e)
    }

    const onMouseLeave = () => {
      setMapHoveredFeatureId(null)
      setHoverAnchor(null)
      canvas.style.cursor = prevCursor
    }

    for (const layerId of hoverLayerIds) {
      map.on('mouseenter', layerId, onMouseEnter)
      map.on('mousemove', layerId, onMouseMove)
      map.on('mouseleave', layerId, onMouseLeave)
    }

    return () => {
      for (const layerId of hoverLayerIds) {
        map.off('mouseenter', layerId, onMouseEnter)
        map.off('mousemove', layerId, onMouseMove)
        map.off('mouseleave', layerId, onMouseLeave)
      }
      setMapHoveredFeatureId(null)
      setHoverAnchor(null)
      canvas.style.cursor = prevCursor
    }
  }, [isPickingLocation, isAdjustingDirection, isDrawing, isEditingFeature, setMapHoveredFeatureId, styleUrl])

  useEffect(() => {
    if (splitCommitToken === 0) return
    const map = mapRef.current
    if (map == null) return
    cancelAnimationFrame(resizeRafRef.current)
    resizeRafRef.current = 0
    requestAnimationFrame(() => {
      map.resize()
    })
  }, [splitCommitToken])

  useEffect(() => {
    const map = mapRef.current
    if (map == null || !isCollectingGeometry) return

    const canvas = map.getCanvas()
    const prevCursor = canvas.style.cursor
    canvas.style.cursor = 'crosshair'

    const onClick = (e: mapboxgl.MapMouseEvent) => {
      if (suppressMapClickRef.current) {
        suppressMapClickRef.current = false
        return
      }
      const { lng, lat } = e.lngLat
      addMapVertex(lng, lat)
    }

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault()
        if (isEditingFeature) {
          cancelEditFeature()
        } else {
          cancelDraw()
        }
      }
    }

    map.on('click', onClick)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      map.off('click', onClick)
      canvas.style.cursor = prevCursor
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [
    isCollectingGeometry,
    isEditingFeature,
    addMapVertex,
    cancelDraw,
    cancelEditFeature,
  ])

  useEffect(() => {
    if (!isEditingFeature || drawPhase !== 'editing') return

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault()
        cancelEditFeature()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isEditingFeature, drawPhase, cancelEditFeature])

  useEffect(() => {
    const map = mapRef.current
    if (map == null || !isPickingLocation) return

    const canvas = map.getCanvas()
    const prevCursor = canvas.style.cursor
    canvas.style.cursor = 'crosshair'

    const onClick = (e: mapboxgl.MapMouseEvent) => {
      reportLocationPick(e.lngLat.lng, e.lngLat.lat)
    }

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault()
        cancelLocationPick()
      }
    }

    map.on('click', onClick)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      map.off('click', onClick)
      canvas.style.cursor = prevCursor
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isPickingLocation, reportLocationPick, cancelLocationPick])

  useEffect(() => {
    if (!isAdjustingDirection) return

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault()
        cancelDirectionAdjust()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isAdjustingDirection, cancelDirectionAdjust])

  const showHoverPopup =
    !mapInteractionLocked &&
    mapHoveredFeatureId != null &&
    openedFeatureId == null &&
    hoverAnchor != null

  const hoverPopupContent =
    mapHoveredFeatureId != null ? hoverLookup.get(mapHoveredFeatureId) : undefined

  if (token == null) {
    return (
      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-2 bg-panel p-panel-padding text-center"
        role="region"
        aria-label="Map"
      >
        <p className="max-w-md font-sans text-standard text-fg-muted">
          Add a Mapbox access token to your <code className="text-fg">.env</code> file as{' '}
          <code className="text-fg">VITE_MAPBOX_ACCESS_TOKEN</code> to load this map.
        </p>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      <div
        ref={containerRef}
        className="min-h-0 w-full min-w-0 flex-1 bg-panel"
        role="region"
        aria-label="Map"
      />
      <MapOverlayControlBar readOnly={readOnly} />
      <FeatureDrawConfirmPanel />
      {isAdjustingDirection ? (
        <DirectionAdjustBanner />
      ) : isPickingLocation ? (
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
            Click the map to set where this photo was taken. Press Esc to cancel.
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
      {showHoverPopup && hoverAnchor != null ? (
        <FeatureMapHoverPopup
          title={hoverPopupContent?.title ?? ''}
          previewUrl={hoverPopupContent?.previewUrl}
          anchor={hoverAnchor}
        />
      ) : null}
    </div>
  )
}
