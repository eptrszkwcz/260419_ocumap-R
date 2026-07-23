import { useState, type ReactNode } from 'react'

import {
  DropdownPanel,
  type DropdownPanelTriggerProps,
} from '@/components/DropdownPanel'

export type DropdownMenuItemConfig = {
  id: string
  label: string
  onSelect: () => void
  icon?: ReactNode
  trailing?: ReactNode
  selected?: boolean
}

export type DropdownMenuTriggerProps = DropdownPanelTriggerProps & {
  menuId: string | undefined
}

export { dropdownMenuPanelClassName } from '@/components/DropdownPanel'

export const dropdownMenuItemClassName =
  'text-fg-muted hover:text-fg-highlight flex w-full cursor-pointer items-center gap-2.5 rounded-panel px-[16px] py-[12px] text-left font-sans text-standard font-normal leading-none hover:bg-area-highlight hover:font-normal focus-visible:bg-area-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg-highlight/35'

export const dropdownMenuTableHeaderClassName =
  'text-fg flex shrink-0 items-center justify-between gap-3 border-b border-solid border-fg-muted px-[16px] py-2.5 font-sans text-standard font-bold leading-none'

function dropdownMenuItemClass(selected: boolean | undefined): string {
  if (selected) {
    return dropdownMenuItemClassName + ' text-fg-highlight bg-area-highlight'
  }
  return dropdownMenuItemClassName
}

type DropdownMenuProps = {
  items: DropdownMenuItemConfig[]
  menuAriaLabel: string
  align?: 'left' | 'right' | 'center'
  placement?: 'bottom' | 'top'
  panelWidth?: string
  panelMaxHeight?: string
  tableColumnHeaders?: { feature: string; type: string }
  closeOnMouseLeave?: boolean
  stopTriggerPropagation?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  renderTrigger: (props: DropdownMenuTriggerProps) => ReactNode
}

export function DropdownMenu({
  items,
  menuAriaLabel,
  align = 'right',
  placement = 'bottom',
  panelWidth,
  panelMaxHeight,
  tableColumnHeaders,
  closeOnMouseLeave = true,
  stopTriggerPropagation = false,
  open: openControlled,
  onOpenChange,
  renderTrigger,
}: DropdownMenuProps) {
  const [openInternal, setOpenInternal] = useState(false)
  const open = openControlled ?? openInternal

  const setOpen = (next: boolean) => {
    if (openControlled == null) {
      setOpenInternal(next)
    }
    onOpenChange?.(next)
  }

  const run = (fn: () => void) => {
    setOpen(false)
    fn()
  }

  const panelHeader =
    tableColumnHeaders != null ? (
      <div className={dropdownMenuTableHeaderClassName}>
        <span>{tableColumnHeaders.feature}</span>
        <span className="shrink-0">{tableColumnHeaders.type}</span>
      </div>
    ) : undefined

  return (
    <DropdownPanel
      panelAriaLabel={menuAriaLabel}
      align={align}
      placement={placement}
      panelWidth={panelWidth}
      panelMaxHeight={panelMaxHeight}
      panelHeader={panelHeader}
      closeOnMouseLeave={closeOnMouseLeave}
      stopTriggerPropagation={stopTriggerPropagation}
      open={open}
      onOpenChange={setOpen}
      renderTrigger={({ open: isOpen, panelId, onToggle }) =>
        renderTrigger({ open: isOpen, menuId: panelId, panelId, onToggle })
      }
    >
      <div role="menu">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            aria-current={item.selected ? 'true' : undefined}
            className={
              dropdownMenuItemClass(item.selected) +
              (item.trailing != null ? ' justify-between gap-3' : '')
            }
            onClick={() => run(item.onSelect)}
          >
            {item.trailing != null ? (
              <>
                <span className="min-w-0 truncate">{item.label}</span>
                <span className="shrink-0">{item.trailing}</span>
              </>
            ) : (
              <>
                {item.icon != null ? <span className="shrink-0">{item.icon}</span> : null}
                <span className="min-w-0">{item.label}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </DropdownPanel>
  )
}
