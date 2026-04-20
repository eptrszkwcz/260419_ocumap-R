import { LibraryColumn } from '@/panels/library/LibraryColumn'
import { MapColumn } from '@/panels/map/MapColumn'

export function DashboardLayout() {
  return (
    <div className="box-border flex min-h-screen min-w-[900px] flex-col bg-page p-page">
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(500px,55fr)_minmax(400px,45fr)] gap-panel">
        <LibraryColumn />
        <MapColumn />
      </div>
    </div>
  )
}
