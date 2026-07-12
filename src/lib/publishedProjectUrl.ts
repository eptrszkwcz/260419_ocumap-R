export function publishedProjectUrl(projectId: string): string {
  return `${window.location.origin}/published/${encodeURIComponent(projectId)}`
}

export function openPublishedProjectInNewTab(projectId: string): void {
  window.open(publishedProjectUrl(projectId), '_blank', 'noopener')
}
