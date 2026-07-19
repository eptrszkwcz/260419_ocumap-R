import { useProjects } from '@/context/ProjectsContext'
import { getSampleAssetsForProject } from '@/data/sampleAssets'
import type { ProjectRecord } from '@/data/sampleProjects'
import { projectTypeLabel } from '@/data/sampleProjects'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
} from '@/panels/library/featureMetadata/styles'
import { ProjectDetailsReadView } from '@/panels/library/projectDetails/ProjectDetailsReadView'
import { PublishedModalShell } from '@/panels/map/PublishedModalShell'

const headerBadgeClass =
  'text-fg-highlight inline-flex h-badge min-h-badge max-h-badge min-w-0 shrink-0 items-center justify-center rounded-panel bg-fg-highlight/12 px-2 text-badge font-bold leading-none'

type PublishedProjectDetailsModalProps = {
  project: ProjectRecord
  onClose: () => void
}

export function PublishedProjectDetailsModal({ project, onClose }: PublishedProjectDetailsModalProps) {
  const { getProjectProfile } = useProjects()
  const profile = getProjectProfile(project.id)
  const assets = getSampleAssetsForProject(project.id)

  return (
    <PublishedModalShell
      ariaLabel={`Project details for ${project.name}`}
      maxWidthClass="max-w-3xl"
      onClose={onClose}
      header={
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-stroke px-6 py-4">
          <h1 className="min-w-0 flex-1 truncate font-title text-title font-bold text-fg">
            {project.name}
          </h1>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span className={headerBadgeClass}>{projectTypeLabel(project.projectType)}</span>
            <time className={headerBadgeClass} dateTime={profile.createdOnIso}>
              Created {profile.createdOn}
            </time>
          </div>
        </div>
      }
      footer={
        <footer className="flex shrink-0 border-t border-stroke bg-page px-6 py-4">
          <div className={featureMetadataFooterActionsClassName}>
            <button
              type="button"
              onClick={onClose}
              className={featureMetadataFooterCancelButtonClass + ' ml-auto'}
            >
              Close
            </button>
          </div>
        </footer>
      }
    >
      <div className="p-6">
        <ProjectDetailsReadView profile={profile} assets={assets} />
      </div>
    </PublishedModalShell>
  )
}
