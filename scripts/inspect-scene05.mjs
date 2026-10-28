import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

await mkdir('artifacts/scene05', { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', e => errors.push(e.message))
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
try {
  await page.goto('http://127.0.0.1:5173')
  await page.evaluate(() => { window.__BEYOND_EXHIBIT__.seek(20) })
  for (let scene = 2; scene <= 5; scene++) {
    if (scene > 2) await page.evaluate(() => { window.__BEYOND_EXHIBIT__.seekBeat(7) })
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(id => {
      const s = window.__BEYOND_EXHIBIT__.snapshot(); return s.sceneId === id && s.holding
    }, `scene0${scene}`)
  }
  for (let beat = 0; beat <= 6; beat++) {
    await page.evaluate(b => { window.__BEYOND_EXHIBIT__.seekBeat(b) }, beat)
    await page.waitForTimeout(150)
    await page.screenshot({ path: `artifacts/scene05/beat-${beat}.png` })
    console.log('Captured', beat, JSON.stringify(await page.evaluate(() => window.__BEYOND_EXHIBIT__.snapshot().details)))
  }
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.screenshot({ path: 'artifacts/scene05/final-1080p.png' })
  console.log('Browser errors:', JSON.stringify(errors))
} finally { await browser.close() }
