import { useCallback, useEffect, type Ref } from 'react'

import { DelayedTooltip } from '@/components/DelayedTooltip'
import {
  overlayBarInsetStyle,
  overlayBtnClass,
  overlayBtnAddMarkerClass,
} from '@/components/overlayControlButtons'
import {
  AddMarkerIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  GearIcon,
  GridIcon,
  RulerIcon,
} from '@/components/overlayControlIcons'
import { useActiveProject } from '@/context/ActiveProjectContext'
import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import { useMediaMarkerFlow } from '@/context/MediaMarkerFlowContext'
import {
  GEOMETRY_ONLY_FEATURE_MESSAGE,
  getAssetTypeLabel,
  isGeometryOnlyFeature,
  type SpatialAsset,
} from '@/data/sampleAssets'
import { effectiveViewDirectionDeg } from '@/panels/map/DirectionBeam'
import {
  mapOverlayInsetBottomAboveMediaControlsClassName,
  mapOverlayInsetXClassName,
} from '@/panels/map/mapOverlayLayout'
import { getDefaultFloorPlanIdForProject } from '@/panels/map/mapFloorPlans'
import { AddMarkerPopup } from '@/panels/media/AddMarkerPopup'
import {
  MEDIA_MARKER_PLACEMENT_INSTRUCTION,
  MediaMarkerOverlay,
} from '@/panels/media/MediaMarkerOverlay'
import { Panorama360Viewer } from '@/panels/library/Panorama360Viewer'

type FeatureLibraryMediaViewerProps = {
  asset: SpatialAsset
  libraryAssets: SpatialAsset[]
  onAssetChange: (asset: SpatialAsset) => void
  onClose?: () => void
  hideOverlayClose?: boolean
  hideOverlayNavigation?: boolean
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
  const { project, projectId } = useActiveProject()
  const isBuildingProject = project.projectType === 'Building'
  const {
    viewDirectionBaseDeg,
    viewDirectionLiveOffsetDeg,
    setViewDirectionLiveOffsetDeg,
  } = useFeatureMapHover()
  const {
    isPlacingMediaMarker,
    isAdjustingMediaMarker,
    isCreateMarkerPopupOpen,
    parentAssetId,
    draftMarker,
    startPlacement,
    placeOnMedia,
    updateDraftMarker,
    cancelFlow,
    requestCloseMarkerPanel,
  } = useMediaMarkerFlow()

  const markerFlowAppliesToAsset = parentAssetId === asset.id

  const index = Math.max(
    0,
    libraryAssets.findIndex((a) => a.id === asset.id),
  )
  const canGoBack = libraryAssets.length > 1
  const canGoForward = libraryAssets.length > 1
  const geometryOnly = isGeometryOnlyFeature(asset)
  const navDisabled = isPlacingMediaMarker || isAdjustingMediaMarker

  const goPrev = useCallback(() => {
    if (libraryAssets.length === 0 || navDisabled) return
    const i = libraryAssets.findIndex((a) => a.id === asset.id)
    const next = (i - 1 + libraryAssets.length) % libraryAssets.length
    onAssetChange(libraryAssets[next])
  }, [asset.id, libraryAssets, navDisabled, onAssetChange])

  const goNext = useCallback(() => {
    if (libraryAssets.length === 0 || navDisabled) return
    const i = libraryAssets.findIndex((a) => a.id === asset.id)
    const next = (i + 1) % libraryAssets.length
    onAssetChange(libraryAssets[next])
  }, [asset.id, libraryAssets, navDisabled, onAssetChange])

  const handleAddMarker = useCallback(() => {
    startPlacement(asset)
  }, [asset, startPlacement])

  const viewDirectionDeg =
    viewDirectionBaseDeg != null
      ? effectiveViewDirectionDeg(viewDirectionBaseDeg, viewDirectionLiveOffsetDeg)
      : asset.viewDirectionDeg ?? 0

  const handleMediaClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isPlacingMediaMarker || geometryOnly) return
      if (asset.kind === 'panorama') return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      placeOnMedia({
        mediaPosition: { x, y },
        viewDirectionDeg,
        isBuildingProject,
        defaultFloorPlanId: getDefaultFloorPlanIdForProject(projectId) ?? 'SOM-2',
        parentAsset: asset,
      })
    },
    [
      asset,
      geometryOnly,
      isBuildingProject,
      isPlacingMediaMarker,
      placeOnMedia,
      projectId,
      viewDirectionDeg,
    ],
  )

  const handlePanoPlacementClick = useCallback(
    (payload: { yawDeg: number; pitchDeg: number }) => {
      placeOnMedia({
        panoPosition: { yawDeg: payload.yawDeg, pitchDeg: payload.pitchDeg },
        viewDirectionDeg,
        isBuildingProject,
        defaultFloorPlanId: getDefaultFloorPlanIdForProject(projectId) ?? 'SOM-2',
        parentAsset: asset,
      })
    },
    [asset, isBuildingProject, placeOnMedia, projectId, viewDirectionDeg],
  )

  useEffect(() => {
    if (!isPlacingMediaMarker && !isAdjustingMediaMarker) return
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault()
        if (isAdjustingMediaMarker) {
          requestCloseMarkerPanel()
        } else {
          cancelFlow()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cancelFlow, isAdjustingMediaMarker, isPlacingMediaMarker, requestCloseMarkerPanel])

  const showDraftMediaMarker =
    markerFlowAppliesToAsset &&
    isAdjustingMediaMarker &&
    draftMarker?.mediaPosition != null

  const savedFlatMediaMarkers = (asset.mediaMarkers ?? []).filter((marker) => {
    if (marker.mediaPosition == null) return false
    if (
      markerFlowAppliesToAsset &&
      isAdjustingMediaMarker &&
      draftMarker?.id != null &&
      marker.id === draftMarker.id
    ) {
      return false
    }
    return true
  })

  const savedPanoMediaMarkers = (asset.mediaMarkers ?? []).filter((marker) => {
    if (marker.panoPosition == null) return false
    if (
      markerFlowAppliesToAsset &&
      isAdjustingMediaMarker &&
      draftMarker?.id != null &&
      marker.id === draftMarker.id
    ) {
      return false
    }
    return true
  })

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
            placementMode={isPlacingMediaMarker}
            onPlacementClick={handlePanoPlacementClick}
            markerPanoPosition={
              markerFlowAppliesToAsset && isAdjustingMediaMarker
                ? (draftMarker?.panoPosition ?? null)
                : null
            }
            markerIsPreliminary={draftMarker?.isPreliminary ?? true}
            markerColor={draftMarker?.color}
            markerDraggable={
              markerFlowAppliesToAsset &&
              isAdjustingMediaMarker &&
              draftMarker?.panoPosition != null
            }
            persistedPanoMarkers={savedPanoMediaMarkers.map((marker) => ({
              id: marker.id,
              panoPosition: marker.panoPosition!,
              color: marker.color,
            }))}
            onMarkerMove={(pos) => updateDraftMarker({ panoPosition: pos })}
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
          <div
            className={
              'absolute inset-0 ' + (isPlacingMediaMarker ? 'cursor-crosshair' : '')
            }
            onClick={handleMediaClick}
          >
            <img
              src={asset.fileUrl ?? ''}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
            {savedFlatMediaMarkers.map((marker) => (
              <MediaMarkerOverlay
                key={marker.id}
                draft={{ color: marker.color, isPreliminary: false }}
                mediaPosition={marker.mediaPosition!}
              />
            ))}
            {showDraftMediaMarker && draftMarker?.mediaPosition != null ? (
              <MediaMarkerOverlay
                draft={draftMarker}
                mediaPosition={draftMarker.mediaPosition}
                draggable={isAdjustingMediaMarker}
                onMove={(pos) => updateDraftMarker({ mediaPosition: pos })}
              />
            ) : null}
          </div>
        )}

        {isPlacingMediaMarker ? (
          <div
            className={
              'pointer-events-none absolute z-20 flex justify-center ' +
              mapOverlayInsetXClassName +
              ' ' +
              mapOverlayInsetBottomAboveMediaControlsClassName
            }
            role="status"
            aria-live="polite"
          >
            <div className="max-w-md rounded-panel bg-fg-highlight px-3 py-2 text-center font-sans text-standard text-white shadow-sm">
              {MEDIA_MARKER_PLACEMENT_INSTRUCTION}
            </div>
          </div>
        ) : null}

        {isCreateMarkerPopupOpen && markerFlowAppliesToAsset ? (
          <AddMarkerPopup parentAsset={asset} />
        ) : null}

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
                    className={overlayBtnClass + (!canGoBack || navDisabled ? ' opacity-40' : '')}
                    aria-label="Previous feature"
                    disabled={!canGoBack || navDisabled}
                    onClick={goPrev}
                  >
                    <ChevronLeftIcon />
                  </button>
                </DelayedTooltip>
                <DelayedTooltip label="Next feature">
                  <button
                    type="button"
                    className={
                      overlayBtnClass + (!canGoForward || navDisabled ? ' opacity-40' : '')
                    }
                    aria-label="Next feature"
                    disabled={!canGoForward || navDisabled}
                    onClick={goNext}
                  >
                    <ChevronRightIcon />
                  </button>
                </DelayedTooltip>
              </>
            ) : null}
          </div>

          <div ref={mediaControlsRef} className="pointer-events-auto flex items-end gap-2">
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
                <DelayedTooltip label="Add marker">
                  <button
                    type="button"
                    className={overlayBtnAddMarkerClass}
                    aria-label="Add marker"
                    onClick={handleAddMarker}
                    disabled={isPlacingMediaMarker || isAdjustingMediaMarker}
                  >
                    <AddMarkerIcon />
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
