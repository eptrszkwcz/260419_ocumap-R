export type RotationDeg = 0 | 90 | 180 | 270

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

function canvasToBlobUrl(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob == null) {
        reject(new Error('Failed to render image'))
        return
      }
      resolve(URL.createObjectURL(blob))
    }, 'image/png')
  })
}

export async function rotateImageBlob(
  imageUrl: string,
  rotationDeg: RotationDeg,
): Promise<{ url: string; width: number; height: number }> {
  const img = await loadImage(imageUrl)
  if (rotationDeg === 0) {
    return { url: imageUrl, width: img.naturalWidth, height: img.naturalHeight }
  }

  const canvas = document.createElement('canvas')
  const radians = (rotationDeg * Math.PI) / 180

  if (rotationDeg === 90 || rotationDeg === 270) {
    canvas.width = img.naturalHeight
    canvas.height = img.naturalWidth
  } else {
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
  }

  const ctx = canvas.getContext('2d')
  if (ctx == null) throw new Error('Canvas not supported')

  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate(radians)
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)

  const url = await canvasToBlobUrl(canvas)
  return { url, width: canvas.width, height: canvas.height }
}

export function nextRotationDeg(current: RotationDeg): RotationDeg {
  if (current === 0) return 90
  if (current === 90) return 180
  if (current === 180) return 270
  return 0
}
