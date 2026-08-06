import { OcuMapFullLogo } from '@/components/OcuMapFullLogo'
import { mapOverlayInsetBottomClassName } from '@/panels/map/mapOverlayLayout'

export function PublishedBottomLogo() {
  return (
    <div
      className={
        'pointer-events-none absolute left-1/2 z-[1] flex max-w-[calc(100%-2*var(--spacing-panel-padding))] -translate-x-1/2 justify-center px-panel-padding ' +
        mapOverlayInsetBottomClassName
      }
      aria-hidden
    >
      <OcuMapFullLogo alt="" />
    </div>
  )
}
