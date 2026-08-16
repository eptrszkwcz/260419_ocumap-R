import { Link } from 'react-router-dom'

import { OcuMapFullLogo } from '@/components/OcuMapFullLogo'

export function OcuMapHomeLogo() {
  return (
    <Link
      to="/projects"
      className="cursor-pointer rounded-panel focus-visible:ring-2 focus-visible:ring-fg-highlight/40 focus-visible:outline-none"
      aria-label="Go to projects"
    >
      <OcuMapFullLogo />
    </Link>
  )
}
