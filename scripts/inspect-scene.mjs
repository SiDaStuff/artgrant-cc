import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

await mkdir('artifacts', { recursive: true })
console.log('Launching browser')
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })
console.log('Opening local presentation')
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
await page.goto('http://127.0.0.1:5173', { waitUntil: 'load' })
console.log('Page loaded')
await page.waitForFunction(() => !!window.__BEYOND_EXHIBIT__)
await page.keyboard.press('r')
for (const [time, name] of [[2.5, '01-exhibit'], [6.4, '02-brainstorm'], [10.8, '03-doorway'], [13.4, '04-portal'], [15.0, '05-threshold'], [20, '06-room']]) {
  console.log('Seeking', time)
  await page.evaluate(time => window.__BEYOND_EXHIBIT__.seek(time), time)
  await page.waitForTimeout(250)
  console.log('Capturing', name)
  await page.screenshot({ path: `artifacts/${name}.png`, timeout: 60000 })
  console.log(name, JSON.stringify(await page.evaluate(() => window.__BEYOND_EXHIBIT__.snapshot())))
}
console.log('Browser errors:', JSON.stringify(errors))
await browser.close()
