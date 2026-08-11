import type { ReactNode } from 'react'

export type SortDirection = 'asc' | 'desc'

const sortArrowBadgeClassName =
  'text-fg-muted inline-flex size-[20px] shrink-0 items-center justify-center rounded-full bg-area-highlight'

function SortArrowIcon({
  direction,
  className = '',
}: {
  direction: SortDirection
  className?: string
}) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={'shrink-0 ' + className}
    >
      {direction === 'asc' ? (
        <>
          <path d="M7 10.5V5.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
          <path d="M7 2.75 4.25 6.25h5.5L7 2.75Z" fill="currentColor" />
        </>
      ) : (
        <>
          <path d="M7 3.5v6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
          <path d="M7 11.25 9.75 7.75h-5.5L7 11.25Z" fill="currentColor" />
        </>
      )}
    </svg>
  )
}

function SortArrowBadge({ direction }: { direction: SortDirection }) {
  return (
    <span className={sortArrowBadgeClassName} aria-hidden>
      <SortArrowIcon direction={direction} />
    </span>
  )
}

type SortableColumnHeaderProps = {
  label: string
  activeDirection?: SortDirection | null
  onSort: () => void
  className?: string
  align?: 'left' | 'right'
}

/** Clickable column header with an arrow when this column is the active sort. */
export function SortableColumnHeader({
  label,
  activeDirection = null,
  onSort,
  className = '',
  align = 'left',
}: SortableColumnHeaderProps) {
  const alignClass = align === 'right' ? 'justify-end text-right' : 'justify-start text-left'

  return (
    <button
      type="button"
      onClick={onSort}
      className={
        'inline-flex max-w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-panel font-bold transition-colors hover:text-fg-highlight focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none ' +
        alignClass +
        ' ' +
        className
      }
      aria-label={
        activeDirection != null
          ? `Sort by ${label}, ${activeDirection === 'asc' ? 'ascending' : 'descending'}`
          : `Sort by ${label}`
      }
    >
      <span className="min-w-0 truncate">{label}</span>
      {activeDirection != null ? <SortArrowBadge direction={activeDirection} /> : null}
    </button>
  )
}

type IconSortableColumnHeaderProps = {
  label: string
  activeDirection?: SortDirection | null
  onSort: () => void
  children: ReactNode
  className?: string
}

/**
 * Narrow icon-only sort control (no arrow badge). Active sort uses highlight color.
 */
export function IconSortableColumnHeader({
  label,
  activeDirection = null,
  onSort,
  children,
  className = '',
}: IconSortableColumnHeaderProps) {
  const isActive = activeDirection != null

  return (
    <button
      type="button"
      onClick={onSort}
      className={
        'inline-flex size-full cursor-pointer items-center justify-center rounded-panel transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none ' +
        (isActive
          ? 'text-fg-highlight'
          : 'text-fg-muted hover:text-fg-highlight') +
        ' ' +
        className
      }
      aria-label={
        isActive
          ? `Sort by ${label}, ${activeDirection === 'asc' ? 'ascending' : 'descending'}`
          : `Sort by ${label}`
      }
      aria-sort={
        activeDirection === 'asc'
          ? 'ascending'
          : activeDirection === 'desc'
            ? 'descending'
            : undefined
      }
    >
      {children}
    </button>
  )
}

export function nextSortDirection(
  currentColumn: string,
  clickedColumn: string,
  currentDirection: SortDirection,
): SortDirection {
  if (currentColumn === clickedColumn) {
    return currentDirection === 'asc' ? 'desc' : 'asc'
  }
  return 'asc'
}
