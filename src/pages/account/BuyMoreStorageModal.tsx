import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  accountPrimaryButtonClass,
  accountSecondaryButtonClass,
} from '@/pages/account/accountStyles'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
} from '@/panels/library/featureMetadata/styles'

export type StorageAddOnId = '50' | '100' | '250' | '500'

type StorageAddOn = {
  id: StorageAddOnId
  label: string
  price: string
  gb: number
}

const STORAGE_ADD_ONS: StorageAddOn[] = [
  { id: '50', label: '+50 GB', price: '$39/mo ($390/yr)', gb: 50 },
  { id: '100', label: '+100 GB', price: '$69/mo ($690/yr)', gb: 100 },
  { id: '250', label: '+250 GB', price: '$149/mo ($1,490/yr)', gb: 250 },
  { id: '500', label: '+500 GB', price: '$249/mo ($2,490/yr)', gb: 500 },
]

type BuyMoreStorageModalProps = {
  onClose: () => void
  onPurchase: (addOn: StorageAddOn) => void
  onChangeSubscriptionPlan: () => void
}

function addOnCardClass(isSelected: boolean): string {
  let className =
    'flex w-full cursor-pointer flex-col gap-1 rounded-panel border px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'
  if (isSelected) {
    className += ' border-fg-highlight bg-area-highlight/40'
  } else {
    className += ' border-stroke bg-panel hover:border-fg-muted'
  }
  return className
}

export function BuyMoreStorageModal({
  onClose,
  onPurchase,
  onChangeSubscriptionPlan,
}: BuyMoreStorageModalProps) {
  const navigate = useNavigate()
  const [selectedAddOnId, setSelectedAddOnId] = useState<StorageAddOnId>('50')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const selectedAddOn = STORAGE_ADD_ONS.find((addOn) => addOn.id === selectedAddOnId)!

  const handlePurchase = () => {
    onPurchase(selectedAddOn)
    onClose()
  }

  const handleChangePlan = () => {
    onClose()
    onChangeSubscriptionPlan()
  }

  const handleSpeakToSales = () => {
    onClose()
    navigate('/support')
  }

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] bg-fg/20" aria-hidden onClick={onClose} />
      <div
        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
        role="presentation"
      >
        <div
          className="flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-panel border border-stroke bg-page shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-labelledby="buy-more-storage-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-panel-padding py-5">
            <header className="flex flex-col gap-1">
              <h2 id="buy-more-storage-title" className="font-title text-title font-bold text-fg">
                Buy more storage
              </h2>
              <p className="font-sans text-standard text-fg-muted">
                Add storage to your current plan without changing your subscription tier.
              </p>
            </header>

            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Storage add-ons">
              {STORAGE_ADD_ONS.map((addOn) => {
                const isSelected = selectedAddOnId === addOn.id
                return (
                  <button
                    key={addOn.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={addOnCardClass(isSelected)}
                    onClick={() => setSelectedAddOnId(addOn.id)}
                  >
                    <span className="font-sans text-standard font-bold text-fg">{addOn.label}</span>
                    <span className="font-sans text-badge text-fg-muted">{addOn.price}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex flex-col gap-2 rounded-panel border border-stroke bg-panel px-4 py-3">
              <p className="font-sans text-standard text-fg-muted">
                OcuMap offers several subscription plans with varying storage limits included. Upgrading
                your plan may be more cost-effective if you need significantly more space.
              </p>
              <button
                type="button"
                onClick={handleChangePlan}
                className={`${accountSecondaryButtonClass} w-full justify-center py-2.5`}
              >
                Change subscription plan
              </button>
            </div>

            <button
              type="button"
              onClick={handleSpeakToSales}
              className={`${accountSecondaryButtonClass} w-full justify-center py-2.5`}
            >
              Speak to an OcuMap sales representative today
            </button>
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
              <button type="button" onClick={handlePurchase} className={accountPrimaryButtonClass}>
                Add {selectedAddOn.label}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </>,
    document.body,
  )
}
