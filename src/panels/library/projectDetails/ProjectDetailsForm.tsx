import type { ProjectTeamMember } from '@/data/sampleProjectProfile'
import {
  featureMetadataInputClassName,
  featureMetadataSecondaryButtonClass,
} from '@/panels/library/featureMetadata/styles'
import type { ProjectDetailsDraft } from '@/panels/library/projectDetails/types'

type ProjectDetailsFormProps = {
  draft: ProjectDetailsDraft
  onDraftChange: (draft: ProjectDetailsDraft) => void
  /** When true, hides primary address fields (used during new-project onboarding). */
  omitPrimaryLocation?: boolean
  /** When true, hides the section heading (nested inside collapsible). */
  hideSectionHeading?: boolean
}

function updateDraft(
  draft: ProjectDetailsDraft,
  patch: Partial<ProjectDetailsDraft>,
): ProjectDetailsDraft {
  return { ...draft, ...patch }
}

function updateLocation(
  draft: ProjectDetailsDraft,
  patch: Partial<ProjectDetailsDraft['location']>,
): ProjectDetailsDraft {
  return { ...draft, location: { ...draft.location, ...patch } }
}

function updateIdentifiers(
  draft: ProjectDetailsDraft,
  patch: Partial<ProjectDetailsDraft['identifiers']>,
): ProjectDetailsDraft {
  return { ...draft, identifiers: { ...draft.identifiers, ...patch } }
}

function updateSchedule(
  draft: ProjectDetailsDraft,
  patch: Partial<ProjectDetailsDraft['schedule']>,
): ProjectDetailsDraft {
  return { ...draft, schedule: { ...draft.schedule, ...patch } }
}

function updateOperations(
  draft: ProjectDetailsDraft,
  patch: Partial<ProjectDetailsDraft['operations']>,
): ProjectDetailsDraft {
  return { ...draft, operations: { ...draft.operations, ...patch } }
}

function updateTeamMember(
  draft: ProjectDetailsDraft,
  index: number,
  patch: Partial<ProjectTeamMember>,
): ProjectDetailsDraft {
  const team = draft.team.map((m, i) => (i === index ? { ...m, ...patch } : m))
  return { ...draft, team }
}

const labelClass = 'text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide'
const textareaClass =
  featureMetadataInputClassName + ' min-h-[4.5rem] resize-y py-2 leading-normal'

export function ProjectDetailsOverviewForm({
  draft,
  onDraftChange,
  omitPrimaryLocation = false,
  hideSectionHeading = false,
}: ProjectDetailsFormProps) {
  const set = (next: ProjectDetailsDraft) => onDraftChange(next)

  return (
    <section aria-labelledby={hideSectionHeading ? undefined : 'pd-overview-edit'}>
        {hideSectionHeading ? null : (
          <h2 id="pd-overview-edit" className="font-title text-title font-bold text-fg">
            Project overview
          </h2>
        )}
        <div className={'grid gap-4 font-sans text-standard sm:grid-cols-2 ' + (hideSectionHeading ? '' : 'mt-4')}>
          {omitPrimaryLocation ? null : (
            <>
              <label className="block min-w-0 sm:col-span-2">
                <span className={labelClass}>Address line 1</span>
                <input
                  type="text"
                  className={featureMetadataInputClassName}
                  value={draft.location.addressLines[0] ?? ''}
                  onChange={(e) => {
                    const lines = [...draft.location.addressLines]
                    lines[0] = e.target.value
                    set(updateLocation(draft, { addressLines: lines }))
                  }}
                />
              </label>
            </>
          )}
          <label className="block min-w-0 sm:col-span-2">
            <span className={labelClass}>Address line 2</span>
            <input
              type="text"
              className={featureMetadataInputClassName}
              value={draft.location.addressLines[1] ?? ''}
              onChange={(e) => {
                const lines = [...draft.location.addressLines]
                if (lines.length < 2) lines.push('')
                lines[1] = e.target.value
                set(updateLocation(draft, { addressLines: lines }))
              }}
            />
          </label>
          {omitPrimaryLocation ? null : (
            <label className="block min-w-0">
              <span className={labelClass}>City, state, zip</span>
              <input
                type="text"
                className={featureMetadataInputClassName}
                value={draft.location.cityStateZip}
                onChange={(e) => set(updateLocation(draft, { cityStateZip: e.target.value }))}
              />
            </label>
          )}
          <label className="block min-w-0">
            <span className={labelClass}>Project number</span>
            <input
              type="text"
              className={featureMetadataInputClassName}
              value={draft.identifiers.projectNumber}
              onChange={(e) => set(updateIdentifiers(draft, { projectNumber: e.target.value }))}
            />
          </label>
          <label className="block min-w-0">
            <span className={labelClass}>Building size (SF)</span>
            <input
              type="text"
              inputMode="numeric"
              className={featureMetadataInputClassName}
              value={draft.identifiers.buildingSizeSf}
              onChange={(e) => set(updateIdentifiers(draft, { buildingSizeSf: e.target.value }))}
            />
          </label>
          <label className="block min-w-0">
            <span className={labelClass}>Number of floors</span>
            <input
              type="text"
              inputMode="numeric"
              className={featureMetadataInputClassName}
              value={draft.identifiers.floorCount}
              onChange={(e) => set(updateIdentifiers(draft, { floorCount: e.target.value }))}
            />
          </label>
          <label className="block min-w-0">
            <span className={labelClass}>Owner</span>
            <input
              type="text"
              className={featureMetadataInputClassName}
              value={draft.identifiers.clientName}
              onChange={(e) => set(updateIdentifiers(draft, { clientName: e.target.value }))}
            />
          </label>
          <label className="block min-w-0">
            <span className={labelClass}>General contractor</span>
            <input
              type="text"
              className={featureMetadataInputClassName}
              value={draft.identifiers.gcName}
              onChange={(e) => set(updateIdentifiers(draft, { gcName: e.target.value }))}
            />
          </label>
          <label className="block min-w-0 sm:col-span-2">
            <span className={labelClass}>Location notes</span>
            <textarea
              className={textareaClass}
              value={draft.location.notes}
              onChange={(e) => set(updateLocation(draft, { notes: e.target.value }))}
              rows={2}
            />
          </label>
          <label className="block min-w-0 sm:col-span-2">
            <span className={labelClass}>Summary</span>
            <textarea
              className={textareaClass}
              value={draft.summary}
              onChange={(e) => set(updateDraft(draft, { summary: e.target.value }))}
              rows={4}
            />
          </label>
        </div>
    </section>
  )
}

export function ProjectDetailsTeamForm({ draft, onDraftChange }: ProjectDetailsFormProps) {
  const set = (next: ProjectDetailsDraft) => onDraftChange(next)

  return (
      <section aria-labelledby="pd-team-edit">
        <div className="flex items-center justify-between gap-3">
          <h2 id="pd-team-edit" className="font-title text-title font-bold text-fg">
            Project team
          </h2>
          <button
            type="button"
            className={featureMetadataSecondaryButtonClass}
            onClick={() =>
              set({
                ...draft,
                team: [...draft.team, { role: '', name: '', phone: '', email: '' }],
              })
            }
          >
            Add member
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {draft.team.map((member, index) => (
            <div
              key={index}
              className="rounded-panel border border-stroke bg-area-highlight/20 p-3"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-badge font-bold uppercase tracking-wide text-fg-muted">
                  Member {index + 1}
                </span>
                <button
                  type="button"
                  className={featureMetadataSecondaryButtonClass}
                  onClick={() =>
                    set({ ...draft, team: draft.team.filter((_, i) => i !== index) })
                  }
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block min-w-0">
                  <span className={labelClass}>Role</span>
                  <input
                    type="text"
                    className={featureMetadataInputClassName}
                    value={member.role}
                    onChange={(e) => set(updateTeamMember(draft, index, { role: e.target.value }))}
                  />
                </label>
                <label className="block min-w-0">
                  <span className={labelClass}>Name</span>
                  <input
                    type="text"
                    className={featureMetadataInputClassName}
                    value={member.name}
                    onChange={(e) => set(updateTeamMember(draft, index, { name: e.target.value }))}
                  />
                </label>
                <label className="block min-w-0">
                  <span className={labelClass}>Phone</span>
                  <input
                    type="text"
                    className={featureMetadataInputClassName}
                    value={member.phone ?? ''}
                    onChange={(e) => set(updateTeamMember(draft, index, { phone: e.target.value }))}
                  />
                </label>
                <label className="block min-w-0">
                  <span className={labelClass}>Email</span>
                  <input
                    type="email"
                    className={featureMetadataInputClassName}
                    value={member.email ?? ''}
                    onChange={(e) => set(updateTeamMember(draft, index, { email: e.target.value }))}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>
  )
}

export function ProjectDetailsScheduleForm({ draft, onDraftChange }: ProjectDetailsFormProps) {
  const set = (next: ProjectDetailsDraft) => onDraftChange(next)

  return (
      <section aria-labelledby="pd-schedule-edit">
        <h2 id="pd-schedule-edit" className="font-title text-title font-bold text-fg">
          Schedule
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-1">
          <label className="block min-w-0">
            <span className={labelClass}>Target substantial completion</span>
            <input
              type="text"
              className={featureMetadataInputClassName}
              value={draft.schedule.targetSubstantialCompletion}
              onChange={(e) =>
                set(updateSchedule(draft, { targetSubstantialCompletion: e.target.value }))
              }
            />
          </label>
          <label className="block min-w-0">
            <span className={labelClass}>Last documented site walk</span>
            <input
              type="text"
              className={featureMetadataInputClassName}
              value={draft.schedule.lastSiteWalk}
              onChange={(e) => set(updateSchedule(draft, { lastSiteWalk: e.target.value }))}
            />
          </label>
          <label className="block min-w-0">
            <span className={labelClass}>Next milestone</span>
            <input
              type="text"
              className={featureMetadataInputClassName}
              value={draft.schedule.nextMilestone}
              onChange={(e) => set(updateSchedule(draft, { nextMilestone: e.target.value }))}
            />
          </label>
        </div>
      </section>
  )
}

export function ProjectDetailsOpsForm({ draft, onDraftChange }: ProjectDetailsFormProps) {
  const set = (next: ProjectDetailsDraft) => onDraftChange(next)

  return (
      <section aria-labelledby="pd-ops-edit">
        <h2 id="pd-ops-edit" className="font-title text-title font-bold text-fg">
          Operations & Compliance
        </h2>
        <div className="mt-4 grid gap-4">
          <label className="block min-w-0">
            <span className={labelClass}>Site hours</span>
            <textarea
              className={textareaClass}
              value={draft.operations.siteHours}
              onChange={(e) => set(updateOperations(draft, { siteHours: e.target.value }))}
              rows={2}
            />
          </label>
          <label className="block min-w-0">
            <span className={labelClass}>After hours & emergencies</span>
            <textarea
              className={textareaClass}
              value={draft.operations.afterHours}
              onChange={(e) => set(updateOperations(draft, { afterHours: e.target.value }))}
              rows={2}
            />
          </label>
          <label className="block min-w-0">
            <span className={labelClass}>Permits</span>
            <textarea
              className={textareaClass}
              value={draft.permits}
              onChange={(e) => set(updateDraft(draft, { permits: e.target.value }))}
              rows={2}
            />
          </label>
          <label className="block min-w-0">
            <span className={labelClass}>Insurance</span>
            <textarea
              className={textareaClass}
              value={draft.insurance}
              onChange={(e) => set(updateDraft(draft, { insurance: e.target.value }))}
              rows={2}
            />
          </label>
        </div>
      </section>
  )
}
