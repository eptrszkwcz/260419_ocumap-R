import { ActiveProjectProvider } from '@/context/ActiveProjectContext'
import { MapCaptureMarkersProvider } from '@/context/MapCaptureMarkersContext'
import { MapLocationPickProvider } from '@/context/MapLocationPickContext'
import { ProjectsDrawerProvider } from '@/context/ProjectsDrawerContext'
import { DashboardLayout } from '@/layout/DashboardLayout'
import { ProjectsDrawerFromLibrary } from '@/panels/library/ProjectsDrawerFromLibrary'

export function LibraryPage() {
  return (
    <ProjectsDrawerProvider>
      <ActiveProjectProvider>
        <MapLocationPickProvider>
          <MapCaptureMarkersProvider>
            <div className="h-full min-h-0">
              <DashboardLayout />
            </div>
            <ProjectsDrawerFromLibrary />
          </MapCaptureMarkersProvider>
        </MapLocationPickProvider>
      </ActiveProjectProvider>
    </ProjectsDrawerProvider>
  )
}
