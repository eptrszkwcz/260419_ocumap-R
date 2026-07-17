const iconClassName = 'mx-auto size-12 shrink-0 text-fg'

const bridgeRoadStrokeProps = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 0.5,
  strokeLinejoin: 'round' as const,
}

const bridgeDeckStrokeProps = {
  stroke: 'currentColor',
  strokeLinejoin: 'round' as const,
}

/** Geometry from `src/assets/icons/icon-bridge.svg`. */
export function BridgeMapIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      className={iconClassName}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <polygon
        {...bridgeRoadStrokeProps}
        points="18.54 2.14 22.83 2.14 20.63 46.28 2.03 46.28 18.54 2.14"
      />
      <polygon
        {...bridgeRoadStrokeProps}
        points="29.54 2.14 25.25 2.14 27.45 46.28 46.06 46.28 29.54 2.14"
      />
      <polygon
        {...bridgeDeckStrokeProps}
        className="fill-panel"
        points="9.62 18.54 7.86 23.22 4.39 23.22 4.39 18.54 2.26 18.54 2.26 14.69 45.74 14.69 45.74 18.54 43.56 18.54 43.56 23.22 40.09 23.22 38.33 18.54 9.62 18.54"
      />
    </svg>
  )
}

const floorPlanOutlineStrokeProps = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const floorPlanDetailStrokeProps = {
  ...floorPlanOutlineStrokeProps,
  strokeWidth: 0.5,
}

/** Geometry from `src/assets/icons/icon-floorplan.svg`. */
export function FloorPlanMapIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      className={iconClassName}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <polygon
        {...floorPlanOutlineStrokeProps}
        points="30.84 40.59 30.84 45.87 2.44 45.87 2.44 2.36 23.21 2.36 23.21 8.96 45.38 8.96 45.38 40.59 30.84 40.59"
      />
      <line {...floorPlanDetailStrokeProps} x1="2.44" y1="13.15" x2="24.38" y2="13.15" />
      <line {...floorPlanDetailStrokeProps} x1="32.8" y1="40.15" x2="32.8" y2="28.17" />
      <line {...floorPlanDetailStrokeProps} x1="12.6" y1="28.17" x2="34.23" y2="28.17" />
      <polyline
        {...floorPlanDetailStrokeProps}
        points="34.23 8.96 34.23 28.17 12.6 28.17 12.6 13.15"
      />
      <line {...floorPlanDetailStrokeProps} x1="24.4" y1="28.17" x2="24.36" y2="8.96" />
      <line {...floorPlanDetailStrokeProps} x1="24.38" y1="23.55" x2="34.23" y2="23.55" />
    </svg>
  )
}
