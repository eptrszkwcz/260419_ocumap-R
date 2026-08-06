import type { CSSProperties } from 'react'

import { SortableColumnHeader, type SortDirection } from '@/components/SortableColumnHeader'
import { type ProjectRecord, type ProjectType } from '@/data/sampleProjects'
import { formatBytes } from '@/lib/formatBytes'
import {
  PROJECT_LIST_COLUMN_ORDER,
  projectColumnDefinitions,
  projectsListGridStyle,
  type ProjectListColumnId,
} from '@/pages/projects/projectListColumns'
import { ProjectRowMenu } from '@/pages/projects/ProjectRowMenu'
import { ProjectStatusBadge } from '@/pages/projects/ProjectStatusBadge'
import type { ProjectListSortColumn } from '@/pages/projects/sortProjects'

const projectStatusBadgeBaseClass =
  'inline-flex shrink-0 items-center justify-center rounded-panel px-2 py-1 text-badge font-bold leading-none'

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

function ProjectTypeTag({ type }: { type: ProjectType }) {
  const label =
    type === 'Building' ? 'Floor Plan' : type === 'Infrastructure' ? 'Map' : 'Files Only'
  return (
    <span
      className={
        projectStatusBadgeBaseClass +
        ' text-fg-muted bg-area-highlight group-hover:bg-fg-highlight/12 group-hover:text-fg-highlight'
      }
    >
      {label}
    </span>
  )
}

/** Full page grid: name pinned; optional columns supplied via `visibleColumns`. */
export const projectsListGridClass =
  'grid w-full min-w-0 items-center gap-x-4'

function fullPageGridStyle(visibleColumns: ProjectListColumnId[]): CSSProperties {
  return projectsListGridStyle(visibleColumns)
}

function formatProjectSizeMb(sizeMb: number): string {
  return formatBytes(sizeMb * 1024 * 1024)
}

function ProjectNameCell({
  name,
  team,
  projectType,
}: {
  name: string
  team: string
  projectType: ProjectType
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 py-0.5">
      <div className="flex min-w-0 items-center gap-2">
        <span className="min-w-0 truncate text-[16px] leading-[1.2] font-bold text-fg group-hover:text-fg-highlight">
          {name}
        </span>
        <ProjectTypeTag type={projectType} />
      </div>
      <span className="truncate text-[12px] leading-[1.2] text-fg-muted group-hover:text-fg-highlight">
        {team}
      </span>
    </div>
  )
}

/** Drawer: name + kebab only */
export const projectsGridDrawerClass =
  'grid w-full min-w-0 grid-cols-[minmax(0,1fr)_2.25rem] items-center gap-x-4'

function gridClassForLayout(layout: ProjectsListLayout) {
  return layout === 'drawer' ? projectsGridDrawerClass : projectsListGridClass
}

function ProjectListColumnCell({
  columnId,
  project,
}: {
  columnId: ProjectListColumnId
  project: ProjectRecord
}) {
  switch (columnId) {
    case 'lastModified':
      return (
        <span className="truncate whitespace-nowrap text-fg-muted group-hover:text-fg-highlight">
          {project.lastModified}
        </span>
      )
    case 'files':
      return (
        <span className="tabular-nums whitespace-nowrap text-fg-muted group-hover:text-fg-highlight">
          {project.featureFileCount.toLocaleString()}
        </span>
      )
    case 'size':
      return (
        <span className="tabular-nums whitespace-nowrap text-fg-muted group-hover:text-fg-highlight">
          {formatProjectSizeMb(project.projectSizeMb)}
        </span>
      )
    case 'status':
      return (
        <span className="min-w-0">
          <ProjectStatusBadge status={project.status} publishedDate={project.publishedDate} />
        </span>
      )
  }
}

export function ProjectsListHeader({
  layout = 'full',
  visibleColumns = PROJECT_LIST_COLUMN_ORDER,
  sortColumn,
  sortDirection,
  onSortColumn,
}: {
  layout?: ProjectsListLayout
  visibleColumns?: ProjectListColumnId[]
  sortColumn?: ProjectListSortColumn
  sortDirection?: SortDirection
  onSortColumn?: (column: ProjectListSortColumn) => void
}) {
  const grid = gridClassForLayout(layout)
  const sortable = sortColumn != null && sortDirection != null && onSortColumn != null
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
      style={fullPageGridStyle(visibleColumns)}
    >
      {sortable ? (
        <SortableColumnHeader
          label="Name"
          activeDirection={sortColumn === 'name' ? sortDirection : null}
          onSort={() => onSortColumn('name')}
          className="text-fg-muted hover:text-fg-highlight"
        />
      ) : (
        <div className="min-w-0">Name</div>
      )}
      {visibleColumns.map((columnId) =>
        sortable ? (
          <SortableColumnHeader
            key={columnId}
            label={projectColumnDefinitions[columnId].label}
            activeDirection={sortColumn === columnId ? sortDirection : null}
            onSort={() => onSortColumn(columnId)}
            className="text-fg-muted hover:text-fg-highlight whitespace-nowrap"
          />
        ) : (
          <div key={columnId} className="min-w-0 whitespace-nowrap">
            {projectColumnDefinitions[columnId].label}
          </div>
        ),
      )}
      <div className="sr-only text-right">Actions</div>
    </div>
  )
}

type ProjectCardRowProps = {
  project: ProjectRecord
  layout?: ProjectsListLayout
  visibleColumns?: ProjectListColumnId[]
  onActivate: () => void
  isCurrent?: boolean
  ariaLabel: string
}

export function ProjectCardRow({
  project,
  layout = 'full',
  visibleColumns = PROJECT_LIST_COLUMN_ORDER,
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
      <div
        className={`${grid} min-w-0 px-panel-padding`}
        style={layout === 'full' ? fullPageGridStyle(visibleColumns) : undefined}
      >
        <ProjectNameCell
          name={project.name}
          team={project.team}
          projectType={project.projectType}
        />
        {layout === 'full'
          ? visibleColumns.map((columnId) => (
              <ProjectListColumnCell key={columnId} columnId={columnId} project={project} />
            ))
          : null}
        <span className="flex justify-end">
          <ProjectRowMenu project={project} />
        </span>
      </div>
    </div>
  )
}

const PROJECT_CARD_STAGGER_MS = 55

/** Scrollable list body: same gap and cards as the full projects page. */
export function ProjectsListRows({
  projects,
  layout = 'full',
  visibleColumns = PROJECT_LIST_COLUMN_ORDER,
  rowProps,
  reveal,
}: {
  projects: ProjectRecord[]
  layout?: ProjectsListLayout
  visibleColumns?: ProjectListColumnId[]
  rowProps: (project: ProjectRecord) => {
    onActivate: () => void
    isCurrent?: boolean
    ariaLabel: string
  }
  /** When set, cards fade in top-to-bottom once `reveal` becomes true. */
  reveal?: boolean
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[16px]">
      {projects.map((project, index) => {
        const { onActivate, isCurrent, ariaLabel } = rowProps(project)
        const row = (
          <ProjectCardRow
            project={project}
            layout={layout}
            visibleColumns={visibleColumns}
            onActivate={onActivate}
            isCurrent={isCurrent}
            ariaLabel={ariaLabel}
          />
        )
        if (reveal == null) {
          return (
            <div key={project.id}>{row}</div>
          )
        }
        return (
          <div
            key={project.id}
            className="transition-opacity duration-500 ease-out will-change-[opacity]"
            style={{
              opacity: reveal ? 1 : 0,
              transitionDelay: reveal ? `${index * PROJECT_CARD_STAGGER_MS}ms` : '0ms',
            }}
          >
            {row}
          </div>
        )
      })}
    </div>
  )
}
