import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { PanelTabRow, type TabItem } from '@/components/PanelTabRow'
import { useAuth } from '@/context/AuthContext'
import { getMockAccountProfile } from '@/data/mockAccountData'
import { AccountBillingPanel } from '@/pages/account/AccountBillingPanel'
import { AccountProfilePanel } from '@/pages/account/AccountProfilePanel'
import { AccountSecurityPanel } from '@/pages/account/AccountSecurityPanel'
import { AccountSubscriptionPanel } from '@/pages/account/AccountSubscriptionPanel'
import { AccountUsagePanel } from '@/pages/account/AccountUsagePanel'
import type { AccountTabId } from '@/pages/account/types'
import { UserSectionPage } from '@/pages/UserSectionPage'

const accountTabs: TabItem[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'usage', label: 'Usage' },
  { id: 'subscription', label: 'Subscription' },
  { id: 'billing', label: 'Billing' },
  { id: 'security', label: 'Security' },
]

const ACCOUNT_TAB_IDS: AccountTabId[] = [
  'profile',
  'usage',
  'subscription',
  'billing',
  'security',
]

function parseAccountTab(value: string | null): AccountTabId | null {
  if (value != null && ACCOUNT_TAB_IDS.includes(value as AccountTabId)) {
    return value as AccountTabId
  }
  return null
}

function AccountPageContent() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const tabFromUrl = parseAccountTab(searchParams.get('tab'))
  const [tab, setTab] = useState<AccountTabId>(tabFromUrl ?? 'profile')

  useEffect(() => {
    if (tabFromUrl != null) setTab(tabFromUrl)
  }, [tabFromUrl])

  const displayName = user?.displayName ?? 'Guest'
  const email = user?.email ?? ''
  const photoUrl = user?.photoUrl
  const organization = user?.teamName ?? getMockAccountProfile(user?.planId).organization

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <PanelTabRow
        tabs={accountTabs}
        activeId={tab}
        onSelect={(id) => setTab(id as AccountTabId)}
        aria-label="Account sections"
        variant="buttons"
      />
      <div
        className={
          'min-h-0 flex-1 overflow-y-auto pb-6' +
          (tab === 'profile' || tab === 'usage' ? ' mt-10' : '')
        }
      >
        {tab === 'profile' ? (
          <AccountProfilePanel
            displayName={displayName}
            email={email}
            photoUrl={photoUrl}
            organization={organization}
          />
        ) : null}
        {tab === 'usage' ? (
          <AccountUsagePanel onChangeSubscriptionPlan={() => setTab('subscription')} />
        ) : null}
        {tab === 'subscription' ? <AccountSubscriptionPanel /> : null}
        {tab === 'billing' ? <AccountBillingPanel /> : null}
        {tab === 'security' ? <AccountSecurityPanel /> : null}
      </div>
    </div>
  )
}

export function AccountPage() {
  return (
    <UserSectionPage title="Account">
      <AccountPageContent />
    </UserSectionPage>
  )
}
