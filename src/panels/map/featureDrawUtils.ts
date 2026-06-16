import type { FeatureGeometryType, SpatialAsset } from '@/data/sampleAssets'
import type { FloorPlanId } from '@/panels/map/mapFloorPlans'
import {
  floorPlanVerticesFromAsset,
  mapVerticesFromAsset,
} from '@/panels/library/assetGeometryHelpers'
import { normalizeMarkerColor } from '@/panels/map/markerColors'

export type LoadedDrawState = {
  floorPlanId: FloorPlanId | null
  floorPlanVertices: { x: number; y: number }[]
  mapVertices: { lng: number; lat: number }[]
  geometryType: FeatureGeometryType | null
  draftMarkerColor: string
}

export function loadAssetIntoDrawState(asset: SpatialAsset): LoadedDrawState {
  const floor = floorPlanVerticesFromAsset(asset)
  const map = mapVerticesFromAsset(asset)

  return {
    floorPlanId: floor.floorPlanId,
    floorPlanVertices: floor.vertices.map((v) => ({ x: v.x, y: v.y })),
    mapVertices: map.map((v) => ({ lng: v.lng, lat: v.lat })),
    geometryType: asset.geometryType ?? null,
    draftMarkerColor: normalizeMarkerColor(asset.markerColor),
  }
}
