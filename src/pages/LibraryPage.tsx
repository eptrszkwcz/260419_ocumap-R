import { ActiveFloorPlanProvider } from '@/context/ActiveFloorPlanContext'
import { ActiveProjectProvider } from '@/context/ActiveProjectContext'
import { ProjectFloorPlansProvider } from '@/context/ProjectFloorPlansContext'
import { FeatureMapHoverProvider } from '@/context/FeatureMapHoverContext'
import { MarkerStylePreviewProvider } from '@/context/MarkerStylePreviewContext'
import { MapCaptureMarkersProvider } from '@/context/MapCaptureMarkersContext'
import { FeatureDrawProvider } from '@/context/FeatureDrawContext'
import { FloorPlanLocationPickProvider } from '@/context/FloorPlanLocationPickContext'
import { MapLocationPickProvider } from '@/context/MapLocationPickContext'
import { MediaMarkerFlowProvider } from '@/context/MediaMarkerFlowContext'
import { ViewDirectionAdjustProvider } from '@/context/ViewDirectionAdjustContext'
import { ProjectsDrawerProvider } from '@/context/ProjectsDrawerContext'
import { DashboardLayout } from '@/layout/DashboardLayout'
import { ProjectsDrawerFromLibrary } from '@/panels/library/ProjectsDrawerFromLibrary'

export function LibraryPage() {
  return (
    <ProjectsDrawerProvider>
      <ActiveProjectProvider>
        <MapLocationPickProvider>
          <FloorPlanLocationPickProvider>
            <FeatureDrawProvider>
              <MediaMarkerFlowProvider>
              <MarkerStylePreviewProvider>
                <MapCaptureMarkersProvider>
                  <FeatureMapHoverProvider>
                    <ViewDirectionAdjustProvider>
                    <ProjectFloorPlansProvider>
                      <ActiveFloorPlanProvider>
                        <div className="h-full min-h-0">
                          <DashboardLayout />
                        </div>
                        <ProjectsDrawerFromLibrary />
                      </ActiveFloorPlanProvider>
                    </ProjectFloorPlansProvider>
                    </ViewDirectionAdjustProvider>
                  </FeatureMapHoverProvider>
                </MapCaptureMarkersProvider>
              </MarkerStylePreviewProvider>
              </MediaMarkerFlowProvider>
            </FeatureDrawProvider>
          </FloorPlanLocationPickProvider>
        </MapLocationPickProvider>
      </ActiveProjectProvider>
    </ProjectsDrawerProvider>
  )
}
