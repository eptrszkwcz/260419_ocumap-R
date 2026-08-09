export type TeamTabId = 'members' | 'collaborators' | 'roles'

export type TeamMemberRole = 'Admin' | 'Member'

export type TeamAccessLevel = 'Full access' | 'Editor' | 'Viewer'

export type CollaboratorAccessLevel = 'Viewer' | 'Editor'

export type TeamPermissionRoleId = 'admin' | 'editor' | 'viewer'

export type TeamMember = {
  id: string
  name: string
  email: string
  role: TeamMemberRole
  access: TeamAccessLevel
  lastActive: string
}

export type TeamCollaborator = {
  id: string
  name: string
  email: string
  access: CollaboratorAccessLevel
  projectNames: string[]
}

export type CollaboratorPendingInvite = {
  id: string
  email: string
  access: CollaboratorAccessLevel
  projectNames: string[]
  invitedLabel: string
}

export type TeamPermissionCell = 'check' | 'dash'

export type TeamPermissionRow = {
  label: string
  values: Record<TeamPermissionRoleId, TeamPermissionCell>
}
