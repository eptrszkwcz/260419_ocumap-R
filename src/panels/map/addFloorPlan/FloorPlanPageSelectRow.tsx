import { ArrowPathIcon } from '@heroicons/react/24/outline'

import {
  featureMetadataInputClassName,
  featureMetadataSecondaryButtonClass,
} from '@/panels/library/featureMetadata/styles'

import type { RotationDeg } from '@/lib/floorPlanUpload/rotateImageBlob'

export type PendingFloorPlanPage = {
  id: string
  sourceLabel: string
  previewUrl: string
  renderUrl: string
  width: number
  height: number
  selected: boolean
  name: string
  rotationDeg: RotationDeg
}

type FloorPlanPageSelectRowProps = {
  page: PendingFloorPlanPage
  onToggleSelected: (id: string) => void
  onNameChange: (id: string, name: string) => void
  onRotate: (id: string) => void
}

export function FloorPlanPageSelectRow({
  page,
  onToggleSelected,
  onNameChange,
  onRotate,
}: FloorPlanPageSelectRowProps) {
  return (
    <div
      className={
        'flex flex-col gap-3 rounded-panel border border-stroke p-3 sm:flex-row sm:items-start ' +
        (page.selected ? 'bg-area-highlight-selected' : 'bg-panel')
      }
    >
      <button
        type="button"
        onClick={() => onToggleSelected(page.id)}
        className={
          'group flex shrink-0 cursor-pointer flex-col gap-1.5 rounded-panel text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 ' +
          (page.selected ? '' : 'hover:bg-area-highlight')
        }
        aria-pressed={page.selected}
        aria-label={`Select ${page.sourceLabel}`}
      >
        <div className="bg-area-highlight size-[140px] overflow-hidden rounded-panel">
          <img
            src={page.previewUrl}
            alt=""
            className="size-full object-contain transition-transform duration-200"
            style={{ transform: `rotate(${page.rotationDeg}deg)` }}
            decoding="async"
            draggable={false}
          />
        </div>
        <span
          className={
            'block max-w-[140px] truncate text-badge ' +
            (page.selected ? 'text-fg-highlight font-semibold' : 'text-fg-muted')
          }
        >
          {page.sourceLabel}
        </span>
      </button>

      {page.selected ? (
        <div className="flex min-w-0 flex-1 flex-col gap-3 pt-1">
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className="text-fg-muted text-badge">Floor Plan Name</span>
            <input
              type="text"
              value={page.name}
              onChange={(e) => onNameChange(page.id, e.target.value)}
              className={featureMetadataInputClassName}
              placeholder="Floor Plan Name"
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onRotate(page.id)}
              className={featureMetadataSecondaryButtonClass + ' inline-flex items-center gap-1.5'}
              aria-label={`Rotate ${page.sourceLabel}. Current rotation ${page.rotationDeg} degrees.`}
            >
              <ArrowPathIcon className="size-4 shrink-0" aria-hidden />
              Rotate {page.rotationDeg}°
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
