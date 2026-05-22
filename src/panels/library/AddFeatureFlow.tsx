import { useCallback, useId, useRef, useState } from 'react'

import type { AssetKind, SpatialAsset } from '@/data/sampleAssets'
import { inferKindFromFile } from '@/data/sampleAssets'
import { formatBytes } from '@/lib/formatBytes'
import { formatDisplayDateFromIsoDate, todayIsoDate } from '@/lib/formatDisplayDateFromIsoDate'
import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'

const inputClassName =
  'text-fg placeholder:text-fg-disabled h-8 w-full min-w-0 rounded-panel border border-stroke bg-panel px-2.5 text-standard leading-none focus-visible:border-fg-highlight focus-visible:ring-1 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

const selectClassName = inputClassName + ' appearance-auto py-0'

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
}

function fileBaseTitle(name: string): string {
  const i = name.lastIndexOf('.')
  return (i > 0 ? name.slice(0, i) : name).trim() || name
}

type AddFeatureFlowProps = {
  onCancel: () => void
  onSave: (assets: SpatialAsset[]) => void
}

function PendingFeatureCard({
  item,
  onChange,
  onRemove,
}: {
  item: PendingItem
  onChange: (id: string, partial: Partial<Omit<PendingItem, 'id' | 'file' | 'objectUrl'>>) => void
  onRemove: (id: string) => void
}) {
  const { file, objectUrl } = item
  const isVideo = file.type.startsWith('video/')
  const isImage = file.type.startsWith('image/')

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
  const fieldId = useId()
  const [pending, setPending] = useState<PendingItem[]>([])
  const pendingRef = useRef(pending)
  pendingRef.current = pending

  const revokeAllPending = useCallback((items: PendingItem[]) => {
    for (const p of items) {
      URL.revokeObjectURL(p.objectUrl)
    }
  }, [])

  const handleCancel = useCallback(() => {
    revokeAllPending(pendingRef.current)
    setPending([])
    onCancel()
  }, [onCancel, revokeAllPending])

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
      setPending((list) => {
        const found = list.find((p) => p.id === id)
        if (found) {
          URL.revokeObjectURL(found.objectUrl)
        }
        return list.filter((p) => p.id !== id)
      })
    },
    [],
  )

  const handleSave = useCallback(() => {
    if (pending.length === 0) return
    const out: SpatialAsset[] = []
    for (const p of pending) {
      const cap = formatDisplayDateFromIsoDate(p.dateCapturedIso)
      const added =
        formatDisplayDateFromIsoDate(p.dateAddedIso) ||
        formatDisplayDateFromIsoDate(todayIsoDate())
      if (!added) continue
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
      })
    }
    if (out.length === 0) return
    setPending([])
    onSave(out)
  }, [onSave, pending])

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
                <PendingFeatureCard item={item} onChange={updateItem} onRemove={removeItem} />
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
