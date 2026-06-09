import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { type ProjectRecord } from '@/data/sampleProjects'
import { resolveVisibleProjectColumns } from '@/pages/projects/projectListColumns'
import { ProjectsListHeader, ProjectsListRows } from '@/pages/projectsListPresentation'

type ProjectsTableProps = {
  projects: ProjectRecord[]
}

/**
 * Project directory as card rows: name (with type tag), team, dates, status, actions.
 */
export function ProjectsTable({ projects }: ProjectsTableProps) {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

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

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-auto bg-page pb-panel-padding"
    >
      <ProjectsListHeader visibleColumns={visibleColumns} />
      <ProjectsListRows
        projects={projects}
        visibleColumns={visibleColumns}
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
