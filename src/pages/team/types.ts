export type TeamTabId = 'members' | 'roles'

export type TeamMemberRole = 'Admin' | 'Member'

export type TeamAccessLevel = 'Full access' | 'Editor' | 'Viewer'

export type TeamPermissionRoleId = 'admin' | 'editor' | 'viewer'

export type TeamMember = {
  id: string
  name: string
  email: string
  role: TeamMemberRole
  access: TeamAccessLevel
  lastActive: string
}

export type TeamPermissionCell = 'check' | 'dash'

export type TeamPermissionRow = {
  label: string
  values: Record<TeamPermissionRoleId, TeamPermissionCell>
}
