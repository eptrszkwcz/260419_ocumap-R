import { createContext, useContext, useState, type ReactNode } from 'react'

import { DEFAULT_FLOOR_PLAN_ID, type FloorPlanId } from '@/panels/map/mapFloorPlans'

type ActiveFloorPlanContextValue = {
  floorPlanId: FloorPlanId
  setFloorPlanId: (id: FloorPlanId | ((current: FloorPlanId) => FloorPlanId)) => void
}

const ActiveFloorPlanContext = createContext<ActiveFloorPlanContextValue | null>(null)

export function ActiveFloorPlanProvider({ children }: { children: ReactNode }) {
  const [floorPlanId, setFloorPlanId] = useState<FloorPlanId>(DEFAULT_FLOOR_PLAN_ID)

  return (
    <ActiveFloorPlanContext.Provider value={{ floorPlanId, setFloorPlanId }}>
      {children}
    </ActiveFloorPlanContext.Provider>
  )
}

export function useActiveFloorPlan() {
  const ctx = useContext(ActiveFloorPlanContext)
  if (ctx == null) {
    throw new Error('useActiveFloorPlan must be used within ActiveFloorPlanProvider')
  }
  return ctx
}
