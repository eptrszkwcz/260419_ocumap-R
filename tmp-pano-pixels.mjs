import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage()
await page.addInitScript(() => {
  localStorage.setItem(
    'ocumap-auth-user',
    JSON.stringify({ displayName: 'John Smith', email: 'john.smith@atlaspm.com' }),
  )
})

await page.goto('http://localhost:5174/library?project=p-1', { waitUntil: 'domcontentloaded' })
await page.waitForSelector('#root > *', { timeout: 30000 })
await page.getByText('7262 Panorama', { exact: true }).click()
await page.waitForTimeout(10000)

const state = await page.evaluate(() => {
  const loader = document.querySelector('.psv-loader-container')
  const canvas = document.querySelector('.psv-canvas-container canvas')
  const gl = canvas?.getContext('webgl') ?? canvas?.getContext('webgl2')
  let pixels = null
  if (gl && canvas instanceof HTMLCanvasElement) {
    const buf = new Uint8Array(4)
    gl.readPixels(
      Math.floor(canvas.width / 2),
      Math.floor(canvas.height / 2),
      1,
      1,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      buf,
    )
    pixels = Array.from(buf)
  }
  return {
    loaderClasses: loader?.className ?? null,
    loaderDisplay: loader ? getComputedStyle(loader).display : null,
    loaderOpacity: loader ? getComputedStyle(loader).opacity : null,
    canvasSize: canvas instanceof HTMLCanvasElement ? [canvas.width, canvas.height] : null,
    pixels,
  }
})

console.log(JSON.stringify(state, null, 2))
await browser.close()
