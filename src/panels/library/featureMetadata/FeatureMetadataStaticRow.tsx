export function FeatureMetadataStaticRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-fg-muted text-badge font-bold uppercase tracking-wide">{label}</p>
      <p className="text-standard text-fg">{value}</p>
    </div>
  )
}
