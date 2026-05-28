import { BuildingOfficeIcon, TruckIcon } from '@heroicons/react/24/outline'

import { type ProjectRecord, type ProjectStatus, type ProjectType } from '@/data/sampleProjects'

const projectStatusBadgeBaseClass =
  'inline-flex h-badge min-h-badge max-h-badge shrink-0 items-center justify-center rounded-panel px-2 text-badge font-bold leading-none'

function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  if (status === 'Published') {
    return (
      <span
        className={
          projectStatusBadgeBaseClass +
          ' bg-[#FFAA1D]/20 text-[#B87A12] group-hover:bg-[#FFAA1D]/28'
        }
      >
        Published
      </span>
    )
  }
  return (
    <span
      className={
        projectStatusBadgeBaseClass +
        ' text-fg-highlight bg-fg-highlight/12 group-hover:bg-fg-highlight/18'
      }
    >
      Draft
    </span>
  )
}

export type ProjectsListLayout = 'full' | 'drawer'

export function MoreVerticalIcon({ className = '' }: { className?: string }) {
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

/** Full page: name (+ team subtitle), status, last modified, files, created, type icon, actions */
export const projectsGridClass =
  'grid w-full min-w-0 grid-cols-[minmax(0,1.4fr)_minmax(0,5.75rem)_minmax(0,7.5rem)_minmax(0,3.25rem)_minmax(0,5.5rem)_2.5rem_2.25rem] items-center gap-x-3'

function ProjectNameCell({ name, team }: { name: string; team: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 py-0.5">
      <span className="truncate text-[16px] leading-[1.2] font-bold text-fg group-hover:text-fg-highlight">
        {name}
      </span>
      <span className="truncate text-[12px] leading-[1.2] text-fg-muted group-hover:text-fg-highlight">
        {team}
      </span>
    </div>
  )
}

/** Drawer: name + kebab only */
export const projectsGridDrawerClass =
  'grid w-full min-w-0 grid-cols-[minmax(0,1fr)_2.25rem] items-center gap-x-3'

function gridClassForLayout(layout: ProjectsListLayout) {
  return layout === 'drawer' ? projectsGridDrawerClass : projectsGridClass
}

export function ProjectsListHeader({ layout = 'full' }: { layout?: ProjectsListLayout }) {
  const grid = gridClassForLayout(layout)
  if (layout === 'drawer') {
    return (
      <div
        className={`${grid} shrink-0 px-panel-padding pb-2 pt-1 font-sans text-standard font-bold text-fg-muted`}
      >
        <div className="min-w-0">Name</div>
        <div className="sr-only text-right">Actions</div>
      </div>
    )
  }
  return (
    <div
      className={`${grid} shrink-0 px-panel-padding pb-2 pt-1 font-sans text-standard font-bold text-fg-muted`}
    >
      <div className="min-w-0">Name</div>
      <div className="min-w-0">Status</div>
      <div className="whitespace-nowrap">Last Modified</div>
      <div className="whitespace-nowrap">Files</div>
      <div className="whitespace-nowrap">Created</div>
      <div className="sr-only">Type</div>
      <div className="sr-only text-right">Actions</div>
    </div>
  )
}

type ProjectCardRowProps = {
  project: ProjectRecord
  layout?: ProjectsListLayout
  onActivate: () => void
  isCurrent?: boolean
  ariaLabel: string
}

export function ProjectCardRow({
  project,
  layout = 'full',
  onActivate,
  isCurrent = false,
  ariaLabel,
}: ProjectCardRowProps) {
  const grid = gridClassForLayout(layout)

  return (
    <div
      role="button"
      tabIndex={0}
      className={
        'group box-border flex min-h-[72px] cursor-pointer items-center rounded-panel border border-transparent bg-panel py-3 font-sans text-standard font-normal transition-colors hover:border-fg-highlight hover:bg-area-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-highlight/40 ' +
        (isCurrent ? 'ring-1 ring-inset ring-fg-highlight/30 ' : '')
      }
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onActivate()
        }
      }}
      aria-label={ariaLabel}
    >
      <div className={`${grid} min-w-0 px-panel-padding`}>
        <ProjectNameCell name={project.name} team={project.team} />
        {layout === 'full' ? (
          <>
            <span className="min-w-0">
              <ProjectStatusBadge status={project.status} />
            </span>
            <span className="truncate whitespace-nowrap text-fg-muted group-hover:text-fg-highlight">
              {project.lastModified}
            </span>
            <span className="tabular-nums whitespace-nowrap text-fg-muted group-hover:text-fg-highlight">
              {project.featureFileCount.toLocaleString()}
            </span>
            <span className="truncate whitespace-nowrap text-fg-muted group-hover:text-fg-highlight">
              {project.createdRelative}
            </span>
            <span className="flex justify-center">
              <ProjectTypeIcon type={project.projectType} />
            </span>
          </>
        ) : null}
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

/** Scrollable list body: same gap and cards as the full projects page. */
export function ProjectsListRows({
  projects,
  layout = 'full',
  rowProps,
}: {
  projects: ProjectRecord[]
  layout?: ProjectsListLayout
  rowProps: (project: ProjectRecord) => {
    onActivate: () => void
    isCurrent?: boolean
    ariaLabel: string
  }
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[16px]">
      {projects.map((project) => {
        const { onActivate, isCurrent, ariaLabel } = rowProps(project)
        return (
          <ProjectCardRow
            key={project.id}
            project={project}
            layout={layout}
            onActivate={onActivate}
            isCurrent={isCurrent}
            ariaLabel={ariaLabel}
          />
        )
      })}
    </div>
  )
}
