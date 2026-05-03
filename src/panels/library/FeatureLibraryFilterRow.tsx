import {
  FeatureCountBadge,
  FilterBadge,
  type ActiveFilter,
} from '@/panels/library/FeatureLibraryBadges'

type FeatureLibraryFilterRowProps = {
  featureCount: number
  activeFilters: ActiveFilter[]
  onRemoveFilter: (id: string) => void
}

/**
 * Second toolbar row: feature count and optional applied-filter chips (40px).
 */
export function FeatureLibraryFilterRow({
  featureCount,
  activeFilters,
  onRemoveFilter,
}: FeatureLibraryFilterRowProps) {
  return (
    <div
      id="badge-container-feature-lib"
      className="flex h-14 w-full shrink-0 items-center gap-2 px-panel-padding"
      aria-label="Feature summary and active filters"
    >
      <FeatureCountBadge count={featureCount} />
      {activeFilters.length > 0
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
