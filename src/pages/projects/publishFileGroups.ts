import {
  featureTypeFilterLabel,
  getFeatureTypeFilterKey,
  getSampleAssetsForProject,
  type FeatureTypeFilter,
} from '@/data/sampleAssets'
import type { ProjectRecord } from '@/data/sampleProjects'
import { getFloorPlanOptionsForProject } from '@/panels/map/mapFloorPlans'

export type PublishFileGroupId = FeatureTypeFilter | 'floorPlans'

export type PublishFileItem = {
  id: string
  label: string
  /** Floor plans are required for building navigation and cannot be deselected. */
  locked: boolean
}

export type PublishFileGroup = {
  id: PublishFileGroupId
  label: string
  items: PublishFileItem[]
}

const PANORAMA_LABEL = '360 Panoramas'
const FLOOR_PLANS_LABEL = 'Floor Plans'

function groupLabel(id: PublishFileGroupId): string {
  if (id === 'floorPlans') return FLOOR_PLANS_LABEL
  if (id === 'panorama') return PANORAMA_LABEL
  return featureTypeFilterLabel(id)
}

const ASSET_GROUP_ORDER: FeatureTypeFilter[] = [
  'panorama',
  'image',
  'video',
  'point',
  'line',
  'polygon',
]

export function buildPublishFileGroups(project: ProjectRecord): PublishFileGroup[] {
  const groups: PublishFileGroup[] = []

  const assets = getSampleAssetsForProject(project.id)
  const assetsByKey = new Map<FeatureTypeFilter, PublishFileItem[]>()

  for (const asset of assets) {
    const key = getFeatureTypeFilterKey(asset)
    const items = assetsByKey.get(key) ?? []
    items.push({ id: asset.id, label: asset.title, locked: false })
    assetsByKey.set(key, items)
  }

  for (const key of ASSET_GROUP_ORDER) {
    const items = assetsByKey.get(key)
    if (items != null && items.length > 0) {
      groups.push({ id: key, label: groupLabel(key), items })
    }
  }

  if (project.projectType === 'Building') {
    const floorPlans = getFloorPlanOptionsForProject(project.id)
    if (floorPlans.length > 0) {
      groups.push({
        id: 'floorPlans',
        label: FLOOR_PLANS_LABEL,
        items: floorPlans.map((plan) => ({
          id: plan.id,
          label: plan.label,
          locked: true,
        })),
      })
    }
  }

  return groups
}

export function allPublishFileIds(groups: PublishFileGroup[]): Set<string> {
  const ids = new Set<string>()
  for (const group of groups) {
    for (const item of group.items) {
      ids.add(item.id)
    }
  }
  return ids
}
