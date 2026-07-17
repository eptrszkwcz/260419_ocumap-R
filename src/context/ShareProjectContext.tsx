import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import type { ProjectRecord } from '@/data/sampleProjects'
import { ShareProjectModal } from '@/pages/projects/ShareProjectModal'

type ShareProjectContextValue = {
  openShareModal: (project: ProjectRecord) => void
  closeShareModal: () => void
}

const ShareProjectContext = createContext<ShareProjectContextValue | null>(null)

export function ShareProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<ProjectRecord | null>(null)

  const openShareModal = useCallback((next: ProjectRecord) => {
    setProject(next)
  }, [])

  const closeShareModal = useCallback(() => {
    setProject(null)
  }, [])

  const handleSave = useCallback(() => {
    setProject(null)
  }, [])

  const value = useMemo(
    (): ShareProjectContextValue => ({
      openShareModal,
      closeShareModal,
    }),
    [openShareModal, closeShareModal],
  )

  return (
    <ShareProjectContext.Provider value={value}>
      {children}
      {project != null ? (
        <ShareProjectModal project={project} onClose={closeShareModal} onSave={handleSave} />
      ) : null}
    </ShareProjectContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useShareProject(): ShareProjectContextValue {
  const ctx = useContext(ShareProjectContext)
  if (ctx == null) {
    throw new Error('useShareProject must be used within ShareProjectProvider')
  }
  return ctx
}
