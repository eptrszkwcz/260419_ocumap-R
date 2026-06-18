import { useCallback } from 'react'

import { useActiveProject } from '@/context/ActiveProjectContext'
import { useActiveFloorPlan } from '@/context/ActiveFloorPlanContext'
import { useFeatureDraw } from '@/context/FeatureDrawContext'
import { useFloorPlanLocationPick } from '@/context/FloorPlanLocationPickContext'
import { useMapLocationPick } from '@/context/MapLocationPickContext'
import type { FloorPlanId } from '@/panels/map/mapFloorPlans'

type StartFeatureDrawOptions = {
  /** When set (e.g. from map overlay), overrides context floor plan for building projects. */
  floorPlanId?: FloorPlanId
}

export function useStartFeatureDraw() {
  const { project } = useActiveProject()
  const { floorPlanId: activeFloorPlanId } = useActiveFloorPlan()
  const { startDraw } = useFeatureDraw()
  const { cancelLocationPick } = useMapLocationPick()
  const { cancelFloorPlanLocationPick } = useFloorPlanLocationPick()

  return useCallback(
    (options?: StartFeatureDrawOptions) => {
      cancelLocationPick()
      cancelFloorPlanLocationPick()
      const floorPlanId =
        options?.floorPlanId ??
        (project.projectType === 'Building' ? activeFloorPlanId : undefined)
      if (floorPlanId != null) {
        startDraw(floorPlanId)
      } else {
        startDraw()
      }
    },
    [
      activeFloorPlanId,
      cancelFloorPlanLocationPick,
      cancelLocationPick,
      project.projectType,
      startDraw,
    ],
  )
}
