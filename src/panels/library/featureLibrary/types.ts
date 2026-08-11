import type { FeatureTypeFilter } from '@/data/sampleAssets'

export type LibraryViewType = 'list' | 'thumbnail'

export type OptionalColumnId =
  | 'type'
  | 'dateUploaded'
  | 'dateCaptured'
  | 'location'
  | 'size'
  | 'format'

export type ColumnId = 'feature' | OptionalColumnId

export type LibraryDropdownId = 'view' | 'columns' | 'filters'

export type DateFilterPreset = 'last7' | 'last30' | 'last90' | 'thisYear' | 'custom'

export type DateFilterState = {
  preset: DateFilterPreset | null
  fromIso: string
  toIso: string
}

export type FeatureLibraryFilters = {
  types: FeatureTypeFilter[]
  locations: string[]
  dateUploaded: DateFilterState | null
  dateCaptured: DateFilterState | null
  sizeMinMb: string
  sizeMaxMb: string
  hasMarker: boolean
  hasComment: boolean
}

export const ALL_OPTIONAL_COLUMN_IDS: OptionalColumnId[] = [
  'dateUploaded',
  'type',
  'dateCaptured',
  'location',
  'size',
  'format',
]

export function createEmptyFilters(): FeatureLibraryFilters {
  return {
    types: [],
    locations: [],
    dateUploaded: null,
    dateCaptured: null,
    sizeMinMb: '',
    sizeMaxMb: '',
    hasMarker: false,
    hasComment: false,
  }
}

export function createDefaultColumnVisibility(isBuildingProject: boolean): Record<OptionalColumnId, boolean> {
  return {
    dateUploaded: true,
    type: true,
    dateCaptured: false,
    location: isBuildingProject,
    size: false,
    format: false,
  }
}

export function createDefaultColumnOrder(): OptionalColumnId[] {
  return [...ALL_OPTIONAL_COLUMN_IDS]
}
