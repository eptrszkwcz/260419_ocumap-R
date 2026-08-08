import { useState } from 'react'

import { MOCK_SECURITY } from '@/data/mockAccountData'
import {
  accountPanelClass,
  accountPrimaryButtonClass,
  accountSecondaryButtonClass,
  accountSectionClass,
  accountSectionDescClass,
  accountSectionTitleClass,
} from '@/pages/account/accountStyles'

export function AccountSecurityPanel() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(MOCK_SECURITY.twoFactorEnabled)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-2">
      <section className={accountSectionClass} aria-labelledby="security-password">
        <div>
          <h2 id="security-password" className={accountSectionTitleClass}>
            Password
          </h2>
          <p className={`mt-1 ${accountSectionDescClass}`}>
            Update the password you use to sign in to OcuMap.
          </p>
        </div>
        <div className={`${accountPanelClass} flex flex-wrap items-center justify-between gap-3`}>
          <p>
            Status: <span className="font-bold">Enabled</span>
          </p>
          <button type="button" className={accountPrimaryButtonClass}>
            Change password
          </button>
        </div>
      </section>

      <section className={accountSectionClass} aria-labelledby="security-2fa">
        <div>
          <h2 id="security-2fa" className={accountSectionTitleClass}>
            Two-factor authentication
          </h2>
          <p className={`mt-1 ${accountSectionDescClass}`}>
            Add a second step when signing in to protect your account.
          </p>
        </div>
        <div className={`${accountPanelClass} flex flex-wrap items-center justify-between gap-3`}>
          <p>
            Status:{' '}
            <span className="font-bold">{twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
          </p>
          <button
            type="button"
            className={accountSecondaryButtonClass}
            onClick={() => setTwoFactorEnabled((prev) => !prev)}
          >
            {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>
      </section>

      <section className={accountSectionClass} aria-labelledby="security-passcode">
        <div>
          <h2 id="security-passcode" className={accountSectionTitleClass}>
            Passcode
          </h2>
          <p className={`mt-1 ${accountSectionDescClass}`}>
            Add a passcode for quick device unlock.
          </p>
        </div>
        <div className={`${accountPanelClass} flex flex-wrap items-center justify-between gap-3`}>
          <p>
            Status: <span className="font-bold">Disabled</span>
          </p>
          <button type="button" className={accountSecondaryButtonClass}>
            Add passcode
          </button>
        </div>
      </section>

      <section className={accountSectionClass} aria-labelledby="security-sessions">
        <div>
          <h2 id="security-sessions" className={accountSectionTitleClass}>
            Active sessions
          </h2>
          <p className={`mt-1 ${accountSectionDescClass}`}>
            {MOCK_SECURITY.activeSessions.length} devices currently signed in.
          </p>
        </div>
        <ul className="overflow-hidden rounded-panel border border-stroke bg-panel">
          {MOCK_SECURITY.activeSessions.map((session) => (
            <li
              key={session.id}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b border-stroke/60 px-4 py-3 font-sans text-standard last:border-b-0"
            >
              <div>
                <p className="font-bold text-fg">{session.device}</p>
                <p className="mt-0.5 text-fg-muted">{session.location}</p>
              </div>
              <p className="text-fg-muted">{session.lastActive}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={accountSectionClass} aria-labelledby="security-danger">
        <div>
          <h2 id="security-danger" className={accountSectionTitleClass}>
            Danger zone
          </h2>
          <p className={`mt-1 ${accountSectionDescClass}`}>
            Permanently delete your account and all associated data.
          </p>
        </div>
        <div className="rounded-panel border border-red-600/70 bg-panel px-4 py-4">
          <p className="font-sans text-standard text-red-700">
            Deleting your account cannot be undone. Projects, assets, and shared viewers tied to
            this account will be removed.
          </p>
          <div className="mt-3">
            <button
              type="button"
              className="h-button cursor-pointer rounded-panel border border-red-600 bg-panel px-4 font-sans text-standard font-bold text-red-700 transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-600/35 focus-visible:outline-none"
            >
              Delete account
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
