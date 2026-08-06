import { createPortal } from 'react-dom'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ControlHeaderToolbar } from '@/components/ControlHeaderToolbar'
import { OcuMapFullLogo } from '@/components/OcuMapFullLogo'
import { Panel } from '@/components/Panel'
import { useProjects } from '@/context/ProjectsContext'
import { useProjectsDrawer } from '@/context/ProjectsDrawerContext'
import { NEW_PROJECT_ID } from '@/data/sampleProjects'
import { ProjectsBadgeRow } from '@/pages/ProjectsBadgeRow'
import { ProjectsDrawerTable } from '@/pages/ProjectsDrawerTable'

const DRAWER_SLIDE_MS = 300

export function ProjectsDrawerFromLibrary() {
  const { open, close } = useProjectsDrawer()
  const navigate = useNavigate()
  const { projects } = useProjects()
  const [entered, setEntered] = useState(false)
  const [closingToProjects, setClosingToProjects] = useState(false)
  const navigateTimeoutRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    if (!open) {
      setEntered(false)
      setClosingToProjects(false)
      return
    }
    if (closingToProjects) return
    setEntered(false)
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true))
    })
    return () => cancelAnimationFrame(id)
  }, [open, closingToProjects])

  useEffect(() => {
    return () => {
      if (navigateTimeoutRef.current != null) {
        window.clearTimeout(navigateTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!open || closingToProjects) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close, closingToProjects])

  const goToProjectsPage = () => {
    if (closingToProjects) return
    setClosingToProjects(true)
    setEntered(false)
    navigateTimeoutRef.current = window.setTimeout(() => {
      navigateTimeoutRef.current = null
      navigate('/projects')
      close()
    }, DRAWER_SLIDE_MS)
  }

  if (!open) return null

  return createPortal(
    <>
      <div
        className={
          'fixed inset-0 z-[100] bg-fg/20 transition-opacity duration-300 ease-out ' +
          (entered ? 'opacity-100' : 'opacity-0')
        }
        aria-hidden
        onClick={() => {
          if (!closingToProjects) close()
        }}
      />
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
          <header className="flex h-header shrink-0 items-center pl-panel-padding">
            <button
              type="button"
              onClick={goToProjectsPage}
              disabled={closingToProjects}
              className="cursor-pointer rounded-panel focus-visible:ring-2 focus-visible:ring-fg-highlight/40 focus-visible:outline-none disabled:cursor-pointer"
              aria-label="Open projects page"
            >
              <OcuMapFullLogo />
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
