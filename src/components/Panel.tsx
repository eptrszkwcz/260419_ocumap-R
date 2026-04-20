import type { HTMLAttributes } from 'react'

type PanelProps = HTMLAttributes<HTMLDivElement>

export function Panel({ className = '', children, ...rest }: PanelProps) {
  return (
    <div
      className={`rounded-panel border border-stroke bg-panel ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  )
}
