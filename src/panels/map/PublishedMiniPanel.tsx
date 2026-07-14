import type { ReactNode } from 'react'

import { DelayedTooltip } from '@/components/DelayedTooltip'
import { overlayBtnClass } from '@/components/overlayControlButtons'
import { SwapViewIcon } from '@/components/overlayControlIcons'
import {
  mapOverlayInsetRightClassName,
  mapOverlayInsetTopClassName,
  publishedMiniPanelClassName,
} from '@/panels/map/mapOverlayLayout'

type PublishedMiniPanelProps = {
  children: ReactNode
  onSwap: () => void
}

export function PublishedMiniPanel({ children, onSwap }: PublishedMiniPanelProps) {
  return (
    <div className={'relative flex min-h-0 flex-col ' + publishedMiniPanelClassName}>
      <DelayedTooltip label="Swap map and media">
        <button
          type="button"
          className={
            overlayBtnClass +
            ' pointer-events-auto absolute z-20 ' +
            mapOverlayInsetTopClassName +
            ' ' +
            mapOverlayInsetRightClassName
          }
          aria-label="Swap map and media"
          onClick={onSwap}
        >
          <SwapViewIcon />
        </button>
      </DelayedTooltip>
      {children}
    </div>
  )
}
