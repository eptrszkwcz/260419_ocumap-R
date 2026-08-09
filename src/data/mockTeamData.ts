import type {
  CollaboratorPendingInvite,
  TeamCollaborator,
  TeamMember,
  TeamPermissionRow,
} from '@/pages/team/types'

export const MOCK_TEAM = {
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
  ] satisfies TeamMember[],
} as const

export const MOCK_COLLABORATORS: TeamCollaborator[] = [
  {
    id: 'c1',
    name: 'Patricia Nguyen',
    email: 'patricia.nguyen@westfield-consulting.com',
    access: 'Viewer',
    projectNames: ['1603 Jefferson St.'],
  },
  {
    id: 'c2',
    name: 'Robert Walsh',
    email: 'rwalsh@cityplanning.gov',
    access: 'Viewer',
    projectNames: ['Harborview Medical Tower'],
  },
  {
    id: 'c3',
    name: 'Diana Brooks',
    email: 'd.brooks@structuralpartners.io',
    access: 'Editor',
    projectNames: ['1603 Jefferson St.'],
  },
  {
    id: 'c4',
    name: 'James Okonkwo',
    email: 'jokonkwo@buildreview.com',
    access: 'Viewer',
    projectNames: ['Riverside School Modernization'],
  },
  {
    id: 'c5',
    name: 'Linda Martinez',
    email: 'linda.m@insurance-adj.com',
    access: 'Viewer',
    projectNames: ['City Hall North Wing'],
  },
  {
    id: 'c6',
    name: 'Thomas Reid',
    email: 'treid@txdot-contractors.net',
    access: 'Editor',
    projectNames: ['Katy Freeway Expansion'],
  },
  {
    id: 'c7',
    name: 'Karen Hoffman',
    email: 'khoffman@records-mgmt.com',
    access: 'Viewer',
    projectNames: ['Westside Document Archive'],
  },
  {
    id: 'c8',
    name: 'Daniel Cho',
    email: 'dcho@acme-inspections.com',
    access: 'Viewer',
    projectNames: ['1603 Jefferson St.'],
  },
  {
    id: 'c9',
    name: 'Emily Foster',
    email: 'emily.foster@client-rep.com',
    access: 'Viewer',
    projectNames: ['Harborview Medical Tower', 'Riverside School Modernization'],
  },
  {
    id: 'c10',
    name: 'Gregory Tan',
    email: 'gtan@surveyworks.co',
    access: 'Viewer',
    projectNames: ['Katy Freeway Expansion'],
  },
  {
    id: 'c11',
    name: 'Michelle Park',
    email: 'mpark@env-compliance.org',
    access: 'Viewer',
    projectNames: [
      '1603 Jefferson St.',
      'Harborview Medical Tower',
      'City Hall North Wing',
    ],
  },
  {
    id: 'c12',
    name: 'William Hayes',
    email: 'whayes@legal-counsel.com',
    access: 'Viewer',
    projectNames: ['Westside Document Archive'],
  },
]

export const MOCK_COLLABORATOR_PENDING_INVITES: CollaboratorPendingInvite[] = [
  {
    id: 'i1',
    email: 'john@abc.com',
    access: 'Viewer',
    projectNames: ['1603 Jefferson St.'],
    invitedLabel: 'Aug 7',
  },
  {
    id: 'i2',
    email: 'maria@abc.com',
    access: 'Editor',
    projectNames: ['Harborview Medical Tower'],
    invitedLabel: 'Aug 6',
  },
]

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
