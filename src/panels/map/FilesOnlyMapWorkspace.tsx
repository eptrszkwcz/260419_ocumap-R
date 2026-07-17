import type { ReactNode } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'

import { BridgeMapIcon, FloorPlanMapIcon } from '@/assets/icons/FilesOnlyMapIcons'
import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'

type FilesOnlyMapWorkspaceProps = {
  onAddMap: () => void
  onAddFloorPlan: () => void
}

const heroTitleClass = 'font-title text-title font-bold text-fg'

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
            icon={<BridgeMapIcon />}
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
            icon={<FloorPlanMapIcon />}
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
