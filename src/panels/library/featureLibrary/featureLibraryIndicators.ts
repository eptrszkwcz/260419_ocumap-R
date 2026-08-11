import type { MarkerLogEntry, MediaAnnotationMarker, SpatialAsset } from '@/data/sampleAssets'

/** True if there is a user-authored comment, or a legacy non-empty notes string. */
export function hasUserComments(
  entries: MarkerLogEntry[] | undefined,
  notes?: string,
): boolean {
  if (entries?.some((entry) => entry.kind === 'user') === true) return true
  return (notes?.trim() ?? '') !== ''
}

export function assetHasMediaMarkers(asset: SpatialAsset): boolean {
  return (asset.mediaMarkers?.length ?? 0) > 0
}

export function markerHasComments(marker: MediaAnnotationMarker): boolean {
  return hasUserComments(marker.logEntries)
}

/** User comments on the asset itself or any nested media marker. */
export function assetHasComments(asset: SpatialAsset): boolean {
  if (hasUserComments(asset.logEntries, asset.notes)) return true
  return (asset.mediaMarkers ?? []).some(markerHasComments)
}
