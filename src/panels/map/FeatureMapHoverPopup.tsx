import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const OFFSET_X_PX = 12
const OFFSET_Y_PX = 8
const VIEWPORT_MARGIN_PX = 8

const panelClassName =
  'pointer-events-none fixed z-[1000] max-w-[160px] rounded-panel border border-stroke bg-panel p-1.5 font-sans text-badge text-fg shadow-sm'

type FeatureMapHoverPopupProps = {
  title: string
  previewUrl?: string
  anchor: { clientX: number; clientY: number }
}

export function FeatureMapHoverPopup({ title, previewUrl, anchor }: FeatureMapHoverPopupProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ left: 0, top: 0 })

  useLayoutEffect(() => {
    const panel = panelRef.current
    const vw = window.innerWidth
    const vh = window.innerHeight
    const w = panel?.offsetWidth ?? 160
    const h = panel?.offsetHeight ?? 48

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
  }, [anchor.clientX, anchor.clientY, title, previewUrl])

  const displayTitle = title.trim() !== '' ? title : 'Feature'

  return createPortal(
    <div
      ref={panelRef}
      className={panelClassName}
      style={{ left: position.left, top: position.top }}
      role="tooltip"
    >
      <div className="flex items-center gap-1.5">
        {previewUrl != null && previewUrl !== '' ? (
          <div className="bg-area-highlight h-10 w-12 shrink-0 overflow-hidden rounded-panel">
            <img
              src={previewUrl}
              alt=""
              className="h-full w-full object-cover"
              decoding="async"
              draggable={false}
            />
          </div>
        ) : null}
        <p className="line-clamp-2 min-w-0 flex-1 leading-snug">{displayTitle}</p>
      </div>
    </div>,
    document.body,
  )
}
