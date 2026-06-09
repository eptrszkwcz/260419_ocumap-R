import {
  ArrowRightOnRectangleIcon,
  ClockIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { dropdownMenuItemClassName } from '@/components/DropdownMenu'
import { DropdownPanel } from '@/components/DropdownPanel'
import { UserAvatar } from '@/components/UserAvatar'
import { useAuth } from '@/context/AuthContext'

const menuItemIconClass = 'size-4 shrink-0'

const accountMenuItems = [
  { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
  { id: 'activity', label: 'Activity', icon: ClockIcon },
  { id: 'theme', label: 'Theme', icon: SwatchIcon },
  { id: 'help', label: 'Help', icon: QuestionMarkCircleIcon },
] as const

/** Name + user menu, matching the map panel header (library page). */
export function UserAccountDisplay() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const displayName = user?.displayName ?? 'Guest'
  const email = user?.email ?? ''

  const handleLogout = () => {
    setOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <DropdownPanel
      panelAriaLabel="Account menu"
      align="right"
      panelWidth="17.5rem"
      closeOnMouseLeave
      open={open}
      onOpenChange={setOpen}
      renderTrigger={({ open, panelId, onToggle }) => (
        <button
          type="button"
          onClick={onToggle}
          className="text-fg hover:text-fg-highlight flex min-w-0 shrink-0 cursor-pointer items-center gap-2 rounded-panel px-1 py-0.5 focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={panelId}
          aria-label={`Account menu for ${displayName}`}
        >
          <span className="truncate font-sans text-standard font-bold">{displayName}</span>
          <UserAvatar photoUrl={user?.photoUrl} size={32} />
        </button>
      )}
    >
      <div className="px-4 py-3">
        <div className="flex items-start gap-3">
          <UserAvatar photoUrl={user?.photoUrl} size={40} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-sans text-standard font-bold text-fg">{displayName}</p>
            {email !== '' ? (
              <p className="mt-0.5 truncate font-sans text-standard text-fg-muted">{email}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-stroke border-t" role="separator" />

      <div role="menu" className="py-1">
        {accountMenuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className={dropdownMenuItemClassName}
              onClick={() => setOpen(false)}
            >
              <Icon className={menuItemIconClass} aria-hidden />
              <span className="min-w-0">{item.label}</span>
            </button>
          )
        })}
        <button
          type="button"
          role="menuitem"
          className={dropdownMenuItemClassName}
          onClick={handleLogout}
        >
          <ArrowRightOnRectangleIcon className={menuItemIconClass} aria-hidden />
          <span className="min-w-0">Log out</span>
        </button>
      </div>
    </DropdownPanel>
  )
}
