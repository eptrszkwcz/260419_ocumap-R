import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useEffect, useRef } from 'react'

import { KATY_FREEWAY_MAPBOX_STYLE } from '@/data/sampleProjects'
import { mapboxTokenPresent } from '@/panels/library/featureMetadata/mapboxToken'

type ProjectMapThumbnailProps = {
  styleUrl?: string
  lat?: number
  lng?: number
}

function mapboxAccessToken(): string | undefined {
  const t = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
  if (typeof t !== 'string') return undefined
  const s = t.trim()
  return s === '' ? undefined : s
}

export function ProjectMapThumbnail({ styleUrl, lat, lng }: ProjectMapThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  const token = mapboxAccessToken()
  const hasCoords =
    lat != null &&
    lng != null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)

  useEffect(() => {
    if (!mapboxTokenPresent() || token == null || !hasCoords) return
    const el = containerRef.current
    if (el == null) return

    mapboxgl.accessToken = token

    const map = new mapboxgl.Map({
      container: el,
      style: styleUrl ?? KATY_FREEWAY_MAPBOX_STYLE,
      center: [lng as number, lat as number],
      zoom: 11,
      interactive: false,
      attributionControl: false,
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [hasCoords, lat, lng, styleUrl, token])

  if (!mapboxTokenPresent() || !hasCoords) {
    return (
      <div className="text-fg-muted flex size-full items-center justify-center bg-area-highlight text-badge font-bold">
        Map
      </div>
    )
  }

  return <div ref={containerRef} className="size-full" aria-hidden />
}
