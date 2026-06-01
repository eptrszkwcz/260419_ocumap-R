import { useState, type ReactNode } from 'react'

function ChevronDownIcon({ open, className = '' }: { open: boolean; className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      className={'shrink-0 transition-transform ' + (open ? 'rotate-180' : '') + ' ' + className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M3 4.5 6 7.5 9 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type CollapsibleSectionProps = {
  title: string
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}

export function CollapsibleSection({
  title,
  defaultOpen = false,
  onOpenChange,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  const toggle = () => {
    const next = !open
    setOpen(next)
    onOpenChange?.(next)
  }

  return (
    <section className="rounded-panel border border-stroke">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none"
        aria-expanded={open}
      >
        <span className="font-title text-standard font-bold text-fg">{title}</span>
        <ChevronDownIcon open={open} className="text-fg-muted" />
      </button>
      {open ? <div className="border-t border-stroke px-4 py-4">{children}</div> : null}
    </section>
  )
}
