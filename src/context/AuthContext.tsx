import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { MOCK_DEFAULT_USER } from '@/data/mockUserProfile'

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

  const login = useCallback((_displayName: string, _password: string) => {
    const nextUser: AuthUser = {
      displayName: MOCK_DEFAULT_USER.displayName,
      email: MOCK_DEFAULT_USER.email,
      photoUrl: MOCK_DEFAULT_USER.photoUrl,
    }
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
