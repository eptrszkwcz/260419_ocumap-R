import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export type ProjectFloorPlan = {
  id: string
  label: string
  imageUrl: string
  width: number
  height: number
}

type ProjectFloorPlansContextValue = {
  getFloorPlans: (projectId: string) => ProjectFloorPlan[]
  addFloorPlans: (projectId: string, plans: ProjectFloorPlan[]) => void
}

const ProjectFloorPlansContext = createContext<ProjectFloorPlansContextValue | null>(null)

const EMPTY_FLOOR_PLANS: ProjectFloorPlan[] = []

export function ProjectFloorPlansProvider({ children }: { children: ReactNode }) {
  const [plansByProjectId, setPlansByProjectId] = useState<Record<string, ProjectFloorPlan[]>>({})

  const getFloorPlans = useCallback(
    (projectId: string) => plansByProjectId[projectId] ?? EMPTY_FLOOR_PLANS,
    [plansByProjectId],
  )

  const addFloorPlans = useCallback((projectId: string, plans: ProjectFloorPlan[]) => {
    if (plans.length === 0) return
    setPlansByProjectId((prev) => ({
      ...prev,
      [projectId]: [...(prev[projectId] ?? []), ...plans],
    }))
  }, [])

  return (
    <ProjectFloorPlansContext.Provider value={{ getFloorPlans, addFloorPlans }}>
      {children}
    </ProjectFloorPlansContext.Provider>
  )
}

export function useProjectFloorPlans() {
  const ctx = useContext(ProjectFloorPlansContext)
  if (ctx == null) {
    throw new Error('useProjectFloorPlans must be used within ProjectFloorPlansProvider')
  }
  return ctx
}
