import {
  featureTypeFilterLabel,
  getFeatureTypeFilterKey,
  type FeatureTypeFilter,
  type SpatialAsset,
} from '@/data/sampleAssets'
import type { ProjectType } from '@/data/sampleProjects'
import { parseToIsoDate } from '@/lib/formatDisplayDateFromIsoDate'

import { assetLocationFilterKey } from '@/panels/library/featureLibrary/assetLocationLabel'
import type { DateFilterState, FeatureLibraryFilters } from '@/panels/library/featureLibrary/types'

function isoToDate(iso: string): Date | null {
  if (!iso.trim()) return null
  const d = new Date(`${iso}T12:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

function assetIsoDate(value: string | undefined): string {
  if (value == null || !value.trim()) return ''
  return parseToIsoDate(value)
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

  const assetDate = isoToDate(isoDate)
  if (assetDate == null) return false

  if (filter.preset != null && filter.preset !== 'custom') {
    const today = todayIso()
    const todayD = isoToDate(today)!
    if (filter.preset === 'thisYear') {
      const yearStart = startOfYear(todayD)
      return assetDate >= yearStart && assetDate <= todayD
    }
    const days =
      filter.preset === 'last7' ? 7 : filter.preset === 'last30' ? 30 : 90
    const fromIso = daysAgoIso(days)
    const fromD = isoToDate(fromIso)!
    return assetDate >= fromD && assetDate <= todayD
  }

  const fromD = isoToDate(filter.fromIso)
  const toD = isoToDate(filter.toIso)
  if (fromD != null && assetDate < fromD) return false
  if (toD != null && assetDate > toD) return false
  return fromD != null || toD != null
}

function sizeInRange(bytes: number | undefined, minMb: string, maxMb: string): boolean {
  if (minMb.trim() === '' && maxMb.trim() === '') return true
  if (bytes == null || !Number.isFinite(bytes)) return false
  const mb = bytes / (1024 * 1024)
  const min = minMb.trim() === '' ? null : Number(minMb)
  const max = maxMb.trim() === '' ? null : Number(maxMb)
  if (min != null && Number.isFinite(min) && mb < min) return false
  if (max != null && Number.isFinite(max) && mb > max) return false
  return true
}

export function applyFeatureLibraryFilters(
  assets: SpatialAsset[],
  filters: FeatureLibraryFilters,
  projectType: ProjectType,
): SpatialAsset[] {
  return assets.filter((asset) => {
    if (filters.types.length > 0 && !filters.types.includes(getFeatureTypeFilterKey(asset))) {
      return false
    }

    if (filters.locations.length > 0) {
      const key = assetLocationFilterKey(asset, projectType)
      if (key == null || !filters.locations.includes(key)) {
        return false
      }
    }

    if (
      isDateFilterActive(filters.dateUploaded) &&
      !dateInFilterRange(assetIsoDate(asset.dateUploaded), filters.dateUploaded)
    ) {
      return false
    }

    if (
      isDateFilterActive(filters.dateCaptured) &&
      !dateInFilterRange(assetIsoDate(asset.dateCaptured), filters.dateCaptured)
    ) {
      return false
    }

    if (!sizeInRange(asset.fileSizeBytes, filters.sizeMinMb, filters.sizeMaxMb)) {
      return false
    }

    return true
  })
}

export function distinctLocationFilterValues(
  assets: SpatialAsset[],
  projectType: ProjectType,
): string[] {
  const set = new Set<string>()
  for (const asset of assets) {
    const key = assetLocationFilterKey(asset, projectType)
    if (key != null) set.add(key)
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}

export function distinctTypeFilterOptions(
  assets: SpatialAsset[],
): { id: FeatureTypeFilter; label: string }[] {
  const seen = new Set<FeatureTypeFilter>()
  const options: { id: FeatureTypeFilter; label: string }[] = []

  for (const asset of assets) {
    const id = getFeatureTypeFilterKey(asset)
    if (seen.has(id)) continue
    seen.add(id)
    options.push({ id, label: featureTypeFilterLabel(id) })
  }

  return options.sort((a, b) => a.label.localeCompare(b.label))
}

export function isFilterActive(filters: FeatureLibraryFilters): boolean {
  return (
    filters.types.length > 0 ||
    filters.locations.length > 0 ||
    filters.dateUploaded != null ||
    filters.dateCaptured != null ||
    filters.sizeMinMb.trim() !== '' ||
    filters.sizeMaxMb.trim() !== ''
  )
}

export function isDateFilterActive(filter: DateFilterState | null): boolean {
  if (filter == null) return false
  if (filter.preset != null && filter.preset !== 'custom') return true
  return filter.fromIso.trim() !== '' || filter.toIso.trim() !== ''
}
