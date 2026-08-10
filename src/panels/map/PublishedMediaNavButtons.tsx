import { useCallback, useMemo } from 'react'

import { DropdownMenu } from '@/components/DropdownMenu'
import { HamburgerIcon } from '@/components/HamburgerIcon'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/overlayControlIcons'
import { getFeatureTypeLabel, type SpatialAsset } from '@/data/sampleAssets'
import {
  publishedMediaFeaturesMenuPanelWidth,
  publishedMediaNavWidthClassName,
  type PublishedChromeMode,
} from '@/panels/map/mapOverlayLayout'

const mediaBadgeClass =
  'text-fg-highlight inline-flex h-badge min-h-badge max-h-badge shrink-0 items-center justify-center rounded-panel bg-fg-highlight/12 px-2 text-badge font-bold leading-none'

const navButtonClassName =
  'text-fg-highlight hover:bg-area-highlight flex h-button w-full cursor-pointer items-center justify-center gap-1.5 rounded-panel border border-fg-highlight bg-panel px-3 font-sans text-standard leading-none shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40'

const hamburgerButtonClassName =
  navButtonClassName.replace(' w-full', '') +
  ' w-[160px] shrink-0 px-3 disabled:cursor-not-allowed disabled:opacity-40 gap-1.5'

const hamburgerButtonNarrowClassName =
  navButtonClassName.replace(' w-full', '') +
  ' w-auto shrink-0 px-3 disabled:cursor-not-allowed disabled:opacity-40 gap-1.5'

type PublishedMediaNavButtonsProps = {
  asset: SpatialAsset | null
  featureAssets: SpatialAsset[]
  featuresMenuMaxHeightPx: number
  featuresMenuWidthPx?: number
  chromeMode?: PublishedChromeMode
  /** When true, stretch to parent stack width (compact/narrow). */
  embedded?: boolean
  onAssetChange: (asset: SpatialAsset) => void
}

export function PublishedMediaNavButtons({
  asset,
  featureAssets,
  featuresMenuMaxHeightPx,
  featuresMenuWidthPx,
  chromeMode = 'desktop',
  embedded = false,
  onAssetChange,
}: PublishedMediaNavButtonsProps) {
  const canNavigate = featureAssets.length > 1
  const canOpenFeatureList = featureAssets.length > 0
  const isNarrow = chromeMode === 'narrow'
  const iconOnly = isNarrow

  const featureMenuItems = useMemo(
    () =>
      featureAssets.map((mediaAsset) => ({
        id: mediaAsset.id,
        label: mediaAsset.title,
        selected: asset != null && mediaAsset.id === asset.id,
        trailing: (
          <span className={mediaBadgeClass}>{getFeatureTypeLabel(mediaAsset)}</span>
        ),
        onSelect: () => onAssetChange(mediaAsset),
      })),
    [asset, featureAssets, onAssetChange],
  )

  const currentIndex =
    asset != null ? featureAssets.findIndex((a) => a.id === asset.id) : -1

  const goPrev = useCallback(() => {
    if (featureAssets.length === 0) return
    const next = (currentIndex - 1 + featureAssets.length) % featureAssets.length
    onAssetChange(featureAssets[next])
  }, [currentIndex, featureAssets, onAssetChange])

  const goNext = useCallback(() => {
    if (featureAssets.length === 0) return
    const next = (currentIndex + 1) % featureAssets.length
    onAssetChange(featureAssets[next])
  }, [currentIndex, featureAssets, onAssetChange])

  const widthClassName = embedded
    ? 'w-full max-w-none'
    : publishedMediaNavWidthClassName

  const panelWidth =
    featuresMenuWidthPx != null
      ? `${featuresMenuWidthPx}px`
      : publishedMediaFeaturesMenuPanelWidth

  return (
    <div
      className={'grid grid-cols-[1fr_auto_1fr] gap-2 ' + widthClassName}
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
        {iconOnly ? null : 'Previous'}
        <ChevronLeftIcon />
      </button>
      <DropdownMenu
        menuAriaLabel="Published project features"
        align="center"
        placement="bottom"
        panelWidth={panelWidth}
        panelMaxHeight={`${featuresMenuMaxHeightPx}px`}
        tableColumnHeaders={{ feature: 'Feature', type: 'Type' }}
        closeOnMouseLeave={false}
        items={featureMenuItems}
        renderTrigger={({ open, menuId, onToggle }) => (
          <button
            type="button"
            onClick={onToggle}
            className={isNarrow ? hamburgerButtonNarrowClassName : hamburgerButtonClassName}
            aria-expanded={open}
            aria-haspopup="menu"
            aria-controls={menuId}
            aria-label="Browse project features"
            disabled={!canOpenFeatureList}
          >
            <HamburgerIcon />
            {iconOnly ? null : 'Features'}
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
        {iconOnly ? null : 'Next'}
      </button>
    </div>
  )
}
