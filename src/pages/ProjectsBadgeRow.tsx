import {
  FilterBadge,
  type ActiveFilter,
} from '@/panels/library/FeatureLibraryBadges'

const countBadgeClassName =
  'text-fg-muted inline-flex h-badge min-h-badge max-h-badge min-w-0 shrink-0 items-center justify-center rounded-panel bg-area-highlight px-2 text-badge font-bold leading-none'

type ProjectsBadgeRowProps = {
  projectCount: number
  activeFilters?: ActiveFilter[]
  onRemoveFilter?: (id: string) => void
}

/**
 * Same strip height and layout as `FeatureLibraryFilterRow` / `badge-container-feature-lib`.
 */
export function ProjectsBadgeRow({
  projectCount,
  activeFilters = [],
  onRemoveFilter,
}: ProjectsBadgeRowProps) {
  const label = projectCount === 1 ? 'Project' : 'Projects'
  return (
    <div
      id="badge-container-projects"
      className="flex h-14 w-full shrink-0 items-center gap-2 bg-transparent px-panel-padding"
      aria-label="Project summary and active filters"
    >
      <div className={countBadgeClassName} role="status" aria-live="polite">
        {projectCount} {label}
      </div>
      {activeFilters.length > 0 && onRemoveFilter != null
        ? activeFilters.map((f) => (
            <FilterBadge
              key={f.id}
              id={f.id}
              label={f.label}
              onRemove={onRemoveFilter}
            />
          ))
        : null}
    </div>
  )
}
