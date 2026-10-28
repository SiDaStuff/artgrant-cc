import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

await mkdir('artifacts/scene06', { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', e => errors.push(e.message))
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
try {
  await page.goto('http://127.0.0.1:5173/#scene=6&beat=0')
  await page.waitForFunction(() => { const s = window.__BEYOND_EXHIBIT__.snapshot(); return s.sceneId === 'scene06' && s.holding })
  for (let beat = 0; beat <= 5; beat++) {
    await page.evaluate(b => { window.__BEYOND_EXHIBIT__.seekBeat(b) }, beat)
    await page.waitForTimeout(100)
    await page.screenshot({ path: `artifacts/scene06/beat-${beat}.png` })
    console.log('Captured', beat)
  }
  console.log('Browser errors:', JSON.stringify(errors))
} finally { await browser.close() }
