import { Panel } from '@/components/Panel'
import { HamburgerIcon } from '@/components/HamburgerIcon'
import { useActiveProject } from '@/context/ActiveProjectContext'
import { useNewProject } from '@/context/NewProjectContext'
import { useProjectsDrawer } from '@/context/ProjectsDrawerContext'
import { ProjectActionsMenu } from '@/pages/projects/ProjectActionsMenu'
import { ProjectStatusBadge } from '@/pages/projects/ProjectStatusBadge'

export function LibraryHeader() {
  const { toggle } = useProjectsDrawer()
  const { project, isNewProject } = useActiveProject()
  const { draft } = useNewProject()
  const displayName = isNewProject ? draft.name.trim() : project.name

  return (
    <Panel className="flex h-header shrink-0 items-center gap-3 border-0 px-panel-padding">
      <button
        type="button"
        onClick={toggle}
        className="text-fg hover:bg-area-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-highlight/35 flex size-icon-button shrink-0 items-center justify-center rounded-panel border border-transparent transition-colors"
        aria-label="Menu"
      >
        <HamburgerIcon />
      </button>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <h1 className="min-w-0 truncate font-title text-title font-bold text-fg">{displayName}</h1>
        {!isNewProject ? (
          <ProjectStatusBadge status={project.status} publishedDate={project.publishedDate} />
        ) : null}
      </div>
      {!isNewProject ? <ProjectActionsMenu project={project} /> : null}
    </Panel>
  )
}
