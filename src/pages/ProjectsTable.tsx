import { BuildingOfficeIcon, TruckIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

import { type ProjectRecord, type ProjectType } from '@/data/sampleProjects'

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

const typeIconClass = 'size-5 shrink-0'

function ProjectTypeIcon({ type }: { type: ProjectType }) {
  const label = type === 'Building' ? 'Building project' : 'Infrastructure project'
  if (type === 'Infrastructure') {
    return (
      <span className="inline-flex shrink-0 text-fg-muted group-hover:text-fg-highlight" title={label}>
        <TruckIcon className={typeIconClass} aria-hidden />
        <span className="sr-only">{label}</span>
      </span>
    )
  }
  return (
    <span className="inline-flex shrink-0 text-fg-muted group-hover:text-fg-highlight" title={label}>
      <BuildingOfficeIcon className={typeIconClass} aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  )
}

/** Shared grid: name, team, last modified, created, type icon, actions */
const projectsGridClass =
  'grid w-full min-w-0 grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,7.5rem)_minmax(0,5.5rem)_2.5rem_2.25rem] items-center gap-x-3'

function ProjectCardRow({ project }: { project: ProjectRecord }) {
  const navigate = useNavigate()

  const openInLibrary = () => {
    navigate(`/library?project=${encodeURIComponent(project.id)}`)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={
        'group box-border flex h-16 min-h-16 cursor-pointer items-center rounded-panel bg-panel font-normal transition-colors hover:bg-area-highlight hover:font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-highlight/40'
      }
      onClick={openInLibrary}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openInLibrary()
        }
      }}
      aria-label={`Open ${project.name} in library`}
    >
      <div className={`${projectsGridClass} min-w-0 px-panel-padding`}>
        <span className="min-w-0 truncate font-bold text-fg group-hover:text-fg-highlight">{project.name}</span>
        <span className="min-w-0 truncate text-fg-muted group-hover:text-fg-highlight">{project.team}</span>
        <span className="truncate whitespace-nowrap text-fg-muted group-hover:text-fg-highlight">
          {project.lastModified}
        </span>
        <span className="truncate whitespace-nowrap text-fg-muted group-hover:text-fg-highlight">
          {project.createdRelative}
        </span>
        <span className="flex justify-center">
          <ProjectTypeIcon type={project.projectType} />
        </span>
        <span className="flex justify-end">
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="text-fg-muted group-hover:text-fg-highlight inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-panel align-middle transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/40 focus-visible:outline-none"
            aria-label={`Actions for ${project.name}`}
          >
            <MoreVerticalIcon />
          </button>
        </span>
      </div>
    </div>
  )
}

type ProjectsTableProps = {
  projects: ProjectRecord[]
}

/**
 * Project directory as card rows (64px): name, team, last modified, created, type icon, actions.
 */
export function ProjectsTable({ projects }: ProjectsTableProps) {
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-auto bg-page pb-panel-padding">
      <div
        className={`${projectsGridClass} shrink-0 px-panel-padding pb-2 pt-1 font-sans text-standard font-bold text-fg-muted`}
      >
        <div className="min-w-0">Name</div>
        <div className="min-w-0">Team</div>
        <div className="whitespace-nowrap">Last Modified</div>
        <div className="whitespace-nowrap">Created</div>
        <div className="sr-only">Type</div>
        <div className="sr-only text-right">Actions</div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-[16px]">
        {projects.map((project) => (
          <ProjectCardRow key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
