import { PlusIcon } from '@heroicons/react/24/outline'
import { useId, useRef, useState } from 'react'

import { DropdownPanel } from '@/components/DropdownPanel'
import { useCustomMarkerColors } from '@/context/CustomMarkerColorsContext'
import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
} from '@/panels/library/featureMetadata/styles'
import { normalizeMarkerColor, PRESET_MARKER_COLORS } from '@/panels/map/markerColors'

const swatchClassName =
  'border-stroke focus-visible:ring-fg-highlight/35 size-8 shrink-0 cursor-pointer rounded-panel border-2 focus-visible:ring-2 focus-visible:outline-none'

const plusButtonClassName =
  'border-stroke text-fg-muted hover:text-fg-highlight focus-visible:ring-fg-highlight/35 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-panel border-2 focus-visible:ring-2 focus-visible:outline-none'

const hexInputClassName =
  'text-fg placeholder:text-fg-disabled h-8 min-w-0 flex-1 rounded-panel border border-stroke bg-panel px-2.5 font-mono text-standard leading-none focus-visible:border-fg-highlight focus-visible:ring-1 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

type PickerMode = 'grid' | 'custom'

type MarkerColorPickerProps = {
  value: string
  onChange: (color: string) => void
  ariaLabel?: string
  triggerClassName?: string
}

export function MarkerColorPicker({
  value,
  onChange,
  ariaLabel = 'Pick marker color',
  triggerClassName,
}: MarkerColorPickerProps) {
  const colorInputId = useId()
  const colorInputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<PickerMode>('grid')
  const [draftCustomColor, setDraftCustomColor] = useState('')
  const { customColors, addCustomColor } = useCustomMarkerColors()
  const displayColor = normalizeMarkerColor(value)

  const gridColors = [...PRESET_MARKER_COLORS, ...customColors]

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setMode('grid')
    }
  }

  const handleSelectColor = (color: string) => {
    onChange(normalizeMarkerColor(color))
    setOpen(false)
  }

  const handleOpenCustomMode = () => {
    setDraftCustomColor(displayColor)
    setMode('custom')
  }

  const handleCancelCustom = () => {
    setMode('grid')
  }

  const draftDisplayColor = normalizeMarkerColor(draftCustomColor)

  const handleDraftHexChange = (raw: string) => {
    setDraftCustomColor(normalizeMarkerColor(raw))
  }

  const handleOpenNativePicker = () => {
    colorInputRef.current?.click()
  }

  const handleConfirmCustom = () => {
    addCustomColor(draftDisplayColor)
    onChange(draftDisplayColor)
    setMode('grid')
  }

  return (
    <DropdownPanel
      panelAriaLabel={mode === 'custom' ? 'Custom marker color' : 'Marker color options'}
      align="auto"
      closeOnMouseLeave={false}
      panelWidth="248px"
      open={open}
      onOpenChange={handleOpenChange}
      renderTrigger={({ open: isOpen, panelId, onToggle }) => (
        <button
          type="button"
          className={triggerClassName ?? swatchClassName}
          style={{ backgroundColor: displayColor }}
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
        />
      )}
    >
      {mode === 'grid' ? (
        <div className="grid grid-cols-6 gap-2 p-3">
          {gridColors.map((color) => {
            const isSelected = color === displayColor
            return (
              <button
                key={color}
                type="button"
                className={
                  swatchClassName +
                  (isSelected ? ' ring-fg-highlight ring-2 ring-offset-1 ring-offset-panel' : '')
                }
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
                aria-pressed={isSelected}
                onClick={() => handleSelectColor(color)}
              />
            )
          })}
          <button
            type="button"
            className={plusButtonClassName}
            aria-label="Add custom color"
            onClick={handleOpenCustomMode}
          >
            <PlusIcon className="size-4 shrink-0" aria-hidden />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-3">
          <div className="flex min-w-0 items-center gap-2">
            <input
              ref={colorInputRef}
              id={colorInputId}
              type="color"
              value={draftDisplayColor}
              onChange={(e) => setDraftCustomColor(normalizeMarkerColor(e.target.value))}
              className="sr-only"
              tabIndex={-1}
              aria-label="Pick custom marker color"
            />
            <button
              type="button"
              className={swatchClassName}
              style={{ backgroundColor: draftDisplayColor }}
              aria-label="Open color picker"
              onClick={handleOpenNativePicker}
            />
            <input
              type="text"
              className={hexInputClassName}
              value={draftCustomColor}
              onChange={(e) => handleDraftHexChange(e.target.value)}
              placeholder="#2563eb"
              aria-label="Custom color hex value"
              spellCheck={false}
            />
          </div>
          <div className={featureMetadataFooterActionsClassName}>
            <button
              type="button"
              onClick={handleCancelCustom}
              className={featureMetadataFooterCancelButtonClass}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmCustom}
              className={
                PRIMARY_BUTTON_CLASS +
                ' h-8 rounded-panel px-4 text-standard focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'
              }
            >
              Select color
            </button>
          </div>
        </div>
      )}
    </DropdownPanel>
  )
}
