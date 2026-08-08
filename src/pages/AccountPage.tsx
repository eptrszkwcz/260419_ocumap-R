import { useState } from 'react'

import { PanelTabRow, type TabItem } from '@/components/PanelTabRow'
import { useAuth } from '@/context/AuthContext'
import { MOCK_ACCOUNT_PROFILE } from '@/data/mockAccountData'
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
  { id: 'security', label: 'Security' },
]

function AccountPageContent() {
  const { user } = useAuth()
  const [tab, setTab] = useState<AccountTabId>('profile')

  const displayName = user?.displayName ?? 'Guest'
  const email = user?.email ?? ''
  const photoUrl = user?.photoUrl
  const organization = user?.teamName ?? MOCK_ACCOUNT_PROFILE.organization

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
        {tab === 'usage' ? <AccountUsagePanel /> : null}
        {tab === 'subscription' ? <AccountSubscriptionPanel /> : null}
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
