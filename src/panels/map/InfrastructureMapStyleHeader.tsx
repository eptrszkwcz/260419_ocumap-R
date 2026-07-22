import { DropdownMenu } from '@/components/DropdownMenu'

import {
  MAP_BASE_STYLE_OPTIONS,
  mapBaseStyleLabel,
  type MapBaseStyleId,
} from '@/panels/map/mapBaseStyles'
import {
  mapOverlayInsetBottomAboveMapboxLogoClassName,
  mapOverlayInsetLeftClassName,
  mapOverlayInsetTopClassName,
  mapOverlayInsetXClassName,
} from '@/panels/map/mapOverlayLayout'

const mapStyleTriggerClassName =
  'text-fg-muted hover:text-fg-highlight inline-flex min-h-8 min-w-[7.5rem] max-w-full cursor-pointer items-center justify-between gap-2 rounded-panel border border-stroke bg-panel/95 px-2.5 font-sans text-standard font-normal leading-none shadow-sm backdrop-blur-[2px] focus-visible:border-fg-highlight focus-visible:ring-1 focus-visible:ring-fg-highlight/35 focus-visible:outline-none'

function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      className={'shrink-0 ' + className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M3 4.5 6 7.5 9 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MapBaseStyleThumbnail({ src }: { src: string }) {
  return (
    <img
      src={src}
      alt=""
      width={44}
      height={44}
      className="size-11 shrink-0 rounded object-cover"
    />
  )
}

type InfrastructureMapStyleHeaderProps = {
  selectedStyleId: MapBaseStyleId
  onStyleChange: (id: MapBaseStyleId) => void
  variant?: 'editor' | 'published'
  layoutMode?: 'full' | 'mini'
}

/**
 * Transparent overlay strip on infrastructure maps: base map style selector.
 */
export function InfrastructureMapStyleHeader({
  selectedStyleId,
  onStyleChange,
  variant = 'editor',
  layoutMode = 'full',
}: InfrastructureMapStyleHeaderProps) {
  const isPublishedFull = variant === 'published' && layoutMode === 'full'
  const selectedLabel = mapBaseStyleLabel(selectedStyleId)

  const positionClassName = isPublishedFull
    ? mapOverlayInsetBottomAboveMapboxLogoClassName + ' ' + mapOverlayInsetLeftClassName
    : mapOverlayInsetXClassName + ' ' + mapOverlayInsetTopClassName

  return (
    <div
      id="control-header-map-style"
      className={
        'pointer-events-none absolute z-10 flex items-center bg-transparent ' +
        (isPublishedFull ? 'justify-start ' : 'justify-end ') +
        positionClassName
      }
      role="toolbar"
      aria-label="Map base style"
    >
      <div className="pointer-events-auto min-w-0">
        <DropdownMenu
          menuAriaLabel="Map base style"
          align={isPublishedFull ? 'left' : 'right'}
          placement={isPublishedFull ? 'top' : 'bottom'}
          panelWidth="200px"
          items={MAP_BASE_STYLE_OPTIONS.map((opt) => ({
            id: opt.id,
            label: opt.label,
            selected: opt.id === selectedStyleId,
            trailing: <MapBaseStyleThumbnail src={opt.thumbnailSrc} />,
            onSelect: () => onStyleChange(opt.id),
          }))}
          renderTrigger={({ open, menuId, onToggle }) => (
            <button
              type="button"
              onClick={onToggle}
              className={mapStyleTriggerClassName}
              aria-expanded={open}
              aria-haspopup="menu"
              aria-controls={menuId}
              aria-label={`Map Style, ${selectedLabel} selected`}
            >
              <span className="truncate">Map Style</span>
              <ChevronDownIcon />
            </button>
          )}
        />
      </div>
    </div>
  )
}
