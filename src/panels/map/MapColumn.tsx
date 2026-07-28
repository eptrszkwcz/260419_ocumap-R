import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { PanelTabRow, type TabItem } from '@/components/PanelTabRow'
import { PanelCenteredPrompt } from '@/components/PanelCenteredPrompt'
import { TabPanelBody } from '@/components/TabPanelBody'
import { useActiveFloorPlan } from '@/context/ActiveFloorPlanContext'
import { useActiveProject } from '@/context/ActiveProjectContext'
import { useProjects } from '@/context/ProjectsContext'
import { useProjectFloorPlans } from '@/context/ProjectFloorPlansContext'
import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import { useFloorPlanLocationPick } from '@/context/FloorPlanLocationPickContext'
import { useMapCaptureMarkers } from '@/context/MapCaptureMarkersContext'
import { useMapLocationPick } from '@/context/MapLocationPickContext'
import { useMediaMarkerFlow } from '@/context/MediaMarkerFlowContext'
import { useMarkerStylePreview } from '@/context/MarkerStylePreviewContext'
import { useViewDirectionAdjust } from '@/context/ViewDirectionAdjustContext'

import { NewProjectOrganizationPicker } from '@/panels/library/newProject/NewProjectOrganizationPicker'
import { AddFloorPlanFlow } from '@/panels/map/addFloorPlan/AddFloorPlanFlow'
import { FilesOnlyMapWorkspace } from '@/panels/map/FilesOnlyMapWorkspace'
import { InfrastructureMapStyleHeader } from '@/panels/map/InfrastructureMapStyleHeader'
import { InfrastructureMapView } from '@/panels/map/InfrastructureMapView'
import { MapContent } from '@/panels/map/MapContent'
import { MapControlHeader } from '@/panels/map/MapControlHeader'
import { MapHeader } from '@/panels/map/MapHeader'
import {
  floorPlanDisplayLabel,
  floorPlanImageSrc,
  getFloorPlanOptionsForProject,
} from '@/panels/map/mapFloorPlans'
import {
  resolveMapBaseStyleUrl,
  type MapBaseStyleId,
} from '@/panels/map/mapBaseStyles'
import {
  mergeCaptureMarkerPreview,
  mergeCaptureMarkerStylePreview,
  mergeFloorPlanMarkerPreview,
  mergeFloorPlanMarkerStylePreview,
} from '@/panels/map/mergeLocationPickPreviews'
import {
  mergeMediaMarkerCapturePreview,
  mergeMediaMarkerFloorPlanPreview,
} from '@/panels/map/mergeMediaMarkerPreview'
import { MarkerPanelColumn } from '@/panels/map/MarkerPanelColumn'
import {
  MARKER_FLOW_MAP_HEIGHT_FRACTION,
  MARKER_FLOW_PANEL_HEIGHT_FRACTION,
  MARKER_FLOW_PANEL_GAP_PX,
} from '@/panels/map/mapOverlayLayout'

const buildingTabs: TabItem[] = [
  { id: '2d', label: 'Floor Plans' },
  { id: '3d', label: '3D Point Cloud' },
]

type MapColumnProps = {
  /** Incremented when the library/map splitter drag ends; infrastructure Mapbox runs a final `resize()`. */
  splitCommitToken?: number
  variant?: 'editor' | 'published'
  layoutMode?: 'full' | 'mini'
  layoutModeToken?: number
  hideHeader?: boolean
}

export function MapColumn({
  splitCommitToken = 0,
  variant = 'editor',
  layoutMode = 'full',
  layoutModeToken = 0,
  hideHeader = false,
}: MapColumnProps) {
  const { project, projectId, isNewProject } = useActiveProject()
  const { updateProjectType } = useProjects()
  const { getFloorPlans } = useProjectFloorPlans()
  const userFloorPlans = getFloorPlans(projectId)
  const { captureMarkers, floorPlanMarkers, floorPlanDrawnGeometries, mapDrawnGeometries } =
    useMapCaptureMarkers()
  const { locationPickPreview } = useMapLocationPick()
  const { floorPlanPickPreview } = useFloorPlanLocationPick()
  const { markerStylePreview } = useMarkerStylePreview()
  const {
    isMarkerPanelOpen,
    draftMarker,
    parentAssetId,
    parentAsset,
    markerFlowResizeToken,
  } = useMediaMarkerFlow()
  const { adjustingFeatureId, isAdjustingDirection } = useViewDirectionAdjust()
  const { openedFeatureId, linkedFeatureId } = useFeatureMapHover()
  const [buildingTab, setBuildingTab] = useState('2d')
  const [floorPlanViewMode, setFloorPlanViewMode] = useState<'view' | 'add'>('view')
  const [buildingBootstrap, setBuildingBootstrap] = useState<'addFloorPlan' | null>(null)
  const { floorPlanId, setFloorPlanId } = useActiveFloorPlan()
  const [baseMapStyleId, setBaseMapStyleId] = useState<MapBaseStyleId>('default')

  const floorPlanOptions = useMemo(
    () => getFloorPlanOptionsForProject(projectId, userFloorPlans),
    [projectId, userFloorPlans],
  )
  const hasFloorPlans = floorPlanOptions.length > 0

  useEffect(() => {
    setBaseMapStyleId('default')
    setFloorPlanViewMode('view')
    setBuildingBootstrap(null)
  }, [projectId])

  useEffect(() => {
    if (project.projectType !== 'Building' || buildingBootstrap !== 'addFloorPlan') return
    setFloorPlanViewMode('add')
    setBuildingBootstrap(null)
  }, [project.projectType, buildingBootstrap])

  const handleAddMapToFilesOnlyProject = useCallback(() => {
    updateProjectType(projectId, 'Infrastructure')
  }, [projectId, updateProjectType])

  const handleAddFloorPlanToFilesOnlyProject = useCallback(() => {
    setBuildingBootstrap('addFloorPlan')
    updateProjectType(projectId, 'Building')
  }, [projectId, updateProjectType])

  useEffect(() => {
    if (!hasFloorPlans) return
    if (!floorPlanOptions.some((o) => o.id === floorPlanId)) {
      setFloorPlanId(floorPlanOptions[0].id)
    }
  }, [floorPlanOptions, floorPlanId, hasFloorPlans, projectId])

  const displayCaptureMarkers = useMemo(() => {
    const withLocation = mergeCaptureMarkerPreview(captureMarkers, locationPickPreview)
    const withStyle = mergeCaptureMarkerStylePreview(withLocation, markerStylePreview)
    return mergeMediaMarkerCapturePreview(withStyle, draftMarker, parentAssetId)
  }, [captureMarkers, locationPickPreview, markerStylePreview, draftMarker, parentAssetId])

  const displayFloorPlanMarkers = useMemo(() => {
    const withLocation = mergeFloorPlanMarkerPreview(floorPlanMarkers, floorPlanPickPreview)
    const withStyle = mergeFloorPlanMarkerStylePreview(withLocation, markerStylePreview)
    return mergeMediaMarkerFloorPlanPreview(
      withStyle,
      draftMarker,
      parentAssetId,
      floorPlanId,
    )
  }, [
    floorPlanMarkers,
    floorPlanPickPreview,
    markerStylePreview,
    draftMarker,
    parentAssetId,
    floorPlanId,
  ])

  useEffect(() => {
    if (floorPlanPickPreview == null) return
    if (!hasFloorPlans) return
    setFloorPlanId((current) =>
      floorPlanPickPreview.floorPlanId !== current ? floorPlanPickPreview.floorPlanId : current,
    )
  }, [floorPlanPickPreview, hasFloorPlans])

  useEffect(() => {
    const targetFeatureId =
      openedFeatureId ?? linkedFeatureId ?? (isAdjustingDirection ? adjustingFeatureId : null)
    if (targetFeatureId == null) return
    if (!hasFloorPlans) return
    const marker = displayFloorPlanMarkers.find((m) => m.id === targetFeatureId)
    const drawn = floorPlanDrawnGeometries.find((g) => g.id === targetFeatureId)
    const targetFloorId = marker?.floorPlanId ?? drawn?.floorPlanId
    if (targetFloorId == null) return
    setFloorPlanId((current) => (targetFloorId !== current ? targetFloorId : current))
  }, [
    adjustingFeatureId,
    isAdjustingDirection,
    openedFeatureId,
    linkedFeatureId,
    displayFloorPlanMarkers,
    floorPlanDrawnGeometries,
    hasFloorPlans,
  ])

  const isPublished = variant === 'published'
  const readOnly = isPublished
  const shellClass = isPublished
    ? 'flex h-full min-h-0 min-w-0 flex-col'
    : 'flex h-full min-h-[680px] min-w-0 flex-col'
  const resizeToken = isPublished ? layoutModeToken : splitCommitToken
  const mapViewResizeToken = isMarkerPanelOpen && !isPublished ? markerFlowResizeToken : 0

  const renderMapColumnBody = useCallback(
    (mapBody: ReactNode, tabConnected = false) => {
      if (!isMarkerPanelOpen || isPublished) {
        return <TabPanelBody>{mapBody}</TabPanelBody>
      }

      const mapPanel = (
        <TabPanelBody
          className="min-h-0 min-w-0 overflow-hidden"
          style={{ flex: MARKER_FLOW_MAP_HEIGHT_FRACTION }}
        >
          {mapBody}
        </TabPanelBody>
      )
      const gapSpacer = (
        <div
          className="shrink-0 bg-page"
          style={{ height: MARKER_FLOW_PANEL_GAP_PX }}
          aria-hidden
        />
      )
      const markerPanel = (
        <div
          className="flex min-h-0 min-w-0 flex-col"
          style={{ flex: MARKER_FLOW_PANEL_HEIGHT_FRACTION }}
        >
          <MarkerPanelColumn parentAsset={parentAsset} />
        </div>
      )

      if (tabConnected) {
        return (
          <>
            {mapPanel}
            {gapSpacer}
            {markerPanel}
          </>
        )
      }

      return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-page">
          {mapPanel}
          {gapSpacer}
          {markerPanel}
        </div>
      )
    },
    [isMarkerPanelOpen, isPublished, parentAsset],
  )

  const columnHeader = hideHeader ? null : (
    <>
      <MapHeader hideUserSection={isPublished} />
      {!isPublished ? <div className="h-4 shrink-0" aria-hidden /> : null}
    </>
  )

  const tabRowSpacer = isPublished ? null : (
    <div className="h-tab-row shrink-0 bg-page" aria-hidden />
  )

  if (isNewProject) {
    return (
      <div className={shellClass}>
        {columnHeader}
        <div className="flex min-h-0 flex-1 flex-col">
          {tabRowSpacer ?? <div className="h-tab-row shrink-0 bg-page" aria-hidden />}
          <TabPanelBody>
            <NewProjectOrganizationPicker />
          </TabPanelBody>
        </div>
      </div>
    )
  }

  if (project.projectType === 'FilesOnly') {
    return (
      <div className={shellClass}>
        {columnHeader}
        <div className="flex min-h-0 flex-1 flex-col">
          {tabRowSpacer ?? <div className="h-tab-row shrink-0 bg-page" aria-hidden />}
          <TabPanelBody>
            <FilesOnlyMapWorkspace
              onAddMap={handleAddMapToFilesOnlyProject}
              onAddFloorPlan={handleAddFloorPlanToFilesOnlyProject}
            />
          </TabPanelBody>
        </div>
      </div>
    )
  }

  if (project.projectType === 'Infrastructure') {
    const styleUrl = project.mapboxStyleUrl
    const activeStyleUrl =
      styleUrl != null ? resolveMapBaseStyleUrl(baseMapStyleId, styleUrl) : null
    const infrastructureMapBody = (
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        {activeStyleUrl != null ? (
          <>
            <InfrastructureMapStyleHeader
              selectedStyleId={baseMapStyleId}
              onStyleChange={setBaseMapStyleId}
              variant={variant}
              layoutMode={layoutMode}
            />
            <InfrastructureMapView
              styleUrl={activeStyleUrl}
              splitCommitToken={resizeToken + mapViewResizeToken}
              captureMarkers={displayCaptureMarkers}
              mapDrawnGeometries={mapDrawnGeometries}
              readOnly={readOnly}
            />
          </>
        ) : (
          <div
            className="flex min-h-0 flex-1 items-center justify-center bg-panel p-panel-padding font-sans text-standard text-fg-muted"
            role="region"
            aria-label="Map"
          >
            No map style configured for this project.
          </div>
        )}
      </div>
    )

    if (isPublished) {
      return <div className={shellClass}>{infrastructureMapBody}</div>
    }

    return (
      <div className={shellClass}>
        {columnHeader}
        <div className="flex min-h-0 flex-1 flex-col">
          {tabRowSpacer}
          {renderMapColumnBody(infrastructureMapBody)}
        </div>
      </div>
    )
  }

  const buildingMapBody = (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      {(isPublished || buildingTab === '2d') ? (
        <MapControlHeader
          floorPlanOptions={floorPlanOptions}
          selectedFloorId={hasFloorPlans ? floorPlanId : null}
          onFloorChange={setFloorPlanId}
          onAddFloorPlan={() => setFloorPlanViewMode('add')}
          showAddFloorPlan={!isPublished}
          variant={isPublished ? 'published' : 'editor'}
          layoutMode={isPublished ? layoutMode : 'full'}
        />
      ) : null}
      {!isPublished && buildingTab === '2d' && floorPlanViewMode === 'add' ? (
        <AddFloorPlanFlow
          onCancel={() => setFloorPlanViewMode('view')}
          onComplete={(firstAddedPlanId) => {
            setFloorPlanViewMode('view')
            setFloorPlanId(firstAddedPlanId)
          }}
        />
      ) : (isPublished || buildingTab === '2d') && !hasFloorPlans ? (
        <PanelCenteredPrompt aria-label="Floor plan viewer">
          {isPublished
            ? 'No floor plans are available for this published project.'
            : 'Add a floor plan to document this building. Use Add Floor Plan to upload PDF drawings.'}
        </PanelCenteredPrompt>
      ) : (
        <MapContent
          activeTab={isPublished ? '2d' : buildingTab}
          floorPlanId={floorPlanId}
          floorPlanSrc={floorPlanImageSrc(floorPlanId, userFloorPlans)}
          floorPlanLabel={floorPlanDisplayLabel(floorPlanId, userFloorPlans)}
          floorPlanMarkers={displayFloorPlanMarkers}
          floorDrawnGeometries={floorPlanDrawnGeometries}
          readOnly={readOnly}
          viewResizeToken={(isPublished ? resizeToken : 0) + mapViewResizeToken}
        />
      )}
    </div>
  )

  if (isPublished) {
    return <div className={shellClass}>{buildingMapBody}</div>
  }

  return (
    <div className={shellClass}>
      {columnHeader}
      <div className="flex min-h-0 flex-1 flex-col">
        <PanelTabRow
          tabs={buildingTabs}
          activeId={buildingTab}
          onSelect={setBuildingTab}
          aria-label="Map view mode"
        />
        {renderMapColumnBody(buildingMapBody, true)}
      </div>
    </div>
  )
}
