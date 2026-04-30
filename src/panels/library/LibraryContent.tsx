import { useState } from 'react'

import { sampleAssets, type SpatialAsset } from '@/data/sampleAssets'
import { AddFeatureFlow } from '@/panels/library/AddFeatureFlow'
import { type ActiveFilter } from '@/panels/library/FeatureLibraryBadges'
import { FeatureLibraryFilterRow } from '@/panels/library/FeatureLibraryFilterRow'
import { FeatureLibraryTable } from '@/panels/library/FeatureLibraryTable'
import { FeatureLibraryToolbar } from '@/panels/library/FeatureLibraryToolbar'

type LibraryContentProps = {
  activeTabId: string
}

export function LibraryContent({ activeTabId }: LibraryContentProps) {
  if (activeTabId === 'project-details') {
    return (
      <div className="min-h-0 flex-1 overflow-auto p-panel-padding">
        <p className="font-sans text-standard text-fg-muted">
          Project metadata and settings will appear here.
        </p>
      </div>
    )
  }

  if (activeTabId === 'log-book') {
    return (
      <div className="min-h-0 flex-1 overflow-auto p-panel-padding">
        <p className="font-sans text-standard text-fg-muted">
          Activity and audit log entries will appear here.
        </p>
      </div>
    )
  }

  return <FeatureLibraryView />
}

function FeatureLibraryView() {
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [assets, setAssets] = useState<SpatialAsset[]>(() => [...sampleAssets])
  const [viewMode, setViewMode] = useState<'browse' | 'add'>('browse')

  // When search/filters are applied, replace with the visible slice only.
  const visibleAssets = assets
  const visibleCount = visibleAssets.length

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <FeatureLibraryToolbar onAddFeatureClick={() => setViewMode('add')} />
      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col"
        id="feature-library-contents"
      >
        {viewMode === 'browse' ? (
          <>
            <FeatureLibraryFilterRow
              featureCount={visibleCount}
              activeFilters={activeFilters}
              onRemoveFilter={(id) => setActiveFilters((prev) => prev.filter((f) => f.id !== id))}
            />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <FeatureLibraryTable assets={visibleAssets} />
            </div>
          </>
        ) : (
          <AddFeatureFlow
            onCancel={() => setViewMode('browse')}
            onSave={(newItems) => {
              setAssets((a) => [...a, ...newItems])
              setViewMode('browse')
            }}
          />
        )}
      </div>
    </div>
  )
}
