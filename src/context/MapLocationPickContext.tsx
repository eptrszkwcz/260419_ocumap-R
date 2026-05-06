import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

export type MapLocationPickContextValue = {
  /** User is choosing a capture point on the geographic map (Mapbox). */
  isPickingLocation: boolean
  startLocationPick: (onPick: (lng: number, lat: number) => void) => void
  cancelLocationPick: () => void
  reportLocationPick: (lng: number, lat: number) => void
}

const MapLocationPickContext = createContext<MapLocationPickContextValue | null>(null)

export function MapLocationPickProvider({ children }: { children: ReactNode }) {
  const [isPickingLocation, setIsPickingLocation] = useState(false)
  const onPickRef = useRef<((lng: number, lat: number) => void) | null>(null)

  const startLocationPick = useCallback((onPick: (lng: number, lat: number) => void) => {
    onPickRef.current = onPick
    setIsPickingLocation(true)
  }, [])

  const cancelLocationPick = useCallback(() => {
    onPickRef.current = null
    setIsPickingLocation(false)
  }, [])

  const reportLocationPick = useCallback((lng: number, lat: number) => {
    const fn = onPickRef.current
    onPickRef.current = null
    setIsPickingLocation(false)
    fn?.(lng, lat)
  }, [])

  const value = useMemo(
    (): MapLocationPickContextValue => ({
      isPickingLocation,
      startLocationPick,
      cancelLocationPick,
      reportLocationPick,
    }),
    [isPickingLocation, startLocationPick, cancelLocationPick, reportLocationPick],
  )

  return <MapLocationPickContext.Provider value={value}>{children}</MapLocationPickContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useMapLocationPick(): MapLocationPickContextValue {
  const ctx = useContext(MapLocationPickContext)
  if (ctx == null) {
    return {
      isPickingLocation: false,
      startLocationPick: () => {},
      cancelLocationPick: () => {},
      reportLocationPick: () => {},
    }
  }
  return ctx
}
