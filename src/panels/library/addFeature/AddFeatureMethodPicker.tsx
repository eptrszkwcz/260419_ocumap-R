import type { ReactNode } from 'react'

import {
  CsvTypeIcon,
  DwgTypeIcon,
  GeoJsonTypeIcon,
  LineGeometryIcon,
  Model3DTypeIcon,
  Panorama360TypeIcon,
  PhotoTypeIcon,
  PointGeometryIcon,
  PolygonGeometryIcon,
  VideoTypeIcon,
} from '@/panels/library/addFeature/addFeatureTypeIcons'

type AddFeatureMethodPickerProps = {
  onChooseUpload: () => void
  onChooseDraw: () => void
  onCancel: () => void
}

type MethodCardProps = {
  title: string
  ariaLabel: string
  onClick: () => void
  children: ReactNode
}

const cardClass =
  'flex min-h-[220px] min-w-0 flex-1 cursor-pointer flex-col rounded-panel border border-stroke bg-panel p-4 text-left transition-colors hover:border-fg-highlight/60 hover:bg-area-highlight/30 focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

const trayClass =
  'mt-4 flex min-h-0 flex-1 flex-col justify-center rounded-panel bg-area-highlight/40 px-3 py-4'

function TypeIconItem({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5">
      {icon}
      <span className="text-fg-muted text-center font-sans text-badge leading-tight">{label}</span>
    </div>
  )
}

function MethodCard({ title, ariaLabel, onClick, children }: MethodCardProps) {
  return (
    <button type="button" className={cardClass} aria-label={ariaLabel} onClick={onClick}>
      <span className="block text-center font-title text-standard font-bold text-fg">{title}</span>
      <div className={trayClass}>{children}</div>
    </button>
  )
}

export function AddFeatureMethodPicker({
  onChooseUpload,
  onChooseDraw,
  onCancel,
}: AddFeatureMethodPickerProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="min-h-0 min-w-0 flex-1 overflow-auto p-panel-padding">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 min-[520px]:flex-row">
          <MethodCard
            title="Upload files"
            ariaLabel="Upload files"
            onClick={onChooseUpload}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-center gap-x-4 gap-y-3">
                <TypeIconItem label="Photo" icon={<PhotoTypeIcon />} />
                <TypeIconItem label="360 Photo" icon={<Panorama360TypeIcon />} />
                <TypeIconItem label="Video" icon={<VideoTypeIcon />} />
              </div>
              <div className="flex flex-wrap items-start justify-center gap-x-4 gap-y-3">
                <TypeIconItem label="3D Model" icon={<Model3DTypeIcon />} />
                <TypeIconItem label="DWG" icon={<DwgTypeIcon />} />
                <TypeIconItem label="CSV" icon={<CsvTypeIcon />} />
                <TypeIconItem label="geojson" icon={<GeoJsonTypeIcon />} />
              </div>
            </div>
          </MethodCard>

          <MethodCard
            title="Draw a feature on the map"
            ariaLabel="Draw a feature on the map"
            onClick={onChooseDraw}
          >
            <div className="flex flex-wrap items-start justify-center gap-x-5 gap-y-3">
              <TypeIconItem label="Point" icon={<PointGeometryIcon />} />
              <TypeIconItem label="Line" icon={<LineGeometryIcon />} />
              <TypeIconItem label="Polygon" icon={<PolygonGeometryIcon />} />
            </div>
          </MethodCard>
        </div>
      </div>

      <div className="border-t border-stroke bg-panel px-panel-padding py-3">
        <button
          type="button"
          onClick={onCancel}
          className="text-fg-muted text-standard cursor-pointer rounded-panel px-3 py-1.5 hover:text-fg hover:underline focus-visible:ring-2 focus-visible:ring-fg-highlight/40 focus-visible:outline-none"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
