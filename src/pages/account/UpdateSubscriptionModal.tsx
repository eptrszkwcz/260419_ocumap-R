import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { SubscriptionPlanId } from '@/data/mockAccountData'
import {
  accountLinkButtonClass,
  accountPrimaryButtonClass,
} from '@/pages/account/accountStyles'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
} from '@/panels/library/featureMetadata/styles'

type PlanOption = {
  id: SubscriptionPlanId
  label: string
  price: string
  storage: string
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'professional',
    label: 'Professional',
    price: '$99/mo ($990/yr)',
    storage: '100 GB storage',
  },
  {
    id: 'ocumap-360',
    label: 'OcuMap 360',
    price: '$249/mo ($2,490/yr)',
    storage: '500 GB storage',
  },
  { id: 'enterprise', label: 'Enterprise', price: 'Custom pricing', storage: 'Custom storage' },
]

type UpdateSubscriptionModalProps = {
  currentPlanId: SubscriptionPlanId
  onClose: () => void
  onSelectPlan: (planId: SubscriptionPlanId) => void
}

function planCardClass(isSelected: boolean, isCurrent: boolean): string {
  let className =
    'relative h-[300px] w-[200px] cursor-pointer rounded-panel border px-4 py-4 text-center transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'
  if (isSelected) {
    className += ' border-fg-highlight bg-area-highlight/40'
  } else if (isCurrent) {
    className += ' border-stroke bg-panel hover:border-fg-highlight/50'
  } else {
    className += ' border-stroke bg-panel hover:border-fg-muted'
  }
  return className
}

export function UpdateSubscriptionModal({
  currentPlanId,
  onClose,
  onSelectPlan,
}: UpdateSubscriptionModalProps) {
  const navigate = useNavigate()
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>(currentPlanId)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleUpdatePlan = () => {
    onSelectPlan(selectedPlanId)
    onClose()
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
          className="flex w-fit max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-panel border border-stroke bg-page shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-labelledby="update-subscription-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-4 px-panel-padding py-5">
            <header className="flex flex-col gap-1">
              <h2 id="update-subscription-title" className="font-title text-title font-bold text-fg">
                Update subscription
              </h2>
              <p className="font-sans text-standard text-fg-muted">
                Choose a plan that fits your team, or talk with our sales team for custom options.
              </p>
            </header>

            <div className="flex gap-3" role="radiogroup" aria-label="Subscription plans">
              {PLAN_OPTIONS.map((plan) => {
                const isSelected = selectedPlanId === plan.id
                const isCurrent = currentPlanId === plan.id
                return (
                  <button
                    key={plan.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={planCardClass(isSelected, isCurrent)}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                      <span className="mb-[24px] font-sans text-[20px] font-bold text-fg">
                        {plan.label}
                      </span>
                      <span className="font-sans text-badge text-fg-muted">{plan.price}</span>
                      <span className="font-sans text-badge text-fg-muted">{plan.storage}</span>
                    </div>
                    {isCurrent ? (
                      <span className="absolute right-0 bottom-[16px] left-0 font-sans text-badge font-bold text-fg-highlight">
                        Current plan
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>

            <p className="text-center font-sans text-standard">
              <button type="button" onClick={handleSpeakToSales} className={accountLinkButtonClass}>
                Speak to an OcuMap sales representative today
              </button>
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
                onClick={handleUpdatePlan}
                disabled={selectedPlanId === currentPlanId}
                className={
                  accountPrimaryButtonClass + ' disabled:cursor-not-allowed disabled:opacity-45'
                }
              >
                Update plan
              </button>
            </div>
          </footer>
        </div>
      </div>
    </>,
    document.body,
  )
}
