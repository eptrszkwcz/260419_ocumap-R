import { PlusIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

import { FreePlanUpgradeBanner } from '@/components/FreePlanUpgradeBanner'
import { useAuth } from '@/context/AuthContext'
import { getMockTeam } from '@/data/mockTeamData'
import {
  accountPrimaryButtonClass,
  accountSectionClass,
  accountSectionDescClass,
  accountSectionTitleClass,
} from '@/pages/account/accountStyles'
import { TeamMemberActionsMenu } from '@/pages/team/TeamMemberActionsMenu'
import type { TeamAccessLevel, TeamMember, TeamMemberRole } from '@/pages/team/types'

type TeamMembersPanelProps = {
  teamName: string
}

export function TeamMembersPanel({ teamName }: TeamMembersPanelProps) {
  const { user } = useAuth()
  const team = getMockTeam(user?.planId)
  const { planLabel, adminName, createdLabel } = team
  const [members, setMembers] = useState<TeamMember[]>(() =>
    team.members.map((member) => ({ ...member })),
  )
  const memberCount = members.length

  const handleChangeRole = (
    memberId: string,
    role: TeamMemberRole,
    access: TeamAccessLevel,
  ) => {
    setMembers((current) =>
      current.map((member) =>
        member.id === memberId ? { ...member, role, access } : member,
      ),
    )
  }

  const handleRemoveMember = (memberId: string) => {
    setMembers((current) => current.filter((member) => member.id !== memberId))
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-2">
      <FreePlanUpgradeBanner
        bannerId="team-members"
        message="Your Free plan includes 1 seat. Upgrade to invite collaborators."
      />
      <section className={accountSectionClass} aria-labelledby="team-overview">
        <div>
          <h2 id="team-overview" className={accountSectionTitleClass}>
            {teamName}
          </h2>
          <p className={`mt-1 ${accountSectionDescClass}`}>
            {memberCount} members · {planLabel}
          </p>
        </div>
        <div className="font-sans text-standard text-fg-muted">
          <p>
            Team admin: <span className="font-bold text-fg">{adminName}</span>
          </p>
          <p className="mt-1">Created: {createdLabel}</p>
        </div>
      </section>

      <section className={accountSectionClass} aria-labelledby="team-members">
        <div className="flex items-start justify-between gap-4">
          <h2 id="team-members" className={accountSectionTitleClass}>
            Members
          </h2>
          <button
            type="button"
            className={`${accountPrimaryButtonClass} inline-flex shrink-0 items-center gap-1.5`}
          >
            <PlusIcon className="size-4 shrink-0" aria-hidden />
            Add team member
          </button>
        </div>
        <div className="overflow-x-auto rounded-panel border border-stroke bg-panel">
          <table className="w-full min-w-[48rem] border-collapse bg-panel font-sans text-standard">
            <thead>
              <tr className="border-b border-stroke bg-area-highlight/40 text-left">
                <th className="px-4 py-2.5 font-bold text-fg">Member</th>
                <th className="px-4 py-2.5 font-bold text-fg">Email</th>
                <th className="px-4 py-2.5 font-bold text-fg">Role</th>
                <th className="px-4 py-2.5 font-bold text-fg">Access</th>
                <th className="px-4 py-2.5 font-bold text-fg">Last active</th>
                <th className="px-4 py-2.5 text-right font-bold text-fg">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center font-sans text-standard text-fg-muted"
                  >
                    No team members
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="border-b border-stroke/60 last:border-b-0">
                    <td className="px-4 py-2.5 font-bold text-fg">{member.name}</td>
                    <td className="px-4 py-2.5 text-fg-muted">{member.email}</td>
                    <td className="px-4 py-2.5 text-fg-muted">{member.role}</td>
                    <td className="px-4 py-2.5 text-fg-muted">{member.access}</td>
                    <td className="px-4 py-2.5 text-fg-muted">{member.lastActive}</td>
                    <td className="px-4 py-2.5 text-right">
                      <TeamMemberActionsMenu
                        member={member}
                        onChangeRole={handleChangeRole}
                        onRemove={handleRemoveMember}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
