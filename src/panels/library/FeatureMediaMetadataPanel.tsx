import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useActiveProject } from '@/context/ActiveProjectContext'
import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import { useFloorPlanLocationPick } from '@/context/FloorPlanLocationPickContext'
import { useMapLocationPick } from '@/context/MapLocationPickContext'
import { useMarkerStylePreview } from '@/context/MarkerStylePreviewContext'
import { useViewDirectionAdjust } from '@/context/ViewDirectionAdjustContext'
import type { SpatialAsset } from '@/data/sampleAssets'
import { formatDisplayDateFromIsoDate } from '@/lib/formatDisplayDateFromIsoDate'
import { formatFloorPlanCoord } from '@/lib/formatFloorPlanCoord'
import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'
import { DEFAULT_FLOOR_PLAN_ID } from '@/panels/map/mapFloorPlans'
import { normalizeMarkerColor } from '@/panels/map/markerColors'
import {
  draftFromAsset,
  isFeatureMetadataDraftDirty,
} from '@/panels/library/featureMetadata/draftUtils'
import { FeatureMetadataForm } from '@/panels/library/featureMetadata/FeatureMetadataForm'
import {
  extensionLabelFromMimeAndKind,
  fileSizeLabel,
  resolutionLabel,
} from '@/panels/library/featureMetadata/fileInfo'
import { mapboxTokenPresent } from '@/panels/library/featureMetadata/mapboxToken'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
} from '@/panels/library/featureMetadata/styles'

type FeatureMediaMetadataPanelProps = {
  asset: SpatialAsset
  onSave: (updated: SpatialAsset) => void
  /** When true, starts map/plan location pick once after the panel opens. */
  autoStartLocationPick?: boolean
}

export function FeatureMediaMetadataPanel({
  asset,
  onSave,
  autoStartLocationPick = false,
}: FeatureMediaMetadataPanelProps) {
  const { project } = useActiveProject()
  const isBuildingProject = project.projectType === 'Building'
  const { setOpenedFeatureId } = useFeatureMapHover()
  const { isPickingLocation, startLocationPick, cancelLocationPick } = useMapLocationPick()
  const {
    isPickingFloorPlanLocation,
    startFloorPlanLocationPick,
    cancelFloorPlanLocationPick,
  } = useFloorPlanLocationPick()
  const { setMarkerStylePreview, clearMarkerStylePreview } = useMarkerStylePreview()
  const {
    isAdjustingDirection,
    adjustingFeatureId,
    startDirectionAdjust,
    cancelDirectionAdjust,
  } = useViewDirectionAdjust()
  const [draft, setDraft] = useState(() => draftFromAsset(asset, isBuildingProject))
  const autoPickStartedRef = useRef(false)
  const isDirty = useMemo(
    () => isFeatureMetadataDraftDirty(draft, asset, isBuildingProject),
    [asset, draft, isBuildingProject],
  )

  useEffect(() => {
    setMarkerStylePreview({ featureId: asset.id, color: draft.markerColor })
    return () => clearMarkerStylePreview()
  }, [asset.id, draft.markerColor, setMarkerStylePreview, clearMarkerStylePreview])

  useEffect(() => {
    autoPickStartedRef.current = false
  }, [asset.id])

  useEffect(() => {
    return () => {
      cancelDirectionAdjust()
    }
  }, [asset.id, cancelDirectionAdjust])

  const hasCaptureLocation = isBuildingProject
    ? draft.xStr.trim() !== '' && draft.yStr.trim() !== ''
    : draft.latStr.trim() !== '' && draft.lngStr.trim() !== ''

  const isMediaWithDirection = asset.kind === 'image' || asset.kind === 'panorama'
  const isThisFormDirectionAdjustTarget =
    isAdjustingDirection && adjustingFeatureId === asset.id
  const adjustDisabledReason = !isMediaWithDirection
    ? 'Direction adjustment is only available for images and 360 photos.'
    : !hasCaptureLocation
      ? 'Set a capture location before adjusting direction.'
      : undefined
  const canAdjustDirection =
    isMediaWithDirection &&
    hasCaptureLocation &&
    !isPickingLocation &&
    !isPickingFloorPlanLocation

  const canPickOnMap = project.projectType === 'Infrastructure' && mapboxTokenPresent()
  const pickDisabledReason =
    project.projectType !== 'Infrastructure'
      ? 'Geo pick is only available for infrastructure projects that use the map.'
      : !mapboxTokenPresent()
        ? 'Add VITE_MAPBOX_ACCESS_TOKEN to your .env file to use map pick.'
        : undefined

  useEffect(() => {
    if (!autoStartLocationPick || autoPickStartedRef.current) return
    autoPickStartedRef.current = true
    if (isBuildingProject) {
      startFloorPlanLocationPick(asset.id, (floorPlanId, x, y) => {
        setDraft((d) => ({
          ...d,
          xStr: formatFloorPlanCoord(x),
          yStr: formatFloorPlanCoord(y),
          floorPlanId,
        }))
      })
      return
    }
    if (canPickOnMap) {
      startLocationPick(asset.id, (lng, lat) => {
        setDraft((d) => ({
          ...d,
          lngStr: lng.toFixed(6),
          latStr: lat.toFixed(6),
        }))
      })
    }
  }, [
    asset.id,
    autoStartLocationPick,
    canPickOnMap,
    isBuildingProject,
    startFloorPlanLocationPick,
    startLocationPick,
  ])

  const handleSave = useCallback(() => {
    const title = draft.title.trim() || asset.title
    const uploaded =
      formatDisplayDateFromIsoDate(draft.dateUploadedIso) || asset.dateUploaded
    const captured =
      draft.dateCapturedIso.trim() !== ''
        ? formatDisplayDateFromIsoDate(draft.dateCapturedIso) || undefined
        : undefined

    if (isBuildingProject) {
      const xs = draft.xStr.trim()
      const ys = draft.yStr.trim()
      const floorPlanId = draft.floorPlanId ?? asset.floorPlanPosition?.floorPlanId ?? DEFAULT_FLOOR_PLAN_ID
      let floorPlanPosition: SpatialAsset['floorPlanPosition']
      if (xs === '' && ys === '') {
        floorPlanPosition = undefined
      } else if (xs !== '' && ys !== '') {
        const x = Number(xs)
        const y = Number(ys)
        if (Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= 1 && y >= 0 && y <= 1) {
          floorPlanPosition = {
            floorPlanId,
            x,
            y,
          }
        } else {
          floorPlanPosition = asset.floorPlanPosition
        }
      } else {
        floorPlanPosition = asset.floorPlanPosition
      }

      onSave({
        ...asset,
        title,
        kind: draft.kind,
        dateUploaded: uploaded,
        dateCaptured: captured,
        floorPlanPosition,
        markerColor: normalizeMarkerColor(draft.markerColor),
      })
      return
    }

    const ls = draft.lngStr.trim()
    const bs = draft.latStr.trim()
    const geoPatch: Partial<Pick<SpatialAsset, 'captureLng' | 'captureLat'>> = {}
    if (ls === '' && bs === '') {
      geoPatch.captureLng = undefined
      geoPatch.captureLat = undefined
    } else if (ls !== '' && bs !== '') {
      const lng = Number(ls)
      const lat = Number(bs)
      if (
        Number.isFinite(lng) &&
        Number.isFinite(lat) &&
        lng >= -180 &&
        lng <= 180 &&
        lat >= -90 &&
        lat <= 90
      ) {
        geoPatch.captureLng = lng
        geoPatch.captureLat = lat
      }
    }

    onSave({
      ...asset,
      title,
      kind: draft.kind,
      dateUploaded: uploaded,
      dateCaptured: captured,
      markerColor: normalizeMarkerColor(draft.markerColor),
      ...geoPatch,
    })
  }, [asset, draft, isBuildingProject, onSave])

  const handleCancel = useCallback(() => {
    cancelLocationPick()
    cancelFloorPlanLocationPick()
    cancelDirectionAdjust()
    setDraft(draftFromAsset(asset, isBuildingProject))
  }, [
    asset,
    cancelDirectionAdjust,
    cancelFloorPlanLocationPick,
    cancelLocationPick,
    isBuildingProject,
  ])

  const isVideo =
    asset.kind === 'video' || asset.mimeType?.startsWith('video/') === true

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col" role="region" aria-label="Feature metadata">
      <div className="min-h-0 min-w-0 flex-1 overflow-auto p-panel-padding">
        <FeatureMetadataForm
          draft={draft}
          onDraftChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
          fileInfo={{
            fileSizeLabel: fileSizeLabel(asset.fileSizeBytes) === '—' ? '24.6 MB' : fileSizeLabel(asset.fileSizeBytes),
            resolutionLabel:
              resolutionLabel(asset.width, asset.height) === '—'
                ? '8192 × 4096'
                : resolutionLabel(asset.width, asset.height),
            extensionLabel: extensionLabelFromMimeAndKind(asset.mimeType, asset.kind, asset.fileUrl),
          }}
          preview={{ url: asset.fileUrl ?? '', isVideo }}
          isBuildingProject={isBuildingProject}
          locationPick={{
            canPickOnMap,
            pickDisabledReason,
            isMapPickInProgress: isPickingLocation,
            isFloorPlanPickInProgress: isPickingFloorPlanLocation,
            isThisFormMapPickTarget: isPickingLocation,
            isThisFormFloorPlanPickTarget: isPickingFloorPlanLocation,
            onMapPickClick: () => {
              if (isAdjustingDirection) cancelDirectionAdjust()
              if (isPickingLocation) {
                cancelLocationPick()
                return
              }
              startLocationPick(asset.id, (lng, lat) => {
                setDraft((d) => ({
                  ...d,
                  lngStr: lng.toFixed(6),
                  latStr: lat.toFixed(6),
                }))
              })
            },
            onFloorPlanPickClick: () => {
              if (isAdjustingDirection) cancelDirectionAdjust()
              if (isPickingFloorPlanLocation) {
                cancelFloorPlanLocationPick()
                return
              }
              startFloorPlanLocationPick(asset.id, (floorPlanId, x, y) => {
                setDraft((d) => ({
                  ...d,
                  xStr: formatFloorPlanCoord(x),
                  yStr: formatFloorPlanCoord(y),
                  floorPlanId,
                }))
              })
            },
          }}
          directionAdjust={{
            canAdjustDirection,
            adjustDisabledReason,
            isDirectionAdjustInProgress: isAdjustingDirection,
            isThisFormDirectionAdjustTarget,
            onDirectionAdjustClick: () => {
              if (isThisFormDirectionAdjustTarget) {
                cancelDirectionAdjust()
                return
              }
              cancelLocationPick()
              cancelFloorPlanLocationPick()
              const fileUrl = asset.fileUrl ?? ''
              if (fileUrl === '') return
              setOpenedFeatureId(asset.id)
              startDirectionAdjust(
                asset.id,
                { fileUrl, kind: asset.kind as 'image' | 'panorama' },
                asset.viewDirectionDeg ?? 0,
                (deg) => onSave({ ...asset, viewDirectionDeg: deg }),
              )
            },
          }}
        />
      </div>

      {isDirty ? (
        <div className="border-t border-stroke bg-panel px-panel-padding py-3">
          <div className={featureMetadataFooterActionsClassName}>
            <button
              type="button"
              onClick={handleCancel}
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
    </div>
  )
}
