import { useMemo, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'

import {
  ActiveProjectContext,
  type ActiveProjectContextValue,
} from '@/context/ActiveProjectContext'
import { NewProjectProvider } from '@/context/NewProjectContext'
import { useProjects } from '@/context/ProjectsContext'

function PublishedProjectNotFound() {
  return (
    <div className="flex h-full min-h-0 items-center justify-center bg-page p-page">
      <p className="font-sans text-standard text-fg-muted">Published project not found.</p>
    </div>
  )
}

export function PublishedActiveProjectProvider({ children }: { children: ReactNode }) {
  const { projectId: rawId } = useParams()
  const { getProjectById } = useProjects()
  const projectId = rawId?.trim() ?? ''
  const project = projectId !== '' ? getProjectById(projectId) : undefined

  const value = useMemo((): ActiveProjectContextValue | null => {
    if (project == null) return null
    return { project, projectId: project.id, isNewProject: false }
  }, [project, projectId])

  if (value == null) {
    return <PublishedProjectNotFound />
  }

  return (
    <NewProjectProvider isNewProject={false}>
      <ActiveProjectContext.Provider value={value}>{children}</ActiveProjectContext.Provider>
    </NewProjectProvider>
  )
}
