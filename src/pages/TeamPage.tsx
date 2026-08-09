import { useState } from 'react'

import { PanelTabRow, type TabItem } from '@/components/PanelTabRow'
import { useAuth } from '@/context/AuthContext'
import { MOCK_TEAM } from '@/data/mockTeamData'
import { TeamCollaboratorsPanel } from '@/pages/team/TeamCollaboratorsPanel'
import { TeamMembersPanel } from '@/pages/team/TeamMembersPanel'
import { TeamRolesPanel } from '@/pages/team/TeamRolesPanel'
import type { TeamTabId } from '@/pages/team/types'
import { UserSectionPage } from '@/pages/UserSectionPage'

const teamTabs: TabItem[] = [
  { id: 'members', label: 'Members' },
  { id: 'collaborators', label: 'Collaborators' },
  { id: 'roles', label: 'Roles' },
]

function TeamPageContent() {
  const { user } = useAuth()
  const [tab, setTab] = useState<TeamTabId>('members')
  const teamName = user?.teamName ?? MOCK_TEAM.name

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <PanelTabRow
        tabs={teamTabs}
        activeId={tab}
        onSelect={(id) => setTab(id as TeamTabId)}
        aria-label="Team sections"
        variant="buttons"
      />
      <div className="mt-10 min-h-0 flex-1 overflow-y-auto pb-6">
        {tab === 'members' ? <TeamMembersPanel teamName={teamName} /> : null}
        {tab === 'collaborators' ? <TeamCollaboratorsPanel /> : null}
        {tab === 'roles' ? <TeamRolesPanel /> : null}
      </div>
    </div>
  )
}

export function TeamPage() {
  return (
    <UserSectionPage title="Team">
      <TeamPageContent />
    </UserSectionPage>
  )
}
