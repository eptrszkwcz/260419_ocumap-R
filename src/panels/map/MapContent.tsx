const MAP_2D_FLOOR_PLAN = '/samples/map-viewer/floor-plans/SOM-5.jpg'

type MapContentProps = {
  activeTab: string
}

export function MapContent({ activeTab }: MapContentProps) {
  if (activeTab !== '2d') {
    return (
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden bg-panel" role="region" aria-label="3D map" />
    )
  }

  return (
    <div
      className="min-h-0 min-w-0 flex-1 overflow-auto bg-panel"
      role="region"
      aria-label="2D map"
    >
      <div className="flex min-h-full w-full min-w-0 items-center">
        <img
          src={MAP_2D_FLOOR_PLAN}
          alt="Floor plan SOM-5"
          className="block w-full max-w-full shrink-0 h-auto"
          decoding="async"
          draggable={false}
        />
      </div>
    </div>
  )
}
