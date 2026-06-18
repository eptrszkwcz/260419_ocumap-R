import type { ProjectStatus } from '@/data/sampleProjects'

const projectStatusBadgeBaseClass =
  'inline-flex shrink-0 items-center justify-center rounded-panel px-2 py-1 text-badge font-bold leading-none'

const projectStatusBadgePublishedClass =
  'inline-flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-panel px-2 py-1 text-center text-badge leading-none min-h-[2.25rem] bg-[#FFAA1D]/20 text-[#B87A12] group-hover:bg-[#FFAA1D]/28'

export function ProjectStatusBadge({
  status,
  publishedDate,
}: {
  status: ProjectStatus
  publishedDate?: string
}) {
  if (status === 'Published') {
    return (
      <span className={projectStatusBadgePublishedClass}>
        <span className="font-bold">Published</span>
        {publishedDate != null ? (
          <span className="text-[10px] leading-[1.2] font-normal whitespace-nowrap">
            {publishedDate}
          </span>
        ) : null}
      </span>
    )
  }
  return (
    <span
      className={
        projectStatusBadgeBaseClass +
        ' text-fg-muted bg-area-highlight group-hover:bg-fg-highlight/12 group-hover:text-fg-highlight'
      }
    >
      Draft
    </span>
  )
}
