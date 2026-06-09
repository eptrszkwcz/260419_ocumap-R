import type { CSSProperties } from 'react'

export type ProjectListColumnId = 'lastModified' | 'files' | 'size' | 'status'

export const PROJECT_NAME_COLUMN_MIN_WIDTH_PX = 400
export const PROJECT_ACTIONS_COLUMN_WIDTH_PX = 36
const TABLE_HORIZONTAL_PADDING_PX = 48
const COLUMN_GAP_PX = 16

/** Columns at the end of this list are hidden first when the list is narrow. */
export const PROJECT_LIST_COLUMN_ORDER: ProjectListColumnId[] = [
  'status',
  'lastModified',
  'files',
  'size',
]

export const projectColumnDefinitions: Record<
  ProjectListColumnId,
  { label: string; minWidthPx: number }
> = {
  lastModified: { label: 'Last Modified', minWidthPx: 120 },
  files: { label: 'Files', minWidthPx: 64 },
  size: { label: 'Size', minWidthPx: 88 },
  status: { label: 'Status', minWidthPx: 92 },
}

export function resolveVisibleProjectColumns(containerWidthPx: number): ProjectListColumnId[] {
  if (containerWidthPx <= 0) {
    return [...PROJECT_LIST_COLUMN_ORDER]
  }

  let remaining =
    containerWidthPx -
    PROJECT_NAME_COLUMN_MIN_WIDTH_PX -
    PROJECT_ACTIONS_COLUMN_WIDTH_PX -
    TABLE_HORIZONTAL_PADDING_PX -
    COLUMN_GAP_PX * (PROJECT_LIST_COLUMN_ORDER.length + 1)

  const visible: ProjectListColumnId[] = []

  for (const id of PROJECT_LIST_COLUMN_ORDER) {
    const { minWidthPx } = projectColumnDefinitions[id]
    if (remaining >= minWidthPx) {
      visible.push(id)
      remaining -= minWidthPx
    } else {
      break
    }
  }

  return visible
}

export function projectsListGridStyle(visibleColumns: ProjectListColumnId[]): CSSProperties {
  return {
    gridTemplateColumns: [
      `minmax(${PROJECT_NAME_COLUMN_MIN_WIDTH_PX}px, 1fr)`,
      ...visibleColumns.map((id) => `${projectColumnDefinitions[id].minWidthPx}px`),
      `${PROJECT_ACTIONS_COLUMN_WIDTH_PX}px`,
    ].join(' '),
  }
}
