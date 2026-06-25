import { useCallback, useEffect, useMemo, useState } from 'react'

import { FeatureMarkerColorField } from '@/components/FeatureMarkerColorField'
import { useFeatureDraw } from '@/context/FeatureDrawContext'
import { useFloorPlanLocationPick } from '@/context/FloorPlanLocationPickContext'
import { useMapLocationPick } from '@/context/MapLocationPickContext'
import { useMarkerStylePreview } from '@/context/MarkerStylePreviewContext'
import { getGeometryTypeLabel, type FeatureGeometryType, type SpatialAsset } from '@/data/sampleAssets'
import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'
import { DrawnFeatureGeometryFields } from '@/panels/library/featureMetadata/DrawnFeatureGeometryFields'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
  featureMetadataFormGridClassName,
  featureMetadataInputClassName,
  featureMetadataSecondaryButtonClass,
  featureMetadataSelectClassName,
} from '@/panels/library/featureMetadata/styles'
import { buildDrawnAssetFromSession } from '@/panels/map/FeatureDrawConfirmPanel'
import { normalizeMarkerColor } from '@/panels/map/markerColors'

type DrawnFeatureDraft = {
  title: string
  markerColor: string
  notes: string
}

type DrawnFeatureMetadataPanelProps = {
  asset: SpatialAsset
  mode?: 'draft' | 'saved'
  isBuildingProject?: boolean
  geometryType?: FeatureGeometryType | null
  geometryConfirmed?: boolean
  onSave: (saved: SpatialAsset) => void
  onCancel: () => void
}

export function DrawnFeatureMetadataPanel({
  asset,
  mode = 'draft',
  isBuildingProject = true,
  geometryType: geometryTypeProp = null,
  geometryConfirmed: geometryConfirmedProp = false,
  onSave,
  onCancel,
}: DrawnFeatureMetadataPanelProps) {
  const isSaved = mode === 'saved'
  const { cancelLocationPick } = useMapLocationPick()
  const { cancelFloorPlanLocationPick } = useFloorPlanLocationPick()
  const {
    floorPlanId,
    floorPlanVertices,
    mapVertices,
    draftMarkerColor,
    setDraftMarkerColor,
    geometryType: draftGeometryType,
    geometryConfirmed: draftGeometryConfirmed,
    isEditingFeature,
    editingFeatureId,
    drawPhase,
    startEditFeature,
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

  const [draft, setDraft] = useState<DrawnFeatureDraft>(() => ({
    title: asset.title,
    markerColor: normalizeMarkerColor(asset.markerColor ?? draftMarkerColor),
    notes: asset.notes ?? '',
  }))

  useEffect(() => {
    setDraft({
      title: asset.title,
      markerColor: normalizeMarkerColor(asset.markerColor ?? draftMarkerColor),
      notes: asset.notes ?? '',
    })
  }, [asset.id, asset.title, asset.markerColor, asset.notes, draftMarkerColor])

  useEffect(() => {
    setMarkerStylePreview({ featureId: asset.id, color: draft.markerColor })
    if (!isSaved || isEditingThis) setDraftMarkerColor(draft.markerColor)
    return () => clearMarkerStylePreview()
  }, [
    asset.id,
    draft.markerColor,
    isSaved,
    isEditingThis,
    setDraftMarkerColor,
    setMarkerStylePreview,
    clearMarkerStylePreview,
  ])

  const handleEditFeature = useCallback(() => {
    cancelLocationPick()
    cancelFloorPlanLocationPick()
    startEditFeature(asset)
  }, [asset, cancelFloorPlanLocationPick, cancelLocationPick, startEditFeature])

  const handleCancel = useCallback(() => {
    cancelLocationPick()
    cancelFloorPlanLocationPick()
    if (isEditingThis) cancelEditFeature()
    if (!isSaved) {
      onCancel()
      return
    }
    setDraft({
      title: asset.title,
      markerColor: normalizeMarkerColor(asset.markerColor ?? draftMarkerColor),
      notes: asset.notes ?? '',
    })
  }, [
    asset,
    cancelEditFeature,
    cancelFloorPlanLocationPick,
    cancelLocationPick,
    draftMarkerColor,
    isEditingThis,
    isSaved,
    onCancel,
  ])

  const isFieldDirty = useMemo(() => {
    const savedMarkerColor = normalizeMarkerColor(asset.markerColor)
    const draftMarkerColor = normalizeMarkerColor(draft.markerColor)
    const savedNotes = asset.notes?.trim() ?? ''
    const draftNotes = draft.notes.trim()
    return (
      draft.title !== asset.title ||
      draftMarkerColor !== savedMarkerColor ||
      draftNotes !== savedNotes
    )
  }, [asset.markerColor, asset.notes, asset.title, draft.markerColor, draft.notes, draft.title])

  const isDirty = !isSaved || isEditingThis || isFieldDirty

  const handleSave = useCallback(() => {
    if (!geometryConfirmed || geometryType == null) return
    const title = draft.title.trim() || 'Untitled feature'
    const markerColor = normalizeMarkerColor(draft.markerColor)
    const notes = draft.notes.trim() || undefined

    if (isSaved) {
      if (isEditingThis) {
        const saved = buildDrawnAssetFromSession(
          { ...asset, title, notes, markerColor },
          geometryType,
          floorPlanId,
          floorPlanVertices,
          mapVertices,
        )
        onSave(saved)
        return
      }
      onSave({ ...asset, title, markerColor, notes })
      return
    }

    const saved = buildDrawnAssetFromSession(
      { ...asset, title, notes, markerColor },
      geometryType,
      floorPlanId,
      floorPlanVertices,
      mapVertices,
    )
    onSave(saved)
  }, [
    asset,
    draft,
    floorPlanId,
    floorPlanVertices,
    geometryConfirmed,
    geometryType,
    isEditingThis,
    isSaved,
    mapVertices,
    onSave,
  ])

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col" role="region" aria-label="Drawn feature details">
      <div className="min-h-0 min-w-0 flex-1 overflow-auto p-panel-padding">
        <div className={featureMetadataFormGridClassName}>
          <label className="block min-w-0 sm:col-span-2">
            <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
              Name
            </span>
            <input
              type="text"
              className={featureMetadataInputClassName}
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              aria-label="Feature name"
            />
          </label>

          <label className="block min-w-0">
            <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
              File type
            </span>
            <select
              className={featureMetadataSelectClassName + ' opacity-70'}
              value={geometryType ?? 'point'}
              disabled
              aria-label="Geometry type"
            >
              <option value="point">{getGeometryTypeLabel('point')}</option>
              <option value="line">{getGeometryTypeLabel('line')}</option>
              <option value="polygon">{getGeometryTypeLabel('polygon')}</option>
            </select>
          </label>

          <FeatureMarkerColorField
            value={draft.markerColor}
            onChange={(markerColor) => setDraft((d) => ({ ...d, markerColor }))}
          />

          <label className="block min-w-0 sm:col-span-2">
            <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
              Notes
            </span>
            <textarea
              className={featureMetadataInputClassName + ' min-h-24 resize-y'}
              value={draft.notes}
              onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
              aria-label="Notes"
            />
          </label>

          {isSaved ? (
            <DrawnFeatureGeometryFields
              asset={asset}
              isBuildingProject={isBuildingProject}
              liveFloorPlanVertices={isEditingThis ? floorPlanVertices : undefined}
              liveMapVertices={isEditingThis ? mapVertices : undefined}
              liveFloorPlanId={isEditingThis ? floorPlanId : undefined}
            />
          ) : null}

          {isSaved && !isEditingThis ? (
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={handleEditFeature}
                className={featureMetadataSecondaryButtonClass}
              >
                Edit Feature
              </button>
            </div>
          ) : null}
        </div>

        {!geometryConfirmed ? (
          <p className="text-fg-muted mt-4 font-sans text-standard" role="status">
            {isEditingThis
              ? 'Edit the shape on the map, then review and confirm.'
              : 'Confirm the shape on the map before saving.'}
          </p>
        ) : isEditingThis && drawPhase === 'confirmed' ? (
          <p className="text-fg-muted mt-4 font-sans text-standard" role="status">
            Shape confirmed. Save to apply changes.
          </p>
        ) : null}
      </div>

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
