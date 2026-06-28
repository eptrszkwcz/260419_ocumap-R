import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'

import { useActiveProject } from '@/context/ActiveProjectContext'
import { useProjects } from '@/context/ProjectsContext'
import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import { useFeatureDraw } from '@/context/FeatureDrawContext'
import { useMapCaptureMarkers } from '@/context/MapCaptureMarkersContext'
import { useFloorPlanLocationPick } from '@/context/FloorPlanLocationPickContext'
import { useMapLocationPick } from '@/context/MapLocationPickContext'
import { useViewDirectionAdjust } from '@/context/ViewDirectionAdjustContext'
import { useMarkerStylePreview } from '@/context/MarkerStylePreviewContext'
import { getSampleAssetsForProject, isDrawnFeature, type SpatialAsset } from '@/data/sampleAssets'
import type { DemoProjectDetailsProfile } from '@/data/sampleProjectProfile'
import { NEW_PROJECT_ID, sampleProjects } from '@/data/sampleProjects'
import { downloadSpatialAsset } from '@/lib/downloadSpatialAsset'
import {
  assetsToCaptureMarkers,
  assetsToFloorPlanDrawnGeometries,
  assetsToFloorPlanMarkers,
  assetsToMapDrawnGeometries,
} from '@/panels/library/assetGeometryHelpers'
import { DrawnFeatureMetadataPanel } from '@/panels/library/DrawnFeatureMetadataPanel'
import { createDraftDrawnAsset } from '@/panels/map/FeatureDrawConfirmPanel'
import { useStartFeatureDraw } from '@/panels/map/useStartFeatureDraw'
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
import { useFeatureLibrarySelection } from '@/panels/library/featureLibrary/useFeatureLibrarySelection'
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

export function LibraryContent({ activeTabId }: LibraryContentProps) {
  const { projectId, isNewProject, project } = useActiveProject()
  const { getProjectProfile, updateProjectProfile } = useProjects()
  const { setCaptureMarkers, setFloorPlanMarkers, setFloorPlanDrawnGeometries, setMapDrawnGeometries } =
    useMapCaptureMarkers()
  const [assets, setAssets] = useState<SpatialAsset[]>(() =>
    assetsForProject(projectId, isNewProject),
  )
  const [filters, setFilters] = useState<FeatureLibraryFilters>(() => createEmptyFilters())

  useEffect(() => {
    setAssets(assetsForProject(projectId, isNewProject))
  }, [isNewProject, projectId])

  const projectProfile = getProjectProfile(projectId)

  const saveProjectProfile = (profile: DemoProjectDetailsProfile) => {
    updateProjectProfile(projectId, profile)
  }

  const mapVisibleAssets = useMemo(
    () => applyFeatureLibraryFilters(assets, filters, project.projectType),
    [assets, filters, project.projectType],
  )

  useEffect(() => {
    setCaptureMarkers(assetsToCaptureMarkers(mapVisibleAssets))
    setFloorPlanMarkers(assetsToFloorPlanMarkers(mapVisibleAssets))
    setFloorPlanDrawnGeometries(assetsToFloorPlanDrawnGeometries(mapVisibleAssets))
    setMapDrawnGeometries(assetsToMapDrawnGeometries(mapVisibleAssets))
    return () => {
      setCaptureMarkers([])
      setFloorPlanMarkers([])
      setFloorPlanDrawnGeometries([])
      setMapDrawnGeometries([])
    }
  }, [
    mapVisibleAssets,
    setCaptureMarkers,
    setFloorPlanMarkers,
    setFloorPlanDrawnGeometries,
    setMapDrawnGeometries,
  ])

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
      filters={filters}
      onFiltersChange={setFilters}
    />
  )
}

type FeatureLibraryViewProps = {
  assets: SpatialAsset[]
  setAssets: Dispatch<SetStateAction<SpatialAsset[]>>
  filters: FeatureLibraryFilters
  onFiltersChange: Dispatch<SetStateAction<FeatureLibraryFilters>>
}

function FeatureLibraryView({ assets, setAssets, filters, onFiltersChange }: FeatureLibraryViewProps) {
  const { project } = useActiveProject()
  const isBuildingProject = project.projectType === 'Building'
  const { cancelLocationPick, clearLocationPickPreview } = useMapLocationPick()
  const { cancelFloorPlanLocationPick, clearFloorPlanLocationPickPreview } = useFloorPlanLocationPick()
  const { cancelDirectionAdjust, isAdjustingDirection } = useViewDirectionAdjust()
  const { clearMarkerStylePreview } = useMarkerStylePreview()
  const { setOpenedFeatureId, setMapFeatureClickHandler, setViewDirectionBaseDeg, setViewDirectionLiveOffsetDeg } =
    useFeatureMapHover()
  const {
    isDrawing,
    isEditingFeature,
    draftFeatureId,
    geometryType,
    geometryConfirmed,
    draftMarkerColor,
    cancelDraw,
    cancelEditFeature,
  } = useFeatureDraw()
  const startFeatureDraw = useStartFeatureDraw()
  const contentsRef = useRef<HTMLDivElement>(null)
  const drawSessionOpenedRef = useRef<string | null>(null)

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
  const [addFeatureSessionKey, setAddFeatureSessionKey] = useState(0)
  const [openedAsset, setOpenedAsset] = useState<SpatialAsset | null>(null)
  const [viewerPanel, setViewerPanel] = useState<'media' | 'metadata' | 'draw-metadata'>('media')
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

  const {
    selectedFeatureIds,
    selectedAssets,
    selectedCount,
    selectFeature,
    toggleFeatureSelection,
    clearSelection,
  } = useFeatureLibrarySelection({ sortedAssets })

  const handleSortColumn = (column: FeatureLibrarySortColumn) => {
    setSortDirection(nextSortDirection(sortColumn, column, sortDirection))
    setSortColumn(column)
  }

  const visibleCount = sortedAssets.length

  const viewerAsset = viewMode === 'browse' ? openedAsset : null
  const isDrawDraftSession =
    viewerPanel === 'draw-metadata' && draftFeatureId != null && openedAsset?.id === draftFeatureId

  const closeDrawSession = () => {
    cancelDraw()
    clearMarkerStylePreview()
    drawSessionOpenedRef.current = null
    setOpenedAsset(null)
    setOpenedFeatureId(null)
    setViewerPanel('media')
  }

  useEffect(() => {
    if (!isDrawing || draftFeatureId == null) {
      if (!isDrawing && viewerPanel === 'draw-metadata') {
        clearMarkerStylePreview()
        drawSessionOpenedRef.current = null
        setOpenedAsset(null)
        setOpenedFeatureId(null)
        setViewerPanel('media')
      }
      if (!isDrawing) drawSessionOpenedRef.current = null
      return
    }
    if (drawSessionOpenedRef.current === draftFeatureId) return
    drawSessionOpenedRef.current = draftFeatureId
    cancelLocationPick()
    cancelFloorPlanLocationPick()
    cancelDirectionAdjust()
    setMetadataAutoStartLocationPick(false)
    setViewMode('browse')
    const draft = createDraftDrawnAsset(draftFeatureId, draftMarkerColor)
    setOpenedAsset(draft)
    setOpenedFeatureId(draftFeatureId)
    setViewerPanel('draw-metadata')
  }, [
    isDrawing,
    draftFeatureId,
    draftMarkerColor,
    cancelLocationPick,
    cancelFloorPlanLocationPick,
  ])

  const openAsset = (asset: SpatialAsset) => {
    if (isDrawing) closeDrawSession()
    if (isEditingFeature) cancelEditFeature()
    cancelLocationPick()
    cancelFloorPlanLocationPick()
    cancelDirectionAdjust()
    setMetadataAutoStartLocationPick(false)
    clearSelection()
    setOpenedAsset(asset)
    setOpenedFeatureId(asset.id)
    setViewerPanel(isDrawnFeature(asset) ? 'metadata' : 'media')
  }

  const openFeatureProperties = (asset: SpatialAsset) => {
    if (isDrawing) closeDrawSession()
    if (isEditingFeature) cancelEditFeature()
    cancelLocationPick()
    cancelFloorPlanLocationPick()
    cancelDirectionAdjust()
    setMetadataAutoStartLocationPick(false)
    setOpenedAsset(asset)
    setOpenedFeatureId(asset.id)
    setViewerPanel('metadata')
  }

  const openSetLocation = (asset: SpatialAsset) => {
    if (isDrawing) closeDrawSession()
    cancelLocationPick()
    cancelFloorPlanLocationPick()
    cancelDirectionAdjust()
    setMetadataAutoStartLocationPick(true)
    setOpenedAsset(asset)
    setOpenedFeatureId(asset.id)
    setViewerPanel('metadata')
  }

  const deleteAsset = (asset: SpatialAsset) => {
    if (openedAsset?.id === asset.id) {
      cancelLocationPick()
      cancelFloorPlanLocationPick()
      cancelDirectionAdjust()
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

  const deleteSelectedAssets = () => {
    for (const asset of selectedAssets) {
      deleteAsset(asset)
    }
    clearSelection()
  }

  const downloadSelectedAssets = () => {
    for (const asset of selectedAssets) {
      downloadSpatialAsset(asset)
    }
  }

  useEffect(() => {
    setOpenedFeatureId(viewerAsset?.id ?? null)
  }, [viewerAsset?.id, setOpenedFeatureId])

  useEffect(() => {
    if (isAdjustingDirection) return
    if (
      viewerAsset != null &&
      !isDrawnFeature(viewerAsset) &&
      (viewerAsset.kind === 'image' || viewerAsset.kind === 'panorama')
    ) {
      setViewDirectionBaseDeg(viewerAsset.viewDirectionDeg ?? 0)
      setViewDirectionLiveOffsetDeg(0)
    } else {
      setViewDirectionBaseDeg(null)
      setViewDirectionLiveOffsetDeg(0)
    }
  }, [isAdjustingDirection, viewerAsset, setViewDirectionBaseDeg, setViewDirectionLiveOffsetDeg])

  useEffect(() => {
    setMapFeatureClickHandler((id) => {
      if (isDrawing || isEditingFeature || isAdjustingDirection) return
      const asset = assets.find((a) => a.id === id)
      if (asset != null) {
        if (isDrawnFeature(asset)) {
          openFeatureProperties(asset)
          return
        }
        setViewerPanel('media')
        setOpenedAsset(asset)
        setOpenedFeatureId(asset.id)
      }
    })
    return () => setMapFeatureClickHandler(null)
  }, [assets, isAdjustingDirection, isDrawing, isEditingFeature, setMapFeatureClickHandler, setOpenedFeatureId])

  const closeGeometryViewer = () => {
    cancelLocationPick()
    cancelFloorPlanLocationPick()
    cancelDirectionAdjust()
    clearMarkerStylePreview()
    cancelEditFeature()
    setOpenedAsset(null)
    setOpenedFeatureId(null)
    setViewerPanel('media')
    setMetadataAutoStartLocationPick(false)
  }

  const updateDrawnFeatureInLibrary = (updated: SpatialAsset) => {
    clearMarkerStylePreview()
    setMetadataAutoStartLocationPick(false)
    cancelEditFeature()
    setAssets((list) => list.map((a) => (a.id === updated.id ? updated : a)))
    setOpenedAsset(updated)
    setViewerPanel('metadata')
  }

  const saveDrawnFeature = (saved: SpatialAsset) => {
    clearMarkerStylePreview()
    drawSessionOpenedRef.current = null
    cancelDraw()
    setAssets((list) => [...list, saved])
    setOpenedAsset(null)
    setOpenedFeatureId(null)
    setViewerPanel('media')
  }

  const replaceOpenedAsset = (asset: SpatialAsset) => {
    setOpenedAsset(asset)
    setViewerPanel('media')
  }

  const updateAssetInLibrary = (updated: SpatialAsset) => {
    cancelLocationPick()
    cancelFloorPlanLocationPick()
    cancelDirectionAdjust()
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
          if (isDrawing) closeDrawSession()
          cancelLocationPick()
          cancelFloorPlanLocationPick()
          cancelDirectionAdjust()
          clearMarkerStylePreview()
          setOpenedAsset(null)
          setOpenedFeatureId(null)
          setAddFeatureSessionKey((key) => key + 1)
          setViewMode('add')
        }}
        viewerAsset={viewerAsset}
        viewerPanel={viewerPanel}
        isDrawDraft={isDrawDraftSession}
        onOpenMetadata={() => {
          setMetadataAutoStartLocationPick(false)
          setViewerPanel('metadata')
        }}
        onOpenMedia={() => {
          cancelLocationPick()
          cancelFloorPlanLocationPick()
          cancelDirectionAdjust()
          setViewerPanel('media')
        }}
        onCloseViewer={() => {
          if (isDrawDraftSession) {
            closeDrawSession()
            return
          }
          if (viewerAsset != null && isDrawnFeature(viewerAsset)) {
            closeGeometryViewer()
            return
          }
          cancelLocationPick()
          cancelFloorPlanLocationPick()
          cancelDirectionAdjust()
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
            onFiltersChange={onFiltersChange}
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
              {viewerPanel === 'draw-metadata' ? (
                <DrawnFeatureMetadataPanel
                  mode="draft"
                  asset={viewerAsset}
                  geometryType={geometryType}
                  geometryConfirmed={geometryConfirmed}
                  onSave={saveDrawnFeature}
                  onCancel={closeDrawSession}
                />
              ) : viewerPanel === 'metadata' && isDrawnFeature(viewerAsset) ? (
                <DrawnFeatureMetadataPanel
                  mode="saved"
                  asset={viewerAsset}
                  isBuildingProject={isBuildingProject}
                  onSave={updateDrawnFeatureInLibrary}
                  onCancel={closeGeometryViewer}
                />
              ) : viewerPanel === 'metadata' ? (
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
                  libraryAssets={sortedAssets.filter((a) => !isDrawnFeature(a))}
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
                  onRemoveFilter={(id) => onFiltersChange((prev) => removeFilterByBadgeId(prev, id))}
                  selectedCount={selectedCount}
                  onClearSelection={clearSelection}
                  onDownloadSelected={downloadSelectedAssets}
                  onCopySelected={() => undefined}
                  onMoveSelected={() => undefined}
                  onDeleteSelected={deleteSelectedAssets}
                />
              </div>
              {visibleCount === 0 ? (
                <div className="min-h-0 flex-1 bg-panel" aria-hidden />
              ) : libraryViewType === 'thumbnail' ? (
                <FeatureLibraryThumbnailGrid
                  assets={sortedAssets}
                  projectType={project.projectType}
                  selectedFeatureIds={selectedFeatureIds}
                  onSelectFeature={selectFeature}
                  onToggleFeatureSelection={toggleFeatureSelection}
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
                    selectedFeatureIds={selectedFeatureIds}
                    onSortColumn={handleSortColumn}
                    onSelectFeature={selectFeature}
                    onToggleFeatureSelection={toggleFeatureSelection}
                    onOpenAsset={openAsset}
                    onSetLocation={openSetLocation}
                    onDownloadAsset={downloadSpatialAsset}
                    onCopyAsset={() => undefined}
                    onMoveAsset={() => undefined}
                    onDeleteAsset={deleteAsset}
                    onFeatureProperties={openFeatureProperties}
                  />
                </div>
              )}
            </>
          )
        ) : (
          <AddFeatureFlow
            key={addFeatureSessionKey}
            onCancel={() => setViewMode('browse')}
            onSave={(newItems) => {
              setAssets((a) => [...a, ...newItems])
              setViewMode('browse')
            }}
            onStartDraw={() => {
              cancelLocationPick()
              cancelFloorPlanLocationPick()
              clearMarkerStylePreview()
              startFeatureDraw()
            }}
          />
        )}
      </div>
    </div>
  )
}
