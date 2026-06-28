import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { FileUploadDropZone } from '@/components/FileUploadDropZone'
import { useActiveProject } from '@/context/ActiveProjectContext'
import { useProjectFloorPlans } from '@/context/ProjectFloorPlansContext'
import {
  processFloorPlanFiles,
  type ProcessedFloorPlanPage,
} from '@/lib/floorPlanUpload/processFloorPlanFiles'
import {
  nextRotationDeg,
  rotateImageBlob,
  type RotationDeg,
} from '@/lib/floorPlanUpload/rotateImageBlob'
import { PRIMARY_BUTTON_CLASS } from '@/lib/primaryButtonClass'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
} from '@/panels/library/featureMetadata/styles'

import {
  FloorPlanPageSelectRow,
  type PendingFloorPlanPage,
} from '@/panels/map/addFloorPlan/FloorPlanPageSelectRow'

type AddFloorPlanFlowProps = {
  onCancel: () => void
  onComplete: (firstAddedPlanId: string) => void
}

function processedToPending(page: ProcessedFloorPlanPage): PendingFloorPlanPage {
  return {
    id: page.id,
    sourceLabel: page.sourceLabel,
    previewUrl: page.previewUrl,
    renderUrl: page.renderUrl,
    width: page.width,
    height: page.height,
    selected: false,
    name: '',
    rotationDeg: 0,
  }
}

function revokePendingPages(pages: PendingFloorPlanPage[]): void {
  const urls = new Set<string>()
  for (const page of pages) {
    urls.add(page.previewUrl)
    if (page.renderUrl !== page.previewUrl) {
      urls.add(page.renderUrl)
    }
  }
  for (const url of urls) {
    URL.revokeObjectURL(url)
  }
}

export function AddFloorPlanFlow({ onCancel, onComplete }: AddFloorPlanFlowProps) {
  const { projectId } = useActiveProject()
  const { addFloorPlans } = useProjectFloorPlans()
  const fieldId = useId()
  const [pages, setPages] = useState<PendingFloorPlanPage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const pagesRef = useRef(pages)

  useEffect(() => {
    pagesRef.current = pages
  }, [pages])

  useEffect(() => {
    return () => {
      revokePendingPages(pagesRef.current)
    }
  }, [])

  const handleCancel = useCallback(() => {
    revokePendingPages(pagesRef.current)
    setPages([])
    onCancel()
  }, [onCancel])

  const handleFilesAdded = useCallback(async (fileList: FileList) => {
    const files = Array.from(fileList)
    if (files.length === 0) return

    setIsProcessing(true)
    try {
      const processed = await processFloorPlanFiles(files)
      if (processed.length === 0) return
      setPages((prev) => [...prev, ...processed.map(processedToPending)])
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const toggleSelected = useCallback((id: string) => {
    setPages((prev) =>
      prev.map((page) => (page.id === id ? { ...page, selected: !page.selected } : page)),
    )
  }, [])

  const updateName = useCallback((id: string, name: string) => {
    setPages((prev) => prev.map((page) => (page.id === id ? { ...page, name } : page)))
  }, [])

  const rotatePage = useCallback((id: string) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === id
          ? { ...page, rotationDeg: nextRotationDeg(page.rotationDeg) as RotationDeg }
          : page,
      ),
    )
  }, [])

  const selectedPages = pages.filter((page) => page.selected)
  const canAdd =
    selectedPages.length > 0 &&
    selectedPages.every((page) => page.name.trim() !== '') &&
    !isSaving

  const handleAddFloorPlans = useCallback(async () => {
    if (!canAdd) return
    setIsSaving(true)
    try {
      const addedPlans = []
      for (const page of selectedPages) {
        const rotated = await rotateImageBlob(page.renderUrl, page.rotationDeg)
        addedPlans.push({
          id: crypto.randomUUID(),
          label: page.name.trim(),
          imageUrl: rotated.url,
          width: rotated.width,
          height: rotated.height,
        })
      }

      addFloorPlans(projectId, addedPlans)
      revokePendingPages(pagesRef.current)
      setPages([])
      onComplete(addedPlans[0].id)
    } finally {
      setIsSaving(false)
    }
  }, [addFloorPlans, canAdd, onComplete, projectId, selectedPages])

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="min-h-0 min-w-0 flex-1 overflow-auto" aria-label="Add floor plans">
        <div className="mt-16 p-panel-padding">
          <FileUploadDropZone
            inputId={`${fieldId}-floor-plan-files`}
            accept="application/pdf,.pdf,image/*"
            ariaLabel="Add floor plan files. Drop PDF or image files here or browse."
            onFilesAdded={(files) => {
              void handleFilesAdded(files)
            }}
          >
            <p className="text-standard text-fg">
              Drag and drop PDF or image files here, or{' '}
              <span className="text-fg-highlight font-bold underline">browse to upload</span>
            </p>
            <p className="mt-2 text-fg-muted text-badge">
              Multi-page PDFs are split into individual pages.
            </p>
          </FileUploadDropZone>
        </div>

        {isProcessing ? (
          <p className="text-fg-muted px-panel-padding pb-4 text-center text-standard">
            Processing…
          </p>
        ) : null}

        {pages.length > 0 ? (
          <div className="border-t border-stroke px-panel-padding py-4">
            <h2 className="text-fg mb-4 font-sans text-standard font-semibold">
              Select document/pages with floor plans
            </h2>
            <div className="flex flex-col gap-4">
              {pages.map((page) => (
                <FloorPlanPageSelectRow
                  key={page.id}
                  page={page}
                  onToggleSelected={toggleSelected}
                  onNameChange={updateName}
                  onRotate={rotatePage}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-stroke bg-panel px-panel-padding py-3">
        <div className={featureMetadataFooterActionsClassName}>
          <button
            type="button"
            onClick={handleCancel}
            className={featureMetadataFooterCancelButtonClass}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              void handleAddFloorPlans()
            }}
            disabled={!canAdd}
            className={
              PRIMARY_BUTTON_CLASS +
              ' h-8 rounded-panel px-4 text-standard focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40'
            }
          >
            Add floor plans
          </button>
        </div>
      </div>
    </div>
  )
}
