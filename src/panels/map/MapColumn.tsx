import { useState } from 'react'

import { PanelTabRow, type TabItem } from '@/components/PanelTabRow'
import { TabPanelBody } from '@/components/TabPanelBody'

import { MapContent } from '@/panels/map/MapContent'
import { MapControlHeader } from '@/panels/map/MapControlHeader'
import { MapHeader } from '@/panels/map/MapHeader'
import {
  type FloorPlanId,
  floorPlanDisplayLabel,
  floorPlanImageSrc,
} from '@/panels/map/mapFloorPlans'

const mapTabs: TabItem[] = [
  { id: '2d', label: '2D' },
  { id: '3d', label: '3D' },
]

export function MapColumn() {
  const [tab, setTab] = useState('2d')
  const [floorPlanId, setFloorPlanId] = useState<FloorPlanId>('SOM-5')

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
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            {tab === '2d' ? (
              <MapControlHeader
                selectedFloorId={floorPlanId}
                onFloorChange={setFloorPlanId}
              />
            ) : null}
            <MapContent
              activeTab={tab}
              floorPlanSrc={floorPlanImageSrc(floorPlanId)}
              floorPlanLabel={floorPlanDisplayLabel(floorPlanId)}
            />
          </div>
        </TabPanelBody>
      </div>
    </div>
  )
}
