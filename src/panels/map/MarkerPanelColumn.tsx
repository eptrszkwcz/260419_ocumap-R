import { TabPanelBody } from '@/components/TabPanelBody'

import { MarkerLogPanel } from '@/panels/map/MarkerLogPanel'
import { MarkerPanelHeader } from '@/panels/map/MarkerPanelHeader'

export function MarkerPanelColumn() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <TabPanelBody className="flex min-h-0 flex-1 flex-col">
        <MarkerPanelHeader />
        <MarkerLogPanel />
      </TabPanelBody>
    </div>
  )
}
