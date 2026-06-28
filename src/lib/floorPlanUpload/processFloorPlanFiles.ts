import * as pdfjs from 'pdfjs-dist'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export type ProcessedFloorPlanPage = {
  id: string
  sourceLabel: string
  pageIndex: number
  previewUrl: string
  renderUrl: string
  width: number
  height: number
}

function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

function loadImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = reject
    img.src = url
  })
}

function canvasToBlobUrl(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob == null) {
        reject(new Error('Failed to render page'))
        return
      }
      resolve(URL.createObjectURL(blob))
    }, 'image/png')
  })
}

async function renderPdfPageToUrl(
  page: pdfjs.PDFPageProxy,
  scale: number,
): Promise<{ url: string; width: number; height: number }> {
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')
  if (ctx == null) throw new Error('Canvas not supported')
  await page.render({ canvasContext: ctx, viewport, canvas }).promise
  const url = await canvasToBlobUrl(canvas)
  return { url, width: viewport.width, height: viewport.height }
}

async function processImageFile(file: File): Promise<ProcessedFloorPlanPage[]> {
  const renderUrl = URL.createObjectURL(file)
  const { width, height } = await loadImageDimensions(renderUrl)
  return [
    {
      id: crypto.randomUUID(),
      sourceLabel: file.name,
      pageIndex: 1,
      previewUrl: renderUrl,
      renderUrl,
      width,
      height,
    },
  ]
}

async function processPdfFile(file: File): Promise<ProcessedFloorPlanPage[]> {
  const data = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data }).promise
  const pages: ProcessedFloorPlanPage[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const full = await renderPdfPageToUrl(page, 2)
    const preview =
      pdf.numPages === 1 && pageNumber === 1
        ? full
        : await renderPdfPageToUrl(page, 0.75)

    pages.push({
      id: crypto.randomUUID(),
      sourceLabel:
        pdf.numPages > 1 ? `${file.name} (page ${pageNumber})` : file.name,
      pageIndex: pageNumber,
      previewUrl: preview.url === full.url ? full.url : preview.url,
      renderUrl: full.url,
      width: full.width,
      height: full.height,
    })
  }

  return pages
}

export async function processFloorPlanFiles(files: File[]): Promise<ProcessedFloorPlanPage[]> {
  const results: ProcessedFloorPlanPage[] = []
  for (const file of files) {
    if (isPdfFile(file)) {
      results.push(...(await processPdfFile(file)))
    } else if (isImageFile(file)) {
      results.push(...(await processImageFile(file)))
    }
  }
  return results
}

export function revokeProcessedFloorPlanPages(pages: ProcessedFloorPlanPage[]): void {
  const urls = new Set<string>()
  for (const page of pages) {
    urls.add(page.previewUrl)
    urls.add(page.renderUrl)
  }
  for (const url of urls) {
    URL.revokeObjectURL(url)
  }
}
