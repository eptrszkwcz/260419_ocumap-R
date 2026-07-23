import type { MapCaptureMarker, FloorPlanMarker } from '@/context/MapCaptureMarkersContext'
import { getFeatureTypeLabel, hasDisplayableMedia, type SpatialAsset } from '@/data/sampleAssets'
import type { FloorPlanDrawnGeometry, MapDrawnGeometry } from '@/panels/library/assetGeometryHelpers'

export type FeatureHoverInfo = {
  title: string
  typeLabel: string
  previewUrl?: string
}

export function stillImagePreviewUrl(asset: SpatialAsset): string | undefined {
  if (!hasDisplayableMedia(asset)) return undefined
  if (asset.kind === 'video') return undefined
  const url = asset.fileUrl ?? ''
  return url !== '' ? url : undefined
}

function hoverFieldsFromAsset(asset: SpatialAsset): FeatureHoverInfo {
  return {
    title: asset.title,
    typeLabel: getFeatureTypeLabel(asset),
    previewUrl: stillImagePreviewUrl(asset),
  }
}

export function featureHoverFieldsFromAsset(asset: SpatialAsset): FeatureHoverInfo {
  return hoverFieldsFromAsset(asset)
}


export function featureHoverInfoFromMapData(
  captureMarkers: MapCaptureMarker[],
  mapDrawnGeometries: MapDrawnGeometry[],
): Map<string, FeatureHoverInfo> {
  const map = new Map<string, FeatureHoverInfo>()
  for (const m of captureMarkers) {
    map.set(m.id, { title: m.title, typeLabel: m.typeLabel, previewUrl: m.previewUrl })
  }
  for (const g of mapDrawnGeometries) {
    map.set(g.id, { title: g.title, typeLabel: g.typeLabel, previewUrl: g.previewUrl })
  }
  return map
}

export function featureHoverInfoFromFloorPlanData(
  floorMarkers: FloorPlanMarker[],
  floorDrawnGeometries: FloorPlanDrawnGeometry[],
): Map<string, FeatureHoverInfo> {
  const map = new Map<string, FeatureHoverInfo>()
  for (const m of floorMarkers) {
    map.set(m.id, { title: m.title, typeLabel: m.typeLabel, previewUrl: m.previewUrl })
  }
  for (const g of floorDrawnGeometries) {
    map.set(g.id, { title: g.title, typeLabel: g.typeLabel, previewUrl: g.previewUrl })
  }
  return map
}