import { useState, type Dispatch, type SetStateAction } from 'react'

import { sampleAssets, type SpatialAsset } from '@/data/sampleAssets'
import { AddFeatureFlow } from '@/panels/library/AddFeatureFlow'
import { type ActiveFilter } from '@/panels/library/FeatureLibraryBadges'
import { FeatureLibraryFilterRow } from '@/panels/library/FeatureLibraryFilterRow'
import { FeatureLibraryMediaViewer } from '@/panels/library/FeatureLibraryMediaViewer'
import { FeatureLibraryTable } from '@/panels/library/FeatureLibraryTable'
import { FeatureLibraryToolbar } from '@/panels/library/FeatureLibraryToolbar'
import { ProjectDetailsPanel } from '@/panels/library/ProjectDetailsPanel'

type LibraryContentProps = {
  activeTabId: string
}

export function LibraryContent({ activeTabId }: LibraryContentProps) {
  const [assets, setAssets] = useState<SpatialAsset[]>(() => [...sampleAssets])

  if (activeTabId === 'project-details') {
    return <ProjectDetailsPanel assets={assets} />
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

  return (
    <FeatureLibraryView
      assets={assets}
      setAssets={setAssets}
    />
  )
}

type FeatureLibraryViewProps = {
  assets: SpatialAsset[]
  setAssets: Dispatch<SetStateAction<SpatialAsset[]>>
}

function FeatureLibraryView({ assets, setAssets }: FeatureLibraryViewProps) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [viewMode, setViewMode] = useState<'browse' | 'add'>('browse')
  const [openedAsset, setOpenedAsset] = useState<SpatialAsset | null>(null)

  const visibleAssets = assets
  const visibleCount = visibleAssets.length

  const viewerAsset = viewMode === 'browse' ? openedAsset : null

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <FeatureLibraryToolbar
        onAddFeatureClick={() => {
          setOpenedAsset(null)
          setViewMode('add')
        }}
        viewerAsset={viewerAsset}
        onCloseViewer={() => setOpenedAsset(null)}
      />
      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col"
        id="feature-library-contents"
      >
        {viewMode === 'browse' ? (
          viewerAsset != null ? (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col p-2">
              <FeatureLibraryMediaViewer
                asset={viewerAsset}
                libraryAssets={visibleAssets}
                onAssetChange={setOpenedAsset}
              />
            </div>
          ) : (
            <>
              <FeatureLibraryFilterRow
                featureCount={visibleCount}
                activeFilters={activeFilters}
                onRemoveFilter={(id) => setActiveFilters((prev) => prev.filter((f) => f.id !== id))}
              />
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <FeatureLibraryTable assets={visibleAssets} onOpenAsset={setOpenedAsset} />
              </div>
            </>
          )
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
