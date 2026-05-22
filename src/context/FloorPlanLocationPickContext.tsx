import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

import type { FloorPlanId } from '@/panels/map/mapFloorPlans'

export type FloorPlanLocationPickPreview = {
  featureId: string
  floorPlanId: FloorPlanId
  x: number
  y: number
}

export type FloorPlanLocationPickContextValue = {
  /** User is choosing a capture point on the floor plan viewer. */
  isPickingFloorPlanLocation: boolean
  /** Live marker position while editing location before save. */
  floorPlanPickPreview: FloorPlanLocationPickPreview | null
  startFloorPlanLocationPick: (
    featureId: string,
    onPick: (floorPlanId: FloorPlanId, x: number, y: number) => void,
  ) => void
  cancelFloorPlanLocationPick: () => void
  reportFloorPlanLocationPick: (floorPlanId: FloorPlanId, x: number, y: number) => void
  clearFloorPlanLocationPickPreview: () => void
}

const FloorPlanLocationPickContext = createContext<FloorPlanLocationPickContextValue | null>(null)

export function FloorPlanLocationPickProvider({ children }: { children: ReactNode }) {
  const [isPickingFloorPlanLocation, setIsPickingFloorPlanLocation] = useState(false)
  const [floorPlanPickPreview, setFloorPlanPickPreview] = useState<FloorPlanLocationPickPreview | null>(
    null,
  )
  const onPickRef = useRef<((floorPlanId: FloorPlanId, x: number, y: number) => void) | null>(null)
  const pickingFeatureIdRef = useRef<string | null>(null)

  const clearFloorPlanLocationPickPreview = useCallback(() => {
    setFloorPlanPickPreview(null)
  }, [])

  const startFloorPlanLocationPick = useCallback(
    (featureId: string, onPick: (floorPlanId: FloorPlanId, x: number, y: number) => void) => {
      pickingFeatureIdRef.current = featureId
      onPickRef.current = onPick
      setIsPickingFloorPlanLocation(true)
    },
    [],
  )

  const cancelFloorPlanLocationPick = useCallback(() => {
    onPickRef.current = null
    pickingFeatureIdRef.current = null
    setIsPickingFloorPlanLocation(false)
    setFloorPlanPickPreview(null)
  }, [])

  const reportFloorPlanLocationPick = useCallback((floorPlanId: FloorPlanId, x: number, y: number) => {
    const fn = onPickRef.current
    const featureId = pickingFeatureIdRef.current
    onPickRef.current = null
    pickingFeatureIdRef.current = null
    setIsPickingFloorPlanLocation(false)
    if (featureId != null) {
      setFloorPlanPickPreview({ featureId, floorPlanId, x, y })
    }
    fn?.(floorPlanId, x, y)
  }, [])

  const value = useMemo(
    (): FloorPlanLocationPickContextValue => ({
      isPickingFloorPlanLocation,
      floorPlanPickPreview,
      startFloorPlanLocationPick,
      cancelFloorPlanLocationPick,
      reportFloorPlanLocationPick,
      clearFloorPlanLocationPickPreview,
    }),
    [
      isPickingFloorPlanLocation,
      floorPlanPickPreview,
      startFloorPlanLocationPick,
      cancelFloorPlanLocationPick,
      reportFloorPlanLocationPick,
      clearFloorPlanLocationPickPreview,
    ],
  )

  return (
    <FloorPlanLocationPickContext.Provider value={value}>{children}</FloorPlanLocationPickContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useFloorPlanLocationPick(): FloorPlanLocationPickContextValue {
  const ctx = useContext(FloorPlanLocationPickContext)
  if (ctx == null) {
    return {
      isPickingFloorPlanLocation: false,
      floorPlanPickPreview: null,
      startFloorPlanLocationPick: () => {},
      cancelFloorPlanLocationPick: () => {},
      reportFloorPlanLocationPick: () => {},
      clearFloorPlanLocationPickPreview: () => {},
    }
  }
  return ctx
}
