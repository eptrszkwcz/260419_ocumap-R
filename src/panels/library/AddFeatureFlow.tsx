import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { useActiveProject } from '@/context/ActiveProjectContext'
import { useFloorPlanLocationPick } from '@/context/FloorPlanLocationPickContext'
import { useMapLocationPick } from '@/context/MapLocationPickContext'
import type { AssetKind, SpatialAsset } from '@/data/sampleAssets'
import { inferKindFromFile } from '@/data/sampleAssets'
import { formatBytes } from '@/lib/formatBytes'
import { formatDisplayDateFromIsoDate, todayIsoDate } from '@/lib/formatDisplayDateFromIsoDate'
import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'
import { DEFAULT_FLOOR_PLAN_ID, floorPlanDisplayLabel, type FloorPlanId } from '@/panels/map/mapFloorPlans'

const inputClassName =
  'text-fg placeholder:text-fg-disabled h-8 w-full min-w-0 rounded-panel border border-stroke bg-panel px-2.5 text-standard leading-none focus-visible:border-fg-highlight focus-visible:ring-1 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

const selectClassName = inputClassName + ' appearance-auto py-0'

const secondaryButtonClass =
  'text-fg font-sans shrink-0 rounded-panel border border-stroke bg-panel px-3 py-1.5 text-standard leading-none hover:bg-area-highlight focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45'

function mapboxTokenPresent(): boolean {
  const t = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
  return typeof t === 'string' && t.trim() !== ''
}

function parseGeoFields(
  lngStr: string,
  latStr: string,
): Pick<SpatialAsset, 'captureLng' | 'captureLat'> | Record<string, never> {
  const ls = lngStr.trim()
  const bs = latStr.trim()
  if (ls === '' && bs === '') return {}
  if (ls !== '' && bs !== '') {
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
      return { captureLng: lng, captureLat: lat }
    }
  }
  return {}
}

function parseFloorPlanFields(
  xStr: string,
  yStr: string,
  floorPlanId: FloorPlanId | undefined,
): SpatialAsset['floorPlanPosition'] {
  const xs = xStr.trim()
  const ys = yStr.trim()
  if (xs === '' && ys === '') return undefined
  if (xs === '' || ys === '') return undefined
  const x = Number(xs)
  const y = Number(ys)
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) {
    return undefined
  }
  return {
    floorPlanId: floorPlanId ?? DEFAULT_FLOOR_PLAN_ID,
    x,
    y,
  }
}

type PendingItem = {
  id: string
  file: File
  objectUrl: string
  title: string
  dateCapturedIso: string
  dateAddedIso: string
  kind: AssetKind
  width: number | null
  height: number | null
  latStr: string
  lngStr: string
  xStr: string
  yStr: string
  floorPlanId: FloorPlanId | undefined
}

function fileBaseTitle(name: string): string {
  const i = name.lastIndexOf('.')
  return (i > 0 ? name.slice(0, i) : name).trim() || name
}

type AddFeatureFlowProps = {
  onCancel: () => void
  onSave: (assets: SpatialAsset[]) => void
}

type PendingFeatureCardProps = {
  item: PendingItem
  isBuildingProject: boolean
  canPickOnMap: boolean
  pickDisabledReason?: string
  isPickingLocation: boolean
  isPickingFloorPlanLocation: boolean
  isMapPickTarget: boolean
  isFloorPlanPickTarget: boolean
  onChange: (id: string, partial: Partial<Omit<PendingItem, 'id' | 'file' | 'objectUrl'>>) => void
  onRemove: (id: string) => void
  onStartMapPick: (id: string) => void
  onStartFloorPlanPick: (id: string) => void
  onCancelMapPick: () => void
  onCancelFloorPlanPick: () => void
}

function PendingFeatureCard({
  item,
  isBuildingProject,
  canPickOnMap,
  pickDisabledReason,
  isPickingLocation,
  isPickingFloorPlanLocation,
  isMapPickTarget,
  isFloorPlanPickTarget,
  onChange,
  onRemove,
  onStartMapPick,
  onStartFloorPlanPick,
  onCancelMapPick,
  onCancelFloorPlanPick,
}: PendingFeatureCardProps) {
  const { file, objectUrl } = item
  const isVideo = file.type.startsWith('video/')
  const isImage = file.type.startsWith('image/')
  const floorPlanLabel =
    item.floorPlanId != null ? floorPlanDisplayLabel(item.floorPlanId) : '—'

  return (
    <div className="border-b border-stroke p-panel-padding last:border-b-0">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="relative shrink-0">
          {isImage ? (
            <img
              src={objectUrl}
              alt=""
              className="bg-area-highlight h-20 w-28 max-w-full rounded-panel object-contain"
              onLoad={(e) => {
                const el = e.currentTarget
                onChange(item.id, { width: el.naturalWidth, height: el.naturalHeight })
              }}
            />
          ) : isVideo ? (
            <video
              src={objectUrl}
              className="bg-area-highlight h-20 w-28 max-w-full rounded-panel object-cover"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <div className="bg-area-highlight flex h-20 w-28 items-center justify-center rounded-panel text-badge text-fg-muted">
              Preview
            </div>
          )}
          <button
            type="button"
            className="text-fg-muted absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-panel border border-stroke bg-panel text-badge leading-none hover:text-fg focus-visible:ring-2 focus-visible:ring-fg-highlight/40 focus-visible:outline-none"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.title || file.name}`}
          >
            ×
          </button>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block min-w-0 sm:col-span-2">
              <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                Name
              </span>
              <input
                type="text"
                className={inputClassName}
                value={item.title}
                onChange={(e) => onChange(item.id, { title: e.target.value })}
                aria-label="Feature name"
              />
            </label>
            <label className="block min-w-0">
              <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                Type
              </span>
              <select
                className={selectClassName}
                value={item.kind}
                onChange={(e) => onChange(item.id, { kind: e.target.value as AssetKind })}
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
                value={item.dateCapturedIso}
                onChange={(e) => onChange(item.id, { dateCapturedIso: e.target.value })}
              />
            </label>
            <label className="block min-w-0">
              <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                Date added
              </span>
              <input
                type="date"
                className={inputClassName}
                value={item.dateAddedIso}
                onChange={(e) => onChange(item.id, { dateAddedIso: e.target.value })}
              />
            </label>

            {isBuildingProject ? (
              <>
                <div className="grid min-w-0 gap-2 sm:col-span-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <label className="block min-w-0">
                    <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                      X
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      className={inputClassName}
                      value={item.xStr}
                      onChange={(e) => onChange(item.id, { xStr: e.target.value })}
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
                      value={item.yStr}
                      onChange={(e) => onChange(item.id, { yStr: e.target.value })}
                      placeholder="e.g. 0.410000"
                      aria-label="Floor plan Y (normalized 0–1)"
                    />
                  </label>
                  <div className="flex min-w-0 flex-col justify-end gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={
                          'text-standard shrink-0 whitespace-nowrap ' +
                          (item.floorPlanId != null ? 'text-fg' : 'text-fg-muted')
                        }
                        aria-label="Floor plan location"
                      >
                        {floorPlanLabel}
                      </span>
                      <button
                        type="button"
                        className={secondaryButtonClass + ' whitespace-nowrap'}
                        disabled={isPickingFloorPlanLocation}
                        onClick={() => onStartFloorPlanPick(item.id)}
                      >
                        {isFloorPlanPickTarget ? 'Click plan…' : 'Set location on plan'}
                      </button>
                      {isFloorPlanPickTarget ? (
                        <button
                          type="button"
                          className="text-fg-muted text-standard hover:underline"
                          onClick={onCancelFloorPlanPick}
                        >
                          Cancel pick
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
                {isFloorPlanPickTarget ? (
                  <p className="text-fg-muted sm:col-span-2 text-standard">
                    Click the floor plan on the right to place the capture point, or press Esc.
                  </p>
                ) : null}
              </>
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
                      value={item.latStr}
                      onChange={(e) => onChange(item.id, { latStr: e.target.value })}
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
                      value={item.lngStr}
                      onChange={(e) => onChange(item.id, { lngStr: e.target.value })}
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
                        onClick={() => onStartMapPick(item.id)}
                      >
                        {isMapPickTarget ? 'Click map…' : 'Set location on map'}
                      </button>
                      {isMapPickTarget ? (
                        <button
                          type="button"
                          className="text-fg-muted text-standard hover:underline"
                          onClick={onCancelMapPick}
                        >
                          Cancel pick
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
                {isMapPickTarget ? (
                  <p className="text-fg-muted sm:col-span-2 text-standard">
                    Click the map on the right to place the capture point, or press Esc.
                  </p>
                ) : null}
              </>
            )}

            <div className="min-w-0 sm:col-span-2">
              <p className="text-fg-muted text-badge font-bold uppercase tracking-wide">File</p>
              <p className="text-standard break-all text-fg">{file.name}</p>
            </div>
            <div className="min-w-0">
              <p className="text-fg-muted text-badge font-bold uppercase tracking-wide">Size</p>
              <p className="text-standard text-fg">{formatBytes(file.size)}</p>
            </div>
            <div className="min-w-0">
              <p className="text-fg-muted text-badge font-bold uppercase tracking-wide">MIME</p>
              <p className="text-standard break-all text-fg">
                {file.type.trim() || '—'}
              </p>
            </div>
            <div className="min-w-0 sm:col-span-2">
              <p className="text-fg-muted text-badge font-bold uppercase tracking-wide">Dimensions</p>
              <p className="text-standard text-fg">
                {item.width != null && item.height != null
                  ? `${item.width} × ${item.height}px`
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AddFeatureFlow({ onCancel, onSave }: AddFeatureFlowProps) {
  const { project } = useActiveProject()
  const isBuildingProject = project.projectType === 'Building'
  const { isPickingLocation, startLocationPick, cancelLocationPick } = useMapLocationPick()
  const {
    isPickingFloorPlanLocation,
    startFloorPlanLocationPick,
    cancelFloorPlanLocationPick,
  } = useFloorPlanLocationPick()
  const [pickingLocationItemId, setPickingLocationItemId] = useState<string | null>(null)
  const [pickingFloorPlanItemId, setPickingFloorPlanItemId] = useState<string | null>(null)
  const fieldId = useId()
  const [pending, setPending] = useState<PendingItem[]>([])
  const pendingRef = useRef(pending)
  pendingRef.current = pending

  const canPickOnMap = project.projectType === 'Infrastructure' && mapboxTokenPresent()
  const pickDisabledReason =
    project.projectType !== 'Infrastructure'
      ? 'Geo pick is only available for infrastructure projects that use the map.'
      : !mapboxTokenPresent()
        ? 'Add VITE_MAPBOX_ACCESS_TOKEN to your .env file to use map pick.'
        : undefined

  useEffect(() => {
    if (!isPickingLocation) setPickingLocationItemId(null)
  }, [isPickingLocation])

  useEffect(() => {
    if (!isPickingFloorPlanLocation) setPickingFloorPlanItemId(null)
  }, [isPickingFloorPlanLocation])

  const cancelAllPicks = useCallback(() => {
    cancelLocationPick()
    cancelFloorPlanLocationPick()
    setPickingLocationItemId(null)
    setPickingFloorPlanItemId(null)
  }, [cancelLocationPick, cancelFloorPlanLocationPick])

  const revokeAllPending = useCallback((items: PendingItem[]) => {
    for (const p of items) {
      URL.revokeObjectURL(p.objectUrl)
    }
  }, [])

  const handleCancel = useCallback(() => {
    cancelAllPicks()
    revokeAllPending(pendingRef.current)
    setPending([])
    onCancel()
  }, [cancelAllPicks, onCancel, revokeAllPending])

  const fileInputId = `${fieldId}-add-feature-files`

  const addFiles = useCallback((fileList: FileList | null) => {
    if (fileList == null || fileList.length === 0) return
    setPending((prev) => {
      const day = todayIsoDate()
      const next: PendingItem[] = [...prev]
      for (const file of fileList) {
        next.push({
          id: crypto.randomUUID(),
          file,
          objectUrl: URL.createObjectURL(file),
          title: fileBaseTitle(file.name),
          dateCapturedIso: day,
          dateAddedIso: day,
          kind: inferKindFromFile(file),
          width: null,
          height: null,
          latStr: '',
          lngStr: '',
          xStr: '',
          yStr: '',
          floorPlanId: undefined,
        })
      }
      return next
    })
  }, [])

  const updateItem = useCallback(
    (id: string, partial: Partial<Omit<PendingItem, 'id' | 'file' | 'objectUrl'>>) => {
      setPending((list) => list.map((p) => (p.id === id ? { ...p, ...partial } : p)))
    },
    [],
  )

  const removeItem = useCallback(
    (id: string) => {
      if (pickingLocationItemId === id) cancelLocationPick()
      if (pickingFloorPlanItemId === id) cancelFloorPlanLocationPick()
      setPending((list) => {
        const found = list.find((p) => p.id === id)
        if (found) {
          URL.revokeObjectURL(found.objectUrl)
        }
        return list.filter((p) => p.id !== id)
      })
    },
    [
      cancelFloorPlanLocationPick,
      cancelLocationPick,
      pickingFloorPlanItemId,
      pickingLocationItemId,
    ],
  )

  const startMapPickForItem = useCallback(
    (itemId: string) => {
      setPickingLocationItemId(itemId)
      startLocationPick(itemId, (lng, lat) => {
        updateItem(itemId, { lngStr: lng.toFixed(6), latStr: lat.toFixed(6) })
        setPickingLocationItemId(null)
      })
    },
    [startLocationPick, updateItem],
  )

  const startFloorPlanPickForItem = useCallback(
    (itemId: string) => {
      setPickingFloorPlanItemId(itemId)
      startFloorPlanLocationPick(itemId, (floorPlanId, x, y) => {
        updateItem(itemId, {
          xStr: x.toFixed(6),
          yStr: y.toFixed(6),
          floorPlanId,
        })
        setPickingFloorPlanItemId(null)
      })
    },
    [startFloorPlanLocationPick, updateItem],
  )

  const handleCancelMapPick = useCallback(() => {
    cancelLocationPick()
    setPickingLocationItemId(null)
  }, [cancelLocationPick])

  const handleCancelFloorPlanPick = useCallback(() => {
    cancelFloorPlanLocationPick()
    setPickingFloorPlanItemId(null)
  }, [cancelFloorPlanLocationPick])

  const handleSave = useCallback(() => {
    if (pending.length === 0) return
    cancelAllPicks()
    const out: SpatialAsset[] = []
    for (const p of pending) {
      const cap = formatDisplayDateFromIsoDate(p.dateCapturedIso)
      const added =
        formatDisplayDateFromIsoDate(p.dateAddedIso) ||
        formatDisplayDateFromIsoDate(todayIsoDate())
      if (!added) continue
      const geo = isBuildingProject ? {} : parseGeoFields(p.lngStr, p.latStr)
      const floorPlanPosition = isBuildingProject
        ? parseFloorPlanFields(p.xStr, p.yStr, p.floorPlanId)
        : undefined
      out.push({
        id: crypto.randomUUID(),
        kind: p.kind,
        title: p.title.trim() || fileBaseTitle(p.file.name) || p.file.name,
        dateUploaded: added,
        dateCaptured: cap || undefined,
        fileUrl: p.objectUrl,
        fileSizeBytes: p.file.size,
        mimeType: p.file.type || undefined,
        width: p.width ?? undefined,
        height: p.height ?? undefined,
        ...geo,
        ...(floorPlanPosition != null ? { floorPlanPosition } : {}),
      })
    }
    if (out.length === 0) return
    setPending([])
    onSave(out)
  }, [cancelAllPicks, isBuildingProject, onSave, pending])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addFiles(e.dataTransfer.files)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const canSave = pending.length > 0

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="min-h-0 min-w-0 flex-1 overflow-auto" aria-label="Add new features">
        <div className="p-panel-padding">
          <label
            htmlFor={fileInputId}
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="text-fg-muted focus-within:border-fg-highlight focus-within:ring-fg-highlight/35 block cursor-pointer rounded-panel border-2 border-dashed border-stroke bg-panel p-6 text-center transition-[border-color,box-shadow] focus-within:ring-1"
            role="button"
            tabIndex={0}
            aria-label="Add feature files. Drop files here or browse."
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                document.getElementById(fileInputId)?.click()
              }
            }}
          >
            <input
              id={fileInputId}
              type="file"
              className="sr-only"
              accept="image/*,video/*"
              multiple
              onChange={(e) => {
                addFiles(e.target.files)
                e.target.value = ''
              }}
            />
            <p className="text-standard text-fg">
              Drag and drop images or video here, or{' '}
              <span className="text-fg-highlight font-bold underline">browse to upload</span>
            </p>
            <p className="mt-2 text-fg-muted text-badge">You can select multiple features at once.</p>
          </label>
        </div>

        {pending.length > 0 ? (
          <ul className="m-0 list-none p-0" aria-live="polite">
            {pending.map((item) => (
              <li key={item.id}>
                <PendingFeatureCard
                  item={item}
                  isBuildingProject={isBuildingProject}
                  canPickOnMap={canPickOnMap}
                  pickDisabledReason={pickDisabledReason}
                  isPickingLocation={isPickingLocation}
                  isPickingFloorPlanLocation={isPickingFloorPlanLocation}
                  isMapPickTarget={pickingLocationItemId === item.id}
                  isFloorPlanPickTarget={pickingFloorPlanItemId === item.id}
                  onChange={updateItem}
                  onRemove={removeItem}
                  onStartMapPick={startMapPickForItem}
                  onStartFloorPlanPick={startFloorPlanPickForItem}
                  onCancelMapPick={handleCancelMapPick}
                  onCancelFloorPlanPick={handleCancelFloorPlanPick}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="border-t border-stroke bg-panel px-panel-padding py-3">
        <div className="flex w-full min-w-0 items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="text-fg-muted text-standard rounded-panel px-3 py-1.5 hover:text-fg hover:underline focus-visible:ring-2 focus-visible:ring-fg-highlight/40 focus-visible:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={
              PRIMARY_BUTTON_CLASS +
              ' h-8 rounded-panel px-4 text-standard disabled:cursor-not-allowed disabled:opacity-40'
            }
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
