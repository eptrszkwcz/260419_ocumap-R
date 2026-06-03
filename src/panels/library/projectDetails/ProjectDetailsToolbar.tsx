import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'
import { featureMetadataSecondaryButtonClass } from '@/panels/library/featureMetadata/styles'

const headerBadgeClass =
  'text-fg-highlight inline-flex h-badge min-h-badge max-h-badge min-w-0 shrink-0 items-center justify-center rounded-panel bg-fg-highlight/12 px-2 text-badge font-bold leading-none'

type ProjectDetailsToolbarProps = {
  projectName: string
  projectType: string
  createdOn: string
  createdOnIso: string
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
}

export function ProjectDetailsToolbar({
  projectName,
  projectType,
  createdOn,
  createdOnIso,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}: ProjectDetailsToolbarProps) {
  return (
    <div
      id="control-header-project-details"
      className="flex h-16 w-full shrink-0 items-center gap-3 border-b border-stroke px-panel-padding"
      role="toolbar"
      aria-label="Project details actions"
    >
      <div className="flex min-w-0 flex-1 items-center">
        <h2 className="min-w-0 flex-1 truncate font-title text-title font-bold text-fg">{projectName}</h2>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={headerBadgeClass}>{projectType}</span>
        <time className={headerBadgeClass} dateTime={createdOnIso}>
          Created {createdOn}
        </time>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {isEditing ? (
          <>
            <button type="button" onClick={onCancel} className={featureMetadataSecondaryButtonClass}>
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              className={
                PRIMARY_BUTTON_CLASS +
                ' h-8 rounded-panel px-4 text-standard focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'
              }
            >
              Save
            </button>
          </>
        ) : (
          <button type="button" onClick={onEdit} className={featureMetadataSecondaryButtonClass}>
            Edit
          </button>
        )}
      </div>
    </div>
  )
}
