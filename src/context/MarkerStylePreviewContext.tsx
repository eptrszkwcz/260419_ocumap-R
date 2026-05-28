import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export type MarkerStylePreview = {
  featureId: string
  color: string
}

export type MarkerStylePreviewContextValue = {
  markerStylePreview: MarkerStylePreview | null
  setMarkerStylePreview: (preview: MarkerStylePreview | null) => void
  clearMarkerStylePreview: () => void
}

const MarkerStylePreviewContext = createContext<MarkerStylePreviewContextValue | null>(null)

export function MarkerStylePreviewProvider({ children }: { children: ReactNode }) {
  const [markerStylePreview, setMarkerStylePreviewState] = useState<MarkerStylePreview | null>(null)

  const setMarkerStylePreview = useCallback((preview: MarkerStylePreview | null) => {
    setMarkerStylePreviewState(preview)
  }, [])

  const clearMarkerStylePreview = useCallback(() => {
    setMarkerStylePreviewState(null)
  }, [])

  const value = useMemo(
    (): MarkerStylePreviewContextValue => ({
      markerStylePreview,
      setMarkerStylePreview,
      clearMarkerStylePreview,
    }),
    [markerStylePreview, setMarkerStylePreview, clearMarkerStylePreview],
  )

  return (
    <MarkerStylePreviewContext.Provider value={value}>{children}</MarkerStylePreviewContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useMarkerStylePreview(): MarkerStylePreviewContextValue {
  const ctx = useContext(MarkerStylePreviewContext)
  if (ctx == null) {
    return {
      markerStylePreview: null,
      setMarkerStylePreview: () => {},
      clearMarkerStylePreview: () => {},
    }
  }
  return ctx
}
