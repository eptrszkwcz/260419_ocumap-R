import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { useActiveProject } from '@/context/ActiveProjectContext'
import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import { hasDisplayableMedia, getAssetTypeLabel, type SpatialAsset } from '@/data/sampleAssets'
import { useProjectMapAssets } from '@/hooks/useProjectMapAssets'
import { FeatureLibraryMediaViewer } from '@/panels/library/FeatureLibraryMediaViewer'
import { MapColumn } from '@/panels/map/MapColumn'
import { PublishedBottomLogo } from '@/panels/map/PublishedBottomLogo'
import { PublishedMapHeader } from '@/panels/map/PublishedMapHeader'
import { PublishedMediaFileNamePanel } from '@/panels/map/PublishedMediaFileNamePanel'
import { PublishedMediaNavButtons } from '@/panels/map/PublishedMediaNavButtons'
import { PublishedMiniPanel } from '@/panels/map/PublishedMiniPanel'
import {
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
  const { projectId, isNewProject } = useActiveProject()
  const { assets, mediaAssets } = useProjectMapAssets(projectId, isNewProject)
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

  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const mediaControlsRef = useRef<HTMLDivElement>(null)

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

  const measureMiniPanelBounds = useCallback(() => {
    const container = containerRef.current
    if (container == null) return

    const containerRect = container.getBoundingClientRect()
    const headerRect = headerRef.current?.getBoundingClientRect() ?? null
    const mediaControlsRect = mediaControlsRef.current?.getBoundingClientRect() ?? null
    const maxSize = computeMiniPanelMaxSize(containerRect, headerRect, mediaControlsRect)

    setMiniPanelMaxSize(maxSize)
    setMiniPanelSize((prev) => clampMiniPanelSize(prev, maxSize))
  }, [])

  useLayoutEffect(() => {
    measureMiniPanelBounds()

    const observed = [
      containerRef.current,
      headerRef.current,
      mediaControlsRef.current,
    ].filter((el): el is HTMLElement => el != null)

    if (observed.length === 0) return

    const ro = new ResizeObserver(measureMiniPanelBounds)
    for (const el of observed) ro.observe(el)
    return () => ro.disconnect()
  }, [measureMiniPanelBounds, mediaOpen])

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

      if (hasDisplayableMedia(asset)) {
        setOpenedAsset(asset)
        if (asset.kind === 'image' || asset.kind === 'panorama') {
          setViewDirectionBaseDeg(asset.viewDirectionDeg ?? 0)
          setViewDirectionLiveOffsetDeg(0)
        } else {
          setViewDirectionBaseDeg(null)
          setViewDirectionLiveOffsetDeg(0)
        }
      } else {
        setOpenedAsset(null)
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
    libraryAssets: mediaAssets,
    onAssetChange: changeOpenedAsset,
    hideOverlayClose: true as const,
    hideOverlayNavigation: true as const,
    mediaControlsRef,
  }

  return (
    <div className="box-border flex h-full min-h-0 flex-col bg-page p-page">
      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 overflow-hidden rounded-panel border border-stroke bg-panel"
      >
        <PublishedMapHeader ref={headerRef} />

        {!mediaOpen ? (
          <div className="absolute inset-0 z-0 flex min-h-0 min-w-0 flex-col">
            <MapColumn
              variant="published"
              layoutMode="full"
              layoutModeToken={layoutModeToken}
              hideHeader
            />
          </div>
        ) : null}

        {mediaOpen && openedAsset != null ? (
          <div className="absolute inset-0 z-0 flex min-h-0 min-w-0 flex-col">
            <FeatureLibraryMediaViewer {...mediaViewerProps} />
          </div>
        ) : null}

        {mediaOpen && openedAsset != null ? (
          <>
            <div
              className={
                'pointer-events-none absolute z-20 flex flex-col gap-2 ' +
                mapOverlayInsetTopClassName +
                ' ' +
                mapOverlayInsetRightClassName
              }
            >
              <div className="pointer-events-auto">
                <PublishedMediaFileNamePanel
                  title={openedAsset.title}
                  typeLabel={getAssetTypeLabel(openedAsset.kind)}
                  onClose={closeMedia}
                />
              </div>
              <div className="pointer-events-auto">
                <PublishedMediaNavButtons
                  asset={openedAsset}
                  mediaAssets={mediaAssets}
                  onAssetChange={changeOpenedAsset}
                />
              </div>
            </div>
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
          </>
        ) : null}

        <PublishedBottomLogo />
      </div>
    </div>
  )
}
