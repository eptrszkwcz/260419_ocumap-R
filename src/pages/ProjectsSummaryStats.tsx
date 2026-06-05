import { useMemo } from 'react'

import { Panel } from '@/components/Panel'
import type { ProjectRecord } from '@/data/sampleProjects'

const OPEN_ISSUES_PLACEHOLDER = 84

type SummaryStat = {
  label: string
  value: number
}

function computeSummaryStats(projects: ProjectRecord[]): SummaryStat[] {
  const totalProjects = projects.length
  const published = projects.filter((p) => p.status === 'Published').length
  const totalFiles = projects.reduce((sum, p) => sum + p.featureFileCount, 0)

  return [
    { label: 'Total Projects', value: totalProjects },
    { label: 'Published', value: published },
    { label: 'Total Files', value: totalFiles },
    { label: 'Open Issues', value: OPEN_ISSUES_PLACEHOLDER },
  ]
}

type ProjectsSummaryStatsProps = {
  projects: ProjectRecord[]
}

export function ProjectsSummaryStats({ projects }: ProjectsSummaryStatsProps) {
  const stats = useMemo(() => computeSummaryStats(projects), [projects])

  return (
    <div
      className="grid w-full min-w-0 shrink-0 grid-cols-4 gap-4"
      aria-label="Project summary statistics"
    >
      {stats.map(({ label, value }) => (
        <Panel
          key={label}
          className="flex h-[84px] min-w-0 flex-col justify-center gap-1 px-panel-padding py-0 shadow-none"
        >
          <span className="text-fg-muted text-badge font-bold uppercase tracking-wide">{label}</span>
          <span className="text-fg font-title text-title font-bold tabular-nums">
            {value.toLocaleString()}
          </span>
        </Panel>
      ))}
    </div>
  )
}
