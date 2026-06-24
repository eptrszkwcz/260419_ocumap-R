import { SortableColumnHeader, type SortDirection } from '@/components/SortableColumnHeader'
import type { SpatialAsset } from '@/data/sampleAssets'
import type { ProjectType } from '@/data/sampleProjects'

import {
  ACTIONS_COLUMN_WIDTH_PX,
  columnDefinitions,
  FEATURE_COLUMN_MIN_WIDTH_PX,
} from '@/panels/library/featureLibrary/columnDefinitions'
import type { FeatureLibrarySortColumn } from '@/panels/library/featureLibrary/sortFeatureLibraryAssets'
import type { OptionalColumnId } from '@/panels/library/featureLibrary/types'
import { FeatureLibraryTableRow } from '@/panels/library/FeatureLibraryTableRow'

type FeatureLibraryTableProps = {
  assets: SpatialAsset[]
  projectType: ProjectType
  visibleColumns: OptionalColumnId[]
  sortColumn: FeatureLibrarySortColumn
  sortDirection: SortDirection
  selectedFeatureIds: Set<string>
  onSortColumn: (column: FeatureLibrarySortColumn) => void
  onSelectFeature?: (asset: SpatialAsset, index: number, shiftKey: boolean) => void
  onToggleFeatureSelection?: (asset: SpatialAsset, index: number) => void
  onOpenAsset?: (asset: SpatialAsset) => void
  onSetLocation?: (asset: SpatialAsset) => void
  onDownloadAsset?: (asset: SpatialAsset) => void
  onDeleteAsset?: (asset: SpatialAsset) => void
  onFeatureProperties?: (asset: SpatialAsset) => void
}

/**
 * Full-width list: Feature (pinned), optional columns, actions. Rows 40px.
 */
export function FeatureLibraryTable({
  assets,
  projectType,
  visibleColumns,
  sortColumn,
  sortDirection,
  selectedFeatureIds,
  onSortColumn,
  onSelectFeature,
  onToggleFeatureSelection,
  onOpenAsset,
  onSetLocation,
  onDownloadAsset,
  onDeleteAsset,
  onFeatureProperties,
}: FeatureLibraryTableProps) {
  return (
    <div className="min-h-0 w-full min-w-0 flex-1 overflow-auto px-0">
      <table className="w-full min-w-0 table-fixed border-collapse text-left font-sans text-standard">
        <colgroup>
          <col style={{ minWidth: FEATURE_COLUMN_MIN_WIDTH_PX, width: `${FEATURE_COLUMN_MIN_WIDTH_PX}px` }} />
          {visibleColumns.map((id) => (
            <col
              key={id}
              style={{ width: `${columnDefinitions[id].minWidthPx}px` }}
            />
          ))}
          <col style={{ width: `${ACTIONS_COLUMN_WIDTH_PX}px` }} />
        </colgroup>
        <thead>
          <tr className="h-10 border-b border-solid border-fg-muted">
            <th
              className="pl-panel-padding pr-4 text-left font-bold text-fg"
              scope="col"
              style={{ minWidth: FEATURE_COLUMN_MIN_WIDTH_PX }}
            >
              <SortableColumnHeader
                label="Feature"
                activeDirection={sortColumn === 'feature' ? sortDirection : null}
                onSort={() => onSortColumn('feature')}
              />
            </th>
            {visibleColumns.map((id) => (
              <th key={id} className="pl-0 pr-4 font-bold text-fg" scope="col">
                <SortableColumnHeader
                  label={columnDefinitions[id].label}
                  activeDirection={sortColumn === id ? sortDirection : null}
                  onSort={() => onSortColumn(id)}
                />
              </th>
            ))}
            <th
              className="pr-panel-padding pl-0 text-right font-bold"
              scope="col"
              aria-label="Actions"
            >
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="select-none">
          {assets.map((asset, index) => (
            <FeatureLibraryTableRow
              key={asset.id}
              asset={asset}
              projectType={projectType}
              visibleColumns={visibleColumns}
              isSelected={selectedFeatureIds.has(asset.id)}
              onSelect={
                onSelectFeature != null
                  ? (shiftKey) => onSelectFeature(asset, index, shiftKey)
                  : undefined
              }
              onToggleSelection={
                onToggleFeatureSelection != null
                  ? () => onToggleFeatureSelection(asset, index)
                  : undefined
              }
              onOpen={onOpenAsset != null ? () => onOpenAsset(asset) : undefined}
              onSetLocation={onSetLocation != null ? () => onSetLocation(asset) : undefined}
              onDownload={onDownloadAsset != null ? () => onDownloadAsset(asset) : undefined}
              onDelete={onDeleteAsset != null ? () => onDeleteAsset(asset) : undefined}
              onFeatureProperties={
                onFeatureProperties != null ? () => onFeatureProperties(asset) : undefined
              }
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
