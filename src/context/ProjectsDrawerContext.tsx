import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

type ProjectsDrawerContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  close: () => void
}

const ProjectsDrawerContext = createContext<ProjectsDrawerContextValue | null>(null)

export function ProjectsDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  const toggle = useCallback(() => {
    setOpen((o) => !o)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
  }, [])

  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggle,
      close,
    }),
    [open],
  )

  return <ProjectsDrawerContext.Provider value={value}>{children}</ProjectsDrawerContext.Provider>
}

export function useProjectsDrawer(): ProjectsDrawerContextValue {
  const ctx = useContext(ProjectsDrawerContext)
  if (ctx == null) {
    return {
      open: false,
      setOpen: (_open: boolean) => {},
      toggle: () => {},
      close: () => {},
    }
  }
  return ctx
}
