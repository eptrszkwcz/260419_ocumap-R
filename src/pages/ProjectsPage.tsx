import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ControlHeaderToolbar } from '@/components/ControlHeaderToolbar'
import { OcuMapFullLogo } from '@/components/OcuMapFullLogo'
import { Panel } from '@/components/Panel'
import { UserAccountDisplay } from '@/components/UserAccountDisplay'
import { useProjects } from '@/context/ProjectsContext'
import { NEW_PROJECT_ID, resolveLibraryProjectId, type ProjectRecord } from '@/data/sampleProjects'
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
import { ProjectsSummaryStats } from '@/pages/ProjectsSummaryStats'
import { ProjectsTable } from '@/pages/ProjectsTable'

type RevealPhase = 'hidden' | 'header' | 'upper' | 'cards'

const REVEAL_FADE_CLASS =
  'transition-opacity duration-500 ease-out will-change-[opacity]'

function revealClass(visible: boolean): string {
  return REVEAL_FADE_CLASS + (visible ? ' opacity-100' : ' opacity-0')
}

export function ProjectsPage() {
  const navigate = useNavigate()
  const { projects } = useProjects()

  const [viewType, setViewType] = useState<LibraryViewType>('list')
  const [filters, setFilters] = useState<ProjectFilters>(() => createEmptyProjectFilters())
  const [openDropdown, setOpenDropdown] = useState<ProjectDropdownId | null>(null)
  const [revealPhase, setRevealPhase] = useState<RevealPhase>('hidden')

  useEffect(() => {
    setRevealPhase('hidden')
    const headerTimer = window.setTimeout(() => setRevealPhase('header'), 40)
    const upperTimer = window.setTimeout(() => setRevealPhase('upper'), 420)
    const cardsTimer = window.setTimeout(() => setRevealPhase('cards'), 820)
    return () => {
      window.clearTimeout(headerTimer)
      window.clearTimeout(upperTimer)
      window.clearTimeout(cardsTimer)
    }
  }, [])

  const filteredProjects = useMemo(
    () => applyProjectFilters(projects, filters),
    [projects, filters],
  )

  const activeFilters = useMemo(() => projectFiltersToBadges(filters), [filters])

  const openProject = (project: ProjectRecord) => {
    navigate(`/library?project=${encodeURIComponent(resolveLibraryProjectId(project.id))}`)
  }

  const handleRemoveFilter = (badgeId: string) => {
    setFilters((prev) => removeProjectFilterByBadgeId(prev, badgeId))
  }

  const headerVisible = revealPhase !== 'hidden'
  const upperVisible = revealPhase === 'upper' || revealPhase === 'cards'
  const cardsVisible = revealPhase === 'cards'

  return (
    <div className="bg-page flex h-full min-h-0 min-w-0 flex-col p-page">
      <header
        className={
          'flex h-header shrink-0 items-center justify-between gap-4 px-panel-padding ' +
          revealClass(headerVisible)
        }
      >
        <OcuMapFullLogo />
        <UserAccountDisplay />
      </header>
      <Panel className="!border-0 !bg-transparent mx-auto mt-[52px] flex min-h-0 min-w-0 w-full max-w-[1200px] flex-1 flex-col gap-4 p-0 shadow-none">
        <div className={'flex shrink-0 flex-col ' + revealClass(upperVisible)}>
          <div className="mb-[12px] h-fit shrink-0">
            <h1 className="font-title text-[30px] font-bold leading-none text-fg">My Projects</h1>
          </div>
          <div className="flex flex-col gap-4">
            <ProjectsSummaryStats projects={projects} />
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
          </div>
        </div>
        {viewType === 'list' ? (
          <ProjectsTable projects={filteredProjects} reveal={cardsVisible} />
        ) : (
          <ProjectsThumbnailGrid
            projects={filteredProjects}
            onOpenProject={openProject}
            reveal={cardsVisible}
          />
        )}
      </Panel>
    </div>
  )
}
