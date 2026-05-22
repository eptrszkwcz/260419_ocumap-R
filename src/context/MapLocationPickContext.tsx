import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

export type MapLocationPickPreview = {
  featureId: string
  lng: number
  lat: number
}

export type MapLocationPickContextValue = {
  /** User is choosing a capture point on the geographic map (Mapbox). */
  isPickingLocation: boolean
  /** Live marker position while editing location before save. */
  locationPickPreview: MapLocationPickPreview | null
  startLocationPick: (featureId: string, onPick: (lng: number, lat: number) => void) => void
  cancelLocationPick: () => void
  reportLocationPick: (lng: number, lat: number) => void
  clearLocationPickPreview: () => void
}

const MapLocationPickContext = createContext<MapLocationPickContextValue | null>(null)

export function MapLocationPickProvider({ children }: { children: ReactNode }) {
  const [isPickingLocation, setIsPickingLocation] = useState(false)
  const [locationPickPreview, setLocationPickPreview] = useState<MapLocationPickPreview | null>(null)
  const onPickRef = useRef<((lng: number, lat: number) => void) | null>(null)
  const pickingFeatureIdRef = useRef<string | null>(null)

  const clearLocationPickPreview = useCallback(() => {
    setLocationPickPreview(null)
  }, [])

  const startLocationPick = useCallback((featureId: string, onPick: (lng: number, lat: number) => void) => {
    pickingFeatureIdRef.current = featureId
    onPickRef.current = onPick
    setIsPickingLocation(true)
  }, [])

  const cancelLocationPick = useCallback(() => {
    onPickRef.current = null
    pickingFeatureIdRef.current = null
    setIsPickingLocation(false)
    setLocationPickPreview(null)
  }, [])

  const reportLocationPick = useCallback((lng: number, lat: number) => {
    const fn = onPickRef.current
    const featureId = pickingFeatureIdRef.current
    onPickRef.current = null
    pickingFeatureIdRef.current = null
    setIsPickingLocation(false)
    if (featureId != null) {
      setLocationPickPreview({ featureId, lng, lat })
    }
    fn?.(lng, lat)
  }, [])

  const value = useMemo(
    (): MapLocationPickContextValue => ({
      isPickingLocation,
      locationPickPreview,
      startLocationPick,
      cancelLocationPick,
      reportLocationPick,
      clearLocationPickPreview,
    }),
    [
      isPickingLocation,
      locationPickPreview,
      startLocationPick,
      cancelLocationPick,
      reportLocationPick,
      clearLocationPickPreview,
    ],
  )

  return <MapLocationPickContext.Provider value={value}>{children}</MapLocationPickContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useMapLocationPick(): MapLocationPickContextValue {
  const ctx = useContext(MapLocationPickContext)
  if (ctx == null) {
    return {
      isPickingLocation: false,
      locationPickPreview: null,
      startLocationPick: () => {},
      cancelLocationPick: () => {},
      reportLocationPick: () => {},
      clearLocationPickPreview: () => {},
    }
  }
  return ctx
}
