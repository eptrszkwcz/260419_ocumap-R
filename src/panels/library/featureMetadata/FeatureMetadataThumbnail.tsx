type FeatureMetadataThumbnailProps = {
  previewUrl: string
  isVideo: boolean
  onImageLoad?: (width: number, height: number) => void
}

export function FeatureMetadataThumbnail({
  previewUrl,
  isVideo,
  onImageLoad,
}: FeatureMetadataThumbnailProps) {
  return (
    <div className="shrink-0">
      <div className="bg-area-highlight aspect-[5/4] h-[120px] w-auto overflow-hidden rounded-panel">
        {isVideo ? (
          <video
            src={previewUrl}
            className="h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
            aria-hidden
          />
        ) : (
          <img
            src={previewUrl}
            alt=""
            className="h-full w-full object-cover"
            decoding="async"
            draggable={false}
            onLoad={(e) => {
              const el = e.currentTarget
              onImageLoad?.(el.naturalWidth, el.naturalHeight)
            }}
          />
        )}
      </div>
    </div>
  )
}
