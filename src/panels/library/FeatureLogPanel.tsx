import { useEffect, useMemo, useRef } from 'react'

import type { MarkerLogEntry } from '@/data/sampleAssets'
import { MarkerLogComposer } from '@/panels/map/MarkerLogComposer'
import { MarkerLogEntryCard } from '@/panels/map/MarkerLogEntryCard'

type FeatureLogPanelProps = {
  entries: MarkerLogEntry[]
  onAdd: (body: string) => void
  onUpdate: (entryId: string, body: string) => void
  onDelete: (entryId: string) => void
}

/** Marker-identical comment/log feed for drawn geometry features. */
export function FeatureLogPanel({ entries, onAdd, onUpdate, onDelete }: FeatureLogPanelProps) {
  const feedRef = useRef<HTMLDivElement>(null)

  const entryList = useMemo(() => entries, [entries])

  useEffect(() => {
    const el = feedRef.current
    if (el == null) return
    el.scrollTop = el.scrollHeight
  }, [entryList.length])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={feedRef}
        className="min-h-0 flex-1 overflow-y-auto p-panel-padding"
        role="feed"
        aria-label="Feature log entries"
      >
        {entryList.length === 0 ? (
          <div className="flex h-full min-h-32 items-center justify-center text-center">
            <p className="text-fg-muted max-w-sm font-sans text-standard">
              No log entries yet. Add a note below to track changes or flag something for your team.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entryList.map((entry) => (
              <MarkerLogEntryCard
                key={entry.id}
                entry={entry}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
      <MarkerLogComposer onPost={onAdd} />
    </div>
  )
}
