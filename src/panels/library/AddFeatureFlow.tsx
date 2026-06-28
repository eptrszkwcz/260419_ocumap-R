import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { useActiveProject } from '@/context/ActiveProjectContext'
import { useFloorPlanLocationPick } from '@/context/FloorPlanLocationPickContext'
import { useMapLocationPick } from '@/context/MapLocationPickContext'
import { useMarkerStylePreview } from '@/context/MarkerStylePreviewContext'
import type { AssetKind, SpatialAsset } from '@/data/sampleAssets'
import { inferKindFromFile } from '@/data/sampleAssets'
import { formatDisplayDateFromIsoDate, todayIsoDate } from '@/lib/formatDisplayDateFromIsoDate'
import { formatFloorPlanCoord } from '@/lib/formatFloorPlanCoord'
import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'
import { DEFAULT_FLOOR_PLAN_ID, type FloorPlanId } from '@/panels/map/mapFloorPlans'
import { normalizeMarkerColor } from '@/panels/map/markerColors'
import { FeatureMetadataForm } from '@/panels/library/featureMetadata/FeatureMetadataForm'
import { AddFeatureMethodPicker } from '@/panels/library/addFeature/AddFeatureMethodPicker'
import { FileUploadDropZone } from '@/components/FileUploadDropZone'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
} from '@/panels/library/featureMetadata/styles'
import {
  extensionLabelFromMimeAndKind,
  fileSizeLabel,
  resolutionLabel,
} from '@/panels/library/featureMetadata/fileInfo'
import { mapboxTokenPresent } from '@/panels/library/featureMetadata/mapboxToken'
import type { FeatureMetadataDraft } from '@/panels/library/featureMetadata/types'

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
  dateUploadedIso: string
  kind: AssetKind
  width: number | null
  height: number | null
  latStr: string
  lngStr: string
  xStr: string
  yStr: string
  floorPlanId: FloorPlanId | undefined
  markerColor: string
}

function fileBaseTitle(name: string): string {
  const i = name.lastIndexOf('.')
  return (i > 0 ? name.slice(0, i) : name).trim() || name
}

function pendingToDraft(item: PendingItem): FeatureMetadataDraft {
  return {
    title: item.title,
    kind: item.kind,
    dateCapturedIso: item.dateCapturedIso,
    dateUploadedIso: item.dateUploadedIso,
    latStr: item.latStr,
    lngStr: item.lngStr,
    xStr: item.xStr,
    yStr: item.yStr,
    floorPlanId: item.floorPlanId,
    markerColor: item.markerColor,
  }
}

type AddFeatureFlowProps = {
  onCancel: () => void
  onSave: (assets: SpatialAsset[]) => void
  onStartDraw: () => void
}

type PendingFeatureCardProps = {
  item: PendingItem
  fileIndex: number
  fileTotal: number
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
  fileIndex,
  fileTotal,
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
  const { setMarkerStylePreview, clearMarkerStylePreview } = useMarkerStylePreview()
  const isVideo = file.type.startsWith('video/')
  const previewActive = isMapPickTarget || isFloorPlanPickTarget

  useEffect(() => {
    if (!previewActive) return
    setMarkerStylePreview({ featureId: item.id, color: item.markerColor })
    return () => clearMarkerStylePreview()
  }, [
    item.id,
    item.markerColor,
    previewActive,
    setMarkerStylePreview,
    clearMarkerStylePreview,
  ])

  return (
    <div className="relative px-panel-padding py-[36px]">
      <div className="absolute top-[36px] right-panel-padding flex flex-col items-end gap-1">
        <p
          className="text-fg text-standard font-bold"
          aria-label={`File ${fileIndex} of ${fileTotal}`}
        >
          {fileIndex} of {fileTotal}
        </p>
        <button
          type="button"
          className="text-fg-muted text-standard cursor-pointer font-normal underline hover:text-fg focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.title || file.name} from upload`}
        >
          Remove from upload
        </button>
      </div>
      <FeatureMetadataForm
        draft={pendingToDraft(item)}
        onDraftChange={(patch) => onChange(item.id, patch)}
        fileInfo={{
          fileSizeLabel: fileSizeLabel(file.size),
          resolutionLabel: resolutionLabel(item.width, item.height),
          extensionLabel: extensionLabelFromMimeAndKind(file.type, item.kind, file.name),
        }}
        preview={{
          url: objectUrl,
          isVideo,
          onImageLoad: (width, height) => onChange(item.id, { width, height }),
        }}
        isBuildingProject={isBuildingProject}
        locationPick={{
          canPickOnMap,
          pickDisabledReason,
          isMapPickInProgress: isPickingLocation,
          isFloorPlanPickInProgress: isPickingFloorPlanLocation,
          isThisFormMapPickTarget: isMapPickTarget,
          isThisFormFloorPlanPickTarget: isFloorPlanPickTarget,
          onMapPickClick: () => {
            if (isMapPickTarget) {
              onCancelMapPick()
            } else {
              onStartMapPick(item.id)
            }
          },
          onFloorPlanPickClick: () => {
            if (isFloorPlanPickTarget) {
              onCancelFloorPlanPick()
            } else {
              onStartFloorPlanPick(item.id)
            }
          },
        }}
      />
    </div>
  )
}

export function AddFeatureFlow({ onCancel, onSave, onStartDraw }: AddFeatureFlowProps) {
  const { project } = useActiveProject()
  const isBuildingProject = project.projectType === 'Building'
  const [step, setStep] = useState<'choose' | 'upload'>('choose')
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
          dateUploadedIso: day,
          kind: inferKindFromFile(file),
          width: null,
          height: null,
          latStr: '',
          lngStr: '',
          xStr: '',
          yStr: '',
          floorPlanId: undefined,
          markerColor: normalizeMarkerColor(undefined),
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
          xStr: formatFloorPlanCoord(x),
          yStr: formatFloorPlanCoord(y),
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
        formatDisplayDateFromIsoDate(p.dateUploadedIso) ||
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
        markerColor: normalizeMarkerColor(p.markerColor),
        ...geo,
        ...(floorPlanPosition != null ? { floorPlanPosition } : {}),
      })
    }
    if (out.length === 0) return
    setPending([])
    onSave(out)
  }, [cancelAllPicks, isBuildingProject, onSave, pending])

  const canSave = pending.length > 0

  if (step === 'choose') {
    return (
      <AddFeatureMethodPicker
        onChooseUpload={() => setStep('upload')}
        onChooseDraw={onStartDraw}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="min-h-0 min-w-0 flex-1 overflow-auto" aria-label="Add new features">
        <div className="p-panel-padding">
          <FileUploadDropZone
            inputId={fileInputId}
            accept="image/*,video/*"
            ariaLabel="Add feature files. Drop files here or browse."
            onFilesAdded={addFiles}
          >
            <p className="text-standard text-fg">
              Drag and drop images or video here, or{' '}
              <span className="text-fg-highlight font-bold underline">browse to upload</span>
            </p>
            <p className="mt-2 text-fg-muted text-badge">You can select multiple features at once.</p>
          </FileUploadDropZone>
        </div>

        {pending.length > 0 ? (
          <ul
            className="m-0 list-none divide-y divide-stroke border-t border-stroke p-0"
            aria-live="polite"
          >
            {pending.map((item, index) => (
              <li key={item.id}>
                <PendingFeatureCard
                  item={item}
                  fileIndex={index + 1}
                  fileTotal={pending.length}
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
        <div className={featureMetadataFooterActionsClassName}>
          <button
            type="button"
            onClick={handleCancel}
            className={featureMetadataFooterCancelButtonClass}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={
              PRIMARY_BUTTON_CLASS +
              ' h-8 rounded-panel px-4 text-standard focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40'
            }
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
