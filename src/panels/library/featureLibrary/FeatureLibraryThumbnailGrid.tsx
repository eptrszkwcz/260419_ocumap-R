import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import { getFeatureTypeLabel, isDrawnFeature, type SpatialAsset } from '@/data/sampleAssets'
import type { ProjectType } from '@/data/sampleProjects'

import { assetLocationLabel } from '@/panels/library/featureLibrary/assetLocationLabel'

type FeatureLibraryThumbnailGridProps = {
  assets: SpatialAsset[]
  projectType: ProjectType
  onOpenAsset?: (asset: SpatialAsset) => void
}

export function FeatureLibraryThumbnailGrid({
  assets,
  projectType,
  onOpenAsset,
}: FeatureLibraryThumbnailGridProps) {
  const { linkedFeatureId, setTableHoveredFeatureId } = useFeatureMapHover()

  return (
    <div className="min-h-0 w-full min-w-0 flex-1 overflow-auto px-panel-padding py-4">
      <div className="flex flex-wrap gap-4">
        {assets.map((asset) => {
          const isLinked = linkedFeatureId === asset.id
          const location = assetLocationLabel(asset, projectType)
          const isVideo = asset.kind === 'video' && !isDrawnFeature(asset)
          const isGeometry = isDrawnFeature(asset)

          return (
            <button
              key={asset.id}
              type="button"
              className={
                'group flex w-[140px] shrink-0 flex-col gap-1.5 rounded-panel text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-highlight/35 ' +
                (isLinked ? 'bg-area-highlight' : 'hover:bg-area-highlight')
              }
              onMouseEnter={() => setTableHoveredFeatureId(asset.id)}
              onMouseLeave={() => setTableHoveredFeatureId(null)}
              onClick={() => onOpenAsset?.(asset)}
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
                  (isLinked
                    ? 'font-semibold text-fg-highlight'
                    : 'text-fg group-hover:font-semibold group-hover:text-fg-highlight')
                }
              >
                {asset.title}
              </span>
              <span
                className={
                  'block truncate text-badge ' +
                  (isLinked ? 'text-fg-highlight' : 'text-fg-muted group-hover:text-fg-highlight')
                }
              >
                {location}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
