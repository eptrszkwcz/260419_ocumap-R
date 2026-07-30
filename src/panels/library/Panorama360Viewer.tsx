import { Viewer } from '@photo-sphere-viewer/core'
import '@photo-sphere-viewer/core/index.css'
import { useEffect, useRef, useState } from 'react'

import {
  CrosshairTargetMarker,
  crosshairTargetMarkerColor,
} from '@/components/CrosshairTargetMarker'

type Panorama360ViewerProps = {
  panoramaUrl: string
  className?: string
  /** Called with yaw in degrees when the user rotates the pano. */
  onYawChange?: (yawDeg: number) => void
  /** Disable pano drag/zoom (e.g. while placing a marker). */
  placementMode?: boolean
  /** Called when user clicks the pano in placement mode. */
  onPlacementClick?: (payload: {
    yawDeg: number
    pitchDeg: number
    xPct: number
    yPct: number
  }) => void
  /** Draft pano marker position for overlay. */
  markerPanoPosition?: { yawDeg: number; pitchDeg: number } | null
  markerIsPreliminary?: boolean
  markerColor?: string
  /** Whether the media marker overlay is draggable. */
  markerDraggable?: boolean
  /** Saved pano markers belonging to this media item. */
  persistedPanoMarkers?: Array<{
    id: string
    panoPosition: { yawDeg: number; pitchDeg: number }
    color?: string
  }>
  onMarkerMove?: (payload: { yawDeg: number; pitchDeg: number }) => void
}

type MarkerScreenPosition = { xPct: number; yPct: number }

function destroyViewerSafely(viewer: Viewer) {
  if (viewer.state.ready) {
    viewer.destroy()
    return
  }

  viewer.addEventListener(
    'ready',
    () => {
      viewer.destroy()
    },
    { once: true },
  )
}

export function Panorama360Viewer({
  panoramaUrl,
  className,
  onYawChange,
  placementMode = false,
  onPlacementClick,
  markerPanoPosition = null,
  markerIsPreliminary = true,
  markerColor,
  markerDraggable = false,
  persistedPanoMarkers = [],
  onMarkerMove,
}: Panorama360ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const onYawChangeRef = useRef(onYawChange)
  const onPlacementClickRef = useRef(onPlacementClick)
  const onMarkerMoveRef = useRef(onMarkerMove)
  onYawChangeRef.current = onYawChange
  onPlacementClickRef.current = onPlacementClick
  onMarkerMoveRef.current = onMarkerMove

  const [markerScreen, setMarkerScreen] = useState<MarkerScreenPosition | null>(null)
  const [persistedMarkerScreens, setPersistedMarkerScreens] = useState<
    Record<string, MarkerScreenPosition>
  >({})
  const draggingRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (container == null || panoramaUrl === '') return

    let viewer: Viewer | null = null
    let resizeObserver: ResizeObserver | null = null
    let cancelled = false
    let rafId = 0

    const initTimer = window.setTimeout(() => {
      if (cancelled) return

      viewer = new Viewer({
        container,
        panorama: panoramaUrl,
        navbar: false,
        defaultZoomLvl: 0,
        mousewheel: !placementMode,
        mousemove: !placementMode,
      })
      viewerRef.current = viewer

      const syncSize = () => viewer?.autoSize()
      requestAnimationFrame(syncSize)

      resizeObserver = new ResizeObserver(syncSize)
      resizeObserver.observe(container)

      const onPositionUpdated = () => {
        if (viewer == null || onYawChangeRef.current == null) return
        cancelAnimationFrame(rafId)
        rafId = requestAnimationFrame(() => {
          if (viewer == null) return
          const { yaw } = viewer.getPosition()
          onYawChangeRef.current?.((yaw * 180) / Math.PI)
        })
      }

      viewer.addEventListener('position-updated', onPositionUpdated)
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(initTimer)
      cancelAnimationFrame(rafId)
      resizeObserver?.disconnect()
      onYawChangeRef.current?.(0)
      viewerRef.current = null
      if (viewer != null) destroyViewerSafely(viewer)
    }
  }, [panoramaUrl, placementMode])

  useEffect(() => {
    const viewer = viewerRef.current
    if (viewer == null || !viewer.state.ready) return

    const panoPositionToScreen = (
      panoPosition: { yawDeg: number; pitchDeg: number },
    ): MarkerScreenPosition | null => {
      const yaw = (panoPosition.yawDeg * Math.PI) / 180
      const pitch = (panoPosition.pitchDeg * Math.PI) / 180
      const coords = viewer.dataHelper.sphericalCoordsToViewerCoords({ yaw, pitch })
      if (coords == null) return null
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect == null || rect.width === 0 || rect.height === 0) return null
      return {
        xPct: coords.x / rect.width,
        yPct: coords.y / rect.height,
      }
    }

    const updateMarkerScreens = () => {
      setMarkerScreen(
        markerPanoPosition == null ? null : panoPositionToScreen(markerPanoPosition),
      )
      const nextPersisted: Record<string, MarkerScreenPosition> = {}
      for (const marker of persistedPanoMarkers) {
        const screen = panoPositionToScreen(marker.panoPosition)
        if (screen != null) nextPersisted[marker.id] = screen
      }
      setPersistedMarkerScreens(nextPersisted)
    }

    updateMarkerScreens()
    viewer.addEventListener('position-updated', updateMarkerScreens)
    viewer.addEventListener('zoom-updated', updateMarkerScreens)
    return () => {
      viewer.removeEventListener('position-updated', updateMarkerScreens)
      viewer.removeEventListener('zoom-updated', updateMarkerScreens)
    }
  }, [markerPanoPosition, persistedPanoMarkers])

  useEffect(() => {
    const viewer = viewerRef.current
    if (viewer == null || !viewer.state.ready || !placementMode) return

    const onClick = (event: { data?: { yaw: number; pitch: number } }) => {
      if (event.data == null) return
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect == null) return
      const yawDeg = (event.data.yaw * 180) / Math.PI
      const pitchDeg = (event.data.pitch * 180) / Math.PI
      const coords = viewer.dataHelper.sphericalCoordsToViewerCoords({
        yaw: event.data.yaw,
        pitch: event.data.pitch,
      })
      const xPct = coords != null ? coords.x / rect.width : 0.5
      const yPct = coords != null ? coords.y / rect.height : 0.5
      onPlacementClickRef.current?.({ yawDeg, pitchDeg, xPct, yPct })
    }

    viewer.addEventListener('click', onClick as (event: unknown) => void)
    return () => {
      viewer.removeEventListener('click', onClick as (event: unknown) => void)
    }
  }, [placementMode, panoramaUrl])

  useEffect(() => {
    if (!markerDraggable || markerScreen == null) return

    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return
      const viewer = viewerRef.current
      const container = containerRef.current
      if (viewer == null || container == null || !viewer.state.ready) return
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const spherical = viewer.dataHelper.viewerCoordsToSphericalCoords({ x, y })
      if (spherical == null) return
      const yawDeg = (spherical.yaw * 180) / Math.PI
      const pitchDeg = (spherical.pitch * 180) / Math.PI
      onMarkerMoveRef.current?.({ yawDeg, pitchDeg })
    }

    const onPointerUp = () => {
      draggingRef.current = false
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [markerDraggable, markerScreen])

  return (
    <div className="absolute inset-0">
      <div
        ref={containerRef}
        className={
          (className ?? 'absolute inset-0 h-full w-full') +
          (placementMode ? ' cursor-crosshair' : '')
        }
        aria-hidden
        onPointerDown={
          markerDraggable && markerScreen != null
            ? (e) => {
                e.stopPropagation()
                draggingRef.current = true
              }
            : undefined
        }
      />
      {persistedPanoMarkers.map((marker) => {
        const screen = persistedMarkerScreens[marker.id]
        if (screen == null) return null
        return (
          <div
            key={marker.id}
            className="pointer-events-none absolute z-30"
            style={{
              left: `${screen.xPct * 100}%`,
              top: `${screen.yPct * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <CrosshairTargetMarker color={crosshairTargetMarkerColor(marker.color, false)} />
          </div>
        )
      })}
      {markerScreen != null ? (
        <div
          className="absolute z-30"
          style={{
            left: `${markerScreen.xPct * 100}%`,
            top: `${markerScreen.yPct * 100}%`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: markerDraggable ? 'auto' : 'none',
            cursor: markerDraggable ? 'grab' : 'default',
          }}
          onPointerDown={
            markerDraggable
              ? (e) => {
                  e.stopPropagation()
                  draggingRef.current = true
                }
              : undefined
          }
        >
          <CrosshairTargetMarker
            color={crosshairTargetMarkerColor(markerColor, markerIsPreliminary)}
          />
        </div>
      ) : null}
    </div>
  )
}

export type { Panorama360ViewerProps }
