/** Simulated container padding for controls overlaid on the map / floor plan. */
export const mapOverlayInsetXClassName = 'inset-x-panel-padding'
export const mapOverlayInsetTopClassName = 'top-5'
export const mapOverlayInsetBottomClassName = 'bottom-5'
export const mapOverlayInsetLeftClassName = 'left-panel-padding'
export const mapOverlayInsetRightClassName = 'right-panel-padding'

/** Extra lift above `mapOverlayInsetBottomClassName` to clear the Mapbox logo (lower-left). */
export const MAPBOX_ATTRIBUTION_CLEARANCE_PX = 18
export const mapOverlayInsetBottomAboveMapboxLogoClassName = 'bottom-[calc(1.25rem+18px)]'

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

/** Features menu panel width (matches `publishedMediaNavWidthClassName`). */
export const publishedMediaFeaturesMenuPanelWidth = '400px'

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

/** Features dropdown: stop this far above the map / media viewer panel bottom edge. */
export const PUBLISHED_FEATURES_MENU_CLEARANCE_ABOVE_VIEWER_BOTTOM_PX = 70
/** Matches `DropdownPanel` `mt-2` below the Features trigger. */
export const PUBLISHED_FEATURES_MENU_OFFSET_BELOW_TRIGGER_PX = 8

/**
 * Max height for the published Features menu panel (scrolls when content exceeds this).
 * Measured from below the nav row to 70px above the map viewer panel bottom.
 */
export function computePublishedFeaturesMenuMaxHeightPx(
  navRowBottomYInContainer: number,
  mapViewerBottomYInContainer: number,
): number {
  const panelTopY = navRowBottomYInContainer + PUBLISHED_FEATURES_MENU_OFFSET_BELOW_TRIGGER_PX
  const limitY =
    mapViewerBottomYInContainer - PUBLISHED_FEATURES_MENU_CLEARANCE_ABOVE_VIEWER_BOTTOM_PX
  return Math.max(0, Math.floor(limitY - panelTopY))
}

/** Mini overlay panel chrome for published map preview (size set inline). */
export const publishedMiniPanelClassName =
  'overflow-hidden rounded-panel border border-stroke bg-panel shadow-lg'

/** Map column height fraction when marker panel is open (top map area). */
export const MARKER_FLOW_MAP_HEIGHT_FRACTION = 0.4
/** Map column height fraction for marker panel (bottom area). */
export const MARKER_FLOW_PANEL_HEIGHT_FRACTION = 0.6
/** Vertical gap between map panel and marker panel tab row when marker flow is open. */
export const MARKER_FLOW_PANEL_GAP_PX = 24
