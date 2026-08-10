import { forwardRef } from 'react'

import { useActiveProject } from '@/context/ActiveProjectContext'
import { useProjects } from '@/context/ProjectsContext'
import type { DemoProjectDetailsProfile } from '@/data/sampleProjectProfile'
import { PublishedProjectActionsMenu } from '@/panels/map/PublishedProjectActionsMenu'
import {
  mapOverlayInsetTopClassName,
  type PublishedChromeMode,
} from '@/panels/map/mapOverlayLayout'

function formatProjectAddress(profile: DemoProjectDetailsProfile): string {
  return [
    ...profile.location.addressLines.map((line) => line.trim()).filter(Boolean),
    profile.location.cityStateZip.trim(),
  ].join(', ')
}

type PublishedMapHeaderProps = {
  chromeMode?: PublishedChromeMode
  /** When true, parent owns absolute positioning (stacked/split chrome). */
  embedded?: boolean
  /** Shorter header; hide address (phone portrait / landscape). */
  compact?: boolean
}

export const PublishedMapHeader = forwardRef<HTMLElement, PublishedMapHeaderProps>(
  function PublishedMapHeader(
    { chromeMode = 'desktop', embedded = false, compact = false },
    ref,
  ) {
    const { project } = useActiveProject()
    const { getProjectProfile } = useProjects()
    const team = project.team.trim()
    const address = formatProjectAddress(getProjectProfile(project.id))
    const useCompactChrome = compact || chromeMode === 'narrow'
    const showAddress = !useCompactChrome && address !== ''

    const chromeClassName = useCompactChrome
      ? 'flex min-h-[3.5rem] items-center gap-3 rounded-panel border border-stroke bg-panel px-3 py-1.5 shadow-lg'
      : 'flex min-h-[5.25rem] items-center gap-4 rounded-panel border border-stroke bg-panel px-panel-padding py-2 shadow-lg'

    const widthClassName = embedded ? 'w-full min-w-0' : 'w-full max-w-[456px]'

    const positionClassName = embedded
      ? 'pointer-events-auto'
      : 'pointer-events-none absolute left-panel-padding z-20 ' + mapOverlayInsetTopClassName

    return (
      <header
        ref={ref}
        className={positionClassName + ' justify-between ' + widthClassName + ' ' + chromeClassName}
        aria-label="Project header"
      >
        <div className="pointer-events-auto flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
          <img
            src="/brand/ocumap-o-logo.svg"
            alt="OcuMap"
            className={useCompactChrome ? 'h-7 w-auto shrink-0' : 'h-9 w-auto shrink-0'}
            width={33}
            height={40}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden py-0.5">
            <h1
              className={
                'min-w-0 truncate font-bold text-fg ' +
                (useCompactChrome ? 'text-[14px] leading-[1.2]' : 'text-[16px] leading-[1.2]')
              }
              title={project.name}
            >
              {project.name}
            </h1>
            {team !== '' ? (
              <span
                className="min-w-0 truncate text-[12px] leading-[1.2] text-fg-muted"
                title={team}
              >
                {team}
              </span>
            ) : null}
            {showAddress ? (
              <address
                className="min-w-0 truncate text-[12px] leading-[1.2] text-fg-muted not-italic"
                title={address}
              >
                {address}
              </address>
            ) : null}
          </div>
        </div>
        <div className="pointer-events-auto shrink-0 self-start pt-0.5">
          <PublishedProjectActionsMenu project={project} />
        </div>
      </header>
    )
  },
)
