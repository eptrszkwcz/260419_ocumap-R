import { useMemo, useState } from 'react'

import { PanelTabRow, type TabItem } from '@/components/PanelTabRow'
import { TabPanelBody } from '@/components/TabPanelBody'
import { useMediaMarkerFlow } from '@/context/MediaMarkerFlowContext'
import type { SpatialAsset } from '@/data/sampleAssets'

import { MarkerInfoPanel } from '@/panels/map/MarkerInfoPanel'
import { MarkerLogPanel } from '@/panels/map/MarkerLogPanel'
import { MarkerPanelHeader } from '@/panels/map/MarkerPanelHeader'

type MarkerPanelColumnProps = {
  parentAsset: SpatialAsset | null
}

export function MarkerPanelColumn({ parentAsset }: MarkerPanelColumnProps) {
  const { isMarkerMetadataSaved } = useMediaMarkerFlow()
  const [activeTab, setActiveTab] = useState('info')

  const markerTabs = useMemo((): TabItem[] => {
    return [
      { id: 'info', label: 'Marker Info' },
      {
        id: 'log',
        label: 'Log',
        disabled: !isMarkerMetadataSaved,
        title: isMarkerMetadataSaved
          ? undefined
          : 'Save marker info before adding log entries.',
      },
    ]
  }, [isMarkerMetadataSaved])

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PanelTabRow
        tabs={markerTabs}
        activeId={activeTab}
        onSelect={setActiveTab}
        aria-label="Marker panel sections"
      />
      <TabPanelBody className="flex min-h-0 flex-1 flex-col">
        <MarkerPanelHeader />
        {activeTab === 'info' ? (
          <MarkerInfoPanel
            parentAsset={parentAsset}
            onSaveSuccess={() => setActiveTab('log')}
          />
        ) : (
          <MarkerLogPanel />
        )}
      </TabPanelBody>
    </div>
  )
}
