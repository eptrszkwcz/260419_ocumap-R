import { sampleAssets, type AssetKind } from '@/data/sampleAssets'

const libraryTabFilters: Record<string, (k: AssetKind) => boolean> = {
  all: () => true,
  images: (k) => k === 'image',
  video: (k) => k === 'video',
  panorama: (k) => k === 'panorama',
}

type LibraryContentProps = {
  activeTabId: string
}

export function LibraryContent({ activeTabId }: LibraryContentProps) {
  const filter = libraryTabFilters[activeTabId] ?? libraryTabFilters.all
  const rows = sampleAssets.filter((a) => filter(a.kind))

  return (
    <div className="min-h-0 flex-1 overflow-auto p-3">
      <ul className="flex flex-col gap-2">
        {rows.map((asset) => (
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
      {rows.length === 0 ? (
        <p className="font-sans text-standard text-fg-muted">No assets in this tab.</p>
      ) : null}
    </div>
  )
}
