import { OcuMapFullLogo } from '@/components/OcuMapFullLogo'
import {
  mapOverlayInsetBottomClassName,
  type PublishedChromeMode,
} from '@/panels/map/mapOverlayLayout'

type PublishedBottomLogoProps = {
  chromeMode?: PublishedChromeMode
}

export function PublishedBottomLogo({ chromeMode = 'desktop' }: PublishedBottomLogoProps) {
  if (chromeMode === 'narrow') return null

  return (
    <div
      className={
        'pointer-events-none absolute left-1/2 z-[1] flex max-w-[calc(100%-2*var(--spacing-panel-padding))] -translate-x-1/2 justify-center px-panel-padding ' +
        mapOverlayInsetBottomClassName +
        (chromeMode === 'compact' ? ' scale-90' : '')
      }
      aria-hidden
    >
      <OcuMapFullLogo alt="" />
    </div>
  )
}
