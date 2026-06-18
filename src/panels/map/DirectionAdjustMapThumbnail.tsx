import type { AssetKind } from '@/data/sampleAssets'
import { panoramaThumbnailOffsetPercent } from '@/panels/map/directionAdjustHelpers'

type DirectionAdjustMapThumbnailProps = {
  fileUrl: string
  kind: Extract<AssetKind, 'image' | 'panorama'>
  referenceDirectionDeg: number
}

export function DirectionAdjustMapThumbnail({
  fileUrl,
  kind,
  referenceDirectionDeg,
}: DirectionAdjustMapThumbnailProps) {
  if (fileUrl === '') return null

  return (
    <div
      className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-3 w-24 overflow-hidden rounded-panel border border-stroke bg-panel shadow-md"
      style={{ transform: 'translateX(-50%)' }}
    >
      <div className="bg-area-highlight aspect-[4/3] w-full overflow-hidden">
        {kind === 'panorama' ? (
          <img
            src={fileUrl}
            alt=""
            className="h-full w-[400%] max-w-none object-cover"
            style={{ objectPosition: `${panoramaThumbnailOffsetPercent(referenceDirectionDeg)}% center` }}
            decoding="async"
            draggable={false}
          />
        ) : (
          <img
            src={fileUrl}
            alt=""
            className="h-full w-full object-cover"
            decoding="async"
            draggable={false}
          />
        )}
      </div>
    </div>
  )
}
