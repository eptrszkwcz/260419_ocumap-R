import type { FloorPlanMarker, MapCaptureMarker } from '@/context/MapCaptureMarkersContext'
import type { MarkerStylePreview } from '@/context/MarkerStylePreviewContext'
import type { FloorPlanLocationPickPreview } from '@/context/FloorPlanLocationPickContext'
import type { MapLocationPickPreview } from '@/context/MapLocationPickContext'
import { markerColorsFromAsset } from '@/panels/map/markerColors'

function applyStylePreview<T extends { id: string; color: string; strokeColor: string }>(
  markers: T[],
  preview: MarkerStylePreview | null,
): T[] {
  if (preview == null) return markers
  const { fill, stroke } = markerColorsFromAsset(preview.color)
  const existing = markers.some((m) => m.id === preview.featureId)
  if (existing) {
    return markers.map((m) =>
      m.id === preview.featureId ? { ...m, color: fill, strokeColor: stroke } : m,
    )
  }
  return markers
}

export function mergeCaptureMarkerPreview(
  markers: MapCaptureMarker[],
  preview: MapLocationPickPreview | null,
): MapCaptureMarker[] {
  if (preview == null) return markers
  const { fill, stroke } = markerColorsFromAsset(undefined)
  const existing = markers.some((m) => m.id === preview.featureId)
  if (existing) {
    return markers.map((m) =>
      m.id === preview.featureId ? { ...m, lng: preview.lng, lat: preview.lat } : m,
    )
  }
  return [
    ...markers,
    {
      id: preview.featureId,
      title: '',
      typeLabel: '',
      lng: preview.lng,
      lat: preview.lat,
      color: fill,
      strokeColor: stroke,
    },
  ]
}

export function mergeFloorPlanMarkerPreview(
  markers: FloorPlanMarker[],
  preview: FloorPlanLocationPickPreview | null,
): FloorPlanMarker[] {
  if (preview == null) return markers
  const { fill, stroke } = markerColorsFromAsset(undefined)
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
      title: '',
      typeLabel: '',
      floorPlanId: preview.floorPlanId,
      x: preview.x,
      y: preview.y,
      color: fill,
      strokeColor: stroke,
    },
  ]
}

export function mergeCaptureMarkerStylePreview(
  markers: MapCaptureMarker[],
  preview: MarkerStylePreview | null,
): MapCaptureMarker[] {
  return applyStylePreview(markers, preview)
}

export function mergeFloorPlanMarkerStylePreview(
  markers: FloorPlanMarker[],
  preview: MarkerStylePreview | null,
): FloorPlanMarker[] {
  return applyStylePreview(markers, preview)
}
