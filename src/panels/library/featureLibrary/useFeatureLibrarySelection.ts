import { useCallback, useState } from 'react'

import type { SpatialAsset } from '@/data/sampleAssets'

type UseFeatureLibrarySelectionOptions = {
  sortedAssets: SpatialAsset[]
}

export function useFeatureLibrarySelection({ sortedAssets }: UseFeatureLibrarySelectionOptions) {
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<Set<string>>(() => new Set())
  const [selectionAnchorIndex, setSelectionAnchorIndex] = useState<number | null>(null)

  const clearSelection = useCallback(() => {
    setSelectedFeatureIds(new Set())
    setSelectionAnchorIndex(null)
  }, [])

  const selectFeature = useCallback(
    (asset: SpatialAsset, index: number, shiftKey: boolean) => {
      const assetId = asset.id

      if (shiftKey) {
        const anchor = selectionAnchorIndex ?? index
        const start = Math.min(anchor, index)
        const end = Math.max(anchor, index)
        const next = new Set<string>()
        for (let i = start; i <= end; i += 1) {
          next.add(sortedAssets[i]!.id)
        }
        setSelectedFeatureIds(next)
        if (selectionAnchorIndex == null) {
          setSelectionAnchorIndex(index)
        }
        return
      }

      setSelectedFeatureIds((prev) => {
        if (prev.has(assetId)) {
          const next = new Set(prev)
          next.delete(assetId)
          setSelectionAnchorIndex(next.size > 0 ? index : null)
          return next
        }

        setSelectionAnchorIndex(index)
        return new Set([assetId])
      })
    },
    [selectionAnchorIndex, sortedAssets],
  )

  const toggleFeatureSelection = useCallback((asset: SpatialAsset, index: number) => {
    const assetId = asset.id
    setSelectedFeatureIds((prev) => {
      const next = new Set(prev)
      if (next.has(assetId)) {
        next.delete(assetId)
        setSelectionAnchorIndex(next.size > 0 ? index : null)
      } else {
        next.add(assetId)
        setSelectionAnchorIndex(index)
      }
      return next
    })
  }, [])

  const selectedAssets = sortedAssets.filter((asset) => selectedFeatureIds.has(asset.id))

  return {
    selectedFeatureIds,
    selectedAssets,
    selectedCount: selectedFeatureIds.size,
    selectionAnchorIndex,
    selectFeature,
    toggleFeatureSelection,
    clearSelection,
  }
}
