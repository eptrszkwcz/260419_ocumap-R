import { useState } from 'react'

import { PanelTabRow, type TabItem } from '@/components/PanelTabRow'
import { TabPanelBody } from '@/components/TabPanelBody'

import { LibraryContent } from '@/panels/library/LibraryContent'
import { LibraryHeader } from '@/panels/library/LibraryHeader'

const libraryTabs: TabItem[] = [
  { id: 'project-details', label: 'Project Details' },
  { id: 'feature-library', label: 'Feature Library' },
  { id: 'log-book', label: 'Log Book' },
]

export function LibraryColumn() {
  const [tab, setTab] = useState('feature-library')

  return (
    <div className="flex min-h-0 min-w-0 flex-col">
      <LibraryHeader />
      <div className="h-4 shrink-0" aria-hidden />
      <div className="flex min-h-0 flex-1 flex-col">
        <PanelTabRow
          tabs={libraryTabs}
          activeId={tab}
          onSelect={setTab}
          aria-label="Library sections"
        />
        <TabPanelBody>
          <LibraryContent activeTabId={tab} />
        </TabPanelBody>
      </div>
    </div>
  )
}
