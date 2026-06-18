import type { ProjectRecord } from '@/data/sampleProjects'
import { ProjectActionsMenu } from '@/pages/projects/ProjectActionsMenu'

type ProjectRowMenuProps = {
  project: ProjectRecord
}

export function ProjectRowMenu({ project }: ProjectRowMenuProps) {
  return (
    <ProjectActionsMenu project={project} includeDetails stopTriggerPropagation />
  )
}
