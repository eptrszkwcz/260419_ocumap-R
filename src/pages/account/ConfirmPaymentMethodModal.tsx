import { createPortal } from 'react-dom'
import { useEffect } from 'react'

import type { MockPaymentMethod } from '@/data/mockAccountData'
import { accountPrimaryButtonClass } from '@/pages/account/accountStyles'
import { PaymentBrandLogo } from '@/pages/account/PaymentBrandLogo'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
} from '@/panels/library/featureMetadata/styles'

type ConfirmPaymentMethodModalProps = {
  method: MockPaymentMethod
  onClose: () => void
  onConfirm: () => void
}

export function ConfirmPaymentMethodModal({
  method,
  onClose,
  onConfirm,
}: ConfirmPaymentMethodModalProps) {
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
          aria-labelledby="confirm-payment-method-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-4 px-panel-padding py-5">
            <header className="flex flex-col gap-1">
              <h2
                id="confirm-payment-method-title"
                className="font-title text-title font-bold text-fg"
              >
                Change payment method
              </h2>
              <p className="font-sans text-standard text-fg-muted">
                This card will be used for your OcuMap subscription.
              </p>
            </header>

            <div className="flex items-center gap-3 rounded-panel border border-stroke bg-panel px-4 py-3">
              <PaymentBrandLogo
                brand={method.brand}
                className="h-5 w-auto max-w-[2.75rem] shrink-0 object-contain object-left"
              />
              <div className="min-w-0">
                <p className="font-sans text-standard font-bold tabular-nums text-fg">
                  •••• {method.last4}
                </p>
                <p className="mt-0.5 font-sans text-badge text-fg-muted">
                  Expires {method.expires}
                </p>
              </div>
            </div>
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
              <button type="button" onClick={onConfirm} className={accountPrimaryButtonClass}>
                Confirm
              </button>
            </div>
          </footer>
        </div>
      </div>
    </>,
    document.body,
  )
}
