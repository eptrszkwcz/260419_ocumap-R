import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

import { FileUploadDropZone } from '@/components/FileUploadDropZone'
import { accountPrimaryButtonClass } from '@/pages/account/accountStyles'
import {
  featureMetadataFooterActionsClassName,
  featureMetadataFooterCancelButtonClass,
} from '@/panels/library/featureMetadata/styles'

type ReplaceProfilePhotoModalProps = {
  onClose: () => void
  onReplace: (file: File) => void
}

export function ReplaceProfilePhotoModal({ onClose, onReplace }: ReplaceProfilePhotoModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (selectedFile == null) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [selectedFile])

  const handleFilesAdded = (files: FileList) => {
    const file = files.item(0)
    if (file != null && file.type.startsWith('image/')) {
      setSelectedFile(file)
    }
  }

  const handleReplace = () => {
    if (selectedFile != null) {
      onReplace(selectedFile)
    }
  }

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] bg-fg/20" aria-hidden onClick={onClose} />
      <div
        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
        role="presentation"
      >
        <div
          className="flex w-full max-w-md flex-col overflow-hidden rounded-panel border border-stroke bg-page shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-labelledby="replace-profile-photo-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-4 px-panel-padding py-5">
            <header className="flex flex-col gap-1">
              <h2 id="replace-profile-photo-title" className="font-title text-title font-bold text-fg">
                Replace profile photo?
              </h2>
              <p className="font-sans text-standard text-fg-muted">
                Upload a new image to update how you appear across OcuMap.
              </p>
            </header>

            {previewUrl != null ? (
              <div className="flex justify-center">
                <img
                  src={previewUrl}
                  alt="Selected profile photo preview"
                  className="size-24 rounded-full border border-stroke object-cover"
                />
              </div>
            ) : null}

            <FileUploadDropZone
              accept="image/*"
              multiple={false}
              ariaLabel="Upload a new profile photo"
              onFilesAdded={handleFilesAdded}
            >
              <p className="font-sans text-standard text-fg">
                {selectedFile != null ? selectedFile.name : 'Drop an image here or click to browse'}
              </p>
              <p className="mt-1 font-sans text-badge text-fg-muted">PNG, JPG, or GIF</p>
            </FileUploadDropZone>
          </div>

          <footer className="flex shrink-0 border-t border-stroke bg-panel px-panel-padding py-3">
            <div className={featureMetadataFooterActionsClassName}>
              <button
                type="button"
                onClick={onClose}
                className={featureMetadataFooterCancelButtonClass}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReplace}
                disabled={selectedFile == null}
                className={accountPrimaryButtonClass + ' disabled:cursor-not-allowed disabled:opacity-45'}
              >
                Replace photo
              </button>
            </div>
          </footer>
        </div>
      </div>
    </>,
    document.body,
  )
}
