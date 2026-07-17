import { LinkIcon } from '@heroicons/react/24/outline'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

import type { ProjectRecord } from '@/data/sampleProjects'
import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'
import { shareProjectInviteUrl, type ShareAccessLevel } from '@/lib/shareProjectInviteUrl'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
  featureMetadataInputClassName,
  featureMetadataSecondaryButtonClass,
} from '@/panels/library/featureMetadata/styles'

type ShareProjectModalProps = {
  project: ProjectRecord
  onClose: () => void
  onSave: () => void
}

const textareaClass =
  featureMetadataInputClassName + ' min-h-[5.5rem] resize-y py-2 leading-normal'

type ShareTierConfig = {
  id: ShareAccessLevel
  heading: string
  description: string
  showCopyButton?: boolean
}

const shareTiers: ShareTierConfig[] = [
  {
    id: 'readOnly',
    heading: 'READ ACCESS ONLY',
    showCopyButton: true,
    description:
      'Users can view features, comments, and other elements of the interface, but not add any comment or features.',
  },
  {
    id: 'readComment',
    heading: 'READ + COMMENT',
    showCopyButton: true,
    description:
      "Users can view the interface and leave comments on features, floorplans, and maps, but won't have access to other functionality.",
  },
  {
    id: 'fullAccess',
    heading: 'FULL ACCESS',
    description:
      'Users can add features, leave comments, and all other interface functionality.',
  },
]

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-sans text-[14px] font-bold leading-[1.25rem] text-fg">{children}</h2>
}

function ModalSectionCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-panel border border-stroke bg-panel p-4 shadow-sm">{children}</section>
  )
}

function ShareTierSection({
  tier,
  projectId,
  emails,
  onEmailsChange,
}: {
  tier: ShareTierConfig
  projectId: string
  emails: string
  onEmailsChange: (value: string) => void
}) {
  const copyInviteLink = () => {
    void navigator.clipboard.writeText(shareProjectInviteUrl(projectId, tier.id))
  }

  return (
    <ModalSectionCard>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <SectionHeading>{tier.heading}</SectionHeading>
          {tier.showCopyButton ? (
            <button
              type="button"
              onClick={copyInviteLink}
              className={
                featureMetadataSecondaryButtonClass +
                ' inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap'
              }
            >
              <LinkIcon className="size-4 shrink-0" aria-hidden />
              Copy Invite Link
            </button>
          ) : null}
        </div>
        <p className="font-sans text-standard italic text-fg-muted">{tier.description}</p>
        <textarea
          className={textareaClass}
          value={emails}
          onChange={(e) => onEmailsChange(e.target.value)}
          placeholder="Enter email addresses, one per line"
          aria-label={`${tier.heading} collaborator emails`}
        />
      </div>
    </ModalSectionCard>
  )
}

export function ShareProjectModal({ project, onClose, onSave }: ShareProjectModalProps) {
  const [readOnlyEmails, setReadOnlyEmails] = useState('')
  const [readCommentEmails, setReadCommentEmails] = useState('')
  const [fullAccessEmails, setFullAccessEmails] = useState('')

  const emailsByTier: Record<ShareAccessLevel, { value: string; onChange: (value: string) => void }> =
    {
      readOnly: { value: readOnlyEmails, onChange: setReadOnlyEmails },
      readComment: { value: readCommentEmails, onChange: setReadCommentEmails },
      fullAccess: { value: fullAccessEmails, onChange: setFullAccessEmails },
    }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] bg-fg/20" aria-hidden onClick={onClose} />
      <div
        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
        role="presentation"
      >
        <div
          className="flex max-h-[min(90vh,800px)] w-full max-w-[640px] flex-col overflow-hidden rounded-panel border border-stroke bg-page shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-label={`Share ${project.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
            <header className="flex flex-col gap-2">
              <h1 className="font-title text-title font-bold text-fg">
                Share a project with collaborators
              </h1>
              <p className="font-sans text-standard text-fg-muted">
                Invite collaborators to contribute to your project. Your collaborators will see
                &apos;working view&apos; of the platform - to share a read-only published view with
                clients, select &quot;Publish&quot;. 
              </p>
              <p className="font-sans text-standard text-fg-muted">Invite collaborators at any of the three permissions
                levels below. Collaborators will need to create an OcuMap account to view the
                project. You can change these settings at any time.
              </p>
            </header>

            {shareTiers.map((tier) => {
              const { value, onChange } = emailsByTier[tier.id]
              return (
                <ShareTierSection
                  key={tier.id}
                  tier={tier}
                  projectId={project.id}
                  emails={value}
                  onEmailsChange={onChange}
                />
              )
            })}
          </div>

          <footer className="flex shrink-0 border-t border-stroke bg-page px-6 py-4">
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
                onClick={onSave}
                className={
                  PRIMARY_BUTTON_CLASS +
                  ' h-9 shrink-0 rounded-panel px-6 font-sans text-standard leading-none'
                }
              >
                Save
              </button>
            </div>
          </footer>
        </div>
      </div>
    </>,
    document.body,
  )
}
