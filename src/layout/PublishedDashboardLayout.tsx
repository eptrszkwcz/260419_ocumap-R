import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { useActiveProject } from '@/context/ActiveProjectContext'
import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import {
  getAssetTypeLabel,
  getFeatureTypeLabel,
  hasDisplayableMedia,
  isGeometryOnlyFeature,
  type SpatialAsset,
} from '@/data/sampleAssets'
import { useProjectMapAssets } from '@/hooks/useProjectMapAssets'
import { FeatureLibraryMediaViewer } from '@/panels/library/FeatureLibraryMediaViewer'
import { sortFeatureLibraryAssets } from '@/panels/library/featureLibrary/sortFeatureLibraryAssets'
import { MapColumn } from '@/panels/map/MapColumn'
import { PublishedBottomLogo } from '@/panels/map/PublishedBottomLogo'
import { PublishedMapHeader } from '@/panels/map/PublishedMapHeader'
import { PublishedMediaFileNamePanel } from '@/panels/map/PublishedMediaFileNamePanel'
import { PublishedMediaNavButtons } from '@/panels/map/PublishedMediaNavButtons'
import { PublishedMiniPanel } from '@/panels/map/PublishedMiniPanel'
import {
  computePublishedFeaturesMenuMaxHeightPx,
  computePublishedFeaturesMenuWidthPx,
  MAP_OVERLAY_INSET_Y_PX,
  mapOverlayInsetBottomClassName,
  mapOverlayInsetLeftClassName,
  mapOverlayInsetRightClassName,
  mapOverlayInsetTopClassName,
  PUBLISHED_MINI_PANEL_RESIZE_BUFFER_PX,
  PUBLISHED_NARROW_PANEL_PADDING_PX,
  PUBLISHED_PANEL_PADDING_PX,
  publishedMiniPanelDefaults,
  publishedMiniPanelMins,
  resolvePublishedChromeArrangement,
  resolvePublishedChromeMode,
  type PublishedChromeArrangement,
  type PublishedChromeMode,
} from '@/panels/map/mapOverlayLayout'

type MiniPanelSize = { width: number; height: number }

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}

function sameMiniPanelSize(a: MiniPanelSize, b: MiniPanelSize): boolean {
  return a.width === b.width && a.height === b.height
}

function clampMiniPanelSize(
  size: MiniPanelSize,
  max: MiniPanelSize,
  minWidth: number,
  minHeight: number,
): MiniPanelSize {
  const maxWidth = Math.max(minWidth, max.width)
  const maxHeight = Math.max(minHeight, max.height)
  return {
    width: clamp(minWidth, size.width, maxWidth),
    height: clamp(minHeight, size.height, maxHeight),
  }
}

function computeMiniPanelMaxSize(
  containerRect: DOMRect,
  topChromeBottomY: number | null,
  mediaControlsRect: DOMRect | null,
  panelPaddingPx: number,
): MiniPanelSize {
  const panelLeftX = panelPaddingPx
  const panelBottomY = containerRect.height - MAP_OVERLAY_INSET_Y_PX

  let maxHeight = panelBottomY - PUBLISHED_MINI_PANEL_RESIZE_BUFFER_PX
  if (topChromeBottomY != null) {
    maxHeight = panelBottomY - topChromeBottomY - PUBLISHED_MINI_PANEL_RESIZE_BUFFER_PX
  }

  let maxWidth = containerRect.width - panelLeftX - PUBLISHED_MINI_PANEL_RESIZE_BUFFER_PX
  if (mediaControlsRect != null) {
    const controlsLeftX = mediaControlsRect.left - containerRect.left
    maxWidth = controlsLeftX - panelLeftX - PUBLISHED_MINI_PANEL_RESIZE_BUFFER_PX
  }

  // Floor so ResizeObserver float noise does not thrash setState.
  return {
    width: Math.max(0, Math.floor(maxWidth)),
    height: Math.max(0, Math.floor(maxHeight)),
  }
}

export function PublishedDashboardLayout() {
  const { project, projectId, isNewProject } = useActiveProject()
  const { assets } = useProjectMapAssets(projectId, isNewProject)
  const {
    setMapFeatureClickHandler,
    setOpenedFeatureId,
    setViewDirectionBaseDeg,
    setViewDirectionLiveOffsetDeg,
  } = useFeatureMapHover()
  const [openedAsset, setOpenedAsset] = useState<SpatialAsset | null>(null)
  const [layoutModeToken, setLayoutModeToken] = useState(0)
  const [chromeMode, setChromeMode] = useState<PublishedChromeMode>('desktop')
  const [chromeArrangement, setChromeArrangement] =
    useState<PublishedChromeArrangement>('corners')
  const [featuresMenuWidthPx, setFeaturesMenuWidthPx] = useState(400)
  const desktopDefaults = publishedMiniPanelDefaults('desktop')
  const [miniPanelSize, setMiniPanelSize] = useState<MiniPanelSize>(desktopDefaults)
  const [miniPanelMaxSize, setMiniPanelMaxSize] = useState<MiniPanelSize>(desktopDefaults)
  const [featuresMenuMaxHeightPx, setFeaturesMenuMaxHeightPx] = useState(360)

  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const mediaControlsRef = useRef<HTMLDivElement>(null)
  const publishedNavRef = useRef<HTMLDivElement>(null)
  const splitControlsRef = useRef<HTMLDivElement>(null)
  const topChromeStackRef = useRef<HTMLDivElement>(null)
  const mapViewerPanelRef = useRef<HTMLDivElement>(null)
  const prevChromeModeRef = useRef<PublishedChromeMode>('desktop')

  const publishedFeatureAssets = useMemo(
    () => sortFeatureLibraryAssets(assets, 'feature', 'asc', project.projectType),
    [assets, project.projectType],
  )

  const mediaOpen = openedAsset != null
  const isEmbeddedChrome = chromeArrangement === 'stack' || chromeArrangement === 'split'
  const miniMins = publishedMiniPanelMins(chromeMode)

  const closeMedia = useCallback(() => {
    setOpenedAsset(null)
    setOpenedFeatureId(null)
  }, [setOpenedFeatureId])

  const changeOpenedAsset = useCallback(
    (asset: SpatialAsset) => {
      setOpenedAsset(asset)
      setOpenedFeatureId(asset.id)
    },
    [setOpenedFeatureId],
  )

  const measurePublishedLayout = useCallback(() => {
    const container = containerRef.current
    if (container == null) return

    const containerRect = container.getBoundingClientRect()
    // Breakpoints from the viewport — not the padded container — so mode-driven
    // page padding cannot flip the breakpoint and loop.
    const nextChromeMode = resolvePublishedChromeMode(window.innerWidth)
    const nextArrangement = resolvePublishedChromeArrangement(
      nextChromeMode,
      window.innerHeight,
    )
    const padding =
      nextChromeMode === 'narrow' ? PUBLISHED_NARROW_PANEL_PADDING_PX : PUBLISHED_PANEL_PADDING_PX

    const headerRect = headerRef.current?.getBoundingClientRect() ?? null
    const mediaControlsRect = mediaControlsRef.current?.getBoundingClientRect() ?? null
    const navRowRect = publishedNavRef.current?.getBoundingClientRect() ?? null
    const mapViewerRect = mapViewerPanelRef.current?.getBoundingClientRect() ?? null
    const stackRect = topChromeStackRef.current?.getBoundingClientRect() ?? null
    const splitControlsRect = splitControlsRef.current?.getBoundingClientRect() ?? null

    const nextFeaturesMenuWidthPx = computePublishedFeaturesMenuWidthPx(
      containerRect.width,
      padding,
      nextChromeMode,
      nextArrangement,
      splitControlsRect?.width ?? navRowRect?.width ?? null,
    )

    const topChromeBottomY =
      nextArrangement === 'corners'
        ? headerRect != null
          ? headerRect.bottom - containerRect.top
          : null
        : stackRect != null
          ? stackRect.bottom - containerRect.top
          : headerRect != null
            ? headerRect.bottom - containerRect.top
            : null

    const mins = publishedMiniPanelMins(nextChromeMode)
    const maxSize = computeMiniPanelMaxSize(
      containerRect,
      topChromeBottomY,
      mediaControlsRect,
      padding,
    )

    const chromeModeChanged = prevChromeModeRef.current !== nextChromeMode
    if (chromeModeChanged) {
      prevChromeModeRef.current = nextChromeMode
    }

    setChromeMode((prev) => (prev === nextChromeMode ? prev : nextChromeMode))
    setChromeArrangement((prev) => (prev === nextArrangement ? prev : nextArrangement))
    setFeaturesMenuWidthPx((prev) =>
      prev === nextFeaturesMenuWidthPx ? prev : nextFeaturesMenuWidthPx,
    )
    setMiniPanelMaxSize((prev) => (sameMiniPanelSize(prev, maxSize) ? prev : maxSize))

    if (chromeModeChanged) {
      const nextSize = clampMiniPanelSize(
        publishedMiniPanelDefaults(nextChromeMode),
        maxSize,
        mins.minWidth,
        mins.minHeight,
      )
      setMiniPanelSize((prev) => (sameMiniPanelSize(prev, nextSize) ? prev : nextSize))
    } else {
      setMiniPanelSize((prev) => {
        const next = clampMiniPanelSize(prev, maxSize, mins.minWidth, mins.minHeight)
        return sameMiniPanelSize(prev, next) ? prev : next
      })
    }

    if (navRowRect != null && mapViewerRect != null) {
      const navRowBottomY = navRowRect.bottom - containerRect.top
      const mapViewerBottomY = mapViewerRect.bottom - containerRect.top
      const nextMenuMaxHeight = computePublishedFeaturesMenuMaxHeightPx(
        navRowBottomY,
        mapViewerBottomY,
      )
      setFeaturesMenuMaxHeightPx((prev) =>
        prev === nextMenuMaxHeight ? prev : nextMenuMaxHeight,
      )
    }
  }, [])

  // Observe only the map container (+ window). Do not observe chrome nodes whose
  // size depends on measured state (that feedback loop exhausts React updates).
  useLayoutEffect(() => {
    const container = containerRef.current
    if (container == null) return

    measurePublishedLayout()
    const ro = new ResizeObserver(measurePublishedLayout)
    ro.observe(container)
    window.addEventListener('resize', measurePublishedLayout)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measurePublishedLayout)
    }
  }, [measurePublishedLayout])

  // Re-measure once after chrome DOM arrangement changes (split vs stack vs corners).
  useLayoutEffect(() => {
    measurePublishedLayout()
  }, [measurePublishedLayout, chromeArrangement, mediaOpen])

  useEffect(() => {
    setLayoutModeToken((token) => token + 1)
  }, [mediaOpen])

  const handleMiniPanelResizeEnd = useCallback(() => {
    setLayoutModeToken((token) => token + 1)
  }, [])

  useEffect(() => {
    setMapFeatureClickHandler((id) => {
      const asset = assets.find((a) => a.id === id)
      if (asset == null) return

      setOpenedFeatureId(id)

      setOpenedAsset(asset)

      if (hasDisplayableMedia(asset)) {
        if (asset.kind === 'image' || asset.kind === 'panorama') {
          setViewDirectionBaseDeg(asset.viewDirectionDeg ?? 0)
          setViewDirectionLiveOffsetDeg(0)
        } else {
          setViewDirectionBaseDeg(null)
          setViewDirectionLiveOffsetDeg(0)
        }
      } else {
        setViewDirectionBaseDeg(null)
        setViewDirectionLiveOffsetDeg(0)
      }
    })
    return () => setMapFeatureClickHandler(null)
  }, [
    assets,
    setMapFeatureClickHandler,
    setOpenedFeatureId,
    setViewDirectionBaseDeg,
    setViewDirectionLiveOffsetDeg,
  ])

  useEffect(() => {
    if (openedAsset == null) return
    if (!hasDisplayableMedia(openedAsset)) {
      setViewDirectionBaseDeg(null)
      setViewDirectionLiveOffsetDeg(0)
      return
    }
    if (openedAsset.kind === 'image' || openedAsset.kind === 'panorama') {
      setViewDirectionBaseDeg(openedAsset.viewDirectionDeg ?? 0)
      setViewDirectionLiveOffsetDeg(0)
    } else {
      setViewDirectionBaseDeg(null)
      setViewDirectionLiveOffsetDeg(0)
    }
  }, [openedAsset, setViewDirectionBaseDeg, setViewDirectionLiveOffsetDeg])

  useEffect(() => {
    if (!mediaOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeMedia()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mediaOpen, closeMedia])

  const mediaViewerProps = {
    asset: openedAsset!,
    libraryAssets: publishedFeatureAssets,
    onAssetChange: changeOpenedAsset,
    hideOverlayClose: true as const,
    hideOverlayNavigation: true as const,
    hideAddMarker: true as const,
    mediaControlsRef,
  }

  const openedTypeLabel =
    openedAsset != null && isGeometryOnlyFeature(openedAsset)
      ? getFeatureTypeLabel(openedAsset)
      : openedAsset != null
        ? getAssetTypeLabel(openedAsset.kind)
        : ''

  // Viewport-based padding so it cannot feed back into container-width breakpoints.
  const pagePaddingClassName = 'p-2 min-[480px]:p-3 min-[960px]:p-page'

  const stackInsetClassName =
    chromeMode === 'narrow'
      ? 'left-2 right-2'
      : mapOverlayInsetLeftClassName + ' ' + mapOverlayInsetRightClassName

  const miniPanelLeftClassName =
    chromeMode === 'narrow' ? 'left-2' : mapOverlayInsetLeftClassName

  const navButtons = (
    <PublishedMediaNavButtons
      asset={openedAsset}
      featureAssets={publishedFeatureAssets}
      featuresMenuMaxHeightPx={featuresMenuMaxHeightPx}
      featuresMenuWidthPx={featuresMenuWidthPx}
      chromeMode={chromeArrangement === 'split' ? 'narrow' : chromeMode}
      embedded={isEmbeddedChrome}
      onAssetChange={changeOpenedAsset}
    />
  )

  const fileNamePanel =
    mediaOpen && openedAsset != null ? (
      <PublishedMediaFileNamePanel
        title={openedAsset.title}
        typeLabel={openedTypeLabel}
        showDownload={hasDisplayableMedia(openedAsset)}
        onClose={closeMedia}
        embedded={isEmbeddedChrome}
        compact={chromeArrangement === 'split' || chromeMode === 'narrow'}
      />
    ) : null

  const headerCompact =
    chromeMode === 'narrow' || chromeArrangement === 'split'

  return (
    <div className={'box-border flex h-full min-h-0 flex-col bg-page ' + pagePaddingClassName}>
      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 overflow-hidden rounded-panel border border-stroke bg-panel"
      >
        {chromeArrangement === 'stack' ? (
          <div
            ref={topChromeStackRef}
            className={
              'pointer-events-none absolute z-20 flex flex-col gap-2 ' +
              mapOverlayInsetTopClassName +
              ' ' +
              stackInsetClassName
            }
          >
            <PublishedMapHeader
              ref={headerRef}
              chromeMode={chromeMode}
              embedded
              compact={headerCompact}
            />
            {fileNamePanel != null ? (
              <div className="pointer-events-auto w-full min-w-0">{fileNamePanel}</div>
            ) : null}
            <div className="pointer-events-auto w-full min-w-0" ref={publishedNavRef}>
              {navButtons}
            </div>
          </div>
        ) : chromeArrangement === 'split' ? (
          <div
            ref={topChromeStackRef}
            className={
              'pointer-events-none absolute z-20 flex min-w-0 items-start gap-2 ' +
              mapOverlayInsetTopClassName +
              ' ' +
              stackInsetClassName
            }
          >
            <div className="min-w-0 flex-1">
              <PublishedMapHeader
                ref={headerRef}
                chromeMode={chromeMode}
                embedded
                compact={headerCompact}
              />
            </div>
            <div
              ref={splitControlsRef}
              className="pointer-events-auto flex min-w-0 flex-1 flex-col gap-2"
            >
              {fileNamePanel != null ? (
                <div className="min-w-0 w-full">{fileNamePanel}</div>
              ) : null}
              <div className="min-w-0 w-full" ref={publishedNavRef}>
                {navButtons}
              </div>
            </div>
          </div>
        ) : (
          <>
            <PublishedMapHeader ref={headerRef} chromeMode={chromeMode} />
            <div
              className={
                'pointer-events-none absolute z-20 flex min-w-0 flex-col gap-2 ' +
                mapOverlayInsetTopClassName +
                ' ' +
                mapOverlayInsetRightClassName
              }
            >
              {fileNamePanel != null ? (
                <div className="pointer-events-auto min-w-0">{fileNamePanel}</div>
              ) : null}
              <div className="pointer-events-auto min-w-0" ref={publishedNavRef}>
                {navButtons}
              </div>
            </div>
          </>
        )}

        <div
          ref={mapViewerPanelRef}
          className="absolute inset-0 z-0 flex min-h-0 min-w-0 flex-col"
        >
          {!mediaOpen ? (
            <MapColumn
              variant="published"
              layoutMode="full"
              layoutModeToken={layoutModeToken}
              hideHeader
            />
          ) : null}

          {mediaOpen && openedAsset != null ? (
            <FeatureLibraryMediaViewer {...mediaViewerProps} />
          ) : null}
        </div>

        {mediaOpen && openedAsset != null ? (
          <div className={`absolute z-10 ${miniPanelLeftClassName} ${mapOverlayInsetBottomClassName}`}>
            <PublishedMiniPanel
              width={miniPanelSize.width}
              height={miniPanelSize.height}
              maxWidth={miniPanelMaxSize.width}
              maxHeight={miniPanelMaxSize.height}
              minWidth={miniMins.minWidth}
              minHeight={miniMins.minHeight}
              onResize={setMiniPanelSize}
              onResizeEnd={handleMiniPanelResizeEnd}
            >
              <MapColumn
                variant="published"
                layoutMode="mini"
                layoutModeToken={layoutModeToken}
                hideHeader
              />
            </PublishedMiniPanel>
          </div>
        ) : null}

        <PublishedBottomLogo chromeMode={chromeMode} />
      </div>
    </div>
  )
}
