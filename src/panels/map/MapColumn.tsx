import { useState } from 'react'

import { PanelTabRow, type TabItem } from '@/components/PanelTabRow'
import { TabPanelBody } from '@/components/TabPanelBody'

import { MapContent } from '@/panels/map/MapContent'
import { MapHeader } from '@/panels/map/MapHeader'

const mapTabs: TabItem[] = [
  { id: '2d', label: '2D' },
  { id: '3d', label: '3D' },
]

export function MapColumn() {
  const [tab, setTab] = useState('2d')

  return (
    <div className="flex h-full min-h-[680px] min-w-0 flex-col">
      <MapHeader />
      <div className="h-4 shrink-0" aria-hidden />
      <div className="flex min-h-0 flex-1 flex-col">
        <PanelTabRow
          tabs={mapTabs}
          activeId={tab}
          onSelect={setTab}
          aria-label="Map view mode"
        />
        <TabPanelBody>
          <MapContent activeTab={tab} />
        </TabPanelBody>
      </div>
    </div>
  )
}
