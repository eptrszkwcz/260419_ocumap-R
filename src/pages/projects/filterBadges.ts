import {
  projectTypeFilterLabel,
  type ProjectStatus,
  type ProjectType,
} from '@/data/sampleProjects'
import type { ActiveFilter } from '@/panels/library/FeatureLibraryBadges'
import { isDateFilterActive } from '@/panels/library/featureLibrary/applyFeatureLibraryFilters'
import { DATE_PRESET_OPTIONS } from '@/panels/library/featureLibrary/filterBadges'
import type { DateFilterPreset } from '@/panels/library/featureLibrary/types'

import type { ProjectFilters } from '@/pages/projects/types'

const PRESET_LABELS: Record<Exclude<DateFilterPreset, 'custom'>, string> = Object.fromEntries(
  DATE_PRESET_OPTIONS.map(({ id, label }) => [id, label]),
) as Record<Exclude<DateFilterPreset, 'custom'>, string>

function dateFilterBadgeLabel(
  attributeLabel: string,
  filter: NonNullable<ProjectFilters['lastModified']>,
): string {
  if (filter.preset != null && filter.preset !== 'custom') {
    return `${attributeLabel}: ${PRESET_LABELS[filter.preset]}`
  }
  const parts: string[] = []
  if (filter.fromIso.trim()) parts.push(`from ${filter.fromIso}`)
  if (filter.toIso.trim()) parts.push(`to ${filter.toIso}`)
  return `${attributeLabel}: ${parts.join(' ')}`
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  Draft: 'Draft',
  Published: 'Published',
}

export function projectFiltersToBadges(filters: ProjectFilters): ActiveFilter[] {
  const badges: ActiveFilter[] = []

  if (filters.statuses.length > 0) {
    const labels = filters.statuses.map((s) => STATUS_LABELS[s])
    badges.push({ id: 'filter-status', label: `Status: ${labels.join(', ')}` })
  }

  if (filters.types.length > 0) {
    const labels = filters.types.map((t) => projectTypeFilterLabel(t))
    badges.push({ id: 'filter-type', label: `Type: ${labels.join(', ')}` })
  }

  if (filters.teams.length > 0) {
    badges.push({ id: 'filter-team', label: `Team: ${filters.teams.join(', ')}` })
  }

  if (isDateFilterActive(filters.lastModified) && filters.lastModified != null) {
    badges.push({
      id: 'filter-lastModified',
      label: dateFilterBadgeLabel('Last modified', filters.lastModified),
    })
  }

  if (isDateFilterActive(filters.created) && filters.created != null) {
    badges.push({
      id: 'filter-created',
      label: dateFilterBadgeLabel('Created', filters.created),
    })
  }

  if (filters.fileCountMin.trim() !== '' || filters.fileCountMax.trim() !== '') {
    const parts: string[] = []
    if (filters.fileCountMin.trim()) parts.push(`≥ ${filters.fileCountMin}`)
    if (filters.fileCountMax.trim()) parts.push(`≤ ${filters.fileCountMax}`)
    badges.push({ id: 'filter-fileCount', label: `Files: ${parts.join(', ')}` })
  }

  if (filters.projectSizeMin.trim() !== '' || filters.projectSizeMax.trim() !== '') {
    const parts: string[] = []
    if (filters.projectSizeMin.trim()) parts.push(`≥ ${filters.projectSizeMin} MB`)
    if (filters.projectSizeMax.trim()) parts.push(`≤ ${filters.projectSizeMax} MB`)
    badges.push({ id: 'filter-projectSize', label: `Size: ${parts.join(', ')}` })
  }

  return badges
}

export function removeProjectFilterByBadgeId(
  filters: ProjectFilters,
  badgeId: string,
): ProjectFilters {
  switch (badgeId) {
    case 'filter-status':
      return { ...filters, statuses: [] }
    case 'filter-type':
      return { ...filters, types: [] }
    case 'filter-team':
      return { ...filters, teams: [] }
    case 'filter-lastModified':
      return { ...filters, lastModified: null }
    case 'filter-created':
      return { ...filters, created: null }
    case 'filter-fileCount':
      return { ...filters, fileCountMin: '', fileCountMax: '' }
    case 'filter-projectSize':
      return { ...filters, projectSizeMin: '', projectSizeMax: '' }
    default:
      return filters
  }
}

export const PROJECT_TYPE_FILTER_OPTIONS: { type: ProjectType; label: string }[] = [
  { type: 'Building', label: 'Floor Plan' },
  { type: 'Infrastructure', label: 'Map' },
  { type: 'FilesOnly', label: 'Files Only' },
]

export const PROJECT_STATUS_FILTER_OPTIONS: { status: ProjectStatus; label: string }[] = [
  { status: 'Draft', label: 'Draft' },
  { status: 'Published', label: 'Published' },
]
