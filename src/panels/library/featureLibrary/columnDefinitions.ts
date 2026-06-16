import { getFeatureTypeLabel, type SpatialAsset } from '@/data/sampleAssets'
import type { ProjectType } from '@/data/sampleProjects'
import { formatBytes } from '@/lib/formatBytes'
import { extensionLabelFromMimeAndKind } from '@/panels/library/featureMetadata/fileInfo'

import { assetLocationLabel } from '@/panels/library/featureLibrary/assetLocationLabel'
import type { OptionalColumnId } from '@/panels/library/featureLibrary/types'

export type ColumnDefinition = {
  id: OptionalColumnId
  label: string
  minWidthPx: number
  getCellValue: (asset: SpatialAsset, projectType: ProjectType) => string
}

export const FEATURE_COLUMN_MIN_WIDTH_PX = 256
export const ACTIONS_COLUMN_WIDTH_PX = 36

export const columnDefinitions: Record<OptionalColumnId, ColumnDefinition> = {
  type: {
    id: 'type',
    label: 'Type',
    minWidthPx: 136,
    getCellValue: (asset) => getFeatureTypeLabel(asset),
  },
  dateUploaded: {
    id: 'dateUploaded',
    label: 'Date Uploaded',
    minWidthPx: 160,
    getCellValue: (asset) => asset.dateUploaded,
  },
  dateCaptured: {
    id: 'dateCaptured',
    label: 'Date Captured',
    minWidthPx: 160,
    getCellValue: (asset) => asset.dateCaptured ?? '—',
  },
  location: {
    id: 'location',
    label: 'Location',
    minWidthPx: 112,
    getCellValue: (asset, projectType) => assetLocationLabel(asset, projectType),
  },
  size: {
    id: 'size',
    label: 'Size',
    minWidthPx: 96,
    getCellValue: (asset) =>
      asset.fileSizeBytes != null ? formatBytes(asset.fileSizeBytes) : '—',
  },
  format: {
    id: 'format',
    label: 'Format',
    minWidthPx: 96,
    getCellValue: (asset) =>
      extensionLabelFromMimeAndKind(asset.mimeType, asset.kind, asset.fileUrl),
  },
}

export function columnLabel(id: OptionalColumnId): string {
  return columnDefinitions[id].label
}
