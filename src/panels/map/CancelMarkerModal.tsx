import { createPortal } from 'react-dom'
import { useEffect } from 'react'

import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
} from '@/panels/library/featureMetadata/styles'

type CancelMarkerModalProps = {
  onClose: () => void
  onConfirm: () => void
}

export function CancelMarkerModal({ onClose, onConfirm }: CancelMarkerModalProps) {
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
          className="flex w-full max-w-md flex-col overflow-hidden rounded-panel border border-stroke bg-page shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-label="Remove marker"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-panel-padding py-5">
            <p className="font-sans text-standard text-fg">
              Would you like to cancel and remove this marker?
            </p>
          </div>
          <footer className="flex shrink-0 border-t border-stroke bg-panel px-panel-padding py-3">
            <div className={featureMetadataFooterActionsClassName}>
              <button
                type="button"
                onClick={onClose}
                className={featureMetadataFooterCancelButtonClass}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={
                  PRIMARY_BUTTON_CLASS +
                  ' h-8 rounded-panel px-4 text-standard focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'
                }
              >
                Remove marker
              </button>
            </div>
          </footer>
        </div>
      </div>
    </>,
    document.body,
  )
}
