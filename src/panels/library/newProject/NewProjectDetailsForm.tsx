import { useNavigate } from 'react-router-dom'

import { useNewProject } from '@/context/NewProjectContext'
import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'
import { CollapsibleSection } from '@/panels/library/newProject/CollapsibleSection'
import {
  ProjectDetailsOpsForm,
  ProjectDetailsOverviewForm,
  ProjectDetailsScheduleForm,
  ProjectDetailsTeamForm,
} from '@/panels/library/projectDetails/ProjectDetailsForm'
import { featureMetadataInputClassName } from '@/panels/library/featureMetadata/styles'

const labelClass = 'text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide'
const heroTitleClass = 'font-title text-title font-bold text-fg'

export function NewProjectDetailsForm() {
  const navigate = useNavigate()
  const {
    draft,
    setName,
    setLocation,
    setProfileDraft,
    canCreate,
    cancelNewProject,
    commitNewProject,
  } = useNewProject()

  const handleCreate = () => {
    const newId = commitNewProject()
    navigate(`/library?project=${newId}`, { replace: true })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        id="control-header-project-details"
        className="flex h-16 w-full shrink-0 items-center gap-3 border-b border-stroke px-panel-padding"
        role="toolbar"
        aria-label="Create new project"
      >
        <h2 className="min-w-0 flex-1 truncate font-title text-title font-bold text-fg">
          Create new project
        </h2>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-auto p-panel-padding">
        <div
          id="new-project-details-container"
          className="mx-auto my-auto flex h-[480px] w-full max-w-3xl shrink-0 flex-col gap-6 overflow-auto"
        >
          <div>
            <h2 className={heroTitleClass}>Add project details</h2>
            <p className="mt-2 font-sans text-standard text-fg-muted">
              Enter a project name and location to get started. Other details are optional.
            </p>
          </div>

          <div className="grid gap-4">
            <label className="block min-w-0">
              <span className={labelClass}>
                Project name <span className="text-fg-highlight">*</span>
              </span>
              <input
                type="text"
                className={featureMetadataInputClassName}
                value={draft.name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Medical Office Renovation"
                aria-required
              />
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>
                Location / address <span className="text-fg-highlight">*</span>
              </span>
              <input
                type="text"
                className={featureMetadataInputClassName}
                value={draft.location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Houston, TX"
                aria-required
              />
            </label>
          </div>

          <CollapsibleSection title="Additional project details">
            <div className="flex flex-col gap-8">
              <ProjectDetailsOverviewForm
                draft={draft.profileDraft}
                onDraftChange={setProfileDraft}
                omitPrimaryLocation
                hideSectionHeading
              />
              <ProjectDetailsTeamForm
                draft={draft.profileDraft}
                onDraftChange={setProfileDraft}
              />
              <ProjectDetailsScheduleForm
                draft={draft.profileDraft}
                onDraftChange={setProfileDraft}
              />
              <ProjectDetailsOpsForm draft={draft.profileDraft} onDraftChange={setProfileDraft} />
            </div>
          </CollapsibleSection>
        </div>
      </div>

      <div className="border-t border-stroke bg-panel px-panel-padding py-3">
        <div className="mx-auto flex w-full max-w-3xl min-w-0 items-center justify-between gap-2">
          <button
            type="button"
            onClick={cancelNewProject}
            className="text-fg-muted text-standard cursor-pointer rounded-panel px-3 py-1.5 hover:text-fg hover:underline focus-visible:ring-2 focus-visible:ring-fg-highlight/40 focus-visible:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!canCreate}
            className={
              PRIMARY_BUTTON_CLASS +
              ' h-8 rounded-panel px-4 text-standard disabled:cursor-not-allowed disabled:opacity-40'
            }
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  )
}
