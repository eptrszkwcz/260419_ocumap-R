import { useRef } from 'react'

import { SortableColumnHeader, type SortDirection } from '@/components/SortableColumnHeader'
import type { SpatialAsset } from '@/data/sampleAssets'
import type { ProjectType } from '@/data/sampleProjects'

import {
  ACTIONS_COLUMN_WIDTH_PX,
  columnDefinitions,
  FEATURE_COLUMN_MIN_WIDTH_PX,
  MARKERS_INDICATOR_COLUMN_WIDTH_PX,
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
  onOpenMediaMarker?: (asset: SpatialAsset, marker: import('@/data/sampleAssets').MediaAnnotationMarker) => void
  onSetLocation?: (asset: SpatialAsset) => void
  onDownloadAsset?: (asset: SpatialAsset) => void
  onCopyAsset?: (asset: SpatialAsset) => void
  onMoveAsset?: (asset: SpatialAsset) => void
  onDeleteAsset?: (asset: SpatialAsset) => void
  onFeatureProperties?: (asset: SpatialAsset) => void
}

const tableClassName =
  'w-full min-w-0 table-fixed border-collapse text-left font-sans text-standard'

function FeatureLibraryTableColgroup({ visibleColumns }: { visibleColumns: OptionalColumnId[] }) {
  return (
    <colgroup>
      <col style={{ minWidth: FEATURE_COLUMN_MIN_WIDTH_PX, width: `${FEATURE_COLUMN_MIN_WIDTH_PX}px` }} />
      {visibleColumns.map((id) => (
        <col key={id} style={{ width: `${columnDefinitions[id].minWidthPx}px` }} />
      ))}
      <col style={{ width: `${MARKERS_INDICATOR_COLUMN_WIDTH_PX}px` }} />
      <col style={{ width: `${ACTIONS_COLUMN_WIDTH_PX}px` }} />
    </colgroup>
  )
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
  onOpenMediaMarker,
  onSetLocation,
  onDownloadAsset,
  onCopyAsset,
  onMoveAsset,
  onDeleteAsset,
  onFeatureProperties,
}: FeatureLibraryTableProps) {
  const headerScrollRef = useRef<HTMLDivElement>(null)
  const bodyScrollRef = useRef<HTMLDivElement>(null)

  const syncHeaderScrollLeft = () => {
    const body = bodyScrollRef.current
    const header = headerScrollRef.current
    if (body == null || header == null) return
    header.scrollLeft = body.scrollLeft
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
      <div ref={headerScrollRef} className="shrink-0 overflow-hidden">
        <table className={tableClassName}>
          <FeatureLibraryTableColgroup visibleColumns={visibleColumns} />
          <thead>
            <tr className="h-10 border-b border-solid border-fg-muted">
              <th
                className="bg-panel pl-panel-padding pr-4 text-left font-bold text-fg"
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
                <th key={id} className="bg-panel pl-0 pr-4 font-bold text-fg" scope="col">
                  <SortableColumnHeader
                    label={columnDefinitions[id].label}
                    activeDirection={sortColumn === id ? sortDirection : null}
                    onSort={() => onSortColumn(id)}
                  />
                </th>
              ))}
              <th
                className="bg-panel pl-0 pr-0 text-center font-bold"
                scope="col"
                style={{ width: MARKERS_INDICATOR_COLUMN_WIDTH_PX }}
                aria-label="Markers"
              >
                <span className="sr-only">Markers</span>
              </th>
              <th
                className="bg-panel pr-panel-padding pl-0 text-right font-bold"
                scope="col"
                aria-label="Actions"
              >
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
        </table>
      </div>
      <div
        ref={bodyScrollRef}
        className="min-h-0 flex-1 overflow-auto px-0"
        onScroll={syncHeaderScrollLeft}
      >
        <table className={tableClassName}>
          <FeatureLibraryTableColgroup visibleColumns={visibleColumns} />
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
                onOpenMarker={
                  onOpenMediaMarker != null ? (marker) => onOpenMediaMarker(asset, marker) : undefined
                }
                onSetLocation={onSetLocation != null ? () => onSetLocation(asset) : undefined}
                onDownload={onDownloadAsset != null ? () => onDownloadAsset(asset) : undefined}
                onCopy={onCopyAsset != null ? () => onCopyAsset(asset) : undefined}
                onMove={onMoveAsset != null ? () => onMoveAsset(asset) : undefined}
                onDelete={onDeleteAsset != null ? () => onDeleteAsset(asset) : undefined}
                onFeatureProperties={
                  onFeatureProperties != null ? () => onFeatureProperties(asset) : undefined
                }
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
