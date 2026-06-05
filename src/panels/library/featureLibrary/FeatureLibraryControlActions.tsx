import type { SpatialAsset } from '@/data/sampleAssets'
import type { ProjectType } from '@/data/sampleProjects'

import { ColumnsDropdown } from '@/panels/library/featureLibrary/ColumnsDropdown'
import { FiltersDropdown } from '@/panels/library/featureLibrary/FiltersDropdown'
import type {
  FeatureLibraryFilters,
  LibraryDropdownId,
  LibraryViewType,
  OptionalColumnId,
} from '@/panels/library/featureLibrary/types'
import { ViewModeDropdown } from '@/panels/library/featureLibrary/ViewModeDropdown'

type FeatureLibraryControlActionsProps = {
  assets: SpatialAsset[]
  projectType: ProjectType
  viewType: LibraryViewType
  onViewTypeChange: (viewType: LibraryViewType) => void
  columnOrder: OptionalColumnId[]
  columnVisibility: Record<OptionalColumnId, boolean>
  onColumnOrderChange: (order: OptionalColumnId[]) => void
  onColumnVisibilityChange: (id: OptionalColumnId, visible: boolean) => void
  filters: FeatureLibraryFilters
  onFiltersChange: (filters: FeatureLibraryFilters) => void
  openDropdown: LibraryDropdownId | null
  onOpenDropdownChange: (id: LibraryDropdownId | null) => void
}

export function FeatureLibraryControlActions({
  assets,
  projectType,
  viewType,
  onViewTypeChange,
  columnOrder,
  columnVisibility,
  onColumnOrderChange,
  onColumnVisibilityChange,
  filters,
  onFiltersChange,
  openDropdown,
  onOpenDropdownChange,
}: FeatureLibraryControlActionsProps) {
  return (
    <>
      <ViewModeDropdown
        viewType={viewType}
        onViewTypeChange={onViewTypeChange}
        open={openDropdown === 'view'}
        onOpenChange={(open) => onOpenDropdownChange(open ? 'view' : null)}
      />
      <ColumnsDropdown
        viewType={viewType}
        columnOrder={columnOrder}
        columnVisibility={columnVisibility}
        onColumnOrderChange={onColumnOrderChange}
        onColumnVisibilityChange={onColumnVisibilityChange}
        open={openDropdown === 'columns'}
        onOpenChange={(open) => onOpenDropdownChange(open ? 'columns' : null)}
      />
      <FiltersDropdown
        assets={assets}
        projectType={projectType}
        filters={filters}
        onFiltersChange={onFiltersChange}
        open={openDropdown === 'filters'}
        onOpenChange={(open) => onOpenDropdownChange(open ? 'filters' : null)}
      />
    </>
  )
}
