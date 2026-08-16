import { useState } from 'react'

import { FreePlanUpgradeBanner } from '@/components/FreePlanUpgradeBanner'
import { PanelTabRow, type TabItem } from '@/components/PanelTabRow'
import { TabPanelBody } from '@/components/TabPanelBody'
import { useActiveProject } from '@/context/ActiveProjectContext'
import { NEW_PROJECT_ID } from '@/data/sampleProjects'

import { LibraryContent } from '@/panels/library/LibraryContent'
import { LibraryHeader } from '@/panels/library/LibraryHeader'

const libraryTabs: TabItem[] = [
  { id: 'project-details', label: 'Project Details' },
  { id: 'feature-library', label: 'Feature Library' },
  { id: 'log-book', label: 'Log Book' },
]

export function LibraryColumn() {
  const { projectId, isNewProject } = useActiveProject()
  const [tab, setTab] = useState('feature-library')

  return (
    <div className="flex h-full min-h-[680px] min-w-0 flex-col">
      <LibraryHeader />
      <FreePlanUpgradeBanner
        key={projectId}
        bannerId="project-workspace"
        className="mt-3 w-full"
        message="You're on the Free plan. Upgrade to unlock more storage, seats, and publishing."
      />
      <div className="h-4 shrink-0" aria-hidden />
      <div className="flex min-h-0 flex-1 flex-col">
        {isNewProject ? (
          <>
            <div className="h-tab-row shrink-0 bg-page" aria-hidden />
            <TabPanelBody>
              <LibraryContent key={NEW_PROJECT_ID} activeTabId="project-details" />
            </TabPanelBody>
          </>
        ) : (
          <>
            <PanelTabRow
              tabs={libraryTabs}
              activeId={tab}
              onSelect={setTab}
              aria-label="Library sections"
            />
            <TabPanelBody>
              <LibraryContent key={projectId} activeTabId={tab} />
            </TabPanelBody>
          </>
        )}
      </div>
    </div>
  )
}
