import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ControlHeaderToolbar } from '@/components/ControlHeaderToolbar'
import { Panel } from '@/components/Panel'
import { UserAccountDisplay } from '@/components/UserAccountDisplay'
import { useProjects } from '@/context/ProjectsContext'
import { NEW_PROJECT_ID, type ProjectRecord } from '@/data/sampleProjects'
import type { LibraryViewType } from '@/panels/library/featureLibrary/types'
import { applyProjectFilters } from '@/pages/projects/applyProjectFilters'
import {
  projectFiltersToBadges,
  removeProjectFilterByBadgeId,
} from '@/pages/projects/filterBadges'
import { ProjectsControlActions } from '@/pages/projects/ProjectsControlActions'
import { ProjectsThumbnailGrid } from '@/pages/projects/ProjectsThumbnailGrid'
import {
  createEmptyProjectFilters,
  type ProjectDropdownId,
  type ProjectFilters,
} from '@/pages/projects/types'
import { ProjectsBadgeRow } from '@/pages/ProjectsBadgeRow'
import { ProjectsTable } from '@/pages/ProjectsTable'

export function ProjectsPage() {
  const navigate = useNavigate()
  const { projects } = useProjects()

  const [viewType, setViewType] = useState<LibraryViewType>('list')
  const [filters, setFilters] = useState<ProjectFilters>(() => createEmptyProjectFilters())
  const [openDropdown, setOpenDropdown] = useState<ProjectDropdownId | null>(null)

  const filteredProjects = useMemo(
    () => applyProjectFilters(projects, filters),
    [projects, filters],
  )

  const activeFilters = useMemo(() => projectFiltersToBadges(filters), [filters])

  const openProject = (project: ProjectRecord) => {
    navigate(`/library?project=${encodeURIComponent(project.id)}`)
  }

  const handleRemoveFilter = (badgeId: string) => {
    setFilters((prev) => removeProjectFilterByBadgeId(prev, badgeId))
  }

  return (
    <div className="bg-page flex h-full min-h-0 min-w-0 flex-col p-page">
      <header className="flex h-header shrink-0 items-center justify-between gap-4 pl-panel-padding">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex shrink-0 items-center">
            <img
              src="/brand/ocumap-o-logo.svg"
              alt="OcuMap"
              className="h-9 w-auto"
              width={33}
              height={40}
            />
          </div>
          <h1 className="min-w-0 flex-1 truncate font-title text-title font-bold text-fg">Projects</h1>
        </div>
        <UserAccountDisplay />
      </header>
      <Panel className="!border-0 !bg-transparent mx-auto mt-[52px] flex min-h-0 min-w-0 w-full max-w-[1200px] flex-1 flex-col p-0 shadow-none">
        <div className="relative z-20 shrink-0">
          <ControlHeaderToolbar
            id="control-header-projects"
            toolbarAriaLabel="Projects list actions"
            addButtonVisibleLabel="New Project"
            addButtonAriaLabel="New project"
            addButtonLabelMaxWidthClass="max-w-[7.5rem]"
            addButtonAlwaysExpanded
            onAddClick={() => navigate(`/library?project=${NEW_PROJECT_ID}`)}
            secondaryActions={
              <ProjectsControlActions
                projects={projects}
                viewType={viewType}
                onViewTypeChange={setViewType}
                filters={filters}
                onFiltersChange={setFilters}
                openDropdown={openDropdown}
                onOpenDropdownChange={setOpenDropdown}
              />
            }
          />
        </div>
        <ProjectsBadgeRow
          projectCount={filteredProjects.length}
          activeFilters={activeFilters}
          onRemoveFilter={handleRemoveFilter}
        />
        {viewType === 'list' ? (
          <ProjectsTable projects={filteredProjects} />
        ) : (
          <ProjectsThumbnailGrid projects={filteredProjects} onOpenProject={openProject} />
        )}
      </Panel>
    </div>
  )
}
