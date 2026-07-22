import { CloseIcon, DownloadIcon } from '@/components/overlayControlIcons'
import {
  publishedMediaFileNamePanelClassName,
} from '@/panels/map/mapOverlayLayout'

const mediaBadgeClass =
  'text-fg-highlight inline-flex h-badge min-h-badge max-h-badge shrink-0 items-center justify-center rounded-panel bg-fg-highlight/12 px-2 text-badge font-bold leading-none'

const iconButtonClassName =
  'text-fg-muted hover:text-fg-highlight flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-panel transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

type PublishedMediaFileNamePanelProps = {
  title: string
  typeLabel: string
  onClose: () => void
  showDownload?: boolean
}

export function PublishedMediaFileNamePanel({
  title,
  typeLabel,
  onClose,
  showDownload = true,
}: PublishedMediaFileNamePanelProps) {
  return (
    <div className={publishedMediaFileNamePanelClassName} aria-label="Media file name">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        <h2 className="min-w-0 truncate font-title text-title font-bold text-fg">{title}</h2>
        <span className={mediaBadgeClass}>{typeLabel}</span>
        {showDownload ? (
          <button type="button" className={iconButtonClassName} aria-label="Download media">
            <DownloadIcon />
          </button>
        ) : null}
      </div>
      <button type="button" onClick={onClose} className={iconButtonClassName} aria-label="Close media">
        <CloseIcon />
      </button>
    </div>
  )
}
