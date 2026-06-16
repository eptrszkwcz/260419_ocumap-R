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

type DrawUndoEntry =
  | { type: 'addVertex'; surface: 'floorPlan' | 'map' }
  | { type: 'moveVertex'; surface: 'floorPlan' | 'map'; index: number; previous: FloorPlanDrawVertex | MapDrawVertex }
  | { type: 'closePolygon' }

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
  closePolygon: () => void
  confirmGeometry: () => void
  redrawGeometry: () => void
  canUndoDraw: boolean
  undoDrawMove: () => void
  recordDrawVertexMove: (
    surface: 'floorPlan' | 'map',
    index: number,
    previous: FloorPlanDrawVertex | MapDrawVertex,
  ) => void
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
  drawUndoStack: DrawUndoEntry[]
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
  drawUndoStack: [],
}

function isActiveSession(s: DrawState): boolean {
  return s.isDrawing || s.isEditingFeature
}

function isValidGeometryForConfirm(
  geometryType: FeatureGeometryType,
  vertexCount: number,
): boolean {
  if (geometryType === 'point') return vertexCount >= 1
  if (geometryType === 'line') return vertexCount >= 2
  return vertexCount >= 3
}

function geometryTypeForVertexCount(count: number): FeatureGeometryType | null {
  if (count === 0) return null
  if (count === 1) return 'point'
  return 'line'
}

function pushDrawUndo(stack: DrawUndoEntry[], entry: DrawUndoEntry): DrawUndoEntry[] {
  return [...stack, entry]
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
      const canEdit = s.isEditingFeature && s.drawPhase === 'editing'
      const canCollect =
        s.isDrawing && s.drawPhase === 'collecting' && s.geometryType !== 'polygon'
      if (!canEdit && !canCollect) return s
      if (index < 0 || index >= s.floorPlanVertices.length) return s
      const next = [...s.floorPlanVertices]
      next[index] = { x, y }
      return { ...s, floorPlanVertices: next, geometryConfirmed: false }
    })
  }, [])

  const updateMapVertex = useCallback((index: number, lng: number, lat: number) => {
    setState((s) => {
      const canEdit = s.isEditingFeature && s.drawPhase === 'editing'
      const canCollect =
        s.isDrawing && s.drawPhase === 'collecting' && s.geometryType !== 'polygon'
      if (!canEdit && !canCollect) return s
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
      if (!isActiveSession(s) || s.drawPhase !== 'collecting') return s
      if (s.geometryType === 'polygon') return s

      const nextVertices = [...s.floorPlanVertices, { x, y }]
      const geometryType: FeatureGeometryType = nextVertices.length === 1 ? 'point' : 'line'

      return {
        ...s,
        floorPlanId,
        floorPlanVertices: nextVertices,
        geometryType,
        geometryConfirmed: false,
        drawUndoStack: s.isDrawing
          ? pushDrawUndo(s.drawUndoStack, { type: 'addVertex', surface: 'floorPlan' })
          : s.drawUndoStack,
      }
    })
  }, [])

  const addMapVertex = useCallback((lng: number, lat: number) => {
    setState((s) => {
      if (!isActiveSession(s) || s.drawPhase !== 'collecting') return s
      if (s.geometryType === 'polygon') return s

      const nextVertices = [...s.mapVertices, { lng, lat }]
      const geometryType: FeatureGeometryType = nextVertices.length === 1 ? 'point' : 'line'

      return {
        ...s,
        mapVertices: nextVertices,
        geometryType,
        geometryConfirmed: false,
        drawUndoStack: s.isDrawing
          ? pushDrawUndo(s.drawUndoStack, { type: 'addVertex', surface: 'map' })
          : s.drawUndoStack,
      }
    })
  }, [])

  const closePolygon = useCallback(() => {
    setState((s) => {
      const count = s.floorPlanVertices.length + s.mapVertices.length
      if (!isActiveSession(s) || s.drawPhase !== 'collecting' || count < 3) return s
      return {
        ...s,
        geometryType: 'polygon',
        geometryConfirmed: false,
        drawUndoStack: s.isDrawing
          ? pushDrawUndo(s.drawUndoStack, { type: 'closePolygon' })
          : s.drawUndoStack,
      }
    })
  }, [])

  const recordDrawVertexMove = useCallback(
    (surface: 'floorPlan' | 'map', index: number, previous: FloorPlanDrawVertex | MapDrawVertex) => {
      setState((s) => {
        if (!s.isDrawing || s.drawPhase !== 'collecting' || s.geometryType === 'polygon') return s
        return {
          ...s,
          drawUndoStack: pushDrawUndo(s.drawUndoStack, {
            type: 'moveVertex',
            surface,
            index,
            previous,
          }),
        }
      })
    },
    [],
  )

  const undoDrawMove = useCallback(() => {
    setState((s) => {
      if (!s.isDrawing || s.drawPhase !== 'collecting' || s.drawUndoStack.length === 0) return s

      const entry = s.drawUndoStack[s.drawUndoStack.length - 1]
      const nextStack = s.drawUndoStack.slice(0, -1)

      if (entry.type === 'addVertex') {
        if (entry.surface === 'floorPlan') {
          const nextVertices = s.floorPlanVertices.slice(0, -1)
          return {
            ...s,
            floorPlanVertices: nextVertices,
            geometryType: geometryTypeForVertexCount(nextVertices.length),
            geometryConfirmed: false,
            drawUndoStack: nextStack,
          }
        }
        const nextVertices = s.mapVertices.slice(0, -1)
        return {
          ...s,
          mapVertices: nextVertices,
          geometryType: geometryTypeForVertexCount(nextVertices.length),
          geometryConfirmed: false,
          drawUndoStack: nextStack,
        }
      }

      if (entry.type === 'moveVertex') {
        if (entry.surface === 'floorPlan') {
          if (entry.index < 0 || entry.index >= s.floorPlanVertices.length) return s
          const prev = entry.previous as FloorPlanDrawVertex
          const nextVertices = [...s.floorPlanVertices]
          nextVertices[entry.index] = { x: prev.x, y: prev.y }
          return {
            ...s,
            floorPlanVertices: nextVertices,
            geometryConfirmed: false,
            drawUndoStack: nextStack,
          }
        }
        if (entry.index < 0 || entry.index >= s.mapVertices.length) return s
        const prev = entry.previous as MapDrawVertex
        const nextVertices = [...s.mapVertices]
        nextVertices[entry.index] = { lng: prev.lng, lat: prev.lat }
        return {
          ...s,
          mapVertices: nextVertices,
          geometryConfirmed: false,
          drawUndoStack: nextStack,
        }
      }

      return {
        ...s,
        geometryType: 'line',
        geometryConfirmed: false,
        drawUndoStack: nextStack,
      }
    })
  }, [])

  const confirmGeometry = useCallback(() => {
    setState((s) => {
      if (s.drawPhase !== 'collecting' && s.drawPhase !== 'awaitingConfirm') return s
      if (s.geometryType == null) return s
      const count = s.floorPlanVertices.length + s.mapVertices.length
      if (!isValidGeometryForConfirm(s.geometryType, count)) return s
      return {
        ...s,
        drawPhase: 'confirmed',
        geometryConfirmed: true,
        drawUndoStack: [],
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
      drawUndoStack: [],
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
      closePolygon,
      confirmGeometry,
      redrawGeometry,
      canUndoDraw: state.drawUndoStack.length > 0,
      undoDrawMove,
      recordDrawVertexMove,
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
      closePolygon,
      confirmGeometry,
      redrawGeometry,
      undoDrawMove,
      recordDrawVertexMove,
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
      closePolygon: () => {},
      confirmGeometry: () => {},
      redrawGeometry: () => {},
      canUndoDraw: false,
      undoDrawMove: () => {},
      recordDrawVertexMove: () => {},
      isNearFirstFloorPlanVertex: () => false,
      isNearFirstMapVertex: () => false,
    }
  }
  return ctx
}
