import { createPortal } from 'react-dom'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ControlHeaderToolbar } from '@/components/ControlHeaderToolbar'
import { Panel } from '@/components/Panel'
import { useProjectsDrawer } from '@/context/ProjectsDrawerContext'
import { sampleProjects } from '@/data/sampleProjects'
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

const EXPAND_WIDTH_MS = 650

export function ProjectsDrawerFromLibrary() {
  const { open, close } = useProjectsDrawer()
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)
  const [entered, setEntered] = useState(false)
  const [expanding, setExpanding] = useState(false)

  useLayoutEffect(() => {
    if (!open) {
      setEntered(false)
      setExpanding(false)
      return
    }
    setEntered(false)
    setExpanding(false)
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true))
    })
    return () => cancelAnimationFrame(id)
  }, [open])

  useEffect(() => {
    if (!expanding) return
    const el = panelRef.current
    if (el == null) return
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      navigate('/projects')
      close()
    }
    const onWidthTransitionEnd = (e: TransitionEvent) => {
      if (e.target !== el || e.propertyName !== 'width') return
      finish()
    }
    el.addEventListener('transitionend', onWidthTransitionEnd)
    const fallback = window.setTimeout(finish, EXPAND_WIDTH_MS + 200)
    return () => {
      el.removeEventListener('transitionend', onWidthTransitionEnd)
      window.clearTimeout(fallback)
    }
  }, [expanding, navigate, close])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !expanding) close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, expanding, close])

  const expandToFullProjects = () => {
    if (expanding) return
    requestAnimationFrame(() => {
      setExpanding(true)
    })
  }

  if (!open) return null

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[100] bg-fg/20"
        aria-hidden
        onClick={() => {
          if (!expanding) close()
        }}
      />
      <div
        ref={panelRef}
        style={expanding ? { transitionDuration: `${EXPAND_WIDTH_MS}ms` } : undefined}
        className={
          'fixed left-0 top-0 z-[101] flex h-full flex-col border-r border-stroke bg-page shadow-lg ease-out ' +
          (expanding
            ? 'w-screen max-w-none translate-x-0 transition-[width]'
            : `w-[400px] transition-transform duration-300 ${entered ? 'translate-x-0' : '-translate-x-full'}`)
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
              <h1 className="min-w-0 flex-1 truncate font-title text-title font-bold text-fg">Projects</h1>
            </div>
            <button
              type="button"
              onClick={expandToFullProjects}
              disabled={expanding}
              className="text-fg-muted hover:bg-area-highlight hover:text-fg focus-visible:ring-fg-highlight/40 flex size-icon-button shrink-0 items-center justify-center rounded-panel transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
              aria-label="Open full projects page"
            >
              <ChevronRightIcon />
            </button>
          </header>
          <Panel className="!border-0 !bg-transparent mt-6 flex min-h-0 min-w-0 flex-1 flex-col p-0 shadow-none">
            <ControlHeaderToolbar
              id="control-header-projects"
              toolbarAriaLabel="Projects list actions"
              showSecondaryActions={false}
              addButtonVisibleLabel="New Project"
              addButtonAriaLabel="New project"
              addButtonLabelMaxWidthClass="max-w-[7.5rem]"
            />
            <ProjectsBadgeRow projectCount={sampleProjects.length} />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <ProjectsDrawerTable projects={sampleProjects} onCloseDrawer={close} />
            </div>
          </Panel>
        </div>
      </div>
    </>,
    document.body,
  )
}
