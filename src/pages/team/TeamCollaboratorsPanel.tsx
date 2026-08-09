import { useState } from 'react'

import {
  MOCK_COLLABORATOR_PENDING_INVITES,
  MOCK_COLLABORATORS,
} from '@/data/mockTeamData'
import {
  accountSectionClass,
  accountSectionDescClass,
  accountSectionTitleClass,
} from '@/pages/account/accountStyles'
import { TeamCollaboratorActionsMenu } from '@/pages/team/TeamCollaboratorActionsMenu'
import type {
  CollaboratorAccessLevel,
  CollaboratorPendingInvite,
  TeamCollaborator,
} from '@/pages/team/types'
import { badgeClassName } from '@/panels/library/FeatureLibraryBadges'

const pendingInviteActionButtonClass =
  'text-fg-muted hover:text-fg-highlight inline-flex cursor-pointer items-center font-sans text-standard font-bold transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

function ProjectNameBadges({ projectNames }: { projectNames: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {projectNames.map((name) => (
        <span key={name} className={`${badgeClassName} max-w-[14rem] truncate`} title={name}>
          {name}
        </span>
      ))}
    </div>
  )
}

export function TeamCollaboratorsPanel() {
  const [collaborators, setCollaborators] = useState<TeamCollaborator[]>(() =>
    MOCK_COLLABORATORS.map((collaborator) => ({ ...collaborator })),
  )
  const [pendingInvites, setPendingInvites] = useState<CollaboratorPendingInvite[]>(() =>
    MOCK_COLLABORATOR_PENDING_INVITES.map((invite) => ({ ...invite })),
  )

  const handleChangeAccess = (collaboratorId: string, access: CollaboratorAccessLevel) => {
    setCollaborators((current) =>
      current.map((collaborator) =>
        collaborator.id === collaboratorId ? { ...collaborator, access } : collaborator,
      ),
    )
  }

  const handleRemoveCollaborator = (collaboratorId: string) => {
    setCollaborators((current) =>
      current.filter((collaborator) => collaborator.id !== collaboratorId),
    )
  }

  const handleCancelInvite = (inviteId: string) => {
    setPendingInvites((current) => current.filter((invite) => invite.id !== inviteId))
  }

  const handleResendInvite = (_inviteId: string) => undefined

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-2">
      <section className={accountSectionClass} aria-labelledby="team-collaborators-intro">
        <h2 id="team-collaborators-intro" className={accountSectionTitleClass}>
          Collaborators
        </h2>
        <p className={accountSectionDescClass}>
          Users outside your team invited to contribute to specific projects. Collaborators are not
          full team members and only have access to the projects listed below.
        </p>
      </section>

      <section className={accountSectionClass} aria-labelledby="team-collaborators-list">
        <h2 id="team-collaborators-list" className="sr-only">
          Collaborator list
        </h2>
        <div className="overflow-x-auto rounded-panel border border-stroke bg-panel">
          <table className="w-full min-w-[52rem] border-collapse bg-panel font-sans text-standard">
            <thead>
              <tr className="border-b border-stroke bg-area-highlight/40 text-left">
                <th className="px-4 py-2.5 font-bold text-fg">Collaborator</th>
                <th className="px-4 py-2.5 font-bold text-fg">Email</th>
                <th className="px-4 py-2.5 font-bold text-fg">Access</th>
                <th className="px-4 py-2.5 font-bold text-fg">Project(s)</th>
                <th className="px-4 py-2.5 text-right font-bold text-fg">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {collaborators.map((collaborator) => (
                <tr key={collaborator.id} className="border-b border-stroke/60 last:border-b-0">
                  <td className="px-4 py-2.5 font-bold text-fg">{collaborator.name}</td>
                  <td className="px-4 py-2.5 text-fg-muted">{collaborator.email}</td>
                  <td className="px-4 py-2.5 text-fg-muted">{collaborator.access}</td>
                  <td className="px-4 py-2.5">
                    <ProjectNameBadges projectNames={collaborator.projectNames} />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <TeamCollaboratorActionsMenu
                      collaborator={collaborator}
                      onChangeAccess={handleChangeAccess}
                      onRemove={handleRemoveCollaborator}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {pendingInvites.length > 0 ? (
        <section className={accountSectionClass} aria-labelledby="team-collaborator-pending-invites">
          <h2 id="team-collaborator-pending-invites" className={accountSectionTitleClass}>
            Pending invitations
          </h2>
          <div className="overflow-x-auto rounded-panel border border-stroke bg-panel">
            <table className="w-full min-w-[52rem] border-collapse bg-panel font-sans text-standard">
              <thead>
                <tr className="border-b border-stroke bg-area-highlight/40 text-left">
                  <th className="px-4 py-2.5 font-bold text-fg">Email</th>
                  <th className="px-4 py-2.5 font-bold text-fg">Access</th>
                  <th className="px-4 py-2.5 font-bold text-fg">Project(s)</th>
                  <th className="px-4 py-2.5 font-bold text-fg">Invited</th>
                  <th className="px-4 py-2.5 text-right font-bold text-fg">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingInvites.map((invite) => (
                  <tr key={invite.id} className="border-b border-stroke/60 last:border-b-0">
                    <td className="px-4 py-2.5 text-fg">{invite.email}</td>
                    <td className="px-4 py-2.5 text-fg-muted">{invite.access}</td>
                    <td className="px-4 py-2.5">
                      <ProjectNameBadges projectNames={invite.projectNames} />
                    </td>
                    <td className="px-4 py-2.5 text-fg-muted">{invite.invitedLabel}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="inline-flex items-center gap-1 whitespace-nowrap">
                        <button
                          type="button"
                          className={pendingInviteActionButtonClass}
                          onClick={() => handleResendInvite(invite.id)}
                        >
                          Resend
                        </button>
                        <span className="text-fg-muted font-bold" aria-hidden>
                          ·
                        </span>
                        <button
                          type="button"
                          className={pendingInviteActionButtonClass}
                          onClick={() => handleCancelInvite(invite.id)}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  )
}
