import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage()
const logs = []
page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`))

await page.goto('http://localhost:5174/pano-strict-test.html', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(20000)

const state = await page.evaluate(() => ({
  loaders: document.querySelectorAll('.psv-loader-container:not(.psv-loader-container--hide)').length,
  host2Children: document.getElementById('host2')?.childElementCount ?? 0,
}))

console.log(JSON.stringify({ state, logs }, null, 2))
await browser.close()
