import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import type { FeatureGeometryType, SpatialAsset } from '@/data/sampleAssets'
import type { FloorPlanId } from '@/panels/map/mapFloorPlans'
import { loadAssetIntoDrawState } from '@/panels/map/featureDrawUtils'
import { DEFAULT_MARKER_COLOR, normalizeMarkerColor } from '@/panels/map/markerColors'

export type FloorPlanDrawVertex = { x: number; y: number }
export type MapDrawVertex = { lng: number; lat: number }

export type DrawPhase = 'idle' | 'collecting' | 'editing' | 'awaitingConfirm' | 'confirmed'

type EditSnapshot = {
  floorPlanId: FloorPlanId | null
  floorPlanVertices: FloorPlanDrawVertex[]
  mapVertices: MapDrawVertex[]
  geometryType: FeatureGeometryType | null
}

export type FeatureDrawContextValue = {
  isDrawing: boolean
  isEditingFeature: boolean
  editingFeatureId: string | null
  draftFeatureId: string | null
  floorPlanId: FloorPlanId | null
  floorPlanVertices: FloorPlanDrawVertex[]
  mapVertices: MapDrawVertex[]
  geometryType: FeatureGeometryType | null
  drawPhase: DrawPhase
  geometryConfirmed: boolean
  draftMarkerColor: string
  setDraftMarkerColor: (color: string) => void
  startDraw: (floorPlanId?: FloorPlanId) => void
  cancelDraw: () => void
  toggleDraw: (floorPlanId?: FloorPlanId) => void
  startEditFeature: (asset: SpatialAsset) => void
  cancelEditFeature: () => void
  requestEditConfirm: () => void
  confirmEditGeometry: () => void
  updateFloorPlanVertex: (index: number, x: number, y: number) => void
  updateMapVertex: (index: number, lng: number, lat: number) => void
  addFloorPlanVertex: (floorPlanId: FloorPlanId, x: number, y: number) => void
  addMapVertex: (lng: number, lat: number) => void
  finishLine: () => void
  closePolygon: () => void
  confirmGeometry: () => void
  redrawGeometry: () => void
  isNearFirstFloorPlanVertex: (
    floorPlanId: FloorPlanId,
    x: number,
    y: number,
    toleranceNorm: number,
  ) => boolean
  isNearFirstMapVertex: (lng: number, lat: number, tolerancePx: number, project: (lng: number, lat: number) => { x: number; y: number }) => boolean
}

const FeatureDrawContext = createContext<FeatureDrawContextValue | null>(null)

type DrawState = {
  isDrawing: boolean
  isEditingFeature: boolean
  editingFeatureId: string | null
  draftFeatureId: string | null
  floorPlanId: FloorPlanId | null
  floorPlanVertices: FloorPlanDrawVertex[]
  mapVertices: MapDrawVertex[]
  geometryType: FeatureGeometryType | null
  drawPhase: DrawPhase
  geometryConfirmed: boolean
  draftMarkerColor: string
  editSnapshot: EditSnapshot | null
}

const INITIAL_STATE: DrawState = {
  isDrawing: false,
  isEditingFeature: false,
  editingFeatureId: null,
  draftFeatureId: null,
  floorPlanId: null,
  floorPlanVertices: [],
  mapVertices: [],
  geometryType: null,
  drawPhase: 'idle',
  geometryConfirmed: false,
  draftMarkerColor: DEFAULT_MARKER_COLOR,
  editSnapshot: null,
}

function isActiveSession(s: DrawState): boolean {
  return s.isDrawing || s.isEditingFeature
}

export function FeatureDrawProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(INITIAL_STATE)

  const resetState = useCallback(() => {
    setState(INITIAL_STATE)
  }, [])

  const startDraw = useCallback((floorPlanId?: FloorPlanId) => {
    setState({
      ...INITIAL_STATE,
      isDrawing: true,
      draftFeatureId: crypto.randomUUID(),
      floorPlanId: floorPlanId ?? null,
      drawPhase: 'collecting',
    })
  }, [])

  const cancelDraw = useCallback(() => {
    resetState()
  }, [resetState])

  const toggleDraw = useCallback(
    (floorPlanId?: FloorPlanId) => {
      if (state.isDrawing) {
        cancelDraw()
      } else if (!state.isEditingFeature) {
        startDraw(floorPlanId)
      }
    },
    [cancelDraw, startDraw, state.isDrawing, state.isEditingFeature],
  )

  const startEditFeature = useCallback((asset: SpatialAsset) => {
    const loaded = loadAssetIntoDrawState(asset)
    const snapshot: EditSnapshot = {
      floorPlanId: loaded.floorPlanId,
      floorPlanVertices: loaded.floorPlanVertices.map((v) => ({ ...v })),
      mapVertices: loaded.mapVertices.map((v) => ({ ...v })),
      geometryType: loaded.geometryType,
    }
    setState({
      ...INITIAL_STATE,
      isEditingFeature: true,
      editingFeatureId: asset.id,
      floorPlanId: loaded.floorPlanId,
      floorPlanVertices: loaded.floorPlanVertices,
      mapVertices: loaded.mapVertices,
      geometryType: loaded.geometryType,
      drawPhase: 'editing',
      geometryConfirmed: false,
      draftMarkerColor: loaded.draftMarkerColor,
      editSnapshot: snapshot,
    })
  }, [])

  const cancelEditFeature = useCallback(() => {
    setState(INITIAL_STATE)
  }, [])

  const setDraftMarkerColor = useCallback((color: string) => {
    setState((s) => ({ ...s, draftMarkerColor: normalizeMarkerColor(color) }))
  }, [])

  const updateFloorPlanVertex = useCallback((index: number, x: number, y: number) => {
    setState((s) => {
      if (!s.isEditingFeature || s.drawPhase !== 'editing') return s
      if (index < 0 || index >= s.floorPlanVertices.length) return s
      const next = [...s.floorPlanVertices]
      next[index] = { x, y }
      return { ...s, floorPlanVertices: next, geometryConfirmed: false }
    })
  }, [])

  const updateMapVertex = useCallback((index: number, lng: number, lat: number) => {
    setState((s) => {
      if (!s.isEditingFeature || s.drawPhase !== 'editing') return s
      if (index < 0 || index >= s.mapVertices.length) return s
      const next = [...s.mapVertices]
      next[index] = { lng, lat }
      return { ...s, mapVertices: next, geometryConfirmed: false }
    })
  }, [])

  const requestEditConfirm = useCallback(() => {
    setState((s) => {
      if (!s.isEditingFeature || s.geometryType == null) return s
      const count = s.floorPlanVertices.length + s.mapVertices.length
      if (count === 0) return s
      return { ...s, drawPhase: 'awaitingConfirm', geometryConfirmed: false }
    })
  }, [])

  const confirmEditGeometry = useCallback(() => {
    setState((s) => {
      if (!s.isEditingFeature || s.drawPhase !== 'awaitingConfirm' || s.geometryType == null) return s
      return { ...s, drawPhase: 'confirmed', geometryConfirmed: true }
    })
  }, [])

  const addFloorPlanVertex = useCallback((floorPlanId: FloorPlanId, x: number, y: number) => {
    setState((s) => {
      if (!isActiveSession(s) || s.drawPhase === 'confirmed' || s.drawPhase === 'editing') return s

      if (s.drawPhase === 'awaitingConfirm' && s.geometryType === 'point' && s.floorPlanVertices.length === 1) {
        return {
          ...s,
          floorPlanId,
          floorPlanVertices: [...s.floorPlanVertices, { x, y }],
          geometryType: 'line',
          drawPhase: 'collecting',
          geometryConfirmed: false,
        }
      }

      if (s.drawPhase === 'awaitingConfirm') return s

      const nextVertices = [...s.floorPlanVertices, { x, y }]
      if (nextVertices.length === 1) {
        return {
          ...s,
          floorPlanId,
          floorPlanVertices: nextVertices,
          geometryType: 'point',
          drawPhase: 'awaitingConfirm',
          geometryConfirmed: false,
        }
      }

      return {
        ...s,
        floorPlanId,
        floorPlanVertices: nextVertices,
        geometryType: 'line',
        drawPhase: 'collecting',
        geometryConfirmed: false,
      }
    })
  }, [])

  const addMapVertex = useCallback((lng: number, lat: number) => {
    setState((s) => {
      if (!isActiveSession(s) || s.drawPhase === 'confirmed' || s.drawPhase === 'editing') return s

      if (s.drawPhase === 'awaitingConfirm' && s.geometryType === 'point' && s.mapVertices.length === 1) {
        return {
          ...s,
          mapVertices: [...s.mapVertices, { lng, lat }],
          geometryType: 'line',
          drawPhase: 'collecting',
          geometryConfirmed: false,
        }
      }

      if (s.drawPhase === 'awaitingConfirm') return s

      const nextVertices = [...s.mapVertices, { lng, lat }]
      if (nextVertices.length === 1) {
        return {
          ...s,
          mapVertices: nextVertices,
          geometryType: 'point',
          drawPhase: 'awaitingConfirm',
          geometryConfirmed: false,
        }
      }

      return {
        ...s,
        mapVertices: nextVertices,
        geometryType: 'line',
        drawPhase: 'collecting',
        geometryConfirmed: false,
      }
    })
  }, [])

  const finishLine = useCallback(() => {
    setState((s) => {
      if (!isActiveSession(s) || s.floorPlanVertices.length + s.mapVertices.length < 2) return s
      return { ...s, geometryType: 'line', drawPhase: 'awaitingConfirm', geometryConfirmed: false }
    })
  }, [])

  const closePolygon = useCallback(() => {
    setState((s) => {
      const count = s.floorPlanVertices.length + s.mapVertices.length
      if (!isActiveSession(s) || count < 3) return s
      return { ...s, geometryType: 'polygon', drawPhase: 'awaitingConfirm', geometryConfirmed: false }
    })
  }, [])

  const confirmGeometry = useCallback(() => {
    setState((s) => {
      if (s.drawPhase !== 'awaitingConfirm' || s.geometryType == null) return s
      return {
        ...s,
        drawPhase: 'confirmed',
        geometryConfirmed: true,
      }
    })
  }, [])

  const redrawGeometry = useCallback(() => {
    setState((s) => ({
      ...s,
      floorPlanVertices: [],
      mapVertices: [],
      geometryType: null,
      drawPhase: 'collecting',
      geometryConfirmed: false,
    }))
  }, [])

  const isNearFirstFloorPlanVertex = useCallback(
    (floorPlanId: FloorPlanId, x: number, y: number, toleranceNorm: number) => {
      const first = state.floorPlanVertices[0]
      if (first == null || state.floorPlanVertices.length < 3) return false
      if (state.floorPlanId !== floorPlanId) return false
      const dx = first.x - x
      const dy = first.y - y
      return Math.hypot(dx, dy) <= toleranceNorm
    },
    [state.floorPlanId, state.floorPlanVertices],
  )

  const isNearFirstMapVertex = useCallback(
    (
      lng: number,
      lat: number,
      tolerancePx: number,
      project: (lng: number, lat: number) => { x: number; y: number },
    ) => {
      const first = state.mapVertices[0]
      if (first == null || state.mapVertices.length < 3) return false
      const a = project(first.lng, first.lat)
      const b = project(lng, lat)
      return Math.hypot(a.x - b.x, a.y - b.y) <= tolerancePx
    },
    [state.mapVertices],
  )

  const value = useMemo(
    (): FeatureDrawContextValue => ({
      isDrawing: state.isDrawing,
      isEditingFeature: state.isEditingFeature,
      editingFeatureId: state.editingFeatureId,
      draftFeatureId: state.draftFeatureId,
      floorPlanId: state.floorPlanId,
      floorPlanVertices: state.floorPlanVertices,
      mapVertices: state.mapVertices,
      geometryType: state.geometryType,
      drawPhase: state.drawPhase,
      geometryConfirmed: state.geometryConfirmed,
      draftMarkerColor: state.draftMarkerColor,
      setDraftMarkerColor,
      startDraw,
      cancelDraw,
      toggleDraw,
      startEditFeature,
      cancelEditFeature,
      requestEditConfirm,
      confirmEditGeometry,
      updateFloorPlanVertex,
      updateMapVertex,
      addFloorPlanVertex,
      addMapVertex,
      finishLine,
      closePolygon,
      confirmGeometry,
      redrawGeometry,
      isNearFirstFloorPlanVertex,
      isNearFirstMapVertex,
    }),
    [
      state,
      setDraftMarkerColor,
      startDraw,
      cancelDraw,
      toggleDraw,
      startEditFeature,
      cancelEditFeature,
      requestEditConfirm,
      confirmEditGeometry,
      updateFloorPlanVertex,
      updateMapVertex,
      addFloorPlanVertex,
      addMapVertex,
      finishLine,
      closePolygon,
      confirmGeometry,
      redrawGeometry,
      isNearFirstFloorPlanVertex,
      isNearFirstMapVertex,
    ],
  )

  return <FeatureDrawContext.Provider value={value}>{children}</FeatureDrawContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useFeatureDraw(): FeatureDrawContextValue {
  const ctx = useContext(FeatureDrawContext)
  if (ctx == null) {
    return {
      ...INITIAL_STATE,
      setDraftMarkerColor: () => {},
      startDraw: () => {},
      cancelDraw: () => {},
      toggleDraw: () => {},
      startEditFeature: () => {},
      cancelEditFeature: () => {},
      requestEditConfirm: () => {},
      confirmEditGeometry: () => {},
      updateFloorPlanVertex: () => {},
      updateMapVertex: () => {},
      addFloorPlanVertex: () => {},
      addMapVertex: () => {},
      finishLine: () => {},
      closePolygon: () => {},
      confirmGeometry: () => {},
      redrawGeometry: () => {},
      isNearFirstFloorPlanVertex: () => false,
      isNearFirstMapVertex: () => false,
    }
  }
  return ctx
}
