export type TabItem = { id: string; label: string; disabled?: boolean; title?: string }

type PanelTabRowProps = {
  tabs: TabItem[]
  activeId: string
  onSelect: (id: string) => void
  'aria-label'?: string
  /** `folder` connects to TabPanelBody; `buttons` are standalone pill-style controls. */
  variant?: 'folder' | 'buttons'
}

const tabBaseClass =
  'box-border flex min-w-0 shrink-0 cursor-pointer items-center font-sans text-standard transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-highlight/35 disabled:cursor-not-allowed disabled:opacity-45'

export function PanelTabRow({
  tabs,
  activeId,
  onSelect,
  'aria-label': ariaLabel = 'Panel tabs',
  variant = 'folder',
}: PanelTabRowProps) {
  const isButtons = variant === 'buttons'

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={
        isButtons
          ? 'flex shrink-0 items-center gap-2 overflow-x-auto'
          : 'flex min-h-tab-row shrink-0 items-end gap-2 overflow-visible bg-page px-panel-padding'
      }
    >
      {tabs.map((tab) => {
        const selected = tab.id === activeId
        const disabled = tab.disabled === true

        let className: string
        if (isButtons) {
          className =
            tabBaseClass +
            ' h-button rounded-panel px-4 ' +
            (selected
              ? 'bg-panel font-bold text-fg-highlight'
              : 'bg-area-highlight font-normal text-fg-muted hover:text-fg disabled:hover:text-fg-muted')
        } else if (selected) {
          className =
            tabBaseClass +
            ' ocu-tab-active-surface ocu-tab-active-overlap relative z-10 border border-stroke border-b-0 bg-panel px-4 font-bold text-fg-highlight shadow-none'
        } else {
          className =
            tabBaseClass +
            ' h-tab-row px-3 text-fg-muted hover:text-fg disabled:hover:text-fg-muted'
        }

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            disabled={disabled}
            title={tab.title}
            className={className}
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
