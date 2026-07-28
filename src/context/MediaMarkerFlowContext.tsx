import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { useFeatureDraw } from '@/context/FeatureDrawContext'
import { useFloorPlanLocationPick } from '@/context/FloorPlanLocationPickContext'
import { useMapLocationPick } from '@/context/MapLocationPickContext'
import { useViewDirectionAdjust } from '@/context/ViewDirectionAdjustContext'
import type { MediaAnnotationMarker } from '@/data/sampleAssets'
import {
  computeInitialMapMarkerPosition,
  defaultMarkerName,
  formatMarkerDateAdded,
  newMarkerId,
} from '@/panels/media/mediaMarkerPlacement'
import { DEFAULT_MARKER_COLOR } from '@/panels/map/markerColors'
import type { FloorPlanId } from '@/panels/map/mapFloorPlans'

export type MediaMarkerFlowPhase = 'idle' | 'placing' | 'adjusting' | 'viewing'

export type MediaMarkerPanelPhase = 'confirm' | 'metadata'

export type MediaMarkerDraft = Partial<MediaAnnotationMarker> & {
  isPreliminary?: boolean
}

export type MediaMarkerFlowContextValue = {
  phase: MediaMarkerFlowPhase
  panelPhase: MediaMarkerPanelPhase | null
  parentAssetId: string | null
  parentAsset: import('@/data/sampleAssets').SpatialAsset | null
  draftMarker: MediaMarkerDraft | null
  savedMarkerId: string | null
  isPlacingMediaMarker: boolean
  isAdjustingMediaMarker: boolean
  isMarkerPanelOpen: boolean
  markerFlowResizeToken: number
  startPlacement: (asset: import('@/data/sampleAssets').SpatialAsset) => void
  placeOnMedia: (payload: {
    mediaPosition?: { x: number; y: number }
    panoPosition?: { yawDeg: number; pitchDeg: number }
    viewDirectionDeg: number
    isBuildingProject: boolean
    defaultFloorPlanId: FloorPlanId
    parentAsset: import('@/data/sampleAssets').SpatialAsset
  }) => void
  updateDraftMarker: (patch: MediaMarkerDraft) => void
  confirmPlacement: (existingMarkerCount: number) => void
  saveMarker: () => MediaAnnotationMarker | null
  cancelFlow: () => void
  openSavedMarker: (marker: MediaAnnotationMarker, asset: import('@/data/sampleAssets').SpatialAsset) => void
  registerPersistMarker: (
    handler: ((parentAssetId: string, marker: MediaAnnotationMarker) => void) | null,
  ) => void
}

const MediaMarkerFlowContext = createContext<MediaMarkerFlowContextValue | null>(null)

export function MediaMarkerFlowProvider({ children }: { children: ReactNode }) {
  const { cancelLocationPick } = useMapLocationPick()
  const { cancelFloorPlanLocationPick } = useFloorPlanLocationPick()
  const { cancelDirectionAdjust } = useViewDirectionAdjust()
  const { cancelDraw, cancelEditFeature } = useFeatureDraw()

  const [phase, setPhase] = useState<MediaMarkerFlowPhase>('idle')
  const [panelPhase, setPanelPhase] = useState<MediaMarkerPanelPhase | null>(null)
  const [parentAssetId, setParentAssetId] = useState<string | null>(null)
  const [parentAsset, setParentAsset] = useState<import('@/data/sampleAssets').SpatialAsset | null>(
    null,
  )
  const [draftMarker, setDraftMarker] = useState<MediaMarkerDraft | null>(null)
  const [savedMarkerId, setSavedMarkerId] = useState<string | null>(null)
  const [markerFlowResizeToken, setMarkerFlowResizeToken] = useState(0)

  const confirmedMarkerRef = useRef<MediaAnnotationMarker | null>(null)
  const persistHandlerRef = useRef<
    ((parentAssetId: string, marker: MediaAnnotationMarker) => void) | null
  >(null)

  const registerPersistMarker = useCallback(
    (handler: ((parentAssetId: string, marker: MediaAnnotationMarker) => void) | null) => {
      persistHandlerRef.current = handler
    },
    [],
  )

  const cancelOtherModes = useCallback(() => {
    cancelLocationPick()
    cancelFloorPlanLocationPick()
    cancelDirectionAdjust()
    cancelDraw()
    cancelEditFeature()
  }, [
    cancelDirectionAdjust,
    cancelDraw,
    cancelEditFeature,
    cancelFloorPlanLocationPick,
    cancelLocationPick,
  ])

  const clearFlow = useCallback(() => {
    confirmedMarkerRef.current = null
    setPhase('idle')
    setPanelPhase(null)
    setParentAssetId(null)
    setParentAsset(null)
    setDraftMarker(null)
    setSavedMarkerId(null)
  }, [])

  const startPlacement = useCallback(
    (asset: import('@/data/sampleAssets').SpatialAsset) => {
      cancelOtherModes()
      setParentAssetId(asset.id)
      setParentAsset(asset)
      setDraftMarker(null)
      setSavedMarkerId(null)
      confirmedMarkerRef.current = null
      setPanelPhase(null)
      setPhase('placing')
    },
    [cancelOtherModes],
  )

  const placeOnMedia = useCallback(
    (payload: {
      mediaPosition?: { x: number; y: number }
      panoPosition?: { yawDeg: number; pitchDeg: number }
      viewDirectionDeg: number
      isBuildingProject: boolean
      defaultFloorPlanId: FloorPlanId
      parentAsset: import('@/data/sampleAssets').SpatialAsset
    }) => {
      const mapPos = computeInitialMapMarkerPosition(
        payload.parentAsset,
        payload.viewDirectionDeg,
        payload.isBuildingProject,
        payload.defaultFloorPlanId,
      )
      setDraftMarker({
        isPreliminary: true,
        mediaPosition: payload.mediaPosition,
        panoPosition: payload.panoPosition,
        ...mapPos,
      })
      setPanelPhase('confirm')
      setPhase('adjusting')
      setMarkerFlowResizeToken((t) => t + 1)
    },
    [],
  )

  const updateDraftMarker = useCallback((patch: MediaMarkerDraft) => {
    setDraftMarker((prev) => (prev == null ? patch : { ...prev, ...patch }))
  }, [])

  const confirmPlacement = useCallback((existingMarkerCount: number) => {
    setDraftMarker((prev) => {
      if (prev == null) return prev
      const confirmed: MediaAnnotationMarker = {
        id: newMarkerId(),
        name: defaultMarkerName(existingMarkerCount),
        dateAdded: formatMarkerDateAdded(),
        color: DEFAULT_MARKER_COLOR,
        mediaPosition: prev.mediaPosition,
        panoPosition: prev.panoPosition,
        floorPlanPosition: prev.floorPlanPosition,
        mapPosition: prev.mapPosition,
      }
      confirmedMarkerRef.current = confirmed
      setSavedMarkerId(confirmed.id)
      return { ...confirmed, isPreliminary: false }
    })
    setPanelPhase('metadata')
    setPhase('viewing')
  }, [])

  const saveMarker = useCallback((): MediaAnnotationMarker | null => {
    const marker = confirmedMarkerRef.current
    if (marker == null || draftMarker == null) return null
    const saved: MediaAnnotationMarker = {
      id: marker.id,
      name: draftMarker.name ?? marker.name,
      dateAdded: draftMarker.dateAdded ?? marker.dateAdded,
      color: draftMarker.color ?? marker.color,
      mediaPosition: draftMarker.mediaPosition ?? marker.mediaPosition,
      panoPosition: draftMarker.panoPosition ?? marker.panoPosition,
      floorPlanPosition: draftMarker.floorPlanPosition ?? marker.floorPlanPosition,
      mapPosition: draftMarker.mapPosition ?? marker.mapPosition,
    }
    confirmedMarkerRef.current = saved
    setDraftMarker({ ...saved, isPreliminary: false })
    if (parentAssetId != null) {
      persistHandlerRef.current?.(parentAssetId, saved)
    }
    return saved
  }, [draftMarker, parentAssetId])

  const cancelFlow = useCallback(() => {
    clearFlow()
  }, [clearFlow])

  const openSavedMarker = useCallback(
    (marker: MediaAnnotationMarker, asset: import('@/data/sampleAssets').SpatialAsset) => {
      confirmedMarkerRef.current = marker
      setParentAssetId(asset.id)
      setParentAsset(asset)
    setDraftMarker({ ...marker, isPreliminary: false })
    setSavedMarkerId(marker.id)
    setPanelPhase('metadata')
    setPhase('viewing')
      setMarkerFlowResizeToken((t) => t + 1)
    },
    [],
  )

  const value = useMemo(
    (): MediaMarkerFlowContextValue => ({
      phase,
      panelPhase,
      parentAssetId,
      parentAsset,
      draftMarker,
      savedMarkerId,
      isPlacingMediaMarker: phase === 'placing',
      isAdjustingMediaMarker: phase === 'adjusting' || phase === 'viewing',
      isMarkerPanelOpen: phase === 'adjusting' || phase === 'viewing',
      markerFlowResizeToken,
      startPlacement,
      placeOnMedia,
      updateDraftMarker,
      confirmPlacement,
      saveMarker,
      cancelFlow,
      openSavedMarker,
      registerPersistMarker,
    }),
    [
      phase,
      panelPhase,
      parentAssetId,
      parentAsset,
      draftMarker,
      savedMarkerId,
      markerFlowResizeToken,
      startPlacement,
      placeOnMedia,
      updateDraftMarker,
      confirmPlacement,
      saveMarker,
      cancelFlow,
      openSavedMarker,
      registerPersistMarker,
    ],
  )

  return (
    <MediaMarkerFlowContext.Provider value={value}>{children}</MediaMarkerFlowContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useMediaMarkerFlow(): MediaMarkerFlowContextValue {
  const ctx = useContext(MediaMarkerFlowContext)
  if (ctx == null) {
    return {
      phase: 'idle',
      panelPhase: null,
      parentAssetId: null,
      parentAsset: null,
      draftMarker: null,
      savedMarkerId: null,
      isPlacingMediaMarker: false,
      isAdjustingMediaMarker: false,
      isMarkerPanelOpen: false,
      markerFlowResizeToken: 0,
      startPlacement: () => {},
      placeOnMedia: () => {},
      updateDraftMarker: () => {},
      confirmPlacement: () => {},
      saveMarker: () => null,
      cancelFlow: () => {},
      openSavedMarker: () => {},
      registerPersistMarker: () => {},
    }
  }
  return ctx
}
