import type { DemoProjectDetailsProfile, ProjectTeamMember } from '@/data/sampleProjectProfile'
import { createEmptyProjectProfile } from '@/data/sampleProjectProfile'

export type ProjectDetailsDraft = {
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
    buildingSizeSf: string
    floorCount: string
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

export function profileToDraft(profile: DemoProjectDetailsProfile): ProjectDetailsDraft {
  return {
    createdOn: profile.createdOn,
    createdOnIso: profile.createdOnIso,
    location: {
      addressLines: [...profile.location.addressLines],
      cityStateZip: profile.location.cityStateZip,
      notes: profile.location.notes,
    },
    identifiers: {
      projectNumber: profile.identifiers.projectNumber,
      clientName: profile.identifiers.clientName,
      buildingSizeSf: String(profile.identifiers.buildingSizeSf),
      floorCount: String(profile.identifiers.floorCount),
      gcName: profile.identifiers.gcName,
    },
    schedule: { ...profile.schedule },
    permits: profile.permits,
    insurance: profile.insurance,
    team: profile.team.map((m) => ({ ...m })),
    operations: { ...profile.operations },
    summary: profile.summary,
  }
}

export function draftToProfile(draft: ProjectDetailsDraft): DemoProjectDetailsProfile {
  const buildingSizeSf = parseInt(draft.identifiers.buildingSizeSf.replace(/,/g, ''), 10)
  const floorCount = parseInt(draft.identifiers.floorCount, 10)
  return {
    createdOn: draft.createdOn,
    createdOnIso: draft.createdOnIso,
    location: {
      addressLines: draft.location.addressLines.filter((l) => l.trim() !== ''),
      cityStateZip: draft.location.cityStateZip,
      notes: draft.location.notes,
    },
    identifiers: {
      projectNumber: draft.identifiers.projectNumber,
      clientName: draft.identifiers.clientName,
      buildingSizeSf: Number.isFinite(buildingSizeSf) ? buildingSizeSf : 0,
      floorCount: Number.isFinite(floorCount) ? floorCount : 0,
      gcName: draft.identifiers.gcName,
    },
    schedule: { ...draft.schedule },
    permits: draft.permits,
    insurance: draft.insurance,
    team: draft.team.filter((m) => m.role.trim() !== '' || m.name.trim() !== ''),
    operations: { ...draft.operations },
    summary: draft.summary,
  }
}

export function formatBuildingSizeSf(sf: number): string {
  if (sf <= 0) return '—'
  return `${sf.toLocaleString('en-US')} SF`
}

export function formatFloorCount(floors: number): string {
  if (floors <= 0) return '—'
  return String(floors)
}

export function createEmptyProjectDetailsDraft(): ProjectDetailsDraft {
  return profileToDraft(createEmptyProjectProfile())
}
