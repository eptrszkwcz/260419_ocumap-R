import { ActiveProjectProvider } from '@/context/ActiveProjectContext'
import { FeatureMapHoverProvider } from '@/context/FeatureMapHoverContext'
import { MapCaptureMarkersProvider } from '@/context/MapCaptureMarkersContext'
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
            <MapCaptureMarkersProvider>
              <FeatureMapHoverProvider>
                <div className="h-full min-h-0">
                  <DashboardLayout />
                </div>
                <ProjectsDrawerFromLibrary />
              </FeatureMapHoverProvider>
            </MapCaptureMarkersProvider>
          </FloorPlanLocationPickProvider>
        </MapLocationPickProvider>
      </ActiveProjectProvider>
    </ProjectsDrawerProvider>
  )
}
