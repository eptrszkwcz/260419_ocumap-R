import { useFeatureDraw } from '@/context/FeatureDrawContext'
import { useFloorPlanLocationPick } from '@/context/FloorPlanLocationPickContext'
import { useMapLocationPick } from '@/context/MapLocationPickContext'
import {
  overlayBarInsetStyle,
  overlayBtnClass,
  overlayBtnPrimaryClass,
} from '@/components/overlayControlButtons'
import { GearIcon, PencilIcon, RulerIcon } from '@/components/overlayControlIcons'
import type { FloorPlanId } from '@/panels/map/mapFloorPlans'

type MapOverlayControlBarProps = {
  floorPlanId?: FloorPlanId
  hidden?: boolean
}

export function MapOverlayControlBar({ floorPlanId, hidden = false }: MapOverlayControlBarProps) {
  const { isDrawing, isEditingFeature, cancelDraw, startDraw } = useFeatureDraw()
  const { isPickingLocation, cancelLocationPick } = useMapLocationPick()
  const { isPickingFloorPlanLocation, cancelFloorPlanLocationPick } = useFloorPlanLocationPick()

  if (hidden || isPickingLocation || isPickingFloorPlanLocation || isEditingFeature) {
    return null
  }

  const handlePencilClick = () => {
    if (isDrawing) {
      cancelDraw()
      return
    }
    cancelLocationPick()
    cancelFloorPlanLocationPick()
    if (floorPlanId != null) {
      startDraw(floorPlanId)
    } else {
      startDraw()
    }
  }

  return (
    <div
      className="pointer-events-none absolute z-20 flex items-end justify-end"
      style={overlayBarInsetStyle}
    >
      <div className="pointer-events-auto flex gap-2" role="toolbar" aria-label="Map controls">
        <button type="button" className={overlayBtnClass} aria-label="Measure distance">
          <RulerIcon />
        </button>
        <button type="button" className={overlayBtnClass} aria-label="Map settings">
          <GearIcon />
        </button>
        <button
          type="button"
          className={overlayBtnPrimaryClass}
          aria-label={isDrawing ? 'Stop drawing feature' : 'Draw a feature'}
          aria-pressed={isDrawing}
          onClick={handlePencilClick}
        >
          <PencilIcon />
        </button>
      </div>
    </div>
  )
}
