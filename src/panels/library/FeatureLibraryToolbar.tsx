import { useState } from 'react'

function SplitPaneIcon({ className = '' }: { className?: string }) {
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
      <rect x="2" y="2" width="5" height="12" rx="1" stroke="currentColor" strokeWidth="1.25" />
      <rect x="9" y="2" width="5" height="12" rx="1" stroke="currentColor" strokeWidth="1.25" />
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
        strokeWidth="1.25"
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
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M10 10l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.25"
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
  { id: 'view' as const, label: 'View', Icon: SplitPaneIcon },
  { id: 'columns' as const, label: 'Columns', Icon: SplitPaneIcon },
  { id: 'filters' as const, label: 'Filters', Icon: FunnelIcon },
]

export function FeatureLibraryToolbar() {
  const [activeId, setActiveId] = useState<(typeof secondaryConfig)[number]['id'] | null>(null)

  return (
    <div
      className="flex h-16 w-full shrink-0 items-center gap-3 border-b border-stroke px-panel-padding"
      role="toolbar"
      aria-label="Feature library actions"
    >
      <div className="flex shrink-0 items-center gap-1">
        {secondaryConfig.map(({ id, label, Icon }) => {
          const isActive = activeId === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveId((prev) => (prev === id ? null : id))}
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

      <div className="relative min-w-0 flex-1">
        <div className="text-fg-muted pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2">
          <SearchIcon />
        </div>
        <input
          type="search"
          placeholder="Search here..."
          className="text-fg placeholder:text-fg-disabled h-8 w-full min-w-0 rounded-panel border border-stroke bg-panel pl-9 pr-3 text-standard leading-none focus-visible:border-fg-highlight focus-visible:ring-1 focus-visible:ring-fg-highlight/35 focus-visible:outline-none"
        />
      </div>

      <button
        type="button"
        className="bg-fg-highlight flex h-8 w-8 shrink-0 items-center justify-center rounded-panel text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-fg-highlight/50 focus-visible:outline-none"
        aria-label="Add"
      >
        <PlusIcon />
      </button>
    </div>
  )
}
