import { createPortal } from 'react-dom'
import { useEffect, useState, type FormEvent } from 'react'

import type { MockPaymentMethod } from '@/data/mockAccountData'
import { authFormLabelClass } from '@/pages/auth/AuthFormLayout'
import { accountPrimaryButtonClass } from '@/pages/account/accountStyles'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
  featureMetadataInputClassName,
} from '@/panels/library/featureMetadata/styles'

type AddNewCardModalProps = {
  onClose: () => void
  onSave: (method: MockPaymentMethod) => void
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

function formatCardNumber(value: string): string {
  const digits = digitsOnly(value).slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

function formatExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function detectBrand(cardNumberDigits: string): string {
  if (cardNumberDigits.startsWith('4')) return 'Visa'
  if (cardNumberDigits.startsWith('5')) return 'Mastercard'
  return 'Visa'
}

export function AddNewCardModal({ onClose, onSave }: AddNewCardModalProps) {
  const [cardholderName, setCardholderName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const cardDigits = digitsOnly(cardNumber)
  const expiryDigits = digitsOnly(expiry)
  const canSubmit =
    cardholderName.trim() !== '' &&
    cardDigits.length >= 15 &&
    expiryDigits.length === 4 &&
    digitsOnly(cvc).length >= 3

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    const brand = detectBrand(cardDigits)
    const last4 = cardDigits.slice(-4)
    const expires = formatExpiry(expiryDigits)

    onSave({
      id: `pm-${brand.toLowerCase()}-${last4}-${Date.now()}`,
      brand,
      last4,
      expires,
      isDefault: false,
    })
  }

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] bg-fg/20" aria-hidden onClick={onClose} />
      <div
        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
        role="presentation"
      >
        <form
          className="flex w-full max-w-md flex-col overflow-hidden rounded-panel border border-stroke bg-page shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-new-card-title"
          onClick={(e) => e.stopPropagation()}
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-4 px-panel-padding py-5">
            <header className="flex flex-col gap-1">
              <h2 id="add-new-card-title" className="font-title text-title font-bold text-fg">
                Add new card
              </h2>
              <p className="font-sans text-standard text-fg-muted">
                Enter your card details. This card can be used for your OcuMap subscription.
              </p>
            </header>

            <div className="flex flex-col gap-3">
              <label className="block min-w-0">
                <span className={authFormLabelClass}>Name on card</span>
                <input
                  type="text"
                  className={featureMetadataInputClassName}
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  autoComplete="cc-name"
                  placeholder="Full name"
                  required
                />
              </label>

              <label className="block min-w-0">
                <span className={authFormLabelClass}>Card number</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  className={featureMetadataInputClassName}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block min-w-0">
                  <span className={authFormLabelClass}>Expiration</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    className={featureMetadataInputClassName}
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    required
                  />
                </label>
                <label className="block min-w-0">
                  <span className={authFormLabelClass}>CVC</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    className={featureMetadataInputClassName}
                    value={cvc}
                    onChange={(e) => setCvc(digitsOnly(e.target.value).slice(0, 4))}
                    placeholder="123"
                    required
                  />
                </label>
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
              <button
                type="submit"
                className={
                  accountPrimaryButtonClass + ' disabled:cursor-not-allowed disabled:opacity-45'
                }
                disabled={!canSubmit}
              >
                Save card
              </button>
            </div>
          </footer>
        </form>
      </div>
    </>,
    document.body,
  )
}
