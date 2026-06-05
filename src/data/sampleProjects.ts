/**
 * Prototype project directory for the signed-in user (John Smith in demos).
 */
export type ProjectType = 'Building' | 'Infrastructure' | 'FilesOnly'

/** URL sentinel while the user is creating a project (not a persisted record). */
export const NEW_PROJECT_ID = 'new'

export type ProjectStatus = 'Draft' | 'Published'

export type ProjectRecord = {
  id: string
  name: string
  status: ProjectStatus
  /** Organization shown in the projects list “Team” column. */
  team: string
  /** Display string for “Last modified” (e.g. “May 3, 2026”). */
  lastModified: string
  /** Feature library file count shown in the projects list. */
  featureFileCount: number
  /** Short relative label for “Created” (e.g. “3 days ago”). */
  createdRelative: string
  /** ISO date for “Created” filtering (YYYY-MM-DD). */
  createdIso: string
  projectType: ProjectType
  /** Mapbox GL style URL; required when projectType is Infrastructure. */
  mapboxStyleUrl?: string
  /** WGS84 center for Infrastructure project map thumbnails. */
  mapCenterLat?: number
  mapCenterLng?: number
}

/** 1603 Jefferson St. — default library demo project. */
export const DEMO_OPENS_LIBRARY_PROJECT_ID = 'p-1'

export const KATY_FREEWAY_PROJECT_ID = 'p-katy'

export const FILES_ONLY_DEMO_PROJECT_ID = 'p-files-demo'

export const KATY_FREEWAY_MAPBOX_STYLE =
  'mapbox://styles/ptrszkwcz/cmopctwjj005v01rge2ht02w2' as const

const projectsById: Record<string, ProjectRecord> = {}

/** Demo: two projects shown as published (stable “random” pair). */
const publishedProjectIds = new Set(['p-2', KATY_FREEWAY_PROJECT_ID])

export const sampleProjects: ProjectRecord[] = [
  {
    id: 'p-1',
    name: '1603 Jefferson St.',
    status: publishedProjectIds.has('p-1') ? 'Published' : 'Draft',
    team: 'Smith Property Management',
    lastModified: 'May 3, 2026',
    featureFileCount: 142,
    createdRelative: '3 days ago',
    createdIso: '2026-06-01',
    projectType: 'Building',
  },
  {
    id: 'p-2',
    name: 'Harborview Medical Tower',
    status: publishedProjectIds.has('p-2') ? 'Published' : 'Draft',
    team: 'Cypress Health Partners',
    lastModified: 'April 30, 2026',
    featureFileCount: 87,
    createdRelative: '2 weeks ago',
    createdIso: '2026-05-21',
    projectType: 'Building',
  },
  {
    id: 'p-4',
    name: 'Riverside School Modernization',
    status: publishedProjectIds.has('p-4') ? 'Published' : 'Draft',
    team: 'Eastern Valley SD',
    lastModified: 'April 25, 2026',
    featureFileCount: 23,
    createdRelative: '5 weeks ago',
    createdIso: '2026-04-30',
    projectType: 'Building',
  },
  {
    id: 'p-7',
    name: 'City Hall North Wing',
    status: publishedProjectIds.has('p-7') ? 'Published' : 'Draft',
    team: 'Lakeside Municipality',
    lastModified: 'April 12, 2026',
    featureFileCount: 310,
    createdRelative: '3 months ago',
    createdIso: '2026-03-04',
    projectType: 'Building',
  },
  {
    id: KATY_FREEWAY_PROJECT_ID,
    name: 'Katy Freeway Expansion',
    status: publishedProjectIds.has(KATY_FREEWAY_PROJECT_ID) ? 'Published' : 'Draft',
    team: 'Build Co.',
    lastModified: 'May 2, 2026',
    featureFileCount: 56,
    createdRelative: '4 weeks ago',
    createdIso: '2026-05-07',
    projectType: 'Infrastructure',
    mapboxStyleUrl: KATY_FREEWAY_MAPBOX_STYLE,
    mapCenterLat: 29.786,
    mapCenterLng: -95.794,
  },
  {
    id: FILES_ONLY_DEMO_PROJECT_ID,
    name: 'Westside Document Archive',
    status: 'Draft',
    team: 'Smith Property Management',
    lastModified: 'May 28, 2026',
    featureFileCount: 412,
    createdRelative: '1 week ago',
    createdIso: '2026-05-28',
    projectType: 'FilesOnly',
  },
]

for (const p of sampleProjects) {
  projectsById[p.id] = p
}

export function getProjectById(id: string): ProjectRecord | undefined {
  return projectsById[id]
}

export function projectTypeLabel(type: ProjectType): string {
  if (type === 'FilesOnly') return 'Files Only'
  return type
}

/** UI label for project type in filters and tags. */
export function projectTypeFilterLabel(type: ProjectType): string {
  if (type === 'Building') return 'Floor Plan'
  if (type === 'Infrastructure') return 'Map'
  return 'Files Only'
}
