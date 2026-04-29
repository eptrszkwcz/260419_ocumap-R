import type { HTMLAttributes } from 'react'

type PanelProps = HTMLAttributes<HTMLDivElement>

export function Panel({ className = '', children, ...rest }: PanelProps) {
  return (
    <div
      className={`ocu-panel-surface border border-stroke bg-panel ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  )
}
