import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  DEMO_OPENS_LIBRARY_PROJECT_ID,
  getProjectById,
  type ProjectRecord,
} from '@/data/sampleProjects'

const QUERY_KEY = 'project'

type ActiveProjectContextValue = {
  project: ProjectRecord
  projectId: string
}

const ActiveProjectContext = createContext<ActiveProjectContextValue | null>(null)

export function ActiveProjectProvider({ children }: { children: ReactNode }) {
  const [searchParams] = useSearchParams()
  const value = useMemo((): ActiveProjectContextValue => {
    const raw = searchParams.get(QUERY_KEY)?.trim()
    const resolved =
      raw != null && raw !== '' ? getProjectById(raw) : getProjectById(DEMO_OPENS_LIBRARY_PROJECT_ID)
    const project = resolved ?? getProjectById(DEMO_OPENS_LIBRARY_PROJECT_ID)!
    return { project, projectId: project.id }
  }, [searchParams])

  return <ActiveProjectContext.Provider value={value}>{children}</ActiveProjectContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useActiveProject(): ActiveProjectContextValue {
  const ctx = useContext(ActiveProjectContext)
  if (ctx == null) {
    throw new Error('useActiveProject must be used within ActiveProjectProvider')
  }
  return ctx
}
