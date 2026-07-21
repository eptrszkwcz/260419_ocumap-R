import {
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'

import { DropdownMenu } from '@/components/DropdownMenu'
import type { ProjectRecord } from '@/data/sampleProjects'
import { PublishedDownloadProjectFilesModal } from '@/panels/map/PublishedDownloadProjectFilesModal'
import { PublishedProjectDetailsModal } from '@/panels/map/PublishedProjectDetailsModal'
import { PublishedReportIssueModal } from '@/panels/map/PublishedReportIssueModal'
import { MoreVerticalIcon } from '@/pages/projectsListPresentation'

const menuItemIconClass = 'size-4'

type PublishedModalId = 'details' | 'download' | 'issue'

type PublishedProjectActionsMenuProps = {
  project: ProjectRecord
}

export function PublishedProjectActionsMenu({ project }: PublishedProjectActionsMenuProps) {
  const [openModal, setOpenModal] = useState<PublishedModalId | null>(null)
  const iconClass = 'text-fg-muted group-hover:text-fg-highlight'

  const items = [
    {
      id: 'details',
      label: 'Project Details',
      icon: <InformationCircleIcon className={menuItemIconClass} aria-hidden />,
      onSelect: () => setOpenModal('details'),
    },
    {
      id: 'download',
      label: 'Download Project Files',
      icon: <ArrowDownTrayIcon className={menuItemIconClass} aria-hidden />,
      onSelect: () => setOpenModal('download'),
    },
    {
      id: 'issue',
      label: 'Report an Issue',
      icon: <ExclamationTriangleIcon className={menuItemIconClass} aria-hidden />,
      onSelect: () => setOpenModal('issue'),
    },
  ]

  const closeModal = () => setOpenModal(null)

  return (
    <>
      <DropdownMenu
        menuAriaLabel={`Actions for ${project.name}`}
        align="right"
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
            aria-label={`Actions for ${project.name}`}
          >
            <MoreVerticalIcon />
          </button>
        )}
      />

      {openModal === 'details' ? (
        <PublishedProjectDetailsModal project={project} onClose={closeModal} />
      ) : null}
      {openModal === 'download' ? (
        <PublishedDownloadProjectFilesModal project={project} onClose={closeModal} />
      ) : null}
      {openModal === 'issue' ? (
        <PublishedReportIssueModal project={project} onClose={closeModal} />
      ) : null}
    </>
  )
}
