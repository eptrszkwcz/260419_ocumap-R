/** Simulated container padding for controls overlaid on the map / floor plan. */
export const mapOverlayInsetXClassName = 'inset-x-panel-padding'
export const mapOverlayInsetTopClassName = 'top-5'
export const mapOverlayInsetBottomClassName = 'bottom-5'
export const mapOverlayInsetLeftClassName = 'left-panel-padding'
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

/** File name bar above published media navigation controls. */
export const publishedMediaFileNamePanelClassName =
  publishedFloatingPanelBaseClassName + ' w-[400px] justify-between'

/** Width shared by published media file name panel and nav buttons. */
export const publishedMediaNavWidthClassName = 'w-[400px]'

/** Content-width variant (media header). */
export const publishedFloatingPanelAutoClassName =
  publishedFloatingPanelBaseClassName +
  ' w-fit max-w-[calc(100%-2*var(--spacing-panel-padding))]'

/** Published mini map panel sizing (user-resizable when media is open). */
export const PUBLISHED_MINI_PANEL_MIN_WIDTH = 300
export const PUBLISHED_MINI_PANEL_MIN_HEIGHT = 200
export const PUBLISHED_MINI_PANEL_DEFAULT_WIDTH = 456
export const PUBLISHED_MINI_PANEL_DEFAULT_HEIGHT = 280
export const PUBLISHED_MINI_PANEL_RESIZE_BUFFER_PX = 24
/** Matches `bottom-5` / `top-5` overlay inset (1.25rem). */
export const MAP_OVERLAY_INSET_Y_PX = 20
/** Matches `--spacing-panel-padding`. */
export const PUBLISHED_PANEL_PADDING_PX = 24

/** Mini overlay panel chrome for published map preview (size set inline). */
export const publishedMiniPanelClassName =
  'overflow-hidden rounded-panel border border-stroke bg-panel shadow-lg'
