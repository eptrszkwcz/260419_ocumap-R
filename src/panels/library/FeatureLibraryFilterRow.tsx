import {
  FeatureCountBadge,
  FilterBadge,
  type ActiveFilter,
} from '@/panels/library/FeatureLibraryBadges'
import { FeatureLibraryActionBar } from '@/panels/library/FeatureLibraryActionBar'

type FeatureLibraryFilterRowProps = {
  featureCount: number
  activeFilters: ActiveFilter[]
  onRemoveFilter: (id: string) => void
  selectedCount?: number
  onClearSelection?: () => void
  onDownloadSelected?: () => void
  onCopySelected?: () => void
  onMoveSelected?: () => void
  onDeleteSelected?: () => void
}

/**
 * Second toolbar row: feature count and optional applied-filter chips (40px),
 * or bulk action bar when features are selected.
 */
export function FeatureLibraryFilterRow({
  featureCount,
  activeFilters,
  onRemoveFilter,
  selectedCount = 0,
  onClearSelection,
  onDownloadSelected,
  onCopySelected,
  onMoveSelected,
  onDeleteSelected,
}: FeatureLibraryFilterRowProps) {
  if (selectedCount > 0) {
    return (
      <div
        className="flex h-14 w-full min-w-0 shrink-0 items-center px-panel-padding"
        aria-label="Selected feature actions"
      >
        <FeatureLibraryActionBar
          selectedCount={selectedCount}
          onClearSelection={onClearSelection ?? (() => undefined)}
          onDownload={onDownloadSelected ?? (() => undefined)}
          onCopy={onCopySelected ?? (() => undefined)}
          onMove={onMoveSelected ?? (() => undefined)}
          onDelete={onDeleteSelected ?? (() => undefined)}
        />
      </div>
    )
  }

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
