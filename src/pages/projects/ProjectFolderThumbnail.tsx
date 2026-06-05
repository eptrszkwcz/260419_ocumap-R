type ProjectFolderThumbnailProps = {
  className?: string
}

/** Minimal 2D folder icon for Files Only projects (brand colors). */
export function ProjectFolderThumbnail({ className = '' }: ProjectFolderThumbnailProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M8 18c0-2.2 1.8-4 4-4h14l6 6h24c2.2 0 4 1.8 4 4v26c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V18Z"
        fill="var(--color-area-highlight)"
        stroke="var(--color-fg-highlight)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M8 24h48v30c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V24Z"
        fill="var(--color-fg-highlight)"
        fillOpacity="0.12"
        stroke="var(--color-fg-highlight)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}
