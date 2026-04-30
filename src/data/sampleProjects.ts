/**
 * Prototype project directory for the signed-in user (John Smith in demos).
 */
export type ProjectType =
  | 'Residential'
  | 'Commercial'
  | 'Civic'
  | 'Healthcare'
  | 'Education'
  | 'Mixed-use'
  | 'Industrial'

export type ProjectRecord = {
  id: string
  name: string
  owner: string
  lastEdited: string
  projectType: ProjectType
}

/** 1603 Jefferson St. — demo: clicking this row opens `/library` as if opening the project. */
export const DEMO_OPENS_LIBRARY_PROJECT_ID = 'p-1'

export const sampleProjects: ProjectRecord[] = [
  {
    id: 'p-1',
    name: '1603 Jefferson St.',
    owner: 'John Smith',
    lastEdited: 'April 28, 2026',
    projectType: 'Residential',
  },
  {
    id: 'p-2',
    name: 'Harborview Medical Tower',
    owner: 'Cypress Health Partners',
    lastEdited: 'April 25, 2026',
    projectType: 'Healthcare',
  },
  {
    id: 'p-3',
    name: '2200 Market St. Office Annex',
    owner: 'Market Square REIT',
    lastEdited: 'April 22, 2026',
    projectType: 'Commercial',
  },
  {
    id: 'p-4',
    name: 'Riverside School Modernization',
    owner: 'Eastern Valley SD',
    lastEdited: 'April 20, 2026',
    projectType: 'Education',
  },
  {
    id: 'p-5',
    name: 'The Alder Building',
    owner: 'Ironbark Developments',
    lastEdited: 'April 16, 2026',
    projectType: 'Mixed-use',
  },
  {
    id: 'p-6',
    name: '45 Pine Ridge Rd.',
    owner: 'John Smith',
    lastEdited: 'April 12, 2026',
    projectType: 'Residential',
  },
  {
    id: 'p-7',
    name: 'City Hall North Wing',
    owner: 'Lakeside Municipality',
    lastEdited: 'April 8, 2026',
    projectType: 'Civic',
  },
  {
    id: 'p-8',
    name: 'Atlas Data Center — Phase 2',
    owner: 'Stratus Infrastructure Co.',
    lastEdited: 'April 1, 2026',
    projectType: 'Industrial',
  },
]
