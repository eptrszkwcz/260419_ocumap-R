import { useState } from 'react'

import { Panel } from '@/components/Panel'
import { PanelTabRow, type TabItem } from '@/components/PanelTabRow'

import { MapContent } from '@/panels/map/MapContent'
import { MapHeader } from '@/panels/map/MapHeader'

const mapTabs: TabItem[] = [
  { id: 'floor-1', label: 'Floor 1' },
  { id: 'floor-2', label: 'Floor 2' },
]

export function MapColumn() {
  const [tab, setTab] = useState(mapTabs[0]!.id)

  return (
    <div className="flex min-h-0 min-w-0 flex-col">
      <MapHeader />
      <div className="h-4 shrink-0" aria-hidden />
      <Panel className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        <PanelTabRow
          tabs={mapTabs}
          activeId={tab}
          onSelect={setTab}
          aria-label="Map floors"
        />
        <MapContent activeTabId={tab} />
      </Panel>
    </div>
  )
}
