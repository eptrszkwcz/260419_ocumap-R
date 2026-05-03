/**
 * Placeholder spatial assets for the prototype. Large binaries live under
 * `public/samples/` and are referenced by URL (e.g. `/samples/...`).
 *
 * Mock media: `feature-viewer/spherical-pano/` (360-img-*). Floor plans:
 * `map-viewer/floor-plans/` (SOM_*).
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
    id: 'fv-360-1',
    kind: 'panorama',
    title: '360-img-1',
    dateUploaded: 'July 22, 2025',
    fileUrl: '/samples/feature-viewer/spherical-pano/360-img-1.png',
    mapPosition: { x: 22, y: 38 },
  },
  {
    id: 'fv-360-2',
    kind: 'panorama',
    title: '360-img-2',
    dateUploaded: 'July 21, 2025',
    fileUrl: '/samples/feature-viewer/spherical-pano/360-img-2.png',
    mapPosition: { x: 58, y: 52 },
  },
  {
    id: 'fv-360-3',
    kind: 'panorama',
    title: '360-img-3',
    dateUploaded: 'July 20, 2025',
    fileUrl: '/samples/feature-viewer/spherical-pano/360-img-3.png',
    mapPosition: { x: 40, y: 72 },
  },
]
