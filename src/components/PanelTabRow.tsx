export type TabItem = { id: string; label: string }

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
      className="flex h-tab-row shrink-0 items-stretch border-b border-stroke bg-panel px-1"
    >
      {tabs.map((tab) => {
        const selected = tab.id === activeId
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`font-sans text-standard px-3 transition-colors ${
              selected
                ? 'border-b-2 border-fg-highlight text-fg'
                : 'text-fg-muted hover:text-fg'
            }`}
            onClick={() => onSelect(tab.id)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
