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
  linkedFeatureId: string | null
  setMapHoveredFeatureId: (id: string | null) => void
  setTableHoveredFeatureId: (id: string | null) => void
  /** Feature whose media viewer is open; dims other map markers while set. */
  openedFeatureId: string | null
  setOpenedFeatureId: (id: string | null) => void
  setMapFeatureClickHandler: (handler: ((id: string) => void) | null) => void
  openFeatureFromMap: (id: string) => void
}

const FeatureMapHoverContext = createContext<FeatureMapHoverContextValue | null>(null)

export function FeatureMapHoverProvider({ children }: { children: ReactNode }) {
  const [mapHoveredFeatureId, setMapHoveredFeatureIdState] = useState<string | null>(null)
  const [tableHoveredFeatureId, setTableHoveredFeatureIdState] = useState<string | null>(null)
  const [openedFeatureId, setOpenedFeatureIdState] = useState<string | null>(null)
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
    }
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
      linkedFeatureId,
      setMapHoveredFeatureId,
      setTableHoveredFeatureId,
      openedFeatureId,
      setOpenedFeatureId,
      setMapFeatureClickHandler,
      openFeatureFromMap,
    }),
    [
      linkedFeatureId,
      setMapHoveredFeatureId,
      setTableHoveredFeatureId,
      openedFeatureId,
      setOpenedFeatureId,
      setMapFeatureClickHandler,
      openFeatureFromMap,
    ],
  )

  return <FeatureMapHoverContext.Provider value={value}>{children}</FeatureMapHoverContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useFeatureMapHover(): FeatureMapHoverContextValue {
  const ctx = useContext(FeatureMapHoverContext)
  if (ctx == null) {
    return {
      linkedFeatureId: null,
      setMapHoveredFeatureId: () => {},
      setTableHoveredFeatureId: () => {},
      openedFeatureId: null,
      setOpenedFeatureId: () => {},
      setMapFeatureClickHandler: () => {},
      openFeatureFromMap: () => {},
    }
  }
  return ctx
}
