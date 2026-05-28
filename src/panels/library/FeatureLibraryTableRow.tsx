import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import { getAssetTypeLabel, type SpatialAsset } from '@/data/sampleAssets'
import { floorPlanDisplayLabel } from '@/panels/map/mapFloorPlans'
import { FeatureLibraryRowMenu } from '@/panels/library/FeatureLibraryRowMenu'

function assetLocationLabel(asset: SpatialAsset): string {
  const floorPlanId = asset.floorPlanPosition?.floorPlanId
  if (floorPlanId == null) return '—'
  return floorPlanDisplayLabel(floorPlanId)
}

export type FeatureLibraryTableRowProps = {
  asset: SpatialAsset
  showLocationColumn?: boolean
  onOpen?: () => void
  onSetLocation?: () => void
  onDownload?: () => void
  onDelete?: () => void
  onFeatureProperties?: () => void
}

/** One 40px data row: name, date, type, [location], actions. Use one instance per asset inside `<tbody>`. */
export function FeatureLibraryTableRow({
  asset,
  showLocationColumn = false,
  onOpen,
  onSetLocation,
  onDownload,
  onDelete,
  onFeatureProperties,
}: FeatureLibraryTableRowProps) {
  const { linkedFeatureId, setTableHoveredFeatureId } = useFeatureMapHover()
  const isLinked = linkedFeatureId === asset.id

  const cellTextClass = isLinked
    ? 'text-fg-highlight'
    : 'text-fg-muted group-hover:text-fg-highlight'

  return (
    <tr
      className={
        'group h-10 border-b-[0.5px] border-solid border-stroke font-normal transition-colors ' +
        (isLinked
          ? 'bg-area-highlight font-semibold '
          : 'hover:bg-area-highlight hover:font-semibold ') +
        (onOpen != null
          ? 'cursor-pointer focus-visible:bg-area-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:ring-inset'
          : '')
      }
      tabIndex={onOpen != null ? 0 : undefined}
      onMouseEnter={() => setTableHoveredFeatureId(asset.id)}
      onMouseLeave={() => setTableHoveredFeatureId(null)}
      onClick={onOpen != null ? onOpen : undefined}
      onKeyDown={
        onOpen != null
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen()
              }
            }
          : undefined
      }
    >
      <td className={`min-w-0 pl-panel-padding pr-4 align-middle ${cellTextClass}`}>
        <span className="block truncate">{asset.title}</span>
      </td>
      <td className={`pl-0 pr-4 align-middle whitespace-nowrap ${cellTextClass}`}>
        {asset.dateUploaded}
      </td>
      <td className={`pl-0 pr-4 align-middle whitespace-nowrap ${cellTextClass}`}>
        {getAssetTypeLabel(asset.kind)}
      </td>
      {showLocationColumn ? (
        <td className={`pl-0 pr-4 align-middle whitespace-nowrap ${cellTextClass}`}>
          {assetLocationLabel(asset)}
        </td>
      ) : null}
      <td className="pl-0 pr-panel-padding text-right align-middle" onClick={(e) => e.stopPropagation()}>
        {onSetLocation != null &&
        onDownload != null &&
        onDelete != null &&
        onFeatureProperties != null ? (
          <FeatureLibraryRowMenu
            asset={asset}
            isLinked={isLinked}
            onSetLocation={onSetLocation}
            onDownload={onDownload}
            onDelete={onDelete}
            onFeatureProperties={onFeatureProperties}
          />
        ) : null}
      </td>
    </tr>
  )
}
