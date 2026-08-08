import { useEffect, useState, type ReactNode } from 'react'

import { OcuMapFullLogo } from '@/components/OcuMapFullLogo'
import { Panel } from '@/components/Panel'
import { UserAccountDisplay } from '@/components/UserAccountDisplay'

type RevealPhase = 'hidden' | 'header' | 'content'

const REVEAL_FADE_CLASS =
  'transition-opacity duration-500 ease-out will-change-[opacity]'

function revealClass(visible: boolean): string {
  return REVEAL_FADE_CLASS + (visible ? ' opacity-100' : ' opacity-0')
}

type UserSectionPageProps = {
  title: string
  children?: ReactNode
}

/** Projects-style shell for account, team, settings, and activity pages. */
export function UserSectionPage({ title, children }: UserSectionPageProps) {
  const [revealPhase, setRevealPhase] = useState<RevealPhase>('hidden')

  useEffect(() => {
    setRevealPhase('hidden')
    const headerTimer = window.setTimeout(() => setRevealPhase('header'), 40)
    const contentTimer = window.setTimeout(() => setRevealPhase('content'), 420)
    return () => {
      window.clearTimeout(headerTimer)
      window.clearTimeout(contentTimer)
    }
  }, [])

  const headerVisible = revealPhase !== 'hidden'
  const contentVisible = revealPhase === 'content'

  return (
    <div className="bg-page flex h-full min-h-0 min-w-0 flex-col p-page">
      <header
        className={
          'flex h-header shrink-0 items-center justify-between gap-4 px-panel-padding ' +
          revealClass(headerVisible)
        }
      >
        <OcuMapFullLogo />
        <UserAccountDisplay />
      </header>
      <Panel className="!border-0 !bg-transparent mx-auto mt-[52px] flex min-h-0 min-w-0 w-full max-w-[1200px] flex-1 flex-col gap-4 p-0 shadow-none">
        <div className={'flex min-h-0 flex-1 flex-col ' + revealClass(contentVisible)}>
          <div className="mb-[12px] h-fit shrink-0">
            <h1 className="font-title text-[30px] font-bold leading-none text-fg">{title}</h1>
          </div>
          {children ?? <p className="font-sans text-standard text-fg-muted">Coming Soon</p>}
        </div>
      </Panel>
    </div>
  )
}
