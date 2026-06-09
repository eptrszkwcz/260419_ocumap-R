function UserOutlineIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M3.5 16.5c0-3.1 2.6-5.5 6.5-5.5s6.5 2.4 6.5 5.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  )
}

type UserAvatarProps = {
  photoUrl?: string
  /** Diameter in pixels. Defaults to 40. */
  size?: 32 | 40
  className?: string
}

const sizeClassByDiameter = {
  32: 'size-8',
  40: 'size-10',
} as const

const iconClassByDiameter = {
  32: 'size-4',
  40: 'size-5',
} as const

const avatarBorderClass = 'border border-stroke'

/** Circular user avatar: profile photo when available, otherwise a user icon placeholder. */
export function UserAvatar({ photoUrl, size = 40, className = '' }: UserAvatarProps) {
  const sizeClass = sizeClassByDiameter[size]
  const iconClass = iconClassByDiameter[size]

  if (photoUrl != null && photoUrl !== '') {
    return (
      <img
        src={photoUrl}
        alt=""
        width={size}
        height={size}
        className={`${sizeClass} ${avatarBorderClass} shrink-0 rounded-full object-cover ${className}`.trim()}
      />
    )
  }

  return (
    <div
      className={`${avatarBorderClass} bg-area-highlight text-fg-muted flex ${sizeClass} shrink-0 items-center justify-center rounded-full ${className}`.trim()}
      aria-hidden
    >
      <UserOutlineIcon className={iconClass} />
    </div>
  )
}

export { UserOutlineIcon }
