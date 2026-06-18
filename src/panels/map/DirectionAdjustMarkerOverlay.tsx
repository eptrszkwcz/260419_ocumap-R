import { useCallback, useEffect, useRef } from 'react'

import { useViewDirectionAdjust } from '@/context/ViewDirectionAdjustContext'
import { DirectionAdjustMapThumbnail } from '@/panels/map/DirectionAdjustMapThumbnail'
import { DirectionBeam } from '@/panels/map/DirectionBeam'
import { directionDegFromPointer } from '@/panels/map/directionAdjustHelpers'

export function DirectionAdjustMarkerOverlay() {
  const {
    adjustAssetMeta,
    referenceDirectionDeg,
    draftDirectionDeg,
    setDraftDirectionDeg,
  } = useViewDirectionAdjust()
  const centerRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)

  const updateDirectionFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const el = centerRef.current
      if (el == null) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      setDraftDirectionDeg(directionDegFromPointer(cx, cy, clientX, clientY))
    },
    [setDraftDirectionDeg],
  )

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return
      updateDirectionFromPointer(e.clientX, e.clientY)
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
  }, [updateDirectionFromPointer])

  if (adjustAssetMeta == null) return null

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    draggingRef.current = true
    updateDirectionFromPointer(e.clientX, e.clientY)
  }

  return (
    <div ref={centerRef} className="pointer-events-none absolute left-1/2 top-1/2 z-0 overflow-visible">
      <div className="relative" style={{ transform: 'translate(-50%, -50%)' }}>
        <DirectionAdjustMapThumbnail
          fileUrl={adjustAssetMeta.fileUrl}
          kind={adjustAssetMeta.kind}
          referenceDirectionDeg={referenceDirectionDeg}
        />
        <div className="pointer-events-auto">
          <DirectionBeam
            directionDeg={draftDirectionDeg}
            interactive
            onPointerDown={handlePointerDown}
          />
        </div>
      </div>
    </div>
  )
}
