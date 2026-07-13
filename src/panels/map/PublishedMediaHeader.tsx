import { CloseIcon } from '@/components/overlayControlIcons'
import {
  mapOverlayInsetRightClassName,
  mapOverlayInsetTopClassName,
  publishedFloatingPanelAutoClassName,
} from '@/panels/map/mapOverlayLayout'

const mediaBadgeClass =
  'text-fg-highlight inline-flex h-badge min-h-badge max-h-badge shrink-0 items-center justify-center rounded-panel bg-fg-highlight/12 px-2 text-badge font-bold leading-none'

const closeButtonClassName =
  'text-fg-muted hover:text-fg-highlight pointer-events-auto flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-panel transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

type PublishedMediaHeaderProps = {
  title: string
  typeLabel: string
  onClose: () => void
}

export function PublishedMediaHeader({ title, typeLabel, onClose }: PublishedMediaHeaderProps) {
  return (
    <header
      className={
        'pointer-events-none absolute z-20 justify-between ' +
        mapOverlayInsetTopClassName +
        ' ' +
        mapOverlayInsetRightClassName +
        ' ' +
        publishedFloatingPanelAutoClassName
      }
      aria-label="Media header"
    >
      <div className="pointer-events-auto flex min-w-0 items-center gap-2">
        <h2 className="min-w-0 truncate font-title text-title font-bold text-fg">{title}</h2>
        <span className={mediaBadgeClass}>{typeLabel}</span>
      </div>
      <button type="button" onClick={onClose} className={closeButtonClassName} aria-label="Close media">
        <CloseIcon />
      </button>
    </header>
  )
}
