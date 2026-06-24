import { useCallback, useEffect, useRef } from 'react'

const DEFAULT_DELAY_MS = 250

/**
 * Defers single-click handling so a double-click can cancel it and run `onDoubleClick` instead.
 */
export function useDeferredRowClick(onSingleClick: () => void, onDoubleClick: () => void, delayMs = DEFAULT_DELAY_MS) {
  const singleClickRef = useRef(onSingleClick)
  const doubleClickRef = useRef(onDoubleClick)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    singleClickRef.current = onSingleClick
    doubleClickRef.current = onDoubleClick
  }, [onSingleClick, onDoubleClick])

  useEffect(() => {
    return () => {
      if (timerRef.current != null) clearTimeout(timerRef.current)
    }
  }, [])

  const cancelPendingSingleClick = useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleClick = useCallback(() => {
    cancelPendingSingleClick()
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      singleClickRef.current()
    }, delayMs)
  }, [cancelPendingSingleClick, delayMs])

  const handleDoubleClick = useCallback(() => {
    cancelPendingSingleClick()
    doubleClickRef.current()
  }, [cancelPendingSingleClick])

  return { handleClick, handleDoubleClick, cancelPendingSingleClick }
}
