import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import { getAssetTypeLabel, type SpatialAsset } from '@/data/sampleAssets'
import { floorPlanDisplayLabel } from '@/panels/map/mapFloorPlans'

function assetLocationLabel(asset: SpatialAsset): string {
  const floorPlanId = asset.floorPlanPosition?.floorPlanId
  if (floorPlanId == null) return '—'
  return floorPlanDisplayLabel(floorPlanId)
}

function MoreVerticalIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="8" cy="3" r="1.5" fill="currentColor" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
      <circle cx="8" cy="13" r="1.5" fill="currentColor" />
    </svg>
  )
}

export type FeatureLibraryTableRowProps = {
  asset: SpatialAsset
  showLocationColumn?: boolean
  onOpen?: () => void
}

/** One 40px data row: name, date, type, [location], actions. Use one instance per asset inside `<tbody>`. */
export function FeatureLibraryTableRow({
  asset,
  showLocationColumn = false,
  onOpen,
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
      <td className="pl-0 pr-panel-padding text-right align-middle">
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={
            (isLinked ? 'text-fg-highlight ' : 'text-fg-muted group-hover:text-fg-highlight ') +
            'inline-flex h-8 w-8 items-center justify-center rounded-panel align-middle transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/40 focus-visible:outline-none'
          }
          aria-label={`Actions for ${asset.title}`}
        >
          <MoreVerticalIcon />
        </button>
      </td>
    </tr>
  )
}
