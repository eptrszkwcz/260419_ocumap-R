import {
  ArchiveBoxIcon,
  ArrowUpTrayIcon,
  InformationCircleIcon,
  ShareIcon,
} from '@heroicons/react/24/outline'

import { DropdownMenu } from '@/components/DropdownMenu'
import type { ProjectRecord } from '@/data/sampleProjects'
import { MoreVerticalIcon } from '@/pages/projectsListPresentation'

const menuItemIconClass = 'size-4'

type ProjectActionsMenuProps = {
  project: ProjectRecord
  includeDetails?: boolean
  stopTriggerPropagation?: boolean
}

export function ProjectActionsMenu({
  project,
  includeDetails = false,
  stopTriggerPropagation = false,
}: ProjectActionsMenuProps) {
  const publishLabel = project.status === 'Published' ? 'Republish' : 'Publish'
  const iconClass = 'text-fg-muted group-hover:text-fg-highlight'

  const items = [
    ...(includeDetails
      ? [
          {
            id: 'details',
            label: 'Details',
            icon: <InformationCircleIcon className={menuItemIconClass} aria-hidden />,
            onSelect: () => undefined,
          },
        ]
      : []),
    {
      id: 'publish',
      label: publishLabel,
      icon: <ArrowUpTrayIcon className={menuItemIconClass} aria-hidden />,
      onSelect: () => undefined,
    },
    {
      id: 'share',
      label: 'Share',
      icon: <ShareIcon className={menuItemIconClass} aria-hidden />,
      onSelect: () => undefined,
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: <ArchiveBoxIcon className={menuItemIconClass} aria-hidden />,
      onSelect: () => undefined,
    },
  ]

  return (
    <DropdownMenu
      menuAriaLabel={`Actions for ${project.name}`}
      align="right"
      stopTriggerPropagation={stopTriggerPropagation}
      panelWidth="11.5rem"
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
          aria-label={`Actions for ${project.name}`}
        >
          <MoreVerticalIcon />
        </button>
      )}
    />
  )
}
