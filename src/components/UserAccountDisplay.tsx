const USER_DISPLAY_NAME = 'John Smith'

function UserOutlineIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
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

/** Name + user icon, matching the map panel header (library page). */
export function UserAccountDisplay() {
  return (
    <div className="flex min-w-0 shrink-0 items-center gap-2">
      <span className="truncate font-sans text-standard font-bold text-fg">{USER_DISPLAY_NAME}</span>
      <span className="text-fg-muted shrink-0" aria-hidden>
        <UserOutlineIcon />
      </span>
    </div>
  )
}
