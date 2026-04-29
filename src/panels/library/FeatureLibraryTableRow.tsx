import { getAssetTypeLabel, type SpatialAsset } from '@/data/sampleAssets'

function MoreVerticalIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="8" cy="3" r="1.5" fill="currentColor" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
      <circle cx="8" cy="13" r="1.5" fill="currentColor" />
    </svg>
  )
}

export type FeatureLibraryTableRowProps = {
  asset: SpatialAsset
}

/** One 40px data row: name, date, type, actions. Use one instance per asset inside `<tbody>`. */
export function FeatureLibraryTableRow({ asset }: FeatureLibraryTableRowProps) {
  return (
    <tr className="group h-10 border-b-[0.5px] border-solid border-stroke font-normal transition-colors hover:bg-area-highlight hover:font-semibold">
      <td className="min-w-0 pl-panel-padding pr-4 align-middle text-fg-muted group-hover:text-fg-highlight">
        <span className="block truncate">{asset.title}</span>
      </td>
      <td className="pl-0 pr-4 align-middle text-fg-muted group-hover:text-fg-highlight whitespace-nowrap">
        {asset.dateUploaded}
      </td>
      <td className="pl-0 pr-4 align-middle text-fg-muted group-hover:text-fg-highlight whitespace-nowrap">
        {getAssetTypeLabel(asset.kind)}
      </td>
      <td className="pl-0 pr-panel-padding text-right align-middle">
        <button
          type="button"
          className="text-fg-muted group-hover:text-fg-highlight inline-flex h-8 w-8 items-center justify-center rounded-panel align-middle transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/40 focus-visible:outline-none"
          aria-label={`Actions for ${asset.title}`}
        >
          <MoreVerticalIcon />
        </button>
      </td>
    </tr>
  )
}
