import type { SpatialAsset } from '@/data/sampleAssets'
import { parseToIsoDate, todayIsoDate } from '@/lib/formatDisplayDateFromIsoDate'
import { formatFloorPlanCoord } from '@/lib/formatFloorPlanCoord'
import { normalizeMarkerColor } from '@/panels/map/markerColors'
import type { FeatureMetadataDraft } from '@/panels/library/featureMetadata/types'

function coordInputValue(n: number | undefined): string {
  if (n == null || !Number.isFinite(n)) return ''
  return n.toFixed(6)
}

export function draftFromAsset(asset: SpatialAsset, isBuildingProject: boolean): FeatureMetadataDraft {
  return {
    title: asset.title,
    kind: asset.kind,
    dateCapturedIso: asset.dateCaptured ? parseToIsoDate(asset.dateCaptured) : '',
    dateUploadedIso: parseToIsoDate(asset.dateUploaded) || todayIsoDate(),
    xStr: isBuildingProject ? formatFloorPlanCoord(asset.floorPlanPosition?.x) : '',
    yStr: isBuildingProject ? formatFloorPlanCoord(asset.floorPlanPosition?.y) : '',
    floorPlanId: isBuildingProject ? asset.floorPlanPosition?.floorPlanId : undefined,
    latStr: isBuildingProject ? '' : coordInputValue(asset.captureLat),
    lngStr: isBuildingProject ? '' : coordInputValue(asset.captureLng),
    markerColor: normalizeMarkerColor(asset.markerColor),
  }
}

export function isFeatureMetadataDraftDirty(
  draft: FeatureMetadataDraft,
  asset: SpatialAsset,
  isBuildingProject: boolean,
): boolean {
  const saved = draftFromAsset(asset, isBuildingProject)
  return (
    draft.title !== saved.title ||
    draft.kind !== saved.kind ||
    draft.dateCapturedIso !== saved.dateCapturedIso ||
    draft.dateUploadedIso !== saved.dateUploadedIso ||
    draft.xStr !== saved.xStr ||
    draft.yStr !== saved.yStr ||
    draft.floorPlanId !== saved.floorPlanId ||
    draft.latStr !== saved.latStr ||
    draft.lngStr !== saved.lngStr ||
    draft.markerColor !== saved.markerColor
  )
}
