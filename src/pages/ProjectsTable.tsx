import { useNavigate } from 'react-router-dom'

import { type ProjectRecord } from '@/data/sampleProjects'
import { ProjectsListHeader, ProjectsListRows } from '@/pages/projectsListPresentation'

type ProjectsTableProps = {
  projects: ProjectRecord[]
}

/**
 * Project directory as card rows: name (with type tag), team, dates, status, actions.
 */
export function ProjectsTable({ projects }: ProjectsTableProps) {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-auto bg-page pb-panel-padding">
      <ProjectsListHeader />
      <ProjectsListRows
        projects={projects}
        rowProps={(project) => ({
          onActivate: () => {
            navigate(`/library?project=${encodeURIComponent(project.id)}`)
          },
          isCurrent: false,
          ariaLabel: `Open ${project.name} in library`,
        })}
      />
    </div>
  )
}
