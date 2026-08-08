import type { ComponentType } from 'react'

import { MOCK_ACCOUNT_USAGE } from '@/data/mockAccountData'
import {
  accountPrimaryButtonClass,
  accountSectionClass,
  accountSectionDescClass,
  accountSectionTitleClass,
} from '@/pages/account/accountStyles'
import {
  Model3DTypeIcon,
  Panorama360TypeIcon,
  PdfTypeIcon,
  PhotoTypeIcon,
  PolygonGeometryIcon,
  VideoTypeIcon,
} from '@/panels/library/addFeature/addFeatureTypeIcons'

const usageTypeIcons: Record<string, ComponentType<{ className?: string }>> = {
  Images: PhotoTypeIcon,
  Panoramas: Panorama360TypeIcon,
  Videos: VideoTypeIcon,
  PDFs: PdfTypeIcon,
  Geometry: PolygonGeometryIcon,
  Other: Model3DTypeIcon,
}

function formatGb(value: number): string {
  return `${value.toFixed(1)} GB`
}

function formatFileCount(value: number): string {
  return value.toLocaleString()
}

export function AccountUsagePanel() {
  const { usedGb, totalGb, breakdown } = MOCK_ACCOUNT_USAGE
  const totalFiles = breakdown.reduce((sum, row) => sum + row.fileCount, 0)
  const percent = Math.min(100, Math.round((usedGb / totalGb) * 100))

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-2">
      <section className={accountSectionClass} aria-labelledby="usage-storage">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="usage-storage" className={accountSectionTitleClass}>
              Storage
            </h2>
            <p className={`mt-1 ${accountSectionDescClass}`}>Usage across all projects.</p>
          </div>
          <button type="button" className={`${accountPrimaryButtonClass} shrink-0`}>
            Buy more storage
          </button>
        </div>
        <div className="rounded-panel border border-stroke bg-panel px-4 py-4">
          <div className="flex items-baseline justify-between gap-3 font-sans text-standard">
            <p className="font-bold text-fg">
              {formatGb(usedGb)} of {formatGb(totalGb)} used
            </p>
            <p className="text-fg-muted tabular-nums">{percent}%</p>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-area-highlight"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Storage used"
          >
            <div className="h-full rounded-full bg-fg-highlight" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </section>

      <section className={accountSectionClass} aria-label="Usage breakdown">
        <div className="overflow-hidden rounded-panel border border-stroke bg-panel">
          <table className="w-full border-collapse bg-panel font-sans text-standard">
            <thead>
              <tr className="border-b border-stroke bg-area-highlight/40 text-left">
                <th className="px-4 py-2.5 font-bold text-fg">Feature</th>
                <th className="px-4 py-2.5 text-right font-bold text-fg">Files</th>
                <th className="px-4 py-2.5 text-right font-bold text-fg">Size</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stroke/60">
                <td className="px-4 py-2.5 font-bold text-fg">Total</td>
                <td className="px-4 py-2.5 text-right font-bold text-fg tabular-nums">
                  {formatFileCount(totalFiles)}
                </td>
                <td className="px-4 py-2.5 text-right font-bold text-fg tabular-nums">
                  {formatGb(usedGb)}
                </td>
              </tr>
              {breakdown.map((row) => {
                const Icon = usageTypeIcons[row.label]
                return (
                  <tr key={row.label} className="border-b border-stroke/60 last:border-b-0">
                    <td className="px-4 py-2.5 text-fg">
                      <div className="flex items-center gap-2.5">
                        {Icon != null ? (
                          <span className="inline-flex size-5 shrink-0 [&_svg]:size-full">
                            <Icon />
                          </span>
                        ) : null}
                        <span>{row.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-fg-muted">
                      {formatFileCount(row.fileCount)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-fg-muted">
                      {formatGb(row.sizeGb)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
