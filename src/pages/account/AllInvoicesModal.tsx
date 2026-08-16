import { CheckIcon } from '@heroicons/react/16/solid'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import type { MockBillingContact, MockInvoice } from '@/data/mockAccountData'
import {
  accountPrimaryButtonClass,
  accountSecondaryButtonClass,
} from '@/pages/account/accountStyles'
import { downloadInvoice, downloadInvoiceList } from '@/pages/account/downloadInvoice'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
  featureMetadataSelectClassName,
} from '@/panels/library/featureMetadata/styles'

type AllInvoicesModalProps = {
  invoices: readonly MockInvoice[]
  contact: MockBillingContact
  onClose: () => void
}

const checkboxBoxClass =
  'flex size-3.5 shrink-0 items-center justify-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-fg-highlight/35 peer-focus-visible:outline-none'

function parseInvoiceAmount(amount: string): number {
  const negative = amount.includes('−') || amount.trim().startsWith('-')
  const value = Number(amount.replace(/[^0-9.]/g, ''))
  if (Number.isNaN(value)) return 0
  return negative ? -value : value
}

function formatUsd(amount: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.abs(amount))
  return amount < 0 ? `−${formatted}` : formatted
}

function invoiceYear(invoice: MockInvoice): string {
  const match = invoice.date.match(/(\d{4})$/)
  return match?.[1] ?? ''
}

function TableCheckbox({
  checked,
  indeterminate = false,
  onChange,
  label,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  return (
    <label className="inline-flex cursor-pointer items-center justify-center">
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
        aria-label={label}
      />
      <span
        aria-hidden
        className={
          checked || indeterminate
            ? checkboxBoxClass + ' border-fg-highlight bg-fg-highlight'
            : checkboxBoxClass + ' border-stroke bg-panel'
        }
      >
        {checked || indeterminate ? (
          <CheckIcon className="size-2.5 text-white" strokeWidth={2.5} />
        ) : null}
      </span>
    </label>
  )
}

export function AllInvoicesModal({ invoices, contact, onClose }: AllInvoicesModalProps) {
  const [yearFilter, setYearFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const years = useMemo(() => {
    const unique = new Set(invoices.map(invoiceYear).filter((year) => year !== ''))
    return [...unique].sort((a, b) => Number(b) - Number(a))
  }, [invoices])

  const visibleInvoices = useMemo(() => {
    if (yearFilter === 'all') return invoices
    return invoices.filter((invoice) => invoiceYear(invoice) === yearFilter)
  }, [invoices, yearFilter])

  const selectedInvoices = useMemo(
    () => invoices.filter((invoice) => selectedIds.has(invoice.id)),
    [invoices, selectedIds],
  )

  const visibleSelectedCount = visibleInvoices.filter((invoice) =>
    selectedIds.has(invoice.id),
  ).length
  const allVisibleSelected =
    visibleInvoices.length > 0 && visibleSelectedCount === visibleInvoices.length
  const someVisibleSelected = visibleSelectedCount > 0 && !allVisibleSelected

  const paidTotal = visibleInvoices.reduce((sum, invoice) => {
    if (invoice.status !== 'Paid') return sum
    return sum + parseInvoiceAmount(invoice.amount)
  }, 0)

  const handleYearChange = (year: string) => {
    setYearFilter(year)
    setSelectedIds(new Set())
  }

  const handleToggleAllVisible = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      for (const invoice of visibleInvoices) {
        if (checked) next.add(invoice.id)
        else next.delete(invoice.id)
      }
      return next
    })
  }

  const handleToggleInvoice = (invoiceId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(invoiceId)
      else next.delete(invoiceId)
      return next
    })
  }

  const handleDownloadSelected = () => {
    const [onlyInvoice] = selectedInvoices
    if (selectedInvoices.length === 1 && onlyInvoice != null) {
      downloadInvoice(onlyInvoice, contact)
      return
    }
    if (selectedInvoices.length > 1) {
      downloadInvoiceList(selectedInvoices)
    }
  }

  const handleDownloadAllVisible = () => {
    if (visibleInvoices.length === 0) return
    downloadInvoiceList(visibleInvoices)
  }

  const summaryLabel =
    yearFilter === 'all'
      ? `${invoices.length} invoices · ${formatUsd(paidTotal)} paid`
      : `${visibleInvoices.length} invoices in ${yearFilter} · ${formatUsd(paidTotal)} paid`

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] bg-fg/20" aria-hidden onClick={onClose} />
      <div
        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
        role="presentation"
      >
        <div
          className="flex max-h-[min(90vh,720px)] w-full max-w-3xl flex-col overflow-hidden rounded-panel border border-stroke bg-page shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-labelledby="all-invoices-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-panel-padding py-5">
            <header className="flex flex-col gap-1">
              <h2 id="all-invoices-title" className="font-title text-title font-bold text-fg">
                Invoices
              </h2>
              <p className="font-sans text-standard text-fg-muted">
                Download a receipt or export a list of invoices for your records.
              </p>
            </header>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <label className="flex min-w-0 items-center gap-2">
                  <span className="font-sans text-badge font-bold uppercase tracking-wide text-fg-muted">
                    Year
                  </span>
                  <select
                    className={featureMetadataSelectClassName + ' w-[7.5rem]'}
                    value={yearFilter}
                    onChange={(e) => handleYearChange(e.target.value)}
                    aria-label="Filter invoices by year"
                  >
                    <option value="all">All years</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="font-sans text-badge text-fg-muted">{summaryLabel}</p>
              </div>
              <button
                type="button"
                onClick={handleDownloadAllVisible}
                disabled={visibleInvoices.length === 0}
                className={
                  accountSecondaryButtonClass +
                  ' inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-45'
                }
              >
                <ArrowDownTrayIcon className="size-4 shrink-0" aria-hidden />
                Download all
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto rounded-panel border border-stroke bg-panel">
              <table className="w-full min-w-[40rem] border-collapse text-left font-sans text-standard">
                <thead className="sticky top-0 bg-panel">
                  <tr className="border-b border-stroke">
                    <th scope="col" className="w-10 px-3 py-2.5">
                      <TableCheckbox
                        checked={allVisibleSelected}
                        indeterminate={someVisibleSelected}
                        onChange={handleToggleAllVisible}
                        label="Select all invoices"
                      />
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-bold text-fg">
                      Invoice
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-bold text-fg">
                      Date
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-bold text-fg">
                      Description
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-bold text-fg">
                      Amount
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-bold text-fg">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-2.5">
                      <span className="sr-only">Download</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleInvoices.map((invoice) => {
                    const selected = selectedIds.has(invoice.id)
                    return (
                      <tr key={invoice.id} className="border-b border-stroke/60 last:border-b-0">
                        <td className="px-3 py-2.5 align-middle">
                          <TableCheckbox
                            checked={selected}
                            onChange={(checked) => handleToggleInvoice(invoice.id, checked)}
                            label={`Select ${invoice.number}`}
                          />
                        </td>
                        <td className="px-3 py-2.5 align-middle font-bold tabular-nums text-fg">
                          {invoice.number}
                        </td>
                        <td className="px-3 py-2.5 align-middle text-fg">{invoice.date}</td>
                        <td className="px-3 py-2.5 align-middle text-fg-muted">
                          <span className="block">{invoice.description}</span>
                          <span className="mt-0.5 block font-sans text-badge text-fg-muted">
                            {invoice.period}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 align-middle tabular-nums text-fg">
                          {invoice.amount}
                        </td>
                        <td className="px-3 py-2.5 align-middle text-fg">
                          <span className="block">{invoice.status}</span>
                          <span className="mt-0.5 block font-sans text-badge text-fg-muted">
                            {invoice.paidWith}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 align-middle">
                          <button
                            type="button"
                            onClick={() => downloadInvoice(invoice, contact)}
                            className={
                              accountSecondaryButtonClass +
                              ' inline-flex items-center gap-1.5 px-2.5'
                            }
                            aria-label={`Download ${invoice.number}`}
                          >
                            <ArrowDownTrayIcon className="size-4 shrink-0" aria-hidden />
                            <span className="hidden sm:inline">Download</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <footer className="flex shrink-0 border-t border-stroke bg-panel px-panel-padding py-3">
            <div className={featureMetadataFooterActionsClassName}>
              <button
                type="button"
                onClick={onClose}
                className={featureMetadataFooterCancelButtonClass}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDownloadSelected}
                disabled={selectedInvoices.length === 0}
                className={
                  accountPrimaryButtonClass + ' disabled:cursor-not-allowed disabled:opacity-45'
                }
              >
                {selectedInvoices.length <= 1
                  ? 'Download invoice'
                  : `Download list (${selectedInvoices.length})`}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </>,
    document.body,
  )
}
