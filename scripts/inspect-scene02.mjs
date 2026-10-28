import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

await mkdir('artifacts/scene02', { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
try {
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'load' })
  await page.evaluate(() => window.__BEYOND_EXHIBIT__.seek(20))
  await page.keyboard.press('ArrowRight')
  await page.waitForFunction(() => window.__BEYOND_EXHIBIT__.snapshot().sceneId === 'scene02' && window.__BEYOND_EXHIBIT__.snapshot().holding)
  for (let beat = 0; beat <= 7; beat++) {
    await page.evaluate(beat => window.__BEYOND_EXHIBIT__.seekBeat(beat), beat)
    await page.waitForTimeout(200)
    await page.screenshot({ path: `artifacts/scene02/beat-${beat}.png` })
    console.log('Beat', beat, JSON.stringify(await page.evaluate(() => window.__BEYOND_EXHIBIT__.snapshot())))
  }
  await page.evaluate(() => window.__BEYOND_EXHIBIT__.seekBeat(5))
  await page.keyboard.press('ArrowRight')
  for (const [time, name] of [[1.5, 'ocean'], [3.3, 'space'], [5.1, 'micro']]) {
    await page.evaluate(time => window.__BEYOND_EXHIBIT__.seek(time), time)
    await page.waitForTimeout(150)
    await page.screenshot({ path: `artifacts/scene02/environment-${name}.png` })
  }
  console.log('Browser errors:', JSON.stringify(errors))
} finally { await browser.close() }
