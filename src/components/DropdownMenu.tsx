import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react'

export type DropdownMenuItemConfig = {
  id: string
  label: string
  onSelect: () => void
  /** Shown on the left side of the menu row (decorative; label remains the accessible name). */
  icon?: ReactNode
  /** Highlights the active choice (e.g. current floor). */
  selected?: boolean
}

export type DropdownMenuTriggerProps = {
  open: boolean
  menuId: string | undefined
  onToggle: (e: MouseEvent) => void
}

export const dropdownMenuPanelClassName =
  'border-stroke font-sans text-standard font-normal absolute top-full z-40 w-[200px] overflow-hidden rounded-panel border bg-panel py-1 shadow-lg'

export const dropdownMenuItemClassName =
  'text-fg-muted hover:text-fg-highlight flex w-full cursor-pointer items-center gap-2.5 rounded-panel px-[16px] py-[12px] text-left font-sans text-standard font-normal leading-none hover:bg-area-highlight hover:font-normal focus-visible:bg-area-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-highlight/35'

function dropdownMenuItemClass(selected: boolean | undefined): string {
  if (selected) {
    return dropdownMenuItemClassName + ' text-fg-highlight bg-area-highlight'
  }
  return dropdownMenuItemClassName
}

type DropdownMenuProps = {
  items: DropdownMenuItemConfig[]
  menuAriaLabel: string
  align?: 'left' | 'right'
  /** Overrides default panel width (200px). */
  panelWidth?: string
  stopTriggerPropagation?: boolean
  renderTrigger: (props: DropdownMenuTriggerProps) => ReactNode
}

export function DropdownMenu({
  items,
  menuAriaLabel,
  align = 'right',
  panelWidth,
  stopTriggerPropagation = false,
  renderTrigger,
}: DropdownMenuProps) {
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
      }
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const onToggle = (e: MouseEvent) => {
    if (stopTriggerPropagation) {
      e.stopPropagation()
    }
    setOpen((v) => !v)
  }

  const run = (fn: () => void) => {
    setOpen(false)
    fn()
  }

  const alignClass = align === 'left' ? 'left-0' : 'right-0'

  return (
    <div ref={rootRef} className="relative inline-flex min-w-0">
      {renderTrigger({ open, menuId: open ? menuId : undefined, onToggle })}

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={menuAriaLabel}
          className={dropdownMenuPanelClassName + ' ' + alignClass}
          style={panelWidth != null ? { width: panelWidth } : undefined}
          onMouseLeave={() => setOpen(false)}
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              aria-current={item.selected ? 'true' : undefined}
              className={dropdownMenuItemClass(item.selected)}
              onClick={() => run(item.onSelect)}
            >
              {item.icon != null ? <span className="shrink-0">{item.icon}</span> : null}
              <span className="min-w-0">{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
