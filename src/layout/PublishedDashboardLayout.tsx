import { useCallback, useEffect, useState } from 'react'

import { useActiveProject } from '@/context/ActiveProjectContext'
import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import { hasDisplayableMedia, getAssetTypeLabel, type SpatialAsset } from '@/data/sampleAssets'
import { useProjectMapAssets } from '@/hooks/useProjectMapAssets'
import { FeatureLibraryMediaViewer } from '@/panels/library/FeatureLibraryMediaViewer'
import { MapColumn } from '@/panels/map/MapColumn'
import { PublishedBottomLogo } from '@/panels/map/PublishedBottomLogo'
import { PublishedMapHeader } from '@/panels/map/PublishedMapHeader'
import { PublishedMediaHeader } from '@/panels/map/PublishedMediaHeader'
import { PublishedMediaNavButtons } from '@/panels/map/PublishedMediaNavButtons'
import { PublishedMiniMediaHeader } from '@/panels/map/PublishedMiniMediaHeader'
import { PublishedMiniPanel } from '@/panels/map/PublishedMiniPanel'
import { mapOverlayInsetBottomClassName } from '@/panels/map/mapOverlayLayout'

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
  const [viewSwapped, setViewSwapped] = useState(false)
  const [layoutModeToken, setLayoutModeToken] = useState(0)

  const mediaOpen = openedAsset != null
  const mapIsPrimary = !mediaOpen || viewSwapped
  const mediaIsPrimary = mediaOpen && !viewSwapped

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

  const toggleViewSwap = useCallback(() => {
    setViewSwapped((swapped) => !swapped)
  }, [])

  useEffect(() => {
    if (!mediaOpen) {
      setViewSwapped(false)
    }
  }, [mediaOpen])

  useEffect(() => {
    setLayoutModeToken((token) => token + 1)
  }, [mediaOpen, viewSwapped])

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
  }

  return (
    <div className="box-border flex h-full min-h-0 flex-col bg-page p-page">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-panel border border-stroke bg-panel">
        <PublishedMapHeader />

        {mapIsPrimary ? (
          <div className="absolute inset-0 z-0 flex min-h-0 min-w-0 flex-col">
            <MapColumn
              variant="published"
              layoutMode="full"
              layoutModeToken={layoutModeToken}
              hideHeader
            />
          </div>
        ) : null}

        {mediaIsPrimary && openedAsset != null ? (
          <>
            <PublishedMediaHeader
              title={openedAsset.title}
              typeLabel={getAssetTypeLabel(openedAsset.kind)}
              onClose={closeMedia}
            />
            <div className="absolute inset-0 z-0 flex min-h-0 min-w-0 flex-col">
              <FeatureLibraryMediaViewer {...mediaViewerProps} />
            </div>
          </>
        ) : null}

        {mediaOpen && openedAsset != null ? (
          <div
            className={`absolute left-panel-padding z-10 flex flex-col gap-6 ${mapOverlayInsetBottomClassName}`}
          >
            <PublishedMediaNavButtons
              asset={openedAsset}
              mediaAssets={mediaAssets}
              onAssetChange={changeOpenedAsset}
            />
            <PublishedMiniPanel onSwap={toggleViewSwap}>
              {viewSwapped ? (
                <>
                  <PublishedMiniMediaHeader
                    title={openedAsset.title}
                    typeLabel={getAssetTypeLabel(openedAsset.kind)}
                    onClose={closeMedia}
                  />
                  <FeatureLibraryMediaViewer {...mediaViewerProps} />
                </>
              ) : (
                <MapColumn
                  variant="published"
                  layoutMode="mini"
                  layoutModeToken={layoutModeToken}
                  hideHeader
                />
              )}
            </PublishedMiniPanel>
          </div>
        ) : null}

        <PublishedBottomLogo />
      </div>
    </div>
  )
}
