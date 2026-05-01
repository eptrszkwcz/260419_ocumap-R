import { useId } from 'react'

import { PrimaryAddButton } from '@/components/ControlHeaderToolbar'

import type { FloorPlanId } from '@/panels/map/mapFloorPlans'
import { FLOOR_PLAN_OPTIONS } from '@/panels/map/mapFloorPlans'

const floorSelectClassName =
  'text-fg h-8 min-w-[7.5rem] max-w-full rounded-panel border border-stroke bg-panel/95 px-2.5 pr-8 text-standard leading-none shadow-sm backdrop-blur-[2px] focus-visible:border-fg-highlight focus-visible:ring-1 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

type MapControlHeaderProps = {
  selectedFloorId: FloorPlanId
  onFloorChange: (id: FloorPlanId) => void
  onAddFloorPlan?: () => void
}

/**
 * Transparent overlay strip on the 2D map: floor plan selector + Add Floor Plan.
 */
export function MapControlHeader({
  selectedFloorId,
  onFloorChange,
  onAddFloorPlan,
}: MapControlHeaderProps) {
  const selectId = useId()

  return (
    <div
      id="control-header-map"
      className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-3 bg-transparent px-panel-padding"
      role="toolbar"
      aria-label="Map floor plan"
    >
      <div className="pointer-events-auto min-w-0">
        <label htmlFor={selectId} className="sr-only">
          Floor plan
        </label>
        <select
          id={selectId}
          value={selectedFloorId}
          onChange={(e) => onFloorChange(e.target.value as FloorPlanId)}
          className={floorSelectClassName}
          aria-label="Floor plan"
        >
          {FLOOR_PLAN_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="pointer-events-auto shrink-0">
        <PrimaryAddButton
          onAddClick={onAddFloorPlan}
          visibleLabel="Add Floor Plan"
          ariaLabel="Add floor plan"
          labelMaxWidthClass="max-w-[9rem]"
        />
      </div>
    </div>
  )
}
