import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'
import { featureMetadataInputClassName } from '@/panels/library/featureMetadata/styles'
import { AuthFormLayout, AuthFormLink, authFormLabelClass } from '@/pages/auth/AuthFormLayout'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, login } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')

  if (user != null) {
    return <Navigate to="/projects" replace />
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (displayName.trim() === '' || password.trim() === '') return

    login(displayName, password)

    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
    navigate(from ?? '/projects', { replace: true })
  }

  return (
    <AuthFormLayout
      title="Sign in"
      subtitle="Enter your credentials to access OcuMap."
      onSubmit={handleSubmit}
      submitLabel="Sign in"
      footer={
        <>
          <p className="text-fg-muted">
            Don&apos;t have an account?{' '}
            <AuthFormLink to="/signup">Create an account</AuthFormLink>
          </p>
          <p>
            <AuthFormLink to="/reset-password">Reset your password</AuthFormLink>
          </p>
        </>
      }
    >
      <label className="block min-w-0">
        <span className={authFormLabelClass}>Name or email</span>
        <input
          type="text"
          className={featureMetadataInputClassName}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="John Smith"
          autoComplete="username"
          required
        />
      </label>
      <label className="block min-w-0">
        <span className={authFormLabelClass}>Password</span>
        <input
          type="password"
          className={featureMetadataInputClassName}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />
      </label>
    </AuthFormLayout>
  )
}
