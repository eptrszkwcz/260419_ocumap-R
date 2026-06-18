import type { SpatialAsset } from '@/data/sampleAssets'
import type { ProjectType } from '@/data/sampleProjects'
import { floorPlanDisplayLabel } from '@/panels/map/mapFloorPlans'

export function assetLocationLabel(asset: SpatialAsset, projectType: ProjectType): string {
  const floorPlanId =
    asset.floorPlanPosition?.floorPlanId ?? asset.floorPlanGeometry?.floorPlanId
  if (floorPlanId != null) {
    return floorPlanDisplayLabel(floorPlanId)
  }
  if (
    projectType === 'Infrastructure' &&
    asset.captureLat != null &&
    asset.captureLng != null &&
    Number.isFinite(asset.captureLat) &&
    Number.isFinite(asset.captureLng)
  ) {
    return `${asset.captureLat.toFixed(3)}, ${asset.captureLng.toFixed(3)}`
  }
  return '—'
}

export function assetLocationFilterKey(asset: SpatialAsset, projectType: ProjectType): string | null {
  const label = assetLocationLabel(asset, projectType)
  return label === '—' ? null : label
}
