import type { FloorPlanDrawVertex, MapDrawVertex } from '@/context/FeatureDrawContext'
import type { SpatialAsset } from '@/data/sampleAssets'
import { formatFloorPlanCoord } from '@/lib/formatFloorPlanCoord'
import {
  floorPlanVerticesFromAsset,
  mapVerticesFromAsset,
} from '@/panels/library/assetGeometryHelpers'
import { featureMetadataInputClassName } from '@/panels/library/featureMetadata/styles'
import { floorPlanDisplayLabel, type FloorPlanId } from '@/panels/map/mapFloorPlans'

function coordInputValue(n: number | undefined): string {
  if (n == null || !Number.isFinite(n)) return ''
  return n.toFixed(6)
}

type DrawnFeatureGeometryFieldsProps = {
  asset: SpatialAsset
  isBuildingProject: boolean
  liveFloorPlanVertices?: FloorPlanDrawVertex[]
  liveMapVertices?: MapDrawVertex[]
  liveFloorPlanId?: FloorPlanId | null
}

export function DrawnFeatureGeometryFields({
  asset,
  isBuildingProject,
  liveFloorPlanVertices,
  liveMapVertices,
  liveFloorPlanId,
}: DrawnFeatureGeometryFieldsProps) {
  const fromAsset = floorPlanVerticesFromAsset(asset)
  const floorPlanId = liveFloorPlanId ?? fromAsset.floorPlanId
  const floorVertices =
    liveFloorPlanVertices != null && liveFloorPlanVertices.length > 0
      ? liveFloorPlanVertices
      : fromAsset.vertices
  const mapVertices =
    liveMapVertices != null && liveMapVertices.length > 0
      ? liveMapVertices
      : mapVerticesFromAsset(asset)

  const multiVertex = (isBuildingProject ? floorVertices : mapVertices).length > 1

  if (isBuildingProject) {
    const floorPlanLabel = floorPlanId != null ? floorPlanDisplayLabel(floorPlanId) : '—'

    if (floorVertices.length === 0) {
      return <StaticRow label="Location" value={floorPlanLabel} />
    }

    if (!multiVertex) {
      const v = floorVertices[0]
      return (
        <div className="grid min-w-0 grid-cols-[2fr_1fr_1fr] items-end gap-x-[16px]">
          <div className="block min-w-0">
            <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
              Location
            </span>
            <div
              className={
                'flex h-8 min-w-0 items-center rounded-panel border border-stroke/40 bg-panel px-2.5 text-standard leading-none ' +
                (floorPlanId != null ? 'text-fg' : 'text-fg-muted')
              }
            >
              <span className="truncate">{floorPlanLabel}</span>
            </div>
          </div>
          <label className="block min-w-0">
            <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">X</span>
            <input
              type="text"
              className={featureMetadataInputClassName + ' opacity-70'}
              value={formatFloorPlanCoord(v?.x)}
              readOnly
              aria-label="Floor plan X"
            />
          </label>
          <label className="block min-w-0">
            <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">Y</span>
            <input
              type="text"
              className={featureMetadataInputClassName + ' opacity-70'}
              value={formatFloorPlanCoord(v?.y)}
              readOnly
              aria-label="Floor plan Y"
            />
          </label>
        </div>
      )
    }

    return (
      <div className="flex min-w-0 flex-col gap-4">
        <div className="block min-w-0">
          <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
            Location
          </span>
          <div
            className={
              'flex h-8 min-w-0 items-center rounded-panel border border-stroke/40 bg-panel px-2.5 text-standard leading-none ' +
              (floorPlanId != null ? 'text-fg' : 'text-fg-muted')
            }
          >
            <span className="truncate">{floorPlanLabel}</span>
          </div>
        </div>
        {floorVertices.map((v, i) => (
          <div key={i} className="grid min-w-0 grid-cols-[1fr_1fr_1fr] items-end gap-x-[16px]">
            <div className="block min-w-0">
              <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                Vertex {i + 1}
              </span>
              <div className="h-8" aria-hidden />
            </div>
            <label className="block min-w-0">
              <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                X
              </span>
              <input
                type="text"
                className={featureMetadataInputClassName + ' opacity-70'}
                value={formatFloorPlanCoord(v.x)}
                readOnly
                aria-label={`Vertex ${i + 1} X`}
              />
            </label>
            <label className="block min-w-0">
              <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                Y
              </span>
              <input
                type="text"
                className={featureMetadataInputClassName + ' opacity-70'}
                value={formatFloorPlanCoord(v.y)}
                readOnly
                aria-label={`Vertex ${i + 1} Y`}
              />
            </label>
          </div>
        ))}
      </div>
    )
  }

  if (mapVertices.length === 0) {
    return null
  }

  if (!multiVertex) {
    const v = mapVertices[0]
    return (
      <div className="grid min-w-0 grid-cols-[1fr_1fr] items-end gap-x-[16px]">
        <label className="block min-w-0">
          <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
            Latitude
          </span>
          <input
            type="text"
            className={featureMetadataInputClassName + ' opacity-70'}
            value={coordInputValue(v.lat)}
            readOnly
            aria-label="Latitude"
          />
        </label>
        <label className="block min-w-0">
          <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
            Longitude
          </span>
          <input
            type="text"
            className={featureMetadataInputClassName + ' opacity-70'}
            value={coordInputValue(v.lng)}
            readOnly
            aria-label="Longitude"
          />
        </label>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {mapVertices.map((v, i) => (
        <div key={i} className="grid min-w-0 grid-cols-[1fr_1fr_1fr] items-end gap-x-[16px]">
          <div className="block min-w-0">
            <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
              Vertex {i + 1}
            </span>
            <div className="h-8" aria-hidden />
          </div>
          <label className="block min-w-0">
            <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
              Latitude
            </span>
            <input
              type="text"
              className={featureMetadataInputClassName + ' opacity-70'}
              value={coordInputValue(v.lat)}
              readOnly
              aria-label={`Vertex ${i + 1} latitude`}
            />
          </label>
          <label className="block min-w-0">
            <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
              Longitude
            </span>
            <input
              type="text"
              className={featureMetadataInputClassName + ' opacity-70'}
              value={coordInputValue(v.lng)}
              readOnly
              aria-label={`Vertex ${i + 1} longitude`}
            />
          </label>
        </div>
      ))}
    </div>
  )
}

function StaticRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="block min-w-0">
      <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">{label}</span>
      <div className="text-fg flex h-8 min-w-0 items-center rounded-panel border border-stroke/40 bg-panel px-2.5 text-standard leading-none">
        <span className="truncate">{value}</span>
      </div>
    </div>
  )
}
