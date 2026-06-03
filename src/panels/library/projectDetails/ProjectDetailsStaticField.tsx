type ProjectDetailsStaticFieldProps = {
  label: string
  value: string
  className?: string
}

export function ProjectDetailsStaticField({ label, value, className }: ProjectDetailsStaticFieldProps) {
  return (
    <div className={'rounded-panel border border-stroke bg-area-highlight/40 px-3 py-2 ' + (className ?? '')}>
      <dt className="text-badge font-bold uppercase tracking-wide text-fg-muted">{label}</dt>
      <dd className="mt-1 font-bold text-fg">{value}</dd>
    </div>
  )
}
