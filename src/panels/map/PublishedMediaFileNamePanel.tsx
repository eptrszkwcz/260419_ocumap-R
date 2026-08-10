import { CloseIcon, DownloadIcon } from '@/components/overlayControlIcons'

const mediaBadgeClass =
  'text-fg-highlight inline-flex h-badge min-h-badge max-h-badge max-w-[6.5rem] shrink-0 items-center justify-center truncate rounded-panel bg-fg-highlight/12 px-2 text-badge font-bold leading-none'

const iconButtonClassName =
  'text-fg-muted hover:text-fg-highlight flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-panel transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

const closeButtonClassName =
  'text-fg hover:text-fg-highlight flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-panel transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

type PublishedMediaFileNamePanelProps = {
  title: string
  typeLabel: string
  onClose: () => void
  showDownload?: boolean
  /** When true, stretch to parent stack/split column width. */
  embedded?: boolean
  /** Tighter padding for phone portrait / landscape. */
  compact?: boolean
}

export function PublishedMediaFileNamePanel({
  title,
  typeLabel,
  onClose,
  showDownload = true,
  embedded = false,
  compact = false,
}: PublishedMediaFileNamePanelProps) {
  const widthClassName = embedded ? 'w-full min-w-0' : 'w-full max-w-[400px]'
  const paddingClassName = compact ? 'gap-2 px-3' : 'gap-4 px-panel-padding'

  return (
    <div
      className={
        'flex h-header items-center justify-between overflow-hidden rounded-panel border border-fg bg-panel shadow-lg ' +
        paddingClassName +
        ' ' +
        widthClassName
      }
      aria-label="Media file name"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        <h2
          className="min-w-0 flex-1 truncate font-title text-title font-bold text-fg"
          title={title}
        >
          {title}
        </h2>
        <span className={mediaBadgeClass} title={typeLabel}>
          {typeLabel}
        </span>
        {showDownload ? (
          <button type="button" className={iconButtonClassName} aria-label="Download media">
            <DownloadIcon />
          </button>
        ) : null}
      </div>
      <button type="button" onClick={onClose} className={closeButtonClassName} aria-label="Close media">
        <CloseIcon />
      </button>
    </div>
  )
}
