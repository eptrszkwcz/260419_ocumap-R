import { useEffect, useState } from 'react'

/**
 * True when the primary input supports hover (fine pointer + hover capability).
 * False on phones/tablets and other touch-first devices where hover popups are unreliable.
 */
export function usePrefersHover(): boolean {
  const [prefersHover, setPrefersHover] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches
  })

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const onChange = () => setPrefersHover(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return prefersHover
}
