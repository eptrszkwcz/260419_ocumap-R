import { useEffect, useState } from 'react'

import { useActiveProject } from '@/context/ActiveProjectContext'
import { type SpatialAsset } from '@/data/sampleAssets'
import type { DemoProjectDetailsProfile } from '@/data/sampleProjectProfile'
import { projectTypeLabel } from '@/data/sampleProjects'
import {
  ProjectDetailsOpsForm,
  ProjectDetailsOverviewForm,
  ProjectDetailsScheduleForm,
  ProjectDetailsTeamForm,
} from '@/panels/library/projectDetails/ProjectDetailsForm'
import {
  ProjectDetailsReadView,
  ProjectFilesSection,
} from '@/panels/library/projectDetails/ProjectDetailsReadView'
import { ProjectDetailsToolbar } from '@/panels/library/projectDetails/ProjectDetailsToolbar'
import {
  draftToProfile,
  profileToDraft,
  type ProjectDetailsDraft,
} from '@/panels/library/projectDetails/types'

type ProjectDetailsPanelProps = {
  assets: SpatialAsset[]
  profile: DemoProjectDetailsProfile
  onSaveProfile: (profile: DemoProjectDetailsProfile) => void
}

export function ProjectDetailsPanel({ assets, profile, onSaveProfile }: ProjectDetailsPanelProps) {
  const { project } = useActiveProject()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<ProjectDetailsDraft>(() => profileToDraft(profile))

  useEffect(() => {
    setDraft(profileToDraft(profile))
    setIsEditing(false)
  }, [profile])

  const handleEdit = () => {
    setDraft(profileToDraft(profile))
    setIsEditing(true)
  }

  const handleCancel = () => {
    setDraft(profileToDraft(profile))
    setIsEditing(false)
  }

  const handleSave = () => {
    onSaveProfile(draftToProfile(draft))
    setIsEditing(false)
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <ProjectDetailsToolbar
        projectName={project.name}
        projectType={projectTypeLabel(project.projectType)}
        createdOn={profile.createdOn}
        createdOnIso={profile.createdOnIso}
        isEditing={isEditing}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onSave={handleSave}
      />
      <div className="min-h-0 flex-1 overflow-auto p-panel-padding">
        <div className="mx-auto max-w-3xl">
          {isEditing ? (
            <div className="flex flex-col gap-8 pb-8">
              <ProjectDetailsOverviewForm draft={draft} onDraftChange={setDraft} />
              <ProjectFilesSection assets={assets} />
              <ProjectDetailsTeamForm draft={draft} onDraftChange={setDraft} />
              <ProjectDetailsScheduleForm draft={draft} onDraftChange={setDraft} />
              <ProjectDetailsOpsForm draft={draft} onDraftChange={setDraft} />
            </div>
          ) : (
            <ProjectDetailsReadView profile={profile} assets={assets} />
          )}
        </div>
      </div>
    </div>
  )
}
