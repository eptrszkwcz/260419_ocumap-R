import { ChevronDownIcon } from '@heroicons/react/16/solid'
import { createPortal } from 'react-dom'
import { useEffect, useMemo, useState } from 'react'

import { Checkbox } from '@/components/Checkbox'
import { DropdownMenu } from '@/components/DropdownMenu'
import { RadioOption } from '@/components/RadioOption'
import type { ProjectRecord } from '@/data/sampleProjects'
import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'
import { formatDisplayDateFromIsoDate } from '@/lib/formatDisplayDateFromIsoDate'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
  featureMetadataInputClassName,
} from '@/panels/library/featureMetadata/styles'
import {
  allPublishFileIds,
  buildPublishFileGroups,
  type PublishFileGroup,
  type PublishFileGroupId,
} from '@/pages/projects/publishFileGroups'

type AccessMode = 'link' | 'emails'
type PasswordMode = 'no' | 'yes'
type ExpirationMode = 'none' | 'expires'
type YesNoMode = 'no' | 'yes'

type PublishProjectModalProps = {
  project: ProjectRecord
  onClose: () => void
  onConfirm: () => void
}

const textareaClass =
  featureMetadataInputClassName + ' min-h-[5.5rem] resize-y py-2 leading-normal'

const publishModalOptionsRowClassName = 'flex flex-wrap items-center'

function formatExpirationDateFromDays(daysInput: string): string {
  const days = Number.parseInt(daysInput, 10)
  if (!Number.isFinite(days) || days < 1) return ''
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + days)
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return formatDisplayDateFromIsoDate(iso)
}

const publishDropdownTriggerClassName =
  'text-fg hover:text-fg-highlight flex h-8 w-full cursor-pointer items-center justify-between gap-2 rounded-panel border border-stroke bg-panel px-2.5 font-sans text-standard font-normal leading-none focus-visible:border-fg-highlight focus-visible:ring-1 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-sans text-[14px] font-bold leading-[1.25rem] text-fg">{children}</h2>
}

function ModalSectionCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-panel border border-stroke bg-panel p-4 shadow-sm">{children}</section>
  )
}

function YesNoQuestionSection({
  heading,
  name,
  value,
  onValueChange,
  children,
}: {
  heading: string
  name: string
  value: YesNoMode
  onValueChange: (value: YesNoMode) => void
  children?: React.ReactNode
}) {
  return (
    <ModalSectionCard>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <SectionHeading>{heading}</SectionHeading>
          <div className="flex shrink-0 items-center gap-10">
            <RadioOption
              id={`${name}-yes`}
              name={name}
              label="Yes"
              checked={value === 'yes'}
              onChange={() => onValueChange('yes')}
              compact
            />
            <RadioOption
              id={`${name}-no`}
              name={name}
              label="No"
              checked={value === 'no'}
              onChange={() => onValueChange('no')}
              compact
            />
          </div>
        </div>
        {children}
      </div>
    </ModalSectionCard>
  )
}

function PublishFileGroupDropdown({
  groups,
  activeGroupId,
  onActiveGroupChange,
}: {
  groups: PublishFileGroup[]
  activeGroupId: PublishFileGroupId
  onActiveGroupChange: (id: PublishFileGroupId) => void
}) {
  const activeLabel = groups.find((g) => g.id === activeGroupId)?.label ?? 'Select file type'

  return (
    <div className="w-full [&>div]:w-full">
      <DropdownMenu
        menuAriaLabel="File type group"
        align="left"
        panelWidth="100%"
        items={groups.map((group) => ({
          id: group.id,
          label: group.label,
          selected: group.id === activeGroupId,
          onSelect: () => onActiveGroupChange(group.id),
        }))}
        renderTrigger={({ open, menuId, onToggle }) => (
          <button
            type="button"
            onClick={onToggle}
            className={publishDropdownTriggerClassName}
            aria-expanded={open}
            aria-haspopup="menu"
            aria-controls={menuId}
            aria-label={`File type: ${activeLabel}`}
          >
            <span className="min-w-0 truncate text-left">{activeLabel}</span>
            <ChevronDownIcon className="size-3.5 shrink-0 text-fg-muted" aria-hidden />
          </button>
        )}
      />
    </div>
  )
}

function FileSelectionSection({
  groups,
  activeGroupId,
  onActiveGroupChange,
  selectedIds,
  onSelectedIdsChange,
}: {
  groups: PublishFileGroup[]
  activeGroupId: PublishFileGroupId
  onActiveGroupChange: (id: PublishFileGroupId) => void
  selectedIds: Set<string>
  onSelectedIdsChange: (ids: Set<string>) => void
}) {
  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? groups[0]
  if (activeGroup == null) return null

  const selectableItems = activeGroup.items.filter((item) => !item.locked)
  const allSelectableSelected =
    selectableItems.length > 0 && selectableItems.every((item) => selectedIds.has(item.id))
  const someSelectableSelected = selectableItems.some((item) => selectedIds.has(item.id))

  const toggleDeselectAll = (checked: boolean) => {
    const next = new Set(selectedIds)
    for (const item of selectableItems) {
      if (checked) {
        next.add(item.id)
      } else {
        next.delete(item.id)
      }
    }
    for (const item of activeGroup.items) {
      if (item.locked) next.add(item.id)
    }
    onSelectedIdsChange(next)
  }

  const toggleItem = (id: string, checked: boolean) => {
    const next = new Set(selectedIds)
    if (checked) {
      next.add(id)
    } else {
      next.delete(id)
    }
    onSelectedIdsChange(next)
  }

  return (
    <ModalSectionCard>
      <div className="flex flex-col gap-3">
        <SectionHeading>What files are included?</SectionHeading>
        <PublishFileGroupDropdown
          groups={groups}
          activeGroupId={activeGroupId}
          onActiveGroupChange={onActiveGroupChange}
        />
        <div className="rounded-panel border border-stroke bg-[#FAFAFD] p-3">
          <Checkbox
            id="publish-all"
            label="All"
            checked={allSelectableSelected}
            onChange={toggleDeselectAll}
          />
          <div
            className="mx-[16px] border-t border-stroke/40"
            role="separator"
            aria-hidden
          />
          <div className="mt-1 grid gap-0 sm:grid-cols-2">
            {activeGroup.items.map((item) => (
              <Checkbox
                key={item.id}
                id={`publish-file-${item.id}`}
                label={item.label}
                checked={item.locked || selectedIds.has(item.id)}
                disabled={item.locked}
                dense
                onChange={(checked) => toggleItem(item.id, checked)}
              />
            ))}
          </div>
          {!allSelectableSelected && someSelectableSelected ? (
            <p className="text-fg-muted mt-2 px-4 font-sans text-badge">
              Some files in this group are not selected.
            </p>
          ) : null}
        </div>
      </div>
    </ModalSectionCard>
  )
}

export function PublishProjectModal({ project, onClose, onConfirm }: PublishProjectModalProps) {
  const fileGroups = useMemo(() => buildPublishFileGroups(project), [project])

  const [accessMode, setAccessMode] = useState<AccessMode>('link')
  const [allowedEmails, setAllowedEmails] = useState('')
  const [passwordMode, setPasswordMode] = useState<PasswordMode>('no')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [allowDownload, setAllowDownload] = useState<YesNoMode>('yes')
  const [allowComment, setAllowComment] = useState<YesNoMode>('yes')
  const [expirationMode, setExpirationMode] = useState<ExpirationMode>('none')
  const [expirationDays, setExpirationDays] = useState('30')
  const [activeGroupId, setActiveGroupId] = useState<PublishFileGroupId>(fileGroups[0]?.id ?? 'image')
  const [selectedFileIds, setSelectedFileIds] = useState(() => allPublishFileIds(fileGroups))

  const formattedExpirationDate = useMemo(
    () => formatExpirationDateFromDays(expirationDays),
    [expirationDays],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    setActiveGroupId(fileGroups[0]?.id ?? 'image')
    setSelectedFileIds(allPublishFileIds(fileGroups))
  }, [fileGroups])

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
          aria-label={`Publish ${project.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
            <header className="flex flex-col gap-2">
              <h1 className="font-title text-title font-bold text-fg">Publish your project</h1>
              <p className="font-sans text-standard text-fg-muted">
                Publish a shareable, client-facing version of your project that doesn't require an
                Ocumap account. Settings for the published site can be changed at any time.
              </p>
            </header>

            <ModalSectionCard>
              <div className="flex flex-col gap-3">
                <SectionHeading>Who can access the published document?</SectionHeading>
                <div className="flex flex-col">
                  <RadioOption
                    id="access-link"
                    name="access-mode"
                    label="Anyone with link can access"
                    checked={accessMode === 'link'}
                    onChange={() => setAccessMode('link')}
                  />
                  <RadioOption
                    id="access-emails"
                    name="access-mode"
                    label="Only emails listed here will have access:"
                    checked={accessMode === 'emails'}
                    onChange={() => setAccessMode('emails')}
                  />
                </div>
                {accessMode === 'emails' ? (
                  <textarea
                    className={textareaClass}
                    value={allowedEmails}
                    onChange={(e) => setAllowedEmails(e.target.value)}
                    placeholder="Enter email addresses, one per line"
                    aria-label="Allowed email addresses"
                  />
                ) : null}
              </div>
            </ModalSectionCard>

            <ModalSectionCard>
              <div className="flex flex-col gap-3">
                <SectionHeading>Published Link Expiration.</SectionHeading>
                <div className={publishModalOptionsRowClassName}>
                  <RadioOption
                    id="expiration-none"
                    name="expiration-mode"
                    label="No Expiration Date"
                    checked={expirationMode === 'none'}
                    onChange={() => setExpirationMode('none')}
                  />
                  <div className="flex flex-nowrap items-center">
                    <div className="[&>label]:pr-[8px]">
                      <RadioOption
                        id="expiration-days"
                        name="expiration-mode"
                        label="Expires in"
                        checked={expirationMode === 'expires'}
                        onChange={() => setExpirationMode('expires')}
                      />
                    </div>
                    {expirationMode === 'expires' ? (
                      <>
                        <div className="w-16 shrink-0">
                          <input
                            type="number"
                            min={1}
                            className={featureMetadataInputClassName + ' w-full'}
                            value={expirationDays}
                            onChange={(e) => setExpirationDays(e.target.value)}
                            aria-label="Expiration days"
                          />
                        </div>
                        <div className="shrink-0 py-[10px] pl-[8px] pr-[16px]">
                          <span className="font-sans text-standard text-fg">days</span>
                        </div>
                        {formattedExpirationDate ? (
                          <div className="shrink-0 py-[10px] pl-2">
                            <span className="font-sans text-standard text-fg-muted">
                              {formattedExpirationDate}
                            </span>
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </ModalSectionCard>

            <YesNoQuestionSection
              heading="Password protect this site?"
              name="password-mode"
              value={passwordMode}
              onValueChange={setPasswordMode}
            >
              {passwordMode === 'yes' ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="publish-password"
                      className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide"
                    >
                      Enter password
                    </label>
                    <input
                      id="publish-password"
                      type="password"
                      className={featureMetadataInputClassName}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="publish-password-confirm"
                      className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide"
                    >
                      Re-enter password
                    </label>
                    <input
                      id="publish-password-confirm"
                      type="password"
                      className={featureMetadataInputClassName}
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              ) : null}
            </YesNoQuestionSection>

            <YesNoQuestionSection
              heading="Allow users to download project files?"
              name="allow-download"
              value={allowDownload}
              onValueChange={setAllowDownload}
            />

            <YesNoQuestionSection
              heading="Allow users to comment?"
              name="allow-comment"
              value={allowComment}
              onValueChange={setAllowComment}
            />

            {fileGroups.length > 0 ? (
              <FileSelectionSection
                groups={fileGroups}
                activeGroupId={activeGroupId}
                onActiveGroupChange={setActiveGroupId}
                selectedIds={selectedFileIds}
                onSelectedIdsChange={setSelectedFileIds}
              />
            ) : null}
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
                onClick={onConfirm}
                className={
                  PRIMARY_BUTTON_CLASS +
                  ' h-9 shrink-0 rounded-panel px-6 font-sans text-standard leading-none'
                }
              >
                Publish
              </button>
            </div>
          </footer>
        </div>
      </div>
    </>,
    document.body,
  )
}
