import { PrimaryAddButton } from '@/components/ControlHeaderToolbar'
import { DropdownMenu } from '@/components/DropdownMenu'

import type { FloorPlanId, FloorPlanOption } from '@/panels/map/mapFloorPlans'
import {
  mapOverlayInsetBottomClassName,
  mapOverlayInsetLeftClassName,
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
  floorPlanOptions: FloorPlanOption[]
  selectedFloorId: FloorPlanId | null
  onFloorChange: (id: FloorPlanId) => void
  onAddFloorPlan?: () => void
  showAddFloorPlan?: boolean
  variant?: 'editor' | 'published'
  layoutMode?: 'full' | 'mini'
}

/**
 * Transparent overlay strip on the 2D map: floor plan selector + Add Floor Plan.
 */
export function MapControlHeader({
  floorPlanOptions,
  selectedFloorId,
  onFloorChange,
  onAddFloorPlan,
  showAddFloorPlan = true,
  variant = 'editor',
  layoutMode = 'full',
}: MapControlHeaderProps) {
  const isPublished = variant === 'published'
  const isPublishedMini = isPublished && layoutMode === 'mini'
  const isPublishedFull = isPublished && !isPublishedMini
  const selectedLabel =
    selectedFloorId != null
      ? (floorPlanOptions.find((o) => o.id === selectedFloorId)?.label ?? selectedFloorId)
      : 'No floor plans'

  return (
    <div
      id="control-header-map"
      className={
        isPublished
          ? 'pointer-events-none absolute z-10 ' +
            (isPublishedFull
              ? mapOverlayInsetBottomClassName + ' ' + mapOverlayInsetLeftClassName
              : mapOverlayInsetTopClassName + ' ' + mapOverlayInsetLeftClassName)
          : 'pointer-events-none absolute z-10 flex items-center justify-between gap-3 bg-transparent ' +
            mapOverlayInsetXClassName +
            ' ' +
            mapOverlayInsetTopClassName
      }
      role="toolbar"
      aria-label="Map floor plan"
    >
      <div className="pointer-events-auto min-w-0">
        {floorPlanOptions.length > 0 && selectedFloorId != null ? (
          <DropdownMenu
            menuAriaLabel="Floor plan"
            align="left"
            placement={isPublishedFull ? 'top' : 'bottom'}
            panelWidth="7.5rem"
            items={floorPlanOptions.map((opt) => ({
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
        ) : null}
      </div>
      {showAddFloorPlan ? (
        <div className="pointer-events-auto shrink-0">
          <PrimaryAddButton
            onAddClick={onAddFloorPlan}
            visibleLabel="Add Floor Plan"
            ariaLabel="Add floor plan"
            labelMaxWidthClass="max-w-[9rem]"
          />
        </div>
      ) : null}
    </div>
  )
}
