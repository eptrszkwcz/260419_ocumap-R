import { Viewer } from '@photo-sphere-viewer/core'
import '@photo-sphere-viewer/core/index.css'
import { useEffect, useRef } from 'react'

type Panorama360ViewerProps = {
  panoramaUrl: string
  className?: string
}

export function Panorama360Viewer({ panoramaUrl, className }: Panorama360ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (container == null || panoramaUrl === '') return

    const viewer = new Viewer({
      container,
      panorama: panoramaUrl,
      navbar: false,
      defaultZoomLvl: 0,
      mousewheel: true,
    })

    return () => {
      viewer.destroy()
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
