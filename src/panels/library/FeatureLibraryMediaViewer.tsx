import { useCallback } from 'react'

import { getAssetTypeLabel, type SpatialAsset } from '@/data/sampleAssets'

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M10 3L5 8l5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M6 3l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function RulerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M3 12.5h10M3 12.5V4.5M3 12.5l1.5-1M5.5 11l1-1M8 9.5l1-1M10.5 8l1-1"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M3 3h4.5v4.5H3V3Zm5.5 0H13v4.5H8.5V3ZM3 8.5h4.5V13H3V8.5Zm5.5 0H13V13H8.5V8.5Z"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M8 10.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5Z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M8 1v1.7M8 13.3V15M3.3 3.3l1.2 1.2M11.5 11.5l1.2 1.2M1 8h1.7M13.3 8H15M3.3 12.7l1.2-1.2M11.5 4.5l1.2-1.2"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M3.5 3.5h9a1 1 0 011 1v5a1 1 0 01-1 1H6.2L4 12.5V10.5h-.5a1 1 0 01-1-1v-5a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const overlayBtnClass =
  'text-fg-highlight flex size-8 min-h-8 min-w-8 shrink-0 items-center justify-center rounded-panel border border-fg-highlight bg-panel shadow-sm transition-colors hover:bg-area-highlight focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

const overlayBtnPrimaryClass =
  'text-panel flex size-8 min-h-8 min-w-8 shrink-0 items-center justify-center rounded-panel border border-fg-highlight bg-fg-highlight shadow-sm transition-colors hover:bg-fg-highlight/90 focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

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
          src={asset.fileUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        <div
          className="pointer-events-none absolute flex items-end justify-between"
          style={{
            left: 'var(--spacing-panel-padding)',
            right: 'var(--spacing-panel-padding)',
            bottom: 'var(--spacing-panel-padding)',
          }}
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
