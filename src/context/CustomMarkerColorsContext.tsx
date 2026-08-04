import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { normalizeMarkerColor, PRESET_MARKER_COLORS } from '@/panels/map/markerColors'

type CustomMarkerColorsContextValue = {
  customColors: string[]
  addCustomColor: (hex: string) => void
}

const CustomMarkerColorsContext = createContext<CustomMarkerColorsContextValue | null>(null)

export function CustomMarkerColorsProvider({ children }: { children: ReactNode }) {
  const [customColors, setCustomColors] = useState<string[]>([])

  const addCustomColor = useCallback((hex: string) => {
    const normalized = normalizeMarkerColor(hex)
    setCustomColors((prev) => {
      if (PRESET_MARKER_COLORS.includes(normalized as (typeof PRESET_MARKER_COLORS)[number])) {
        return prev
      }
      if (prev.includes(normalized)) {
        return prev
      }
      return [...prev, normalized]
    })
  }, [])

  const value = useMemo(
    () => ({ customColors, addCustomColor }),
    [addCustomColor, customColors],
  )

  return (
    <CustomMarkerColorsContext.Provider value={value}>{children}</CustomMarkerColorsContext.Provider>
  )
}

export function useCustomMarkerColors(): CustomMarkerColorsContextValue {
  const ctx = useContext(CustomMarkerColorsContext)
  if (ctx == null) {
    throw new Error('useCustomMarkerColors must be used within CustomMarkerColorsProvider')
  }
  return ctx
}
