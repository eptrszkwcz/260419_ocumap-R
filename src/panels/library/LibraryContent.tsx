import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

import { useActiveProject } from '@/context/ActiveProjectContext'
import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import { useMapCaptureMarkers, type MapCaptureMarker } from '@/context/MapCaptureMarkersContext'
import { useMapLocationPick } from '@/context/MapLocationPickContext'
import { getSampleAssetsForProject, type SpatialAsset } from '@/data/sampleAssets'
import { AddFeatureFlow } from '@/panels/library/AddFeatureFlow'
import { type ActiveFilter } from '@/panels/library/FeatureLibraryBadges'
import { FeatureLibraryFilterRow } from '@/panels/library/FeatureLibraryFilterRow'
import { FeatureLibraryMediaViewer } from '@/panels/library/FeatureLibraryMediaViewer'
import { FeatureMediaMetadataPanel } from '@/panels/library/FeatureMediaMetadataPanel'
import { FeatureLibraryTable } from '@/panels/library/FeatureLibraryTable'
import { FeatureLibraryToolbar } from '@/panels/library/FeatureLibraryToolbar'
import { ProjectDetailsPanel } from '@/panels/library/ProjectDetailsPanel'

type LibraryContentProps = {
  activeTabId: string
}

function assetsToCaptureMarkers(assets: SpatialAsset[]): MapCaptureMarker[] {
  return assets
    .filter(
      (a) =>
        a.captureLng != null &&
        a.captureLat != null &&
        Number.isFinite(a.captureLng) &&
        Number.isFinite(a.captureLat),
    )
    .map((a) => ({ id: a.id, lng: a.captureLng as number, lat: a.captureLat as number }))
}

export function LibraryContent({ activeTabId }: LibraryContentProps) {
  const { projectId } = useActiveProject()
  const { setCaptureMarkers } = useMapCaptureMarkers()
  const [assets, setAssets] = useState<SpatialAsset[]>(() => getSampleAssetsForProject(projectId))

  useEffect(() => {
    setCaptureMarkers(assetsToCaptureMarkers(assets))
    return () => {
      setCaptureMarkers([])
    }
  }, [assets, setCaptureMarkers])

  if (activeTabId === 'project-details') {
    return <ProjectDetailsPanel assets={assets} />
  }

  if (activeTabId === 'log-book') {
    return (
      <div className="min-h-0 flex-1 overflow-auto p-panel-padding">
        <p className="font-sans text-standard text-fg-muted">
          Activity and audit log entries will appear here.
        </p>
      </div>
    )
  }

  return (
    <FeatureLibraryView
      assets={assets}
      setAssets={setAssets}
    />
  )
}

type FeatureLibraryViewProps = {
  assets: SpatialAsset[]
  setAssets: Dispatch<SetStateAction<SpatialAsset[]>>
}

function FeatureLibraryView({ assets, setAssets }: FeatureLibraryViewProps) {
  const { cancelLocationPick } = useMapLocationPick()
  const { setOpenedFeatureId, setMapFeatureClickHandler } = useFeatureMapHover()
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [viewMode, setViewMode] = useState<'browse' | 'add'>('browse')
  const [openedAsset, setOpenedAsset] = useState<SpatialAsset | null>(null)
  const [viewerPanel, setViewerPanel] = useState<'media' | 'metadata'>('media')

  const visibleAssets = assets
  const visibleCount = visibleAssets.length

  const viewerAsset = viewMode === 'browse' ? openedAsset : null

  const openAsset = (asset: SpatialAsset) => {
    setViewerPanel('media')
    setOpenedAsset(asset)
    setOpenedFeatureId(asset.id)
  }

  useEffect(() => {
    setOpenedFeatureId(viewerAsset?.id ?? null)
  }, [viewerAsset?.id, setOpenedFeatureId])

  useEffect(() => {
    setMapFeatureClickHandler((id) => {
      const asset = assets.find((a) => a.id === id)
      if (asset != null) {
        setViewerPanel('media')
        setOpenedAsset(asset)
        setOpenedFeatureId(asset.id)
      }
    })
    return () => setMapFeatureClickHandler(null)
  }, [assets, setMapFeatureClickHandler, setOpenedFeatureId])

  const replaceOpenedAsset = (asset: SpatialAsset) => {
    setOpenedAsset(asset)
    setViewerPanel('media')
  }

  const updateAssetInLibrary = (updated: SpatialAsset) => {
    setAssets((list) => list.map((a) => (a.id === updated.id ? updated : a)))
    setOpenedAsset(updated)
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <FeatureLibraryToolbar
        onAddFeatureClick={() => {
          cancelLocationPick()
          setOpenedAsset(null)
          setOpenedFeatureId(null)
          setViewMode('add')
        }}
        viewerAsset={viewerAsset}
        viewerPanel={viewerPanel}
        onOpenMetadata={() => setViewerPanel('metadata')}
        onOpenMedia={() => {
          cancelLocationPick()
          setViewerPanel('media')
        }}
        onCloseViewer={() => {
          cancelLocationPick()
          setOpenedAsset(null)
          setOpenedFeatureId(null)
          setViewerPanel('media')
        }}
      />
      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col"
        id="feature-library-contents"
      >
        {viewMode === 'browse' ? (
          viewerAsset != null ? (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col p-2">
              {viewerPanel === 'metadata' ? (
                <FeatureMediaMetadataPanel
                  key={[
                    viewerAsset.id,
                    viewerAsset.title,
                    viewerAsset.kind,
                    viewerAsset.dateUploaded,
                    viewerAsset.dateCaptured ?? '',
                    viewerAsset.captureLng ?? '',
                    viewerAsset.captureLat ?? '',
                    viewerAsset.fileSizeBytes ?? '',
                    viewerAsset.mimeType ?? '',
                    viewerAsset.width ?? '',
                    viewerAsset.height ?? '',
                  ].join('|')}
                  asset={viewerAsset}
                  onSave={updateAssetInLibrary}
                />
              ) : (
                <FeatureLibraryMediaViewer
                  asset={viewerAsset}
                  libraryAssets={visibleAssets}
                  onAssetChange={replaceOpenedAsset}
                />
              )}
            </div>
          ) : (
            <>
              <FeatureLibraryFilterRow
                featureCount={visibleCount}
                activeFilters={activeFilters}
                onRemoveFilter={(id) => setActiveFilters((prev) => prev.filter((f) => f.id !== id))}
              />
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <FeatureLibraryTable assets={visibleAssets} onOpenAsset={openAsset} />
              </div>
            </>
          )
        ) : (
          <AddFeatureFlow
            onCancel={() => setViewMode('browse')}
            onSave={(newItems) => {
              setAssets((a) => [...a, ...newItems])
              setViewMode('browse')
            }}
          />
        )}
      </div>
    </div>
  )
}
