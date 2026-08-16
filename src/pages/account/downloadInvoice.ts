import type { MockBillingContact, MockInvoice } from '@/data/mockAccountData'

function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function invoiceHtml(invoice: MockInvoice, contact: MockBillingContact): string {
  const address = escapeHtml(contact.companyAddress).replace(/\n/g, '<br />')
  const taxId = contact.taxId.trim() !== '' ? escapeHtml(contact.taxId) : '—'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(invoice.number)} — OcuMap</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; color: #1a1a1a; margin: 40px; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .muted { color: #666; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th, td { text-align: left; padding: 10px 0; border-bottom: 1px solid #ddd; }
    th { font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: #666; }
    .total { font-weight: 700; font-size: 16px; }
    .meta { margin-top: 24px; }
  </style>
</head>
<body>
  <h1>OcuMap invoice</h1>
  <p class="muted">${escapeHtml(invoice.number)}</p>
  <div class="meta">
    <p><strong>Bill to</strong><br />${escapeHtml(contact.name)}<br />${escapeHtml(contact.email)}<br />${address}</p>
    <p><strong>Tax ID</strong><br />${taxId}</p>
    <p><strong>Invoice date</strong><br />${escapeHtml(invoice.date)}</p>
    <p><strong>Billing period</strong><br />${escapeHtml(invoice.period)}</p>
    <p><strong>Status</strong><br />${escapeHtml(invoice.status)}</p>
    <p><strong>Paid with</strong><br />${escapeHtml(invoice.paidWith)}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${escapeHtml(invoice.description)}</td>
        <td>${escapeHtml(invoice.amount)}</td>
      </tr>
      <tr>
        <td class="total">Total</td>
        <td class="total">${escapeHtml(invoice.amount)}</td>
      </tr>
    </tbody>
  </table>
</body>
</html>
`
}

export function downloadInvoice(invoice: MockInvoice, contact: MockBillingContact) {
  triggerDownload(
    `OcuMap-${invoice.number}.html`,
    invoiceHtml(invoice, contact),
    'text/html;charset=utf-8',
  )
}

export function downloadInvoiceList(invoices: readonly MockInvoice[]) {
  const header = [
    'Invoice number',
    'Date',
    'Billing period',
    'Description',
    'Amount',
    'Status',
    'Paid with',
  ]
  const rows = invoices.map((invoice) =>
    [
      invoice.number,
      invoice.date,
      invoice.period,
      invoice.description,
      invoice.amount,
      invoice.status,
      invoice.paidWith,
    ]
      .map(escapeCsv)
      .join(','),
  )
  const csv = [header.join(','), ...rows].join('\n')
  const stamp = new Date().toISOString().slice(0, 10)
  triggerDownload(`OcuMap-invoices-${stamp}.csv`, csv, 'text/csv;charset=utf-8')
}
