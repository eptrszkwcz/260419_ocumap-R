import { useCallback, useEffect, useMemo } from 'react'

import { useAuth } from '@/context/AuthContext'
import { useFeatureDraw } from '@/context/FeatureDrawContext'
import { useFloorPlanLocationPick } from '@/context/FloorPlanLocationPickContext'
import { useMapLocationPick } from '@/context/MapLocationPickContext'
import { useMarkerStylePreview } from '@/context/MarkerStylePreviewContext'
import {
  type FeatureGeometryType,
  type MarkerLogEntry,
  type SpatialAsset,
} from '@/data/sampleAssets'
import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'
import { DrawnFeatureGeometryFields } from '@/panels/library/featureMetadata/DrawnFeatureGeometryFields'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
} from '@/panels/library/featureMetadata/styles'
import { FeatureLogPanel } from '@/panels/library/FeatureLogPanel'
import { buildDrawnAssetFromSession } from '@/panels/map/FeatureDrawConfirmPanel'
import { normalizeMarkerColor } from '@/panels/map/markerColors'
import { createUserLogEntry } from '@/panels/map/markerLogUtils'

type DrawnFeatureMetadataPanelProps = {
  asset: SpatialAsset
  mode?: 'draft' | 'saved'
  isBuildingProject?: boolean
  geometryType?: FeatureGeometryType | null
  geometryConfirmed?: boolean
  onSave: (saved: SpatialAsset) => void
  /** Immediate patch for comments (and similar) without ending geometry edit. */
  onPatch?: (updated: SpatialAsset) => void
  onCancel: () => void
}

function migrateNotesToLogEntries(
  asset: SpatialAsset,
  author: { displayName: string; email?: string },
): { logEntries: MarkerLogEntry[]; notes: string | undefined; didMigrate: boolean } {
  const existing = asset.logEntries ?? []
  const notes = asset.notes?.trim() ?? ''
  if (existing.length > 0 || notes === '') {
    return { logEntries: existing, notes: asset.notes, didMigrate: false }
  }
  return {
    logEntries: [
      {
        id: `log-migrated-${asset.id}`,
        body: notes,
        authorDisplayName: author.displayName,
        authorEmail: author.email,
        createdAt: (() => {
          const d = new Date(asset.dateUploaded)
          return Number.isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString()
        })(),
        kind: 'user',
      },
    ],
    notes: undefined,
    didMigrate: true,
  }
}

export function DrawnFeatureMetadataPanel({
  asset,
  mode = 'draft',
  isBuildingProject = true,
  geometryType: geometryTypeProp = null,
  geometryConfirmed: geometryConfirmedProp = false,
  onSave,
  onPatch,
  onCancel,
}: DrawnFeatureMetadataPanelProps) {
  const isSaved = mode === 'saved'
  const { user } = useAuth()
  const { cancelLocationPick } = useMapLocationPick()
  const { cancelFloorPlanLocationPick } = useFloorPlanLocationPick()
  const {
    floorPlanId,
    floorPlanVertices,
    mapVertices,
    draftMarkerColor,
    geometryType: draftGeometryType,
    geometryConfirmed: draftGeometryConfirmed,
    isEditingFeature,
    editingFeatureId,
    drawPhase,
    cancelEditFeature,
  } = useFeatureDraw()

  const isEditingThis = isEditingFeature && editingFeatureId === asset.id
  const geometryType = isSaved
    ? isEditingThis
      ? draftGeometryType ?? asset.geometryType ?? null
      : asset.geometryType ?? null
    : geometryTypeProp ?? draftGeometryType
  const geometryConfirmed = isSaved
    ? isEditingThis
      ? draftGeometryConfirmed
      : true
    : geometryConfirmedProp || draftGeometryConfirmed

  const { setMarkerStylePreview, clearMarkerStylePreview } = useMarkerStylePreview()

  const markerColor = normalizeMarkerColor(asset.markerColor ?? draftMarkerColor)

  useEffect(() => {
    setMarkerStylePreview({ featureId: asset.id, color: markerColor })
    return () => clearMarkerStylePreview()
  }, [asset.id, markerColor, setMarkerStylePreview, clearMarkerStylePreview])

  useEffect(() => {
    if (!isSaved || onPatch == null || user == null) return
    const migrated = migrateNotesToLogEntries(asset, user)
    if (!migrated.didMigrate) return
    onPatch({ ...asset, logEntries: migrated.logEntries, notes: undefined })
  }, [asset, isSaved, onPatch, user])

  const logEntries = useMemo(() => {
    if (!isSaved) return []
    const author = user ?? { displayName: 'User' }
    return migrateNotesToLogEntries(asset, author).logEntries
  }, [asset, isSaved, user])

  const handleCancel = useCallback(() => {
    cancelLocationPick()
    cancelFloorPlanLocationPick()
    if (isEditingThis) cancelEditFeature()
    if (!isSaved) {
      onCancel()
      return
    }
  }, [
    cancelEditFeature,
    cancelFloorPlanLocationPick,
    cancelLocationPick,
    isEditingThis,
    isSaved,
    onCancel,
  ])

  const isDirty = !isSaved || isEditingThis

  const handleSave = useCallback(() => {
    if (!geometryConfirmed || geometryType == null) return
    const title = asset.title.trim() || 'Untitled feature'
    const color = normalizeMarkerColor(asset.markerColor ?? draftMarkerColor)

    if (isSaved) {
      if (isEditingThis) {
        const saved = buildDrawnAssetFromSession(
          { ...asset, title, markerColor: color },
          geometryType,
          floorPlanId,
          floorPlanVertices,
          mapVertices,
        )
        onSave(saved)
        return
      }
      onSave({ ...asset, title, markerColor: color })
      return
    }

    const saved = buildDrawnAssetFromSession(
      { ...asset, title, markerColor: color },
      geometryType,
      floorPlanId,
      floorPlanVertices,
      mapVertices,
    )
    onSave(saved)
  }, [
    asset,
    draftMarkerColor,
    floorPlanId,
    floorPlanVertices,
    geometryConfirmed,
    geometryType,
    isEditingThis,
    isSaved,
    mapVertices,
    onSave,
  ])

  const persistLogEntries = useCallback(
    (updater: (prev: MarkerLogEntry[]) => MarkerLogEntry[]) => {
      if (!isSaved) return
      const author = user ?? { displayName: 'User' }
      const migrated = migrateNotesToLogEntries(asset, author)
      const nextEntries = updater(migrated.logEntries)
      const patch = onPatch ?? onSave
      patch({ ...asset, logEntries: nextEntries, notes: undefined })
    },
    [asset, isSaved, onPatch, onSave, user],
  )

  const handleAddLogEntry = useCallback(
    (body: string) => {
      if (user == null) return
      const entry = createUserLogEntry(body, user)
      persistLogEntries((prev) => [...prev, entry])
    },
    [persistLogEntries, user],
  )

  const handleUpdateLogEntry = useCallback(
    (entryId: string, body: string) => {
      const trimmed = body.trim()
      if (trimmed === '') return
      const now = new Date().toISOString()
      persistLogEntries((prev) =>
        prev.map((entry) =>
          entry.id === entryId ? { ...entry, body: trimmed, updatedAt: now } : entry,
        ),
      )
    },
    [persistLogEntries],
  )

  const handleDeleteLogEntry = useCallback(
    (entryId: string) => {
      persistLogEntries((prev) => prev.filter((entry) => entry.id !== entryId))
    },
    [persistLogEntries],
  )

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col" role="region" aria-label="Drawn feature details">
      {isSaved ? (
        <>
          {isEditingThis ? (
            <>
              <div className="shrink-0 px-panel-padding pt-panel-padding pb-4">
                <DrawnFeatureGeometryFields
                  asset={asset}
                  isBuildingProject={isBuildingProject}
                  liveFloorPlanVertices={floorPlanVertices}
                  liveMapVertices={mapVertices}
                  liveFloorPlanId={floorPlanId}
                />
                {!geometryConfirmed ? (
                  <p className="text-fg-muted mt-4 font-sans text-standard" role="status">
                    Edit the shape on the map, then review and confirm.
                  </p>
                ) : drawPhase === 'confirmed' ? (
                  <p className="text-fg-muted mt-4 font-sans text-standard" role="status">
                    Shape confirmed. Save to apply changes.
                  </p>
                ) : null}
              </div>
              <div className="border-stroke shrink-0 border-b" aria-hidden />
            </>
          ) : null}
          <FeatureLogPanel
            entries={logEntries}
            onAdd={handleAddLogEntry}
            onUpdate={handleUpdateLogEntry}
            onDelete={handleDeleteLogEntry}
          />
        </>
      ) : (
        <div className="min-h-0 min-w-0 flex-1 overflow-auto p-panel-padding">
          {!geometryConfirmed ? (
            <p className="text-fg-muted font-sans text-standard" role="status">
              Confirm the shape on the map before saving.
            </p>
          ) : (
            <p className="text-fg-muted font-sans text-standard" role="status">
              Shape confirmed. Save to add this feature to the library.
            </p>
          )}
        </div>
      )}

      {isDirty ? (
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
              disabled={!geometryConfirmed || geometryType == null}
              className={
                PRIMARY_BUTTON_CLASS +
                ' h-8 rounded-panel px-4 text-standard focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40'
              }
            >
              Save
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
