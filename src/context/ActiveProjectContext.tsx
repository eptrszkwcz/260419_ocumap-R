import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { NewProjectProvider } from '@/context/NewProjectContext'
import { useProjects } from '@/context/ProjectsContext'
import {
  DEMO_OPENS_LIBRARY_PROJECT_ID,
  NEW_PROJECT_ID,
  resolveLibraryProjectId,
  type ProjectRecord,
} from '@/data/sampleProjects'

const QUERY_KEY = 'project'

type ActiveProjectContextValue = {
  project: ProjectRecord
  projectId: string
  isNewProject: boolean
}

export type { ActiveProjectContextValue }

export const ActiveProjectContext = createContext<ActiveProjectContextValue | null>(null)

function ActiveProjectInner({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { getProjectById } = useProjects()
  const raw = searchParams.get(QUERY_KEY)?.trim()
  const isNewProject = raw === NEW_PROJECT_ID

  useEffect(() => {
    if (isNewProject || raw == null || raw === '') return
    const resolved = resolveLibraryProjectId(raw)
    if (resolved !== raw) {
      navigate(`/library?project=${encodeURIComponent(resolved)}`, { replace: true })
    }
  }, [isNewProject, navigate, raw])

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
          projectSizeMb: 0,
          createdRelative: 'Just now',
          createdIso: '',
          projectType: 'Building',
        },
      }
    }
    const projectId =
      raw != null && raw !== ''
        ? resolveLibraryProjectId(raw)
        : DEMO_OPENS_LIBRARY_PROJECT_ID
    const project = getProjectById(projectId) ?? getProjectById(DEMO_OPENS_LIBRARY_PROJECT_ID)!
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
