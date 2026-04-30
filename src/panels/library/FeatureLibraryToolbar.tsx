import { ControlHeaderToolbar } from '@/components/ControlHeaderToolbar'

type FeatureLibraryToolbarProps = {
  onAddFeatureClick?: () => void
}

export function FeatureLibraryToolbar({ onAddFeatureClick }: FeatureLibraryToolbarProps) {
  return (
    <ControlHeaderToolbar
      id="control-header-feature-lib"
      toolbarAriaLabel="Feature library actions"
      onAddClick={onAddFeatureClick}
    />
  )
}
