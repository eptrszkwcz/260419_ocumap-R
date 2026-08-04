import { useRef, useState } from 'react'

import {
  CrosshairTargetMarker,
  crosshairTargetMarkerColor,
} from '@/components/CrosshairTargetMarker'
import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import type { MediaAnnotationMarker, SpatialAsset } from '@/data/sampleAssets'
import type { ProjectType } from '@/data/sampleProjects'

import { columnDefinitions } from '@/panels/library/featureLibrary/columnDefinitions'
import { useDeferredRowClick } from '@/panels/library/featureLibrary/useDeferredRowClick'
import type { OptionalColumnId } from '@/panels/library/featureLibrary/types'
import { FeatureLibraryRowMenu } from '@/panels/library/FeatureLibraryRowMenu'

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      className={'shrink-0 transition-transform ' + (open ? 'rotate-90' : '')}
      aria-hidden
    >
      <path
        d="M4.5 3 7.5 6 4.5 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function markerSubRowCellValue(columnId: OptionalColumnId, marker: MediaAnnotationMarker): string {
  if (columnId === 'type') return 'Marker'
  if (columnId === 'dateUploaded') return marker.dateAdded
  return ''
}

export type FeatureLibraryTableRowProps = {
  asset: SpatialAsset
  projectType: ProjectType
  visibleColumns: OptionalColumnId[]
  isSelected?: boolean
  onSelect?: (shiftKey: boolean) => void
  onToggleSelection?: () => void
  onOpen?: () => void
  onOpenMarker?: (marker: MediaAnnotationMarker) => void
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
  onOpenMarker,
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
  const [expanded, setExpanded] = useState(false)
  const mediaMarkers = asset.mediaMarkers ?? []
  const hasMediaMarkers = mediaMarkers.length > 0

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
    <>
      <tr
        className={rowClassName}
        tabIndex={isInteractive ? 0 : undefined}
        aria-selected={isSelected || undefined}
        aria-expanded={hasMediaMarkers ? expanded : undefined}
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
          <div className="flex min-w-0 items-center gap-2">
            {hasMediaMarkers ? (
              <button
                type="button"
                className="text-fg-muted hover:text-fg-highlight flex size-5 shrink-0 items-center justify-center rounded focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none"
                aria-label={expanded ? 'Collapse markers' : 'Expand markers'}
                aria-expanded={expanded}
                onClick={(e) => {
                  e.stopPropagation()
                  setExpanded((v) => !v)
                }}
              >
                <ChevronIcon open={expanded} />
              </button>
            ) : (
              <span className="size-5 shrink-0" aria-hidden />
            )}
            <span className="block min-w-0 truncate">{asset.title}</span>
          </div>
        </td>
        {visibleColumns.map((id) => (
          <td
            key={id}
            className={`pl-0 pr-4 align-middle whitespace-nowrap ${cellTextClass}`}
          >
            {columnDefinitions[id].getCellValue(asset, projectType)}
          </td>
        ))}
        <td
          className="pl-0 pr-0 text-center align-middle"
          onClick={(e) => e.stopPropagation()}
        >
          {hasMediaMarkers ? (
            <span
              className="inline-flex size-8 items-center justify-center"
              aria-label={`${mediaMarkers.length} marker${mediaMarkers.length === 1 ? '' : 's'}`}
            >
              <CrosshairTargetMarker
                size={16}
                color={crosshairTargetMarkerColor(mediaMarkers[0]?.color, false)}
              />
            </span>
          ) : null}
        </td>
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
      {expanded && hasMediaMarkers
        ? mediaMarkers.map((marker) => (
            <tr
              key={marker.id}
              className="group h-8 cursor-pointer border-b-[0.5px] border-solid border-stroke bg-area-highlight/40 hover:bg-area-highlight"
              onClick={(e) => {
                e.stopPropagation()
                onOpenMarker?.(marker)
              }}
            >
              <td className="min-w-0 pl-panel-padding pr-4 align-middle">
                <div className="flex min-w-0 items-center gap-2 pl-7">
                  <span
                    className="inline-flex size-3 shrink-0 items-center justify-center"
                    aria-hidden
                  >
                    <CrosshairTargetMarker
                      size={12}
                      color={crosshairTargetMarkerColor(marker.color, false)}
                    />
                  </span>
                  <span className="text-fg-muted group-hover:text-fg-highlight block truncate font-sans text-standard">
                    {marker.name}
                  </span>
                </div>
              </td>
              {visibleColumns.map((id) => (
                <td
                  key={id}
                  className="text-fg-muted group-hover:text-fg-highlight pl-0 pr-4 align-middle whitespace-nowrap font-sans text-standard"
                >
                  {markerSubRowCellValue(id, marker)}
                </td>
              ))}
              <td className="pl-0 pr-0 align-middle" aria-hidden />
              <td className="pl-0 pr-panel-padding align-middle" aria-hidden />
            </tr>
          ))
        : null}
    </>
  )
}
