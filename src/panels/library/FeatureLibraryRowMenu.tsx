import {
  ArrowDownTrayIcon,
  ArrowsRightLeftIcon,
  DocumentDuplicateIcon,
  InformationCircleIcon,
  MapPinIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

import { DropdownMenu } from '@/components/DropdownMenu'
import type { SpatialAsset } from '@/data/sampleAssets'

function MoreVerticalIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="8" cy="3" r="1.5" fill="currentColor" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
      <circle cx="8" cy="13" r="1.5" fill="currentColor" />
    </svg>
  )
}

const menuItemIconClass = 'size-4'

type FeatureLibraryRowMenuProps = {
  asset: SpatialAsset
  isLinked: boolean
  onSetLocation: () => void
  onDownload: () => void
  onCopy: () => void
  onMove: () => void
  onDelete: () => void
  onFeatureProperties: () => void
}

export function FeatureLibraryRowMenu({
  asset,
  isLinked,
  onSetLocation,
  onDownload,
  onCopy,
  onMove,
  onDelete,
  onFeatureProperties,
}: FeatureLibraryRowMenuProps) {
  const iconClass = isLinked ? 'text-fg-highlight' : 'text-fg-muted group-hover:text-fg-highlight'

  return (
    <DropdownMenu
      menuAriaLabel={`Actions for ${asset.title}`}
      align="right"
      stopTriggerPropagation
      items={[
        {
          id: 'set-location',
          label: 'Set feature location',
          icon: <MapPinIcon className={menuItemIconClass} aria-hidden />,
          onSelect: onSetLocation,
        },
        {
          id: 'download',
          label: 'Download',
          icon: <ArrowDownTrayIcon className={menuItemIconClass} aria-hidden />,
          onSelect: onDownload,
        },
        {
          id: 'copy',
          label: 'Copy',
          icon: <DocumentDuplicateIcon className={menuItemIconClass} aria-hidden />,
          onSelect: onCopy,
        },
        {
          id: 'move',
          label: 'Move',
          icon: <ArrowsRightLeftIcon className={menuItemIconClass} aria-hidden />,
          onSelect: onMove,
        },
        {
          id: 'properties',
          label: 'Details',
          icon: <InformationCircleIcon className={menuItemIconClass} aria-hidden />,
          onSelect: onFeatureProperties,
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: <TrashIcon className={menuItemIconClass} aria-hidden />,
          onSelect: onDelete,
        },
      ]}
      renderTrigger={({ open, menuId, onToggle }) => (
        <button
          type="button"
          onClick={onToggle}
          className={
            iconClass +
            ' inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-panel align-middle transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/40 focus-visible:outline-none'
          }
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          aria-label={`Actions for ${asset.title}`}
        >
          <MoreVerticalIcon />
        </button>
      )}
    />
  )
}
