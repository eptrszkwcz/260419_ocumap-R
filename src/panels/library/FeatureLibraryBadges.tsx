const badgeClassName =
  'text-fg-muted inline-flex h-badge min-h-badge max-h-badge min-w-0 shrink-0 items-center justify-center rounded-panel bg-area-highlight px-2 text-badge font-bold leading-none'

type FeatureCountBadgeProps = {
  count: number
}

/** Pill showing how many features are currently visible in the list. */
export function FeatureCountBadge({ count }: FeatureCountBadgeProps) {
  const label = count === 1 ? 'Feature' : 'Features'
  return (
    <div className={badgeClassName} role="status" aria-live="polite">
      {count} {label}
    </div>
  )
}

type FilterBadgeProps = {
  id: string
  label: string
  onRemove: (id: string) => void
}

/** Applied-filter pill with a control to clear that filter only. */
export function FilterBadge({ id, label, onRemove }: FilterBadgeProps) {
  return (
    <div className={`${badgeClassName} gap-1 pl-1 pr-2`}>
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="text-fg-muted -ml-0.5 flex size-4 shrink-0 items-center justify-center rounded focus-visible:ring-2 focus-visible:ring-fg-highlight/40 focus-visible:ring-offset-1 focus-visible:outline-none"
        aria-label={`Remove filter: ${label}`}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M2 2L8 8M8 2L2 8"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <span className="min-w-0 truncate">{label}</span>
    </div>
  )
}

export type ActiveFilter = {
  id: string
  label: string
}
