import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage()

await page.addInitScript(() => {
  localStorage.setItem(
    'ocumap-auth-user',
    JSON.stringify({ displayName: 'John Smith', email: 'john.smith@atlaspm.com' }),
  )
})

const logs = []
const network = []
page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`))
page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`))
page.on('request', (req) => {
  if (req.url().includes('Panorama') || req.url().includes('spherical-pano')) {
    network.push({ type: 'request', url: req.url() })
  }
})
page.on('response', async (res) => {
  if (res.url().includes('Panorama') || res.url().includes('spherical-pano')) {
    network.push({ type: 'response', url: res.url(), status: res.status() })
  }
})

await page.goto('http://localhost:5174/library?project=p-1', {
  waitUntil: 'domcontentloaded',
  timeout: 30000,
})

await page.waitForSelector('#root > *', { timeout: 30000 })

console.log('url:', page.url())
console.log('body snippet:', (await page.locator('body').innerText()).slice(0, 800))
console.log('html snippet:', (await page.content()).slice(0, 1200))

// Switch to Feature Library tab if needed
const featureTab = page.getByRole('tab', { name: 'Feature Library' })
if (await featureTab.isVisible()) {
  await featureTab.click()
}

await page.waitForTimeout(1000)
const buttons = await page.locator('button').allTextContents()
console.log('buttons:', buttons.filter((t) => t.includes('Panorama') || t.includes('7262')))

// Click first panorama asset
try {
  await page.getByText('7262 Panorama', { exact: true }).click({ timeout: 15000 })
} catch (e) {
  console.log('click failed, logs so far:', logs)
  throw e
}

await page.waitForTimeout(60000)

const progress = await page.evaluate(() => {
  const path = document.querySelector('.psv-loader-canvas path')
  return path?.getAttribute('d') ?? null
})

const psvState = await page.evaluate(() => {
  const containers = document.querySelectorAll('.psv-container')
  const loaders = document.querySelectorAll('.psv-loader-container')
  const canvases = document.querySelectorAll('.psv-canvas-container canvas')
  const loaderCanvases = document.querySelectorAll('.psv-loader-canvas')
  return {
    containerCount: containers.length,
    loaderCount: loaders.length,
    canvasCount: canvases.length,
    loaderCanvasCount: loaderCanvases.length,
    loaderHidden: Array.from(loaders).map((el) => el.classList.contains('psv-loader-container--hide')),
  }
})
const loaderVisible = await page.locator('.psv-loader-container:not(.psv-loader-container--hide)').count()
const canvasVisible = await page.locator('.psv-canvas-container canvas').isVisible().catch(() => false)
const containerSize = await page.locator('.psv-container').evaluate((el) => ({
  w: el.clientWidth,
  h: el.clientHeight,
})).catch(() => null)
const errorVisible = await page.locator('.psv-error-message').isVisible().catch(() => false)
const errorText = errorVisible ? await page.locator('.psv-error-message').textContent() : null

console.log(JSON.stringify({ loaderVisible, canvasVisible, containerSize, psvState, progress, errorVisible, errorText, network, logs }, null, 2))

await browser.close()
