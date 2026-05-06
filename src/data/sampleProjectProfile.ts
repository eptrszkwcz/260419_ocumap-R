import { KATY_FREEWAY_PROJECT_ID } from '@/data/sampleProjects'

export type ProjectTeamMember = {
  role: string
  name: string
  phone?: string
  email?: string
}

export type DemoProjectDetailsProfile = {
  projectTitle: string
  projectSubtitle: string
  statusLabel: string
  createdOn: string
  createdOnIso: string
  location: {
    addressLines: string[]
    cityStateZip: string
    notes: string
  }
  identifiers: {
    projectNumber: string
    clientName: string
    buildingType: string
    gcName: string
  }
  schedule: {
    targetSubstantialCompletion: string
    lastSiteWalk: string
    nextMilestone: string
  }
  permits: string
  insurance: string
  team: ProjectTeamMember[]
  operations: {
    siteHours: string
    afterHours: string
  }
  summary: string
}

/** Static demo profile for the Project Details tab; aligns with the library header title. */
export const sampleProjectProfile = {
  projectTitle: '1603 Jefferson St',
  projectSubtitle: 'Class B office — phased tenant improvement & ongoing building operations',
  statusLabel: 'Construction — interior fit-out',
  createdOn: 'March 4, 2024',
  createdOnIso: '2024-03-04',
  location: {
    addressLines: ['1603 Jefferson Street', 'Suite 200'],
    cityStateZip: 'Oakland, CA 94612',
    notes: 'Primary loading dock on 16th St; visitor parking in structure B (levels 2–3).',
  },
  identifiers: {
    projectNumber: 'PRJ-2024-0847',
    clientName: 'Harborline Properties LLC',
    buildingType: 'Mid-rise office (6 floors, ~118,000 SF)',
    gcName: 'North Bay Builders Cooperative',
  },
  schedule: {
    targetSubstantialCompletion: 'November 2025',
    lastSiteWalk: 'April 28, 2025',
    nextMilestone: 'MEP rough-in inspection — Level 4 (scheduled May 9, 2025)',
  },
  permits: 'Building permit #2024-OAK-BLD-44192 (active); electrical permit #2024-OAK-EL-2201.',
  insurance: 'General liability & workers comp on file; COI expires Aug 14, 2025.',
  team: [
    {
      role: 'Building manager',
      name: 'Elena Voss',
      phone: '(510) 555-0142',
      email: 'e.voss@harborlineprops.com',
    },
    {
      role: 'Owner’s representative',
      name: 'Marcus Chen',
      phone: '(510) 555-0198',
      email: 'mchen@harborlineprops.com',
    },
    {
      role: 'General superintendent',
      name: 'Rosa Delgado',
      phone: '(510) 555-0161',
      email: 'rdelgado@nbbco-op.com',
    },
    {
      role: 'Plumbing lead',
      name: 'James Okonkwo',
      phone: '(510) 555-0177',
      email: 'j.okonkwo@nbbco-op.com',
    },
    {
      role: 'Electrical lead',
      name: 'Priya Natarajan',
      phone: '(510) 555-0183',
      email: 'p.natarajan@nbbco-op.com',
    },
    {
      role: 'IT / low-voltage',
      name: 'Samir Haddad',
      phone: '(510) 555-0155',
      email: 'shaddad@nbbco-op.com',
    },
    {
      role: 'Facilities maintenance',
      name: 'Angela Ruiz',
      phone: '(510) 555-0104',
      email: 'aruiz@harborlineprops.com',
    },
    {
      role: 'Life safety / fire',
      name: 'Daniel Frost',
      phone: '(510) 555-0129',
      email: 'dfrost@nbbco-op.com',
    },
  ] satisfies ProjectTeamMember[],
  operations: {
    siteHours: 'Mon–Fri 7:00 a.m. – 5:30 p.m.; Saturdays by advance notice only.',
    afterHours: 'For water intrusion, fire alarm trouble, or elevator entrapment, call the building manager line; on-site security (555-0140) after 6 p.m.',
  },
  summary:
    'Interior demolition on floors 3–4 is complete; drywall and ceilings underway on 3. MEP trades are coordinated around tenant swing space on 2. As-built documentation and commissioning scripts will be handed off at TCO.',
} as const satisfies DemoProjectDetailsProfile

/** Demo profile for the Katy Freeway Expansion infrastructure project. */
export const sampleKatyFreewayProjectProfile = {
  projectTitle: 'Katy Freeway Expansion',
  projectSubtitle: 'I-10 mainlanes and managed lanes — corridor design and ROW coordination (demo)',
  statusLabel: 'Design — environmental review',
  createdOn: 'April 1, 2025',
  createdOnIso: '2025-04-01',
  location: {
    addressLines: ['TxDOT Houston District', '7600 Washington Avenue'],
    cityStateZip: 'Houston, TX 77007',
    notes: 'Corridor limits: SH 99 to I-610 (Katy area); staging and MOT per district traffic plans.',
  },
  identifiers: {
    projectNumber: 'CSJ-0915-00-000 (demo)',
    clientName: 'Texas Department of Transportation',
    buildingType: 'Controlled-access freeway expansion and interchange improvements',
    gcName: 'Design-build joint venture (TBD — demo)',
  },
  schedule: {
    targetSubstantialCompletion: 'December 2028 (indicative)',
    lastSiteWalk: 'April 15, 2026',
    nextMilestone: 'ROW acquisition package — Segment B (scheduled June 2026)',
  },
  permits: 'NEPA / TxDOT environmental clearance in progress; local utility agreements pending.',
  insurance: 'Professional liability and OCIP requirements per district CM-GC standards (demo).',
  team: [
    {
      role: 'TxDOT project manager',
      name: 'Jordan Alvarez',
      phone: '(713) 555-0101',
      email: 'j.alvarez@txdot.gov',
    },
    {
      role: 'Deputy PM — construction',
      name: 'Kim Okada',
      phone: '(713) 555-0102',
      email: 'k.okada@txdot.gov',
    },
    {
      role: 'Environmental lead',
      name: 'Chris Mendez',
      email: 'c.mendez@txdot.gov',
    },
  ] satisfies ProjectTeamMember[],
  operations: {
    siteHours: 'Field staff typical hours Mon–Fri 7:00 a.m. – 4:00 p.m.; lane closures per MOT permits only.',
    afterHours: 'Public safety or incident response: dial 911; district duty officer via Houston TOC (demo).',
  },
  summary:
    'Conceptual layouts and interchange revisions are under review; utility relocations are being sequenced with city partners. Managed lane interfaces with existing toll facilities are a key coordination thread for the next design submittal.',
} as const satisfies DemoProjectDetailsProfile

export function getProjectDetailsProfile(projectId: string): DemoProjectDetailsProfile {
  if (projectId === KATY_FREEWAY_PROJECT_ID) return sampleKatyFreewayProjectProfile
  return sampleProjectProfile
}
