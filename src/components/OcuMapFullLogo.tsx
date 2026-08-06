type OcuMapFullLogoProps = {
  className?: string
  alt?: string
}

export function OcuMapFullLogo({
  className = 'h-6 w-auto max-w-full object-contain',
  alt = 'OcuMap',
}: OcuMapFullLogoProps) {
  return (
    <img
      src="/brand/ocumap-full-logo-dark.png"
      alt={alt}
      className={className}
      width={103}
      height={24}
    />
  )
}
