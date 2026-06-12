import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useEffect, useLayoutEffect, useRef } from 'react'

import type { MapCaptureMarker } from '@/context/MapCaptureMarkersContext'
import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import { useMapLocationPick } from '@/context/MapLocationPickContext'
import {
  mapOverlayInsetBottomClassName,
  mapOverlayInsetXClassName,
} from '@/panels/map/mapOverlayLayout'

const CAPTURE_SOURCE_ID = 'ocumap-capture-markers'
const CAPTURE_LAYER_ID = 'ocumap-capture-markers-circle'

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

function zoomToOpenedFeature(map: mapboxgl.Map, markers: MapCaptureMarker[], featureId: string) {
  const marker = markers.find((m) => m.id === featureId)
  if (marker == null) return
  if (map.getMaxZoom() < FEATURE_FOCUS_MAX_ZOOM) {
    map.setMaxZoom(FEATURE_FOCUS_MAX_ZOOM)
  }
  map.flyTo({
    center: [marker.lng, marker.lat],
    zoom: FEATURE_FOCUS_MAX_ZOOM,
    duration: FLY_DURATION_MS,
    essential: true,
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
    linkedFeatureId,
    openedFeatureId,
    setMapHoveredFeatureId,
    setOpenedFeatureId,
    openFeatureFromMap,
  } = useFeatureMapHover()

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
    syncCaptureMarkersLayer(map, captureMarkers, linkedFeatureId, openedFeatureId)
  }, [captureMarkers, linkedFeatureId, openedFeatureId])

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
      zoomToOpenedFeature(map, captureMarkersRef.current, openedFeatureId)
      return
    }

    if (prevOpened === undefined) return
    if (prevOpened != null) {
      fitAllCaptureMarkers(map, captureMarkersRef.current)
    }
  }, [openedFeatureId, captureMarkers])

  useEffect(() => {
    const map = mapRef.current
    if (map == null || isPickingLocation) return

    const onClick = (e: mapboxgl.MapLayerMouseEvent) => {
      const id = captureMarkerIdFromFeature(e.features?.[0])
      if (id == null) return
      setOpenedFeatureId(id)
      zoomToOpenedFeature(map, captureMarkersRef.current, id)
      openFeatureFromMap(id)
    }

    map.on('click', CAPTURE_LAYER_ID, onClick)

    return () => {
      map.off('click', CAPTURE_LAYER_ID, onClick)
    }
  }, [isPickingLocation, openFeatureFromMap, setOpenedFeatureId, styleUrl])

  useEffect(() => {
    const map = mapRef.current
    if (map == null || isPickingLocation) return

    const canvas = map.getCanvas()
    let prevCursor = ''

    const onMouseEnter = (e: mapboxgl.MapLayerMouseEvent) => {
      const feature = e.features?.[0]
      const id = feature?.properties?.id
      if (typeof id !== 'string') return
      setMapHoveredFeatureId(id)
      prevCursor = canvas.style.cursor
      canvas.style.cursor = 'pointer'
    }

    const onMouseLeave = () => {
      setMapHoveredFeatureId(null)
      canvas.style.cursor = prevCursor
    }

    map.on('mouseenter', CAPTURE_LAYER_ID, onMouseEnter)
    map.on('mouseleave', CAPTURE_LAYER_ID, onMouseLeave)

    return () => {
      map.off('mouseenter', CAPTURE_LAYER_ID, onMouseEnter)
      map.off('mouseleave', CAPTURE_LAYER_ID, onMouseLeave)
      setMapHoveredFeatureId(null)
      canvas.style.cursor = prevCursor
    }
  }, [isPickingLocation, setMapHoveredFeatureId, styleUrl])

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
      {isPickingLocation ? (
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
      ) : null}
    </div>
  )
}
