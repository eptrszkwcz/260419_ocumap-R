/**
 * Placeholder spatial assets for the prototype. Large binaries live under
 * `public/samples/` and are referenced by URL (e.g. `/samples/...`).
 *
 * Building demo (Jefferson): `feature-viewer/spherical-pano/` (360-img-*).
 * Katy Freeway: same folder, `katy-*.png`.
 * Floor plans: `map-viewer/floor-plans/` (SOM_*).
 */

import { KATY_FREEWAY_PROJECT_ID } from '@/data/sampleProjects'

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
  /** WGS84 longitude where the media was captured (geographic map). */
  captureLng?: number
  /** WGS84 latitude where the media was captured (geographic map). */
  captureLat?: number
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

const sphericalPanoBase = '/samples/feature-viewer/spherical-pano'

/** Default building project (e.g. 1603 Jefferson): three 360-img panoramas. */
export const sampleAssetsJefferson: SpatialAsset[] = [
  {
    id: 'fv-360-1',
    kind: 'panorama',
    title: '360-img-1',
    dateUploaded: 'July 22, 2025',
    fileUrl: `${sphericalPanoBase}/360-img-1.png`,
    mapPosition: { x: 22, y: 38 },
  },
  {
    id: 'fv-360-2',
    kind: 'panorama',
    title: '360-img-2',
    dateUploaded: 'July 21, 2025',
    fileUrl: `${sphericalPanoBase}/360-img-2.png`,
    mapPosition: { x: 58, y: 52 },
  },
  {
    id: 'fv-360-3',
    kind: 'panorama',
    title: '360-img-3',
    dateUploaded: 'July 20, 2025',
    fileUrl: `${sphericalPanoBase}/360-img-3.png`,
    mapPosition: { x: 40, y: 72 },
  },
]

/** Katy Freeway Expansion: three katy-* panoramas in the same folder. */
export const sampleAssetsKaty: SpatialAsset[] = [
  {
    id: 'fv-katy-flyover',
    kind: 'panorama',
    title: 'katy-flyover',
    dateUploaded: 'May 1, 2026',
    fileUrl: `${sphericalPanoBase}/katy-flyover.png`,
    mapPosition: { x: 30, y: 40 },
    captureLat: 29.785714,
    captureLng: -95.794082,
  },
  {
    id: 'fv-katy-on-ramp',
    kind: 'panorama',
    title: 'katy-on-ramp',
    dateUploaded: 'April 30, 2026',
    fileUrl: `${sphericalPanoBase}/katy-on-ramp.png`,
    mapPosition: { x: 55, y: 48 },
    captureLat: 29.777846,
    captureLng: -95.818816,
  },
  {
    id: 'fv-katy-surface-road',
    kind: 'panorama',
    title: 'katy-surface-road',
    dateUploaded: 'April 29, 2026',
    fileUrl: `${sphericalPanoBase}/katy-surface-road.png`,
    mapPosition: { x: 42, y: 68 },
    captureLat: 29.77776,
    captureLng: -95.822758,
  },
]

/** @deprecated Prefer `getSampleAssetsForProject` or `sampleAssetsJefferson`. */
export const sampleAssets: SpatialAsset[] = sampleAssetsJefferson

export function getSampleAssetsForProject(projectId: string): SpatialAsset[] {
  if (projectId === KATY_FREEWAY_PROJECT_ID) {
    return sampleAssetsKaty.map((a) => ({ ...a }))
  }
  return sampleAssetsJefferson.map((a) => ({ ...a }))
}
