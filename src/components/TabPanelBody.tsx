import type { HTMLAttributes } from 'react'

/**
 * White main panel below folder-style tabs; uses full panel radius (4px). The active
 * tab overlaps the top border with a square bottom edge.
 */
export function TabPanelBody({
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`ocu-tab-panel-body relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden border border-stroke bg-panel ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  )
}
