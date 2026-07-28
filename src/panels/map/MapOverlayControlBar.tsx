import { useFeatureDraw } from '@/context/FeatureDrawContext'
import { useFloorPlanLocationPick } from '@/context/FloorPlanLocationPickContext'
import { useMapLocationPick } from '@/context/MapLocationPickContext'
import { useMediaMarkerFlow } from '@/context/MediaMarkerFlowContext'
import { useViewDirectionAdjust } from '@/context/ViewDirectionAdjustContext'
import { DelayedTooltip } from '@/components/DelayedTooltip'
import {
  overlayBarInsetStyle,
  overlayBtnClass,
  overlayBtnPrimaryClass,
} from '@/components/overlayControlButtons'
import { GearIcon, PencilIcon, RulerIcon } from '@/components/overlayControlIcons'
import type { FloorPlanId } from '@/panels/map/mapFloorPlans'
import { useStartFeatureDraw } from '@/panels/map/useStartFeatureDraw'

type MapOverlayControlBarProps = {
  floorPlanId?: FloorPlanId
  hidden?: boolean
  readOnly?: boolean
}

export function MapOverlayControlBar({
  floorPlanId,
  hidden = false,
  readOnly = false,
}: MapOverlayControlBarProps) {
  const { isDrawing, isEditingFeature, cancelDraw } = useFeatureDraw()
  const { isPickingLocation } = useMapLocationPick()
  const { isPickingFloorPlanLocation } = useFloorPlanLocationPick()
  const { isAdjustingDirection } = useViewDirectionAdjust()
  const { isPlacingMediaMarker, isAdjustingMediaMarker } = useMediaMarkerFlow()
  const startFeatureDraw = useStartFeatureDraw()

  if (
    hidden ||
    isPickingLocation ||
    isPickingFloorPlanLocation ||
    isAdjustingDirection ||
    isPlacingMediaMarker ||
    isAdjustingMediaMarker ||
    isEditingFeature
  ) {
    return null
  }

  const handlePencilClick = () => {
    if (isDrawing) {
      cancelDraw()
      return
    }
    startFeatureDraw({ floorPlanId })
  }

  const pencilTooltip = isDrawing
    ? 'Stop adding feature'
    : floorPlanId != null
      ? 'Add feature to plan'
      : 'Add feature to map'

  return (
    <div
      className="pointer-events-none absolute z-20 flex items-end justify-end"
      style={overlayBarInsetStyle}
    >
      <div className="pointer-events-auto flex gap-2" role="toolbar" aria-label="Map controls">
        <DelayedTooltip label="Measure distance">
          <button type="button" className={overlayBtnClass} aria-label="Measure distance">
            <RulerIcon />
          </button>
        </DelayedTooltip>
        <DelayedTooltip label="Map settings">
          <button type="button" className={overlayBtnClass} aria-label="Map settings">
            <GearIcon />
          </button>
        </DelayedTooltip>
        {readOnly ? null : (
          <DelayedTooltip label={pencilTooltip}>
            <button
              type="button"
              className={overlayBtnPrimaryClass}
              aria-label={isDrawing ? 'Stop drawing feature' : 'Draw a feature'}
              aria-pressed={isDrawing}
              onClick={handlePencilClick}
            >
              <PencilIcon />
            </button>
          </DelayedTooltip>
        )}
      </div>
    </div>
  )
}
