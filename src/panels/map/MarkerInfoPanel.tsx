import { useCallback, useMemo } from 'react'

import { FeatureMarkerColorField } from '@/components/FeatureMarkerColorField'
import { useActiveProject } from '@/context/ActiveProjectContext'
import { useProjectFloorPlans } from '@/context/ProjectFloorPlansContext'
import { useMediaMarkerFlow } from '@/context/MediaMarkerFlowContext'
import type { SpatialAsset } from '@/data/sampleAssets'
import { formatFloorPlanCoord } from '@/lib/formatFloorPlanCoord'
import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
  featureMetadataInputClassName,
  featureMetadataSelectClassName,
} from '@/panels/library/featureMetadata/styles'
import { getFloorPlanOptionsForProject, type FloorPlanId } from '@/panels/map/mapFloorPlans'

type MarkerInfoPanelProps = {
  parentAsset: SpatialAsset | null
  onSaveSuccess?: () => void
}

export function MarkerInfoPanel({ parentAsset, onSaveSuccess }: MarkerInfoPanelProps) {
  const { project, projectId } = useActiveProject()
  const { getFloorPlans } = useProjectFloorPlans()
  const userFloorPlans = getFloorPlans(projectId)
  const floorPlanOptions = useMemo(
    () => getFloorPlanOptionsForProject(projectId, userFloorPlans),
    [projectId, userFloorPlans],
  )
  const isBuildingProject = project.projectType === 'Building'
  const {
    panelPhase,
    draftMarker,
    updateDraftMarker,
    confirmPlacement,
    saveMarker,
    openCancelMarkerConfirmation,
  } = useMediaMarkerFlow()

  const handleConfirm = useCallback(() => {
    const count = parentAsset?.mediaMarkers?.length ?? 0
    confirmPlacement(count)
  }, [confirmPlacement, parentAsset?.mediaMarkers?.length])

  const handleSave = useCallback(() => {
    const saved = saveMarker()
    if (saved == null) return
    onSaveSuccess?.()
  }, [onSaveSuccess, saveMarker])

  if (panelPhase === 'confirm') {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-panel-padding text-center">
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

  const floorPlanId = draftMarker.floorPlanPosition?.floorPlanId

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
            <div className="grid min-w-0 grid-cols-[2fr_1fr_1fr] items-end gap-x-[16px] sm:col-span-2">
              <label className="block min-w-0">
                <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                  Floor
                </span>
                <select
                  className={featureMetadataSelectClassName}
                  value={floorPlanId ?? ''}
                  onChange={(e) => {
                    const nextFloorPlanId = e.target.value as FloorPlanId
                    updateDraftMarker({
                      floorPlanPosition: {
                        floorPlanId: nextFloorPlanId,
                        x: draftMarker.floorPlanPosition?.x ?? 0,
                        y: draftMarker.floorPlanPosition?.y ?? 0,
                      },
                    })
                  }}
                  aria-label="Floor plan"
                >
                  {floorPlanOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block min-w-0">
                <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                  X
                </span>
                <input
                  type="text"
                  readOnly
                  className={featureMetadataInputClassName + ' bg-area-highlight'}
                  value={formatFloorPlanCoord(draftMarker.floorPlanPosition?.x)}
                  aria-label="Floor plan X (normalized 0–1)"
                />
              </label>
              <label className="block min-w-0">
                <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                  Y
                </span>
                <input
                  type="text"
                  readOnly
                  className={featureMetadataInputClassName + ' bg-area-highlight'}
                  value={formatFloorPlanCoord(draftMarker.floorPlanPosition?.y)}
                  aria-label="Floor plan Y (normalized 0–1)"
                />
              </label>
            </div>
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

          <FeatureMarkerColorField
            value={draftMarker.color ?? '#2563eb'}
            onChange={(color) => updateDraftMarker({ color, isPreliminary: false })}
          />
        </div>
      </div>

      <div className="border-t border-stroke bg-panel px-panel-padding py-3">
        <div className={featureMetadataFooterActionsClassName}>
          <button
            type="button"
            onClick={openCancelMarkerConfirmation}
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
    </div>
  )
}
