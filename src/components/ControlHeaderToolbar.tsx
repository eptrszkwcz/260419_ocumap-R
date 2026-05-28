import { useEffect, useRef, useState } from 'react'

import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'

/** 2×2 grid — thumbnail / gallery view. */
function ThumbnailGridIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect x="2.5" y="2.5" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1" />
      <rect x="8.5" y="2.5" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1" />
      <rect x="2.5" y="8.5" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1" />
      <rect x="8.5" y="8.5" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

/** Two side-by-side column panes — same stroke, rx, and 16×16 layout bounds as the thumbnail grid. */
function ColumnsIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect x="2.5" y="2.5" width="5" height="11" rx="0.5" stroke="currentColor" strokeWidth="1" />
      <rect x="8.5" y="2.5" width="5" height="11" rx="0.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function FunnelIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M2.5 3h11l-4.25 5v4.5L7 12.5V8L2.5 3Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1" />
      <path
        d="M10 10l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M9 3.5v11M3.5 9h11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

const secondaryConfig = [
  { id: 'view' as const, label: 'View', Icon: ThumbnailGridIcon },
  { id: 'columns' as const, label: 'Columns', Icon: ColumnsIcon },
  { id: 'filters' as const, label: 'Filters', Icon: FunnelIcon },
]

const ADD_PRIMARY_REVEAL_MS = 500
const ADD_PRIMARY_HIDE_DELAY_MS = 100
const ADD_PRIMARY_ROLL_MS = 600

export function PrimaryAddButton({
  onAddClick,
  visibleLabel,
  ariaLabel,
  labelMaxWidthClass,
  alwaysExpanded = false,
}: {
  onAddClick?: () => void
  visibleLabel: string
  ariaLabel: string
  labelMaxWidthClass: string
  /** When true, show label and wide frame without hover (e.g. projects page). */
  alwaysExpanded?: boolean
}) {
  const [labelVisible, setLabelVisible] = useState(alwaysExpanded)
  const [frameExpanded, setFrameExpanded] = useState(alwaysExpanded)
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (alwaysExpanded || labelVisible) {
      setFrameExpanded(true)
      return
    }
    const t = window.setTimeout(() => {
      setFrameExpanded(false)
    }, ADD_PRIMARY_ROLL_MS)
    return () => {
      clearTimeout(t)
    }
  }, [labelVisible, alwaysExpanded])

  useEffect(() => {
    return () => {
      if (showTimerRef.current != null) {
        clearTimeout(showTimerRef.current)
      }
      if (hideTimerRef.current != null) {
        clearTimeout(hideTimerRef.current)
      }
    }
  }, [])

  const clearShowTimer = () => {
    if (showTimerRef.current != null) {
      clearTimeout(showTimerRef.current)
      showTimerRef.current = null
    }
  }

  const clearHideTimer = () => {
    if (hideTimerRef.current != null) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }

  return (
    <button
      type="button"
      onClick={() => onAddClick?.()}
      onPointerEnter={
        alwaysExpanded
          ? undefined
          : () => {
              clearShowTimer()
              clearHideTimer()
              showTimerRef.current = setTimeout(() => {
                setLabelVisible(true)
                showTimerRef.current = null
              }, ADD_PRIMARY_REVEAL_MS)
            }
      }
      onPointerLeave={
        alwaysExpanded
          ? undefined
          : () => {
              clearShowTimer()
              clearHideTimer()
              hideTimerRef.current = setTimeout(() => {
                setLabelVisible(false)
                hideTimerRef.current = null
              }, ADD_PRIMARY_HIDE_DELAY_MS)
            }
      }
      className={
        PRIMARY_BUTTON_CLASS +
        ' flex h-8 min-h-8 shrink-0 items-center rounded-panel ' +
        (frameExpanded
          ? 'w-auto min-w-0 justify-start gap-1.5 pl-1.5 pr-2.5'
          : 'w-8 min-w-8 justify-center p-0')
      }
      aria-label={ariaLabel}
    >
      <span className="shrink-0" aria-hidden>
        <PlusIcon />
      </span>
      <span
        className={
          'block min-w-0 overflow-hidden text-left text-standard leading-none ' +
          'transition-[max-width] duration-[600ms] ease-out ' +
          (labelVisible || alwaysExpanded ? labelMaxWidthClass : 'max-w-0')
        }
        aria-hidden={!labelVisible && !alwaysExpanded}
      >
        <span className="inline-block whitespace-nowrap pr-0.5">{visibleLabel}</span>
      </span>
    </button>
  )
}

export type ControlHeaderToolbarProps = {
  id: string
  toolbarAriaLabel: string
  /** When false, hide View / Columns / Filters (search + primary only). */
  showSecondaryActions?: boolean
  searchPlaceholder?: string
  /** Shown when the primary button label expands on hover (e.g. "Add Feature"). */
  addButtonVisibleLabel?: string
  addButtonAriaLabel?: string
  /** Tailwind max-width when label is visible; widen for longer copy. */
  addButtonLabelMaxWidthClass?: string
  /** Keep primary add button fully expanded (no hover reveal). */
  addButtonAlwaysExpanded?: boolean
  onAddClick?: () => void
}

const defaultSearchPlaceholder = 'Search here...'

/**
 * Shared control strip: View / Columns / Filters, search, primary add action.
 * Used by the feature library (`control-header-feature-lib`) and projects table (`control-header-projects`).
 */
export function ControlHeaderToolbar({
  id,
  toolbarAriaLabel,
  showSecondaryActions = true,
  searchPlaceholder = defaultSearchPlaceholder,
  addButtonVisibleLabel = 'Add Feature',
  addButtonAriaLabel = 'Add feature',
  addButtonLabelMaxWidthClass = 'max-w-[6.75rem]',
  addButtonAlwaysExpanded = false,
  onAddClick,
}: ControlHeaderToolbarProps) {
  const [activeId, setActiveId] = useState<(typeof secondaryConfig)[number]['id'] | null>(null)
  const projectsChrome = id === 'control-header-projects'

  return (
    <div
      id={id}
      className={
        'flex h-16 w-full shrink-0 items-center gap-3 px-panel-padding ' +
        (projectsChrome ? 'border-b-0 bg-transparent' : 'border-b border-stroke')
      }
      role="toolbar"
      aria-label={toolbarAriaLabel}
    >
      {showSecondaryActions ? (
        <div className="flex shrink-0 items-center gap-1">
          {secondaryConfig.map(({ id: btnId, label, Icon }) => {
            const isActive = activeId === btnId
            return (
              <button
                key={btnId}
                type="button"
                onClick={() => setActiveId((prev) => (prev === btnId ? null : btnId))}
                className={`text-fg flex h-8 max-h-8 min-h-8 items-center gap-1 rounded-panel px-3 text-standard leading-none transition-colors hover:bg-area-highlight focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none ${isActive ? 'bg-area-highlight' : ''}`}
                aria-pressed={isActive}
              >
                <span className="text-fg-muted shrink-0" aria-hidden>
                  <Icon />
                </span>
                {label}
              </button>
            )
          })}
        </div>
      ) : null}

      <div className="relative min-w-0 flex-1">
        <div className="text-fg-muted pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2">
          <SearchIcon />
        </div>
        <input
          type="search"
          placeholder={searchPlaceholder}
          className="text-fg placeholder:text-fg-disabled h-8 w-full min-w-0 rounded-panel border border-stroke bg-panel pl-9 pr-3 text-standard leading-none focus-visible:border-fg-highlight focus-visible:ring-1 focus-visible:ring-fg-highlight/35 focus-visible:outline-none"
        />
      </div>

      <PrimaryAddButton
        onAddClick={onAddClick}
        visibleLabel={addButtonVisibleLabel}
        ariaLabel={addButtonAriaLabel}
        labelMaxWidthClass={addButtonLabelMaxWidthClass}
        alwaysExpanded={addButtonAlwaysExpanded}
      />
    </div>
  )
}
