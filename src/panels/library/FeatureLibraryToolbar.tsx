import { InformationCircleIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

import { ControlHeaderToolbar } from '@/components/ControlHeaderToolbar'
import { DelayedTooltip } from '@/components/DelayedTooltip'
import { MarkerColorPicker } from '@/components/MarkerColorPicker'
import { PencilIcon } from '@/components/overlayControlIcons'
import { getFeatureTypeLabel, isDrawnFeature, type SpatialAsset } from '@/data/sampleAssets'
import {
  featureMetadataInputClassName,
  featureMetadataSecondaryButtonClass,
} from '@/panels/library/featureMetadata/styles'
import { normalizeMarkerColor } from '@/panels/map/markerColors'

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

const iconBtnClass =
  'text-fg-muted hover:text-fg-highlight flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-panel transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

const pencilBtnClass =
  'text-fg-muted hover:text-fg-highlight flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-panel transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

type ViewerPanelMode = 'media' | 'metadata' | 'draw-metadata'

type FeatureLibraryToolbarProps = {
  onAddFeatureClick?: () => void
  /** When set (browse tab + not in add flow), header shows asset title and badges instead of search tools. */
  viewerAsset?: SpatialAsset | null
  /** Browse vs metadata when `viewerAsset` is open. Ignored when `viewerAsset` is null. */
  viewerPanel?: ViewerPanelMode
  /** True when viewing an in-progress drawn feature draft. */
  isDrawDraft?: boolean
  /** Marker color for geometry features (drawn / draft). */
  markerColor?: string
  onRenameGeometryFeature?: (title: string) => void
  onGeometryFeatureColorChange?: (color: string) => void
  /** Saved geometry features: Edit Location control in the header. */
  showEditLocation?: boolean
  onEditLocation?: () => void
  onOpenMetadata?: () => void
  onOpenMedia?: () => void
  onCloseViewer?: () => void
  /** View / Columns / Filters dropdown cluster for browse mode. */
  libraryControlActions?: ReactNode
}

export function FeatureLibraryToolbar({
  onAddFeatureClick,
  viewerAsset,
  viewerPanel = 'media',
  isDrawDraft = false,
  markerColor,
  onRenameGeometryFeature,
  onGeometryFeatureColorChange,
  showEditLocation = false,
  onEditLocation,
  onOpenMetadata,
  onOpenMedia,
  onCloseViewer,
  libraryControlActions,
}: FeatureLibraryToolbarProps) {
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    setIsEditingName(false)
    setEditName('')
  }, [viewerAsset?.id])

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus()
      nameInputRef.current?.select()
    }
  }, [isEditingName])

  const startEditingName = useCallback(() => {
    setEditName(viewerAsset?.title ?? '')
    setIsEditingName(true)
  }, [viewerAsset?.title])

  const commitNameEdit = useCallback(() => {
    const trimmed = editName.trim()
    if (trimmed === '') {
      setEditName(viewerAsset?.title ?? '')
      setIsEditingName(false)
      return
    }
    onRenameGeometryFeature?.(trimmed)
    setIsEditingName(false)
  }, [editName, onRenameGeometryFeature, viewerAsset?.title])

  const cancelNameEdit = useCallback(() => {
    setEditName(viewerAsset?.title ?? '')
    setIsEditingName(false)
  }, [viewerAsset?.title])

  const handleNameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        commitNameEdit()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        cancelNameEdit()
      }
    },
    [cancelNameEdit, commitNameEdit],
  )

  const handleColorChange = useCallback(
    (raw: string) => {
      onGeometryFeatureColorChange?.(normalizeMarkerColor(raw))
    },
    [onGeometryFeatureColorChange],
  )

  if (viewerAsset != null) {
    const isGeometry = isDrawDraft || isDrawnFeature(viewerAsset)
    const typeLabel = isDrawDraft ? 'New feature' : getFeatureTypeLabel(viewerAsset)
    const toolbarLabel = isDrawDraft ? 'Draw feature' : isGeometry ? 'Feature details' : 'Feature media'
    const title = viewerAsset.title.trim() || (isDrawDraft ? 'Untitled feature' : viewerAsset.title)
    const swatchColor = normalizeMarkerColor(markerColor ?? viewerAsset.markerColor)

    return (
      <div
        id="control-header-feature-lib"
        className="flex h-16 w-full shrink-0 items-center gap-3 border-b border-stroke px-panel-padding"
        role="toolbar"
        aria-label={toolbarLabel}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1">
          {isGeometry ? (
            isEditingName ? (
              <div className="relative min-w-0 flex-1">
                <input
                  ref={nameInputRef}
                  type="text"
                  className={featureMetadataInputClassName + ' min-w-0 w-full pr-[4.5rem]'}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={cancelNameEdit}
                  onKeyDown={handleNameKeyDown}
                  aria-label="Feature name"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={commitNameEdit}
                  disabled={editName.trim() === ''}
                  className={
                    'bg-fg-highlight text-white absolute top-1/2 right-1 h-6 -translate-y-1/2 cursor-pointer rounded-panel px-2 font-sans text-badge leading-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-fg-highlight/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45'
                  }
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <h2 className="min-w-0 truncate font-title text-title font-bold text-fg">{title}</h2>
                <button
                  type="button"
                  onClick={startEditingName}
                  className={pencilBtnClass}
                  aria-label="Edit feature name"
                >
                  <PencilIcon />
                </button>
              </>
            )
          ) : (
            <>
              <h2 className="min-w-0 flex-1 truncate font-title text-title font-bold text-fg">
                {viewerAsset.title}
              </h2>
              {viewerPanel === 'media' ? (
                <DelayedTooltip label="Feature information">
                  <button
                    type="button"
                    className={iconBtnClass}
                    aria-label="Feature information and metadata"
                    onClick={() => onOpenMetadata?.()}
                  >
                    <InformationCircleIcon className="size-5" aria-hidden />
                  </button>
                </DelayedTooltip>
              ) : viewerPanel === 'metadata' ? (
                <button
                  type="button"
                  className={iconBtnClass}
                  aria-label="Back to media"
                  onClick={() => onOpenMedia?.()}
                >
                  <PhotoIcon className="size-5" aria-hidden />
                </button>
              ) : null}
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {showEditLocation ? (
            <button
              type="button"
              onClick={() => onEditLocation?.()}
              className={featureMetadataSecondaryButtonClass + ' h-8'}
            >
              Edit Location
            </button>
          ) : null}
          {isGeometry ? (
            <MarkerColorPicker
              value={swatchColor}
              onChange={handleColorChange}
              ariaLabel="Pick feature color"
            />
          ) : null}
          <span className={mediaBadgeClass}>{typeLabel}</span>
          {!isDrawDraft ? <span className={mediaBadgeClass}>{viewerAsset.dateUploaded}</span> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" className={iconBtnClass} aria-label="More options">
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
