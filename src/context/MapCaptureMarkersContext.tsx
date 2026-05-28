import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import type { FloorPlanId } from '@/panels/map/mapFloorPlans'

export type MapCaptureMarker = {
  id: string
  lng: number
  lat: number
  color: string
  strokeColor: string
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
}

type MapCaptureMarkersContextValue = {
  captureMarkers: MapCaptureMarker[]
  setCaptureMarkers: (markers: MapCaptureMarker[]) => void
  floorPlanMarkers: FloorPlanMarker[]
  setFloorPlanMarkers: (markers: FloorPlanMarker[]) => void
}

const MapCaptureMarkersContext = createContext<MapCaptureMarkersContextValue | null>(null)

export function MapCaptureMarkersProvider({ children }: { children: ReactNode }) {
  const [captureMarkers, setCaptureMarkersState] = useState<MapCaptureMarker[]>([])
  const [floorPlanMarkers, setFloorPlanMarkersState] = useState<FloorPlanMarker[]>([])

  const setCaptureMarkers = useCallback((markers: MapCaptureMarker[]) => {
    setCaptureMarkersState(markers)
  }, [])

  const setFloorPlanMarkers = useCallback((markers: FloorPlanMarker[]) => {
    setFloorPlanMarkersState(markers)
  }, [])

  const value = useMemo(
    (): MapCaptureMarkersContextValue => ({
      captureMarkers,
      setCaptureMarkers,
      floorPlanMarkers,
      setFloorPlanMarkers,
    }),
    [captureMarkers, setCaptureMarkers, floorPlanMarkers, setFloorPlanMarkers],
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
    }
  }
  return ctx
}
