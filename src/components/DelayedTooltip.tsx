import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const SHOW_DELAY_MS = 1000

const tooltipClassName =
  'pointer-events-none fixed z-[1000] whitespace-nowrap rounded-panel border border-stroke bg-panel px-2 py-1 font-sans text-badge text-fg shadow-sm'

type DelayedTooltipProps = {
  label: string
  children: ReactNode
}

export function DelayedTooltip({ label, children }: DelayedTooltipProps) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const anchorRef = useRef<HTMLSpanElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const updatePosition = () => {
    const anchor = anchorRef.current
    if (anchor == null) return
    const rect = anchor.getBoundingClientRect()
    setPosition({
      left: rect.left + rect.width / 2,
      top: rect.top,
    })
  }

  const handleMouseEnter = () => {
    clearTimer()
    timerRef.current = setTimeout(() => {
      updatePosition()
      setVisible(true)
    }, SHOW_DELAY_MS)
  }

  const handleMouseLeave = () => {
    clearTimer()
    setVisible(false)
  }

  useEffect(() => () => clearTimer(), [])

  useEffect(() => {
    if (!visible) return
    updatePosition()
    const handleReposition = () => updatePosition()
    window.addEventListener('scroll', handleReposition, true)
    window.addEventListener('resize', handleReposition)
    return () => {
      window.removeEventListener('scroll', handleReposition, true)
      window.removeEventListener('resize', handleReposition)
    }
  }, [visible])

  return (
    <span
      ref={anchorRef}
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {visible
        ? createPortal(
            <span
              className={tooltipClassName}
              style={{
                left: position.left,
                top: position.top,
                transform: 'translate(-50%, calc(-100% - 8px))',
              }}
            >
              {label}
            </span>,
            document.body,
          )
        : null}
    </span>
  )
}
