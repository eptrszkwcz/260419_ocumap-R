import { sampleAssets } from '@/data/sampleAssets'

type MapContentProps = {
  activeTabId: string
}

export function MapContent({ activeTabId }: MapContentProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-area-highlight p-panel-padding">
      <div className="relative flex min-h-[200px] flex-1 flex-col rounded-panel border border-dashed border-stroke bg-panel/40">
        <p className="font-sans text-standard text-fg-muted">
          {activeTabId === '3d'
            ? '3D map placeholder · orbit / spatial view'
            : '2D map placeholder · floor plan view'}
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
