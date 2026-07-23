import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const OFFSET_X_PX = 12
const OFFSET_Y_PX = 8
const VIEWPORT_MARGIN_PX = 8

const POPUP_MAX_WIDTH_PX = 240

const panelClassName =
  'pointer-events-none fixed z-[1000] w-max max-w-[240px] rounded-panel border border-stroke bg-panel p-1.5 font-sans text-fg shadow-sm'

const typeBadgeClassName =
  'text-fg-highlight mt-0.5 inline-flex max-h-5 shrink-0 items-center justify-center self-start rounded-panel bg-fg-highlight/12 px-1.5 text-[11px] font-bold leading-none'

type FeatureMapHoverPopupProps = {
  title: string
  typeLabel?: string
  previewUrl?: string
  anchor: { clientX: number; clientY: number }
}

export function FeatureMapHoverPopup({
  title,
  typeLabel,
  previewUrl,
  anchor,
}: FeatureMapHoverPopupProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ left: 0, top: 0 })

  useLayoutEffect(() => {
    const panel = panelRef.current
    const vw = window.innerWidth
    const vh = window.innerHeight
    const w = panel?.offsetWidth ?? POPUP_MAX_WIDTH_PX
    const h = panel?.offsetHeight ?? 72

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
  }, [anchor.clientX, anchor.clientY, title, typeLabel, previewUrl])

  const displayTitle = title.trim() !== '' ? title : 'Feature'
  const displayTypeLabel = typeLabel?.trim() ?? ''

  return createPortal(
    <div
      ref={panelRef}
      className={panelClassName}
      style={{ left: position.left, top: position.top }}
      role="tooltip"
    >
      <div className="flex items-start gap-1.5">
        {previewUrl != null && previewUrl !== '' ? (
          <div className="bg-area-highlight h-[60px] w-[72px] shrink-0 overflow-hidden rounded-panel">
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
          <p className="text-badge truncate leading-snug">{displayTitle}</p>
          {displayTypeLabel !== '' ? (
            <span className={typeBadgeClassName}>{displayTypeLabel}</span>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}
