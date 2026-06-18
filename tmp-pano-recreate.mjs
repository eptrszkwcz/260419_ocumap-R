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
await page.waitForTimeout(15000)

const before = await page.evaluate(() => ({
  loaders: document.querySelectorAll('.psv-loader-container:not(.psv-loader-container--hide)').length,
}))

// Simulate what a fixed component would do: destroy and recreate once (not double from strict mode)
await page.evaluate(async () => {
  const host = document.querySelector('[aria-hidden="true"].absolute')
  if (!host) return 'no host'
  host.innerHTML = ''
  const { Viewer } = await import('/node_modules/@photo-sphere-viewer/core/index.module.js')
  const viewer = new Viewer({
    container: host,
    panorama: '/samples/feature-viewer/spherical-pano/7262%20Panorama.jpg',
    navbar: false,
  })
  await new Promise((resolve) => viewer.addEventListener('ready', resolve))
  return 'ready'
})

await page.waitForTimeout(3000)
const after = await page.evaluate(() => ({
  loaders: document.querySelectorAll('.psv-loader-container:not(.psv-loader-container--hide)').length,
}))

console.log(JSON.stringify({ before, after }, null, 2))
await browser.close()
