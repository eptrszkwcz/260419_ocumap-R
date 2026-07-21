import { useState } from 'react'

import type { ProjectRecord } from '@/data/sampleProjects'
import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
  featureMetadataInputClassName,
} from '@/panels/library/featureMetadata/styles'
import { PublishedModalShell } from '@/panels/map/PublishedModalShell'

type PublishedReportIssueModalProps = {
  project: ProjectRecord
  onClose: () => void
}

const textareaClass =
  featureMetadataInputClassName + ' min-h-[8rem] resize-y py-2 leading-normal'

export function PublishedReportIssueModal({ project, onClose }: PublishedReportIssueModalProps) {
  const [issueText, setIssueText] = useState('')

  const handleSubmit = () => {
    // Intentionally no-op for prototype
  }

  return (
    <PublishedModalShell
      ariaLabel={`Report an issue for ${project.name}`}
      maxWidthClass="max-w-[640px]"
      onClose={onClose}
      header={
        <div className="shrink-0 border-b border-stroke bg-white px-6 py-4">
          <h1 className="font-title text-title font-bold text-fg">Report an Issue</h1>
          <p className="mt-2 font-sans text-standard text-fg-muted">
            Describe the issue you encountered while viewing this project.
          </p>
        </div>
      }
      footer={
        <footer className="flex shrink-0 border-t border-stroke bg-white px-6 py-4">
          <div className={featureMetadataFooterActionsClassName}>
            <button
              type="button"
              onClick={onClose}
              className={featureMetadataFooterCancelButtonClass + ' mr-auto'}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className={
                PRIMARY_BUTTON_CLASS +
                ' h-9 shrink-0 rounded-panel px-6 font-sans text-standard leading-none'
              }
            >
              Submit
            </button>
          </div>
        </footer>
      }
    >
      <div className="p-6">
        <label htmlFor="published-issue-description" className="sr-only">
          Issue description
        </label>
        <textarea
          id="published-issue-description"
          className={textareaClass}
          value={issueText}
          onChange={(e) => setIssueText(e.target.value)}
          placeholder="Describe the issue..."
          aria-label="Issue description"
        />
      </div>
    </PublishedModalShell>
  )
}
