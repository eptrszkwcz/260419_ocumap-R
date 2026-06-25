import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'
import { featureMetadataInputClassName } from '@/panels/library/featureMetadata/styles'
import { AuthFormLayout, AuthFormLink, authFormLabelClass } from '@/pages/auth/AuthFormLayout'

export function SignupPage() {
  const navigate = useNavigate()
  const { user, signup } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  if (user != null) {
    return <Navigate to="/projects" replace />
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      displayName.trim() === '' ||
      email.trim() === '' ||
      password.trim() === '' ||
      confirmPassword.trim() === ''
    ) {
      return
    }

    signup(displayName, email, password)
    navigate('/projects', { replace: true })
  }

  return (
    <AuthFormLayout
      title="Create account"
      subtitle="Sign up to start using OcuMap."
      onSubmit={handleSubmit}
      submitLabel="Create account"
      footer={
        <p className="text-fg-muted">
          Already have an account? <AuthFormLink to="/login">Sign in</AuthFormLink>
        </p>
      }
    >
      <label className="block min-w-0">
        <span className={authFormLabelClass}>Display name</span>
        <input
          type="text"
          className={featureMetadataInputClassName}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="John Smith"
          autoComplete="name"
          required
        />
      </label>
      <label className="block min-w-0">
        <span className={authFormLabelClass}>Email</span>
        <input
          type="email"
          className={featureMetadataInputClassName}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
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
          placeholder="Create a password"
          autoComplete="new-password"
          required
        />
      </label>
      <label className="block min-w-0">
        <span className={authFormLabelClass}>Confirm password</span>
        <input
          type="password"
          className={featureMetadataInputClassName}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          autoComplete="new-password"
          required
        />
      </label>
    </AuthFormLayout>
  )
}
