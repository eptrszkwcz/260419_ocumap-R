import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import type { SpatialAsset } from '@/data/sampleAssets'
import type { ProjectType } from '@/data/sampleProjects'

import { columnDefinitions } from '@/panels/library/featureLibrary/columnDefinitions'
import type { OptionalColumnId } from '@/panels/library/featureLibrary/types'
import { FeatureLibraryRowMenu } from '@/panels/library/FeatureLibraryRowMenu'

export type FeatureLibraryTableRowProps = {
  asset: SpatialAsset
  projectType: ProjectType
  visibleColumns: OptionalColumnId[]
  onOpen?: () => void
  onSetLocation?: () => void
  onDownload?: () => void
  onDelete?: () => void
  onFeatureProperties?: () => void
}

/** One 40px data row: feature name, optional columns, actions. */
export function FeatureLibraryTableRow({
  asset,
  projectType,
  visibleColumns,
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
      {visibleColumns.map((id) => (
        <td
          key={id}
          className={`pl-0 pr-4 align-middle whitespace-nowrap ${cellTextClass}`}
        >
          {columnDefinitions[id].getCellValue(asset, projectType)}
        </td>
      ))}
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
