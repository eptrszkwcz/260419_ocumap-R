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
  MAP_OVERLAY_INSET_Y_PX,
  mapOverlayInsetBottomClassName,
  mapOverlayInsetRightClassName,
  mapOverlayInsetTopClassName,
  PUBLISHED_MINI_PANEL_DEFAULT_HEIGHT,
  PUBLISHED_MINI_PANEL_DEFAULT_WIDTH,
  PUBLISHED_MINI_PANEL_MIN_HEIGHT,
  PUBLISHED_MINI_PANEL_MIN_WIDTH,
  PUBLISHED_MINI_PANEL_RESIZE_BUFFER_PX,
  PUBLISHED_PANEL_PADDING_PX,
} from '@/panels/map/mapOverlayLayout'

type MiniPanelSize = { width: number; height: number }

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}

function clampMiniPanelSize(size: MiniPanelSize, max: MiniPanelSize): MiniPanelSize {
  const maxWidth = Math.max(PUBLISHED_MINI_PANEL_MIN_WIDTH, max.width)
  const maxHeight = Math.max(PUBLISHED_MINI_PANEL_MIN_HEIGHT, max.height)
  return {
    width: clamp(PUBLISHED_MINI_PANEL_MIN_WIDTH, size.width, maxWidth),
    height: clamp(PUBLISHED_MINI_PANEL_MIN_HEIGHT, size.height, maxHeight),
  }
}

function computeMiniPanelMaxSize(
  containerRect: DOMRect,
  headerRect: DOMRect | null,
  mediaControlsRect: DOMRect | null,
): MiniPanelSize {
  const panelLeftX = PUBLISHED_PANEL_PADDING_PX
  const panelBottomY = containerRect.height - MAP_OVERLAY_INSET_Y_PX

  let maxHeight = panelBottomY - PUBLISHED_MINI_PANEL_RESIZE_BUFFER_PX
  if (headerRect != null) {
    const headerBottomY = headerRect.bottom - containerRect.top
    maxHeight = panelBottomY - headerBottomY - PUBLISHED_MINI_PANEL_RESIZE_BUFFER_PX
  }

  let maxWidth = containerRect.width - panelLeftX - PUBLISHED_MINI_PANEL_RESIZE_BUFFER_PX
  if (mediaControlsRect != null) {
    const controlsLeftX = mediaControlsRect.left - containerRect.left
    maxWidth = controlsLeftX - panelLeftX - PUBLISHED_MINI_PANEL_RESIZE_BUFFER_PX
  }

  return {
    width: maxWidth,
    height: maxHeight,
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
  const [miniPanelSize, setMiniPanelSize] = useState<MiniPanelSize>({
    width: PUBLISHED_MINI_PANEL_DEFAULT_WIDTH,
    height: PUBLISHED_MINI_PANEL_DEFAULT_HEIGHT,
  })
  const [miniPanelMaxSize, setMiniPanelMaxSize] = useState<MiniPanelSize>({
    width: PUBLISHED_MINI_PANEL_DEFAULT_WIDTH,
    height: PUBLISHED_MINI_PANEL_DEFAULT_HEIGHT,
  })
  const [featuresMenuMaxHeightPx, setFeaturesMenuMaxHeightPx] = useState(360)

  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const mediaControlsRef = useRef<HTMLDivElement>(null)
  const publishedNavRef = useRef<HTMLDivElement>(null)
  const mapViewerPanelRef = useRef<HTMLDivElement>(null)

  const publishedFeatureAssets = useMemo(
    () => sortFeatureLibraryAssets(assets, 'feature', 'asc', project.projectType),
    [assets, project.projectType],
  )

  const mediaOpen = openedAsset != null

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
    const headerRect = headerRef.current?.getBoundingClientRect() ?? null
    const mediaControlsRect = mediaControlsRef.current?.getBoundingClientRect() ?? null
    const navRowRect = publishedNavRef.current?.getBoundingClientRect() ?? null
    const mapViewerRect = mapViewerPanelRef.current?.getBoundingClientRect() ?? null

    const maxSize = computeMiniPanelMaxSize(containerRect, headerRect, mediaControlsRect)
    setMiniPanelMaxSize(maxSize)
    setMiniPanelSize((prev) => clampMiniPanelSize(prev, maxSize))

    if (navRowRect != null && mapViewerRect != null) {
      const navRowBottomY = navRowRect.bottom - containerRect.top
      const mapViewerBottomY = mapViewerRect.bottom - containerRect.top
      setFeaturesMenuMaxHeightPx(
        computePublishedFeaturesMenuMaxHeightPx(navRowBottomY, mapViewerBottomY),
      )
    }
  }, [])

  useLayoutEffect(() => {
    measurePublishedLayout()

    const observed = [
      containerRef.current,
      headerRef.current,
      mediaControlsRef.current,
      publishedNavRef.current,
      mapViewerPanelRef.current,
    ].filter((el): el is HTMLElement => el != null)

    if (observed.length === 0) return

    const ro = new ResizeObserver(measurePublishedLayout)
    for (const el of observed) ro.observe(el)
    window.addEventListener('resize', measurePublishedLayout)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measurePublishedLayout)
    }
  }, [measurePublishedLayout, mediaOpen])

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
    mediaControlsRef,
  }

  const openedTypeLabel =
    openedAsset != null && isGeometryOnlyFeature(openedAsset)
      ? getFeatureTypeLabel(openedAsset)
      : openedAsset != null
        ? getAssetTypeLabel(openedAsset.kind)
        : ''

  return (
    <div className="box-border flex h-full min-h-0 flex-col bg-page p-page">
      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 overflow-hidden rounded-panel border border-stroke bg-panel"
      >
        <PublishedMapHeader ref={headerRef} />

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

        <div
          className={
            'pointer-events-none absolute z-20 flex flex-col gap-2 ' +
            mapOverlayInsetTopClassName +
            ' ' +
            mapOverlayInsetRightClassName
          }
        >
          {mediaOpen && openedAsset != null ? (
            <div className="pointer-events-auto">
              <PublishedMediaFileNamePanel
                title={openedAsset.title}
                typeLabel={openedTypeLabel}
                showDownload={hasDisplayableMedia(openedAsset)}
                onClose={closeMedia}
              />
            </div>
          ) : null}
          <div className="pointer-events-auto" ref={publishedNavRef}>
            <PublishedMediaNavButtons
              asset={openedAsset}
              featureAssets={publishedFeatureAssets}
              featuresMenuMaxHeightPx={featuresMenuMaxHeightPx}
              onAssetChange={changeOpenedAsset}
            />
          </div>
        </div>

        {mediaOpen && openedAsset != null ? (
          <div className={`absolute left-panel-padding z-10 ${mapOverlayInsetBottomClassName}`}>
            <PublishedMiniPanel
              width={miniPanelSize.width}
              height={miniPanelSize.height}
              maxWidth={miniPanelMaxSize.width}
              maxHeight={miniPanelMaxSize.height}
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

        <PublishedBottomLogo />
      </div>
    </div>
  )
}
