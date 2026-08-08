import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'
import { featureMetadataSecondaryButtonClass } from '@/panels/library/featureMetadata/styles'

export const accountSectionClass = 'flex flex-col gap-3'

export const accountSectionTitleClass = 'font-title text-title font-bold text-fg'

export const accountSectionDescClass = 'font-sans text-standard text-fg-muted'

export const accountHighlightBlockClass =
  'rounded-panel border border-stroke bg-area-highlight/40 px-4 py-3 font-sans text-standard text-fg'

export const accountPanelClass =
  'rounded-panel border border-stroke bg-panel px-4 py-3 font-sans text-standard text-fg'

export const accountPrimaryButtonClass =
  `${PRIMARY_BUTTON_CLASS} h-button shrink-0 rounded-panel px-4 text-standard font-sans`

export const accountSecondaryButtonClass = featureMetadataSecondaryButtonClass

export const accountLinkButtonClass =
  'text-fg-highlight hover:text-fg inline-flex cursor-pointer items-center gap-1 font-sans text-standard font-bold transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

export const accountFormGridClass = 'grid gap-x-4 gap-y-4 sm:grid-cols-2'

export const accountFormActionsClass = 'mt-2 flex flex-wrap items-center gap-2'
