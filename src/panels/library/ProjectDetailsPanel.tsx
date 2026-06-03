import { useEffect, useMemo, useState } from 'react'

import { useActiveProject } from '@/context/ActiveProjectContext'
import { type SpatialAsset } from '@/data/sampleAssets'
import type { DemoProjectDetailsProfile } from '@/data/sampleProjectProfile'
import { projectTypeLabel } from '@/data/sampleProjects'
import {
  ProjectDetailsOpsForm,
  ProjectDetailsOverviewForm,
  ProjectDetailsScheduleForm,
  ProjectDetailsTeamForm,
} from '@/panels/library/projectDetails/ProjectDetailsForm'
import { ProjectDetailsStaticField } from '@/panels/library/projectDetails/ProjectDetailsStaticField'
import { ProjectDetailsToolbar } from '@/panels/library/projectDetails/ProjectDetailsToolbar'
import {
  draftToProfile,
  formatBuildingSizeSf,
  formatFloorCount,
  profileToDraft,
  type ProjectDetailsDraft,
} from '@/panels/library/projectDetails/types'

function formatCount(n: number, singular: string, plural: string) {
  return `${n} ${n === 1 ? singular : plural}`
}

function summarizeAssets(assets: SpatialAsset[]) {
  const total = assets.length
  const counts = { image: 0, video: 0, panorama: 0 as number }
  for (const a of assets) {
    counts[a.kind] += 1
  }
  const parts: string[] = []
  if (counts.panorama) parts.push(formatCount(counts.panorama, '360 photo', '360 photos'))
  if (counts.image) parts.push(formatCount(counts.image, 'flat image', 'flat images'))
  if (counts.video) parts.push(formatCount(counts.video, 'video', 'videos'))
  const byType = parts.join(' · ')
  return { total, byType }
}

function ProjectFilesSection({ assets }: { assets: SpatialAsset[] }) {
  const assetSummary = useMemo(() => summarizeAssets(assets), [assets])

  return (
    <section aria-labelledby="pd-files">
      <h2 id="pd-files" className="font-title text-title font-bold text-fg">
        Project Files
      </h2>
      <p className="mt-2 font-sans text-standard text-fg-muted">
        High-level counts mirror what appears in the Feature Library for this workspace.
      </p>
      <div className="mt-4 rounded-panel border border-stroke bg-area-highlight/30 px-4 py-4">
        <p className="font-sans text-standard text-fg">
          <span className="font-bold">{assetSummary.total}</span> linked feature
          {assetSummary.total === 1 ? '' : 's'} total
          {assetSummary.total > 0 ? (
            <>: {assetSummary.byType}</>
          ) : (
            <span className="text-fg-muted"> — add features from the Feature Library tab.</span>
          )}
        </p>
      </div>
    </section>
  )
}

type ProjectDetailsPanelProps = {
  assets: SpatialAsset[]
  profile: DemoProjectDetailsProfile
  onSaveProfile: (profile: DemoProjectDetailsProfile) => void
}

function ProjectDetailsReadView({
  profile,
  assets,
}: {
  profile: DemoProjectDetailsProfile
  assets: SpatialAsset[]
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 pb-8">
      <section aria-labelledby="pd-overview">
        <h2 id="pd-overview" className="font-title text-title font-bold text-fg">
          Project overview
        </h2>
        <dl className="mt-4 grid gap-3 font-sans text-standard sm:grid-cols-2">
          <div className="rounded-panel border border-stroke bg-area-highlight/40 px-3 py-2 sm:col-span-2">
            <dt className="text-badge font-bold uppercase tracking-wide text-fg-muted">Location</dt>
            <dd className="mt-1 text-fg">
              <address className="not-italic leading-relaxed">
                {profile.location.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
                <span className="mt-1 block">{profile.location.cityStateZip}</span>
              </address>
              {profile.location.notes ? (
                <p className="mt-2 text-fg-muted">{profile.location.notes}</p>
              ) : null}
            </dd>
          </div>
          <ProjectDetailsStaticField
            label="Building size"
            value={formatBuildingSizeSf(profile.identifiers.buildingSizeSf)}
          />
          <ProjectDetailsStaticField
            label="Number of floors"
            value={formatFloorCount(profile.identifiers.floorCount)}
          />
          <ProjectDetailsStaticField
            label="Project number"
            value={profile.identifiers.projectNumber}
          />
          <ProjectDetailsStaticField label="Owner" value={profile.identifiers.clientName} />
          <ProjectDetailsStaticField
            label="General contractor"
            value={profile.identifiers.gcName}
            className="sm:col-span-2"
          />
        </dl>
        {profile.summary ? (
          <p className="mt-4 font-sans text-standard leading-relaxed text-fg">{profile.summary}</p>
        ) : null}
      </section>

      <ProjectFilesSection assets={assets} />

      <section aria-labelledby="pd-team">
        <h2 id="pd-team" className="font-title text-title font-bold text-fg">
          Project team
        </h2>
        <p className="mt-2 font-sans text-standard text-fg-muted">
          Key roles for coordination, trades, and day-to-day building operations.
        </p>
        <div className="mt-4 overflow-x-auto rounded-panel border border-stroke">
          <table className="w-full min-w-[32rem] border-collapse text-left font-sans text-standard">
            <thead>
              <tr className="border-b border-stroke bg-area-highlight/50">
                <th scope="col" className="px-3 py-2.5 font-bold text-fg">
                  Role
                </th>
                <th scope="col" className="px-3 py-2.5 font-bold text-fg">
                  Name
                </th>
                <th scope="col" className="px-3 py-2.5 font-bold text-fg">
                  Contact
                </th>
              </tr>
            </thead>
            <tbody>
              {profile.team.map((m) => (
                <tr key={`${m.role}-${m.name}`} className="border-b border-stroke last:border-b-0">
                  <td className="px-3 py-2.5 align-top font-bold text-fg">{m.role}</td>
                  <td className="px-3 py-2.5 align-top text-fg">{m.name}</td>
                  <td className="px-3 py-2.5 align-top text-fg-muted">
                    {m.phone != null ? (
                      <a
                        href={`tel:${m.phone.replace(/\s|\(|\)|-/g, '')}`}
                        className="block text-fg-highlight underline decoration-fg-highlight/30 underline-offset-2 hover:decoration-fg-highlight"
                      >
                        {m.phone}
                      </a>
                    ) : null}
                    {m.email != null ? (
                      <a
                        href={`mailto:${m.email}`}
                        className="mt-1 block break-all text-fg-highlight underline decoration-fg-highlight/30 underline-offset-2 hover:decoration-fg-highlight"
                      >
                        {m.email}
                      </a>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="pd-schedule">
        <h2 id="pd-schedule" className="font-title text-title font-bold text-fg">
          Schedule
        </h2>
        <ul className="mt-3 list-inside list-disc space-y-2 font-sans text-standard text-fg">
          <li>
            <span className="font-bold">Target substantial completion:</span>{' '}
            {profile.schedule.targetSubstantialCompletion}
          </li>
          <li>
            <span className="font-bold">Last documented site walk:</span>{' '}
            {profile.schedule.lastSiteWalk}
          </li>
          <li>
            <span className="font-bold">Next milestone:</span> {profile.schedule.nextMilestone}
          </li>
        </ul>
      </section>

      <section aria-labelledby="pd-ops">
        <h2 id="pd-ops" className="font-title text-title font-bold text-fg">
          Operations & Compliance
        </h2>
        <ul className="mt-3 space-y-3 font-sans text-standard leading-relaxed text-fg">
          <li>
            <span className="font-bold">Site hours:</span> {profile.operations.siteHours}
          </li>
          <li>
            <span className="font-bold">After hours & emergencies:</span>{' '}
            {profile.operations.afterHours}
          </li>
          <li>
            <span className="font-bold">Permits:</span> {profile.permits}
          </li>
          <li>
            <span className="font-bold">Insurance:</span> {profile.insurance}
          </li>
        </ul>
      </section>
    </div>
  )
}

export function ProjectDetailsPanel({ assets, profile, onSaveProfile }: ProjectDetailsPanelProps) {
  const { project } = useActiveProject()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<ProjectDetailsDraft>(() => profileToDraft(profile))

  useEffect(() => {
    setDraft(profileToDraft(profile))
    setIsEditing(false)
  }, [profile])

  const handleEdit = () => {
    setDraft(profileToDraft(profile))
    setIsEditing(true)
  }

  const handleCancel = () => {
    setDraft(profileToDraft(profile))
    setIsEditing(false)
  }

  const handleSave = () => {
    onSaveProfile(draftToProfile(draft))
    setIsEditing(false)
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <ProjectDetailsToolbar
        projectName={project.name}
        projectType={projectTypeLabel(project.projectType)}
        createdOn={profile.createdOn}
        createdOnIso={profile.createdOnIso}
        isEditing={isEditing}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onSave={handleSave}
      />
      <div className="min-h-0 flex-1 overflow-auto p-panel-padding">
        <div className="mx-auto max-w-3xl">
          {isEditing ? (
            <div className="flex flex-col gap-8 pb-8">
              <ProjectDetailsOverviewForm draft={draft} onDraftChange={setDraft} />
              <ProjectFilesSection assets={assets} />
              <ProjectDetailsTeamForm draft={draft} onDraftChange={setDraft} />
              <ProjectDetailsScheduleForm draft={draft} onDraftChange={setDraft} />
              <ProjectDetailsOpsForm draft={draft} onDraftChange={setDraft} />
            </div>
          ) : (
            <ProjectDetailsReadView profile={profile} assets={assets} />
          )}
        </div>
      </div>
    </div>
  )
}
