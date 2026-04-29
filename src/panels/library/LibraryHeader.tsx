import { Panel } from '@/components/Panel'

function HamburgerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden
    >
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M2.5 4.5h13M2.5 9h13M2.5 13.5h13"
      />
    </svg>
  )
}

export function LibraryHeader() {
  return (
    <Panel className="flex h-header shrink-0 items-center gap-3 border-0 px-panel-padding">
      <button
        type="button"
        className="text-fg hover:bg-area-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-highlight/35 flex size-icon-button shrink-0 items-center justify-center rounded-panel border border-transparent transition-colors"
        aria-label="Menu"
      >
        <HamburgerIcon />
      </button>
      <h1 className="min-w-0 truncate font-title text-title font-bold text-fg">123 Main St.</h1>
    </Panel>
  )
}
