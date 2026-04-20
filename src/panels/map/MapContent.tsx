import { sampleAssets } from '@/data/sampleAssets'

type MapContentProps = {
  activeTabId: string
}

export function MapContent({ activeTabId }: MapContentProps) {
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden bg-area-highlight">
      <div
        className="absolute inset-3 rounded-panel border border-dashed border-stroke bg-panel"
        aria-hidden
      />
      <div className="relative h-full min-h-[200px] p-4">
        <p className="font-sans text-standard text-fg-muted">
          Floor plan placeholder · {activeTabId}
        </p>
        <div className="relative mt-4 h-[min(360px,55vh)] w-full">
          {sampleAssets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              title={asset.title}
              className="absolute flex size-icon-button -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-panel border border-stroke bg-panel font-sans text-[10px] font-bold text-fg-highlight shadow-sm"
              style={{
                left: `${asset.mapPosition.x}%`,
                top: `${asset.mapPosition.y}%`,
              }}
            >
              {asset.kind === 'panorama' ? '360' : asset.kind[0]!.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
