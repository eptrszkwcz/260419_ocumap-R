import { useState, type FormEvent } from 'react'

import { PencilIcon } from '@/components/overlayControlIcons'
import { MOCK_BILLING } from '@/data/mockAccountData'
import { authFormLabelClass } from '@/pages/auth/AuthFormLayout'
import {
  accountFormActionsClass,
  accountFormGridClass,
  accountLinkButtonClass,
  accountPanelClass,
  accountPrimaryButtonClass,
  accountSecondaryButtonClass,
  accountSectionClass,
  accountSectionDescClass,
  accountSectionTitleClass,
} from '@/pages/account/accountStyles'
import {
  featureMetadataFooterCancelButtonClass,
  featureMetadataInputClassName,
} from '@/panels/library/featureMetadata/styles'

const billingTextareaClassName =
  featureMetadataInputClassName + ' min-h-[4.5rem] resize-y py-2 leading-normal'

const editIconButtonClass =
  'text-fg-muted hover:text-fg-highlight absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-panel transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

function ContactField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className={authFormLabelClass}>{label}</p>
      <p className="whitespace-pre-line font-sans text-standard text-fg">
        {value.trim() !== '' ? value : '—'}
      </p>
    </div>
  )
}

export function AccountBillingPanel() {
  const { paymentMethod, invoices } = MOCK_BILLING

  const [savedName, setSavedName] = useState<string>(MOCK_BILLING.contact.name)
  const [savedEmail, setSavedEmail] = useState<string>(MOCK_BILLING.contact.email)
  const [savedCompanyAddress, setSavedCompanyAddress] = useState<string>(
    MOCK_BILLING.contact.companyAddress,
  )
  const [savedTaxId, setSavedTaxId] = useState<string>(MOCK_BILLING.contact.taxId)

  const [name, setName] = useState<string>(MOCK_BILLING.contact.name)
  const [email, setEmail] = useState<string>(MOCK_BILLING.contact.email)
  const [companyAddress, setCompanyAddress] = useState<string>(
    MOCK_BILLING.contact.companyAddress,
  )
  const [taxId, setTaxId] = useState<string>(MOCK_BILLING.contact.taxId)
  const [isEditingContact, setIsEditingContact] = useState(false)

  const handleStartEdit = () => {
    setName(savedName)
    setEmail(savedEmail)
    setCompanyAddress(savedCompanyAddress)
    setTaxId(savedTaxId)
    setIsEditingContact(true)
  }

  const handleCancel = () => {
    setName(savedName)
    setEmail(savedEmail)
    setCompanyAddress(savedCompanyAddress)
    setTaxId(savedTaxId)
    setIsEditingContact(false)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setSavedName(name)
    setSavedEmail(email)
    setSavedCompanyAddress(companyAddress)
    setSavedTaxId(taxId)
    setIsEditingContact(false)
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-2">
      <section className={accountSectionClass} aria-labelledby="billing-payment-method">
        <div>
          <h2 id="billing-payment-method" className={accountSectionTitleClass}>
            Payment method
          </h2>
          <p className={`mt-1 ${accountSectionDescClass}`}>
            The card used for your OcuMap subscription.
          </p>
        </div>
        <div className={`${accountPanelClass} flex flex-wrap items-center justify-between gap-3`}>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-fg">
                {paymentMethod.brand} •••• {paymentMethod.last4}
              </p>
              {paymentMethod.isDefault ? (
                <span className="inline-flex items-center rounded-panel bg-area-highlight px-2 py-0.5 font-sans text-badge font-bold leading-none text-fg-muted">
                  Default
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-fg-muted">Expires {paymentMethod.expires}</p>
          </div>
          <button type="button" className={accountSecondaryButtonClass}>
            Change payment method
          </button>
        </div>
      </section>

      <section className={accountSectionClass} aria-labelledby="billing-history">
        <div>
          <h2 id="billing-history" className={accountSectionTitleClass}>
            Billing history
          </h2>
          <p className={`mt-1 ${accountSectionDescClass}`}>Recent invoices for this account.</p>
        </div>
        <ul className="overflow-hidden rounded-panel border border-stroke bg-panel">
          {invoices.map((invoice) => (
            <li
              key={invoice.id}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b border-stroke/60 px-4 py-3 font-sans text-standard last:border-b-0"
            >
              <p className="text-fg">
                <span className="font-bold">{invoice.date}</span>
                <span className="text-fg-muted"> — </span>
                <span className="tabular-nums">{invoice.amount}</span>
                <span className="text-fg-muted"> — </span>
                <span>{invoice.status}</span>
              </p>
            </li>
          ))}
        </ul>
        <div>
          <button type="button" className={accountLinkButtonClass}>
            View all invoices
          </button>
        </div>
      </section>

      <section className={accountSectionClass} aria-labelledby="billing-contact">
        <div>
          <h2 id="billing-contact" className={accountSectionTitleClass}>
            Billing contact
          </h2>
          <p className={`mt-1 ${accountSectionDescClass}`}>
            Where invoices and payment notices are sent.
          </p>
        </div>

        {isEditingContact ? (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className={accountFormGridClass}>
              <label className="block min-w-0">
                <span className={authFormLabelClass}>Name</span>
                <input
                  type="text"
                  className={featureMetadataInputClassName}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </label>
              <label className="block min-w-0">
                <span className={authFormLabelClass}>Billing email</span>
                <input
                  type="email"
                  className={featureMetadataInputClassName}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </label>
              <label className="block min-w-0 sm:col-span-2">
                <span className={authFormLabelClass}>Company / address</span>
                <textarea
                  className={billingTextareaClassName}
                  rows={3}
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  autoComplete="street-address"
                />
              </label>
              <label className="block min-w-0 sm:col-span-2">
                <span className={authFormLabelClass}>Tax ID, if relevant</span>
                <input
                  type="text"
                  className={featureMetadataInputClassName}
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                />
              </label>
            </div>
            <div className={accountFormActionsClass + ' justify-end'}>
              <button
                type="button"
                onClick={handleCancel}
                className={featureMetadataFooterCancelButtonClass}
              >
                Cancel
              </button>
              <button type="submit" className={accountPrimaryButtonClass}>
                Save changes
              </button>
            </div>
          </form>
        ) : (
          <div className={`${accountPanelClass} relative pr-12`}>
            <button
              type="button"
              className={editIconButtonClass}
              aria-label="Edit billing contact"
              onClick={handleStartEdit}
            >
              <PencilIcon />
            </button>
            <div className="flex flex-col gap-4">
              <ContactField label="Name" value={savedName} />
              <ContactField label="Billing email" value={savedEmail} />
              <ContactField label="Company / address" value={savedCompanyAddress} />
              <ContactField label="Tax ID, if relevant" value={savedTaxId} />
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
