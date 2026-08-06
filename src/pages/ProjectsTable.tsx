import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { nextSortDirection, type SortDirection } from '@/components/SortableColumnHeader'
import { resolveLibraryProjectId, type ProjectRecord } from '@/data/sampleProjects'
import { resolveVisibleProjectColumns } from '@/pages/projects/projectListColumns'
import { ProjectsListHeader, ProjectsListRows } from '@/pages/projectsListPresentation'
import {
  sortProjects,
  type ProjectListSortColumn,
} from '@/pages/projects/sortProjects'

type ProjectsTableProps = {
  projects: ProjectRecord[]
  /** When set, list header and cards participate in the page enter reveal. */
  reveal?: boolean
}

/**
 * Project directory as card rows: name (with type tag), team, dates, status, actions.
 */
export function ProjectsTable({ projects, reveal }: ProjectsTableProps) {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [sortColumn, setSortColumn] = useState<ProjectListSortColumn>('lastModified')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    const el = containerRef.current
    if (el == null) return

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry != null) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    ro.observe(el)
    setContainerWidth(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  const visibleColumns = useMemo(
    () => resolveVisibleProjectColumns(containerWidth),
    [containerWidth],
  )

  const sortedProjects = useMemo(
    () => sortProjects(projects, sortColumn, sortDirection),
    [projects, sortColumn, sortDirection],
  )

  const handleSortColumn = (column: ProjectListSortColumn) => {
    setSortDirection(nextSortDirection(sortColumn, column, sortDirection))
    setSortColumn(column)
  }

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-auto bg-page pb-panel-padding"
    >
      <div
        className={
          reveal == null
            ? undefined
            : 'transition-opacity duration-500 ease-out will-change-[opacity] ' +
              (reveal ? 'opacity-100' : 'opacity-0')
        }
      >
        <ProjectsListHeader
          visibleColumns={visibleColumns}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSortColumn={handleSortColumn}
        />
      </div>
      <ProjectsListRows
        projects={sortedProjects}
        visibleColumns={visibleColumns}
        reveal={reveal}
        rowProps={(project) => ({
          onActivate: () => {
            navigate(`/library?project=${encodeURIComponent(resolveLibraryProjectId(project.id))}`)
          },
          isCurrent: false,
          ariaLabel: `Open ${project.name} in library`,
        })}
      />
    </div>
  )
}
