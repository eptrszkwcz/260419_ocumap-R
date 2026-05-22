import { useCallback, useState } from 'react'

import { useActiveProject } from '@/context/ActiveProjectContext'
import { useMapLocationPick } from '@/context/MapLocationPickContext'
import type { AssetKind, SpatialAsset } from '@/data/sampleAssets'
import { formatBytes } from '@/lib/formatBytes'
import { formatDisplayDateFromIsoDate, parseToIsoDate, todayIsoDate } from '@/lib/formatDisplayDateFromIsoDate'
import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'

const inputClassName =
  'text-fg placeholder:text-fg-disabled h-8 w-full min-w-0 rounded-panel border border-stroke bg-panel px-2.5 text-standard leading-none focus-visible:border-fg-highlight focus-visible:ring-1 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

const selectClassName = inputClassName + ' appearance-auto py-0'

const secondaryButtonClass =
  'text-fg font-sans shrink-0 rounded-panel border border-stroke bg-panel px-3 py-1.5 text-standard leading-none hover:bg-area-highlight focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45'

function mapboxTokenPresent(): boolean {
  const t = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
  return typeof t === 'string' && t.trim() !== ''
}

function coordInputValue(n: number | undefined): string {
  if (n == null || !Number.isFinite(n)) return ''
  return n.toFixed(6)
}

function fileLabelFromUrl(url: string): string {
  if (url.startsWith('blob:')) return 'Uploaded file'
  try {
    const path = url.split('?')[0]?.split('/').pop()
    return path ? decodeURIComponent(path) : url
  } catch {
    return url
  }
}

type MetadataDraft = {
  title: string
  kind: AssetKind
  dateCapturedIso: string
  dateUploadedIso: string
  xStr: string
  yStr: string
  latStr: string
  lngStr: string
}

function draftFromAsset(asset: SpatialAsset, isBuildingProject: boolean): MetadataDraft {
  return {
    title: asset.title,
    kind: asset.kind,
    dateCapturedIso: asset.dateCaptured ? parseToIsoDate(asset.dateCaptured) : '',
    dateUploadedIso: parseToIsoDate(asset.dateUploaded) || todayIsoDate(),
    xStr: isBuildingProject ? coordInputValue(asset.floorPlanPosition?.x) : '',
    yStr: isBuildingProject ? coordInputValue(asset.floorPlanPosition?.y) : '',
    latStr: isBuildingProject ? '' : coordInputValue(asset.captureLat),
    lngStr: isBuildingProject ? '' : coordInputValue(asset.captureLng),
  }
}

type FeatureMediaMetadataPanelProps = {
  asset: SpatialAsset
  onSave: (updated: SpatialAsset) => void
}

export function FeatureMediaMetadataPanel({ asset, onSave }: FeatureMediaMetadataPanelProps) {
  const { project } = useActiveProject()
  const isBuildingProject = project.projectType === 'Building'
  const { isPickingLocation, startLocationPick, cancelLocationPick } = useMapLocationPick()
  const [draft, setDraft] = useState(() => draftFromAsset(asset, isBuildingProject))

  const canPickOnMap = project.projectType === 'Infrastructure' && mapboxTokenPresent()
  const pickDisabledReason =
    project.projectType !== 'Infrastructure'
      ? 'Geo pick is only available for infrastructure projects that use the map.'
      : !mapboxTokenPresent()
        ? 'Add VITE_MAPBOX_ACCESS_TOKEN to your .env file to use map pick.'
        : undefined

  const handleSave = useCallback(() => {
    const title = draft.title.trim() || asset.title
    const uploaded =
      formatDisplayDateFromIsoDate(draft.dateUploadedIso) || asset.dateUploaded
    const captured =
      draft.dateCapturedIso.trim() !== ''
        ? formatDisplayDateFromIsoDate(draft.dateCapturedIso) || undefined
        : undefined

    if (isBuildingProject) {
      const xs = draft.xStr.trim()
      const ys = draft.yStr.trim()
      let floorPlanPosition: SpatialAsset['floorPlanPosition']
      if (xs === '' && ys === '') {
        floorPlanPosition = undefined
      } else if (xs !== '' && ys !== '' && asset.floorPlanPosition != null) {
        const x = Number(xs)
        const y = Number(ys)
        if (Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= 1 && y >= 0 && y <= 1) {
          floorPlanPosition = {
            floorPlanId: asset.floorPlanPosition.floorPlanId,
            x,
            y,
          }
        } else {
          floorPlanPosition = asset.floorPlanPosition
        }
      } else {
        floorPlanPosition = asset.floorPlanPosition
      }

      onSave({
        ...asset,
        title,
        kind: draft.kind,
        dateUploaded: uploaded,
        dateCaptured: captured,
        floorPlanPosition,
      })
      return
    }

    const ls = draft.lngStr.trim()
    const bs = draft.latStr.trim()
    const geoPatch: Partial<Pick<SpatialAsset, 'captureLng' | 'captureLat'>> = {}
    if (ls === '' && bs === '') {
      geoPatch.captureLng = undefined
      geoPatch.captureLat = undefined
    } else if (ls !== '' && bs !== '') {
      const lng = Number(ls)
      const lat = Number(bs)
      if (
        Number.isFinite(lng) &&
        Number.isFinite(lat) &&
        lng >= -180 &&
        lng <= 180 &&
        lat >= -90 &&
        lat <= 90
      ) {
        geoPatch.captureLng = lng
        geoPatch.captureLat = lat
      }
    }

    onSave({
      ...asset,
      title,
      kind: draft.kind,
      dateUploaded: uploaded,
      dateCaptured: captured,
      ...geoPatch,
    })
  }, [asset, draft, isBuildingProject, onSave])

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col" role="region" aria-label="Feature metadata">
      <div className="min-h-0 min-w-0 flex-1 overflow-auto p-panel-padding">
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block min-w-0 sm:col-span-2">
            <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
              Name
            </span>
            <input
              type="text"
              className={inputClassName}
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              aria-label="Feature name"
            />
          </label>
          <label className="block min-w-0">
            <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
              Type
            </span>
            <select
              className={selectClassName}
              value={draft.kind}
              onChange={(e) => setDraft((d) => ({ ...d, kind: e.target.value as AssetKind }))}
              aria-label="Feature type"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="panorama">360 Photo</option>
            </select>
          </label>
          <label className="block min-w-0">
            <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
              Date captured
            </span>
            <input
              type="date"
              className={inputClassName}
              value={draft.dateCapturedIso}
              onChange={(e) => setDraft((d) => ({ ...d, dateCapturedIso: e.target.value }))}
            />
          </label>
          <label className="block min-w-0 sm:col-span-2">
            <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
              Date added
            </span>
            <input
              type="date"
              className={inputClassName}
              value={draft.dateUploadedIso}
              onChange={(e) => setDraft((d) => ({ ...d, dateUploadedIso: e.target.value }))}
            />
          </label>

          {isBuildingProject ? (
            <div className="grid min-w-0 gap-2 sm:col-span-2 sm:grid-cols-2">
              <label className="block min-w-0">
                <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                  X
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  className={inputClassName}
                  value={draft.xStr}
                  onChange={(e) => setDraft((d) => ({ ...d, xStr: e.target.value }))}
                  placeholder="e.g. 0.340000"
                  aria-label="Floor plan X (normalized 0–1)"
                />
              </label>
              <label className="block min-w-0">
                <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                  Y
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  className={inputClassName}
                  value={draft.yStr}
                  onChange={(e) => setDraft((d) => ({ ...d, yStr: e.target.value }))}
                  placeholder="e.g. 0.410000"
                  aria-label="Floor plan Y (normalized 0–1)"
                />
              </label>
            </div>
          ) : (
            <>
              <div className="grid min-w-0 gap-2 sm:col-span-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <label className="block min-w-0">
                  <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                    Latitude
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    className={inputClassName}
                    value={draft.latStr}
                    onChange={(e) => setDraft((d) => ({ ...d, latStr: e.target.value }))}
                    placeholder="e.g. 29.783350"
                    aria-label="Capture latitude (WGS84)"
                  />
                </label>
                <label className="block min-w-0">
                  <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                    Longitude
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    className={inputClassName}
                    value={draft.lngStr}
                    onChange={(e) => setDraft((d) => ({ ...d, lngStr: e.target.value }))}
                    placeholder="e.g. -95.809920"
                    aria-label="Capture longitude (WGS84)"
                  />
                </label>
                <div className="flex min-w-0 flex-col justify-end gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className={secondaryButtonClass + ' whitespace-nowrap'}
                      disabled={!canPickOnMap || isPickingLocation}
                      title={canPickOnMap ? undefined : pickDisabledReason}
                      onClick={() => {
                        startLocationPick((lng, lat) => {
                          setDraft((d) => ({
                            ...d,
                            lngStr: lng.toFixed(6),
                            latStr: lat.toFixed(6),
                          }))
                        })
                      }}
                    >
                      {isPickingLocation ? 'Click map…' : 'Set location on map'}
                    </button>
                    {isPickingLocation ? (
                      <button type="button" className="text-fg-muted text-standard hover:underline" onClick={cancelLocationPick}>
                        Cancel pick
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
              {isPickingLocation ? (
                <p className="text-fg-muted sm:col-span-2 text-standard">
                  Click the map on the right to place the capture point, or press Esc.
                </p>
              ) : null}
            </>
          )}

          <div className="min-w-0 sm:col-span-2">
            <p className="text-fg-muted text-badge font-bold uppercase tracking-wide">File</p>
            <p className="text-standard break-all text-fg">{fileLabelFromUrl(asset.fileUrl)}</p>
          </div>
          <div className="min-w-0">
            <p className="text-fg-muted text-badge font-bold uppercase tracking-wide">Size</p>
            <p className="text-standard text-fg">
              {asset.fileSizeBytes != null ? formatBytes(asset.fileSizeBytes) : '—'}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-fg-muted text-badge font-bold uppercase tracking-wide">MIME</p>
            <p className="text-standard break-all text-fg">{asset.mimeType?.trim() || '—'}</p>
          </div>
          <div className="min-w-0 sm:col-span-2">
            <p className="text-fg-muted text-badge font-bold uppercase tracking-wide">Dimensions</p>
            <p className="text-standard text-fg">
              {asset.width != null && asset.height != null ? `${asset.width} × ${asset.height}px` : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-stroke bg-panel px-panel-padding py-3">
        <div className="flex w-full min-w-0 justify-end">
          <button
            type="button"
            onClick={handleSave}
            className={
              PRIMARY_BUTTON_CLASS +
              ' h-8 rounded-panel px-4 text-standard focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'
            }
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
