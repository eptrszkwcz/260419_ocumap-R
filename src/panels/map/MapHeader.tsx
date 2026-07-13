import { Panel } from '@/components/Panel'
import { UserAccountDisplay } from '@/components/UserAccountDisplay'

type MapHeaderProps = {
  hideUserSection?: boolean
}

export function MapHeader({ hideUserSection = false }: MapHeaderProps) {
  return (
    <Panel className="flex h-header w-full min-w-0 shrink-0 items-center justify-between gap-4 border-0 bg-transparent">
      <div className="flex shrink-0 items-center">
        <img
          src="/brand/ocumap-o-logo.svg"
          alt="OcuMap"
          className="h-9 w-auto"
          width={33}
          height={40}
        />
      </div>
      {hideUserSection ? null : <UserAccountDisplay />}
    </Panel>
  )
}
