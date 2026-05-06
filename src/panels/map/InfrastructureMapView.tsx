import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useEffect, useLayoutEffect, useRef } from 'react'

import type { MapCaptureMarker } from '@/context/MapCaptureMarkersContext'
import { useMapLocationPick } from '@/context/MapLocationPickContext'

const CAPTURE_SOURCE_ID = 'ocumap-capture-markers'
const CAPTURE_LAYER_ID = 'ocumap-capture-markers-circle'

function captureMarkersFeatureCollection(markers: MapCaptureMarker[]) {
  return {
    type: 'FeatureCollection' as const,
    features: markers.map((m) => ({
      type: 'Feature' as const,
      properties: { id: m.id },
      geometry: { type: 'Point' as const, coordinates: [m.lng, m.lat] as [number, number] },
    })),
  }
}

function syncCaptureMarkersLayer(map: mapboxgl.Map, markers: MapCaptureMarker[]) {
  if (!map.isStyleLoaded()) return
  const data = captureMarkersFeatureCollection(markers)
  try {
    if (!map.getSource(CAPTURE_SOURCE_ID)) {
      map.addSource(CAPTURE_SOURCE_ID, { type: 'geojson', data })
      map.addLayer({
        id: CAPTURE_LAYER_ID,
        type: 'circle',
        source: CAPTURE_SOURCE_ID,
        paint: {
          'circle-radius': 11,
          'circle-color': '#2563eb',
          'circle-opacity': 0.32,
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#1d4ed8',
        },
      })
    } else {
      const src = map.getSource(CAPTURE_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined
      src?.setData(data)
    }
  } catch {
    /* rare: style does not accept custom layers */
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
  const captureMarkersRef = useRef(captureMarkers)
  const resizeRafRef = useRef<number>(0)

  useLayoutEffect(() => {
    captureMarkersRef.current = captureMarkers
  }, [captureMarkers])
  const token = mapboxAccessToken()
  const { isPickingLocation, reportLocationPick, cancelLocationPick } = useMapLocationPick()

  useEffect(() => {
    if (token == null) return
    const el = containerRef.current
    if (el == null) return

    mapboxgl.accessToken = token

    const map = new mapboxgl.Map({
      container: el,
      style: styleUrl,
      center: [-95.80992002324031, 29.783350113603223],
      zoom: 12.8,
    })
    mapRef.current = map

    const onLoad = () => {
      syncCaptureMarkersLayer(map, captureMarkersRef.current)
    }
    map.on('load', onLoad)

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
      map.off('load', onLoad)
      cancelAnimationFrame(resizeRafRef.current)
      resizeRafRef.current = 0
      ro.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [styleUrl, token])

  useEffect(() => {
    const map = mapRef.current
    if (map == null) return
    syncCaptureMarkersLayer(map, captureMarkers)
  }, [captureMarkers])

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
          className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center px-panel-padding"
          role="status"
          aria-live="polite"
        >
          <div className="max-w-md rounded-panel border border-stroke bg-panel/95 px-3 py-2 text-center font-sans text-standard text-fg shadow-sm backdrop-blur-sm">
            Click the map to set where this photo was taken. Press Esc to cancel.
          </div>
        </div>
      ) : null}
    </div>
  )
}
