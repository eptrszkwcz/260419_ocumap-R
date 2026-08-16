import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CloseIcon } from '@/components/overlayControlIcons'
import { useAuth } from '@/context/AuthContext'
import { isFreePlan } from '@/data/mockUserProfile'

export type FreePlanUpgradeBannerId =
  | 'team-members'
  | 'account-usage'
  | 'projects'
  | 'project-workspace'

type FreePlanUpgradeBannerProps = {
  bannerId: FreePlanUpgradeBannerId
  message: string
  className?: string
}

export function FreePlanUpgradeBanner({
  message,
  className = '',
}: FreePlanUpgradeBannerProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)

  if (!isFreePlan(user) || dismissed) return null

  return (
    <div
      className={
        'flex w-full items-start gap-3 rounded-panel border border-fg-highlight/35 bg-fg-highlight/12 px-4 py-3 ' +
        className
      }
      role="status"
    >
      <p className="min-w-0 flex-1 font-sans text-standard text-fg-highlight">{message}</p>
      <button
        type="button"
        className="h-button shrink-0 cursor-pointer rounded-panel border border-fg-highlight bg-fg-highlight/12 px-4 font-sans text-standard font-bold text-fg-highlight hover:bg-fg-highlight/20 focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none"
        onClick={() => navigate('/account?tab=subscription')}
      >
        Upgrade
      </button>
      <button
        type="button"
        className="text-fg-muted hover:text-fg-highlight flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-panel transition-colors hover:bg-fg-highlight/12 focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none"
        aria-label="Dismiss upgrade banner"
        onClick={() => setDismissed(true)}
      >
        <CloseIcon />
      </button>
    </div>
  )
}
