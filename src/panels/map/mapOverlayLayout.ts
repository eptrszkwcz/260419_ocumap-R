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

/** Fluid project header with room for name, team, and address (caps at desktop width). */
export const publishedMapHeaderPanelClassName =
  'flex min-h-[5.25rem] w-full max-w-[456px] items-center gap-4 rounded-panel border border-stroke bg-panel px-panel-padding py-2 shadow-lg'

/** Narrow project header (phone portrait). */
export const publishedMapHeaderPanelNarrowClassName =
  'flex min-h-[3.5rem] w-full max-w-[456px] items-center gap-3 rounded-panel border border-stroke bg-panel px-3 py-1.5 shadow-lg'

/** Fluid-width variant (compact headers). */
export const publishedFloatingPanelClassName =
  publishedFloatingPanelBaseClassName + ' w-full max-w-[456px]'

/** File name bar above published media navigation controls. */
export const publishedMediaFileNamePanelClassName =
  publishedFloatingPanelBaseClassName + ' w-full max-w-[400px] justify-between'

/** Width shared by published media file name panel and nav buttons. */
export const publishedMediaNavWidthClassName = 'w-full max-w-[400px]'

/** Desktop Features menu panel width (matches nav max width). */
export const publishedMediaFeaturesMenuPanelWidth = '400px'

/** Max pixel width for Features menu / media nav panels. */
export const PUBLISHED_MEDIA_NAV_MAX_WIDTH_PX = 400

/** Matches `--spacing-panel-padding`. */
export const PUBLISHED_PANEL_PADDING_PX = 24
/** Tighter horizontal inset used for narrow chrome overlays. */
export const PUBLISHED_NARROW_PANEL_PADDING_PX = 8
/** Matches `bottom-5` / `top-5` overlay inset (1.25rem). */
export const MAP_OVERLAY_INSET_Y_PX = 20

/** Content-width variant (media header). */
export const publishedFloatingPanelAutoClassName =
  publishedFloatingPanelBaseClassName +
  ' w-fit max-w-[calc(100%-2*var(--spacing-panel-padding))]'

/**
 * Published chrome layout mode from viewport width.
 * - desktop: header top-left, nav top-right
 * - compact: iPad portrait / phone landscape widths
 * - narrow: phone portrait
 *
 * Use window/viewport width — not the padded map container — so page padding
 * changes cannot flip the breakpoint and cause an update loop.
 */
export type PublishedChromeMode = 'desktop' | 'compact' | 'narrow'

/**
 * How top chrome is arranged.
 * - corners: desktop TL / TR
 * - stack: header above nav (portrait phone / iPad portrait)
 * - split: header left, feature name + nav right (phone landscape)
 */
export type PublishedChromeArrangement = 'corners' | 'stack' | 'split'

/** Below this container width, stack header + nav (456 + 400 no longer fit side-by-side). */
export const PUBLISHED_CHROME_COMPACT_MAX_WIDTH_PX = 960
/** Below this, use narrow chrome (icon-only nav, hide address, tighter padding). */
export const PUBLISHED_CHROME_NARROW_MAX_WIDTH_PX = 480
/**
 * At or below this height in compact width, use side-by-side split chrome (phone landscape).
 * Taller compact viewports (iPad portrait) keep the vertical stack.
 */
export const PUBLISHED_CHROME_LANDSCAPE_MAX_HEIGHT_PX = 500

export function resolvePublishedChromeMode(containerWidthPx: number): PublishedChromeMode {
  if (containerWidthPx < PUBLISHED_CHROME_NARROW_MAX_WIDTH_PX) return 'narrow'
  if (containerWidthPx < PUBLISHED_CHROME_COMPACT_MAX_WIDTH_PX) return 'compact'
  return 'desktop'
}

export function resolvePublishedChromeArrangement(
  chromeMode: PublishedChromeMode,
  containerHeightPx: number,
): PublishedChromeArrangement {
  if (chromeMode === 'desktop') return 'corners'
  if (chromeMode === 'narrow') return 'stack'
  if (containerHeightPx <= PUBLISHED_CHROME_LANDSCAPE_MAX_HEIGHT_PX) return 'split'
  return 'stack'
}

/** Features menu width clamped to the viewer container. */
export function computePublishedFeaturesMenuWidthPx(
  containerWidthPx: number,
  panelPaddingPx: number = PUBLISHED_PANEL_PADDING_PX,
  chromeMode: PublishedChromeMode = 'desktop',
  arrangement: PublishedChromeArrangement = 'corners',
  /** Measured width of the right-hand nav column in split arrangement. */
  splitNavColumnWidthPx?: number | null,
): number {
  if (
    arrangement === 'split' &&
    splitNavColumnWidthPx != null &&
    splitNavColumnWidthPx > 0
  ) {
    return Math.floor(splitNavColumnWidthPx)
  }
  const available = Math.max(0, containerWidthPx - 2 * panelPaddingPx)
  if (chromeMode !== 'desktop') return available
  return Math.min(PUBLISHED_MEDIA_NAV_MAX_WIDTH_PX, available)
}

/** Published mini map panel sizing (user-resizable when media is open). */
export const PUBLISHED_MINI_PANEL_MIN_WIDTH = 300
export const PUBLISHED_MINI_PANEL_MIN_HEIGHT = 200
export const PUBLISHED_MINI_PANEL_DEFAULT_WIDTH = 456
export const PUBLISHED_MINI_PANEL_DEFAULT_HEIGHT = 280

/** Compact/narrow mini-map mins and defaults (phones / stacked chrome). */
export const PUBLISHED_MINI_PANEL_COMPACT_MIN_WIDTH = 160
export const PUBLISHED_MINI_PANEL_COMPACT_MIN_HEIGHT = 120
export const PUBLISHED_MINI_PANEL_COMPACT_DEFAULT_WIDTH = 280
export const PUBLISHED_MINI_PANEL_COMPACT_DEFAULT_HEIGHT = 180

export const PUBLISHED_MINI_PANEL_RESIZE_BUFFER_PX = 24

export function publishedMiniPanelMins(chromeMode: PublishedChromeMode): {
  minWidth: number
  minHeight: number
} {
  if (chromeMode === 'desktop') {
    return {
      minWidth: PUBLISHED_MINI_PANEL_MIN_WIDTH,
      minHeight: PUBLISHED_MINI_PANEL_MIN_HEIGHT,
    }
  }
  return {
    minWidth: PUBLISHED_MINI_PANEL_COMPACT_MIN_WIDTH,
    minHeight: PUBLISHED_MINI_PANEL_COMPACT_MIN_HEIGHT,
  }
}

export function publishedMiniPanelDefaults(chromeMode: PublishedChromeMode): {
  width: number
  height: number
} {
  if (chromeMode === 'desktop') {
    return {
      width: PUBLISHED_MINI_PANEL_DEFAULT_WIDTH,
      height: PUBLISHED_MINI_PANEL_DEFAULT_HEIGHT,
    }
  }
  return {
    width: PUBLISHED_MINI_PANEL_COMPACT_DEFAULT_WIDTH,
    height: PUBLISHED_MINI_PANEL_COMPACT_DEFAULT_HEIGHT,
  }
}

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

/** Default marker panel height as a fraction of available split area (map + marker). */
export const MARKER_FLOW_DEFAULT_PANEL_RATIO = 0.6
/** Minimum height for the map area when the marker panel is open. */
export const MARKER_FLOW_MAP_MIN_PX = 240
/** Minimum height for the marker panel (tabs, header, composer). */
export const MARKER_FLOW_PANEL_MIN_PX = 280
/** Hit target height for the draggable split handle between map and marker panel. */
export const MARKER_FLOW_RESIZE_HANDLE_HIT_PX = 16

/** Extra lift for the media marker placement banner above the default bottom inset. */
export const MEDIA_MARKER_PLACEMENT_BANNER_LIFT_PX = 64
export const mapOverlayInsetBottomAboveMediaControlsClassName =
  'bottom-[calc(1.25rem+64px)]'
