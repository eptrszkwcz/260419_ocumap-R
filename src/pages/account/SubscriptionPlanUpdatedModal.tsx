import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'

const FADE_MS = 500
const HOLD_MS = 4000
const LOGO_FADE_DELAY_MS = 0

type SubscriptionPlanUpdatedModalProps = {
  onClose: () => void
}

export function SubscriptionPlanUpdatedModal({ onClose }: SubscriptionPlanUpdatedModalProps) {
  const [panelVisible, setPanelVisible] = useState(false)
  const [logoVisible, setLogoVisible] = useState(false)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const fadeInFrame = requestAnimationFrame(() => {
      setPanelVisible(true)
    })

    const logoInTimer = window.setTimeout(() => {
      setLogoVisible(true)
    }, LOGO_FADE_DELAY_MS)

    const fadeOutTimer = window.setTimeout(() => {
      setPanelVisible(false)
      setLogoVisible(false)
    }, FADE_MS + HOLD_MS)

    const closeTimer = window.setTimeout(() => {
      onCloseRef.current()
    }, FADE_MS + HOLD_MS + FADE_MS)

    return () => {
      cancelAnimationFrame(fadeInFrame)
      window.clearTimeout(logoInTimer)
      window.clearTimeout(fadeOutTimer)
      window.clearTimeout(closeTimer)
    }
  }, [])

  const panelFadeClass =
    'transition-opacity duration-300 ease-out will-change-[opacity] ' +
    (panelVisible ? 'opacity-100' : 'opacity-0')

  const logoFadeClass =
    'transition-opacity duration-300 ease-out will-change-[opacity] ' +
    (logoVisible ? 'opacity-100' : 'opacity-0')

  return createPortal(
    <>
      <div className={'fixed inset-0 z-[100] bg-fg/20 ' + panelFadeClass} aria-hidden />
      <div
        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
        role="presentation"
      >
        <div
          className={
            'flex w-full max-w-md flex-col items-center gap-5 overflow-hidden rounded-panel border border-stroke bg-page px-panel-padding py-8 text-center shadow-lg ' +
            panelFadeClass
          }
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <img
            src="/brand/ocumap-o-logo.svg"
            alt=""
            className={'h-20 w-auto ' + logoFadeClass}
            width={74}
            height={88}
          />
          <div className="flex flex-col gap-3 font-sans text-standard text-fg">
            <p>Your subscription plan has been updated.</p>
            <p>Thank you for updating your subscription plan!</p>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
