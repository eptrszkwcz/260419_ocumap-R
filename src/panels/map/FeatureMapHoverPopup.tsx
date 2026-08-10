import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const OFFSET_X_PX = 12
const OFFSET_Y_PX = 8
const VIEWPORT_MARGIN_PX = 8

const POPUP_MAX_WIDTH_HOVER_PX = 240
const POPUP_MAX_WIDTH_ACTION_PX = 280

const typeBadgeClassName =
  'text-fg-highlight mt-0.5 inline-flex max-h-5 shrink-0 items-center justify-center self-start rounded-panel bg-fg-highlight/12 px-1.5 text-[11px] font-bold leading-none'

const viewFeatureButtonClassName =
  'text-fg-highlight hover:bg-area-highlight mt-2 flex h-button w-full cursor-pointer items-center justify-center rounded-panel border border-fg-highlight bg-panel px-3 font-sans text-standard font-bold leading-none shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

type FeatureMapHoverPopupProps = {
  title: string
  typeLabel?: string
  previewUrl?: string
  anchor: { clientX: number; clientY: number }
  /** When set, popup is interactive and shows a View feature CTA (touch / no-hover). */
  onViewFeature?: () => void
}

export function FeatureMapHoverPopup({
  title,
  typeLabel,
  previewUrl,
  anchor,
  onViewFeature,
}: FeatureMapHoverPopupProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ left: 0, top: 0 })
  const interactive = onViewFeature != null
  const maxWidthPx = interactive ? POPUP_MAX_WIDTH_ACTION_PX : POPUP_MAX_WIDTH_HOVER_PX

  useLayoutEffect(() => {
    const panel = panelRef.current
    const vw = window.innerWidth
    const vh = window.innerHeight
    const w = panel?.offsetWidth ?? maxWidthPx
    const h = panel?.offsetHeight ?? (interactive ? 120 : 72)

    let left = anchor.clientX + OFFSET_X_PX
    let top = anchor.clientY - OFFSET_Y_PX - h

    if (left + w + VIEWPORT_MARGIN_PX > vw) {
      left = Math.max(VIEWPORT_MARGIN_PX, anchor.clientX - OFFSET_X_PX - w)
    }
    if (left < VIEWPORT_MARGIN_PX) left = VIEWPORT_MARGIN_PX

    if (top < VIEWPORT_MARGIN_PX) {
      top = anchor.clientY + OFFSET_Y_PX
    }
    if (top + h + VIEWPORT_MARGIN_PX > vh) {
      top = Math.max(VIEWPORT_MARGIN_PX, vh - h - VIEWPORT_MARGIN_PX)
    }

    setPosition({ left, top })
  }, [anchor.clientX, anchor.clientY, title, typeLabel, previewUrl, interactive, maxWidthPx])

  const displayTitle = title.trim() !== '' ? title : 'Feature'
  const displayTypeLabel = typeLabel?.trim() ?? ''

  const panelClassName = interactive
    ? 'pointer-events-auto fixed z-[1000] w-max max-w-[280px] rounded-panel border border-stroke bg-panel p-2.5 font-sans text-fg shadow-lg'
    : 'pointer-events-none fixed z-[1000] w-max max-w-[240px] rounded-panel border border-stroke bg-panel p-1.5 font-sans text-fg shadow-sm'

  return createPortal(
    <div
      ref={panelRef}
      className={panelClassName}
      style={{ left: position.left, top: position.top }}
      role={interactive ? 'dialog' : 'tooltip'}
      aria-label={interactive ? displayTitle : undefined}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start gap-2">
        {previewUrl != null && previewUrl !== '' ? (
          <div
            className={
              interactive
                ? 'bg-area-highlight h-[72px] w-[88px] shrink-0 overflow-hidden rounded-panel'
                : 'bg-area-highlight h-[60px] w-[72px] shrink-0 overflow-hidden rounded-panel'
            }
          >
            <img
              src={previewUrl}
              alt=""
              className="h-full w-full object-cover"
              decoding="async"
              draggable={false}
            />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p
            className={
              interactive
                ? 'truncate text-[14px] font-bold leading-snug'
                : 'text-badge truncate leading-snug'
            }
            title={displayTitle}
          >
            {displayTitle}
          </p>
          {displayTypeLabel !== '' ? (
            <span className={typeBadgeClassName} title={displayTypeLabel}>
              {displayTypeLabel}
            </span>
          ) : null}
          {interactive ? (
            <button
              type="button"
              className={viewFeatureButtonClassName}
              onClick={(e) => {
                e.stopPropagation()
                onViewFeature()
              }}
            >
              View feature
            </button>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}
