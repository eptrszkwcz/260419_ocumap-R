import { sampleAssets } from '@/data/sampleAssets'

type LibraryContentProps = {
  activeTabId: string
}

export function LibraryContent({ activeTabId }: LibraryContentProps) {
  if (activeTabId === 'project-details') {
    return (
      <div className="min-h-0 flex-1 overflow-auto p-panel-padding">
        <p className="font-sans text-standard text-fg-muted">
          Project metadata and settings will appear here.
        </p>
      </div>
    )
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

  /* feature-library */
  return (
    <div className="min-h-0 flex-1 overflow-auto p-panel-padding">
      <ul className="flex flex-col gap-2">
        {sampleAssets.map((asset) => (
          <li
            key={asset.id}
            className="flex items-center gap-3 rounded-panel border border-stroke bg-panel p-2"
          >
            <img
              src={asset.fileUrl}
              alt=""
              className="h-14 w-24 shrink-0 rounded-panel border border-stroke object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-standard font-bold text-fg">
                {asset.title}
              </p>
              <p className="font-sans text-standard text-fg-muted">
                {asset.kind} · map ({asset.mapPosition.x}%, {asset.mapPosition.y}%)
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
