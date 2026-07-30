import { useMediaMarkerFlow } from '@/context/MediaMarkerFlowContext'

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M4 4l8 8M12 4L4 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

const mediaBadgeClass =
  'text-fg-highlight inline-flex h-badge min-h-badge max-h-badge min-w-0 shrink-0 items-center justify-center rounded-panel bg-fg-highlight/12 px-2 text-badge font-bold leading-none'

const iconBtnClass =
  'text-fg-muted hover:text-fg-highlight flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-panel transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

export function MarkerPanelHeader() {
  const { panelPhase, draftMarker, requestCloseMarkerPanel } = useMediaMarkerFlow()

  const title = draftMarker?.name?.trim() || 'New marker'
  const showDate = panelPhase === 'metadata' && draftMarker?.dateAdded != null

  return (
    <div
      className="flex h-16 w-full shrink-0 items-center gap-3 border-b border-stroke px-panel-padding"
      role="toolbar"
      aria-label="Marker details"
    >
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <h2 className="min-w-0 flex-1 truncate font-title text-title font-bold text-fg">{title}</h2>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={mediaBadgeClass}>Marker</span>
        {showDate ? <span className={mediaBadgeClass}>{draftMarker.dateAdded}</span> : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={requestCloseMarkerPanel}
          className={iconBtnClass}
          aria-label="Close marker panel"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  )
}
