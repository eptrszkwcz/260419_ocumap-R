import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'

import { useActiveProject } from '@/context/ActiveProjectContext'
import { useProjects } from '@/context/ProjectsContext'
import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import { useMapCaptureMarkers, type FloorPlanMarker, type MapCaptureMarker } from '@/context/MapCaptureMarkersContext'
import { useFloorPlanLocationPick } from '@/context/FloorPlanLocationPickContext'
import { useMapLocationPick } from '@/context/MapLocationPickContext'
import { useMarkerStylePreview } from '@/context/MarkerStylePreviewContext'
import { getSampleAssetsForProject, type SpatialAsset } from '@/data/sampleAssets'
import type { DemoProjectDetailsProfile } from '@/data/sampleProjectProfile'
import { NEW_PROJECT_ID, sampleProjects } from '@/data/sampleProjects'
import { downloadSpatialAsset } from '@/lib/downloadSpatialAsset'
import { markerColorsFromAsset } from '@/panels/map/markerColors'
import { AddFeatureFlow } from '@/panels/library/AddFeatureFlow'
import { PanelCenteredPrompt } from '@/components/PanelCenteredPrompt'
import { nextSortDirection, type SortDirection } from '@/components/SortableColumnHeader'
import { type ActiveFilter } from '@/panels/library/FeatureLibraryBadges'
import { FeatureLibraryFilterRow } from '@/panels/library/FeatureLibraryFilterRow'
import { FeatureLibraryMediaViewer } from '@/panels/library/FeatureLibraryMediaViewer'
import { FeatureMediaMetadataPanel } from '@/panels/library/FeatureMediaMetadataPanel'
import { FeatureLibraryTable } from '@/panels/library/FeatureLibraryTable'
import { FeatureLibraryToolbar } from '@/panels/library/FeatureLibraryToolbar'
import { applyFeatureLibraryFilters } from '@/panels/library/featureLibrary/applyFeatureLibraryFilters'
import { FeatureLibraryControlActions } from '@/panels/library/featureLibrary/FeatureLibraryControlActions'
import { FeatureLibraryThumbnailGrid } from '@/panels/library/featureLibrary/FeatureLibraryThumbnailGrid'
import { filtersToBadges, removeFilterByBadgeId } from '@/panels/library/featureLibrary/filterBadges'
import { resolveVisibleColumns } from '@/panels/library/featureLibrary/resolveVisibleColumns'
import {
  sortFeatureLibraryAssets,
  type FeatureLibrarySortColumn,
} from '@/panels/library/featureLibrary/sortFeatureLibraryAssets'
import {
  createDefaultColumnOrder,
  createDefaultColumnVisibility,
  createEmptyFilters,
  type FeatureLibraryFilters,
  type LibraryDropdownId,
  type LibraryViewType,
  type OptionalColumnId,
} from '@/panels/library/featureLibrary/types'
import { NewProjectDetailsForm } from '@/panels/library/newProject/NewProjectDetailsForm'
import { ProjectDetailsPanel } from '@/panels/library/ProjectDetailsPanel'
type LibraryContentProps = {
  activeTabId: string
}

const legacySampleProjectIds = new Set(sampleProjects.map((p) => p.id))

function assetsForProject(projectId: string, isNewProject: boolean): SpatialAsset[] {
  if (isNewProject || projectId === NEW_PROJECT_ID) return []
  if (!legacySampleProjectIds.has(projectId)) return []
  return getSampleAssetsForProject(projectId)
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
    .map((a) => {
      const { fill, stroke } = markerColorsFromAsset(a.markerColor)
      return {
        id: a.id,
        lng: a.captureLng as number,
        lat: a.captureLat as number,
        color: fill,
        strokeColor: stroke,
      }
    })
}

function assetsToFloorPlanMarkers(assets: SpatialAsset[]): FloorPlanMarker[] {
  return assets
    .filter((a) => {
      const p = a.floorPlanPosition
      if (p == null) return false
      return (
        Number.isFinite(p.x) &&
        Number.isFinite(p.y) &&
        p.x >= 0 &&
        p.x <= 1 &&
        p.y >= 0 &&
        p.y <= 1
      )
    })
    .map((a) => {
      const { fill, stroke } = markerColorsFromAsset(a.markerColor)
      return {
        id: a.id,
        floorPlanId: a.floorPlanPosition!.floorPlanId,
        x: a.floorPlanPosition!.x,
        y: a.floorPlanPosition!.y,
        color: fill,
        strokeColor: stroke,
      }
    })
}

export function LibraryContent({ activeTabId }: LibraryContentProps) {
  const { projectId, isNewProject } = useActiveProject()
  const { getProjectProfile, updateProjectProfile } = useProjects()
  const { setCaptureMarkers, setFloorPlanMarkers } = useMapCaptureMarkers()
  const [assets, setAssets] = useState<SpatialAsset[]>(() =>
    assetsForProject(projectId, isNewProject),
  )

  useEffect(() => {
    setAssets(assetsForProject(projectId, isNewProject))
  }, [isNewProject, projectId])

  const projectProfile = getProjectProfile(projectId)

  const saveProjectProfile = (profile: DemoProjectDetailsProfile) => {
    updateProjectProfile(projectId, profile)
  }

  useEffect(() => {
    setCaptureMarkers(assetsToCaptureMarkers(assets))
    setFloorPlanMarkers(assetsToFloorPlanMarkers(assets))
    return () => {
      setCaptureMarkers([])
      setFloorPlanMarkers([])
    }
  }, [assets, setCaptureMarkers, setFloorPlanMarkers])

  if (isNewProject) {
    return <NewProjectDetailsForm />
  }

  if (activeTabId === 'project-details') {
    return (
      <ProjectDetailsPanel
        assets={assets}
        profile={projectProfile}
        onSaveProfile={saveProjectProfile}
      />
    )
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
  const { project } = useActiveProject()
  const isBuildingProject = project.projectType === 'Building'
  const { cancelLocationPick, clearLocationPickPreview } = useMapLocationPick()
  const { cancelFloorPlanLocationPick, clearFloorPlanLocationPickPreview } = useFloorPlanLocationPick()
  const { clearMarkerStylePreview } = useMarkerStylePreview()
  const { setOpenedFeatureId, setMapFeatureClickHandler } = useFeatureMapHover()
  const contentsRef = useRef<HTMLDivElement>(null)

  const [filters, setFilters] = useState<FeatureLibraryFilters>(() => createEmptyFilters())
  const [libraryViewType, setLibraryViewType] = useState<LibraryViewType>('list')
  const [columnOrder, setColumnOrder] = useState<OptionalColumnId[]>(() => createDefaultColumnOrder())
  const [columnVisibility, setColumnVisibility] = useState<Record<OptionalColumnId, boolean>>(() =>
    createDefaultColumnVisibility(isBuildingProject),
  )
  const [openDropdown, setOpenDropdown] = useState<LibraryDropdownId | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [sortColumn, setSortColumn] = useState<FeatureLibrarySortColumn>('feature')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const [viewMode, setViewMode] = useState<'browse' | 'add'>('browse')
  const [openedAsset, setOpenedAsset] = useState<SpatialAsset | null>(null)
  const [viewerPanel, setViewerPanel] = useState<'media' | 'metadata'>('media')
  const [metadataAutoStartLocationPick, setMetadataAutoStartLocationPick] = useState(false)

  useEffect(() => {
    setColumnVisibility((prev) => ({
      ...prev,
      location: isBuildingProject ? prev.location : false,
    }))
  }, [isBuildingProject])

  useEffect(() => {
    const el = contentsRef.current
    if (el == null) return
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry != null) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    ro.observe(el)
    setContainerWidth(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  const filteredAssets = useMemo(
    () => applyFeatureLibraryFilters(assets, filters, project.projectType),
    [assets, filters, project.projectType],
  )
  const activeFilters: ActiveFilter[] = useMemo(() => filtersToBadges(filters), [filters])
  const visibleColumns = useMemo(
    () =>
      resolveVisibleColumns({
        containerWidthPx: containerWidth,
        columnOrder,
        columnVisibility,
      }),
    [containerWidth, columnOrder, columnVisibility],
  )
  const sortedAssets = useMemo(
    () => sortFeatureLibraryAssets(filteredAssets, sortColumn, sortDirection, project.projectType),
    [filteredAssets, sortColumn, sortDirection, project.projectType],
  )

  const handleSortColumn = (column: FeatureLibrarySortColumn) => {
    setSortDirection(nextSortDirection(sortColumn, column, sortDirection))
    setSortColumn(column)
  }

  const visibleCount = sortedAssets.length

  const viewerAsset = viewMode === 'browse' ? openedAsset : null

  const openAsset = (asset: SpatialAsset) => {
    setMetadataAutoStartLocationPick(false)
    setViewerPanel('media')
    setOpenedAsset(asset)
    setOpenedFeatureId(asset.id)
  }

  const openFeatureProperties = (asset: SpatialAsset) => {
    cancelLocationPick()
    cancelFloorPlanLocationPick()
    setMetadataAutoStartLocationPick(false)
    setOpenedAsset(asset)
    setOpenedFeatureId(asset.id)
    setViewerPanel('metadata')
  }

  const openSetLocation = (asset: SpatialAsset) => {
    cancelLocationPick()
    cancelFloorPlanLocationPick()
    setMetadataAutoStartLocationPick(true)
    setOpenedAsset(asset)
    setOpenedFeatureId(asset.id)
    setViewerPanel('metadata')
  }

  const deleteAsset = (asset: SpatialAsset) => {
    if (openedAsset?.id === asset.id) {
      cancelLocationPick()
      cancelFloorPlanLocationPick()
      clearLocationPickPreview()
      clearFloorPlanLocationPickPreview()
      clearMarkerStylePreview()
      setOpenedAsset(null)
      setOpenedFeatureId(null)
      setViewerPanel('media')
      setMetadataAutoStartLocationPick(false)
    }
    setAssets((list) => list.filter((a) => a.id !== asset.id))
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
    cancelLocationPick()
    cancelFloorPlanLocationPick()
    clearLocationPickPreview()
    clearFloorPlanLocationPickPreview()
    clearMarkerStylePreview()
    setMetadataAutoStartLocationPick(false)
    setAssets((list) => list.map((a) => (a.id === updated.id ? updated : a)))
    setOpenedAsset(updated)
    setViewerPanel('media')
  }

  const showEmptyLibraryPrompt =
    viewMode === 'browse' && viewerAsset == null && assets.length === 0

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="relative z-20 shrink-0">
        <FeatureLibraryToolbar
        onAddFeatureClick={() => {
          cancelLocationPick()
          cancelFloorPlanLocationPick()
          clearMarkerStylePreview()
          setOpenedAsset(null)
          setOpenedFeatureId(null)
          setViewMode('add')
        }}
        viewerAsset={viewerAsset}
        viewerPanel={viewerPanel}
        onOpenMetadata={() => {
          setMetadataAutoStartLocationPick(false)
          setViewerPanel('metadata')
        }}
        onOpenMedia={() => {
          cancelLocationPick()
          cancelFloorPlanLocationPick()
          setViewerPanel('media')
        }}
        onCloseViewer={() => {
          cancelLocationPick()
          cancelFloorPlanLocationPick()
          clearMarkerStylePreview()
          setOpenedAsset(null)
          setOpenedFeatureId(null)
          setViewerPanel('media')
        }}
        libraryControlActions={
          <FeatureLibraryControlActions
            assets={assets}
            projectType={project.projectType}
            viewType={libraryViewType}
            onViewTypeChange={setLibraryViewType}
            columnOrder={columnOrder}
            columnVisibility={columnVisibility}
            onColumnOrderChange={setColumnOrder}
            onColumnVisibilityChange={(id, visible) =>
              setColumnVisibility((prev) => ({ ...prev, [id]: visible }))
            }
            filters={filters}
            onFiltersChange={setFilters}
            openDropdown={openDropdown}
            onOpenDropdownChange={setOpenDropdown}
          />
        }
        />
      </div>
      {showEmptyLibraryPrompt ? (
        <PanelCenteredPrompt overlay aria-label="Feature library">
          Add project files — images, videos, spherical panoramas, PDFs, and more — using Add
          Feature.
        </PanelCenteredPrompt>
      ) : null}
      <div
        ref={contentsRef}
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
                    viewerAsset.floorPlanPosition?.floorPlanId ?? '',
                    viewerAsset.floorPlanPosition?.x ?? '',
                    viewerAsset.floorPlanPosition?.y ?? '',
                    viewerAsset.fileSizeBytes ?? '',
                    viewerAsset.mimeType ?? '',
                    viewerAsset.width ?? '',
                    viewerAsset.height ?? '',
                    viewerAsset.markerColor ?? '',
                  ].join('|')}
                  asset={viewerAsset}
                  onSave={updateAssetInLibrary}
                  autoStartLocationPick={metadataAutoStartLocationPick}
                />
              ) : (
                <FeatureLibraryMediaViewer
                  asset={viewerAsset}
                  libraryAssets={sortedAssets}
                  onAssetChange={replaceOpenedAsset}
                />
              )}
            </div>
          ) : (
            <>
              <div className="relative shrink-0">
                <FeatureLibraryFilterRow
                  featureCount={visibleCount}
                  activeFilters={activeFilters}
                  onRemoveFilter={(id) => setFilters((prev) => removeFilterByBadgeId(prev, id))}
                />
              </div>
              {visibleCount === 0 ? (
                <div className="min-h-0 flex-1 bg-panel" aria-hidden />
              ) : libraryViewType === 'thumbnail' ? (
                <FeatureLibraryThumbnailGrid
                  assets={sortedAssets}
                  projectType={project.projectType}
                  onOpenAsset={openAsset}
                />
              ) : (
                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                  <FeatureLibraryTable
                    assets={sortedAssets}
                    projectType={project.projectType}
                    visibleColumns={visibleColumns}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSortColumn={handleSortColumn}
                    onOpenAsset={openAsset}
                    onSetLocation={openSetLocation}
                    onDownloadAsset={downloadSpatialAsset}
                    onDeleteAsset={deleteAsset}
                    onFeatureProperties={openFeatureProperties}
                  />
                </div>
              )}
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
