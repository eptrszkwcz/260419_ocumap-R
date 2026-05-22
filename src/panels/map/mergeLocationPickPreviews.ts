import type { FloorPlanMarker, MapCaptureMarker } from '@/context/MapCaptureMarkersContext'
import type { FloorPlanLocationPickPreview } from '@/context/FloorPlanLocationPickContext'
import type { MapLocationPickPreview } from '@/context/MapLocationPickContext'

export function mergeCaptureMarkerPreview(
  markers: MapCaptureMarker[],
  preview: MapLocationPickPreview | null,
): MapCaptureMarker[] {
  if (preview == null) return markers
  const existing = markers.some((m) => m.id === preview.featureId)
  if (existing) {
    return markers.map((m) =>
      m.id === preview.featureId ? { ...m, lng: preview.lng, lat: preview.lat } : m,
    )
  }
  return [...markers, { id: preview.featureId, lng: preview.lng, lat: preview.lat }]
}

export function mergeFloorPlanMarkerPreview(
  markers: FloorPlanMarker[],
  preview: FloorPlanLocationPickPreview | null,
): FloorPlanMarker[] {
  if (preview == null) return markers
  const existing = markers.some((m) => m.id === preview.featureId)
  if (existing) {
    return markers.map((m) =>
      m.id === preview.featureId
        ? {
            ...m,
            floorPlanId: preview.floorPlanId,
            x: preview.x,
            y: preview.y,
          }
        : m,
    )
  }
  return [
    ...markers,
    {
      id: preview.featureId,
      floorPlanId: preview.floorPlanId,
      x: preview.x,
      y: preview.y,
    },
  ]
}
