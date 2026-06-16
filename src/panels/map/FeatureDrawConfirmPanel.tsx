import { getGeometryTypeLabel, type FeatureGeometryType, type SpatialAsset } from '@/data/sampleAssets'
import type { FloorPlanId } from '@/panels/map/mapFloorPlans'
import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'
import { useFeatureDraw } from '@/context/FeatureDrawContext'

function getConfirmLabel(type: FeatureGeometryType | null, isEditing: boolean): string {
  if (type == null) return isEditing ? 'Confirm updated shape' : 'Confirm shape'
  const label = getGeometryTypeLabel(type).toLowerCase()
  return isEditing ? `Confirm updated ${label}` : `Confirm ${label}`
}

function canConfirmGeometry(type: FeatureGeometryType, vertexCount: number): boolean {
  if (type === 'point') return vertexCount >= 1
  if (type === 'line') return vertexCount >= 2
  return vertexCount >= 3
}

export function FeatureDrawConfirmPanel({ featureTitle }: { featureTitle?: string }) {
  const {
    drawPhase,
    geometryType,
    floorPlanVertices,
    mapVertices,
    isEditingFeature,
    confirmGeometry,
    confirmEditGeometry,
    redrawGeometry,
    canUndoDraw,
    undoDrawMove,
    cancelDraw,
    cancelEditFeature,
  } = useFeatureDraw()

  if (geometryType == null) {
    return null
  }

  const vertexCount = floorPlanVertices.length + mapVertices.length
  const showForNewDraw =
    !isEditingFeature && drawPhase === 'collecting' && vertexCount > 0
  const showForEdit = isEditingFeature && drawPhase === 'awaitingConfirm'

  if (!showForNewDraw && !showForEdit) {
    return null
  }

  const onConfirm = isEditingFeature ? confirmEditGeometry : confirmGeometry
  const onCancel = isEditingFeature ? cancelEditFeature : cancelDraw
  const confirmEnabled = canConfirmGeometry(geometryType, vertexCount)

  return (
    <div
      className="pointer-events-auto absolute z-30 w-56 rounded-panel border border-stroke bg-panel p-4 shadow-sm"
      style={{
        right: 'var(--spacing-panel-padding)',
        top: '50%',
        transform: 'translateY(-50%)',
      }}
      role="dialog"
      aria-label={isEditingFeature ? 'Confirm updated feature' : 'Confirm drawn feature'}
    >
      <h3 className="font-sans text-standard font-bold text-fg">
        {getConfirmLabel(geometryType, isEditingFeature)}
      </h3>
      {isEditingFeature && featureTitle != null && featureTitle.length > 0 ? (
        <p className="text-fg-muted mt-0.5 truncate font-sans text-standard">{featureTitle}</p>
      ) : null}
      <p className="text-fg-muted mt-1 font-sans text-standard">
        {vertexCount} {vertexCount === 1 ? 'vertex' : 'vertices'}
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={!confirmEnabled}
          className={
            PRIMARY_BUTTON_CLASS +
            ' h-8 w-full rounded-panel text-standard focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
          }
        >
          Confirm
        </button>
        <button
          type="button"
          onClick={isEditingFeature ? redrawGeometry : undoDrawMove}
          disabled={!isEditingFeature && !canUndoDraw}
          className={
            'text-fg-highlight hover:bg-area-highlight h-8 w-full rounded-panel border border-stroke bg-panel font-sans text-standard transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
          }
        >
          {isEditingFeature ? 'Redraw' : 'Undo'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-fg-muted hover:text-fg h-8 w-full rounded-panel font-sans text-standard transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export function createDraftDrawnAsset(id: string, markerColor: string): SpatialAsset {
  return {
    id,
    kind: 'image',
    title: 'Untitled feature',
    dateUploaded: new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    markerColor,
  }
}

export function buildDrawnAssetFromSession(
  draft: SpatialAsset,
  geometryType: FeatureGeometryType,
  floorPlanId: FloorPlanId | null,
  floorPlanVertices: { x: number; y: number }[],
  mapVertices: { lng: number; lat: number }[],
): SpatialAsset {
  const base: SpatialAsset = {
    ...draft,
    geometryType,
    fileUrl: undefined,
  }

  if (floorPlanVertices.length > 0 && floorPlanId != null) {
    base.floorPlanGeometry = {
      floorPlanId,
      coordinates: floorPlanVertices.map((v) => ({ x: v.x, y: v.y })),
    }
    if (geometryType === 'point' && floorPlanVertices[0] != null) {
      base.floorPlanPosition = {
        floorPlanId,
        x: floorPlanVertices[0].x,
        y: floorPlanVertices[0].y,
      }
    }
  }

  if (mapVertices.length > 0) {
    base.mapGeometry = {
      coordinates: mapVertices.map((v) => ({ lng: v.lng, lat: v.lat })),
    }
    if (geometryType === 'point' && mapVertices[0] != null) {
      base.captureLng = mapVertices[0].lng
      base.captureLat = mapVertices[0].lat
    }
  }

  return base
}
