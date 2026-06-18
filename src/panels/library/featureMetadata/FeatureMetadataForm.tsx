import { FeatureMarkerColorField } from '@/components/FeatureMarkerColorField'
import { getAssetTypeLabel, type AssetKind } from '@/data/sampleAssets'
import { floorPlanDisplayLabel } from '@/panels/map/mapFloorPlans'
import { FeatureMetadataStaticRow } from '@/panels/library/featureMetadata/FeatureMetadataStaticRow'
import { FeatureMetadataThumbnail } from '@/panels/library/featureMetadata/FeatureMetadataThumbnail'
import {
  featureMetadataFormGridClassName,
  featureMetadataInputClassName,
  featureMetadataSecondaryButtonClass,
  featureMetadataSelectClassName,
} from '@/panels/library/featureMetadata/styles'
import type {
  FeatureMetadataDirectionAdjustProps,
  FeatureMetadataDraft,
  FeatureMetadataFileInfo,
  FeatureMetadataLocationPickProps,
  FeatureMetadataPreview,
} from '@/panels/library/featureMetadata/types'

type FeatureMetadataFormProps = {
  draft: FeatureMetadataDraft
  onDraftChange: (patch: Partial<FeatureMetadataDraft>) => void
  fileInfo: FeatureMetadataFileInfo
  preview: FeatureMetadataPreview
  isBuildingProject: boolean
  locationPick: FeatureMetadataLocationPickProps
  directionAdjust?: FeatureMetadataDirectionAdjustProps
}

export function FeatureMetadataForm({
  draft,
  onDraftChange,
  fileInfo,
  preview,
  isBuildingProject,
  locationPick,
  directionAdjust,
}: FeatureMetadataFormProps) {
  const floorPlanLabel =
    draft.floorPlanId != null ? floorPlanDisplayLabel(draft.floorPlanId) : '—'

  const {
    canPickOnMap,
    pickDisabledReason,
    isMapPickInProgress,
    isFloorPlanPickInProgress,
    isThisFormMapPickTarget,
    isThisFormFloorPlanPickTarget,
    onMapPickClick,
    onFloorPlanPickClick,
  } = locationPick

  const showDirectionAdjust =
    directionAdjust != null && (draft.kind === 'image' || draft.kind === 'panorama')
  const {
    canAdjustDirection = false,
    adjustDisabledReason,
    isDirectionAdjustInProgress = false,
    isThisFormDirectionAdjustTarget = false,
    onDirectionAdjustClick = () => {},
  } = directionAdjust ?? {}

  const directionAdjustButton = showDirectionAdjust ? (
    <button
      type="button"
      className={featureMetadataSecondaryButtonClass + ' whitespace-nowrap'}
      disabled={
        (isDirectionAdjustInProgress && !isThisFormDirectionAdjustTarget) ||
        (!canAdjustDirection && !isThisFormDirectionAdjustTarget)
      }
      title={canAdjustDirection || isThisFormDirectionAdjustTarget ? undefined : adjustDisabledReason}
      onClick={onDirectionAdjustClick}
    >
      {isThisFormDirectionAdjustTarget ? 'Cancel' : 'Adjust Direction'}
    </button>
  ) : null

  return (
    <div className={featureMetadataFormGridClassName}>
      <div className="flex min-w-0 items-start gap-3 sm:col-span-2">
        <FeatureMetadataThumbnail
          previewUrl={preview.url}
          isVideo={preview.isVideo}
          onImageLoad={preview.onImageLoad}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <FeatureMetadataStaticRow label="File size" value={fileInfo.fileSizeLabel} />
          <FeatureMetadataStaticRow label="Resolution" value={fileInfo.resolutionLabel} />
          <FeatureMetadataStaticRow label="Extension" value={fileInfo.extensionLabel} />
        </div>
      </div>

      <label className="block min-w-0">
        <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
          File name
        </span>
        <input
          type="text"
          className={featureMetadataInputClassName}
          value={draft.title}
          onChange={(e) => onDraftChange({ title: e.target.value })}
          aria-label="File name"
        />
      </label>
      <label className="block min-w-0">
        <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
          File type
        </span>
        <select
          className={featureMetadataSelectClassName}
          value={draft.kind}
          onChange={(e) => onDraftChange({ kind: e.target.value as AssetKind })}
          aria-label="File type"
        >
          <option value="image">{getAssetTypeLabel('image')}</option>
          <option value="video">{getAssetTypeLabel('video')}</option>
          <option value="panorama">{getAssetTypeLabel('panorama')}</option>
        </select>
      </label>
      <label className="block min-w-0">
        <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
          Date added
        </span>
        <input
          type="date"
          className={featureMetadataInputClassName}
          value={draft.dateUploadedIso}
          onChange={(e) => onDraftChange({ dateUploadedIso: e.target.value })}
        />
      </label>
      <label className="block min-w-0">
        <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
          Date captured
        </span>
        <input
          type="date"
          className={featureMetadataInputClassName}
          value={draft.dateCapturedIso}
          onChange={(e) => onDraftChange({ dateCapturedIso: e.target.value })}
        />
      </label>

      {isBuildingProject ? (
        <>
          <div className="grid min-w-0 grid-cols-[2fr_1fr_1fr] items-end gap-x-[16px]">
            <div className="block min-w-0">
              <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                Location
              </span>
              <div
                className={
                  'flex h-8 min-w-0 items-center rounded-panel border border-stroke/40 bg-panel px-2.5 text-standard leading-none ' +
                  (draft.floorPlanId != null ? 'text-fg' : 'text-fg-muted')
                }
                aria-label="Floor plan location"
              >
                <span className="truncate">{floorPlanLabel}</span>
              </div>
            </div>
            <label className="block min-w-0">
              <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                X
              </span>
              <input
                type="text"
                inputMode="decimal"
                className={featureMetadataInputClassName}
                value={draft.xStr}
                onChange={(e) => onDraftChange({ xStr: e.target.value })}
                placeholder="e.g. 0.340"
                aria-label="Floor plan X (normalized 0–1)"
              />
            </label>
            <label className="block min-w-0">
              <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                Y
              </span>
              <input
                type="text"
                inputMode="decimal"
                className={featureMetadataInputClassName}
                value={draft.yStr}
                onChange={(e) => onDraftChange({ yStr: e.target.value })}
                placeholder="e.g. 0.410"
                aria-label="Floor plan Y (normalized 0–1)"
              />
            </label>
          </div>
          <div className="flex min-w-0 flex-col justify-end">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={featureMetadataSecondaryButtonClass + ' w-[156px] whitespace-nowrap'}
                disabled={
                (isFloorPlanPickInProgress && !isThisFormFloorPlanPickTarget) ||
                (isDirectionAdjustInProgress && !isThisFormDirectionAdjustTarget)
              }
                onClick={onFloorPlanPickClick}
              >
                {isThisFormFloorPlanPickTarget ? 'Cancel' : 'Set location on plan'}
              </button>
              {directionAdjustButton}
            </div>
          </div>
        </>
      ) : (
        <div className="grid min-w-0 gap-2 sm:col-span-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="block min-w-0">
            <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
              Latitude
            </span>
            <input
              type="text"
              inputMode="decimal"
              className={featureMetadataInputClassName}
              value={draft.latStr}
              onChange={(e) => onDraftChange({ latStr: e.target.value })}
              placeholder="e.g. 29.783350"
              aria-label="Capture latitude (WGS84)"
            />
          </label>
          <label className="block min-w-0">
            <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
              Longitude
            </span>
            <input
              type="text"
              inputMode="decimal"
              className={featureMetadataInputClassName}
              value={draft.lngStr}
              onChange={(e) => onDraftChange({ lngStr: e.target.value })}
              placeholder="e.g. -95.809920"
              aria-label="Capture longitude (WGS84)"
            />
          </label>
          <div className="flex min-w-0 flex-col justify-end gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={featureMetadataSecondaryButtonClass + ' whitespace-nowrap'}
                disabled={
                  (isMapPickInProgress && !isThisFormMapPickTarget) ||
                  (isDirectionAdjustInProgress && !isThisFormDirectionAdjustTarget) ||
                  (!canPickOnMap && !isThisFormMapPickTarget)
                }
                title={canPickOnMap || isThisFormMapPickTarget ? undefined : pickDisabledReason}
                onClick={onMapPickClick}
              >
                {isThisFormMapPickTarget ? 'Cancel' : 'Set location on map'}
              </button>
              {directionAdjustButton}
            </div>
          </div>
        </div>
      )}

      <FeatureMarkerColorField
        value={draft.markerColor}
        onChange={(markerColor) => onDraftChange({ markerColor })}
      />
    </div>
  )
}
