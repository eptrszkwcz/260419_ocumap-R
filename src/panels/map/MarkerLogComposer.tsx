import { useCallback, useState, type KeyboardEvent } from 'react'

import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataInputClassName,
} from '@/panels/library/featureMetadata/styles'

type MarkerLogComposerProps = {
  onPost: (body: string) => void
  disabled?: boolean
}

export function MarkerLogComposer({ onPost, disabled = false }: MarkerLogComposerProps) {
  const [body, setBody] = useState('')

  const handlePost = useCallback(() => {
    const trimmed = body.trim()
    if (trimmed === '' || disabled) return
    onPost(trimmed)
    setBody('')
  }, [body, disabled, onPost])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        handlePost()
      }
    },
    [handlePost],
  )

  return (
    <div className="border-t border-stroke bg-panel px-panel-padding py-3">
      <label className="block min-w-0">
        <span className="sr-only">Add log entry</span>
        <textarea
          className={featureMetadataInputClassName + ' min-h-20 resize-y py-2 leading-normal'}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a note…"
          disabled={disabled}
          aria-label="Add log entry"
        />
      </label>
      <p className="text-fg-muted mt-1.5 text-badge">
        Use @name to call someone&apos;s attention. Press Enter to post, Shift+Enter for a new line.
      </p>
      <div className={featureMetadataFooterActionsClassName + ' mt-3'}>
        <button
          type="button"
          onClick={handlePost}
          disabled={disabled || body.trim() === ''}
          className={
            PRIMARY_BUTTON_CLASS +
            ' h-8 rounded-panel px-4 text-standard focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45'
          }
        >
          Post
        </button>
      </div>
    </div>
  )
}
