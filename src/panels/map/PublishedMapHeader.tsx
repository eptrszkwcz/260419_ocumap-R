import { useActiveProject } from '@/context/ActiveProjectContext'
import { useProjects } from '@/context/ProjectsContext'
import type { DemoProjectDetailsProfile } from '@/data/sampleProjectProfile'
import { ProjectActionsMenu } from '@/pages/projects/ProjectActionsMenu'
import {
  mapOverlayInsetTopClassName,
  publishedMapHeaderPanelClassName,
} from '@/panels/map/mapOverlayLayout'

function formatProjectAddress(profile: DemoProjectDetailsProfile): string {
  return [
    ...profile.location.addressLines.map((line) => line.trim()).filter(Boolean),
    profile.location.cityStateZip.trim(),
  ].join(', ')
}

export function PublishedMapHeader() {
  const { project } = useActiveProject()
  const { getProjectProfile } = useProjects()
  const team = project.team.trim()
  const address = formatProjectAddress(getProjectProfile(project.id))

  return (
    <header
      className={
        'pointer-events-none absolute left-panel-padding z-20 justify-between ' +
        mapOverlayInsetTopClassName +
        ' ' +
        publishedMapHeaderPanelClassName
      }
      aria-label="Project header"
    >
      <div className="pointer-events-auto flex min-w-0 flex-1 items-center gap-3">
        <img
          src="/brand/ocumap-o-logo.svg"
          alt="OcuMap"
          className="h-9 w-auto shrink-0"
          width={33}
          height={40}
        />
        <div className="flex min-w-0 flex-col gap-0.5 py-0.5">
          <h1 className="min-w-0 truncate text-[16px] leading-[1.2] font-bold text-fg">{project.name}</h1>
          {team !== '' ? (
            <span className="truncate text-[12px] leading-[1.2] text-fg-muted">{team}</span>
          ) : null}
          {address !== '' ? (
            <address className="truncate text-[12px] leading-[1.2] text-fg-muted not-italic">
              {address}
            </address>
          ) : null}
        </div>
      </div>
      <div className="pointer-events-auto shrink-0 self-start pt-0.5">
        <ProjectActionsMenu project={project} />
      </div>
    </header>
  )
}
