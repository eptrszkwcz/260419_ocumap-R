import { useCallback, useState } from 'react'

import { useAuth } from '@/context/AuthContext'
import type { MarkerLogEntry } from '@/data/sampleAssets'
import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
  featureMetadataInputClassName,
} from '@/panels/library/featureMetadata/styles'
import {
  canEditMarkerLogEntry,
  formatMarkerLogTimestamp,
  renderMarkerLogBody,
} from '@/panels/map/markerLogUtils'

const entryCardClassName =
  'rounded-panel border border-stroke bg-panel px-3 py-2.5 font-sans text-standard'

type MarkerLogEntryCardProps = {
  entry: MarkerLogEntry
  onUpdate: (entryId: string, body: string) => void
  onDelete: (entryId: string) => void
}

export function MarkerLogEntryCard({ entry, onUpdate, onDelete }: MarkerLogEntryCardProps) {
  const { user } = useAuth()
  const canEdit = canEditMarkerLogEntry(entry, user?.displayName)
  const [isEditing, setIsEditing] = useState(false)
  const [editBody, setEditBody] = useState(entry.body)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSaveEdit = useCallback(() => {
    const trimmed = editBody.trim()
    if (trimmed === '') return
    onUpdate(entry.id, trimmed)
    setIsEditing(false)
  }, [editBody, entry.id, onUpdate])

  const handleCancelEdit = useCallback(() => {
    setEditBody(entry.body)
    setIsEditing(false)
  }, [entry.body])

  const handleConfirmDelete = useCallback(() => {
    onDelete(entry.id)
    setShowDeleteConfirm(false)
  }, [entry.id, onDelete])

  const isSystem = entry.kind === 'system'

  return (
    <article className={entryCardClassName + ' group'} aria-label="Log entry">
      <div className="mb-1.5 flex min-w-0 items-start justify-between gap-2">
        <p className="text-fg-muted min-w-0 text-badge leading-snug">
          <span className="font-bold">{entry.authorDisplayName}</span>
          {' · '}
          <time dateTime={entry.createdAt}>{formatMarkerLogTimestamp(entry.createdAt)}</time>
          {entry.updatedAt != null ? <span> (edited)</span> : null}
        </p>
        {canEdit && !isEditing && !showDeleteConfirm ? (
          <div className="flex shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <button
              type="button"
              onClick={() => {
                setEditBody(entry.body)
                setIsEditing(true)
              }}
              className="text-fg-muted hover:text-fg-highlight cursor-pointer text-badge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-highlight/35"
            >
              Edit
            </button>
            <span className="text-fg-muted text-badge" aria-hidden>
              ·
            </span>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-fg-muted hover:text-fg-highlight cursor-pointer text-badge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-highlight/35"
            >
              Delete
            </button>
          </div>
        ) : null}
      </div>

      {showDeleteConfirm ? (
        <div className="flex flex-col gap-2">
          <p className="text-fg-muted text-standard">Delete this note?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className={featureMetadataFooterCancelButtonClass + ' h-7 px-3 text-badge'}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className={
                PRIMARY_BUTTON_CLASS +
                ' h-7 rounded-panel px-3 text-badge focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'
              }
            >
              Delete
            </button>
          </div>
        </div>
      ) : isEditing ? (
        <div className="flex flex-col gap-2">
          <textarea
            className={featureMetadataInputClassName + ' min-h-20 resize-y py-2 leading-normal'}
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            aria-label="Edit log entry"
          />
          <div className={featureMetadataFooterActionsClassName}>
            <button
              type="button"
              onClick={handleCancelEdit}
              className={featureMetadataFooterCancelButtonClass}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={editBody.trim() === ''}
              className={
                PRIMARY_BUTTON_CLASS +
                ' h-8 rounded-panel px-4 text-standard focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45'
              }
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p
          className={
            (isSystem ? 'text-fg-muted ' : 'text-fg ') + 'whitespace-pre-wrap break-words leading-normal'
          }
        >
          {renderMarkerLogBody(entry.body)}
        </p>
      )}
    </article>
  )
}
