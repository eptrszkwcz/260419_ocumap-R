import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

export const dropdownMenuPanelBaseClassName =
  'border-stroke font-sans text-standard font-normal absolute z-40 w-[200px] overflow-hidden rounded-panel border bg-panel py-1 shadow-lg'

export const dropdownMenuPanelClassName = dropdownMenuPanelBaseClassName + ' top-full mt-2'

export type DropdownPanelAlign = 'left' | 'right' | 'center' | 'auto'

const PANEL_OFFSET_PX = 8

function getTriggerElement(root: HTMLElement | null): HTMLElement | null {
  const trigger = root?.firstElementChild
  return trigger instanceof HTMLElement ? trigger : null
}

function computePortaledPanelStyle(
  triggerRect: DOMRect,
  resolvedAlign: 'left' | 'right' | 'center',
  placement: 'bottom' | 'top',
  panelWidth: string | undefined,
  panelMaxHeight: string | undefined,
): CSSProperties {
  const style: CSSProperties = {}
  if (panelWidth != null) style.width = panelWidth
  if (panelMaxHeight != null) style.maxHeight = panelMaxHeight

  if (placement === 'top') {
    style.bottom = window.innerHeight - triggerRect.top + PANEL_OFFSET_PX
  } else {
    style.top = triggerRect.bottom + PANEL_OFFSET_PX
  }

  if (resolvedAlign === 'right') {
    style.right = window.innerWidth - triggerRect.right
  } else if (resolvedAlign === 'left') {
    style.left = triggerRect.left
  } else {
    style.left = triggerRect.left + triggerRect.width / 2
    style.transform = 'translateX(-50%)'
  }

  return style
}

function getConstraintRects(element: HTMLElement): DOMRect[] {
  const rects: DOMRect[] = [new DOMRect(0, 0, window.innerWidth, window.innerHeight)]

  let node: HTMLElement | null = element.parentElement
  while (node && node !== document.body) {
    const style = getComputedStyle(node)
    const values = [style.overflow, style.overflowX, style.overflowY]
    if (values.some((v) => v === 'auto' || v === 'scroll' || v === 'hidden' || v === 'clip')) {
      rects.push(node.getBoundingClientRect())
    }
    node = node.parentElement
  }

  return rects
}

function parsePanelWidth(panelWidth: string | undefined): number {
  if (panelWidth == null) return 200
  const parsed = Number.parseFloat(panelWidth)
  return Number.isFinite(parsed) ? parsed : 200
}

function resolveAutoAlign(
  root: HTMLElement,
  panelWidthPx: number,
): 'left' | 'right' {
  const trigger = root.firstElementChild
  if (!(trigger instanceof HTMLElement)) return 'left'

  const triggerRect = trigger.getBoundingClientRect()
  const boundaryRects = getConstraintRects(root)

  let canLeft = true
  let canRight = true

  for (const boundaryRect of boundaryRects) {
    const spaceRight = boundaryRect.right - triggerRect.left
    const spaceLeft = triggerRect.right - boundaryRect.left
    if (spaceRight < panelWidthPx) canLeft = false
    if (spaceLeft < panelWidthPx) canRight = false
  }

  if (canLeft) return 'left'
  if (canRight) return 'right'

  const viewport = boundaryRects[0]
  const spaceRight = viewport.right - triggerRect.left
  const spaceLeft = triggerRect.right - viewport.left
  return spaceRight >= spaceLeft ? 'left' : 'right'
}

export type DropdownPanelTriggerProps = {
  open: boolean
  panelId: string | undefined
  onToggle: (e: MouseEvent) => void
}

type DropdownPanelProps = {
  panelAriaLabel: string
  align?: DropdownPanelAlign
  /** Where the panel opens relative to the trigger. */
  placement?: 'bottom' | 'top'
  panelWidth?: string
  panelMaxHeight?: string
  /** Fixed region above scrollable `children` when `panelMaxHeight` is set. */
  panelHeader?: ReactNode
  /** When true, close panel when pointer leaves it (single-select menus). */
  closeOnMouseLeave?: boolean
  /** Render the panel in a body portal so it stacks above page content. */
  portaled?: boolean
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
  placement = 'bottom',
  panelWidth,
  panelMaxHeight,
  panelHeader,
  closeOnMouseLeave = false,
  portaled = false,
  stopTriggerPropagation = false,
  open: openControlled,
  onOpenChange,
  renderTrigger,
  children,
}: DropdownPanelProps) {
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [openInternal, setOpenInternal] = useState(false)
  const [resolvedAlign, setResolvedAlign] = useState<'left' | 'right' | 'center'>(
    align === 'auto' ? 'left' : align,
  )
  const [portaledPanelStyle, setPortaledPanelStyle] = useState<CSSProperties>({})
  const open = openControlled ?? openInternal

  const setOpen = (next: boolean) => {
    if (openControlled == null) {
      setOpenInternal(next)
    }
    onOpenChange?.(next)
  }

  useLayoutEffect(() => {
    if (!open || align !== 'auto') {
      if (align !== 'auto') {
        setResolvedAlign(align)
      }
      return
    }

    const root = rootRef.current
    if (root == null) return

    setResolvedAlign(resolveAutoAlign(root, parsePanelWidth(panelWidth)))
  }, [align, open, panelWidth])

  useLayoutEffect(() => {
    if (!open || !portaled) return

    const updatePosition = () => {
      const trigger = getTriggerElement(rootRef.current)
      if (trigger == null) return
      setPortaledPanelStyle(
        computePortaledPanelStyle(
          trigger.getBoundingClientRect(),
          resolvedAlign,
          placement,
          panelWidth,
          panelMaxHeight,
        ),
      )
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, portaled, resolvedAlign, placement, panelWidth, panelMaxHeight])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (rootRef.current?.contains(target)) return
      if (portaled && panelRef.current?.contains(target)) return
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
  }, [open, portaled])

  const onToggle = (e: MouseEvent) => {
    if (stopTriggerPropagation) {
      e.stopPropagation()
    }
    setOpen(!open)
  }

  const alignClass =
    resolvedAlign === 'left'
      ? 'left-0'
      : resolvedAlign === 'center'
        ? 'left-1/2 -translate-x-1/2'
        : 'right-0'
  const placementClass = placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
  const splitScrollLayout = panelMaxHeight != null && panelHeader != null
  const scrollClass =
    panelMaxHeight != null && !splitScrollLayout ? ' overflow-y-auto overflow-x-hidden' : ''
  let panelBase = dropdownMenuPanelBaseClassName
  if (panelMaxHeight != null && !splitScrollLayout) {
    panelBase = panelBase.replace(' overflow-hidden', '')
  }
  if (splitScrollLayout) {
    panelBase = panelBase.replace(' overflow-hidden', '').replace(' py-1', ' py-0')
    panelBase += ' flex flex-col overflow-hidden'
  }
  const portaledPanelBase = panelBase.replace('absolute z-40', 'fixed z-[100]')
  const panelClassName = portaled
    ? portaledPanelBase + scrollClass
    : panelBase + scrollClass + ' ' + placementClass + ' ' + alignClass

  const panelStyle: CSSProperties = portaled
    ? portaledPanelStyle
    : {
        ...(panelWidth != null ? { width: panelWidth } : {}),
        ...(panelMaxHeight != null ? { maxHeight: panelMaxHeight } : {}),
      }

  const panelNode = open ? (
    <div
      ref={panelRef}
      id={panelId}
      aria-label={panelAriaLabel}
      className={panelClassName}
      style={Object.keys(panelStyle).length > 0 ? panelStyle : undefined}
      onMouseLeave={closeOnMouseLeave ? () => setOpen(false) : undefined}
      onClick={(e) => e.stopPropagation()}
    >
      {splitScrollLayout ? (
        <>
          <div className="shrink-0">{panelHeader}</div>
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto py-1">
            {children}
          </div>
        </>
      ) : (
        children
      )}
    </div>
  ) : null

  return (
    <div ref={rootRef} className="relative inline-flex min-w-0">
      {renderTrigger({ open, panelId: open ? panelId : undefined, onToggle })}
      {portaled && panelNode != null ? createPortal(panelNode, document.body) : panelNode}
    </div>
  )
}
