/**
 * Placeholder spatial assets for the prototype. Large binaries live under
 * `public/samples/` and are referenced by URL (e.g. `/samples/...`).
 *
 * Building demo (Jefferson): `feature-viewer/spherical-pano/` (360-img-*).
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

const sphericalPanoBase = '/samples/feature-viewer/spherical-pano'

/** Default building project (e.g. 1603 Jefferson): three 360-img panoramas, one per floor. */
export const sampleAssetsJefferson: SpatialAsset[] = [
  {
    id: 'fv-360-1',
    kind: 'panorama',
    title: '360-img-1',
    dateUploaded: 'July 22, 2025',
    fileUrl: `${sphericalPanoBase}/360-img-1.png`,
    floorPlanPosition: { floorPlanId: 'SOM-2', x: 0.34, y: 0.41 },
  },
  {
    id: 'fv-360-2',
    kind: 'panorama',
    title: '360-img-2',
    dateUploaded: 'July 21, 2025',
    fileUrl: `${sphericalPanoBase}/360-img-2.png`,
    floorPlanPosition: { floorPlanId: 'SOM-2', x: 0.62, y: 0.27 },
  },
  {
    id: 'fv-360-3',
    kind: 'panorama',
    title: '360-img-3',
    dateUploaded: 'July 20, 2025',
    fileUrl: `${sphericalPanoBase}/360-img-3.png`,
    floorPlanPosition: { floorPlanId: 'SOM-5', x: 0.48, y: 0.58 },
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
]

/** Katy Freeway Expansion: three katy-* panoramas in the same folder. */
export const sampleAssetsKaty: SpatialAsset[] = [
  {
    id: 'fv-katy-flyover',
    kind: 'panorama',
    title: 'katy-flyover',
    dateUploaded: 'May 1, 2026',
    fileUrl: `${sphericalPanoBase}/katy-flyover.png`,
    captureLat: 29.785714,
    captureLng: -95.794082,
  },
  {
    id: 'fv-katy-on-ramp',
    kind: 'panorama',
    title: 'katy-on-ramp',
    dateUploaded: 'April 30, 2026',
    fileUrl: `${sphericalPanoBase}/katy-on-ramp.png`,
    captureLat: 29.777846,
    captureLng: -95.818816,
  },
  {
    id: 'fv-katy-surface-road',
    kind: 'panorama',
    title: 'katy-surface-road',
    dateUploaded: 'April 29, 2026',
    fileUrl: `${sphericalPanoBase}/katy-surface-road.png`,
    captureLat: 29.77776,
    captureLng: -95.822758,
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
]

/** @deprecated Prefer `getSampleAssetsForProject` or `sampleAssetsJefferson`. */
export const sampleAssets: SpatialAsset[] = sampleAssetsJefferson

export function getSampleAssetsForProject(projectId: string): SpatialAsset[] {
  if (projectId === KATY_FREEWAY_PROJECT_ID) {
    return sampleAssetsKaty.map((a) => ({ ...a }))
  }
  return sampleAssetsJefferson.map((a) => ({ ...a }))
}
