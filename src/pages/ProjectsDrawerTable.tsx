import { useNavigate, useSearchParams } from 'react-router-dom'

import {
  DEMO_OPENS_LIBRARY_PROJECT_ID,
  NEW_PROJECT_ID,
  type ProjectRecord,
} from '@/data/sampleProjects'
import { useProjects } from '@/context/ProjectsContext'
import { ProjectsListHeader, ProjectsListRows } from '@/pages/projectsListPresentation'

type ProjectsDrawerTableProps = {
  projects: ProjectRecord[]
  onCloseDrawer: () => void
}

/**
 * Projects list in the library slide-out: same card styling as the full page, name + actions only.
 */
export function ProjectsDrawerTable({ projects, onCloseDrawer }: ProjectsDrawerTableProps) {
  const navigate = useNavigate()
  const { getProjectById } = useProjects()
  const [searchParams] = useSearchParams()
  const paramId = searchParams.get('project')?.trim()
  const fromQuery =
    paramId != null && paramId !== '' && paramId !== NEW_PROJECT_ID
      ? getProjectById(paramId)
      : undefined
  const activeProjectId = fromQuery?.id ?? DEMO_OPENS_LIBRARY_PROJECT_ID

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-auto bg-page pb-panel-padding">
      <ProjectsListHeader layout="drawer" />
      <ProjectsListRows
        layout="drawer"
        projects={projects}
        rowProps={(project) => {
          const isCurrent = project.id === activeProjectId
          return {
            onActivate: () => {
              if (isCurrent) {
                onCloseDrawer()
                return
              }
              navigate(`/library?project=${encodeURIComponent(project.id)}`)
              onCloseDrawer()
            },
            isCurrent,
            ariaLabel: isCurrent
              ? `Current project ${project.name}, close list`
              : `Open ${project.name} in library`,
          }
        }}
      />
    </div>
  )
}
