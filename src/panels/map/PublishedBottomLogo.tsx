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
      <img
        src="/brand/ocumap-full-logo-dark.png"
        alt=""
        className="h-8 w-auto max-w-full object-contain"
        width={189}
        height={44}
      />
    </div>
  )
}
