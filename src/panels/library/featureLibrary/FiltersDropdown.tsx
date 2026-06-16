import { Checkbox } from '@/components/Checkbox'
import { DropdownPanel } from '@/components/DropdownPanel'
import {
  FunnelIcon,
  secondaryToolbarButtonActiveClassName,
  secondaryToolbarButtonClassName,
} from '@/components/ControlHeaderToolbar'
import { featureMetadataInputClassName } from '@/panels/library/featureMetadata/styles'
import { filterDropdownDateInputClassName } from '@/panels/library/featureLibrary/styles'

import {
  distinctLocationFilterValues,
  distinctTypeFilterOptions,
  isFilterActive,
} from '@/panels/library/featureLibrary/applyFeatureLibraryFilters'
import { DATE_PRESET_OPTIONS } from '@/panels/library/featureLibrary/filterBadges'
import type { FeatureTypeFilter, SpatialAsset } from '@/data/sampleAssets'
import type { ProjectType } from '@/data/sampleProjects'
import type {
  DateFilterPreset,
  DateFilterState,
  FeatureLibraryFilters,
} from '@/panels/library/featureLibrary/types'
import { createEmptyFilters } from '@/panels/library/featureLibrary/types'

function FilterSectionHeader({
  title,
  onReset,
  showReset,
}: {
  title: string
  onReset: () => void
  showReset: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-1">
      <span className="text-fg-muted text-badge font-bold uppercase tracking-wide">{title}</span>
      {showReset ? (
        <button
          type="button"
          onClick={onReset}
          className="text-fg-highlight text-badge hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-highlight/35"
        >
          Reset
        </button>
      ) : null}
    </div>
  )
}

function DateFilterSection({
  title,
  filter,
  onChange,
  onReset,
}: {
  title: string
  filter: DateFilterState | null
  onChange: (filter: DateFilterState | null) => void
  onReset: () => void
}) {
  const active = filter != null

  const setPreset = (preset: Exclude<DateFilterPreset, 'custom'>) => {
    onChange({ preset, fromIso: '', toIso: '' })
  }

  const setCustomField = (field: 'fromIso' | 'toIso', value: string) => {
    const base: DateFilterState = filter ?? { preset: 'custom', fromIso: '', toIso: '' }
    onChange({ ...base, preset: 'custom', [field]: value })
  }

  return (
    <div className="border-stroke border-t first:border-t-0">
      <FilterSectionHeader title={title} onReset={onReset} showReset={active} />
      <div className="flex flex-col gap-0.5 pb-2">
        {DATE_PRESET_OPTIONS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={
              'text-fg-muted hover:text-fg-highlight flex w-full cursor-pointer items-center rounded-panel px-4 py-2 text-left font-sans text-standard leading-none hover:bg-area-highlight focus-visible:bg-area-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-highlight/35 ' +
              (filter?.preset === id ? 'text-fg-highlight bg-area-highlight' : '')
            }
            onClick={() => setPreset(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 px-4 pb-3">
        <label className="block min-w-0">
          <span className="text-fg-muted mb-1 block text-badge">From</span>
          <input
            type="date"
            value={filter?.fromIso ?? ''}
            onChange={(e) => setCustomField('fromIso', e.target.value)}
            className={filterDropdownDateInputClassName}
          />
        </label>
        <label className="block min-w-0">
          <span className="text-fg-muted mb-1 block text-badge">To</span>
          <input
            type="date"
            value={filter?.toIso ?? ''}
            onChange={(e) => setCustomField('toIso', e.target.value)}
            className={filterDropdownDateInputClassName}
          />
        </label>
      </div>
    </div>
  )
}

type FiltersDropdownProps = {
  assets: SpatialAsset[]
  projectType: ProjectType
  filters: FeatureLibraryFilters
  onFiltersChange: (filters: FeatureLibraryFilters) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FiltersDropdown({
  assets,
  projectType,
  filters,
  onFiltersChange,
  open,
  onOpenChange,
}: FiltersDropdownProps) {
  const locationOptions = distinctLocationFilterValues(assets, projectType)
  const typeOptions = distinctTypeFilterOptions(assets)

  const toggleType = (id: FeatureTypeFilter) => {
    const has = filters.types.includes(id)
    onFiltersChange({
      ...filters,
      types: has ? filters.types.filter((t) => t !== id) : [...filters.types, id],
    })
  }

  const toggleLocation = (location: string) => {
    const has = filters.locations.includes(location)
    onFiltersChange({
      ...filters,
      locations: has
        ? filters.locations.filter((l) => l !== location)
        : [...filters.locations, location],
    })
  }

  return (
    <DropdownPanel
      panelAriaLabel="Filters"
      align="left"
      panelWidth="348px"
      open={open}
      onOpenChange={onOpenChange}
      renderTrigger={({ open: isOpen, panelId, onToggle }) => (
        <button
          type="button"
          onClick={onToggle}
          className={`${secondaryToolbarButtonClassName} ${isOpen ? secondaryToolbarButtonActiveClassName : ''}`}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-controls={panelId}
        >
          <span className="text-fg-muted shrink-0" aria-hidden>
            <FunnelIcon />
          </span>
          Filters
        </button>
      )}
    >
      <div className="max-h-[420px] overflow-y-auto">
        <FilterSectionHeader
          title="Type"
          showReset={filters.types.length > 0}
          onReset={() => onFiltersChange({ ...filters, types: [] })}
        />
        <div className="pb-2">
          {typeOptions.map(({ id, label }) => (
            <Checkbox
              key={id}
              id={`filter-type-${id}`}
              label={label}
              checked={filters.types.includes(id)}
              onChange={() => toggleType(id)}
            />
          ))}
        </div>

        {locationOptions.length > 0 ? (
          <>
            <FilterSectionHeader
              title="Location"
              showReset={filters.locations.length > 0}
              onReset={() => onFiltersChange({ ...filters, locations: [] })}
            />
            <div className="pb-2">
              {locationOptions.map((location) => (
                <Checkbox
                  key={location}
                  id={`filter-loc-${location}`}
                  label={location}
                  checked={filters.locations.includes(location)}
                  onChange={() => toggleLocation(location)}
                />
              ))}
            </div>
          </>
        ) : null}

        <DateFilterSection
          title="Date Uploaded"
          filter={filters.dateUploaded}
          onChange={(dateUploaded) => onFiltersChange({ ...filters, dateUploaded })}
          onReset={() => onFiltersChange({ ...filters, dateUploaded: null })}
        />

        <DateFilterSection
          title="Date Captured"
          filter={filters.dateCaptured}
          onChange={(dateCaptured) => onFiltersChange({ ...filters, dateCaptured })}
          onReset={() => onFiltersChange({ ...filters, dateCaptured: null })}
        />

        <div className="border-stroke border-t">
          <FilterSectionHeader
            title="Size"
            showReset={filters.sizeMinMb.trim() !== '' || filters.sizeMaxMb.trim() !== ''}
            onReset={() => onFiltersChange({ ...filters, sizeMinMb: '', sizeMaxMb: '' })}
          />
          <div className="grid grid-cols-2 gap-2 px-4 pb-3">
            <label className="block min-w-0">
              <span className="text-fg-muted mb-1 block text-badge">Min (MB)</span>
              <input
                type="number"
                min={0}
                step="0.1"
                placeholder="Any"
                value={filters.sizeMinMb}
                onChange={(e) => onFiltersChange({ ...filters, sizeMinMb: e.target.value })}
                className={featureMetadataInputClassName}
              />
            </label>
            <label className="block min-w-0">
              <span className="text-fg-muted mb-1 block text-badge">Max (MB)</span>
              <input
                type="number"
                min={0}
                step="0.1"
                placeholder="Any"
                value={filters.sizeMaxMb}
                onChange={(e) => onFiltersChange({ ...filters, sizeMaxMb: e.target.value })}
                className={featureMetadataInputClassName}
              />
            </label>
          </div>
        </div>
      </div>

      {isFilterActive(filters) ? (
        <div className="border-stroke border-t px-4 py-3">
          <button
            type="button"
            onClick={() => onFiltersChange(createEmptyFilters())}
            className="text-fg-highlight w-full text-left text-standard hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-highlight/35"
          >
            Clear all filters
          </button>
        </div>
      ) : null}
    </DropdownPanel>
  )
}
