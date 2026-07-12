import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import type { DemoProjectDetailsProfile } from '@/data/sampleProjectProfile'
import { getProjectDetailsProfile } from '@/data/sampleProjectProfile'
import {
  KATY_FREEWAY_MAPBOX_STYLE,
  sampleProjects,
  type ProjectRecord,
  type ProjectType,
} from '@/data/sampleProjects'
import { formatDisplayDateFromIsoDate, todayIsoDate } from '@/lib/formatDisplayDateFromIsoDate'

export type CreateProjectInput = {
  name: string
  location: string
  projectType: ProjectType
  profile: DemoProjectDetailsProfile
}

type ProjectsContextValue = {
  projects: ProjectRecord[]
  getProjectById: (id: string) => ProjectRecord | undefined
  getProjectProfile: (id: string) => DemoProjectDetailsProfile
  createProject: (input: CreateProjectInput) => ProjectRecord
  updateProjectProfile: (id: string, profile: DemoProjectDetailsProfile) => void
  publishProject: (id: string) => void
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null)

function generateProjectId(): string {
  return `p-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

function todayDisplayDate(): string {
  return formatDisplayDateFromIsoDate(todayIsoDate())
}

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectRecord[]>(() => [...sampleProjects])
  const [profilesById, setProfilesById] = useState<Record<string, DemoProjectDetailsProfile>>({})

  const getProjectById = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects],
  )

  const getProjectProfile = useCallback(
    (id: string): DemoProjectDetailsProfile => {
      if (profilesById[id] != null) return profilesById[id]
      return getProjectDetailsProfile(id)
    },
    [profilesById],
  )

  const createProject = useCallback((input: CreateProjectInput): ProjectRecord => {
    const id = generateProjectId()
    const today = todayDisplayDate()
    const record: ProjectRecord = {
      id,
      name: input.name.trim(),
      status: 'Draft',
      team: input.profile.identifiers.clientName.trim() || '',
      lastModified: today,
      featureFileCount: 0,
      projectSizeMb: 0,
      createdRelative: 'Just now',
      createdIso: todayIsoDate(),
      projectType: input.projectType,
      ...(input.projectType === 'Infrastructure'
        ? {
            mapboxStyleUrl: KATY_FREEWAY_MAPBOX_STYLE,
            mapCenterLat: 29.786,
            mapCenterLng: -95.794,
          }
        : {}),
    }
    const primaryLine = input.location.trim()
    const extraLines = input.profile.location.addressLines
      .slice(1)
      .filter((line) => line.trim() !== '')
    const profile: DemoProjectDetailsProfile = {
      ...input.profile,
      location: {
        ...input.profile.location,
        addressLines: primaryLine
          ? [primaryLine, ...extraLines]
          : extraLines,
      },
    }
    setProjects((prev) => [record, ...prev])
    setProfilesById((prev) => ({ ...prev, [id]: profile }))
    return record
  }, [])

  const updateProjectProfile = useCallback((id: string, profile: DemoProjectDetailsProfile) => {
    setProfilesById((prev) => ({ ...prev, [id]: profile }))
  }, [])

  const publishProject = useCallback((id: string) => {
    const today = todayDisplayDate()
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: 'Published' as const, publishedDate: today, lastModified: today } : p,
      ),
    )
  }, [])

  const value = useMemo(
    (): ProjectsContextValue => ({
      projects,
      getProjectById,
      getProjectProfile,
      createProject,
      updateProjectProfile,
      publishProject,
    }),
    [projects, getProjectById, getProjectProfile, createProject, updateProjectProfile, publishProject],
  )

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useProjects(): ProjectsContextValue {
  const ctx = useContext(ProjectsContext)
  if (ctx == null) {
    throw new Error('useProjects must be used within ProjectsProvider')
  }
  return ctx
}
