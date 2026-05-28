import type { SpatialAsset } from '@/data/sampleAssets'
import { FeatureLibraryTableRow } from '@/panels/library/FeatureLibraryTableRow'

type FeatureLibraryTableProps = {
  assets: SpatialAsset[]
  onOpenAsset?: (asset: SpatialAsset) => void
  onSetLocation?: (asset: SpatialAsset) => void
  onDownloadAsset?: (asset: SpatialAsset) => void
  onDeleteAsset?: (asset: SpatialAsset) => void
  onFeatureProperties?: (asset: SpatialAsset) => void
  /** Building projects: show floor plan name in a Location column. */
  showLocationColumn?: boolean
}

/**
 * Full-width list: Name, Date, Type, [Location], actions. Rows 40px; hover fills area highlight and uses highlight text on cells + action icon.
 */
export function FeatureLibraryTable({
  assets,
  onOpenAsset,
  onSetLocation,
  onDownloadAsset,
  onDeleteAsset,
  onFeatureProperties,
  showLocationColumn = false,
}: FeatureLibraryTableProps) {
  return (
    <div className="min-h-0 w-full min-w-0 flex-1 overflow-auto px-0">
      <table className="w-full min-w-0 table-fixed border-collapse text-left font-sans text-standard">
        <colgroup>
          <col />
          <col style={{ width: '10rem' }} />
          <col style={{ width: '8.5rem' }} />
          {showLocationColumn ? <col style={{ width: '7rem' }} /> : null}
          <col style={{ width: '2.25rem' }} />
        </colgroup>
        <thead>
          <tr className="h-10 border-b border-solid border-fg-muted">
            <th className="pl-panel-padding pr-4 text-left font-bold text-fg" scope="col">
              Name
            </th>
            <th className="pl-0 pr-4 font-bold text-fg" scope="col">
              Date Uploaded
            </th>
            <th className="pl-0 pr-4 font-bold text-fg" scope="col">
              Type
            </th>
            {showLocationColumn ? (
              <th className="pl-0 pr-4 font-bold text-fg" scope="col">
                Location
              </th>
            ) : null}
            <th
              className="pr-panel-padding pl-0 text-right font-bold"
              scope="col"
              aria-label="Actions"
            >
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <FeatureLibraryTableRow
              key={asset.id}
              asset={asset}
              showLocationColumn={showLocationColumn}
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
