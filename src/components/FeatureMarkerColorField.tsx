import { useId, useRef } from 'react'

import { normalizeMarkerColor } from '@/panels/map/markerColors'

const inputClassName =
  'text-fg placeholder:text-fg-disabled h-8 w-full min-w-0 rounded-panel border border-stroke bg-panel px-2.5 font-mono text-standard leading-none focus-visible:border-fg-highlight focus-visible:ring-1 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

type FeatureMarkerColorFieldProps = {
  value: string
  onChange: (color: string) => void
}

export function FeatureMarkerColorField({ value, onChange }: FeatureMarkerColorFieldProps) {
  const colorInputId = useId()
  const colorInputRef = useRef<HTMLInputElement>(null)
  const displayColor = normalizeMarkerColor(value)

  const openNativePicker = () => {
    colorInputRef.current?.click()
  }

  const commitHex = (raw: string) => {
    onChange(normalizeMarkerColor(raw))
  }

  return (
    <div className="relative min-w-0 sm:col-span-2">
      <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
        Feature color
      </span>
      <div className="flex min-w-0 items-center gap-2">
        <input
          ref={colorInputRef}
          id={colorInputId}
          type="color"
          value={displayColor}
          onChange={(e) => commitHex(e.target.value)}
          className="sr-only"
          tabIndex={-1}
          aria-label="Pick feature color"
        />
        <button
          type="button"
          className="border-stroke focus-visible:ring-fg-highlight/35 h-8 w-10 shrink-0 cursor-pointer rounded-panel border-2 focus-visible:ring-2 focus-visible:outline-none"
          style={{ backgroundColor: displayColor }}
          aria-label="Open color picker"
          onClick={openNativePicker}
        />
        <input
          type="text"
          className={inputClassName + ' max-w-[8.5rem]'}
          value={value}
          onChange={(e) => commitHex(e.target.value)}
          placeholder="#2563eb"
          aria-label="Feature color hex value"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
