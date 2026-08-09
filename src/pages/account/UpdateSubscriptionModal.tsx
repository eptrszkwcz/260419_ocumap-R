import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { SubscriptionPlanId } from '@/data/mockAccountData'
import {
  accountPrimaryButtonClass,
  accountSecondaryButtonClass,
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
  { id: 'free-trial', label: 'Free Trial', price: 'Free for 30 days', storage: '10 GB storage' },
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
    'flex w-full cursor-pointer flex-col gap-1 rounded-panel border px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'
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
          className="flex w-full max-w-lg flex-col overflow-hidden rounded-panel border border-stroke bg-page shadow-lg"
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

            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Subscription plans">
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
                    <span className="font-sans text-standard font-bold text-fg">{plan.label}</span>
                    <span className="font-sans text-badge text-fg-muted">{plan.price}</span>
                    <span className="font-sans text-badge text-fg-muted">{plan.storage}</span>
                    {isCurrent ? (
                      <span className="mt-0.5 font-sans text-badge font-bold text-fg-highlight">
                        Current plan
                      </span>
                    ) : null}
                  </button>
                )
              })}
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
