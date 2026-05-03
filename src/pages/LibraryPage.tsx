import { ProjectsDrawerProvider } from '@/context/ProjectsDrawerContext'
import { DashboardLayout } from '@/layout/DashboardLayout'
import { ProjectsDrawerFromLibrary } from '@/panels/library/ProjectsDrawerFromLibrary'

export function LibraryPage() {
  return (
    <ProjectsDrawerProvider>
      <div className="h-full min-h-0">
        <DashboardLayout />
      </div>
      <ProjectsDrawerFromLibrary />
    </ProjectsDrawerProvider>
  )
}
