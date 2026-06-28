import { useId, type ReactNode } from 'react'

type FileUploadDropZoneProps = {
  accept: string
  multiple?: boolean
  ariaLabel: string
  onFilesAdded: (files: FileList) => void
  children: ReactNode
  inputId?: string
}

export function FileUploadDropZone({
  accept,
  multiple = true,
  ariaLabel,
  onFilesAdded,
  children,
  inputId,
}: FileUploadDropZoneProps) {
  const generatedId = useId()
  const fileInputId = inputId ?? `${generatedId}-file-upload`

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onFilesAdded(e.dataTransfer.files)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <label
      htmlFor={fileInputId}
      onDrop={onDrop}
      onDragOver={onDragOver}
      className="text-fg-muted focus-within:border-fg-highlight focus-within:ring-fg-highlight/35 block cursor-pointer rounded-panel border-2 border-dashed border-stroke bg-panel p-6 text-center transition-[border-color,box-shadow] focus-within:ring-1"
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          document.getElementById(fileInputId)?.click()
        }
      }}
    >
      <input
        id={fileInputId}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          if (e.target.files != null) {
            onFilesAdded(e.target.files)
          }
          e.target.value = ''
        }}
      />
      {children}
    </label>
  )
}
