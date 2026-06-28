import { sampleProjects } from '@/data/sampleProjects'

import type { ProjectFloorPlan } from '@/context/ProjectFloorPlansContext'

export type FloorPlanId = string

export type FloorPlanOption = { id: FloorPlanId; label: string }

export const FLOOR_PLAN_OPTIONS: FloorPlanOption[] = [
  { id: 'SOM-2', label: 'Floor 2' },
  { id: 'SOM-4', label: 'Floor 4' },
  { id: 'SOM-5', label: 'Floor 5' },
]

/** Lowest floor in `FLOOR_PLAN_OPTIONS`; used as the initial building map view. */
export const DEFAULT_FLOOR_PLAN_ID: FloorPlanId = FLOOR_PLAN_OPTIONS[0].id

/** Seed building projects ship with demo floor plans; user-created projects start with none. */
const legacyBuildingFloorPlanProjectIds = new Set(
  sampleProjects.filter((p) => p.projectType === 'Building').map((p) => p.id),
)

function legacyFloorPlanOptionsForProject(projectId: string): FloorPlanOption[] {
  if (!legacyBuildingFloorPlanProjectIds.has(projectId)) return []
  return FLOOR_PLAN_OPTIONS
}

function userFloorPlanOptions(userPlans: ProjectFloorPlan[]): FloorPlanOption[] {
  return userPlans.map((plan) => ({ id: plan.id, label: plan.label }))
}

export function getFloorPlanOptionsForProject(
  projectId: string,
  userPlans: ProjectFloorPlan[] = [],
): FloorPlanOption[] {
  return [...legacyFloorPlanOptionsForProject(projectId), ...userFloorPlanOptions(userPlans)]
}

export function getDefaultFloorPlanIdForProject(
  projectId: string,
  userPlans: ProjectFloorPlan[] = [],
): FloorPlanId | null {
  const options = getFloorPlanOptionsForProject(projectId, userPlans)
  return options[0]?.id ?? null
}

export function floorPlanDisplayLabel(
  id: FloorPlanId,
  userPlans: ProjectFloorPlan[] = [],
): string {
  const legacy = FLOOR_PLAN_OPTIONS.find((o) => o.id === id)
  if (legacy != null) return legacy.label
  return userPlans.find((p) => p.id === id)?.label ?? id
}

export function floorPlanImageSrc(id: FloorPlanId, userPlans: ProjectFloorPlan[] = []): string {
  const userPlan = userPlans.find((p) => p.id === id)
  if (userPlan != null) return userPlan.imageUrl
  return `/samples/map-viewer/floor-plans/${id}.jpg`
}
