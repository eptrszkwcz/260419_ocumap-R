import { createPortal } from 'react-dom'
import { useEffect, useLayoutEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ControlHeaderToolbar } from '@/components/ControlHeaderToolbar'
import { Panel } from '@/components/Panel'
import { useProjects } from '@/context/ProjectsContext'
import { useProjectsDrawer } from '@/context/ProjectsDrawerContext'
import { NEW_PROJECT_ID } from '@/data/sampleProjects'
import { ProjectsBadgeRow } from '@/pages/ProjectsBadgeRow'
import { ProjectsDrawerTable } from '@/pages/ProjectsDrawerTable'

function ChevronRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M7.5 4.5L13 10l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ProjectsDrawerFromLibrary() {
  const { open, close } = useProjectsDrawer()
  const navigate = useNavigate()
  const { projects } = useProjects()
  const [entered, setEntered] = useState(false)

  useLayoutEffect(() => {
    if (!open) {
      setEntered(false)
      return
    }
    setEntered(false)
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true))
    })
    return () => cancelAnimationFrame(id)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  const goToProjectsPage = () => {
    navigate('/projects')
    close()
  }

  if (!open) return null

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] bg-fg/20" aria-hidden onClick={close} />
      <div
        className={
          'fixed left-0 top-0 z-[101] flex h-full w-[400px] flex-col border-r border-stroke bg-page shadow-lg ease-out transition-transform duration-300 ' +
          (entered ? 'translate-x-0' : '-translate-x-full')
        }
        role="dialog"
        aria-modal="true"
        aria-label="Projects list"
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col p-page">
          <header className="flex h-header shrink-0 items-center justify-between gap-4 pl-panel-padding">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex shrink-0 items-center">
                <img
                  src="/brand/ocumap-o-logo.svg"
                  alt="OcuMap"
                  className="h-9 w-auto"
                  width={33}
                  height={40}
                />
              </div>
              <button
                type="button"
                onClick={goToProjectsPage}
                className="min-w-0 flex-1 truncate text-left font-title text-title font-bold text-fg transition-colors hover:text-fg-highlight focus-visible:ring-2 focus-visible:ring-fg-highlight/40 focus-visible:outline-none"
              >
                Projects
              </button>
            </div>
            <button
              type="button"
              onClick={goToProjectsPage}
              className="text-fg-muted hover:bg-area-highlight hover:text-fg focus-visible:ring-fg-highlight/40 flex size-icon-button shrink-0 items-center justify-center rounded-panel transition-colors focus-visible:ring-2 focus-visible:outline-none"
              aria-label="Open full projects page"
            >
              <ChevronRightIcon />
            </button>
          </header>
          <Panel className="!border-0 !bg-transparent mt-[52px] flex min-h-0 min-w-0 flex-1 flex-col p-0 shadow-none">
            <ControlHeaderToolbar
              id="control-header-projects"
              toolbarAriaLabel="Projects list actions"
              showSecondaryActions={false}
              addButtonVisibleLabel="New Project"
              addButtonAriaLabel="New project"
              addButtonLabelMaxWidthClass="max-w-[7.5rem]"
              onAddClick={() => {
                close()
                navigate(`/library?project=${NEW_PROJECT_ID}`)
              }}
            />
            <ProjectsBadgeRow projectCount={projects.length} />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <ProjectsDrawerTable projects={projects} onCloseDrawer={close} />
            </div>
          </Panel>
        </div>
      </div>
    </>,
    document.body,
  )
}
