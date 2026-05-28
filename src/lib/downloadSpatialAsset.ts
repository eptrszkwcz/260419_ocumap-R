import type { SpatialAsset } from '@/data/sampleAssets'

function downloadFilename(asset: SpatialAsset): string {
  const base = asset.title.trim() || 'feature'
  try {
    const path = asset.fileUrl.split('?')[0]?.split('/').pop() ?? ''
    const ext = path.includes('.') ? path.slice(path.lastIndexOf('.')) : ''
    if (ext && !base.toLowerCase().endsWith(ext.toLowerCase())) {
      return `${base}${ext}`
    }
  } catch {
    /* ignore */
  }
  return base
}

/** Trigger a browser download for the asset media file. */
export function downloadSpatialAsset(asset: SpatialAsset): void {
  const link = document.createElement('a')
  link.href = asset.fileUrl
  link.download = downloadFilename(asset)
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
}
