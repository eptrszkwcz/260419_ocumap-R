import { TrashIcon, UserCircleIcon } from '@heroicons/react/24/outline'

import { DropdownMenu } from '@/components/DropdownMenu'
import { MoreVerticalIcon } from '@/pages/projectsListPresentation'
import type { TeamAccessLevel, TeamMember, TeamMemberRole } from '@/pages/team/types'

const menuItemIconClass = 'size-4'

type TeamMemberRoleOption = {
  id: string
  label: string
  role: TeamMemberRole
  access: TeamAccessLevel
}

const ROLE_OPTIONS: TeamMemberRoleOption[] = [
  { id: 'admin', label: 'Admin', role: 'Admin', access: 'Full access' },
  { id: 'full-access', label: 'Full access', role: 'Member', access: 'Full access' },
  { id: 'editor', label: 'Editor', role: 'Member', access: 'Editor' },
  { id: 'viewer', label: 'Viewer', role: 'Member', access: 'Viewer' },
]

function isSameRole(
  member: TeamMember,
  option: TeamMemberRoleOption,
): boolean {
  return member.role === option.role && member.access === option.access
}

type TeamMemberActionsMenuProps = {
  member: TeamMember
  onChangeRole: (memberId: string, role: TeamMemberRole, access: TeamAccessLevel) => void
  onRemove: (memberId: string) => void
}

export function TeamMemberActionsMenu({
  member,
  onChangeRole,
  onRemove,
}: TeamMemberActionsMenuProps) {
  const iconClass = 'text-fg-muted group-hover:text-fg-highlight'

  const items = [
    ...ROLE_OPTIONS.map((option) => ({
      id: `role-${option.id}`,
      label: option.label,
      icon: <UserCircleIcon className={menuItemIconClass} aria-hidden />,
      selected: isSameRole(member, option),
      onSelect: () => onChangeRole(member.id, option.role, option.access),
    })),
    {
      id: 'remove',
      label: 'Remove from team',
      icon: <TrashIcon className={menuItemIconClass} aria-hidden />,
      onSelect: () => onRemove(member.id),
    },
  ]

  return (
    <DropdownMenu
      menuAriaLabel={`Actions for ${member.name}`}
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
          aria-label={`Actions for ${member.name}`}
        >
          <MoreVerticalIcon />
        </button>
      )}
    />
  )
}
