import type { AssetKind } from '@/data/sampleAssets'
import { formatBytes } from '@/lib/formatBytes'

export function extensionLabelFromMimeAndKind(
  mimeType: string | undefined,
  kind: AssetKind,
  fileName?: string,
): string {
  const mime = mimeType?.trim().toLowerCase()
  if (mime === 'image/png') return 'PNG'
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'JPEG'
  if (mime === 'image/webp') return 'WEBP'
  if (mime?.startsWith('video/')) return 'MP4'
  if (fileName != null) {
    try {
      const path = fileName.split('?')[0] ?? ''
      const ext = path.split('.').pop()
      if (ext != null && ext.length > 0 && ext.length <= 6) return ext.toUpperCase()
    } catch {
      /* ignore */
    }
  }
  if (kind === 'video') return 'MP4'
  if (kind === 'panorama') return 'JPEG'
  return 'JPEG'
}

export function resolutionLabel(width?: number | null, height?: number | null): string {
  if (width != null && height != null) {
    return `${width} × ${height}`
  }
  return '—'
}

export function fileSizeLabel(bytes?: number): string {
  if (bytes != null) return formatBytes(bytes)
  return '—'
}
