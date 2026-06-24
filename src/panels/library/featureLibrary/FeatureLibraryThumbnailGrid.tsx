import { useRef } from 'react'

import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import { getFeatureTypeLabel, isDrawnFeature, type SpatialAsset } from '@/data/sampleAssets'
import type { ProjectType } from '@/data/sampleProjects'

import { assetLocationLabel } from '@/panels/library/featureLibrary/assetLocationLabel'
import { useDeferredRowClick } from '@/panels/library/featureLibrary/useDeferredRowClick'

type FeatureLibraryThumbnailGridProps = {
  assets: SpatialAsset[]
  projectType: ProjectType
  selectedFeatureIds: Set<string>
  onSelectFeature?: (asset: SpatialAsset, index: number, shiftKey: boolean) => void
  onToggleFeatureSelection?: (asset: SpatialAsset, index: number) => void
  onOpenAsset?: (asset: SpatialAsset) => void
}

function FeatureLibraryThumbnailItem({
  asset,
  index,
  projectType,
  isSelected,
  onSelectFeature,
  onToggleFeatureSelection,
  onOpenAsset,
}: {
  asset: SpatialAsset
  index: number
  projectType: ProjectType
  isSelected: boolean
  onSelectFeature?: (asset: SpatialAsset, index: number, shiftKey: boolean) => void
  onToggleFeatureSelection?: (asset: SpatialAsset, index: number) => void
  onOpenAsset?: (asset: SpatialAsset) => void
}) {
  const { linkedFeatureId, setTableHoveredFeatureId } = useFeatureMapHover()
  const isLinked = linkedFeatureId === asset.id
  const location = assetLocationLabel(asset, projectType)
  const isVideo = asset.kind === 'video' && !isDrawnFeature(asset)
  const isGeometry = isDrawnFeature(asset)
  const pendingShiftRef = useRef(false)

  const { handleClick: deferClick, handleDoubleClick } = useDeferredRowClick(
    () => onSelectFeature?.(asset, index, pendingShiftRef.current),
    () => onOpenAsset?.(asset),
  )

  const isHighlighted = isSelected || isLinked

  return (
    <button
      type="button"
      className={
        'group flex w-[140px] shrink-0 select-none flex-col gap-1.5 rounded-panel text-left outline-none transition-colors focus:outline-none focus-visible:outline-none ' +
        (isSelected
          ? 'bg-area-highlight-selected'
          : isLinked
            ? 'bg-area-highlight'
            : 'hover:bg-area-highlight')
      }
      aria-selected={isSelected || undefined}
      onMouseEnter={() => setTableHoveredFeatureId(asset.id)}
      onMouseLeave={() => setTableHoveredFeatureId(null)}
      onMouseDown={(e) => {
        if (e.shiftKey) e.preventDefault()
      }}
      onClick={(e) => {
        pendingShiftRef.current = e.shiftKey
        deferClick()
      }}
      onDoubleClick={handleDoubleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          onOpenAsset?.(asset)
        } else if (e.key === ' ') {
          e.preventDefault()
          onToggleFeatureSelection?.(asset, index)
        }
      }}
    >
      <div className="bg-area-highlight size-[140px] shrink-0 overflow-hidden rounded-panel">
        {isGeometry ? (
          <div className="text-fg-muted flex size-full flex-col items-center justify-center gap-1 px-2 text-center font-sans text-badge">
            <span className="text-fg-highlight font-semibold">{getFeatureTypeLabel(asset)}</span>
            <span>Drawn feature</span>
          </div>
        ) : isVideo ? (
          <video
            src={asset.fileUrl}
            className="size-full object-cover"
            muted
            playsInline
            preload="metadata"
            aria-hidden
          />
        ) : (
          <img
            src={asset.fileUrl}
            alt=""
            className="size-full object-cover"
            decoding="async"
            draggable={false}
          />
        )}
      </div>
      <span
        className={
          'block truncate text-standard ' +
          (isHighlighted
            ? 'font-semibold text-fg-highlight'
            : 'text-fg group-hover:font-semibold group-hover:text-fg-highlight')
        }
      >
        {asset.title}
      </span>
      <span
        className={
          'block truncate text-badge ' +
          (isHighlighted ? 'text-fg-highlight' : 'text-fg-muted group-hover:text-fg-highlight')
        }
      >
        {location}
      </span>
    </button>
  )
}

export function FeatureLibraryThumbnailGrid({
  assets,
  projectType,
  selectedFeatureIds,
  onSelectFeature,
  onToggleFeatureSelection,
  onOpenAsset,
}: FeatureLibraryThumbnailGridProps) {
  return (
    <div className="min-h-0 w-full min-w-0 flex-1 overflow-auto px-panel-padding py-4">
      <div className="flex flex-wrap gap-4">
        {assets.map((asset, index) => (
          <FeatureLibraryThumbnailItem
            key={asset.id}
            asset={asset}
            index={index}
            projectType={projectType}
            isSelected={selectedFeatureIds.has(asset.id)}
            onSelectFeature={onSelectFeature}
            onToggleFeatureSelection={onToggleFeatureSelection}
            onOpenAsset={onOpenAsset}
          />
        ))}
      </div>
    </div>
  )
}
