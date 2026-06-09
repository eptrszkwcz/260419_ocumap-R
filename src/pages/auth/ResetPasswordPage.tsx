import { useState, type FormEvent } from 'react'

import { useAuth } from '@/context/AuthContext'
import { featureMetadataInputClassName } from '@/panels/library/featureMetadata/styles'
import { AuthFormLayout, AuthFormLink, authFormLabelClass } from '@/pages/auth/AuthFormLayout'

export function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (email.trim() === '') return

    const ok = resetPassword(email)
    if (ok) {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <AuthFormLayout
        title="Check your email"
        subtitle="If an account exists for that address, a reset link has been sent."
        onSubmit={(e) => e.preventDefault()}
        submitLabel=""
        showSubmit={false}
        footer={
          <p>
            <AuthFormLink to="/login">Back to sign in</AuthFormLink>
          </p>
        }
      >
        <p className="font-sans text-standard text-fg-muted">
          Didn&apos;t receive an email? Check your spam folder or try again with a different
          address.
        </p>
      </AuthFormLayout>
    )
  }

  return (
    <AuthFormLayout
      title="Reset password"
      subtitle="Enter your email and we will send you a reset link."
      onSubmit={handleSubmit}
      submitLabel="Send reset link"
      footer={
        <p>
          <AuthFormLink to="/login">Back to sign in</AuthFormLink>
        </p>
      }
    >
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
    </AuthFormLayout>
  )
}
