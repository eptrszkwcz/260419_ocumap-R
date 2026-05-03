import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useEffect, useRef } from 'react'

type InfrastructureMapViewProps = {
  styleUrl: string
  /** Incremented when column splitter drag ends; triggers an immediate `resize()` after layout. */
  splitCommitToken: number
}

function mapboxAccessToken(): string | undefined {
  const t = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
  if (typeof t !== 'string') return undefined
  const s = t.trim()
  return s === '' ? undefined : s
}

export function InfrastructureMapView({ styleUrl, splitCommitToken }: InfrastructureMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const resizeRafRef = useRef<number>(0)
  const token = mapboxAccessToken()

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
      cancelAnimationFrame(resizeRafRef.current)
      resizeRafRef.current = 0
      ro.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [styleUrl, token])

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
    <div
      ref={containerRef}
      className="min-h-0 min-w-0 flex-1 bg-panel"
      role="region"
      aria-label="Map"
    />
  )
}
