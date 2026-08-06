import { Panel } from '@/components/Panel'
import { UserAccountDisplay } from '@/components/UserAccountDisplay'

type MapHeaderProps = {
  hideUserSection?: boolean
}

export function MapHeader({ hideUserSection = false }: MapHeaderProps) {
  return (
    <Panel className="flex h-header w-full min-w-0 shrink-0 items-center justify-end gap-4 border-0 bg-transparent">
      {hideUserSection ? null : <UserAccountDisplay />}
    </Panel>
  )
}
