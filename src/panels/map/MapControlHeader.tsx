import { PrimaryAddButton } from '@/components/ControlHeaderToolbar'
import { DropdownMenu } from '@/components/DropdownMenu'

import type { FloorPlanId } from '@/panels/map/mapFloorPlans'
import { FLOOR_PLAN_OPTIONS, floorPlanDisplayLabel } from '@/panels/map/mapFloorPlans'
import {
  mapOverlayInsetTopClassName,
  mapOverlayInsetXClassName,
} from '@/panels/map/mapOverlayLayout'

const floorTriggerClassName =
  'text-fg-muted hover:text-fg-highlight inline-flex h-8 min-w-[7.5rem] max-w-full cursor-pointer items-center justify-between gap-2 rounded-panel border border-stroke bg-panel/95 px-2.5 font-sans text-standard font-normal leading-none shadow-sm backdrop-blur-[2px] focus-visible:border-fg-highlight focus-visible:ring-1 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      className={'shrink-0 ' + className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M3 4.5 6 7.5 9 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

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
  const selectedLabel = floorPlanDisplayLabel(selectedFloorId)

  return (
    <div
      id="control-header-map"
      className={
        'pointer-events-none absolute z-10 flex items-center justify-between gap-3 bg-transparent ' +
        mapOverlayInsetXClassName +
        ' ' +
        mapOverlayInsetTopClassName
      }
      role="toolbar"
      aria-label="Map floor plan"
    >
      <div className="pointer-events-auto min-w-0">
        <DropdownMenu
          menuAriaLabel="Floor plan"
          align="left"
          panelWidth="7.5rem"
          items={FLOOR_PLAN_OPTIONS.map((opt) => ({
            id: opt.id,
            label: opt.label,
            selected: opt.id === selectedFloorId,
            onSelect: () => onFloorChange(opt.id),
          }))}
          renderTrigger={({ open, menuId, onToggle }) => (
            <button
              type="button"
              onClick={onToggle}
              className={floorTriggerClassName}
              aria-expanded={open}
              aria-haspopup="menu"
              aria-controls={menuId}
              aria-label={`Floor plan: ${selectedLabel}`}
            >
              <span className="truncate">{selectedLabel}</span>
              <ChevronDownIcon />
            </button>
          )}
        />
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
