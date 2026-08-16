import { CreditCardIcon } from '@heroicons/react/24/outline'

import mastercardLogo from '@/assets/payment/mastercard.png'
import visaLogo from '@/assets/payment/visa.png'

const paymentBrandLogos: Record<string, string> = {
  Visa: visaLogo,
  Mastercard: mastercardLogo,
}

type PaymentBrandLogoProps = {
  brand: string
  className?: string
  fallbackIconClassName?: string
}

export function PaymentBrandLogo({
  brand,
  className = 'h-4 w-auto max-w-[2.25rem] shrink-0 object-contain object-left',
  fallbackIconClassName = 'size-4 shrink-0',
}: PaymentBrandLogoProps) {
  const logoSrc = paymentBrandLogos[brand]
  if (logoSrc == null) {
    return <CreditCardIcon className={fallbackIconClassName} aria-hidden />
  }

  return <img src={logoSrc} alt="" className={className} aria-hidden />
}
