import type { FloorPlanMarker, MapCaptureMarker } from '@/context/MapCaptureMarkersContext'
import type { SpatialAsset } from '@/data/sampleAssets'
import type { FloorPlanId } from '@/panels/map/mapFloorPlans'
import { markerColorsFromAsset } from '@/panels/map/markerColors'

export type FloorPlanVertexDisplay = { x: number; y: number }
export type MapVertexDisplay = { lng: number; lat: number }

export function floorPlanVerticesFromAsset(asset: SpatialAsset): {
  floorPlanId: FloorPlanId | null
  vertices: FloorPlanVertexDisplay[]
} {
  if (asset.floorPlanGeometry != null && asset.floorPlanGeometry.coordinates.length > 0) {
    return {
      floorPlanId: asset.floorPlanGeometry.floorPlanId,
      vertices: asset.floorPlanGeometry.coordinates.map((c) => ({ x: c.x, y: c.y })),
    }
  }
  if (asset.floorPlanPosition != null) {
    return {
      floorPlanId: asset.floorPlanPosition.floorPlanId,
      vertices: [{ x: asset.floorPlanPosition.x, y: asset.floorPlanPosition.y }],
    }
  }
  return { floorPlanId: null, vertices: [] }
}

export function mapVerticesFromAsset(asset: SpatialAsset): MapVertexDisplay[] {
  if (asset.mapGeometry != null && asset.mapGeometry.coordinates.length > 0) {
    return asset.mapGeometry.coordinates.map((c) => ({ lng: c.lng, lat: c.lat }))
  }
  if (
    asset.captureLng != null &&
    asset.captureLat != null &&
    Number.isFinite(asset.captureLng) &&
    Number.isFinite(asset.captureLat)
  ) {
    return [{ lng: asset.captureLng, lat: asset.captureLat }]
  }
  return []
}

export type FloorPlanDrawnGeometry = {
  id: string
  floorPlanId: FloorPlanMarker['floorPlanId']
  geometryType: 'line' | 'polygon'
  coordinates: { x: number; y: number }[]
  color: string
  strokeColor: string
}

export type MapDrawnGeometry = {
  id: string
  geometryType: 'line' | 'polygon'
  coordinates: { lng: number; lat: number }[]
  color: string
  strokeColor: string
}

function isValidCoord(n: number): boolean {
  return Number.isFinite(n)
}

function mediaMarkerFields(asset: SpatialAsset): {
  kind?: 'image' | 'panorama'
  viewDirectionDeg?: number
} {
  if (asset.kind === 'image' || asset.kind === 'panorama') {
    return {
      kind: asset.kind,
      viewDirectionDeg: asset.viewDirectionDeg,
    }
  }
  return {}
}

export function assetsToCaptureMarkers(assets: SpatialAsset[]): MapCaptureMarker[] {
  return assets
    .filter((a) => {
      if (a.geometryType === 'point' && a.mapGeometry?.coordinates[0] != null) {
        const c = a.mapGeometry.coordinates[0]
        return isValidCoord(c.lng) && isValidCoord(c.lat)
      }
      return (
        a.captureLng != null &&
        a.captureLat != null &&
        isValidCoord(a.captureLng) &&
        isValidCoord(a.captureLat)
      )
    })
    .map((a) => {
      const { fill, stroke } = markerColorsFromAsset(a.markerColor)
      const fromGeometry = a.mapGeometry?.coordinates[0]
      const lng = fromGeometry?.lng ?? (a.captureLng as number)
      const lat = fromGeometry?.lat ?? (a.captureLat as number)
      return { id: a.id, lng, lat, color: fill, strokeColor: stroke, ...mediaMarkerFields(a) }
    })
}

export function assetsToFloorPlanMarkers(assets: SpatialAsset[]): FloorPlanMarker[] {
  return assets
    .filter((a) => {
      if (a.geometryType === 'point' && a.floorPlanGeometry?.coordinates[0] != null) {
        const c = a.floorPlanGeometry.coordinates[0]
        const p = a.floorPlanGeometry
        return (
          isValidCoord(c.x) &&
          isValidCoord(c.y) &&
          c.x >= 0 &&
          c.x <= 1 &&
          c.y >= 0 &&
          c.y <= 1 &&
          p.floorPlanId != null
        )
      }
      const pos = a.floorPlanPosition
      if (pos == null) return false
      return (
        isValidCoord(pos.x) &&
        isValidCoord(pos.y) &&
        pos.x >= 0 &&
        pos.x <= 1 &&
        pos.y >= 0 &&
        pos.y <= 1
      )
    })
    .map((a) => {
      const { fill, stroke } = markerColorsFromAsset(a.markerColor)
      if (a.geometryType === 'point' && a.floorPlanGeometry?.coordinates[0] != null) {
        const c = a.floorPlanGeometry.coordinates[0]
        return {
          id: a.id,
          floorPlanId: a.floorPlanGeometry.floorPlanId,
          x: c.x,
          y: c.y,
          color: fill,
          strokeColor: stroke,
          ...mediaMarkerFields(a),
        }
      }
      return {
        id: a.id,
        floorPlanId: a.floorPlanPosition!.floorPlanId,
        x: a.floorPlanPosition!.x,
        y: a.floorPlanPosition!.y,
        color: fill,
        strokeColor: stroke,
        ...mediaMarkerFields(a),
      }
    })
}

export function assetsToFloorPlanDrawnGeometries(assets: SpatialAsset[]): FloorPlanDrawnGeometry[] {
  return assets
    .filter(
      (a) =>
        (a.geometryType === 'line' || a.geometryType === 'polygon') &&
        a.floorPlanGeometry != null &&
        a.floorPlanGeometry.coordinates.length >= 2,
    )
    .map((a) => {
      const { fill, stroke } = markerColorsFromAsset(a.markerColor)
      return {
        id: a.id,
        floorPlanId: a.floorPlanGeometry!.floorPlanId,
        geometryType: a.geometryType as 'line' | 'polygon',
        coordinates: a.floorPlanGeometry!.coordinates,
        color: fill,
        strokeColor: stroke,
      }
    })
}

export function assetsToMapDrawnGeometries(assets: SpatialAsset[]): MapDrawnGeometry[] {
  return assets
    .filter(
      (a) =>
        (a.geometryType === 'line' || a.geometryType === 'polygon') &&
        a.mapGeometry != null &&
        a.mapGeometry.coordinates.length >= 2,
    )
    .map((a) => {
      const { fill, stroke } = markerColorsFromAsset(a.markerColor)
      return {
        id: a.id,
        geometryType: a.geometryType as 'line' | 'polygon',
        coordinates: a.mapGeometry!.coordinates,
        color: fill,
        strokeColor: stroke,
      }
    })
}
