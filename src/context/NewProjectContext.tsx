import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'

import { useProjects } from '@/context/ProjectsContext'
import { NEW_PROJECT_ID, type ProjectRecord, type ProjectType } from '@/data/sampleProjects'
import { todayIsoDate } from '@/lib/formatDisplayDateFromIsoDate'
import {
  createEmptyProjectDetailsDraft,
  draftToProfile,
  type ProjectDetailsDraft,
} from '@/panels/library/projectDetails/types'

export type NewProjectDraft = {
  name: string
  location: string
  organizationType: ProjectType | null
  profileDraft: ProjectDetailsDraft
}

function emptyDraft(): NewProjectDraft {
  return {
    name: '',
    location: '',
    organizationType: null,
    profileDraft: createEmptyProjectDetailsDraft(),
  }
}

type NewProjectContextValue = {
  draft: NewProjectDraft
  setDraft: (draft: NewProjectDraft) => void
  setName: (name: string) => void
  setLocation: (location: string) => void
  setOrganizationType: (type: ProjectType) => void
  setProfileDraft: (profileDraft: ProjectDetailsDraft) => void
  canCreate: boolean
  resetDraft: () => void
  cancelNewProject: () => void
  commitNewProject: () => string
  syntheticProjectRecord: ProjectRecord
}

const NewProjectContext = createContext<NewProjectContextValue | null>(null)

export function NewProjectProvider({
  children,
  isNewProject,
}: {
  children: ReactNode
  isNewProject: boolean
}) {
  const navigate = useNavigate()
  const { createProject } = useProjects()
  const [draft, setDraft] = useState<NewProjectDraft>(emptyDraft)

  useEffect(() => {
    if (isNewProject) {
      setDraft(emptyDraft())
    }
  }, [isNewProject])

  const setName = useCallback((name: string) => {
    setDraft((d) => ({ ...d, name }))
  }, [])

  const setLocation = useCallback((location: string) => {
    setDraft((d) => ({ ...d, location }))
  }, [])

  const setOrganizationType = useCallback((organizationType: ProjectType) => {
    setDraft((d) => ({ ...d, organizationType }))
  }, [])

  const setProfileDraft = useCallback((profileDraft: ProjectDetailsDraft) => {
    setDraft((d) => ({ ...d, profileDraft }))
  }, [])

  const resetDraft = useCallback(() => {
    setDraft(emptyDraft())
  }, [])

  const canCreate = useMemo(
    () =>
      draft.name.trim() !== '' &&
      draft.location.trim() !== '' &&
      draft.organizationType != null,
    [draft.name, draft.location, draft.organizationType],
  )

  const syntheticProjectRecord = useMemo(
    (): ProjectRecord => ({
      id: NEW_PROJECT_ID,
      name: draft.name.trim() || 'New Project',
      status: 'Draft',
      team: '',
      lastModified: '',
      featureFileCount: 0,
      createdRelative: 'Just now',
      createdIso: todayIsoDate(),
      projectType: draft.organizationType ?? 'Building',
    }),
    [draft.name, draft.organizationType],
  )

  const cancelNewProject = useCallback(() => {
    resetDraft()
    navigate('/projects')
  }, [navigate, resetDraft])

  const commitNewProject = useCallback((): string => {
    if (!canCreate || draft.organizationType == null) {
      throw new Error('Cannot create project: required fields missing')
    }
    const profile = draftToProfile(draft.profileDraft)
    const record = createProject({
      name: draft.name.trim(),
      location: draft.location.trim(),
      projectType: draft.organizationType,
      profile,
    })
    resetDraft()
    return record.id
  }, [canCreate, createProject, draft, resetDraft])

  const value = useMemo(
    (): NewProjectContextValue => ({
      draft,
      setDraft,
      setName,
      setLocation,
      setOrganizationType,
      setProfileDraft,
      canCreate,
      resetDraft,
      cancelNewProject,
      commitNewProject,
      syntheticProjectRecord,
    }),
    [
      draft,
      setName,
      setLocation,
      setOrganizationType,
      setProfileDraft,
      canCreate,
      resetDraft,
      cancelNewProject,
      commitNewProject,
      syntheticProjectRecord,
    ],
  )

  return <NewProjectContext.Provider value={value}>{children}</NewProjectContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useNewProject(): NewProjectContextValue {
  const ctx = useContext(NewProjectContext)
  if (ctx == null) {
    throw new Error('useNewProject must be used within NewProjectProvider')
  }
  return ctx
}

// eslint-disable-next-line react-refresh/only-export-components -- optional hook for non-create views
export function useNewProjectOptional(): NewProjectContextValue | null {
  return useContext(NewProjectContext)
}
