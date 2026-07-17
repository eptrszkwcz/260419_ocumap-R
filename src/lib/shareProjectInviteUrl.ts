export type ShareAccessLevel = 'readOnly' | 'readComment' | 'fullAccess'

export function shareProjectInviteUrl(projectId: string, access: ShareAccessLevel): string {
  return `${window.location.origin}/invite/${encodeURIComponent(projectId)}?access=${access}`
}
