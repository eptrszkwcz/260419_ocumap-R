import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type { SubscriptionPlanId } from '@/data/mockAccountData'
import {
  isTajLogin,
  MOCK_DEFAULT_USER,
  MOCK_TAJ_USER,
  type MockUserProfile,
} from '@/data/mockUserProfile'

const STORAGE_KEY = 'ocumap-auth-user'

function mockEmailForDisplayName(displayName: string): string {
  const slug = displayName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
  return `${slug || 'user'}@atlaspm.com`
}

export type AuthUser = {
  displayName: string
  email?: string
  photoUrl?: string
  teamName?: string
  planId?: SubscriptionPlanId
}

function authUserFromProfile(profile: MockUserProfile): AuthUser {
  return {
    displayName: profile.displayName,
    email: profile.email,
    photoUrl: profile.photoUrl,
    teamName: profile.teamName,
    planId: profile.planId,
  }
}

type AuthContextValue = {
  user: AuthUser | null
  login: (displayName: string, password: string) => void
  signup: (displayName: string, email: string, password: string) => void
  logout: () => void
  resetPassword: (email: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthUser
    if (typeof parsed.displayName !== 'string' || parsed.displayName.trim() === '') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeStoredUser(user: AuthUser | null) {
  if (user == null) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())

  const login = useCallback((displayName: string, password: string) => {
    const profile = isTajLogin(displayName, password) ? MOCK_TAJ_USER : MOCK_DEFAULT_USER
    const nextUser = authUserFromProfile(profile)
    setUser(nextUser)
    writeStoredUser(nextUser)
  }, [])

  const signup = useCallback((displayName: string, email: string, _password: string) => {
    const trimmedName = displayName.trim()
    const trimmedEmail = email.trim()
    const nextUser: AuthUser = {
      displayName: trimmedName,
      email: trimmedEmail || mockEmailForDisplayName(trimmedName),
    }
    setUser(nextUser)
    writeStoredUser(nextUser)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    writeStoredUser(null)
  }, [])

  const resetPassword = useCallback((email: string) => {
    return email.trim() !== ''
  }, [])

  const value = useMemo(
    () => ({ user, login, signup, logout, resetPassword }),
    [user, login, signup, logout, resetPassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx == null) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
