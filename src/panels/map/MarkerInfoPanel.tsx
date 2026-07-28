import { useCallback, useMemo, useState } from 'react'

import { FeatureMarkerColorField } from '@/components/FeatureMarkerColorField'
import { useActiveProject } from '@/context/ActiveProjectContext'
import { useProjectFloorPlans } from '@/context/ProjectFloorPlansContext'
import { useMediaMarkerFlow } from '@/context/MediaMarkerFlowContext'
import type { MediaAnnotationMarker, SpatialAsset } from '@/data/sampleAssets'
import { formatFloorPlanCoord } from '@/lib/formatFloorPlanCoord'
import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
  featureMetadataInputClassName,
} from '@/panels/library/featureMetadata/styles'
import { floorPlanDisplayLabel } from '@/panels/map/mapFloorPlans'

type MarkerInfoPanelProps = {
  parentAsset: SpatialAsset | null
}

function isMarkerDraftDirty(
  draft: Partial<MediaAnnotationMarker>,
  saved: MediaAnnotationMarker | null,
): boolean {
  if (saved == null) return false
  return (
    (draft.name ?? '') !== saved.name ||
    (draft.color ?? '') !== saved.color ||
    draft.mediaPosition?.x !== saved.mediaPosition?.x ||
    draft.mediaPosition?.y !== saved.mediaPosition?.y ||
    draft.panoPosition?.yawDeg !== saved.panoPosition?.yawDeg ||
    draft.panoPosition?.pitchDeg !== saved.panoPosition?.pitchDeg ||
    draft.floorPlanPosition?.x !== saved.floorPlanPosition?.x ||
    draft.floorPlanPosition?.y !== saved.floorPlanPosition?.y ||
    draft.mapPosition?.lng !== saved.mapPosition?.lng ||
    draft.mapPosition?.lat !== saved.mapPosition?.lat
  )
}

export function MarkerInfoPanel({ parentAsset }: MarkerInfoPanelProps) {
  const { project, projectId } = useActiveProject()
  const { getFloorPlans } = useProjectFloorPlans()
  const userFloorPlans = getFloorPlans(projectId)
  const isBuildingProject = project.projectType === 'Building'
  const {
    panelPhase,
    draftMarker,
    updateDraftMarker,
    confirmPlacement,
    saveMarker,
    cancelFlow,
  } = useMediaMarkerFlow()

  const savedSnapshot = useMemo((): MediaAnnotationMarker | null => {
    if (draftMarker?.id == null || draftMarker.isPreliminary) return null
    return {
      id: draftMarker.id,
      name: draftMarker.name ?? 'Marker',
      dateAdded: draftMarker.dateAdded ?? '',
      color: draftMarker.color ?? '#2563eb',
      mediaPosition: draftMarker.mediaPosition,
      panoPosition: draftMarker.panoPosition,
      floorPlanPosition: draftMarker.floorPlanPosition,
      mapPosition: draftMarker.mapPosition,
    }
  }, [draftMarker])

  const [baseline, setBaseline] = useState<MediaAnnotationMarker | null>(null)

  const isDirty = useMemo(
    () => isMarkerDraftDirty(draftMarker ?? {}, baseline ?? savedSnapshot),
    [baseline, draftMarker, savedSnapshot],
  )

  const handleConfirm = useCallback(() => {
    const count = parentAsset?.mediaMarkers?.length ?? 0
    confirmPlacement(count)
    setBaseline(null)
  }, [confirmPlacement, parentAsset?.mediaMarkers?.length])

  const handleSave = useCallback(() => {
    const saved = saveMarker()
    if (saved == null) return
    setBaseline(saved)
  }, [saveMarker])

  const handleCancelEdits = useCallback(() => {
    if (baseline != null) {
      updateDraftMarker({ ...baseline, isPreliminary: false })
      return
    }
    if (savedSnapshot != null) {
      updateDraftMarker({ ...savedSnapshot, isPreliminary: false })
    }
  }, [baseline, savedSnapshot, updateDraftMarker])

  if (panelPhase === 'confirm') {
    return (
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-4 p-panel-padding">
        <p className="text-fg font-sans text-standard">
          Adjust marker location on the media or map if necessary
        </p>
        <button
          type="button"
          onClick={handleConfirm}
          className={
            PRIMARY_BUTTON_CLASS +
            ' h-8 w-fit rounded-panel px-4 text-standard focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'
          }
        >
          Confirm Marker Locations
        </button>
      </div>
    )
  }

  if (panelPhase !== 'metadata' || draftMarker == null) {
    return null
  }

  const floorLabel =
    isBuildingProject && draftMarker.floorPlanPosition != null
      ? floorPlanDisplayLabel(
          draftMarker.floorPlanPosition.floorPlanId,
          userFloorPlans,
        )
      : null

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto p-panel-padding">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="min-w-0 sm:col-span-2">
            <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
              Name
            </span>
            <input
              type="text"
              className={featureMetadataInputClassName}
              value={draftMarker.name ?? ''}
              onChange={(e) => updateDraftMarker({ name: e.target.value })}
            />
          </label>

          {isBuildingProject ? (
            <>
              <label className="min-w-0">
                <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                  X
                </span>
                <input
                  type="text"
                  readOnly
                  className={featureMetadataInputClassName + ' bg-area-highlight'}
                  value={formatFloorPlanCoord(draftMarker.floorPlanPosition?.x)}
                />
              </label>
              <label className="min-w-0">
                <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                  Y
                </span>
                <input
                  type="text"
                  readOnly
                  className={featureMetadataInputClassName + ' bg-area-highlight'}
                  value={formatFloorPlanCoord(draftMarker.floorPlanPosition?.y)}
                />
              </label>
              {floorLabel != null ? (
                <label className="min-w-0 sm:col-span-2">
                  <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                    Floor
                  </span>
                  <input
                    type="text"
                    readOnly
                    className={featureMetadataInputClassName + ' bg-area-highlight'}
                    value={floorLabel}
                  />
                </label>
              ) : null}
            </>
          ) : (
            <>
              <label className="min-w-0">
                <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                  Latitude
                </span>
                <input
                  type="text"
                  readOnly
                  className={featureMetadataInputClassName + ' bg-area-highlight'}
                  value={
                    draftMarker.mapPosition?.lat != null
                      ? draftMarker.mapPosition.lat.toFixed(6)
                      : ''
                  }
                />
              </label>
              <label className="min-w-0">
                <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                  Longitude
                </span>
                <input
                  type="text"
                  readOnly
                  className={featureMetadataInputClassName + ' bg-area-highlight'}
                  value={
                    draftMarker.mapPosition?.lng != null
                      ? draftMarker.mapPosition.lng.toFixed(6)
                      : ''
                  }
                />
              </label>
            </>
          )}

          <label className="min-w-0 sm:col-span-2">
            <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
              Date added
            </span>
            <input
              type="text"
              readOnly
              className={featureMetadataInputClassName + ' bg-area-highlight'}
              value={draftMarker.dateAdded ?? ''}
            />
          </label>

          <FeatureMarkerColorField
            value={draftMarker.color ?? '#2563eb'}
            onChange={(color) => updateDraftMarker({ color, isPreliminary: false })}
          />
        </div>
      </div>

      {isDirty ? (
        <div className="border-t border-stroke bg-panel px-panel-padding py-3">
          <div className={featureMetadataFooterActionsClassName}>
            <button
              type="button"
              onClick={handleCancelEdits}
              className={featureMetadataFooterCancelButtonClass}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={
                PRIMARY_BUTTON_CLASS +
                ' h-8 rounded-panel px-4 text-standard focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'
              }
            >
              Save
            </button>
          </div>
        </div>
      ) : null}

      <div className="sr-only">
        <button type="button" onClick={cancelFlow}>
          Close marker panel
        </button>
      </div>
    </div>
  )
}
