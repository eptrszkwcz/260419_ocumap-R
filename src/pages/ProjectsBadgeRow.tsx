const countBadgeClassName =
  'text-fg-muted inline-flex h-badge min-h-badge max-h-badge min-w-0 shrink-0 items-center justify-center rounded-panel bg-area-highlight px-2 text-badge font-bold leading-none'

type ProjectsBadgeRowProps = {
  projectCount: number
}

/**
 * Same strip height and layout as `FeatureLibraryFilterRow` / `badge-container-feature-lib`.
 */
export function ProjectsBadgeRow({ projectCount }: ProjectsBadgeRowProps) {
  const label = projectCount === 1 ? 'Project' : 'Projects'
  return (
    <div
      id="badge-container-projects"
      className="flex h-14 w-full shrink-0 items-center gap-2 px-panel-padding"
      aria-label="Project summary"
    >
      <div className={countBadgeClassName} role="status" aria-live="polite">
        {projectCount} {label}
      </div>
    </div>
  )
}
