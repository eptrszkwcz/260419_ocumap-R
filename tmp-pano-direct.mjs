import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage()
const logs = []
page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`))

await page.goto('http://localhost:5174/pano-test.html', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(20000)

const loaderVisible = await page.locator('.psv-loader-container:not(.psv-loader-container--hide)').count()
console.log(JSON.stringify({ loaderVisible, logs }, null, 2))
await browser.close()
