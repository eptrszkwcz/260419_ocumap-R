/**
 * Placeholder spatial assets for the prototype. Large binaries live under
 * `public/samples/` and are referenced by URL (e.g. `/samples/...`).
 */

export type AssetKind = 'image' | 'video' | 'panorama'

export type MapPosition = { x: number; y: number }

export type SpatialAsset = {
  id: string
  kind: AssetKind
  title: string
  /** Public URL path under the dev server root */
  fileUrl: string
  mapPosition: MapPosition
}

export const sampleAssets: SpatialAsset[] = [
  {
    id: 'a-1',
    kind: 'image',
    title: 'Lobby overview',
    fileUrl: '/samples/placeholder.svg',
    mapPosition: { x: 22, y: 38 },
  },
  {
    id: 'a-2',
    kind: 'panorama',
    title: 'Hallway 360',
    fileUrl: '/samples/placeholder.svg',
    mapPosition: { x: 58, y: 52 },
  },
  {
    id: 'a-3',
    kind: 'video',
    title: 'Walkthrough clip',
    fileUrl: '/samples/placeholder.svg',
    mapPosition: { x: 40, y: 72 },
  },
]
