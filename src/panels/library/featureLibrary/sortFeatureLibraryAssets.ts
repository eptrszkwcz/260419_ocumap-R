import type { SpatialAsset } from '@/data/sampleAssets'
import type { ProjectType } from '@/data/sampleProjects'
import type { SortDirection } from '@/components/SortableColumnHeader'
import { parseToIsoDate } from '@/lib/formatDisplayDateFromIsoDate'
import { columnDefinitions } from '@/panels/library/featureLibrary/columnDefinitions'
import {
  assetHasComments,
  assetHasMediaMarkers,
} from '@/panels/library/featureLibrary/featureLibraryIndicators'
import type { OptionalColumnId } from '@/panels/library/featureLibrary/types'

export type FeatureLibrarySortColumn = 'feature' | OptionalColumnId | 'markers' | 'comments'

function compareValues(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b
  }
  return String(a).localeCompare(String(b), undefined, { sensitivity: 'base' })
}

function sortValueForColumn(
  asset: SpatialAsset,
  column: FeatureLibrarySortColumn,
  projectType: ProjectType,
): string | number {
  if (column === 'feature') {
    return asset.title
  }
  if (column === 'size') {
    return asset.fileSizeBytes ?? -1
  }
  if (column === 'dateUploaded') {
    return parseToIsoDate(asset.dateUploaded)
  }
  if (column === 'dateCaptured') {
    return parseToIsoDate(asset.dateCaptured ?? '')
  }
  if (column === 'markers') {
    return assetHasMediaMarkers(asset) ? 1 : 0
  }
  if (column === 'comments') {
    return assetHasComments(asset) ? 1 : 0
  }
  return columnDefinitions[column].getCellValue(asset, projectType)
}

export function sortFeatureLibraryAssets(
  assets: SpatialAsset[],
  column: FeatureLibrarySortColumn,
  direction: SortDirection,
  projectType: ProjectType,
): SpatialAsset[] {
  const sorted = [...assets]
  sorted.sort((a, b) => {
    const cmp = compareValues(
      sortValueForColumn(a, column, projectType),
      sortValueForColumn(b, column, projectType),
    )
    return direction === 'asc' ? cmp : -cmp
  })
  return sorted
}
