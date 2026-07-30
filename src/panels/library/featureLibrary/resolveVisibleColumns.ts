import {
  ACTIONS_COLUMN_WIDTH_PX,
  columnDefinitions,
  FEATURE_COLUMN_MIN_WIDTH_PX,
  MARKERS_INDICATOR_COLUMN_WIDTH_PX,
} from '@/panels/library/featureLibrary/columnDefinitions'
import type { OptionalColumnId } from '@/panels/library/featureLibrary/types'

const TABLE_HORIZONTAL_PADDING_PX = 48

type ResolveVisibleColumnsArgs = {
  containerWidthPx: number
  columnOrder: OptionalColumnId[]
  columnVisibility: Record<OptionalColumnId, boolean>
}

export function resolveVisibleColumns({
  containerWidthPx,
  columnOrder,
  columnVisibility,
}: ResolveVisibleColumnsArgs): OptionalColumnId[] {
  const enabled = columnOrder.filter((id) => columnVisibility[id])
  if (containerWidthPx <= 0) {
    return enabled
  }

  let remaining =
    containerWidthPx -
    FEATURE_COLUMN_MIN_WIDTH_PX -
    MARKERS_INDICATOR_COLUMN_WIDTH_PX -
    ACTIONS_COLUMN_WIDTH_PX -
    TABLE_HORIZONTAL_PADDING_PX
  const visible: OptionalColumnId[] = []

  for (const id of enabled) {
    const { minWidthPx } = columnDefinitions[id]
    if (remaining >= minWidthPx) {
      visible.push(id)
      remaining -= minWidthPx
    } else {
      break
    }
  }

  return visible
}
