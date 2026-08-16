import { CheckIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import { useState, type FormEvent } from 'react'

import { dropdownMenuItemClassName } from '@/components/DropdownMenu'
import { DropdownPanel } from '@/components/DropdownPanel'
import { PencilIcon } from '@/components/overlayControlIcons'
import { useAuth } from '@/context/AuthContext'
import {
  getMockBilling,
  type MockPaymentMethod,
} from '@/data/mockAccountData'
import { authFormLabelClass } from '@/pages/auth/AuthFormLayout'
import { AddNewCardModal } from '@/pages/account/AddNewCardModal'
import { AllInvoicesModal } from '@/pages/account/AllInvoicesModal'
import { ConfirmPaymentMethodModal } from '@/pages/account/ConfirmPaymentMethodModal'
import { PaymentBrandLogo } from '@/pages/account/PaymentBrandLogo'
import { PaymentMethodUpdatedModal } from '@/pages/account/PaymentMethodUpdatedModal'
import {
  accountFormActionsClass,
  accountFormGridClass,
  accountLinkButtonClass,
  accountPanelClass,
  accountPrimaryButtonClass,
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

const paymentMethodTriggerClass =
  'text-fg-muted hover:text-fg-highlight flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-panel transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

const paymentMenuItemIconClass = 'size-4 shrink-0'

const paymentSectionHeaderClass =
  'text-fg-muted px-4 pt-3 pb-1 text-badge font-bold uppercase tracking-wide'

function ChevronDownIcon({ open, className = '' }: { open: boolean; className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      className={
        'shrink-0 transition-transform ' + (open ? 'rotate-180 ' : '') + className
      }
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M3 4.5 6 7.5 9 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PaypalIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      fill="currentColor"
    >
      <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.028.154a.804.804 0 0 1-.794.68H7.72a.483.483 0 0 1-.477-.558L9.36 7.35a.805.805 0 0 1 .794-.68h4.032c1.26 0 2.246.22 2.97.68.72.455 1.18 1.13 1.41 2.027.05.186.087.38.11.58.032.27.036.53.016.78a5.1 5.1 0 0 1-.625 2.14zm-2.35-1.39c-.06-.36-.2-.67-.43-.93-.28-.32-.72-.52-1.3-.6-.2-.03-.43-.04-.68-.04H11.4l-.9 5.7h1.76c1.64 0 2.82-.34 3.6-1.07.64-.6 1.02-1.5 1.15-2.7.05-.42.04-.78-.05-1.08-.05-.16-.11-.25-.2-.28z" />
      <path
        d="M6.265 3.5h5.98c1.34 0 2.41.24 3.2.73.79.49 1.29 1.22 1.52 2.2.05.2.09.41.11.63.22 1.48-.08 2.5-.8 3.3-.72.8-1.9 1.25-3.5 1.25H9.9a.8.8 0 0 0-.79.68l-1.04 6.58a.48.48 0 0 1-.477.42H4.32a.48.48 0 0 1-.477-.558L5.95 4.18A.8.8 0 0 1 6.265 3.5z"
        opacity="0.65"
      />
    </svg>
  )
}

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

function PaymentMethodDropdown({
  paymentMethod,
  paymentMethods,
  selectedId,
  onSelect,
  onAddCard,
}: {
  paymentMethod: MockPaymentMethod | undefined
  paymentMethods: readonly MockPaymentMethod[]
  selectedId: string
  onSelect: (id: string) => void
  onAddCard: (method: MockPaymentMethod) => void
}) {
  const [open, setOpen] = useState(false)
  const [pendingMethod, setPendingMethod] = useState<MockPaymentMethod | null>(null)
  const [showAddCardModal, setShowAddCardModal] = useState(false)
  const [showUpdatedModal, setShowUpdatedModal] = useState(false)

  const handleSelectSavedMethod = (method: MockPaymentMethod) => {
    if (method.id === selectedId) {
      setOpen(false)
      return
    }

    setOpen(false)
    setPendingMethod(method)
  }

  const handleConfirmPaymentMethod = () => {
    if (pendingMethod == null) return
    onSelect(pendingMethod.id)
    setPendingMethod(null)
    setShowUpdatedModal(true)
  }

  const handleOpenAddCard = () => {
    setOpen(false)
    setShowAddCardModal(true)
  }

  const handleSaveNewCard = (method: MockPaymentMethod) => {
    onAddCard(method)
    setShowAddCardModal(false)
    setShowUpdatedModal(true)
  }

  return (
    <>
    <DropdownPanel
      panelAriaLabel="Payment method options"
      align="left"
      panelWidth="100%"
      panelOffsetPx={4}
      fullWidth
      closeOnMouseLeave={false}
      open={open}
      onOpenChange={setOpen}
      renderTrigger={({ open: isOpen, panelId, onToggle }) => (
        <div
          className={`${accountPanelClass} flex w-full flex-wrap items-center justify-between gap-3`}
        >
          <div className="min-w-0">
            {paymentMethod != null ? (
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0">
                  <PaymentBrandLogo brand={paymentMethod.brand} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className="block font-bold tabular-nums leading-none text-fg"
                      aria-label={`${paymentMethod.brand} ending in ${paymentMethod.last4}`}
                    >
                      •••• {paymentMethod.last4}
                    </p>
                    {paymentMethod.isDefault ? (
                      <CheckIcon
                        className="size-4 shrink-0 text-fg-highlight"
                        aria-label="Default payment method"
                      />
                    ) : null}
                  </div>
                  <p className="mt-1 block font-sans text-badge leading-none text-fg-muted">
                    Expires {paymentMethod.expires}
                  </p>
                </div>
              </div>
            ) : (
              <p className="font-sans text-standard text-fg-muted">No payment method on file</p>
            )}
          </div>
          <button
            type="button"
            onClick={onToggle}
            className={paymentMethodTriggerClass}
            aria-expanded={isOpen}
            aria-haspopup="menu"
            aria-controls={panelId}
            aria-label="Change payment method"
          >
            <ChevronDownIcon open={isOpen} />
          </button>
        </div>
      )}
    >
      <div role="menu" className="py-1">
        <div className={paymentSectionHeaderClass}>Saved</div>
        {paymentMethods.map((method) => {
          const selected = method.id === selectedId
          return (
            <button
              key={method.id}
              type="button"
              role="menuitem"
              aria-current={selected ? 'true' : undefined}
              aria-label={`${method.brand} ending in ${method.last4}, expires ${method.expires}`}
              className={
                dropdownMenuItemClassName +
                ' items-start' +
                (selected ? ' text-fg-highlight bg-area-highlight' : '')
              }
              onClick={() => handleSelectSavedMethod(method)}
            >
              <span className="mt-0.5 shrink-0">
                <PaymentBrandLogo brand={method.brand} />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block tabular-nums leading-none">•••• {method.last4}</span>
                <span className="mt-1 block font-sans text-badge leading-none text-fg-muted">
                  Expires {method.expires}
                </span>
              </span>
              {method.isDefault ? (
                <CheckIcon
                  className="mt-0.5 size-4 shrink-0 self-center text-fg-highlight"
                  aria-label="Default payment method"
                />
              ) : null}
            </button>
          )
        })}

        <div className="mx-4 my-1 border-t border-stroke/40" role="separator" />

        <div className={paymentSectionHeaderClass}>New Payment Method</div>
        <button
          type="button"
          role="menuitem"
          className={dropdownMenuItemClassName}
          onClick={handleOpenAddCard}
        >
          <CreditCardIcon className={paymentMenuItemIconClass} aria-hidden />
          <span className="min-w-0">New Card</span>
        </button>
        <button
          type="button"
          role="menuitem"
          className={dropdownMenuItemClassName}
          onClick={() => setOpen(false)}
        >
          <PaypalIcon className={paymentMenuItemIconClass} />
          <span className="min-w-0">Paypal</span>
        </button>
      </div>
    </DropdownPanel>

    {pendingMethod != null ? (
      <ConfirmPaymentMethodModal
        method={pendingMethod}
        onClose={() => setPendingMethod(null)}
        onConfirm={handleConfirmPaymentMethod}
      />
    ) : null}

    {showAddCardModal ? (
      <AddNewCardModal
        onClose={() => setShowAddCardModal(false)}
        onSave={handleSaveNewCard}
      />
    ) : null}

    {showUpdatedModal ? (
      <PaymentMethodUpdatedModal onClose={() => setShowUpdatedModal(false)} />
    ) : null}
    </>
  )
}

export function AccountBillingPanel() {
  const { user } = useAuth()
  const billing = getMockBilling(user?.planId)
  const { invoices, contact } = billing
  const recentInvoices = invoices.slice(0, 3)
  const [showAllInvoices, setShowAllInvoices] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<MockPaymentMethod[]>([
    ...billing.paymentMethods,
  ])
  const defaultMethod =
    paymentMethods.find((method) => method.isDefault) ?? paymentMethods[0]

  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(defaultMethod?.id ?? '')
  const paymentMethod =
    paymentMethods.find((method) => method.id === selectedPaymentMethodId) ?? defaultMethod

  const handleAddCard = (method: MockPaymentMethod) => {
    setPaymentMethods((prev) => [...prev, method])
    setSelectedPaymentMethodId(method.id)
  }

  const [savedName, setSavedName] = useState<string>(billing.contact.name)
  const [savedEmail, setSavedEmail] = useState<string>(billing.contact.email)
  const [savedCompanyAddress, setSavedCompanyAddress] = useState<string>(
    billing.contact.companyAddress,
  )
  const [savedTaxId, setSavedTaxId] = useState<string>(billing.contact.taxId)

  const [name, setName] = useState<string>(billing.contact.name)
  const [email, setEmail] = useState<string>(billing.contact.email)
  const [companyAddress, setCompanyAddress] = useState<string>(
    billing.contact.companyAddress,
  )
  const [taxId, setTaxId] = useState<string>(billing.contact.taxId)
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
        <PaymentMethodDropdown
          paymentMethod={paymentMethod}
          paymentMethods={paymentMethods}
          selectedId={selectedPaymentMethodId}
          onSelect={setSelectedPaymentMethodId}
          onAddCard={handleAddCard}
        />
      </section>

      <section className={accountSectionClass} aria-labelledby="billing-history">
        <div>
          <h2 id="billing-history" className={accountSectionTitleClass}>
            Billing history
          </h2>
          <p className={`mt-1 ${accountSectionDescClass}`}>Recent invoices for this account.</p>
        </div>
        <ul className="overflow-hidden rounded-panel border border-stroke bg-panel">
          {recentInvoices.length === 0 ? (
            <li className="px-4 py-8 text-center font-sans text-standard text-fg-muted">
              No invoices yet
            </li>
          ) : (
            recentInvoices.map((invoice) => (
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
            ))
          )}
        </ul>
        {invoices.length > 0 ? (
          <div>
            <button
              type="button"
              className={accountLinkButtonClass}
              onClick={() => setShowAllInvoices(true)}
            >
              View all invoices
            </button>
          </div>
        ) : null}
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

      {showAllInvoices ? (
        <AllInvoicesModal
          invoices={invoices}
          contact={contact}
          onClose={() => setShowAllInvoices(false)}
        />
      ) : null}
    </div>
  )
}
