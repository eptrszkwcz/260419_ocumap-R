import { sampleProjects } from '@/data/sampleProjects'

export type FloorPlanId = 'SOM-2' | 'SOM-4' | 'SOM-5'

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

export function getFloorPlanOptionsForProject(projectId: string): FloorPlanOption[] {
  if (!legacyBuildingFloorPlanProjectIds.has(projectId)) return []
  return FLOOR_PLAN_OPTIONS
}

export function floorPlanDisplayLabel(id: FloorPlanId): string {
  return FLOOR_PLAN_OPTIONS.find((o) => o.id === id)?.label ?? id
}

export function floorPlanImageSrc(id: FloorPlanId): string {
  return `/samples/map-viewer/floor-plans/${id}.jpg`
}
