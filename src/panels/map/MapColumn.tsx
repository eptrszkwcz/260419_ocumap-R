import { useEffect, useMemo, useState } from 'react'

import { PanelTabRow, type TabItem } from '@/components/PanelTabRow'
import { TabPanelBody } from '@/components/TabPanelBody'
import { useActiveProject } from '@/context/ActiveProjectContext'
import { useFeatureMapHover } from '@/context/FeatureMapHoverContext'
import { useFloorPlanLocationPick } from '@/context/FloorPlanLocationPickContext'
import { useMapCaptureMarkers } from '@/context/MapCaptureMarkersContext'
import { useMapLocationPick } from '@/context/MapLocationPickContext'
import { useMarkerStylePreview } from '@/context/MarkerStylePreviewContext'

import { NewProjectOrganizationPicker } from '@/panels/library/newProject/NewProjectOrganizationPicker'
import { InfrastructureMapView } from '@/panels/map/InfrastructureMapView'
import { MapContent } from '@/panels/map/MapContent'
import { MapControlHeader } from '@/panels/map/MapControlHeader'
import { MapHeader } from '@/panels/map/MapHeader'
import {
  DEFAULT_FLOOR_PLAN_ID,
  type FloorPlanId,
  floorPlanDisplayLabel,
  floorPlanImageSrc,
  getFloorPlanOptionsForProject,
} from '@/panels/map/mapFloorPlans'
import {
  mergeCaptureMarkerPreview,
  mergeCaptureMarkerStylePreview,
  mergeFloorPlanMarkerPreview,
  mergeFloorPlanMarkerStylePreview,
} from '@/panels/map/mergeLocationPickPreviews'

const buildingTabs: TabItem[] = [
  { id: '2d', label: 'Floor Plans' },
  { id: '3d', label: '3D Point Cloud' },
]

type MapColumnProps = {
  /** Incremented when the library/map splitter drag ends; infrastructure Mapbox runs a final `resize()`. */
  splitCommitToken?: number
}

export function MapColumn({ splitCommitToken = 0 }: MapColumnProps) {
  const { project, projectId, isNewProject } = useActiveProject()
  const { captureMarkers, floorPlanMarkers } = useMapCaptureMarkers()
  const { locationPickPreview } = useMapLocationPick()
  const { floorPlanPickPreview } = useFloorPlanLocationPick()
  const { markerStylePreview } = useMarkerStylePreview()
  const { openedFeatureId, linkedFeatureId } = useFeatureMapHover()
  const [buildingTab, setBuildingTab] = useState('2d')
  const [floorPlanId, setFloorPlanId] = useState<FloorPlanId>(DEFAULT_FLOOR_PLAN_ID)

  const floorPlanOptions = useMemo(
    () => getFloorPlanOptionsForProject(projectId),
    [projectId],
  )
  const hasFloorPlans = floorPlanOptions.length > 0

  useEffect(() => {
    if (!hasFloorPlans) return
    if (!floorPlanOptions.some((o) => o.id === floorPlanId)) {
      setFloorPlanId(floorPlanOptions[0].id)
    }
  }, [floorPlanOptions, floorPlanId, hasFloorPlans, projectId])

  const displayCaptureMarkers = useMemo(() => {
    const withLocation = mergeCaptureMarkerPreview(captureMarkers, locationPickPreview)
    return mergeCaptureMarkerStylePreview(withLocation, markerStylePreview)
  }, [captureMarkers, locationPickPreview, markerStylePreview])

  const displayFloorPlanMarkers = useMemo(() => {
    const withLocation = mergeFloorPlanMarkerPreview(floorPlanMarkers, floorPlanPickPreview)
    return mergeFloorPlanMarkerStylePreview(withLocation, markerStylePreview)
  }, [floorPlanMarkers, floorPlanPickPreview, markerStylePreview])

  useEffect(() => {
    if (floorPlanPickPreview == null) return
    if (!hasFloorPlans) return
    setFloorPlanId((current) =>
      floorPlanPickPreview.floorPlanId !== current ? floorPlanPickPreview.floorPlanId : current,
    )
  }, [floorPlanPickPreview, hasFloorPlans])

  useEffect(() => {
    const targetFeatureId = openedFeatureId ?? linkedFeatureId
    if (targetFeatureId == null) return
    if (!hasFloorPlans) return
    const marker = displayFloorPlanMarkers.find((m) => m.id === targetFeatureId)
    if (marker == null) return
    setFloorPlanId((current) =>
      marker.floorPlanId !== current ? marker.floorPlanId : current,
    )
  }, [openedFeatureId, linkedFeatureId, displayFloorPlanMarkers, hasFloorPlans])

  if (isNewProject) {
    return (
      <div className="flex h-full min-h-[680px] min-w-0 flex-col">
        <MapHeader />
        <div className="h-4 shrink-0" aria-hidden />
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="h-tab-row shrink-0 bg-page" aria-hidden />
          <TabPanelBody>
            <NewProjectOrganizationPicker />
          </TabPanelBody>
        </div>
      </div>
    )
  }

  if (project.projectType === 'FilesOnly') {
    return (
      <div className="flex h-full min-h-[680px] min-w-0 flex-col">
        <MapHeader />
        <div className="h-4 shrink-0" aria-hidden />
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="h-tab-row shrink-0 bg-page" aria-hidden />
          <TabPanelBody>
            <div
              className="flex min-h-0 flex-1 flex-col items-center justify-center bg-panel p-panel-padding text-center font-sans text-standard text-fg-muted"
              role="region"
              aria-label="Project files workspace"
            >
              <p className="max-w-md leading-relaxed">
                This project is organized around files. Add photos, videos, and documents from the
                Feature Library tab.
              </p>
            </div>
          </TabPanelBody>
        </div>
      </div>
    )
  }

  if (project.projectType === 'Infrastructure') {
    const styleUrl = project.mapboxStyleUrl
    return (
      <div className="flex h-full min-h-[680px] min-w-0 flex-col">
        <MapHeader />
        <div className="h-4 shrink-0" aria-hidden />
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Reserve tab-row height so the map panel lines up with building projects (tabs above body). */}
          <div className="h-tab-row shrink-0 bg-page" aria-hidden />
          <TabPanelBody>
            <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
              {styleUrl != null ? (
                <InfrastructureMapView
                  styleUrl={styleUrl}
                  splitCommitToken={splitCommitToken}
                  captureMarkers={displayCaptureMarkers}
                />
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
          </TabPanelBody>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-[680px] min-w-0 flex-col">
      <MapHeader />
      <div className="h-4 shrink-0" aria-hidden />
      <div className="flex min-h-0 flex-1 flex-col">
        <PanelTabRow
          tabs={buildingTabs}
          activeId={buildingTab}
          onSelect={setBuildingTab}
          aria-label="Map view mode"
        />
        <TabPanelBody>
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            {buildingTab === '2d' ? (
              <MapControlHeader
                floorPlanOptions={floorPlanOptions}
                selectedFloorId={hasFloorPlans ? floorPlanId : null}
                onFloorChange={setFloorPlanId}
              />
            ) : null}
            {buildingTab === '2d' && !hasFloorPlans ? (
              <div
                className="flex min-h-0 flex-1 flex-col items-center justify-center bg-panel p-panel-padding text-center font-sans text-standard text-fg-muted"
                role="region"
                aria-label="Floor plan viewer"
              >
                <p className="max-w-md leading-relaxed">
                  No floor plans yet. Use Add Floor Plan to upload drawings for this project.
                </p>
              </div>
            ) : (
              <MapContent
                activeTab={buildingTab}
                floorPlanId={floorPlanId}
                floorPlanSrc={floorPlanImageSrc(floorPlanId)}
                floorPlanLabel={floorPlanDisplayLabel(floorPlanId)}
                floorPlanMarkers={displayFloorPlanMarkers}
              />
            )}
          </div>
        </TabPanelBody>
      </div>
    </div>
  )
}
