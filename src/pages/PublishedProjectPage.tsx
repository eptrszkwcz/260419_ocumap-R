import { ActiveFloorPlanProvider } from '@/context/ActiveFloorPlanContext'
import { PublishedActiveProjectProvider } from '@/context/PublishedActiveProjectContext'
import { ProjectFloorPlansProvider } from '@/context/ProjectFloorPlansContext'
import { FeatureMapHoverProvider } from '@/context/FeatureMapHoverContext'
import { MarkerStylePreviewProvider } from '@/context/MarkerStylePreviewContext'
import { MapCaptureMarkersProvider } from '@/context/MapCaptureMarkersContext'
import { FeatureDrawProvider } from '@/context/FeatureDrawContext'
import { FloorPlanLocationPickProvider } from '@/context/FloorPlanLocationPickContext'
import { MapLocationPickProvider } from '@/context/MapLocationPickContext'
import { ViewDirectionAdjustProvider } from '@/context/ViewDirectionAdjustContext'
import { DashboardLayout } from '@/layout/DashboardLayout'

export function PublishedProjectPage() {
  return (
    <PublishedActiveProjectProvider>
      <MapLocationPickProvider>
        <FloorPlanLocationPickProvider>
          <FeatureDrawProvider>
            <MarkerStylePreviewProvider>
              <MapCaptureMarkersProvider>
                <FeatureMapHoverProvider>
                  <ViewDirectionAdjustProvider>
                    <ProjectFloorPlansProvider>
                      <ActiveFloorPlanProvider>
                        <div className="h-full min-h-0">
                          <DashboardLayout />
                        </div>
                      </ActiveFloorPlanProvider>
                    </ProjectFloorPlansProvider>
                  </ViewDirectionAdjustProvider>
                </FeatureMapHoverProvider>
              </MapCaptureMarkersProvider>
            </MarkerStylePreviewProvider>
          </FeatureDrawProvider>
        </FloorPlanLocationPickProvider>
      </MapLocationPickProvider>
    </PublishedActiveProjectProvider>
  )
}
