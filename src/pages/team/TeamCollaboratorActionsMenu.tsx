import { EyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'

import { DropdownMenu } from '@/components/DropdownMenu'
import { MoreVerticalIcon } from '@/pages/projectsListPresentation'
import type { CollaboratorAccessLevel, TeamCollaborator } from '@/pages/team/types'

const menuItemIconClass = 'size-4'

type AccessOption = {
  id: string
  label: CollaboratorAccessLevel
  icon: typeof EyeIcon
}

const ACCESS_OPTIONS: AccessOption[] = [
  { id: 'viewer', label: 'Viewer', icon: EyeIcon },
  { id: 'editor', label: 'Editor', icon: PencilSquareIcon },
]

type TeamCollaboratorActionsMenuProps = {
  collaborator: TeamCollaborator
  onChangeAccess: (collaboratorId: string, access: CollaboratorAccessLevel) => void
  onRemove: (collaboratorId: string) => void
}

export function TeamCollaboratorActionsMenu({
  collaborator,
  onChangeAccess,
  onRemove,
}: TeamCollaboratorActionsMenuProps) {
  const iconClass = 'text-fg-muted group-hover:text-fg-highlight'

  const items = [
    ...ACCESS_OPTIONS.map((option) => ({
      id: `access-${option.id}`,
      label: option.label,
      icon: <option.icon className={menuItemIconClass} aria-hidden />,
      selected: collaborator.access === option.label,
      onSelect: () => onChangeAccess(collaborator.id, option.label),
    })),
    {
      id: 'remove',
      label: 'Remove collaborator',
      icon: <TrashIcon className={menuItemIconClass} aria-hidden />,
      onSelect: () => onRemove(collaborator.id),
    },
  ]

  return (
    <DropdownMenu
      menuAriaLabel={`Actions for ${collaborator.name}`}
      align="right"
      stopTriggerPropagation
      panelWidth="15rem"
      items={items}
      renderTrigger={({ open, menuId, onToggle }) => (
        <button
          type="button"
          onClick={onToggle}
          className={
            iconClass +
            ' inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-panel align-middle transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/40 focus-visible:outline-none'
          }
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          aria-label={`Actions for ${collaborator.name}`}
        >
          <MoreVerticalIcon />
        </button>
      )}
    />
  )
}
