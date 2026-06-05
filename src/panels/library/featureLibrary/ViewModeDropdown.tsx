import { DropdownMenu } from '@/components/DropdownMenu'
import {
  ListViewIcon,
  secondaryToolbarButtonActiveClassName,
  secondaryToolbarButtonClassName,
  ThumbnailGridIcon,
} from '@/components/ControlHeaderToolbar'

import type { LibraryViewType } from '@/panels/library/featureLibrary/types'

type ViewModeDropdownProps = {
  viewType: LibraryViewType
  onViewTypeChange: (viewType: LibraryViewType) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewModeDropdown({
  viewType,
  onViewTypeChange,
  open,
  onOpenChange,
}: ViewModeDropdownProps) {
  return (
    <DropdownMenu
      menuAriaLabel="View mode"
      align="left"
      open={open}
      onOpenChange={onOpenChange}
      items={[
        {
          id: 'list',
          label: 'List',
          icon: <ListViewIcon />,
          selected: viewType === 'list',
          onSelect: () => onViewTypeChange('list'),
        },
        {
          id: 'thumbnail',
          label: 'Thumbnail',
          icon: <ThumbnailGridIcon />,
          selected: viewType === 'thumbnail',
          onSelect: () => onViewTypeChange('thumbnail'),
        },
      ]}
      renderTrigger={({ open: isOpen, menuId, onToggle }) => (
        <button
          type="button"
          onClick={onToggle}
          className={`${secondaryToolbarButtonClassName} ${isOpen ? secondaryToolbarButtonActiveClassName : ''}`}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-controls={menuId}
        >
          <span className="text-fg-muted shrink-0" aria-hidden>
            <ThumbnailGridIcon />
          </span>
          View
        </button>
      )}
    />
  )
}
