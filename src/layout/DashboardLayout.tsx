import { useCallback, useLayoutEffect, useRef, useState } from 'react'

import { DashboardResizeHandle, DASHBOARD_RESIZE_HANDLE_HIT_PX } from '@/layout/DashboardResizeHandle'
import { LibraryColumn } from '@/panels/library/LibraryColumn'
import { MapColumn } from '@/panels/map/MapColumn'

/** Matches previous grid `minmax(400px, …)` for the library track. */
const LIBRARY_MIN_PX = 456
/** Matches previous grid `minmax(500px, …)` for the map track. */
const MAP_MIN_PX = 456

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}

function libraryPxFromRatio(available: number, ratio: number) {
  if (available <= 0) return 0
  const lo = LIBRARY_MIN_PX
  const hi = available - MAP_MIN_PX
  if (hi <= lo) return available / 2
  return clamp(lo, ratio * available, hi)
}

export function DashboardLayout() {
  const rowRef = useRef<HTMLDivElement>(null)
  const [trackWidth, setTrackWidth] = useState(0)
  /** Library width as a fraction of `(row width − resize handle)`. */
  const [libraryRatio, setLibraryRatio] = useState(0.45)
  /** Bumped when column drag ends so Mapbox can run a final `resize()` after layout settles. */
  const [splitCommitToken, setSplitCommitToken] = useState(0)

  useLayoutEffect(() => {
    const el = rowRef.current
    if (el == null) return
    const measure = () => setTrackWidth(el.getBoundingClientRect().width)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const available = Math.max(0, trackWidth - DASHBOARD_RESIZE_HANDLE_HIT_PX)
  const libraryWidthPx = libraryPxFromRatio(available, libraryRatio)

  const applyClientX = useCallback((clientX: number) => {
    const el = rowRef.current
    if (el == null) return
    const rect = el.getBoundingClientRect()
    const avail = Math.max(0, rect.width - DASHBOARD_RESIZE_HANDLE_HIT_PX)
    if (avail <= 0) return
    const libW = libraryPxFromRatio(avail, (clientX - rect.left) / avail)
    setLibraryRatio(libW / avail)
  }, [])

  const nudgeLibrary = useCallback(
    (deltaPx: number) => {
      const el = rowRef.current
      if (el == null) return
      const rect = el.getBoundingClientRect()
      const avail = Math.max(0, rect.width - DASHBOARD_RESIZE_HANDLE_HIT_PX)
      if (avail <= 0) return
      const cur = libraryPxFromRatio(avail, libraryRatio)
      const next = libraryPxFromRatio(avail, (cur + deltaPx) / avail)
      setLibraryRatio(next / avail)
    },
    [libraryRatio],
  )

  const onSplitDragEnd = useCallback(() => {
    setSplitCommitToken((t) => t + 1)
  }, [])

  return (
    <div className="box-border flex h-full min-h-[680px] min-w-[916px] flex-col bg-page p-page">
      <div ref={rowRef} className="flex h-full min-h-0 min-w-0 flex-1">
        <div
          className="min-h-0 min-w-0 shrink-0 overflow-hidden"
          style={{
            width: trackWidth > 0 ? libraryWidthPx : `${libraryRatio * 100}%`,
          }}
        >
          <LibraryColumn />
        </div>
        <DashboardResizeHandle
          onDrag={applyClientX}
          onNudge={nudgeLibrary}
          onDragEnd={onSplitDragEnd}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <MapColumn splitCommitToken={splitCommitToken} />
        </div>
      </div>
    </div>
  )
}
