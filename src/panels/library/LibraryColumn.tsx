import { useState } from 'react'

import { Panel } from '@/components/Panel'
import { PanelTabRow, type TabItem } from '@/components/PanelTabRow'

import { LibraryContent } from '@/panels/library/LibraryContent'
import { LibraryHeader } from '@/panels/library/LibraryHeader'

const libraryTabs: TabItem[] = [
  { id: 'all', label: 'All' },
  { id: 'images', label: 'Images' },
  { id: 'video', label: 'Video' },
  { id: 'panorama', label: '360°' },
]

export function LibraryColumn() {
  const [tab, setTab] = useState(libraryTabs[0]!.id)

  return (
    <div className="flex min-h-0 min-w-0 flex-col">
      <LibraryHeader />
      <div className="h-4 shrink-0" aria-hidden />
      <Panel className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        <PanelTabRow
          tabs={libraryTabs}
          activeId={tab}
          onSelect={setTab}
          aria-label="Library sections"
        />
        <LibraryContent activeTabId={tab} />
      </Panel>
    </div>
  )
}
