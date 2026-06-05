import type { ProjectRecord } from '@/data/sampleProjects'
import {
  DEFAULT_FLOOR_PLAN_ID,
  floorPlanImageSrc,
  getFloorPlanOptionsForProject,
} from '@/panels/map/mapFloorPlans'

import { ProjectFolderThumbnail } from '@/pages/projects/ProjectFolderThumbnail'
import { ProjectMapThumbnail } from '@/pages/projects/ProjectMapThumbnail'

type ProjectThumbnailTileProps = {
  project: ProjectRecord
}

function thumbnailTileBackgroundClass(projectType: ProjectRecord['projectType']): string {
  return projectType === 'Building' || projectType === 'FilesOnly' ? 'bg-panel' : 'bg-area-highlight'
}

function ProjectThumbnailVisual({ project }: ProjectThumbnailTileProps) {
  if (project.projectType === 'Building') {
    const options = getFloorPlanOptionsForProject(project.id)
    if (options.length > 0) {
      return (
        <img
          src={floorPlanImageSrc(DEFAULT_FLOOR_PLAN_ID)}
          alt=""
          className="size-full object-contain"
          decoding="async"
          draggable={false}
        />
      )
    }
    return (
      <div className="text-fg-muted flex size-full items-center justify-center text-badge">
        Floor plan
      </div>
    )
  }

  if (project.projectType === 'Infrastructure') {
    return (
      <ProjectMapThumbnail
        styleUrl={project.mapboxStyleUrl}
        lat={project.mapCenterLat}
        lng={project.mapCenterLng}
      />
    )
  }

  return <ProjectFolderThumbnail className="size-16" />
}

type ProjectsThumbnailGridProps = {
  projects: ProjectRecord[]
  onOpenProject?: (project: ProjectRecord) => void
}

export function ProjectsThumbnailGrid({ projects, onOpenProject }: ProjectsThumbnailGridProps) {
  return (
    <div className="min-h-0 w-full min-w-0 flex-1 overflow-auto px-panel-padding py-4">
      <div className="flex flex-wrap gap-4">
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            className="group flex w-[140px] shrink-0 flex-col gap-1.5 rounded-panel text-left transition-colors hover:bg-area-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-highlight/35"
            onClick={() => onOpenProject?.(project)}
          >
            <div
              className={`flex size-[140px] shrink-0 items-center justify-center overflow-hidden rounded-panel border border-transparent transition-colors group-hover:border-fg-highlight group-focus-visible:border-fg-highlight ${thumbnailTileBackgroundClass(project.projectType)}`}
            >
              <ProjectThumbnailVisual project={project} />
            </div>
            <span className="text-fg group-hover:text-fg-highlight block truncate text-standard group-hover:font-semibold">
              {project.name}
            </span>
            <span className="text-fg-muted group-hover:text-fg-highlight block truncate text-badge">
              {project.team}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
