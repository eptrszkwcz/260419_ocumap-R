import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export type MapCaptureMarker = {
  id: string
  lng: number
  lat: number
}

type MapCaptureMarkersContextValue = {
  captureMarkers: MapCaptureMarker[]
  setCaptureMarkers: (markers: MapCaptureMarker[]) => void
}

const MapCaptureMarkersContext = createContext<MapCaptureMarkersContextValue | null>(null)

export function MapCaptureMarkersProvider({ children }: { children: ReactNode }) {
  const [captureMarkers, setCaptureMarkersState] = useState<MapCaptureMarker[]>([])

  const setCaptureMarkers = useCallback((markers: MapCaptureMarker[]) => {
    setCaptureMarkersState(markers)
  }, [])

  const value = useMemo(
    (): MapCaptureMarkersContextValue => ({
      captureMarkers,
      setCaptureMarkers,
    }),
    [captureMarkers, setCaptureMarkers],
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
    }
  }
  return ctx
}
