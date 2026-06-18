import type { AssetKind } from '@/data/sampleAssets'
import type { FloorPlanId } from '@/panels/map/mapFloorPlans'

export type FeatureMetadataDraft = {
  title: string
  kind: AssetKind
  dateCapturedIso: string
  dateUploadedIso: string
  xStr: string
  yStr: string
  floorPlanId: FloorPlanId | undefined
  latStr: string
  lngStr: string
  markerColor: string
}

export type FeatureMetadataFileInfo = {
  fileSizeLabel: string
  resolutionLabel: string
  extensionLabel: string
}

export type FeatureMetadataPreview = {
  url: string
  isVideo: boolean
  onImageLoad?: (width: number, height: number) => void
}

export type FeatureMetadataLocationPickProps = {
  canPickOnMap: boolean
  pickDisabledReason?: string
  isMapPickInProgress: boolean
  isFloorPlanPickInProgress: boolean
  isThisFormMapPickTarget: boolean
  isThisFormFloorPlanPickTarget: boolean
  onMapPickClick: () => void
  onFloorPlanPickClick: () => void
}

export type FeatureMetadataDirectionAdjustProps = {
  canAdjustDirection: boolean
  adjustDisabledReason?: string
  isDirectionAdjustInProgress: boolean
  isThisFormDirectionAdjustTarget: boolean
  onDirectionAdjustClick: () => void
}
