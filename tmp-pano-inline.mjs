import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage()
const logs = []
page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`))

await page.addInitScript(() => {
  localStorage.setItem(
    'ocumap-auth-user',
    JSON.stringify({ displayName: 'John Smith', email: 'john.smith@atlaspm.com' }),
  )
})

await page.goto('http://localhost:5174/library?project=p-1', { waitUntil: 'domcontentloaded' })
await page.waitForSelector('#root > *', { timeout: 30000 })

const result = await page.evaluate(async () => {
  const host = document.createElement('div')
  host.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000'
  document.body.appendChild(host)

  const { Viewer } = await import('/node_modules/@photo-sphere-viewer/core/index.module.js')
  await import('/node_modules/@photo-sphere-viewer/core/index.css')

  const url = '/samples/feature-viewer/spherical-pano/7262%20Panorama.jpg'
  const started = performance.now()
  const viewer = new Viewer({ container: host, panorama: url, navbar: false })

  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout after 30s')), 30000)
    viewer.addEventListener('ready', () => {
      clearTimeout(t)
      resolve(undefined)
    })
    viewer.addEventListener('panorama-error', (e) => {
      clearTimeout(t)
      reject(e)
    })
  })

  return {
    ms: performance.now() - started,
    loaders: document.querySelectorAll('.psv-loader-container:not(.psv-loader-container--hide)').length,
  }
})

console.log(JSON.stringify({ result, logs }, null, 2))
await browser.close()
