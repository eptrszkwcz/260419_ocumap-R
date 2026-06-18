import { ActiveFloorPlanProvider } from '@/context/ActiveFloorPlanContext'
import { ActiveProjectProvider } from '@/context/ActiveProjectContext'
import { FeatureMapHoverProvider } from '@/context/FeatureMapHoverContext'
import { MarkerStylePreviewProvider } from '@/context/MarkerStylePreviewContext'
import { MapCaptureMarkersProvider } from '@/context/MapCaptureMarkersContext'
import { FeatureDrawProvider } from '@/context/FeatureDrawContext'
import { FloorPlanLocationPickProvider } from '@/context/FloorPlanLocationPickContext'
import { MapLocationPickProvider } from '@/context/MapLocationPickContext'
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
              <MarkerStylePreviewProvider>
                <MapCaptureMarkersProvider>
                  <FeatureMapHoverProvider>
                    <ActiveFloorPlanProvider>
                      <div className="h-full min-h-0">
                        <DashboardLayout />
                      </div>
                      <ProjectsDrawerFromLibrary />
                    </ActiveFloorPlanProvider>
                  </FeatureMapHoverProvider>
                </MapCaptureMarkersProvider>
              </MarkerStylePreviewProvider>
            </FeatureDrawProvider>
          </FloorPlanLocationPickProvider>
        </MapLocationPickProvider>
      </ActiveProjectProvider>
    </ProjectsDrawerProvider>
  )
}
