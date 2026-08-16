import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'
import { authFormLabelClass } from '@/pages/auth/AuthFormLayout'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
  featureMetadataInputClassName,
} from '@/panels/library/featureMetadata/styles'

const DELETE_CONFIRMATION_PHRASE = 'delete account'

const dangerInputClassName =
  featureMetadataInputClassName +
  ' focus-visible:border-red-600 focus-visible:ring-red-600/35'

const dangerConfirmButtonClass =
  'h-button shrink-0 cursor-pointer rounded-panel border border-red-600 bg-panel px-4 font-sans text-standard font-bold text-red-700 transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-600/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45'

type DeleteAccountModalProps = {
  onClose: () => void
}

export function DeleteAccountModal({ onClose }: DeleteAccountModalProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [confirmation, setConfirmation] = useState('')

  const canConfirm = confirmation.trim().toLowerCase() === DELETE_CONFIRMATION_PHRASE

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleConfirm = () => {
    if (!canConfirm) return
    logout()
    onClose()
    navigate('/login', { replace: true })
  }

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] bg-fg/20" aria-hidden onClick={onClose} />
      <div
        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
        role="presentation"
      >
        <div
          className="flex w-full max-w-md flex-col overflow-hidden rounded-panel border border-red-600/70 bg-page shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-4 px-panel-padding py-5">
            <header className="flex flex-col gap-1">
              <h2 id="delete-account-title" className="font-title text-title font-bold text-red-700">
                Delete account
              </h2>
              <p className="font-sans text-standard text-red-700">
                This is a permanent action. Your account, projects, assets, and shared viewers will
                be removed and cannot be recovered.
              </p>
            </header>

            <div className="rounded-panel border border-red-600/70 bg-panel px-4 py-3">
              <p className="font-sans text-standard text-red-700">
                To confirm, type{' '}
                <span className="font-bold">&quot;{DELETE_CONFIRMATION_PHRASE}&quot;</span> below.
              </p>
            </div>

            <label className="block min-w-0">
              <span className={authFormLabelClass}>Confirmation</span>
              <input
                type="text"
                className={dangerInputClassName}
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder={DELETE_CONFIRMATION_PHRASE}
                autoComplete="off"
                autoFocus
              />
            </label>
          </div>

          <footer className="flex shrink-0 border-t border-red-600/30 bg-panel px-panel-padding py-3">
            <div className={featureMetadataFooterActionsClassName}>
              <button
                type="button"
                onClick={onClose}
                className={featureMetadataFooterCancelButtonClass}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canConfirm}
                className={dangerConfirmButtonClass}
              >
                Confirm
              </button>
            </div>
          </footer>
        </div>
      </div>
    </>,
    document.body,
  )
}
