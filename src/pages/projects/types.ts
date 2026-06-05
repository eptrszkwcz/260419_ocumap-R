import type { ProjectStatus, ProjectType } from '@/data/sampleProjects'
import type { DateFilterState } from '@/panels/library/featureLibrary/types'

export type ProjectViewType = 'list' | 'thumbnail'

export type ProjectDropdownId = 'view' | 'filters'

export type ProjectFilters = {
  statuses: ProjectStatus[]
  types: ProjectType[]
  teams: string[]
  lastModified: DateFilterState | null
  created: DateFilterState | null
  fileCountMin: string
  fileCountMax: string
}

export function createEmptyProjectFilters(): ProjectFilters {
  return {
    statuses: [],
    types: [],
    teams: [],
    lastModified: null,
    created: null,
    fileCountMin: '',
    fileCountMax: '',
  }
}
