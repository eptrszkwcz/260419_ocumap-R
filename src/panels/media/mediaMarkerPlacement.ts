import type { FloorPlanPosition, SpatialAsset } from '@/data/sampleAssets'
import type { FloorPlanId } from '@/panels/map/mapFloorPlans'

const FLOOR_PLAN_OFFSET = 0.08
const MAP_OFFSET_METERS = 25

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}

/** Offset a normalized floor plan point along bearing (0° = up, clockwise). */
export function offsetFloorPlanPoint(
  x: number,
  y: number,
  bearingDeg: number,
  distance = FLOOR_PLAN_OFFSET,
): { x: number; y: number } {
  const rad = (bearingDeg * Math.PI) / 180
  const dx = distance * Math.sin(rad)
  const dy = -distance * Math.cos(rad)
  return { x: clamp01(x + dx), y: clamp01(y + dy) }
}

/** Offset lat/lng by meters along bearing (0° = north, clockwise). */
export function offsetLatLng(
  lat: number,
  lng: number,
  bearingDeg: number,
  distanceMeters = MAP_OFFSET_METERS,
): { lat: number; lng: number } {
  const rad = (bearingDeg * Math.PI) / 180
  const earthRadius = 6378137
  const dLat = (distanceMeters * Math.cos(rad)) / earthRadius
  const dLng =
    (distanceMeters * Math.sin(rad)) / (earthRadius * Math.cos((lat * Math.PI) / 180))
  return {
    lat: lat + (dLat * 180) / Math.PI,
    lng: lng + (dLng * 180) / Math.PI,
  }
}

export function computeInitialMapMarkerPosition(
  parentAsset: SpatialAsset,
  viewDirectionDeg: number,
  isBuildingProject: boolean,
  defaultFloorPlanId: FloorPlanId,
): { floorPlanPosition?: FloorPlanPosition; mapPosition?: { lng: number; lat: number } } {
  if (isBuildingProject) {
    const base = parentAsset.floorPlanPosition
    if (base == null) {
      const offset = offsetFloorPlanPoint(0.5, 0.5, viewDirectionDeg)
      return {
        floorPlanPosition: {
          floorPlanId: defaultFloorPlanId,
          x: offset.x,
          y: offset.y,
        },
      }
    }
    const offset = offsetFloorPlanPoint(base.x, base.y, viewDirectionDeg)
    return {
      floorPlanPosition: {
        floorPlanId: base.floorPlanId,
        x: offset.x,
        y: offset.y,
      },
    }
  }

  const lat = parentAsset.captureLat
  const lng = parentAsset.captureLng
  if (lat == null || lng == null) {
    return {
      mapPosition: offsetLatLng(29.783350113603223, -95.80992002324031, viewDirectionDeg),
    }
  }
  return { mapPosition: offsetLatLng(lat, lng, viewDirectionDeg) }
}

export function formatMarkerDateAdded(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function defaultMarkerName(existingCount: number): string {
  return `Marker ${existingCount + 1}`
}

export function newMarkerId(): string {
  return `marker-${crypto.randomUUID()}`
}
