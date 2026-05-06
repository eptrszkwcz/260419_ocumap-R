/**
 * Prototype project directory for the signed-in user (John Smith in demos).
 */
export type ProjectType = 'Building' | 'Infrastructure'

export type ProjectRecord = {
  id: string
  name: string
  /** Organization shown in the projects list “Team” column. */
  team: string
  /** Display string for “Last modified” (e.g. “May 3, 2026”). */
  lastModified: string
  /** Short relative label for “Created” (e.g. “3 days ago”). */
  createdRelative: string
  projectType: ProjectType
  /** Mapbox GL style URL; required when projectType is Infrastructure. */
  mapboxStyleUrl?: string
}

/** 1603 Jefferson St. — default library demo project. */
export const DEMO_OPENS_LIBRARY_PROJECT_ID = 'p-1'

export const KATY_FREEWAY_PROJECT_ID = 'p-katy'

export const KATY_FREEWAY_MAPBOX_STYLE =
  'mapbox://styles/ptrszkwcz/cmopctwjj005v01rge2ht02w2' as const

const projectsById: Record<string, ProjectRecord> = {}

export const sampleProjects: ProjectRecord[] = [
  {
    id: 'p-1',
    name: '1603 Jefferson St.',
    team: 'Smith Property Management',
    lastModified: 'May 3, 2026',
    createdRelative: '3 days ago',
    projectType: 'Building',
  },
  {
    id: 'p-2',
    name: 'Harborview Medical Tower',
    team: 'Cypress Health Partners',
    lastModified: 'April 30, 2026',
    createdRelative: '2 weeks ago',
    projectType: 'Building',
  },
  {
    id: 'p-4',
    name: 'Riverside School Modernization',
    team: 'Eastern Valley SD',
    lastModified: 'April 25, 2026',
    createdRelative: '5 weeks ago',
    projectType: 'Building',
  },
  {
    id: 'p-7',
    name: 'City Hall North Wing',
    team: 'Lakeside Municipality',
    lastModified: 'April 12, 2026',
    createdRelative: '3 months ago',
    projectType: 'Building',
  },
  {
    id: KATY_FREEWAY_PROJECT_ID,
    name: 'Katy Freeway Expansion',
    team: 'Build Co.',
    lastModified: 'May 2, 2026',
    createdRelative: '4 weeks ago',
    projectType: 'Infrastructure',
    mapboxStyleUrl: KATY_FREEWAY_MAPBOX_STYLE,
  },
]

for (const p of sampleProjects) {
  projectsById[p.id] = p
}

export function getProjectById(id: string): ProjectRecord | undefined {
  return projectsById[id]
}
