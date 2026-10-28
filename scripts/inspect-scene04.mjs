import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

await mkdir('artifacts/scene04', { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
try {
  await page.goto('http://127.0.0.1:5173')
  await page.evaluate(() => window.__BEYOND_EXHIBIT__.seek(20))
  await page.keyboard.press('ArrowRight')
  await page.waitForFunction(() => window.__BEYOND_EXHIBIT__.snapshot().holding)
  await page.evaluate(() => window.__BEYOND_EXHIBIT__.seekBeat(7))
  await page.keyboard.press('ArrowRight')
  await page.waitForFunction(() => window.__BEYOND_EXHIBIT__.snapshot().holding)
  await page.evaluate(() => window.__BEYOND_EXHIBIT__.seekBeat(7))
  await page.keyboard.press('ArrowRight')
  await page.waitForFunction(() => window.__BEYOND_EXHIBIT__.snapshot().holding)
  for (let beat = 0; beat <= 7; beat++) {
    await page.evaluate(beat => window.__BEYOND_EXHIBIT__.seekBeat(beat), beat)
    await page.waitForTimeout(100)
    await page.screenshot({ path: `artifacts/scene04/beat-${beat}.png` })
    console.log('Captured Scene 4 beat', beat)
  }
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.screenshot({ path: 'artifacts/scene04/final-1080p.png' })
  console.log('Browser errors:', JSON.stringify(errors))
} finally { await browser.close() }
