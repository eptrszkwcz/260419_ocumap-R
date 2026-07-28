import { useState } from 'react'

import { PanelTabRow, type TabItem } from '@/components/PanelTabRow'
import { TabPanelBody } from '@/components/TabPanelBody'
import type { SpatialAsset } from '@/data/sampleAssets'

import { MarkerInfoPanel } from '@/panels/map/MarkerInfoPanel'
import { MarkerLogPanel } from '@/panels/map/MarkerLogPanel'

const markerTabs: TabItem[] = [
  { id: 'info', label: 'Marker Info' },
  { id: 'log', label: 'Log' },
]

type MarkerPanelColumnProps = {
  parentAsset: SpatialAsset | null
}

export function MarkerPanelColumn({ parentAsset }: MarkerPanelColumnProps) {
  const [activeTab, setActiveTab] = useState('info')

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PanelTabRow
        tabs={markerTabs}
        activeId={activeTab}
        onSelect={setActiveTab}
        aria-label="Marker panel sections"
      />
      <TabPanelBody className="flex min-h-0 flex-1 flex-col">
        {activeTab === 'info' ? (
          <MarkerInfoPanel parentAsset={parentAsset} />
        ) : (
          <MarkerLogPanel />
        )}
      </TabPanelBody>
    </div>
  )
}
