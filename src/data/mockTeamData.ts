import type { TeamMember, TeamPermissionRow } from '@/pages/team/types'

export type MockTeam = {
  name: string
  planLabel: string
  adminName: string
  createdLabel: string
  members: TeamMember[]
}

export const MOCK_TEAM: MockTeam = {
  name: 'Smith Property Group',
  planLabel: 'Professional plan',
  adminName: 'Jordy Smith',
  createdLabel: 'January 2025',
  members: [
    {
      id: 'm1',
      name: 'Jordy Smith',
      email: 'shredder@smith.co',
      role: 'Admin',
      access: 'Full access',
      lastActive: 'Today',
    },
    {
      id: 'm2',
      name: 'Eric Jones',
      email: 'eric.jones@smith.co',
      role: 'Member',
      access: 'Full access',
      lastActive: 'Today',
    },
    {
      id: 'm3',
      name: 'Sarah Lee',
      email: 'sarah.lee@smith.co',
      role: 'Member',
      access: 'Full access',
      lastActive: 'Yesterday',
    },
    {
      id: 'm4',
      name: 'Mike Chen',
      email: 'mike.chen@smith.co',
      role: 'Member',
      access: 'Viewer',
      lastActive: 'Aug 4',
    },
    {
      id: 'm5',
      name: 'Alex Rivera',
      email: 'alex.rivera@smith.co',
      role: 'Member',
      access: 'Full access',
      lastActive: 'Aug 2',
    },
  ],
}

export const MOCK_TAJ_TEAM: MockTeam = {
  name: 'Burrows',
  planLabel: 'Free plan',
  adminName: 'Taj Burrows',
  createdLabel: 'August 2026',
  members: [],
}

export function getMockTeam(planId?: string): MockTeam {
  return planId === 'free-trial' ? MOCK_TAJ_TEAM : MOCK_TEAM
}

export const TEAM_ROLE_COLUMNS = [
  { id: 'admin', label: 'Admin' },
  { id: 'editor', label: 'Editor' },
  { id: 'viewer', label: 'Viewer' },
] as const

export const TEAM_ROLE_PERMISSION_ROWS: TeamPermissionRow[] = [
  {
    label: 'Manage team members',
    values: { admin: 'check', editor: 'dash', viewer: 'dash' },
  },
  {
    label: 'Manage permissions',
    values: { admin: 'check', editor: 'dash', viewer: 'dash' },
  },
  {
    label: 'Manage billing',
    values: { admin: 'check', editor: 'dash', viewer: 'dash' },
  },
  {
    label: 'Create/delete projects',
    values: { admin: 'check', editor: 'dash', viewer: 'dash' },
  },
  {
    label: 'Create/edit maps',
    values: { admin: 'check', editor: 'check', viewer: 'dash' },
  },
  {
    label: 'Upload datasets',
    values: { admin: 'check', editor: 'check', viewer: 'dash' },
  },
  {
    label: 'Edit projects',
    values: { admin: 'check', editor: 'check', viewer: 'dash' },
  },
  {
    label: 'Run analyses',
    values: { admin: 'check', editor: 'check', viewer: 'dash' },
  },
  {
    label: 'Export data',
    values: { admin: 'check', editor: 'check', viewer: 'dash' },
  },
  {
    label: 'View maps / datasets / projects',
    values: { admin: 'check', editor: 'check', viewer: 'check' },
  },
]
