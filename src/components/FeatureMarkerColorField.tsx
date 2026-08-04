import { MarkerColorPicker } from '@/components/MarkerColorPicker'
import { normalizeMarkerColor } from '@/panels/map/markerColors'

type FeatureMarkerColorFieldProps = {
  value: string
  onChange: (color: string) => void
}

export function FeatureMarkerColorField({ value, onChange }: FeatureMarkerColorFieldProps) {
  return (
    <div className="relative min-w-0 sm:col-span-2">
      <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
        Feature color
      </span>
      <MarkerColorPicker
        value={value}
        onChange={(color) => onChange(normalizeMarkerColor(color))}
        ariaLabel="Open color picker"
      />
    </div>
  )
}
