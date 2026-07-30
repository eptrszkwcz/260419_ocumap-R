import { useEffect, useMemo, useRef } from 'react'

import { useMediaMarkerFlow } from '@/context/MediaMarkerFlowContext'
import { MarkerLogComposer } from '@/panels/map/MarkerLogComposer'
import { MarkerLogEntryCard } from '@/panels/map/MarkerLogEntryCard'

export function MarkerLogPanel() {
  const {
    draftMarker,
    isMarkerMetadataSaved,
    addMarkerLogEntry,
    updateMarkerLogEntry,
    deleteMarkerLogEntry,
  } = useMediaMarkerFlow()

  const feedRef = useRef<HTMLDivElement>(null)

  const entries = useMemo(
    () => draftMarker?.logEntries ?? [],
    [draftMarker?.logEntries],
  )

  useEffect(() => {
    const el = feedRef.current
    if (el == null) return
    el.scrollTop = el.scrollHeight
  }, [entries.length])

  if (!isMarkerMetadataSaved) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-panel-padding text-center">
        <p className="text-fg-muted font-sans text-standard">
          Save marker info on the Marker Info tab before adding log entries.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={feedRef}
        className="min-h-0 flex-1 overflow-y-auto p-panel-padding"
        role="feed"
        aria-label="Marker log entries"
      >
        {entries.length === 0 ? (
          <div className="flex h-full min-h-32 items-center justify-center text-center">
            <p className="text-fg-muted max-w-sm font-sans text-standard">
              No log entries yet. Add a note below to track changes or flag something for your team.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <MarkerLogEntryCard
                key={entry.id}
                entry={entry}
                onUpdate={updateMarkerLogEntry}
                onDelete={deleteMarkerLogEntry}
              />
            ))}
          </div>
        )}
      </div>
      <MarkerLogComposer onPost={addMarkerLogEntry} />
    </div>
  )
}
