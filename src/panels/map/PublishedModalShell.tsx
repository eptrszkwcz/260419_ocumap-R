import { createPortal } from 'react-dom'
import { useEffect, type ReactNode } from 'react'

type PublishedModalShellProps = {
  ariaLabel: string
  maxWidthClass: string
  onClose: () => void
  header: ReactNode
  children: ReactNode
  footer: ReactNode
}

export function PublishedModalShell({
  ariaLabel,
  maxWidthClass,
  onClose,
  header,
  children,
  footer,
}: PublishedModalShellProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] bg-fg/20" aria-hidden onClick={onClose} />
      <div
        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
        role="presentation"
      >
        <div
          className={
            'flex max-h-[min(90vh,800px)] w-full flex-col overflow-hidden rounded-panel border border-stroke bg-page shadow-lg ' +
            maxWidthClass
          }
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          onClick={(e) => e.stopPropagation()}
        >
          {header}
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer}
        </div>
      </div>
    </>,
    document.body,
  )
}
