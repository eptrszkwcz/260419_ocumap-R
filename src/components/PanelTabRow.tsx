export type TabItem = { id: string; label: string; disabled?: boolean; title?: string }

type PanelTabRowProps = {
  tabs: TabItem[]
  activeId: string
  onSelect: (id: string) => void
  'aria-label'?: string
}

export function PanelTabRow({
  tabs,
  activeId,
  onSelect,
  'aria-label': ariaLabel = 'Panel tabs',
}: PanelTabRowProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex min-h-tab-row shrink-0 items-end gap-2 overflow-visible bg-page px-panel-padding"
    >
      {tabs.map((tab) => {
        const selected = tab.id === activeId
        const disabled = tab.disabled === true
        if (selected) {
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected
              disabled={disabled}
              title={tab.title}
              className="ocu-tab-active-surface ocu-tab-active-overlap relative z-10 box-border flex min-w-0 shrink-0 cursor-pointer items-center border border-stroke border-b-0 bg-panel px-4 font-sans text-standard font-bold text-fg-highlight shadow-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-highlight/35 disabled:cursor-not-allowed disabled:opacity-45"
              onClick={() => {
                if (!disabled) onSelect(tab.id)
              }}
            >
              {tab.label}
            </button>
          )
        }
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={false}
            disabled={disabled}
            title={tab.title}
            className="box-border flex h-tab-row min-w-0 shrink-0 cursor-pointer items-center px-3 font-sans text-standard text-fg-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-highlight/35 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:text-fg-muted"
            onClick={() => {
              if (!disabled) onSelect(tab.id)
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
