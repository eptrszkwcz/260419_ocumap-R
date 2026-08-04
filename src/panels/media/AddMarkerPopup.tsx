import { useCallback, useState } from 'react'

import { MarkerColorPicker } from '@/components/MarkerColorPicker'
import { useMediaMarkerFlow } from '@/context/MediaMarkerFlowContext'
import type { SpatialAsset } from '@/data/sampleAssets'
import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
  featureMetadataInputClassName,
} from '@/panels/library/featureMetadata/styles'
import { normalizeMarkerColor } from '@/panels/map/markerColors'
import {
  mapOverlayInsetRightClassName,
  mapOverlayInsetTopClassName,
} from '@/panels/map/mapOverlayLayout'

type AddMarkerPopupProps = {
  parentAsset: SpatialAsset
}

export function AddMarkerPopup({ parentAsset }: AddMarkerPopupProps) {
  const {
    panelPhase,
    draftMarker,
    updateDraftMarker,
    confirmPlacement,
    saveMarker,
    cancelFlow,
    openCancelMarkerConfirmation,
  } = useMediaMarkerFlow()

  const [notes, setNotes] = useState('')

  const handleConfirm = useCallback(() => {
    const count = parentAsset.mediaMarkers?.length ?? 0
    confirmPlacement(count)
  }, [confirmPlacement, parentAsset.mediaMarkers?.length])

  const handleSave = useCallback(() => {
    const saved = saveMarker(notes)
    if (saved == null) return
    cancelFlow()
  }, [cancelFlow, notes, saveMarker])

  const handleColorChange = useCallback(
    (raw: string) => {
      updateDraftMarker({ color: normalizeMarkerColor(raw), isPreliminary: false })
    },
    [updateDraftMarker],
  )

  if (panelPhase == null) {
    return null
  }

  const markerColor = normalizeMarkerColor(draftMarker?.color ?? '#2563eb')

  return (
    <div
      className={
        'pointer-events-none absolute z-20 flex ' +
        mapOverlayInsetTopClassName +
        ' ' +
        mapOverlayInsetRightClassName
      }
    >
      <div
        className="pointer-events-auto w-[260px] rounded-panel border border-stroke bg-panel p-4 shadow-sm"
        role="dialog"
        aria-label="Add marker"
      >
        {panelPhase === 'confirm' ? (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-fg font-sans text-standard">
              Adjust marker location on the media or map if necessary
            </p>
            <button
              type="button"
              onClick={handleConfirm}
              className={
                PRIMARY_BUTTON_CLASS +
                ' h-8 w-full rounded-panel text-standard focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'
              }
            >
              Confirm Marker Locations
            </button>
          </div>
        ) : draftMarker != null ? (
          <div className="flex h-[300px] flex-col gap-3">
            <div className="block min-w-0 shrink-0">
              <span className="text-fg-muted mb-1 block text-badge font-bold uppercase tracking-wide">
                Name
              </span>
              <div className="flex min-w-0 items-end gap-2">
                <input
                  type="text"
                  className={featureMetadataInputClassName + ' min-w-0 flex-1'}
                  value={draftMarker.name ?? ''}
                  onChange={(e) => updateDraftMarker({ name: e.target.value })}
                  aria-label="Marker name"
                />
                <MarkerColorPicker
                  value={markerColor}
                  onChange={handleColorChange}
                  ariaLabel="Pick marker color"
                />
              </div>
            </div>

            <label className="flex min-h-0 min-w-0 flex-1 flex-col">
              <span className="text-fg-muted mb-1 block shrink-0 text-badge font-bold uppercase tracking-wide">
                Notes
              </span>
              <textarea
                className={
                  featureMetadataInputClassName +
                  ' min-h-0 flex-1 resize-none py-2 leading-normal'
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a comment…"
                aria-label="Marker notes"
              />
            </label>

            <div className={featureMetadataFooterActionsClassName + ' shrink-0'}>
              <button
                type="button"
                onClick={openCancelMarkerConfirmation}
                className={featureMetadataFooterCancelButtonClass}
              >
                Cancel
              </button>
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
        ) : null}
      </div>
    </div>
  )
}
