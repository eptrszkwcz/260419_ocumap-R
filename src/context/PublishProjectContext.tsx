import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import { useProjects } from '@/context/ProjectsContext'
import type { ProjectRecord } from '@/data/sampleProjects'
import { openPublishedProjectInNewTab } from '@/lib/publishedProjectUrl'
import { PublishProjectModal } from '@/pages/projects/PublishProjectModal'

type PublishProjectContextValue = {
  openPublishModal: (project: ProjectRecord) => void
  closePublishModal: () => void
}

const PublishProjectContext = createContext<PublishProjectContextValue | null>(null)

export function PublishProjectProvider({ children }: { children: ReactNode }) {
  const { publishProject } = useProjects()
  const [project, setProject] = useState<ProjectRecord | null>(null)

  const openPublishModal = useCallback((next: ProjectRecord) => {
    setProject(next)
  }, [])

  const closePublishModal = useCallback(() => {
    setProject(null)
  }, [])

  const handleConfirm = useCallback(() => {
    if (project == null) return
    publishProject(project.id)
    openPublishedProjectInNewTab(project.id)
    setProject(null)
  }, [project, publishProject])

  const value = useMemo(
    (): PublishProjectContextValue => ({
      openPublishModal,
      closePublishModal,
    }),
    [openPublishModal, closePublishModal],
  )

  return (
    <PublishProjectContext.Provider value={value}>
      {children}
      {project != null ? (
        <PublishProjectModal project={project} onClose={closePublishModal} onConfirm={handleConfirm} />
      ) : null}
    </PublishProjectContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function usePublishProject(): PublishProjectContextValue {
  const ctx = useContext(PublishProjectContext)
  if (ctx == null) {
    throw new Error('usePublishProject must be used within PublishProjectProvider')
  }
  return ctx
}
