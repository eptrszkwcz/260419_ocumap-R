import type { ReactNode } from 'react'

const promptBannerClassName =
  'max-w-md rounded-panel bg-fg-highlight px-3 py-2 text-center font-sans text-standard text-white shadow-sm'

type PanelCenteredPromptProps = {
  children: ReactNode
  'aria-label': string
  /** Center within a relative panel shell (e.g. under toolbars) instead of filling remaining flex space. */
  overlay?: boolean
}

/** Centered panel empty-state prompt; matches map/floor-plan location-pick banner styling. */
export function PanelCenteredPrompt({
  children,
  'aria-label': ariaLabel,
  overlay = false,
}: PanelCenteredPromptProps) {
  if (overlay) {
    return (
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center p-panel-padding"
        role="region"
        aria-label={ariaLabel}
      >
        <div className={promptBannerClassName} role="status">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col items-center justify-center bg-panel p-panel-padding"
      role="region"
      aria-label={ariaLabel}
    >
      <div className={promptBannerClassName} role="status">
        {children}
      </div>
    </div>
  )
}
