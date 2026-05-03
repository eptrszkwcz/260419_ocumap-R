/**
 * Prototype project directory for the signed-in user (John Smith in demos).
 */
export type ProjectType = 'Building' | 'Infrastructure'

export type ProjectRecord = {
  id: string
  name: string
  owner: string
  lastEdited: string
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
    owner: 'John Smith',
    lastEdited: 'April 28, 2026',
    projectType: 'Building',
  },
  {
    id: 'p-2',
    name: 'Harborview Medical Tower',
    owner: 'Cypress Health Partners',
    lastEdited: 'April 25, 2026',
    projectType: 'Building',
  },
  {
    id: 'p-3',
    name: '2200 Market St. Office Annex',
    owner: 'Market Square REIT',
    lastEdited: 'April 22, 2026',
    projectType: 'Building',
  },
  {
    id: 'p-4',
    name: 'Riverside School Modernization',
    owner: 'Eastern Valley SD',
    lastEdited: 'April 20, 2026',
    projectType: 'Building',
  },
  {
    id: 'p-5',
    name: 'The Alder Building',
    owner: 'Ironbark Developments',
    lastEdited: 'April 16, 2026',
    projectType: 'Building',
  },
  {
    id: 'p-6',
    name: '45 Pine Ridge Rd.',
    owner: 'John Smith',
    lastEdited: 'April 12, 2026',
    projectType: 'Building',
  },
  {
    id: 'p-7',
    name: 'City Hall North Wing',
    owner: 'Lakeside Municipality',
    lastEdited: 'April 8, 2026',
    projectType: 'Building',
  },
  {
    id: 'p-8',
    name: 'Atlas Data Center — Phase 2',
    owner: 'Stratus Infrastructure Co.',
    lastEdited: 'April 1, 2026',
    projectType: 'Building',
  },
  {
    id: KATY_FREEWAY_PROJECT_ID,
    name: 'Katy Freeway Expansion',
    owner: 'Texas Department of Transportation',
    lastEdited: 'April 29, 2026',
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
