import { useNavigate } from 'react-router-dom'

import { DEMO_OPENS_LIBRARY_PROJECT_ID, type ProjectRecord } from '@/data/sampleProjects'

function MoreVerticalIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="8" cy="3" r="1.5" fill="currentColor" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
      <circle cx="8" cy="13" r="1.5" fill="currentColor" />
    </svg>
  )
}

function ProjectTableRow({ project }: { project: ProjectRecord }) {
  const navigate = useNavigate()
  const opensLibrary = project.id === DEMO_OPENS_LIBRARY_PROJECT_ID

  const openInLibrary = () => {
    if (opensLibrary) navigate('/library')
  }

  return (
    <tr
      className={
        'group h-10 border-b-[0.5px] border-solid border-stroke font-normal transition-colors hover:bg-area-highlight hover:font-semibold ' +
        (opensLibrary ? 'cursor-pointer' : '')
      }
      onClick={opensLibrary ? openInLibrary : undefined}
      onKeyDown={
        opensLibrary
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                openInLibrary()
              }
            }
          : undefined
      }
      tabIndex={opensLibrary ? 0 : undefined}
      aria-label={opensLibrary ? `Open ${project.name} in library` : undefined}
    >
      <td className="min-w-0 pl-panel-padding pr-4 align-middle text-fg-muted group-hover:text-fg-highlight">
        <span className="block truncate">{project.name}</span>
      </td>
      <td className="min-w-0 pl-0 pr-4 align-middle text-fg-muted group-hover:text-fg-highlight">
        <span className="block truncate">{project.owner}</span>
      </td>
      <td className="pl-0 pr-4 align-middle text-fg-muted group-hover:text-fg-highlight whitespace-nowrap">
        {project.lastEdited}
      </td>
      <td className="pl-0 pr-4 align-middle text-fg-muted group-hover:text-fg-highlight whitespace-nowrap">
        {project.projectType}
      </td>
      <td className="pl-0 pr-panel-padding text-right align-middle">
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="text-fg-muted group-hover:text-fg-highlight inline-flex h-8 w-8 items-center justify-center rounded-panel align-middle transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/40 focus-visible:outline-none"
          aria-label={`Actions for ${project.name}`}
        >
          <MoreVerticalIcon />
        </button>
      </td>
    </tr>
  )
}

type ProjectsTableProps = {
  projects: ProjectRecord[]
}

/**
 * Project directory: name, owner, last edited, type, actions. Matches feature library table density and hover.
 */
export function ProjectsTable({ projects }: ProjectsTableProps) {
  return (
    <div className="min-h-0 w-full min-w-0 flex-1 overflow-auto px-0">
      <table className="w-full min-w-0 table-fixed border-collapse text-left font-sans text-standard">
        <colgroup>
          <col />
          <col style={{ width: '200px' }} />
          <col style={{ width: '9.5rem' }} />
          <col style={{ width: '8.5rem' }} />
          <col style={{ width: '2.25rem' }} />
        </colgroup>
        <thead>
          <tr className="h-10 border-b border-solid border-fg-muted">
            <th className="pl-panel-padding pr-4 text-left font-bold text-fg" scope="col">
              Project name
            </th>
            <th className="pl-0 pr-4 text-left font-bold text-fg" scope="col">
              Owner
            </th>
            <th className="pl-0 pr-4 font-bold text-fg" scope="col">
              Last edited
            </th>
            <th className="pl-0 pr-4 font-bold text-fg" scope="col">
              Type
            </th>
            <th
              className="pr-panel-padding pl-0 text-right font-bold"
              scope="col"
              aria-label="Actions"
            >
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <ProjectTableRow key={project.id} project={project} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
