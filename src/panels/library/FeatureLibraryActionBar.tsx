import { ArrowDownTrayIcon, ShareIcon, TrashIcon } from '@heroicons/react/24/outline'

const actionBarClassName =
  'text-fg-muted flex h-[24px] w-full min-w-0 items-stretch gap-0 overflow-hidden rounded-panel bg-area-highlight p-0 text-[12.5px] font-bold leading-[18px]'

const actionSegmentClassName =
  'text-fg-muted inline-flex h-full shrink-0 cursor-pointer items-center gap-1 px-2 text-[12.5px] font-bold leading-[18px] transition-colors hover:text-fg-highlight focus-visible:ring-2 focus-visible:ring-fg-highlight/40 focus-visible:ring-inset focus-visible:outline-none'

const iconClassName = 'size-3.5 shrink-0'

type FeatureLibraryActionBarProps = {
  selectedCount: number
  onClearSelection: () => void
  onShare: () => void
  onDownload: () => void
  onDelete: () => void
}

/** Elongated badge-style bulk action strip when one or more features are selected. */
export function FeatureLibraryActionBar({
  selectedCount,
  onClearSelection,
  onShare,
  onDownload,
  onDelete,
}: FeatureLibraryActionBarProps) {
  const label = selectedCount === 1 ? 'Feature selected' : 'Features selected'

  return (
    <div
      id="action-bar"
      className={actionBarClassName}
      role="toolbar"
      aria-label="Selected feature actions"
    >
      <div className="flex h-full w-full items-stretch justify-between">
        <div className="flex h-full shrink-0 items-center gap-1 pl-1 pr-2" role="status" aria-live="polite">
          <button
            type="button"
            onClick={onClearSelection}
            className="text-fg-muted -ml-0.5 flex size-4 shrink-0 cursor-pointer items-center justify-center rounded focus-visible:ring-2 focus-visible:ring-fg-highlight/40 focus-visible:ring-inset focus-visible:outline-none"
            aria-label="Clear selection"
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
          <span className="min-w-0 truncate whitespace-nowrap">
            {selectedCount} {label}
          </span>
        </div>
        <div className="flex h-full shrink-0 items-stretch">
          <button type="button" onClick={onShare} className={actionSegmentClassName} aria-label="Share selected features">
            <ShareIcon className={iconClassName} aria-hidden />
            Share
          </button>
          <button
            type="button"
            onClick={onDownload}
            className={actionSegmentClassName}
            aria-label="Download selected features"
          >
            <ArrowDownTrayIcon className={iconClassName} aria-hidden />
            Download
          </button>
          <button type="button" onClick={onDelete} className={actionSegmentClassName} aria-label="Delete selected features">
            <TrashIcon className={iconClassName} aria-hidden />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
