import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react'

export const dropdownMenuPanelClassName =
  'border-stroke font-sans text-standard font-normal absolute top-full z-40 w-[200px] overflow-hidden rounded-panel border bg-panel py-1 shadow-lg'

export type DropdownPanelTriggerProps = {
  open: boolean
  panelId: string | undefined
  onToggle: (e: MouseEvent) => void
}

type DropdownPanelProps = {
  panelAriaLabel: string
  align?: 'left' | 'right'
  panelWidth?: string
  /** When true, close panel when pointer leaves it (single-select menus). */
  closeOnMouseLeave?: boolean
  stopTriggerPropagation?: boolean
  /** Controlled open state; when omitted, panel manages its own open state. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  renderTrigger: (props: DropdownPanelTriggerProps) => ReactNode
  children: ReactNode
}

export function DropdownPanel({
  panelAriaLabel,
  align = 'right',
  panelWidth,
  closeOnMouseLeave = false,
  stopTriggerPropagation = false,
  open: openControlled,
  onOpenChange,
  renderTrigger,
  children,
}: DropdownPanelProps) {
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [openInternal, setOpenInternal] = useState(false)
  const open = openControlled ?? openInternal

  const setOpen = (next: boolean) => {
    if (openControlled == null) {
      setOpenInternal(next)
    }
    onOpenChange?.(next)
  }

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
    setOpen(!open)
  }

  const alignClass = align === 'left' ? 'left-0' : 'right-0'

  return (
    <div ref={rootRef} className="relative inline-flex min-w-0">
      {renderTrigger({ open, panelId: open ? panelId : undefined, onToggle })}

      {open ? (
        <div
          id={panelId}
          aria-label={panelAriaLabel}
          className={dropdownMenuPanelClassName + ' ' + alignClass}
          style={panelWidth != null ? { width: panelWidth } : undefined}
          onMouseLeave={closeOnMouseLeave ? () => setOpen(false) : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}
