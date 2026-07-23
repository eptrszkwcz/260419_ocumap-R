import { useCallback, type Ref } from 'react'

import { DelayedTooltip } from '@/components/DelayedTooltip'
import { overlayBarInsetStyle, overlayBtnClass, overlayBtnPrimaryClass } from '@/components/overlayControlButtons'
import {
  ChatIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  GearIcon,
  GridIcon,
  RulerIcon,
} from '@/components/overlayControlIcons'
import {
  GEOMETRY_ONLY_FEATURE_MESSAGE,
  getAssetTypeLabel,
  isGeometryOnlyFeature,
  type SpatialAsset,
} from '@/data/sampleAssets'
import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import { Panorama360Viewer } from '@/panels/library/Panorama360Viewer'

type FeatureLibraryMediaViewerProps = {
  asset: SpatialAsset
  libraryAssets: SpatialAsset[]
  onAssetChange: (asset: SpatialAsset) => void
  onClose?: () => void
  /** Hide the bottom-left close button (e.g. when published view uses a top header close). */
  hideOverlayClose?: boolean
  /** Hide chevron prev/next controls (e.g. when published view uses labeled nav buttons). */
  hideOverlayNavigation?: boolean
  /** Ref for the bottom-right media viewer control group (published layout measurement). */
  mediaControlsRef?: Ref<HTMLDivElement>
}

function isVideoAsset(asset: SpatialAsset): boolean {
  return asset.kind === 'video' || asset.mimeType?.startsWith('video/') === true
}

export function FeatureLibraryMediaViewer({
  asset,
  libraryAssets,
  onAssetChange,
  onClose,
  hideOverlayClose = false,
  hideOverlayNavigation = false,
  mediaControlsRef,
}: FeatureLibraryMediaViewerProps) {
  const { setViewDirectionLiveOffsetDeg } = useFeatureMapHover()
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

  const geometryOnly = isGeometryOnlyFeature(asset)

  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col"
      role="region"
      aria-label={`Media viewer: ${asset.title}`}
    >
      <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-panel bg-page">
        {geometryOnly ? (
          <p className="text-fg-muted absolute inset-0 flex items-center justify-center px-6 text-center font-sans text-standard">
            {GEOMETRY_ONLY_FEATURE_MESSAGE}
          </p>
        ) : asset.kind === 'panorama' ? (
          <Panorama360Viewer
            key={asset.id}
            panoramaUrl={asset.fileUrl ?? ''}
            onYawChange={setViewDirectionLiveOffsetDeg}
          />
        ) : isVideoAsset(asset) ? (
          <video
            key={asset.id}
            src={asset.fileUrl ?? ''}
            className="absolute inset-0 h-full w-full object-cover"
            controls
            playsInline
          />
        ) : (
          <img
            src={asset.fileUrl ?? ''}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        )}

        <div
          className="pointer-events-none absolute flex items-end justify-between"
          style={overlayBarInsetStyle}
        >
          <div className="pointer-events-auto flex gap-2">
            {onClose != null && !hideOverlayClose ? (
              <DelayedTooltip label="Close media">
                <button
                  type="button"
                  className={overlayBtnClass}
                  aria-label="Close media"
                  onClick={onClose}
                >
                  <CloseIcon />
                </button>
              </DelayedTooltip>
            ) : null}
            {!hideOverlayNavigation ? (
              <>
                <DelayedTooltip label="Previous feature">
                  <button
                    type="button"
                    className={overlayBtnClass + (!canGoBack ? ' opacity-40' : '')}
                    aria-label="Previous feature"
                    disabled={!canGoBack}
                    onClick={goPrev}
                  >
                    <ChevronLeftIcon />
                  </button>
                </DelayedTooltip>
                <DelayedTooltip label="Next feature">
                  <button
                    type="button"
                    className={overlayBtnClass + (!canGoForward ? ' opacity-40' : '')}
                    aria-label="Next feature"
                    disabled={!canGoForward}
                    onClick={goNext}
                  >
                    <ChevronRightIcon />
                  </button>
                </DelayedTooltip>
              </>
            ) : null}
          </div>

          <div ref={mediaControlsRef} className="pointer-events-auto flex gap-2">
            {!geometryOnly ? (
              <>
                <DelayedTooltip label="Measure on photo">
                  <button type="button" className={overlayBtnClass} aria-label="Measure">
                    <RulerIcon />
                  </button>
                </DelayedTooltip>
                <DelayedTooltip label="Show grid overlay">
                  <button type="button" className={overlayBtnClass} aria-label="Grid overlay">
                    <GridIcon />
                  </button>
                </DelayedTooltip>
                <DelayedTooltip label="Viewer settings">
                  <button type="button" className={overlayBtnClass} aria-label="Viewer settings">
                    <GearIcon />
                  </button>
                </DelayedTooltip>
                <DelayedTooltip label="View comments">
                  <button type="button" className={overlayBtnPrimaryClass} aria-label="Comments">
                    <ChatIcon />
                  </button>
                </DelayedTooltip>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {index + 1} of {libraryAssets.length}: {asset.title},{' '}
        {geometryOnly ? 'geometry only' : getAssetTypeLabel(asset.kind)},{' '}
        {asset.dateUploaded}.
      </p>
    </div>
  )
}
