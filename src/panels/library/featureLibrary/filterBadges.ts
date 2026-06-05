import { getAssetTypeLabel } from '@/data/sampleAssets'

import {
  isDateFilterActive,
  TYPE_FILTER_OPTIONS,
} from '@/panels/library/featureLibrary/applyFeatureLibraryFilters'
import type { ActiveFilter } from '@/panels/library/FeatureLibraryBadges'
import type {
  DateFilterPreset,
  FeatureLibraryFilters,
} from '@/panels/library/featureLibrary/types'

const PRESET_LABELS: Record<Exclude<DateFilterPreset, 'custom'>, string> = {
  last7: 'Last 7 days',
  last30: 'Last 30 days',
  last90: 'Last 90 days',
  thisYear: 'This year',
}

function dateFilterBadgeLabel(
  attributeLabel: string,
  filter: NonNullable<FeatureLibraryFilters['dateUploaded']>,
): string {
  if (filter.preset != null && filter.preset !== 'custom') {
    return `${attributeLabel}: ${PRESET_LABELS[filter.preset]}`
  }
  const parts: string[] = []
  if (filter.fromIso.trim()) parts.push(`from ${filter.fromIso}`)
  if (filter.toIso.trim()) parts.push(`to ${filter.toIso}`)
  return `${attributeLabel}: ${parts.join(' ')}`
}

export function filtersToBadges(filters: FeatureLibraryFilters): ActiveFilter[] {
  const badges: ActiveFilter[] = []

  if (filters.types.length > 0) {
    const labels = filters.types.map(
      (k) => TYPE_FILTER_OPTIONS.find((o) => o.kind === k)?.label ?? getAssetTypeLabel(k),
    )
    badges.push({ id: 'filter-type', label: `Type: ${labels.join(', ')}` })
  }

  if (filters.locations.length > 0) {
    badges.push({ id: 'filter-location', label: `Location: ${filters.locations.join(', ')}` })
  }

  if (isDateFilterActive(filters.dateUploaded) && filters.dateUploaded != null) {
    badges.push({
      id: 'filter-dateUploaded',
      label: dateFilterBadgeLabel('Date uploaded', filters.dateUploaded),
    })
  }

  if (isDateFilterActive(filters.dateCaptured) && filters.dateCaptured != null) {
    badges.push({
      id: 'filter-dateCaptured',
      label: dateFilterBadgeLabel('Date captured', filters.dateCaptured),
    })
  }

  if (filters.sizeMinMb.trim() !== '' || filters.sizeMaxMb.trim() !== '') {
    const parts: string[] = []
    if (filters.sizeMinMb.trim()) parts.push(`≥ ${filters.sizeMinMb} MB`)
    if (filters.sizeMaxMb.trim()) parts.push(`≤ ${filters.sizeMaxMb} MB`)
    badges.push({ id: 'filter-size', label: `Size: ${parts.join(', ')}` })
  }

  return badges
}

export function removeFilterByBadgeId(
  filters: FeatureLibraryFilters,
  badgeId: string,
): FeatureLibraryFilters {
  switch (badgeId) {
    case 'filter-type':
      return { ...filters, types: [] }
    case 'filter-location':
      return { ...filters, locations: [] }
    case 'filter-dateUploaded':
      return { ...filters, dateUploaded: null }
    case 'filter-dateCaptured':
      return { ...filters, dateCaptured: null }
    case 'filter-size':
      return { ...filters, sizeMinMb: '', sizeMaxMb: '' }
    default:
      return filters
  }
}

export const DATE_PRESET_OPTIONS: { id: Exclude<DateFilterPreset, 'custom'>; label: string }[] = [
  { id: 'last7', label: 'Last 7 days' },
  { id: 'last30', label: 'Last 30 days' },
  { id: 'last90', label: 'Last 90 days' },
  { id: 'thisYear', label: 'This year' },
]
