import { useViewDirectionAdjust } from '@/context/ViewDirectionAdjustContext'
import {
  mapOverlayInsetBottomClassName,
  mapOverlayInsetXClassName,
} from '@/panels/map/mapOverlayLayout'

export function DirectionAdjustBanner() {
  const { isAdjustingDirection, saveDirectionAdjust, cancelDirectionAdjust } =
    useViewDirectionAdjust()

  if (!isAdjustingDirection) return null

  return (
    <div
      className={
        'pointer-events-none absolute z-20 flex justify-center ' +
        mapOverlayInsetXClassName +
        ' ' +
        mapOverlayInsetBottomClassName
      }
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex max-w-xl flex-wrap items-center justify-center gap-2 rounded-panel bg-fg-highlight px-3 py-2 text-center font-sans text-standard text-white shadow-sm">
        <span>
          Drag the direction beam to match the orientation shown in the thumbnail. Press Esc to
          cancel.
        </span>
        <button
          type="button"
          onClick={saveDirectionAdjust}
          className="rounded-panel bg-white px-3 py-1 font-sans text-standard text-fg-highlight transition-colors hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
        >
          Save
        </button>
        <button
          type="button"
          onClick={cancelDirectionAdjust}
          className="rounded-panel border border-white/60 px-3 py-1 font-sans text-standard text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
