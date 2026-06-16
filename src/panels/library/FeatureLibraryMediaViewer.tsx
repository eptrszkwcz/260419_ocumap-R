import { useCallback } from 'react'

import { overlayBarInsetStyle, overlayBtnClass, overlayBtnPrimaryClass } from '@/components/overlayControlButtons'
import {
  ChatIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GearIcon,
  GridIcon,
  RulerIcon,
} from '@/components/overlayControlIcons'
import { getAssetTypeLabel, type SpatialAsset } from '@/data/sampleAssets'

type FeatureLibraryMediaViewerProps = {
  asset: SpatialAsset
  libraryAssets: SpatialAsset[]
  onAssetChange: (asset: SpatialAsset) => void
}

export function FeatureLibraryMediaViewer({
  asset,
  libraryAssets,
  onAssetChange,
}: FeatureLibraryMediaViewerProps) {
  const index = Math.max(
    0,
    libraryAssets.findIndex((a) => a.id === asset.id),
  )
  const canGoBack = libraryAssets.length > 1
  const canGoForward = libraryAssets.length > 1

  const goPrev = useCallback(() => {
    if (libraryAssets.length === 0) return
    const i = libraryAssets.findIndex((a) => a.id === asset.id)
    const next = (i - 1 + libraryAssets.length) % libraryAssets.length
    onAssetChange(libraryAssets[next])
  }, [asset.id, libraryAssets, onAssetChange])

  const goNext = useCallback(() => {
    if (libraryAssets.length === 0) return
    const i = libraryAssets.findIndex((a) => a.id === asset.id)
    const next = (i + 1) % libraryAssets.length
    onAssetChange(libraryAssets[next])
  }, [asset.id, libraryAssets, onAssetChange])

  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col"
      role="region"
      aria-label={`Media viewer: ${asset.title}`}
    >
      <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-panel bg-page">
        <img
          src={asset.fileUrl ?? ''}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        <div
          className="pointer-events-none absolute flex items-end justify-between"
          style={overlayBarInsetStyle}
        >
          <div className="pointer-events-auto flex gap-2">
            <button
              type="button"
              className={overlayBtnClass + (!canGoBack ? ' opacity-40' : '')}
              aria-label="Previous feature"
              disabled={!canGoBack}
              onClick={goPrev}
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              className={overlayBtnClass + (!canGoForward ? ' opacity-40' : '')}
              aria-label="Next feature"
              disabled={!canGoForward}
              onClick={goNext}
            >
              <ChevronRightIcon />
            </button>
          </div>

          <div className="pointer-events-auto flex gap-2">
            <button type="button" className={overlayBtnClass} aria-label="Measure">
              <RulerIcon />
            </button>
            <button type="button" className={overlayBtnClass} aria-label="Grid overlay">
              <GridIcon />
            </button>
            <button type="button" className={overlayBtnClass} aria-label="Viewer settings">
              <GearIcon />
            </button>
            <button type="button" className={overlayBtnPrimaryClass} aria-label="Comments">
              <ChatIcon />
            </button>
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {index + 1} of {libraryAssets.length}: {asset.title}, {getAssetTypeLabel(asset.kind)},{' '}
        {asset.dateUploaded}.
      </p>
    </div>
  )
}
