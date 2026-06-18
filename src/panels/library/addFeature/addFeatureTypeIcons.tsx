import type { ReactNode } from 'react'

type IconProps = {
  className?: string
}

const iconClass = 'shrink-0 text-fg'

function IconFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      className={`${iconClass} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {children}
    </svg>
  )
}

export function PhotoTypeIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <rect x="5" y="7" width="22" height="18" rx="2.5" fill="currentColor" />
      <path d="M5 21l6.5-6 4.5 3.5L19 13l8 8" fill="none" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="22" cy="13" r="2" fill="white" />
    </IconFrame>
  )
}

export function Panorama360TypeIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <ellipse cx="16" cy="16" rx="5.5" ry="11" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <path d="M5 16h22M16 5v22" stroke="currentColor" strokeWidth="1.25" />
    </IconFrame>
  )
}

export function VideoTypeIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <rect x="9" y="5" width="14" height="22" rx="1.5" fill="currentColor" />
      <rect x="5" y="8" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="5" y="14.5" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="5" y="21" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="24" y="8" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="24" y="14.5" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="24" y="21" width="3" height="3" rx="0.5" fill="currentColor" />
    </IconFrame>
  )
}

export function Model3DTypeIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path
        d="M6 24V14l10-6 10 6v10H6z"
        fill="currentColor"
      />
      <path d="M6 14l10 6 10-6M16 20v10" fill="none" stroke="white" strokeWidth="1.25" />
      <path d="M10 11l6-3.5L22 11" fill="none" stroke="white" strokeWidth="1.25" strokeLinejoin="round" />
    </IconFrame>
  )
}

export function DwgTypeIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <path
        d="M8 6h10l6 6v14a1.5 1.5 0 01-1.5 1.5H8A1.5 1.5 0 016.5 26V7.5A1.5 1.5 0 018 6z"
        fill="currentColor"
      />
      <path d="M18 6v6h6" fill="none" stroke="white" strokeWidth="1.25" strokeLinejoin="round" />
    </IconFrame>
  )
}

export function CsvTypeIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <rect x="6" y="6" width="20" height="20" rx="1.5" fill="currentColor" />
      <rect x="9" y="9" width="4.5" height="4.5" rx="0.5" fill="white" />
      <rect x="15.25" y="9" width="4.5" height="4.5" rx="0.5" fill="white" />
      <rect x="21.5" y="9" width="1.5" height="4.5" rx="0.5" fill="white" />
      <rect x="9" y="15.25" width="4.5" height="4.5" rx="0.5" fill="white" />
      <rect x="15.25" y="15.25" width="4.5" height="4.5" rx="0.5" fill="white" />
      <rect x="21.5" y="15.25" width="1.5" height="4.5" rx="0.5" fill="white" />
      <rect x="9" y="21.5" width="4.5" height="1.5" rx="0.5" fill="white" />
      <rect x="15.25" y="21.5" width="4.5" height="1.5" rx="0.5" fill="white" />
    </IconFrame>
  )
}

export function GeoJsonTypeIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="16" cy="9" r="3.25" fill="currentColor" />
      <circle cx="9" cy="23" r="3.25" fill="currentColor" />
      <circle cx="23" cy="23" r="3.25" fill="currentColor" />
    </IconFrame>
  )
}

export function PointGeometryIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="16" cy="16" r="5.5" fill="currentColor" />
    </IconFrame>
  )
}

export function LineGeometryIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="9" cy="22" r="3.25" fill="currentColor" />
      <circle cx="23" cy="10" r="3.25" fill="currentColor" />
      <path d="M11.5 19.5L20.5 12.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </IconFrame>
  )
}

export function PolygonGeometryIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <circle cx="10" cy="10" r="2.75" fill="currentColor" />
      <circle cx="22" cy="10" r="2.75" fill="currentColor" />
      <circle cx="22" cy="22" r="2.75" fill="currentColor" />
      <circle cx="10" cy="22" r="2.75" fill="currentColor" />
      <path
        d="M12.5 10H19.25M22 12.5V19.25M19.25 22H12.5M10 19.25V12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 12.5L14 16" stroke="currentColor" strokeWidth="3.25" strokeLinecap="round" />
    </IconFrame>
  )
}
