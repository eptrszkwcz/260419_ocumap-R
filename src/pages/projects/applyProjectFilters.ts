import type { ProjectRecord } from '@/data/sampleProjects'
import { parseToIsoDate } from '@/lib/formatDisplayDateFromIsoDate'
import {
  isDateFilterActive,
} from '@/panels/library/featureLibrary/applyFeatureLibraryFilters'
import type { DateFilterState } from '@/panels/library/featureLibrary/types'

import type { ProjectFilters } from '@/pages/projects/types'

function isoToDate(iso: string): Date | null {
  if (!iso.trim()) return null
  const d = new Date(`${iso}T12:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1, 12, 0, 0)
}

function daysAgoIso(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function dateInFilterRange(isoDate: string, filter: DateFilterState | null): boolean {
  if (filter == null) return true
  if (!isoDate) return false

  const valueDate = isoToDate(isoDate)
  if (valueDate == null) return false

  if (filter.preset != null && filter.preset !== 'custom') {
    const today = todayIso()
    const todayD = isoToDate(today)!
    if (filter.preset === 'thisYear') {
      const yearStart = startOfYear(todayD)
      return valueDate >= yearStart && valueDate <= todayD
    }
    const days =
      filter.preset === 'last7' ? 7 : filter.preset === 'last30' ? 30 : 90
    const fromIso = daysAgoIso(days)
    const fromD = isoToDate(fromIso)!
    return valueDate >= fromD && valueDate <= todayD
  }

  const fromD = isoToDate(filter.fromIso)
  const toD = isoToDate(filter.toIso)
  if (fromD != null && valueDate < fromD) return false
  if (toD != null && valueDate > toD) return false
  return fromD != null || toD != null
}

function numericRangeInRange(value: number, min: string, max: string): boolean {
  if (min.trim() === '' && max.trim() === '') return true
  const minN = min.trim() === '' ? null : Number(min)
  const maxN = max.trim() === '' ? null : Number(max)
  if (minN != null && Number.isFinite(minN) && value < minN) return false
  if (maxN != null && Number.isFinite(maxN) && value > maxN) return false
  return true
}

export function distinctTeamFilterValues(projects: ProjectRecord[]): string[] {
  const set = new Set<string>()
  for (const p of projects) {
    const t = p.team.trim()
    if (t !== '') set.add(t)
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}

export function isProjectFilterActive(filters: ProjectFilters): boolean {
  return (
    filters.statuses.length > 0 ||
    filters.types.length > 0 ||
    filters.teams.length > 0 ||
    isDateFilterActive(filters.lastModified) ||
    isDateFilterActive(filters.created) ||
    filters.fileCountMin.trim() !== '' ||
    filters.fileCountMax.trim() !== '' ||
    filters.projectSizeMin.trim() !== '' ||
    filters.projectSizeMax.trim() !== ''
  )
}

export function applyProjectFilters(
  projects: ProjectRecord[],
  filters: ProjectFilters,
): ProjectRecord[] {
  return projects.filter((project) => {
    if (filters.statuses.length > 0 && !filters.statuses.includes(project.status)) {
      return false
    }

    if (filters.types.length > 0 && !filters.types.includes(project.projectType)) {
      return false
    }

    if (filters.teams.length > 0 && !filters.teams.includes(project.team)) {
      return false
    }

    if (
      isDateFilterActive(filters.lastModified) &&
      !dateInFilterRange(parseToIsoDate(project.lastModified), filters.lastModified)
    ) {
      return false
    }

    if (
      isDateFilterActive(filters.created) &&
      !dateInFilterRange(project.createdIso, filters.created)
    ) {
      return false
    }

    if (!numericRangeInRange(project.featureFileCount, filters.fileCountMin, filters.fileCountMax)) {
      return false
    }

    if (!numericRangeInRange(project.projectSizeMb, filters.projectSizeMin, filters.projectSizeMax)) {
      return false
    }

    return true
  })
}
