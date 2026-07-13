import { useEffect, useMemo, useState } from 'react'

import {
  getSampleAssetsForProject,
  hasDisplayableMedia,
  type SpatialAsset,
} from '@/data/sampleAssets'
import { NEW_PROJECT_ID, sampleProjects } from '@/data/sampleProjects'
import { useMapCaptureMarkers } from '@/context/MapCaptureMarkersContext'
import {
  assetsToCaptureMarkers,
  assetsToFloorPlanDrawnGeometries,
  assetsToFloorPlanMarkers,
  assetsToMapDrawnGeometries,
} from '@/panels/library/assetGeometryHelpers'

const legacySampleProjectIds = new Set(sampleProjects.map((p) => p.id))

function assetsForProject(projectId: string, isNewProject: boolean): SpatialAsset[] {
  if (isNewProject || projectId === NEW_PROJECT_ID) return []
  if (!legacySampleProjectIds.has(projectId)) return []
  return getSampleAssetsForProject(projectId)
}

export function useProjectMapAssets(projectId: string, isNewProject: boolean) {
  const { setCaptureMarkers, setFloorPlanMarkers, setFloorPlanDrawnGeometries, setMapDrawnGeometries } =
    useMapCaptureMarkers()
  const [assets, setAssets] = useState<SpatialAsset[]>(() =>
    assetsForProject(projectId, isNewProject),
  )

  useEffect(() => {
    setAssets(assetsForProject(projectId, isNewProject))
  }, [isNewProject, projectId])

  const mediaAssets = useMemo(
    () => assets.filter(hasDisplayableMedia),
    [assets],
  )

  useEffect(() => {
    setCaptureMarkers(assetsToCaptureMarkers(assets))
    setFloorPlanMarkers(assetsToFloorPlanMarkers(assets))
    setFloorPlanDrawnGeometries(assetsToFloorPlanDrawnGeometries(assets))
    setMapDrawnGeometries(assetsToMapDrawnGeometries(assets))
    return () => {
      setCaptureMarkers([])
      setFloorPlanMarkers([])
      setFloorPlanDrawnGeometries([])
      setMapDrawnGeometries([])
    }
  }, [
    assets,
    setCaptureMarkers,
    setFloorPlanMarkers,
    setFloorPlanDrawnGeometries,
    setMapDrawnGeometries,
  ])

  return { assets, mediaAssets, setAssets }
}
