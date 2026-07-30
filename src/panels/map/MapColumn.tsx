import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'

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
import { MapMarkerResizeHandle } from '@/layout/MapMarkerResizeHandle'
import { MarkerPanelColumn } from '@/panels/map/MarkerPanelColumn'
import {
  MARKER_FLOW_DEFAULT_PANEL_RATIO,
  MARKER_FLOW_MAP_MIN_PX,
  MARKER_FLOW_PANEL_MIN_PX,
  MARKER_FLOW_RESIZE_HANDLE_HIT_PX,
} from '@/panels/map/mapOverlayLayout'

const buildingTabs: TabItem[] = [
  { id: '2d', label: 'Floor Plans' },
  { id: '3d', label: '3D Point Cloud' },
]

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}

function markerPanelPxFromRatio(available: number, ratio: number) {
  if (available <= 0) return 0
  const lo = MARKER_FLOW_PANEL_MIN_PX
  const hi = available - MARKER_FLOW_MAP_MIN_PX
  if (hi <= lo) return available / 2
  return clamp(lo, ratio * available, hi)
}

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
  const splitRef = useRef<HTMLDivElement>(null)
  const [splitHeight, setSplitHeight] = useState(0)
  const [markerPanelRatio, setMarkerPanelRatio] = useState(MARKER_FLOW_DEFAULT_PANEL_RATIO)
  const [markerSplitCommitToken, setMarkerSplitCommitToken] = useState(0)
  const prevMarkerPanelOpenRef = useRef(false)
  const { floorPlanId, setFloorPlanId } = useActiveFloorPlan()
  const [baseMapStyleId, setBaseMapStyleId] = useState<MapBaseStyleId>('default')

  const floorPlanOptions = useMemo(
    () => getFloorPlanOptionsForProject(projectId, userFloorPlans),
    [projectId, userFloorPlans],
  )
  const hasFloorPlans = floorPlanOptions.length > 0
  const isPublished = variant === 'published'

  useEffect(() => {
    setBaseMapStyleId('default')
    setFloorPlanViewMode('view')
    setBuildingBootstrap(null)
  }, [projectId])

  useLayoutEffect(() => {
    const el = splitRef.current
    if (el == null || !isMarkerPanelOpen || isPublished) return
    const measure = () => setSplitHeight(el.getBoundingClientRect().height)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [isMarkerPanelOpen, isPublished])

  useEffect(() => {
    const wasOpen = prevMarkerPanelOpenRef.current
    prevMarkerPanelOpenRef.current = isMarkerPanelOpen
    if (!wasOpen && isMarkerPanelOpen) {
      setMarkerPanelRatio(MARKER_FLOW_DEFAULT_PANEL_RATIO)
    }
  }, [isMarkerPanelOpen])

  const applyMarkerSplitClientY = useCallback((clientY: number) => {
    const el = splitRef.current
    if (el == null) return
    const rect = el.getBoundingClientRect()
    const avail = Math.max(0, rect.height - MARKER_FLOW_RESIZE_HANDLE_HIT_PX)
    if (avail <= 0) return
    const markerPx = markerPanelPxFromRatio(avail, (rect.bottom - clientY) / avail)
    setMarkerPanelRatio(markerPx / avail)
  }, [])

  const nudgeMarkerPanel = useCallback(
    (deltaPx: number) => {
      const el = splitRef.current
      if (el == null) return
      const rect = el.getBoundingClientRect()
      const avail = Math.max(0, rect.height - MARKER_FLOW_RESIZE_HANDLE_HIT_PX)
      if (avail <= 0) return
      const cur = markerPanelPxFromRatio(avail, markerPanelRatio)
      const next = markerPanelPxFromRatio(avail, (cur + deltaPx) / avail)
      setMarkerPanelRatio(next / avail)
    },
    [markerPanelRatio],
  )

  const onMarkerSplitDragEnd = useCallback(() => {
    setMarkerSplitCommitToken((t) => t + 1)
  }, [])

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

  const readOnly = isPublished
  const shellClass = isPublished
    ? 'flex h-full min-h-0 min-w-0 flex-col'
    : 'flex h-full min-h-[680px] min-w-0 flex-col'
  const resizeToken = isPublished ? layoutModeToken : splitCommitToken
  const mapViewResizeToken =
    isMarkerPanelOpen && !isPublished
      ? markerFlowResizeToken + markerSplitCommitToken
      : 0

  const availableSplitHeight = Math.max(0, splitHeight - MARKER_FLOW_RESIZE_HANDLE_HIT_PX)
  const markerPanelPx = markerPanelPxFromRatio(availableSplitHeight, markerPanelRatio)
  const mapPanelPx = availableSplitHeight - markerPanelPx

  const renderMapColumnBody = useCallback(
    (mapBody: ReactNode, tabConnected = false) => {
      if (!isMarkerPanelOpen || isPublished) {
        return <TabPanelBody>{mapBody}</TabPanelBody>
      }

      const mapPanelStyle =
        splitHeight > 0
          ? { height: mapPanelPx, flexShrink: 0 as const }
          : { flex: 1 - MARKER_FLOW_DEFAULT_PANEL_RATIO }

      const markerPanelStyle =
        splitHeight > 0
          ? { height: markerPanelPx, flexShrink: 0 as const }
          : { flex: MARKER_FLOW_DEFAULT_PANEL_RATIO }

      const mapPanel = (
        <TabPanelBody className="min-h-0 min-w-0 overflow-hidden" style={mapPanelStyle}>
          {mapBody}
        </TabPanelBody>
      )
      const resizeHandle = (
        <MapMarkerResizeHandle
          onDrag={applyMarkerSplitClientY}
          onNudge={nudgeMarkerPanel}
          onDragEnd={onMarkerSplitDragEnd}
        />
      )
      const markerPanel = (
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden" style={markerPanelStyle}>
          <MarkerPanelColumn parentAsset={parentAsset} />
        </div>
      )

      const splitBody = (
        <>
          {mapPanel}
          {resizeHandle}
          {markerPanel}
        </>
      )

      if (tabConnected) {
        return (
          <div
            ref={splitRef}
            className="flex min-h-0 min-w-0 flex-1 flex-col bg-page"
          >
            {splitBody}
          </div>
        )
      }

      return (
        <div ref={splitRef} className="flex min-h-0 min-w-0 flex-1 flex-col bg-page">
          {splitBody}
        </div>
      )
    },
    [
      applyMarkerSplitClientY,
      isMarkerPanelOpen,
      isPublished,
      mapPanelPx,
      markerPanelPx,
      nudgeMarkerPanel,
      onMarkerSplitDragEnd,
      parentAsset,
      splitHeight,
    ],
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
