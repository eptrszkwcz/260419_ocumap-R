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

const xhrResult = await page.evaluate(async () => {
  const url = '/samples/feature-viewer/spherical-pano/7262%20Panorama.jpg'
  const started = performance.now()
  const blob = await fetch(url).then((r) => r.blob())
  const fetchMs = performance.now() - started

  const imgStarted = performance.now()
  const img = await new Promise((resolve, reject) => {
    const el = document.createElement('img')
    el.onload = () => resolve({ w: el.naturalWidth, h: el.naturalHeight })
    el.onerror = reject
    el.src = URL.createObjectURL(blob)
  })
  const imgMs = performance.now() - imgStarted

  return { fetchMs, imgMs, blobSize: blob.size, img }
})

console.log(JSON.stringify(xhrResult, null, 2))
await browser.close()
