import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import type { AssetKind } from '@/data/sampleAssets'
import type { FloorPlanId } from '@/panels/map/mapFloorPlans'
import type { FloorPlanDrawnGeometry, MapDrawnGeometry } from '@/panels/library/assetGeometryHelpers'

export type MediaMarkerKind = Extract<AssetKind, 'image' | 'panorama'>

export type MapCaptureMarker = {
  id: string
  lng: number
  lat: number
  color: string
  strokeColor: string
  kind?: MediaMarkerKind
  viewDirectionDeg?: number
}

export type FloorPlanMarker = {
  id: string
  floorPlanId: FloorPlanId
  /** Normalized 0–1 horizontal position on the floor plan drawing. */
  x: number
  /** Normalized 0–1 vertical position on the floor plan drawing. */
  y: number
  color: string
  strokeColor: string
  kind?: MediaMarkerKind
  viewDirectionDeg?: number
}

type MapCaptureMarkersContextValue = {
  captureMarkers: MapCaptureMarker[]
  setCaptureMarkers: (markers: MapCaptureMarker[]) => void
  floorPlanMarkers: FloorPlanMarker[]
  setFloorPlanMarkers: (markers: FloorPlanMarker[]) => void
  floorPlanDrawnGeometries: FloorPlanDrawnGeometry[]
  setFloorPlanDrawnGeometries: (geometries: FloorPlanDrawnGeometry[]) => void
  mapDrawnGeometries: MapDrawnGeometry[]
  setMapDrawnGeometries: (geometries: MapDrawnGeometry[]) => void
}

const MapCaptureMarkersContext = createContext<MapCaptureMarkersContextValue | null>(null)

export function MapCaptureMarkersProvider({ children }: { children: ReactNode }) {
  const [captureMarkers, setCaptureMarkersState] = useState<MapCaptureMarker[]>([])
  const [floorPlanMarkers, setFloorPlanMarkersState] = useState<FloorPlanMarker[]>([])
  const [floorPlanDrawnGeometries, setFloorPlanDrawnGeometriesState] = useState<FloorPlanDrawnGeometry[]>([])
  const [mapDrawnGeometries, setMapDrawnGeometriesState] = useState<MapDrawnGeometry[]>([])

  const setCaptureMarkers = useCallback((markers: MapCaptureMarker[]) => {
    setCaptureMarkersState(markers)
  }, [])

  const setFloorPlanMarkers = useCallback((markers: FloorPlanMarker[]) => {
    setFloorPlanMarkersState(markers)
  }, [])

  const setFloorPlanDrawnGeometries = useCallback((geometries: FloorPlanDrawnGeometry[]) => {
    setFloorPlanDrawnGeometriesState(geometries)
  }, [])

  const setMapDrawnGeometries = useCallback((geometries: MapDrawnGeometry[]) => {
    setMapDrawnGeometriesState(geometries)
  }, [])

  const value = useMemo(
    (): MapCaptureMarkersContextValue => ({
      captureMarkers,
      setCaptureMarkers,
      floorPlanMarkers,
      setFloorPlanMarkers,
      floorPlanDrawnGeometries,
      setFloorPlanDrawnGeometries,
      mapDrawnGeometries,
      setMapDrawnGeometries,
    }),
    [
      captureMarkers,
      setCaptureMarkers,
      floorPlanMarkers,
      setFloorPlanMarkers,
      floorPlanDrawnGeometries,
      setFloorPlanDrawnGeometries,
      mapDrawnGeometries,
      setMapDrawnGeometries,
    ],
  )

  return <MapCaptureMarkersContext.Provider value={value}>{children}</MapCaptureMarkersContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useMapCaptureMarkers(): MapCaptureMarkersContextValue {
  const ctx = useContext(MapCaptureMarkersContext)
  if (ctx == null) {
    return {
      captureMarkers: [],
      setCaptureMarkers: () => {},
      floorPlanMarkers: [],
      setFloorPlanMarkers: () => {},
      floorPlanDrawnGeometries: [],
      setFloorPlanDrawnGeometries: () => {},
      mapDrawnGeometries: [],
      setMapDrawnGeometries: () => {},
    }
  }
  return ctx
}
