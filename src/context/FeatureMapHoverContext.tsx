import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

type FeatureMapHoverContextValue = {
  mapHoveredFeatureId: string | null
  linkedFeatureId: string | null
  setMapHoveredFeatureId: (id: string | null) => void
  setTableHoveredFeatureId: (id: string | null) => void
  /** Feature whose media viewer is open; dims other map markers while set. */
  openedFeatureId: string | null
  setOpenedFeatureId: (id: string | null) => void
  setMapFeatureClickHandler: (handler: ((id: string) => void) | null) => void
  openFeatureFromMap: (id: string) => void
  /** Base viewing direction (degrees) for the opened image/pano; null when no beam. */
  viewDirectionBaseDeg: number | null
  setViewDirectionBaseDeg: (deg: number | null) => void
  /** Live pano yaw offset (degrees) added to base direction. */
  viewDirectionLiveOffsetDeg: number
  setViewDirectionLiveOffsetDeg: (deg: number) => void
}

const FeatureMapHoverContext = createContext<FeatureMapHoverContextValue | null>(null)

export function FeatureMapHoverProvider({ children }: { children: ReactNode }) {
  const [mapHoveredFeatureId, setMapHoveredFeatureIdState] = useState<string | null>(null)
  const [tableHoveredFeatureId, setTableHoveredFeatureIdState] = useState<string | null>(null)
  const [openedFeatureId, setOpenedFeatureIdState] = useState<string | null>(null)
  const [viewDirectionBaseDeg, setViewDirectionBaseDegState] = useState<number | null>(null)
  const [viewDirectionLiveOffsetDeg, setViewDirectionLiveOffsetDegState] = useState(0)
  const mapFeatureClickHandlerRef = useRef<((id: string) => void) | null>(null)

  const setMapHoveredFeatureId = useCallback((id: string | null) => {
    setMapHoveredFeatureIdState(id)
  }, [])

  const setTableHoveredFeatureId = useCallback((id: string | null) => {
    setTableHoveredFeatureIdState(id)
  }, [])

  const setOpenedFeatureId = useCallback((id: string | null) => {
    setOpenedFeatureIdState(id)
    if (id == null) {
      setMapHoveredFeatureIdState(null)
      setTableHoveredFeatureIdState(null)
      setViewDirectionBaseDegState(null)
      setViewDirectionLiveOffsetDegState(0)
    }
  }, [])

  const setViewDirectionBaseDeg = useCallback((deg: number | null) => {
    setViewDirectionBaseDegState(deg)
    if (deg == null) {
      setViewDirectionLiveOffsetDegState(0)
    }
  }, [])

  const setViewDirectionLiveOffsetDeg = useCallback((deg: number) => {
    setViewDirectionLiveOffsetDegState(deg)
  }, [])

  const setMapFeatureClickHandler = useCallback((handler: ((id: string) => void) | null) => {
    mapFeatureClickHandlerRef.current = handler
  }, [])

  const openFeatureFromMap = useCallback((id: string) => {
    mapFeatureClickHandlerRef.current?.(id)
  }, [])

  const linkedFeatureId = mapHoveredFeatureId ?? tableHoveredFeatureId

  const value = useMemo(
    (): FeatureMapHoverContextValue => ({
      mapHoveredFeatureId,
      linkedFeatureId,
      setMapHoveredFeatureId,
      setTableHoveredFeatureId,
      openedFeatureId,
      setOpenedFeatureId,
      setMapFeatureClickHandler,
      openFeatureFromMap,
      viewDirectionBaseDeg,
      setViewDirectionBaseDeg,
      viewDirectionLiveOffsetDeg,
      setViewDirectionLiveOffsetDeg,
    }),
    [
      mapHoveredFeatureId,
      linkedFeatureId,
      setMapHoveredFeatureId,
      setTableHoveredFeatureId,
      openedFeatureId,
      setOpenedFeatureId,
      setMapFeatureClickHandler,
      openFeatureFromMap,
      viewDirectionBaseDeg,
      setViewDirectionBaseDeg,
      viewDirectionLiveOffsetDeg,
      setViewDirectionLiveOffsetDeg,
    ],
  )

  return <FeatureMapHoverContext.Provider value={value}>{children}</FeatureMapHoverContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useFeatureMapHover(): FeatureMapHoverContextValue {
  const ctx = useContext(FeatureMapHoverContext)
  if (ctx == null) {
    return {
      mapHoveredFeatureId: null,
      linkedFeatureId: null,
      setMapHoveredFeatureId: () => {},
      setTableHoveredFeatureId: () => {},
      openedFeatureId: null,
      setOpenedFeatureId: () => {},
      setMapFeatureClickHandler: () => {},
      openFeatureFromMap: () => {},
      viewDirectionBaseDeg: null,
      setViewDirectionBaseDeg: () => {},
      viewDirectionLiveOffsetDeg: 0,
      setViewDirectionLiveOffsetDeg: () => {},
    }
  }
  return ctx
}
