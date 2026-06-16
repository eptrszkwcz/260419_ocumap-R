import type { FeatureCollection } from 'geojson'
import type { GeoJSONSource, LayerSpecification, Map as MapboxMap } from 'mapbox-gl'

import type { MapDrawnGeometry } from '@/panels/library/assetGeometryHelpers'

const DRAWN_GEOM_SOURCE_ID = 'ocumap-drawn-geometries'
export const DRAWN_LINE_LAYER_ID = 'ocumap-drawn-geometries-line'
export const DRAWN_FILL_LAYER_ID = 'ocumap-drawn-geometries-fill'

const DRAW_PREVIEW_SOURCE_ID = 'ocumap-draw-preview'
const DRAW_PREVIEW_POINTS_LAYER_ID = 'ocumap-draw-preview-points'
const DRAW_PREVIEW_LINE_LAYER_ID = 'ocumap-draw-preview-line'
const DRAW_PREVIEW_FILL_LAYER_ID = 'ocumap-draw-preview-fill'

function drawnGeometriesFeatureCollection(geometries: MapDrawnGeometry[]): FeatureCollection {
  const features: FeatureCollection['features'] = []

  for (const g of geometries) {
    const coords = g.coordinates.map((c) => [c.lng, c.lat] as [number, number])
    if (g.geometryType === 'polygon' && coords.length >= 3) {
      features.push({
        type: 'Feature',
        properties: { id: g.id, fillColor: g.color, strokeColor: g.strokeColor, kind: 'polygon' },
        geometry: { type: 'Polygon', coordinates: [[...coords, coords[0]]] },
      })
      continue
    }
    if (coords.length >= 2) {
      features.push({
        type: 'Feature',
        properties: { id: g.id, fillColor: g.color, strokeColor: g.strokeColor, kind: 'line' },
        geometry: { type: 'LineString', coordinates: coords },
      })
    }
  }

  return { type: 'FeatureCollection', features }
}

function drawPreviewFeatureCollection(
  vertices: { lng: number; lat: number }[],
  geometryType: 'point' | 'line' | 'polygon' | null,
  fillColor: string,
  strokeColor: string,
): FeatureCollection {
  const coords = vertices.map((v) => [v.lng, v.lat] as [number, number])
  const features: FeatureCollection['features'] = []

  if (coords.length > 0) {
    features.push({
      type: 'Feature',
      properties: { fillColor, strokeColor, kind: 'points' },
      geometry: { type: 'MultiPoint', coordinates: coords },
    })
  }

  if (geometryType === 'polygon' && coords.length >= 3) {
    features.push({
      type: 'Feature',
      properties: { fillColor, strokeColor, kind: 'polygon' },
      geometry: { type: 'Polygon', coordinates: [[...coords, coords[0]]] },
    })
  } else if (coords.length >= 2) {
    features.push({
      type: 'Feature',
      properties: { fillColor, strokeColor, kind: 'line' },
      geometry: { type: 'LineString', coordinates: coords },
    })
  }

  return { type: 'FeatureCollection', features }
}

type LayerSpecWithoutIdSource = Omit<LayerSpecification, 'id' | 'source'>

function ensureLayer(
  map: MapboxMap,
  layerId: string,
  sourceId: string,
  spec: LayerSpecWithoutIdSource,
) {
  if (map.getLayer(layerId) != null) return
  map.addLayer({ ...spec, id: layerId, source: sourceId })
}

export function syncDrawnGeometriesLayer(map: MapboxMap, geometries: MapDrawnGeometry[]) {
  const data = drawnGeometriesFeatureCollection(geometries)
  try {
    const existingSource = map.getSource(DRAWN_GEOM_SOURCE_ID)
    if (existingSource != null) {
      ;(existingSource as GeoJSONSource).setData(data)
      return
    }

    map.addSource(DRAWN_GEOM_SOURCE_ID, { type: 'geojson', data })
    ensureLayer(map, DRAWN_FILL_LAYER_ID, DRAWN_GEOM_SOURCE_ID, {
      type: 'fill',
      filter: ['==', ['get', 'kind'], 'polygon'],
      paint: {
        'fill-color': ['get', 'fillColor'],
        'fill-opacity': 0.35,
      },
    })
    ensureLayer(map, DRAWN_LINE_LAYER_ID, DRAWN_GEOM_SOURCE_ID, {
      type: 'line',
      paint: {
        'line-color': ['get', 'strokeColor'],
        'line-width': 2,
        'line-opacity': 0.85,
      },
    })
  } catch {
    /* style loading */
  }
}

export function syncDrawPreviewLayer(
  map: MapboxMap,
  vertices: { lng: number; lat: number }[],
  geometryType: 'point' | 'line' | 'polygon' | null,
  fillColor: string,
  strokeColor: string,
) {
  const data = drawPreviewFeatureCollection(vertices, geometryType, fillColor, strokeColor)
  try {
    const existingSource = map.getSource(DRAW_PREVIEW_SOURCE_ID)
    if (existingSource != null) {
      ;(existingSource as GeoJSONSource).setData(data)
      return
    }

    map.addSource(DRAW_PREVIEW_SOURCE_ID, { type: 'geojson', data })
    ensureLayer(map, DRAW_PREVIEW_FILL_LAYER_ID, DRAW_PREVIEW_SOURCE_ID, {
      type: 'fill',
      filter: ['==', ['get', 'kind'], 'polygon'],
      paint: {
        'fill-color': ['get', 'fillColor'],
        'fill-opacity': 0.25,
      },
    })
    ensureLayer(map, DRAW_PREVIEW_LINE_LAYER_ID, DRAW_PREVIEW_SOURCE_ID, {
      type: 'line',
      filter: ['any', ['==', ['get', 'kind'], 'line'], ['==', ['get', 'kind'], 'polygon']],
      paint: {
        'line-color': ['get', 'strokeColor'],
        'line-width': 2,
      },
    })
    ensureLayer(map, DRAW_PREVIEW_POINTS_LAYER_ID, DRAW_PREVIEW_SOURCE_ID, {
      type: 'circle',
      filter: ['==', ['get', 'kind'], 'points'],
      paint: {
        'circle-radius': 6,
        'circle-color': ['get', 'fillColor'],
        'circle-stroke-width': 2,
        'circle-stroke-color': ['get', 'strokeColor'],
      },
    })
  } catch {
    /* style loading */
  }
}

export function clearDrawPreviewLayer(map: MapboxMap) {
  syncDrawPreviewLayer(map, [], null, '#2563eb', '#1d4ed8')
}

export function resyncAllDrawLayers(
  map: MapboxMap,
  geometries: MapDrawnGeometry[],
  previewVertices: { lng: number; lat: number }[],
  isDrawing: boolean,
  geometryType: 'point' | 'line' | 'polygon' | null,
  fillColor: string,
  strokeColor: string,
) {
  syncDrawnGeometriesLayer(map, geometries)
  if (isDrawing && previewVertices.length > 0) {
    syncDrawPreviewLayer(map, previewVertices, geometryType, fillColor, strokeColor)
  } else {
    clearDrawPreviewLayer(map)
  }
}
