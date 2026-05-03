import { ControlHeaderToolbar } from '@/components/ControlHeaderToolbar'
import { Panel } from '@/components/Panel'
import { UserAccountDisplay } from '@/components/UserAccountDisplay'
import { sampleProjects } from '@/data/sampleProjects'
import { ProjectsBadgeRow } from '@/pages/ProjectsBadgeRow'
import { ProjectsTable } from '@/pages/ProjectsTable'

export function ProjectsPage() {
  return (
    <div className="bg-page flex h-full min-h-0 min-w-0 flex-col p-page">
      <header className="flex h-header shrink-0 items-center justify-between gap-4 pl-panel-padding">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex shrink-0 items-center">
            <img
              src="/brand/ocumap-o-logo.svg"
              alt="OcuMap"
              className="h-9 w-auto"
              width={33}
              height={40}
            />
          </div>
          <h1 className="min-w-0 flex-1 truncate font-title text-title font-bold text-fg">Projects</h1>
        </div>
        <UserAccountDisplay />
      </header>
      <Panel className="mt-6 flex min-h-0 min-w-0 flex-1 flex-col p-0">
        <ControlHeaderToolbar
          id="control-header-projects"
          toolbarAriaLabel="Projects list actions"
          addButtonVisibleLabel="New Project"
          addButtonAriaLabel="New project"
          addButtonLabelMaxWidthClass="max-w-[7.5rem]"
        />
        <ProjectsBadgeRow projectCount={sampleProjects.length} />
        <ProjectsTable projects={sampleProjects} />
      </Panel>
    </div>
  )
}
