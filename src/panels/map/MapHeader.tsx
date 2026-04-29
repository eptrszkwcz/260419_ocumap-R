import { Panel } from '@/components/Panel'

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

export function MapHeader() {
  return (
    <Panel className="flex h-header w-full min-w-0 shrink-0 items-center justify-between gap-4 border-0 bg-transparent">
      <div className="flex shrink-0 items-center">
        <img
          src="/brand/ocumap-o-logo.svg"
          alt="OcuMap"
          className="h-9 w-auto"
          width={33}
          height={40}
        />
      </div>
      <div className="flex min-w-0 shrink items-center gap-2">
        <span className="truncate font-sans text-standard font-bold text-fg">
          {USER_DISPLAY_NAME}
        </span>
        <span className="text-fg-muted shrink-0" aria-hidden>
          <UserOutlineIcon />
        </span>
      </div>
    </Panel>
  )
}
