import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import type { AssetKind } from '@/data/sampleAssets'
import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import { useFloorPlanLocationPick } from '@/context/FloorPlanLocationPickContext'
import { useMapLocationPick } from '@/context/MapLocationPickContext'

export type DirectionAdjustAssetMeta = {
  fileUrl: string
  kind: Extract<AssetKind, 'image' | 'panorama'>
}

export type ViewDirectionAdjustContextValue = {
  isAdjustingDirection: boolean
  adjustingFeatureId: string | null
  referenceDirectionDeg: number
  originalDirectionDeg: number
  draftDirectionDeg: number
  adjustAssetMeta: DirectionAdjustAssetMeta | null
  startDirectionAdjust: (
    featureId: string,
    meta: DirectionAdjustAssetMeta,
    currentDirectionDeg: number,
    onSave: (deg: number) => void,
  ) => void
  setDraftDirectionDeg: (deg: number) => void
  saveDirectionAdjust: () => void
  cancelDirectionAdjust: () => void
}

const ViewDirectionAdjustContext = createContext<ViewDirectionAdjustContextValue | null>(null)

function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360
}

export function ViewDirectionAdjustProvider({ children }: { children: ReactNode }) {
  const { setViewDirectionBaseDeg, setViewDirectionLiveOffsetDeg } = useFeatureMapHover()
  const { cancelLocationPick } = useMapLocationPick()
  const { cancelFloorPlanLocationPick } = useFloorPlanLocationPick()
  const [isAdjustingDirection, setIsAdjustingDirection] = useState(false)
  const [adjustingFeatureId, setAdjustingFeatureId] = useState<string | null>(null)
  const [referenceDirectionDeg, setReferenceDirectionDeg] = useState(0)
  const [originalDirectionDeg, setOriginalDirectionDeg] = useState(0)
  const [draftDirectionDeg, setDraftDirectionDegState] = useState(0)
  const [adjustAssetMeta, setAdjustAssetMeta] = useState<DirectionAdjustAssetMeta | null>(null)
  const onSaveRef = useRef<((deg: number) => void) | null>(null)
  const restoreBaseDegRef = useRef<number | null>(null)

  const setDraftDirectionDeg = useCallback(
    (deg: number) => {
      const normalized = normalizeDeg(deg)
      setDraftDirectionDegState(normalized)
      setViewDirectionBaseDeg(normalized)
      setViewDirectionLiveOffsetDeg(0)
    },
    [setViewDirectionBaseDeg, setViewDirectionLiveOffsetDeg],
  )

  const clearAdjustState = useCallback(() => {
    onSaveRef.current = null
    setIsAdjustingDirection(false)
    setAdjustingFeatureId(null)
    setAdjustAssetMeta(null)
  }, [])

  const startDirectionAdjust = useCallback(
    (
      featureId: string,
      meta: DirectionAdjustAssetMeta,
      currentDirectionDeg: number,
      onSave: (deg: number) => void,
    ) => {
      cancelLocationPick()
      cancelFloorPlanLocationPick()

      const normalized = normalizeDeg(currentDirectionDeg)
      restoreBaseDegRef.current = normalized
      onSaveRef.current = onSave
      setReferenceDirectionDeg(normalized)
      setOriginalDirectionDeg(normalized)
      setDraftDirectionDegState(normalized)
      setAdjustAssetMeta(meta)
      setAdjustingFeatureId(featureId)
      setIsAdjustingDirection(true)
      setViewDirectionBaseDeg(normalized)
      setViewDirectionLiveOffsetDeg(0)
    },
    [
      cancelFloorPlanLocationPick,
      cancelLocationPick,
      setViewDirectionBaseDeg,
      setViewDirectionLiveOffsetDeg,
    ],
  )

  const saveDirectionAdjust = useCallback(() => {
    const fn = onSaveRef.current
    const deg = draftDirectionDeg
    fn?.(deg)
    restoreBaseDegRef.current = null
    clearAdjustState()
  }, [clearAdjustState, draftDirectionDeg])

  const cancelDirectionAdjust = useCallback(() => {
    const restore = restoreBaseDegRef.current
    if (restore != null) {
      setViewDirectionBaseDeg(restore)
      setViewDirectionLiveOffsetDeg(0)
    }
    restoreBaseDegRef.current = null
    clearAdjustState()
  }, [clearAdjustState, setViewDirectionBaseDeg, setViewDirectionLiveOffsetDeg])

  const value = useMemo(
    (): ViewDirectionAdjustContextValue => ({
      isAdjustingDirection,
      adjustingFeatureId,
      referenceDirectionDeg,
      originalDirectionDeg,
      draftDirectionDeg,
      adjustAssetMeta,
      startDirectionAdjust,
      setDraftDirectionDeg,
      saveDirectionAdjust,
      cancelDirectionAdjust,
    }),
    [
      isAdjustingDirection,
      adjustingFeatureId,
      referenceDirectionDeg,
      originalDirectionDeg,
      draftDirectionDeg,
      adjustAssetMeta,
      startDirectionAdjust,
      setDraftDirectionDeg,
      saveDirectionAdjust,
      cancelDirectionAdjust,
    ],
  )

  return (
    <ViewDirectionAdjustContext.Provider value={value}>{children}</ViewDirectionAdjustContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useViewDirectionAdjust(): ViewDirectionAdjustContextValue {
  const ctx = useContext(ViewDirectionAdjustContext)
  if (ctx == null) {
    return {
      isAdjustingDirection: false,
      adjustingFeatureId: null,
      referenceDirectionDeg: 0,
      originalDirectionDeg: 0,
      draftDirectionDeg: 0,
      adjustAssetMeta: null,
      startDirectionAdjust: () => {},
      setDraftDirectionDeg: () => {},
      saveDirectionAdjust: () => {},
      cancelDirectionAdjust: () => {},
    }
  }
  return ctx
}
