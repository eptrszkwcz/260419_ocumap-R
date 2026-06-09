import { Checkbox } from '@/components/Checkbox'
import { DropdownPanel } from '@/components/DropdownPanel'
import {
  FunnelIcon,
  secondaryToolbarButtonActiveClassName,
  secondaryToolbarButtonClassName,
} from '@/components/ControlHeaderToolbar'
import { featureMetadataInputClassName } from '@/panels/library/featureMetadata/styles'
import { DATE_PRESET_OPTIONS } from '@/panels/library/featureLibrary/filterBadges'
import { filterDropdownDateInputClassName } from '@/panels/library/featureLibrary/styles'
import type {
  DateFilterPreset,
  DateFilterState,
} from '@/panels/library/featureLibrary/types'

import {
  distinctTeamFilterValues,
  isProjectFilterActive,
} from '@/pages/projects/applyProjectFilters'
import {
  PROJECT_STATUS_FILTER_OPTIONS,
  PROJECT_TYPE_FILTER_OPTIONS,
} from '@/pages/projects/filterBadges'
import type { ProjectFilters } from '@/pages/projects/types'
import { createEmptyProjectFilters } from '@/pages/projects/types'
import type { ProjectRecord } from '@/data/sampleProjects'

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

type ProjectsFiltersDropdownProps = {
  projects: ProjectRecord[]
  filters: ProjectFilters
  onFiltersChange: (filters: ProjectFilters) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectsFiltersDropdown({
  projects,
  filters,
  onFiltersChange,
  open,
  onOpenChange,
}: ProjectsFiltersDropdownProps) {
  const teamOptions = distinctTeamFilterValues(projects)

  const toggleStatus = (status: (typeof PROJECT_STATUS_FILTER_OPTIONS)[number]['status']) => {
    const has = filters.statuses.includes(status)
    onFiltersChange({
      ...filters,
      statuses: has
        ? filters.statuses.filter((s) => s !== status)
        : [...filters.statuses, status],
    })
  }

  const toggleType = (type: (typeof PROJECT_TYPE_FILTER_OPTIONS)[number]['type']) => {
    const has = filters.types.includes(type)
    onFiltersChange({
      ...filters,
      types: has ? filters.types.filter((t) => t !== type) : [...filters.types, type],
    })
  }

  const toggleTeam = (team: string) => {
    const has = filters.teams.includes(team)
    onFiltersChange({
      ...filters,
      teams: has ? filters.teams.filter((t) => t !== team) : [...filters.teams, team],
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
          title="Status"
          showReset={filters.statuses.length > 0}
          onReset={() => onFiltersChange({ ...filters, statuses: [] })}
        />
        <div className="pb-2">
          {PROJECT_STATUS_FILTER_OPTIONS.map(({ status, label }) => (
            <Checkbox
              key={status}
              id={`filter-project-status-${status}`}
              label={label}
              checked={filters.statuses.includes(status)}
              onChange={() => toggleStatus(status)}
            />
          ))}
        </div>

        <FilterSectionHeader
          title="Type"
          showReset={filters.types.length > 0}
          onReset={() => onFiltersChange({ ...filters, types: [] })}
        />
        <div className="pb-2">
          {PROJECT_TYPE_FILTER_OPTIONS.map(({ type, label }) => (
            <Checkbox
              key={type}
              id={`filter-project-type-${type}`}
              label={label}
              checked={filters.types.includes(type)}
              onChange={() => toggleType(type)}
            />
          ))}
        </div>

        {teamOptions.length > 0 ? (
          <>
            <FilterSectionHeader
              title="Team"
              showReset={filters.teams.length > 0}
              onReset={() => onFiltersChange({ ...filters, teams: [] })}
            />
            <div className="pb-2">
              {teamOptions.map((team) => (
                <Checkbox
                  key={team}
                  id={`filter-project-team-${team}`}
                  label={team}
                  checked={filters.teams.includes(team)}
                  onChange={() => toggleTeam(team)}
                />
              ))}
            </div>
          </>
        ) : null}

        <DateFilterSection
          title="Last Modified"
          filter={filters.lastModified}
          onChange={(lastModified) => onFiltersChange({ ...filters, lastModified })}
          onReset={() => onFiltersChange({ ...filters, lastModified: null })}
        />

        <DateFilterSection
          title="Created"
          filter={filters.created}
          onChange={(created) => onFiltersChange({ ...filters, created })}
          onReset={() => onFiltersChange({ ...filters, created: null })}
        />

        <div className="border-stroke border-t">
          <FilterSectionHeader
            title="File Count"
            showReset={filters.fileCountMin.trim() !== '' || filters.fileCountMax.trim() !== ''}
            onReset={() => onFiltersChange({ ...filters, fileCountMin: '', fileCountMax: '' })}
          />
          <div className="grid grid-cols-2 gap-2 px-4 pb-3">
            <label className="block min-w-0">
              <span className="text-fg-muted mb-1 block text-badge">Min</span>
              <input
                type="number"
                min={0}
                step={1}
                placeholder="Any"
                value={filters.fileCountMin}
                onChange={(e) => onFiltersChange({ ...filters, fileCountMin: e.target.value })}
                className={featureMetadataInputClassName}
              />
            </label>
            <label className="block min-w-0">
              <span className="text-fg-muted mb-1 block text-badge">Max</span>
              <input
                type="number"
                min={0}
                step={1}
                placeholder="Any"
                value={filters.fileCountMax}
                onChange={(e) => onFiltersChange({ ...filters, fileCountMax: e.target.value })}
                className={featureMetadataInputClassName}
              />
            </label>
          </div>
        </div>

        <div className="border-stroke border-t">
          <FilterSectionHeader
            title="Size (MB)"
            showReset={filters.projectSizeMin.trim() !== '' || filters.projectSizeMax.trim() !== ''}
            onReset={() => onFiltersChange({ ...filters, projectSizeMin: '', projectSizeMax: '' })}
          />
          <div className="grid grid-cols-2 gap-2 px-4 pb-3">
            <label className="block min-w-0">
              <span className="text-fg-muted mb-1 block text-badge">Min</span>
              <input
                type="number"
                min={0}
                step={1}
                placeholder="Any"
                value={filters.projectSizeMin}
                onChange={(e) => onFiltersChange({ ...filters, projectSizeMin: e.target.value })}
                className={featureMetadataInputClassName}
              />
            </label>
            <label className="block min-w-0">
              <span className="text-fg-muted mb-1 block text-badge">Max</span>
              <input
                type="number"
                min={0}
                step={1}
                placeholder="Any"
                value={filters.projectSizeMax}
                onChange={(e) => onFiltersChange({ ...filters, projectSizeMax: e.target.value })}
                className={featureMetadataInputClassName}
              />
            </label>
          </div>
        </div>
      </div>

      {isProjectFilterActive(filters) ? (
        <div className="border-stroke border-t px-4 py-3">
          <button
            type="button"
            onClick={() => onFiltersChange(createEmptyProjectFilters())}
            className="text-fg-highlight w-full text-left text-standard hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-highlight/35"
          >
            Clear all filters
          </button>
        </div>
      ) : null}
    </DropdownPanel>
  )
}
