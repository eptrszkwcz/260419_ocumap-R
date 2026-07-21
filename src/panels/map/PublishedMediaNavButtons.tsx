import { useCallback, useMemo } from 'react'

import { DropdownMenu } from '@/components/DropdownMenu'
import { HamburgerIcon } from '@/components/HamburgerIcon'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/overlayControlIcons'
import type { SpatialAsset } from '@/data/sampleAssets'
import { publishedMediaNavWidthClassName } from '@/panels/map/mapOverlayLayout'

const navButtonClassName =
  'text-fg-highlight hover:bg-area-highlight flex h-button w-full cursor-pointer items-center justify-center gap-1.5 rounded-panel border border-fg-highlight bg-panel px-3 font-sans text-standard leading-none shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40'

const hamburgerButtonClassName =
  navButtonClassName.replace(' w-full', '') +
  ' w-auto shrink-0 px-3 disabled:cursor-not-allowed disabled:opacity-40'

type PublishedMediaNavButtonsProps = {
  asset: SpatialAsset
  mediaAssets: SpatialAsset[]
  onAssetChange: (asset: SpatialAsset) => void
}

export function PublishedMediaNavButtons({
  asset,
  mediaAssets,
  onAssetChange,
}: PublishedMediaNavButtonsProps) {
  const canNavigate = mediaAssets.length > 1
  const canOpenFeatureList = mediaAssets.length > 0

  const featureMenuItems = useMemo(
    () =>
      mediaAssets.map((mediaAsset) => ({
        id: mediaAsset.id,
        label: mediaAsset.title,
        selected: mediaAsset.id === asset.id,
        onSelect: () => onAssetChange(mediaAsset),
      })),
    [asset.id, mediaAssets, onAssetChange],
  )

  const goPrev = useCallback(() => {
    if (mediaAssets.length === 0) return
    const i = mediaAssets.findIndex((a) => a.id === asset.id)
    const next = (i - 1 + mediaAssets.length) % mediaAssets.length
    onAssetChange(mediaAssets[next])
  }, [asset.id, mediaAssets, onAssetChange])

  const goNext = useCallback(() => {
    if (mediaAssets.length === 0) return
    const i = mediaAssets.findIndex((a) => a.id === asset.id)
    const next = (i + 1) % mediaAssets.length
    onAssetChange(mediaAssets[next])
  }, [asset.id, mediaAssets, onAssetChange])

  return (
    <div
      className={'grid grid-cols-[1fr_auto_1fr] gap-2 ' + publishedMediaNavWidthClassName}
      role="navigation"
      aria-label="Media feature navigation"
    >
      <button
        type="button"
        className={navButtonClassName}
        aria-label="Previous feature"
        disabled={!canNavigate}
        onClick={goPrev}
      >
        Previous
        <ChevronLeftIcon />
      </button>
      <DropdownMenu
        menuAriaLabel="Published project features"
        align="center"
        placement="bottom"
        panelWidth="280px"
        panelMaxHeight="360px"
        closeOnMouseLeave={false}
        items={featureMenuItems}
        renderTrigger={({ open, menuId, onToggle }) => (
          <button
            type="button"
            onClick={onToggle}
            className={hamburgerButtonClassName}
            aria-expanded={open}
            aria-haspopup="menu"
            aria-controls={menuId}
            aria-label="Browse project features"
            disabled={!canOpenFeatureList}
          >
            <HamburgerIcon />
          </button>
        )}
      />
      <button
        type="button"
        className={navButtonClassName}
        aria-label="Next feature"
        disabled={!canNavigate}
        onClick={goNext}
      >
        <ChevronRightIcon />
        Next
      </button>
    </div>
  )
}
