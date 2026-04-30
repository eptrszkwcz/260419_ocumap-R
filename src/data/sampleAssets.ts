/**
 * Placeholder spatial assets for the prototype. Large binaries live under
 * `public/samples/` and are referenced by URL (e.g. `/samples/...`).
 *
 * Mock layout: `feature-viewer/spherical-pano/` (360_*), `map-viewer/floor-plans/`
 * (SOM_*). Add new kinds as sibling folders under the viewer that consumes them.
 */

export type AssetKind = 'image' | 'video' | 'panorama'

export type MapPosition = { x: number; y: number }

export type SpatialAsset = {
  id: string
  kind: AssetKind
  /** Display name in the feature list */
  title: string
  /** When the feature was added to the project (table: "Date Uploaded") */
  dateUploaded: string
  /** When the source media was captured, if known (long form like `dateUploaded`) */
  dateCaptured?: string
  /** Public URL path, blob URL for local uploads, or path under the dev server root */
  fileUrl: string
  mapPosition: MapPosition
  fileSizeBytes?: number
  mimeType?: string
  width?: number
  height?: number
}

/** Best-effort kind for an uploaded `File` (user can override in the add form). */
export function inferKindFromFile(file: File): AssetKind {
  const t = file.type
  if (t.startsWith('video/')) return 'video'
  if (t.startsWith('image/')) return 'image'
  return 'image'
}

export function getAssetTypeLabel(kind: AssetKind): string {
  if (kind === 'panorama') return '360 Photo'
  if (kind === 'video') return 'Video'
  return 'Image'
}

export const sampleAssets: SpatialAsset[] = [
  {
    id: 'a-1',
    kind: 'image',
    title: 'THP_BR011',
    dateUploaded: 'July 22, 2025',
    fileUrl: '/samples/placeholder.svg',
    mapPosition: { x: 22, y: 38 },
  },
  {
    id: 'a-2',
    kind: 'panorama',
    title: 'THP_BR012',
    dateUploaded: 'July 21, 2025',
    fileUrl: '/samples/placeholder.svg',
    mapPosition: { x: 58, y: 52 },
  },
  {
    id: 'a-3',
    kind: 'video',
    title: 'THP_EX901',
    dateUploaded: 'July 20, 2025',
    fileUrl: '/samples/placeholder.svg',
    mapPosition: { x: 40, y: 72 },
  },
]
