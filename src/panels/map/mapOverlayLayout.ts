/** Simulated container padding for controls overlaid on the map / floor plan. */
export const mapOverlayInsetXClassName = 'inset-x-panel-padding'
export const mapOverlayInsetTopClassName = 'top-5'
export const mapOverlayInsetBottomClassName = 'bottom-5'
export const mapOverlayInsetRightClassName = 'right-panel-padding'

/** Shared floating panel chrome for published map/media headers. */
export const publishedFloatingPanelBaseClassName =
  'flex h-header items-center gap-4 rounded-panel border border-stroke bg-panel px-panel-padding shadow-lg'

/** Fixed-width project header with room for name, team, and address. */
export const publishedMapHeaderPanelClassName =
  'flex min-h-[5.25rem] w-[456px] items-center gap-4 rounded-panel border border-stroke bg-panel px-panel-padding py-2 shadow-lg'

/** Fixed-width variant (compact headers). */
export const publishedFloatingPanelClassName =
  publishedFloatingPanelBaseClassName + ' w-[456px]'

/** Content-width variant (media header). */
export const publishedFloatingPanelAutoClassName =
  publishedFloatingPanelBaseClassName +
  ' w-fit max-w-[calc(100%-2*var(--spacing-panel-padding))]'
