/**
 * Placeholder spatial assets for the prototype. Large binaries live under
 * `public/samples/` and are referenced by URL (e.g. `/samples/...`).
 *
 * Building demo (Jefferson): `feature-viewer/images/` (MEP-img-*).
 * Katy Freeway: same folder, `katy-*.png`.
 * Floor plans: `map-viewer/floor-plans/` (SOM_*).
 */

import { KATY_FREEWAY_PROJECT_ID } from '@/data/sampleProjects'
import type { FloorPlanId } from '@/panels/map/mapFloorPlans'

export type AssetKind = 'image' | 'video' | 'panorama'

export type FeatureGeometryType = 'point' | 'line' | 'polygon'

export type FloorPlanGeometry = {
  floorPlanId: FloorPlanId
  /** Normalized 0–1 coordinates */
  coordinates: { x: number; y: number }[]
}

export type MapGeometry = {
  coordinates: { lng: number; lat: number }[]
}

/** @deprecated Legacy 0–100 placement; prefer `floorPlanPosition` (normalized) for building projects. */
export type MapPosition = { x: number; y: number }

/** Normalized position on a specific floor plan drawing (0–1 in each axis). */
export type FloorPlanPosition = {
  floorPlanId: FloorPlanId
  x: number
  y: number
}

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
  fileUrl?: string
  /** Drawn geometry type (point, line, or polygon). */
  geometryType?: FeatureGeometryType
  /** Building projects: drawn geometry on a floor plan. */
  floorPlanGeometry?: FloorPlanGeometry
  /** Infrastructure projects: drawn geometry on the geographic map. */
  mapGeometry?: MapGeometry
  /** User notes for drawn or media features. */
  notes?: string
  /** Building projects: position on a floor plan drawing. */
  floorPlanPosition?: FloorPlanPosition
  /** @deprecated Legacy demo field; use `floorPlanPosition` for building projects. */
  mapPosition?: MapPosition
  /** WGS84 longitude where the media was captured (geographic map). */
  captureLng?: number
  /** WGS84 latitude where the media was captured (geographic map). */
  captureLat?: number
  fileSizeBytes?: number
  mimeType?: string
  width?: number
  height?: number
  /** Hex fill color for the capture point on the map or floor plan (e.g. `#2563eb`). */
  markerColor?: string
  /** Viewing direction on the map/plan, degrees clockwise from screen-up (0 = up, 90 = right). */
  viewDirectionDeg?: number
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

export function getGeometryTypeLabel(type: FeatureGeometryType): string {
  if (type === 'line') return 'Line'
  if (type === 'polygon') return 'Polygon'
  return 'Point'
}

export function isDrawnFeature(asset: SpatialAsset): boolean {
  return asset.geometryType != null
}

export function hasDisplayableMedia(asset: SpatialAsset): boolean {
  return !isDrawnFeature(asset) && (asset.fileUrl ?? '') !== ''
}

/** Shown in published view when a feature has map/plan geometry but no media file. */
export const GEOMETRY_ONLY_FEATURE_MESSAGE = 'This feature is geometry only'

export function isGeometryOnlyFeature(asset: SpatialAsset): boolean {
  return !hasDisplayableMedia(asset)
}

export type FeatureTypeFilter = AssetKind | FeatureGeometryType

export function getFeatureTypeFilterKey(asset: SpatialAsset): FeatureTypeFilter {
  return asset.geometryType ?? asset.kind
}

export function getFeatureTypeLabel(asset: SpatialAsset): string {
  if (asset.geometryType != null) return getGeometryTypeLabel(asset.geometryType)
  return getAssetTypeLabel(asset.kind)
}

export function featureTypeFilterLabel(id: FeatureTypeFilter): string {
  if (id === 'point' || id === 'line' || id === 'polygon') return getGeometryTypeLabel(id)
  return getAssetTypeLabel(id)
}

const sampleImagesBase = '/samples/feature-viewer/images'
const sampleSphericalPanoBase = '/samples/feature-viewer/spherical-pano'

/** Demo drawn points on Jefferson floor plans (normalized x, y). */
const jeffersonDemoPointSeeds: [FloorPlanId, number, number][] = [
  ['SOM-2', 0.18, 0.44],
  ['SOM-2', 0.55, 0.72],
  ['SOM-2', 0.73, 0.38],
  ['SOM-2', 0.41, 0.51],
  ['SOM-4', 0.22, 0.61],
  ['SOM-4', 0.58, 0.19],
  ['SOM-4', 0.67, 0.54],
  ['SOM-4', 0.35, 0.78],
  ['SOM-5', 0.31, 0.26],
  ['SOM-5', 0.59, 0.47],
  ['SOM-5', 0.81, 0.63],
  ['SOM-5', 0.15, 0.52],
]

const jeffersonDemoPoints: SpatialAsset[] = jeffersonDemoPointSeeds.map(
  ([floorPlanId, x, y], index) => {
    const n = index + 1
    return {
      id: `drawn-jefferson-point-${n}`,
      kind: 'image',
      title: `Point ${n}`,
      dateUploaded: `June ${17 + index}, 2026`,
      geometryType: 'point',
      markerColor: '#2563eb',
      floorPlanGeometry: {
        floorPlanId,
        coordinates: [{ x, y }],
      },
      floorPlanPosition: { floorPlanId, x, y },
    }
  },
)

/** Default building project (e.g. 1603 Jefferson): three MEP images, one per floor. */
export const sampleAssetsJefferson: SpatialAsset[] = [
  {
    id: 'fv-360-1',
    kind: 'image',
    title: 'MEP-img-1',
    dateUploaded: 'July 22, 2025',
    fileUrl: `${sampleImagesBase}/360-img-1.png`,
    floorPlanPosition: { floorPlanId: 'SOM-2', x: 0.34, y: 0.41 },
    viewDirectionDeg: 45,
  },
  {
    id: 'fv-360-2',
    kind: 'image',
    title: 'MEP-img-2',
    dateUploaded: 'July 21, 2025',
    fileUrl: `${sampleImagesBase}/360-img-2.png`,
    floorPlanPosition: { floorPlanId: 'SOM-2', x: 0.62, y: 0.27 },
    viewDirectionDeg: 127,
  },
  {
    id: 'fv-360-3',
    kind: 'image',
    title: 'MEP-img-3',
    dateUploaded: 'July 20, 2025',
    fileUrl: `${sampleImagesBase}/360-img-3.png`,
    floorPlanPosition: { floorPlanId: 'SOM-5', x: 0.48, y: 0.58 },
    viewDirectionDeg: 218,
  },
  {
    id: 'drawn-jefferson-conference-room',
    kind: 'image',
    title: 'Conference Room',
    dateUploaded: 'June 15, 2026',
    geometryType: 'polygon',
    markerColor: '#2563eb',
    floorPlanGeometry: {
      floorPlanId: 'SOM-2',
      coordinates: [
        { x: 0.202, y: 0.319 },
        { x: 0.381, y: 0.317 },
        { x: 0.38, y: 0.217 },
        { x: 0.227, y: 0.219 },
      ],
    },
  },
  {
    id: 'drawn-jefferson-floor-5-line',
    kind: 'image',
    title: '5th Floor Path',
    dateUploaded: 'June 16, 2026',
    geometryType: 'line',
    markerColor: '#2563eb',
    floorPlanGeometry: {
      floorPlanId: 'SOM-5',
      coordinates: [
        { x: 0.896, y: 0.759 },
        { x: 0.873, y: 0.772 },
        { x: 0.871, y: 0.791 },
        { x: 0.284, y: 0.787 },
        { x: 0.284, y: 0.209 },
        { x: 0.179, y: 0.209 },
        { x: 0.177, y: 0.112 },
      ],
    },
  },
  {
    id: 'fv-pano-7262',
    kind: 'panorama',
    title: '7262 Panorama',
    dateUploaded: 'June 10, 2026',
    fileUrl: `${sampleSphericalPanoBase}/7262%20Panorama.jpg`,
    mimeType: 'image/jpeg',
    floorPlanPosition: { floorPlanId: 'SOM-2', x: 0.28, y: 0.55 },
    viewDirectionDeg: 312,
  },
  {
    id: 'fv-pano-7292',
    kind: 'panorama',
    title: '7292 Panorama',
    dateUploaded: 'June 11, 2026',
    fileUrl: `${sampleSphericalPanoBase}/7292%20Panorama.jpg`,
    mimeType: 'image/jpeg',
    floorPlanPosition: { floorPlanId: 'SOM-4', x: 0.71, y: 0.33 },
    viewDirectionDeg: 73,
  },
  {
    id: 'fv-pano-7760',
    kind: 'panorama',
    title: '7760 Panorama',
    dateUploaded: 'June 12, 2026',
    fileUrl: `${sampleSphericalPanoBase}/7760%20Panorama.jpg`,
    mimeType: 'image/jpeg',
    floorPlanPosition: { floorPlanId: 'SOM-5', x: 0.42, y: 0.74 },
    viewDirectionDeg: 156,
  },
  ...jeffersonDemoPoints,
]

/** Katy Freeway Expansion: three katy-* images in the same folder. */
export const sampleAssetsKaty: SpatialAsset[] = [
  {
    id: 'fv-katy-flyover',
    kind: 'image',
    title: 'katy-flyover',
    dateUploaded: 'May 1, 2026',
    fileUrl: `${sampleImagesBase}/katy-flyover.png`,
    captureLat: 29.785714,
    captureLng: -95.794082,
    viewDirectionDeg: 280,
  },
  {
    id: 'fv-katy-on-ramp',
    kind: 'image',
    title: 'katy-on-ramp',
    dateUploaded: 'April 30, 2026',
    fileUrl: `${sampleImagesBase}/katy-on-ramp.png`,
    captureLat: 29.777846,
    captureLng: -95.818816,
    viewDirectionDeg: 15,
  },
  {
    id: 'fv-katy-surface-road',
    kind: 'image',
    title: 'katy-surface-road',
    dateUploaded: 'April 29, 2026',
    fileUrl: `${sampleImagesBase}/katy-surface-road.png`,
    captureLat: 29.77776,
    captureLng: -95.822758,
    viewDirectionDeg: 195,
  },
  {
    id: 'drawn-katy-fort-bend-rd',
    kind: 'image',
    title: 'Fort Bend Rd',
    dateUploaded: 'June 16, 2026',
    geometryType: 'line',
    markerColor: '#2563eb',
    mapGeometry: {
      coordinates: [
        { lng: -95.801782, lat: 29.801706 },
        { lng: -95.801703, lat: 29.782109 },
        { lng: -95.801703, lat: 29.773602 },
      ],
    },
  },
  {
    id: 'fv-pano-katy-ladybug',
    kind: 'panorama',
    title: 'Ladybug Panorama',
    dateUploaded: 'February 4, 2026',
    fileUrl: `${sampleSphericalPanoBase}/ladybug_20112690_20260204_105122_Panoramic_000110_23678_109-7466_-_Copy.jpg`,
    mimeType: 'image/jpeg',
    captureLat: 29.780299697966534,
    captureLng: -95.80924862619423,
    viewDirectionDeg: 340,
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
