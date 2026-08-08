export const MOCK_ACCOUNT_PROFILE = {
  jobTitle: 'Principal Surveyor',
  organization: 'Smith Property Group',
  username: 'jordysmith',
} as const

export const MOCK_ACCOUNT_USAGE = {
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
} as const

export type SubscriptionPlanId = 'free-trial' | 'professional' | 'ocumap-360' | 'enterprise'

export const MOCK_CURRENT_PLAN_ID: SubscriptionPlanId = 'professional'

export const MOCK_SECURITY = {
  twoFactorEnabled: false,
  hasPasscode: false,
  activeSessions: [
    { id: 'session-1', device: 'MacBook Pro', location: 'Austin, TX', lastActive: 'Active now' },
    { id: 'session-2', device: 'iPhone 15', location: 'Austin, TX', lastActive: '2 hours ago' },
  ],
} as const
