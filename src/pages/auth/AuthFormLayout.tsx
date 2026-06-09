import type { FormEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Panel } from '@/components/Panel'
import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'

export const authFormLabelClass =
  'text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide'

export const authFormSubmitClass = `${PRIMARY_BUTTON_CLASS} h-button w-full rounded-panel px-4 text-standard font-sans`

type AuthFormLayoutProps = {
  title: string
  subtitle?: string
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  submitLabel: string
  showSubmit?: boolean
  children: ReactNode
  footer?: ReactNode
}

export function AuthFormLayout({
  title,
  subtitle,
  onSubmit,
  submitLabel,
  showSubmit = true,
  children,
  footer,
}: AuthFormLayoutProps) {
  return (
    <div className="bg-page flex h-full min-h-0 items-center justify-center p-page">
      <Panel className="w-full max-w-md p-panel-padding shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img
            src="/brand/ocumap-o-logo.svg"
            alt="OcuMap"
            className="h-9 w-auto"
            width={33}
            height={40}
          />
          <div>
            <h1 className="font-title text-title font-bold text-fg">{title}</h1>
            {subtitle != null && subtitle !== '' ? (
              <p className="mt-2 font-sans text-standard text-fg-muted">{subtitle}</p>
            ) : null}
          </div>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          {children}
          {showSubmit ? (
            <button type="submit" className={authFormSubmitClass}>
              {submitLabel}
            </button>
          ) : null}
        </form>

        {footer != null ? (
          <div className="mt-6 flex flex-col gap-2 text-center font-sans text-standard">
            {footer}
          </div>
        ) : null}
      </Panel>
    </div>
  )
}

export function AuthFormLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="text-fg-highlight hover:underline">
      {children}
    </Link>
  )
}
