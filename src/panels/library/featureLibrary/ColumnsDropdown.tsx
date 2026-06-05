import { useState, type DragEvent } from 'react'

import { Checkbox } from '@/components/Checkbox'
import { DropdownPanel } from '@/components/DropdownPanel'
import {
  ColumnsIcon,
  secondaryToolbarButtonActiveClassName,
  secondaryToolbarButtonClassName,
  secondaryToolbarButtonDisabledClassName,
} from '@/components/ControlHeaderToolbar'

import { columnLabel } from '@/panels/library/featureLibrary/columnDefinitions'
import type { LibraryViewType, OptionalColumnId } from '@/panels/library/featureLibrary/types'

function DragHandleIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="10"
      height="14"
      viewBox="0 0 10 14"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="3" cy="2.5" r="1" fill="currentColor" />
      <circle cx="7" cy="2.5" r="1" fill="currentColor" />
      <circle cx="3" cy="7" r="1" fill="currentColor" />
      <circle cx="7" cy="7" r="1" fill="currentColor" />
      <circle cx="3" cy="11.5" r="1" fill="currentColor" />
      <circle cx="7" cy="11.5" r="1" fill="currentColor" />
    </svg>
  )
}

type ColumnsDropdownProps = {
  viewType: LibraryViewType
  columnOrder: OptionalColumnId[]
  columnVisibility: Record<OptionalColumnId, boolean>
  onColumnOrderChange: (order: OptionalColumnId[]) => void
  onColumnVisibilityChange: (id: OptionalColumnId, visible: boolean) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ColumnsDropdown({
  viewType,
  columnOrder,
  columnVisibility,
  onColumnOrderChange,
  onColumnVisibilityChange,
  open,
  onOpenChange,
}: ColumnsDropdownProps) {
  const [dragId, setDragId] = useState<OptionalColumnId | null>(null)
  const disabled = viewType === 'thumbnail'

  const reorder = (fromId: OptionalColumnId, toId: OptionalColumnId) => {
    if (fromId === toId) return
    const next = [...columnOrder]
    const fromIdx = next.indexOf(fromId)
    const toIdx = next.indexOf(toId)
    if (fromIdx < 0 || toIdx < 0) return
    next.splice(fromIdx, 1)
    next.splice(toIdx, 0, fromId)
    onColumnOrderChange(next)
  }

  const onDragStart = (id: OptionalColumnId) => (e: DragEvent) => {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  const onDragOver = (id: OptionalColumnId) => (e: DragEvent) => {
    e.preventDefault()
    if (dragId != null && dragId !== id) {
      reorder(dragId, id)
    }
  }

  const onDragEnd = () => setDragId(null)

  const triggerClass =
    secondaryToolbarButtonClassName +
    (disabled ? ' ' + secondaryToolbarButtonDisabledClassName : '') +
    (open && !disabled ? ' ' + secondaryToolbarButtonActiveClassName : '')

  return (
    <DropdownPanel
      panelAriaLabel="Columns"
      align="left"
      panelWidth="240px"
      open={disabled ? false : open}
      onOpenChange={(next) => {
        if (!disabled) onOpenChange(next)
      }}
      renderTrigger={({ open: isOpen, panelId, onToggle }) => (
        <button
          type="button"
          onClick={disabled ? undefined : onToggle}
          disabled={disabled}
          aria-disabled={disabled}
          className={triggerClass + (isOpen && !disabled ? ' ' + secondaryToolbarButtonActiveClassName : '')}
          aria-expanded={disabled ? false : isOpen}
          aria-haspopup="dialog"
          aria-controls={panelId}
        >
          <span className="text-fg-muted shrink-0" aria-hidden>
            <ColumnsIcon />
          </span>
          Columns
        </button>
      )}
    >
      <div className="max-h-[320px] overflow-y-auto py-1">
        {columnOrder.map((id) => (
          <div
            key={id}
            draggable
            onDragStart={onDragStart(id)}
            onDragOver={onDragOver(id)}
            onDragEnd={onDragEnd}
            className={
              'flex items-center gap-1 ' +
              (dragId === id ? 'bg-area-highlight/60' : '')
            }
          >
            <span
              className="text-fg-muted flex w-6 shrink-0 cursor-grab items-center justify-center active:cursor-grabbing"
              aria-hidden
            >
              <DragHandleIcon />
            </span>
            <div className="min-w-0 flex-1">
              <Checkbox
                id={`col-${id}`}
                label={columnLabel(id)}
                checked={columnVisibility[id]}
                onChange={(checked) => onColumnVisibilityChange(id, checked)}
              />
            </div>
          </div>
        ))}
      </div>
    </DropdownPanel>
  )
}
