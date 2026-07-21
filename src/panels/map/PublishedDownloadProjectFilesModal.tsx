import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useMemo } from 'react'

import { getFeatureTypeLabel, getSampleAssetsForProject, type SpatialAsset } from '@/data/sampleAssets'
import type { ProjectRecord } from '@/data/sampleProjects'
import { downloadSpatialAsset } from '@/lib/downloadSpatialAsset'
import { formatBytes } from '@/lib/formatBytes'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
  featureMetadataSecondaryButtonClass,
} from '@/panels/library/featureMetadata/styles'
import { PublishedModalShell } from '@/panels/map/PublishedModalShell'

type PublishedDownloadProjectFilesModalProps = {
  project: ProjectRecord
  onClose: () => void
}

function downloadAllAssets(assets: SpatialAsset[]) {
  for (const asset of assets) {
    if (asset.fileUrl != null) {
      downloadSpatialAsset(asset)
    }
  }
}

export function PublishedDownloadProjectFilesModal({
  project,
  onClose,
}: PublishedDownloadProjectFilesModalProps) {
  const assets = useMemo(() => getSampleAssetsForProject(project.id), [project.id])
  const downloadableCount = useMemo(
    () => assets.filter((asset) => asset.fileUrl != null).length,
    [assets],
  )

  return (
    <PublishedModalShell
      ariaLabel={`Download project files for ${project.name}`}
      maxWidthClass="max-w-4xl"
      onClose={onClose}
      header={
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-stroke bg-white px-6 py-4">
          <h1 className="font-title text-title font-bold text-fg">Download Project Files</h1>
          <button
            type="button"
            onClick={() => downloadAllAssets(assets)}
            disabled={downloadableCount === 0}
            className={
              featureMetadataSecondaryButtonClass +
              ' inline-flex shrink-0 items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50'
            }
          >
            <ArrowDownTrayIcon className="size-4 shrink-0" aria-hidden />
            Download all
          </button>
        </div>
      }
      footer={
        <footer className="flex shrink-0 border-t border-stroke bg-white px-6 py-4">
          <div className={featureMetadataFooterActionsClassName}>
            <button
              type="button"
              onClick={onClose}
              className={featureMetadataFooterCancelButtonClass + ' ml-auto'}
            >
              Close
            </button>
          </div>
        </footer>
      }
    >
      <div className="p-6">
        {assets.length === 0 ? (
          <p className="font-sans text-standard text-fg-muted">No project files available.</p>
        ) : (
          <div className="overflow-x-auto rounded-panel border border-stroke bg-white">
            <table className="w-full min-w-[36rem] border-collapse bg-white text-left font-sans text-standard">
              <thead>
                <tr className="border-b border-stroke bg-white">
                  <th scope="col" className="px-3 py-2.5 font-bold text-fg">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-bold text-fg">
                    Type
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-bold text-fg">
                    Size
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-bold text-fg">
                    <span className="sr-only">Download</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => {
                  const canDownload = asset.fileUrl != null
                  return (
                    <tr key={asset.id} className="border-b border-stroke last:border-b-0">
                      <td className="max-w-[16rem] truncate px-3 py-2.5 align-middle font-bold text-fg">
                        {asset.title}
                      </td>
                      <td className="px-3 py-2.5 align-middle text-fg-muted">
                        {getFeatureTypeLabel(asset)}
                      </td>
                      <td className="px-3 py-2.5 align-middle text-fg-muted">
                        {asset.fileSizeBytes != null ? formatBytes(asset.fileSizeBytes) : '—'}
                      </td>
                      <td className="px-3 py-2.5 align-middle">
                        <button
                          type="button"
                          onClick={() => downloadSpatialAsset(asset)}
                          disabled={!canDownload}
                          className={
                            featureMetadataSecondaryButtonClass +
                            ' inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50'
                          }
                          aria-label={`Download ${asset.title}`}
                        >
                          <ArrowDownTrayIcon className="size-4 shrink-0" aria-hidden />
                          Download
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PublishedModalShell>
  )
}
