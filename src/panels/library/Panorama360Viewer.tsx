import { Viewer } from '@photo-sphere-viewer/core'
import '@photo-sphere-viewer/core/index.css'
import { useEffect, useRef } from 'react'

type Panorama360ViewerProps = {
  panoramaUrl: string
  className?: string
  /** Called with yaw in degrees when the user rotates the pano. */
  onYawChange?: (yawDeg: number) => void
}

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

export function Panorama360Viewer({ panoramaUrl, className, onYawChange }: Panorama360ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onYawChangeRef = useRef(onYawChange)
  onYawChangeRef.current = onYawChange

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
        mousewheel: true,
      })

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
      if (viewer != null) destroyViewerSafely(viewer)
    }
  }, [panoramaUrl])

  return (
    <div
      ref={containerRef}
      className={className ?? 'absolute inset-0 h-full w-full'}
      aria-hidden
    />
  )
}
