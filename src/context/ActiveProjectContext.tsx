import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'

import { NewProjectProvider } from '@/context/NewProjectContext'
import { useProjects } from '@/context/ProjectsContext'
import {
  DEMO_OPENS_LIBRARY_PROJECT_ID,
  NEW_PROJECT_ID,
  type ProjectRecord,
} from '@/data/sampleProjects'

const QUERY_KEY = 'project'

type ActiveProjectContextValue = {
  project: ProjectRecord
  projectId: string
  isNewProject: boolean
}

const ActiveProjectContext = createContext<ActiveProjectContextValue | null>(null)

function ActiveProjectInner({ children }: { children: ReactNode }) {
  const [searchParams] = useSearchParams()
  const { getProjectById } = useProjects()
  const raw = searchParams.get(QUERY_KEY)?.trim()
  const isNewProject = raw === NEW_PROJECT_ID

  const value = useMemo((): ActiveProjectContextValue => {
    if (isNewProject) {
      return {
        projectId: NEW_PROJECT_ID,
        isNewProject: true,
        project: {
          id: NEW_PROJECT_ID,
          name: 'New Project',
          status: 'Draft',
          team: '',
          lastModified: '',
          featureFileCount: 0,
          createdRelative: 'Just now',
          projectType: 'Building',
        },
      }
    }
    const resolved =
      raw != null && raw !== ''
        ? getProjectById(raw)
        : getProjectById(DEMO_OPENS_LIBRARY_PROJECT_ID)
    const project = resolved ?? getProjectById(DEMO_OPENS_LIBRARY_PROJECT_ID)!
    return { project, projectId: project.id, isNewProject: false }
  }, [getProjectById, isNewProject, raw])

  return (
    <NewProjectProvider isNewProject={isNewProject}>
      <ActiveProjectContext.Provider value={value}>{children}</ActiveProjectContext.Provider>
    </NewProjectProvider>
  )
}

export function ActiveProjectProvider({ children }: { children: ReactNode }) {
  return <ActiveProjectInner>{children}</ActiveProjectInner>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useActiveProject(): ActiveProjectContextValue {
  const ctx = useContext(ActiveProjectContext)
  if (ctx == null) {
    throw new Error('useActiveProject must be used within ActiveProjectProvider')
  }
  return ctx
}
