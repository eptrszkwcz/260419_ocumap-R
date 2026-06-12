export type MapBaseStyleId = 'default' | 'satellite' | 'contour'

export const SATELLITE_MAPBOX_STYLE =
  'mapbox://styles/ptrszkwcz/cmq87ln7h009i01rffek3dxf5' as const

export const CONTOUR_MAPBOX_STYLE =
  'mapbox://styles/ptrszkwcz/cmqaf4e3y000t01rhhboshrid' as const

export type MapBaseStyleOption = {
  id: MapBaseStyleId
  label: string
  thumbnailSrc: string
}

export const MAP_BASE_STYLE_OPTIONS: MapBaseStyleOption[] = [
  {
    id: 'default',
    label: 'Default',
    thumbnailSrc: '/samples/map-viewer/base-map-styles/default.png',
  },
  {
    id: 'satellite',
    label: 'Satellite',
    thumbnailSrc: '/samples/map-viewer/base-map-styles/satellite.png',
  },
  {
    id: 'contour',
    label: 'Contour',
    thumbnailSrc: '/samples/map-viewer/base-map-styles/contour.png',
  },
]

export function mapBaseStyleLabel(id: MapBaseStyleId): string {
  return MAP_BASE_STYLE_OPTIONS.find((opt) => opt.id === id)?.label ?? 'Default'
}

export function resolveMapBaseStyleUrl(
  id: MapBaseStyleId,
  projectDefaultStyleUrl: string,
): string {
  switch (id) {
    case 'satellite':
      return SATELLITE_MAPBOX_STYLE
    case 'contour':
      return CONTOUR_MAPBOX_STYLE
    default:
      return projectDefaultStyleUrl
  }
}
