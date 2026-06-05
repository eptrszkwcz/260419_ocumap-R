import type { ProjectRecord } from '@/data/sampleProjects'
import { ViewModeDropdown } from '@/panels/library/featureLibrary/ViewModeDropdown'
import type { LibraryViewType } from '@/panels/library/featureLibrary/types'

import { ProjectsFiltersDropdown } from '@/pages/projects/ProjectsFiltersDropdown'
import type { ProjectDropdownId, ProjectFilters } from '@/pages/projects/types'

type ProjectsControlActionsProps = {
  projects: ProjectRecord[]
  viewType: LibraryViewType
  onViewTypeChange: (viewType: LibraryViewType) => void
  filters: ProjectFilters
  onFiltersChange: (filters: ProjectFilters) => void
  openDropdown: ProjectDropdownId | null
  onOpenDropdownChange: (id: ProjectDropdownId | null) => void
}

export function ProjectsControlActions({
  projects,
  viewType,
  onViewTypeChange,
  filters,
  onFiltersChange,
  openDropdown,
  onOpenDropdownChange,
}: ProjectsControlActionsProps) {
  return (
    <>
      <ViewModeDropdown
        viewType={viewType}
        onViewTypeChange={onViewTypeChange}
        open={openDropdown === 'view'}
        onOpenChange={(open) => onOpenDropdownChange(open ? 'view' : null)}
      />
      <ProjectsFiltersDropdown
        projects={projects}
        filters={filters}
        onFiltersChange={onFiltersChange}
        open={openDropdown === 'filters'}
        onOpenChange={(open) => onOpenDropdownChange(open ? 'filters' : null)}
      />
    </>
  )
}
