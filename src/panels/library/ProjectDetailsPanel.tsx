import { useMemo } from 'react'

import { useActiveProject } from '@/context/ActiveProjectContext'
import { type SpatialAsset } from '@/data/sampleAssets'
import { getProjectDetailsProfile } from '@/data/sampleProjectProfile'

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
  return { total, counts, byType }
}

type ProjectDetailsPanelProps = {
  assets: SpatialAsset[]
}

export function ProjectDetailsPanel({ assets }: ProjectDetailsPanelProps) {
  const { projectId } = useActiveProject()
  const p = useMemo(() => getProjectDetailsProfile(projectId), [projectId])
  const assetSummary = useMemo(() => summarizeAssets(assets), [assets])

  return (
    <div className="min-h-0 flex-1 overflow-auto p-panel-padding">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 pb-8">
        <header className="border-b border-stroke pb-6">
          <p className="font-sans text-badge font-bold uppercase tracking-wide text-fg-highlight">
            {p.statusLabel}
          </p>
          <h2 className="mt-1 font-title text-title font-bold text-fg">{p.projectTitle}</h2>
          <p className="mt-2 max-w-2xl font-sans text-standard text-fg-muted">{p.projectSubtitle}</p>
          <p className="mt-3 font-sans text-standard text-fg">
            <span className="font-bold text-fg">Project created</span>{' '}
            <time dateTime={p.createdOnIso}>{p.createdOn}</time>
          </p>
        </header>

        <section aria-labelledby="pd-location">
          <h2 id="pd-location" className="font-title text-title font-bold text-fg">
            Location
          </h2>
          <address className="mt-3 not-italic font-sans text-standard leading-relaxed text-fg">
            {p.location.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <span className="mt-1 block">{p.location.cityStateZip}</span>
          </address>
          <p className="mt-3 font-sans text-standard text-fg-muted">{p.location.notes}</p>
        </section>

        <section aria-labelledby="pd-ids">
          <h2 id="pd-ids" className="font-title text-title font-bold text-fg">
            Project overview
          </h2>
          <dl className="mt-4 grid gap-3 font-sans text-standard sm:grid-cols-2">
            <div className="rounded-panel border border-stroke bg-area-highlight/40 px-3 py-2">
              <dt className="text-badge font-bold uppercase tracking-wide text-fg-muted">Project number</dt>
              <dd className="mt-1 font-bold text-fg">{p.identifiers.projectNumber}</dd>
            </div>
            <div className="rounded-panel border border-stroke bg-area-highlight/40 px-3 py-2">
              <dt className="text-badge font-bold uppercase tracking-wide text-fg-muted">Client / owner</dt>
              <dd className="mt-1 font-bold text-fg">{p.identifiers.clientName}</dd>
            </div>
            <div className="rounded-panel border border-stroke bg-area-highlight/40 px-3 py-2 sm:col-span-2">
              <dt className="text-badge font-bold uppercase tracking-wide text-fg-muted">Building & GC</dt>
              <dd className="mt-1 text-fg">
                <span className="block">{p.identifiers.buildingType}</span>
                <span className="mt-1 block text-fg-muted">General contractor: {p.identifiers.gcName}</span>
              </dd>
            </div>
          </dl>
          <p className="mt-4 font-sans text-standard leading-relaxed text-fg">{p.summary}</p>
        </section>

        <section aria-labelledby="pd-schedule">
          <h2 id="pd-schedule" className="font-title text-title font-bold text-fg">
            Schedule & milestones
          </h2>
          <ul className="mt-3 list-inside list-disc space-y-2 font-sans text-standard text-fg">
            <li>
              <span className="font-bold">Target substantial completion:</span>{' '}
              {p.schedule.targetSubstantialCompletion}
            </li>
            <li>
              <span className="font-bold">Last documented site walk:</span> {p.schedule.lastSiteWalk}
            </li>
            <li>
              <span className="font-bold">Next milestone:</span> {p.schedule.nextMilestone}
            </li>
          </ul>
        </section>

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
                {p.team.map((m) => (
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

        <section aria-labelledby="pd-assets">
          <h2 id="pd-assets" className="font-title text-title font-bold text-fg">
            Spatial assets in this project
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

        <section aria-labelledby="pd-ops">
          <h2 id="pd-ops" className="font-title text-title font-bold text-fg">
            Site operations & compliance
          </h2>
          <ul className="mt-3 space-y-3 font-sans text-standard leading-relaxed text-fg">
            <li>
              <span className="font-bold">Site hours:</span> {p.operations.siteHours}
            </li>
            <li>
              <span className="font-bold">After hours & emergencies:</span> {p.operations.afterHours}
            </li>
            <li>
              <span className="font-bold">Permits:</span> {p.permits}
            </li>
            <li>
              <span className="font-bold">Insurance:</span> {p.insurance}
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
