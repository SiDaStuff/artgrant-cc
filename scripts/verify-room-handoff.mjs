import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { appURL } from './test-url.mjs'

const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
const errors = []
let removedAttach = false
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
// Reproduce the reported runtime contract: the returned room has no attach().
await page.route('**/src/scenes/scene01/room.ts*', async route => {
  const response = await route.fetch()
  const source = await response.text()
  const modified = source.replace(/attach\(target\)\s*\{\s*target\.append\(renderer\.domElement\);?\s*\},?/, '')
  removedAttach = modified !== source
  await route.fulfill({ response, body: modified })
})
try {
  await page.goto(appURL())
  assert(removedAttach, 'Test must actually remove attach() from the runtime room')
  await page.waitForFunction(() => !!window.__BEYOND_EXHIBIT__)
  assert.equal(await page.locator('canvas').count(), 1)
  assert.equal(await page.locator('.webgl-message').count(), 0)
  await page.evaluate(() => { window.__sameCanvas = document.querySelector('canvas'); window.__BEYOND_EXHIBIT__.seek(20) })
  await page.keyboard.press('ArrowRight')
  await page.waitForFunction(() => window.__BEYOND_EXHIBIT__.snapshot().sceneId === 'scene02' && window.__BEYOND_EXHIBIT__.snapshot().holding)
  assert(await page.evaluate(() => document.querySelector('canvas') === window.__sameCanvas))
  await page.keyboard.press('ArrowLeft')
  await page.waitForFunction(() => window.__BEYOND_EXHIBIT__.snapshot().sceneId === 'scene01')
  assert(await page.evaluate(() => document.querySelector('canvas') === window.__sameCanvas))
  assert.deepEqual(errors, [])
  console.log('PASS: startup, Scene 1 → 2 → 1, and the same canvas all work with attach() deliberately missing')
} finally { await browser.close() }
