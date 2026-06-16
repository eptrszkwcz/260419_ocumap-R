import { InformationCircleIcon, PhotoIcon } from '@heroicons/react/24/outline'
import type { ReactNode } from 'react'

import { ControlHeaderToolbar } from '@/components/ControlHeaderToolbar'

import { getFeatureTypeLabel, isDrawnFeature, type SpatialAsset } from '@/data/sampleAssets'

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

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M4 4l8 8M12 4L4 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

const mediaBadgeClass =
  'text-fg-highlight inline-flex h-badge min-h-badge max-h-badge min-w-0 shrink-0 items-center justify-center rounded-panel bg-fg-highlight/12 px-2 text-badge font-bold leading-none'

type ViewerPanelMode = 'media' | 'metadata' | 'draw-metadata'

type FeatureLibraryToolbarProps = {
  onAddFeatureClick?: () => void
  /** When set (browse tab + not in add flow), header shows asset title and badges instead of search tools. */
  viewerAsset?: SpatialAsset | null
  /** Browse vs metadata when `viewerAsset` is open. Ignored when `viewerAsset` is null. */
  viewerPanel?: ViewerPanelMode
  /** True when viewing an in-progress drawn feature draft. */
  isDrawDraft?: boolean
  onOpenMetadata?: () => void
  onOpenMedia?: () => void
  onCloseViewer?: () => void
  /** View / Columns / Filters dropdown cluster for browse mode. */
  libraryControlActions?: ReactNode
}

const iconBtnClass =
  'text-fg-muted hover:text-fg-highlight flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-panel transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

export function FeatureLibraryToolbar({
  onAddFeatureClick,
  viewerAsset,
  viewerPanel = 'media',
  isDrawDraft = false,
  onOpenMetadata,
  onOpenMedia,
  onCloseViewer,
  libraryControlActions,
}: FeatureLibraryToolbarProps) {
  if (viewerAsset != null) {
    const isGeometry = isDrawDraft || isDrawnFeature(viewerAsset)
    const typeLabel = isDrawDraft ? 'New feature' : getFeatureTypeLabel(viewerAsset)
    const toolbarLabel = isDrawDraft ? 'Draw feature' : isGeometry ? 'Feature details' : 'Feature media'

    return (
      <div
        id="control-header-feature-lib"
        className="flex h-16 w-full shrink-0 items-center gap-3 border-b border-stroke px-panel-padding"
        role="toolbar"
        aria-label={toolbarLabel}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <h2 className="min-w-0 flex-1 truncate font-title text-title font-bold text-fg">{viewerAsset.title}</h2>
          {!isGeometry && viewerPanel === 'media' ? (
            <button
              type="button"
              className={iconBtnClass}
              aria-label="Feature information and metadata"
              onClick={() => onOpenMetadata?.()}
            >
              <InformationCircleIcon className="size-5" aria-hidden />
            </button>
          ) : !isGeometry && viewerPanel === 'metadata' ? (
            <button
              type="button"
              className={iconBtnClass}
              aria-label="Back to media"
              onClick={() => onOpenMedia?.()}
            >
              <PhotoIcon className="size-5" aria-hidden />
            </button>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={mediaBadgeClass}>{typeLabel}</span>
          {!isDrawDraft ? <span className={mediaBadgeClass}>{viewerAsset.dateUploaded}</span> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className={iconBtnClass}
            aria-label="More options"
          >
            <MoreVerticalIcon />
          </button>
          <button
            type="button"
            onClick={() => onCloseViewer?.()}
            className={iconBtnClass}
            aria-label="Close viewer"
          >
            <CloseIcon />
          </button>
        </div>
      </div>
    )
  }

  return (
    <ControlHeaderToolbar
      id="control-header-feature-lib"
      toolbarAriaLabel="Feature library actions"
      onAddClick={onAddFeatureClick}
      secondaryActions={libraryControlActions}
    />
  )
}
