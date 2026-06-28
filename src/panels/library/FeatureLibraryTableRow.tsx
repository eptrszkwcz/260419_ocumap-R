import { useRef } from 'react'

import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import type { SpatialAsset } from '@/data/sampleAssets'
import type { ProjectType } from '@/data/sampleProjects'

import { columnDefinitions } from '@/panels/library/featureLibrary/columnDefinitions'
import { useDeferredRowClick } from '@/panels/library/featureLibrary/useDeferredRowClick'
import type { OptionalColumnId } from '@/panels/library/featureLibrary/types'
import { FeatureLibraryRowMenu } from '@/panels/library/FeatureLibraryRowMenu'

export type FeatureLibraryTableRowProps = {
  asset: SpatialAsset
  projectType: ProjectType
  visibleColumns: OptionalColumnId[]
  isSelected?: boolean
  onSelect?: (shiftKey: boolean) => void
  onToggleSelection?: () => void
  onOpen?: () => void
  onSetLocation?: () => void
  onDownload?: () => void
  onCopy?: () => void
  onMove?: () => void
  onDelete?: () => void
  onFeatureProperties?: () => void
}

/** One 40px data row: feature name, optional columns, actions. */
export function FeatureLibraryTableRow({
  asset,
  projectType,
  visibleColumns,
  isSelected = false,
  onSelect,
  onToggleSelection,
  onOpen,
  onSetLocation,
  onDownload,
  onCopy,
  onMove,
  onDelete,
  onFeatureProperties,
}: FeatureLibraryTableRowProps) {
  const { linkedFeatureId, setTableHoveredFeatureId } = useFeatureMapHover()
  const isLinked = linkedFeatureId === asset.id
  const isInteractive = onSelect != null || onOpen != null
  const pendingShiftRef = useRef(false)

  const { handleClick: deferClick, handleDoubleClick } = useDeferredRowClick(
    () => onSelect?.(pendingShiftRef.current),
    () => onOpen?.(),
  )

  const isHighlighted = isSelected || isLinked
  const cellTextClass = isHighlighted
    ? 'text-fg-highlight'
    : 'text-fg-muted group-hover:text-fg-highlight'

  const rowClassName =
    'group h-10 border-b-[0.5px] border-solid border-stroke font-normal transition-colors ' +
    (isSelected
      ? 'bg-area-highlight-selected font-semibold hover:bg-area-highlight-selected '
      : isLinked
        ? 'bg-area-highlight font-semibold '
        : 'hover:bg-area-highlight hover:font-semibold ') +
    (isInteractive
      ? 'cursor-pointer outline-none focus:outline-none focus-visible:outline-none'
      : '')

  return (
    <tr
      className={rowClassName}
      tabIndex={isInteractive ? 0 : undefined}
      aria-selected={isSelected || undefined}
      onMouseEnter={() => setTableHoveredFeatureId(asset.id)}
      onMouseLeave={() => setTableHoveredFeatureId(null)}
      onMouseDown={
        isInteractive
          ? (e) => {
              if (e.shiftKey) e.preventDefault()
            }
          : undefined
      }
      onClick={
        isInteractive
          ? (e) => {
              pendingShiftRef.current = e.shiftKey
              deferClick()
            }
          : undefined
      }
      onDoubleClick={onOpen != null ? handleDoubleClick : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                onOpen?.()
              } else if (e.key === ' ') {
                e.preventDefault()
                onToggleSelection?.()
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
        onCopy != null &&
        onMove != null &&
        onDelete != null &&
        onFeatureProperties != null ? (
          <FeatureLibraryRowMenu
            asset={asset}
            isLinked={isLinked || isSelected}
            onSetLocation={onSetLocation}
            onDownload={onDownload}
            onCopy={onCopy}
            onMove={onMove}
            onDelete={onDelete}
            onFeatureProperties={onFeatureProperties}
          />
        ) : null}
      </td>
    </tr>
  )
}
