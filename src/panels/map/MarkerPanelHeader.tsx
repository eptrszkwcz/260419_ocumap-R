import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { PencilIcon } from '@/components/overlayControlIcons'
import { useMediaMarkerFlow } from '@/context/MediaMarkerFlowContext'
import { featureMetadataInputClassName } from '@/panels/library/featureMetadata/styles'
import { normalizeMarkerColor } from '@/panels/map/markerColors'

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

export function MarkerPanelHeader() {
  const {
    panelPhase,
    draftMarker,
    updateDraftMarker,
    saveMarker,
    requestCloseMarkerPanel,
  } = useMediaMarkerFlow()

  const colorInputId = useId()
  const colorInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')

  const title = draftMarker?.name?.trim() || 'New marker'
  const showDate = panelPhase === 'metadata' && draftMarker?.dateAdded != null
  const markerColor = normalizeMarkerColor(draftMarker?.color ?? '#2563eb')

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus()
      nameInputRef.current?.select()
    }
  }, [isEditingName])

  const startEditingName = useCallback(() => {
    setEditName(draftMarker?.name ?? '')
    setIsEditingName(true)
  }, [draftMarker?.name])

  const commitNameEdit = useCallback(() => {
    const trimmed = editName.trim()
    if (trimmed === '') {
      setEditName(draftMarker?.name ?? '')
      setIsEditingName(false)
      return
    }
    updateDraftMarker({ name: trimmed })
    saveMarker()
    setIsEditingName(false)
  }, [draftMarker?.name, editName, saveMarker, updateDraftMarker])

  const cancelNameEdit = useCallback(() => {
    setEditName(draftMarker?.name ?? '')
    setIsEditingName(false)
  }, [draftMarker?.name])

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
      updateDraftMarker({ color: normalizeMarkerColor(raw), isPreliminary: false })
      saveMarker()
    },
    [saveMarker, updateDraftMarker],
  )

  return (
    <div
      className="flex h-16 w-full shrink-0 items-center gap-3 border-b border-stroke px-panel-padding"
      role="toolbar"
      aria-label="Marker details"
    >
      <div className="flex min-w-0 flex-1 items-center gap-1">
        {isEditingName ? (
          <div className="relative min-w-0 flex-1">
            <input
              ref={nameInputRef}
              type="text"
              className={featureMetadataInputClassName + ' min-w-0 w-full pr-[4.5rem]'}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={cancelNameEdit}
              onKeyDown={handleNameKeyDown}
              aria-label="Marker name"
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
              aria-label="Edit marker name"
            >
              <PencilIcon />
            </button>
          </>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <input
          ref={colorInputRef}
          id={colorInputId}
          type="color"
          value={markerColor}
          onChange={(e) => handleColorChange(e.target.value)}
          className="sr-only"
          tabIndex={-1}
          aria-label="Pick marker color"
        />
        <button
          type="button"
          className="border-stroke focus-visible:ring-fg-highlight/35 size-8 shrink-0 cursor-pointer rounded-panel border-2 focus-visible:ring-2 focus-visible:outline-none"
          style={{ backgroundColor: markerColor }}
          aria-label="Pick marker color"
          onClick={() => colorInputRef.current?.click()}
        />
        <span className={mediaBadgeClass}>Marker</span>
        {showDate ? <span className={mediaBadgeClass}>{draftMarker.dateAdded}</span> : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={requestCloseMarkerPanel}
          className={iconBtnClass}
          aria-label="Close marker panel"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  )
}
