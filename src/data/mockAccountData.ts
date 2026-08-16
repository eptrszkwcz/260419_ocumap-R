export type MockAccountProfile = {
  jobTitle: string
  organization: string
  username: string
}

export const MOCK_ACCOUNT_PROFILE: MockAccountProfile = {
  jobTitle: 'Principal Surveyor',
  organization: 'Smith Property Group',
  username: 'jordysmith',
}

export const MOCK_TAJ_ACCOUNT_PROFILE: MockAccountProfile = {
  jobTitle: 'Surveyor',
  organization: 'Burrows',
  username: 'taj',
}

export type MockAccountUsage = {
  usedGb: number
  totalGb: number
  breakdown: readonly { label: string; sizeGb: number; fileCount: number }[]
}

export const MOCK_ACCOUNT_USAGE: MockAccountUsage = {
  usedGb: 70.3,
  totalGb: 100,
  breakdown: [
    { label: 'Images', sizeGb: 32.1, fileCount: 1248 },
    { label: 'Panoramas', sizeGb: 18.7, fileCount: 312 },
    { label: 'Videos', sizeGb: 9.4, fileCount: 86 },
    { label: 'PDFs', sizeGb: 5.8, fileCount: 194 },
    { label: 'Geometry', sizeGb: 2.4, fileCount: 57 },
    { label: 'Other', sizeGb: 1.9, fileCount: 23 },
  ],
}

export const MOCK_TAJ_ACCOUNT_USAGE: MockAccountUsage = {
  usedGb: 3.8,
  totalGb: 5,
  breakdown: [
    { label: 'Images', sizeGb: 1.7, fileCount: 64 },
    { label: 'Panoramas', sizeGb: 1.0, fileCount: 18 },
    { label: 'Videos', sizeGb: 0.5, fileCount: 4 },
    { label: 'PDFs', sizeGb: 0.3, fileCount: 12 },
    { label: 'Geometry', sizeGb: 0.2, fileCount: 3 },
    { label: 'Other', sizeGb: 0.1, fileCount: 2 },
  ],
}

export type SubscriptionPlanId = 'free-trial' | 'professional' | 'ocumap-360' | 'enterprise'

export const MOCK_CURRENT_PLAN_ID: SubscriptionPlanId = 'professional'

export function isFreePlanId(planId?: string): boolean {
  return planId === 'free-trial'
}

export function getMockAccountProfile(planId?: string): MockAccountProfile {
  return isFreePlanId(planId) ? MOCK_TAJ_ACCOUNT_PROFILE : MOCK_ACCOUNT_PROFILE
}

export function getMockAccountUsage(planId?: string): MockAccountUsage {
  return isFreePlanId(planId) ? MOCK_TAJ_ACCOUNT_USAGE : MOCK_ACCOUNT_USAGE
}

export function getMockCurrentPlanId(planId?: string): SubscriptionPlanId {
  return isFreePlanId(planId) ? 'free-trial' : MOCK_CURRENT_PLAN_ID
}

export const MOCK_SECURITY = {
  twoFactorEnabled: false,
  hasPasscode: false,
  activeSessions: [
    { id: 'session-1', device: 'MacBook Pro', location: 'Austin, TX', lastActive: 'Active now' },
    { id: 'session-2', device: 'iPhone 15', location: 'Austin, TX', lastActive: '2 hours ago' },
  ],
} as const

export type MockPaymentMethod = {
  id: string
  brand: string
  last4: string
  expires: string
  isDefault: boolean
}

export type MockInvoiceStatus = 'Paid' | 'Open' | 'Refunded'

export type MockInvoice = {
  id: string
  number: string
  date: string
  period: string
  description: string
  amount: string
  status: MockInvoiceStatus
  paidWith: string
}

export type MockBillingContact = {
  name: string
  email: string
  companyAddress: string
  taxId: string
}

const INVOICE_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

function lastDayOfMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate()
}

function buildInvoiceHistory(): MockInvoice[] {
  const invoices: MockInvoice[] = []
  let year = 2026
  let monthIndex = 7

  for (let i = 0; i < 20; i += 1) {
    const monthLabel = INVOICE_MONTHS[monthIndex]
    const lastDay = lastDayOfMonth(year, monthIndex)
    const monthToken = String(monthIndex + 1).padStart(2, '0')
    const isStorageCredit = year === 2025 && monthIndex === 11

    invoices.push({
      id: `inv-${year}-${monthToken}`,
      number: `INV-${year}-${monthToken}`,
      date: `${monthLabel} 1, ${year}`,
      period: `${monthLabel} 1 – ${monthLabel} ${lastDay}, ${year}`,
      description: isStorageCredit
        ? 'Storage add-on credit'
        : 'OcuMap Professional — monthly',
      amount: isStorageCredit ? '−$39.00' : '$199.00',
      status: isStorageCredit ? 'Refunded' : 'Paid',
      paidWith: 'Visa •••• 4242',
    })

    monthIndex -= 1
    if (monthIndex < 0) {
      monthIndex = 11
      year -= 1
    }
  }

  return invoices
}

export type MockBilling = {
  paymentMethods: readonly MockPaymentMethod[]
  invoices: MockInvoice[]
  contact: MockBillingContact
}

export const MOCK_BILLING: MockBilling = {
  paymentMethods: [
    {
      id: 'pm-visa-4242',
      brand: 'Visa',
      last4: '4242',
      expires: '08/28',
      isDefault: true,
    },
    {
      id: 'pm-mc-4444',
      brand: 'Mastercard',
      last4: '4444',
      expires: '11/27',
      isDefault: false,
    },
  ],
  invoices: buildInvoiceHistory(),
  contact: {
    name: 'Jordy Smith',
    email: 'billing@smithproperty.com',
    companyAddress: 'Smith Property Group\n100 Congress Ave, Suite 400\nAustin, TX 78701',
    taxId: '',
  },
}

export const MOCK_TAJ_BILLING: MockBilling = {
  paymentMethods: [],
  invoices: [],
  contact: {
    name: 'Taj Burrows',
    email: 'taj@burrows.co',
    companyAddress: '',
    taxId: '',
  },
}

export function getMockBilling(planId?: string): MockBilling {
  return isFreePlanId(planId) ? MOCK_TAJ_BILLING : MOCK_BILLING
}
