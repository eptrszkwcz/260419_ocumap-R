import type { ReactNode } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'

import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'

type FilesOnlyMapWorkspaceProps = {
  onAddMap: () => void
  onAddFloorPlan: () => void
}

const heroTitleClass = 'font-title text-title font-bold text-fg'

const strokeProps = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function HighwayMapIcon() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      className="mx-auto text-fg"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M8 44 L20 12 L28 12 L36 44" {...strokeProps} />
      <path d="M20 12 L36 12" {...strokeProps} />
      <path d="M14 28 L42 28" {...strokeProps} />
      <path d="M12 36 L44 36" {...strokeProps} />
      <path d="M10 44 L46 44" {...strokeProps} />
    </svg>
  )
}

function FloorPlanScrollIcon() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      className="mx-auto text-fg"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M14 10 C14 10 14 46 14 46 C14 46 18 44 22 44 C26 44 30 46 34 46 C38 46 42 44 42 44 L42 8 C42 8 38 10 34 10 C30 10 26 8 22 8 C18 8 14 10 14 10 Z"
        {...strokeProps}
      />
      <path d="M22 18 L34 18" {...strokeProps} />
      <path d="M22 24 L34 24" {...strokeProps} />
      <path d="M22 30 L30 30" {...strokeProps} />
      <path d="M22 36 L34 36" {...strokeProps} />
    </svg>
  )
}

function WorkspaceCard({
  icon,
  description,
  buttonLabel,
  onAction,
}: {
  icon: ReactNode
  description: ReactNode
  buttonLabel: string
  onAction: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-panel border border-stroke bg-panel px-6 py-8 text-center">
      {icon}
      <p className="font-sans text-standard leading-relaxed text-fg">{description}</p>
      <button
        type="button"
        onClick={onAction}
        className={
          PRIMARY_BUTTON_CLASS +
          ' inline-flex items-center gap-1.5 rounded-panel px-4 py-2 font-sans text-standard font-bold'
        }
        aria-label={buttonLabel}
      >
        <PlusIcon className="size-4 shrink-0" aria-hidden />
        {buttonLabel}
      </button>
    </div>
  )
}

export function FilesOnlyMapWorkspace({ onAddMap, onAddFloorPlan }: FilesOnlyMapWorkspaceProps) {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-auto p-panel-padding"
      role="region"
      aria-label="Add a map or floor plan"
    >
      <div className="mx-auto my-auto flex w-full max-w-3xl shrink-0 flex-col gap-6">
        <div>
          <h2 className={heroTitleClass}>Add a map or floor plan</h2>
          <p className="mt-2 font-sans text-standard italic text-fg-muted">
            Enrich your project by locating feature from your library on a map or floor plan!
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <WorkspaceCard
            icon={<HighwayMapIcon />}
            description={
              <>
                For <strong>larger projects</strong> (not contained within a single building), a map
                here works best.
              </>
            }
            buttonLabel="Add Map"
            onAction={onAddMap}
          />
          <WorkspaceCard
            icon={<FloorPlanScrollIcon />}
            description={
              <>
                For <strong>smaller projects</strong> within a single building, add one or multiple
                floor plans here.
              </>
            }
            buttonLabel="Add Floor Plan"
            onAction={onAddFloorPlan}
          />
        </div>
      </div>
    </div>
  )
}
