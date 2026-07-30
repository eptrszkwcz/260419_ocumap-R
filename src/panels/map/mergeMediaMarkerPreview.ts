import type { FloorPlanMarker, MapCaptureMarker } from '@/context/MapCaptureMarkersContext'
import type { MediaMarkerDraft } from '@/context/MediaMarkerFlowContext'
import {
  DEFAULT_MARKER_COLOR,
  markerColorsFromAsset,
  normalizeMarkerColor,
} from '@/panels/map/markerColors'

export const MEDIA_MARKER_DRAFT_ID = '__media-marker-draft__'

export function mergeMediaMarkerFloorPlanPreview(
  markers: FloorPlanMarker[],
  draft: MediaMarkerDraft | null,
  parentAssetId: string | null,
  floorPlanId: string,
): FloorPlanMarker[] {
  if (draft?.floorPlanPosition == null || parentAssetId == null) return markers
  if (draft.floorPlanPosition.floorPlanId !== floorPlanId) return markers

  const color = draft.isPreliminary
    ? DEFAULT_MARKER_COLOR
    : normalizeMarkerColor(draft.color)
  const { fill, stroke } = markerColorsFromAsset(color)
  const withoutDraft = markers.filter((m) => m.id !== MEDIA_MARKER_DRAFT_ID)

  return [
    ...withoutDraft,
    {
      id: MEDIA_MARKER_DRAFT_ID,
      title: draft.name ?? 'Marker',
      typeLabel: 'Marker',
      floorPlanId: draft.floorPlanPosition.floorPlanId,
      x: draft.floorPlanPosition.x,
      y: draft.floorPlanPosition.y,
      color: fill,
      strokeColor: stroke,
    },
  ]
}

export function mergeMediaMarkerCapturePreview(
  markers: MapCaptureMarker[],
  draft: MediaMarkerDraft | null,
  parentAssetId: string | null,
): MapCaptureMarker[] {
  if (draft?.mapPosition == null || parentAssetId == null) return markers

  const color = draft.isPreliminary
    ? DEFAULT_MARKER_COLOR
    : normalizeMarkerColor(draft.color)
  const { fill, stroke } = markerColorsFromAsset(color)
  const withoutDraft = markers.filter((m) => m.id !== MEDIA_MARKER_DRAFT_ID)

  return [
    ...withoutDraft,
    {
      id: MEDIA_MARKER_DRAFT_ID,
      title: draft.name ?? 'Marker',
      typeLabel: 'Marker',
      lng: draft.mapPosition.lng,
      lat: draft.mapPosition.lat,
      color: fill,
      strokeColor: stroke,
    },
  ]
}

export function mergePersistedMediaMarkersFloorPlan(
  markers: FloorPlanMarker[],
  _parentAssetId: string,
  _parentTitle: string,
  mediaMarkers: import('@/data/sampleAssets').MediaAnnotationMarker[],
  floorPlanId: string,
): FloorPlanMarker[] {
  const extras: FloorPlanMarker[] = []
  for (const m of mediaMarkers) {
    if (m.floorPlanPosition == null || m.floorPlanPosition.floorPlanId !== floorPlanId) continue
    const { fill, stroke } = markerColorsFromAsset(m.color)
    extras.push({
      id: m.id,
      title: m.name,
      typeLabel: 'Marker',
      floorPlanId: m.floorPlanPosition.floorPlanId,
      x: m.floorPlanPosition.x,
      y: m.floorPlanPosition.y,
      color: fill,
      strokeColor: stroke,
    })
  }
  return [...markers, ...extras]
}

export function mergePersistedMediaMarkersCapture(
  markers: MapCaptureMarker[],
  mediaMarkers: import('@/data/sampleAssets').MediaAnnotationMarker[],
): MapCaptureMarker[] {
  const extras: MapCaptureMarker[] = []
  for (const m of mediaMarkers) {
    if (m.mapPosition == null) continue
    const { fill, stroke } = markerColorsFromAsset(m.color)
    extras.push({
      id: m.id,
      title: m.name,
      typeLabel: 'Marker',
      lng: m.mapPosition.lng,
      lat: m.mapPosition.lat,
      color: fill,
      strokeColor: stroke,
    })
  }
  return [...markers, ...extras]
}
