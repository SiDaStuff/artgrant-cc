import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { appURL } from './test-url.mjs'

const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })
const errors = [], audioRequests = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
await page.route(/\.(mp3|wav|ogg|m4a)(\?|$)/, route => { audioRequests.push(route.request().url()); return route.continue() })
const snapshot = () => page.evaluate(() => window.__BEYOND_EXHIBIT__.snapshot())
const hold = async (sceneId, beat) => {
  await page.waitForFunction(({ sceneId, beat }) => {
    const s = window.__BEYOND_EXHIBIT__.snapshot()
    return s.sceneId === sceneId && s.beat === beat && s.holding
  }, { sceneId, beat })
  await page.waitForTimeout(80)
}
const layout = () => page.evaluate(() => Array.from(document.querySelectorAll('.scene03 .s3-trace,.scene03 .s3-comparison,.scene03 .s3-traditional,.scene03 .s3-immersive,.scene03 .s3-memorable,.scene03 .s3-venn,.scene03 .s3-reuse,.scene03 .s3-benefits,.scene03 .s3-finale,.scene03 .s3-inside-label,.scene03 .s3-stepper')).map(element => ({
  name: element.getAttribute('class'), transform: element.getAttribute('transform'), opacity: getComputedStyle(element).opacity,
})))
const assertHold = async (beat, ms = 700) => {
  const before = await layout()
  const count = await page.evaluate(() => window.__webglDraws)
  await page.waitForTimeout(ms)
  assert.equal((await snapshot()).beat, beat)
  assert((await snapshot()).holding)
  assert.deepEqual(await layout(), before)
  assert.equal(await page.evaluate(() => window.__webglDraws), count, 'No WebGL draw is allowed during scrapbook beats or holds')
}

try {
  await page.goto(appURL())
  assert.equal(await page.locator('.webgl-message').count(), 0)
  await page.evaluate(() => { window.__savedCanvas = document.querySelector('canvas'); window.__BEYOND_EXHIBIT__.seek(20) })
  await page.keyboard.press('ArrowRight')
  await hold('scene02', 0)
  await page.evaluate(() => {
    window.__BEYOND_EXHIBIT__.seekBeat(7)
    window.__webglDraws = 0
    for (const key of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) {
      const original = WebGL2RenderingContext.prototype[key]
      WebGL2RenderingContext.prototype[key] = function (...args) { window.__webglDraws++; return original.apply(this, args) }
    }
  })
  await page.keyboard.press('ArrowRight')
  assert.equal((await snapshot()).sceneId, 'scene03')
  assert.equal((await snapshot()).beat, 0)
  await page.waitForTimeout(350)
  assert.equal(await page.locator('.s3-capture img').count(), 1)
  assert.match(await page.locator('.s3-capture img').getAttribute('src'), /^data:image\/png;base64,/)
  assert.match(await page.locator('.s3-capture img').evaluate(element => getComputedStyle(element).filter), /grayscale/)
  await hold('scene03', 0)
  await assertHold(0, 2500)
  assert.equal(await page.locator('.s3-comparison').evaluate(element => getComputedStyle(element).opacity), '0')
  assert.equal(await page.locator('.scene03 canvas').count(), 0)
  const traceBounds = await page.locator('.s3-trace-architecture').boundingBox()
  const stageBounds = await page.locator('.stage').boundingBox()
  assert(traceBounds.x >= stageBounds.x && traceBounds.y >= stageBounds.y)
  assert(traceBounds.x + traceBounds.width <= stageBounds.x + stageBounds.width + 1)
  assert(traceBounds.y + traceBounds.height <= stageBounds.y + stageBounds.height + 1)
  console.log('PASS: 2.7-second room → ink → paper transition; traced architecture stays in frame; entry holds with WebGL idle')

  await page.evaluate(() => {
    window.__scene3Audio = []
    window.__BEYOND_EXHIBIT__.audio.onCue((name, time) => { window.__scene3Audio.push({ name, time }) })
    window.__BEYOND_EXHIBIT__.audio.onCue(() => { throw new Error('Optional audio unavailable') })
  })
  const layouts = [await layout()]
  for (let beat = 1; beat <= 7; beat++) {
    await page.keyboard.press(beat % 2 ? 'Space' : 'ArrowRight')
    assert.equal((await snapshot()).beat, beat)
    await hold('scene03', beat)
    await assertHold(beat)
    layouts.push(await layout())
    await page.setViewportSize({ width: 1920, height: 1080 })
    const problems = await page.evaluate(() => {
      const stage = document.querySelector('.stage').getBoundingClientRect()
      return Array.from(document.querySelectorAll('.scene03 .s3-hand')).flatMap(text => {
        let parent = text
        while (parent && !parent.classList.contains('scene03')) {
          if (Number(getComputedStyle(parent).opacity) < .01) return []
          parent = parent.parentElement
        }
        const rect = text.getBoundingClientRect()
        const fontSize = parseFloat(getComputedStyle(text).fontSize) * stage.width / 1600
        return rect.x < stage.x + 50 || rect.right > stage.right - 50 || rect.y < stage.y + 125 || rect.bottom > stage.bottom - 60 || fontSize < 32
          ? [{ text: text.textContent, x: rect.x, y: rect.y, width: rect.width, fontSize }] : []
      })
    })
    assert.deepEqual(problems, [], `Beat ${beat} labels must be readable and within 1080p safe margins`)
    await page.setViewportSize({ width: 1280, height: 800 })
    console.log(`PASS: Scene 3 beat ${beat} — ${(await snapshot()).beatName} — input, stable hold, 1080p label checks`)
  }

  await page.keyboard.press('Shift+d')
  assert.match(await page.locator('.dev-overlay').innerText(), /Scene 3 \/ Beat 7/i)
  await page.keyboard.press('ArrowRight')
  await hold('scene04', 0)
  assert.equal(await page.locator('.s4-intro').count(), 1)
  await page.keyboard.press('ArrowLeft')
  await hold('scene03', 7)
  assert.equal((await snapshot()).sceneId, 'scene03')
  await page.keyboard.press('Shift+d')
  await page.keyboard.press('f')
  await page.waitForFunction(() => !!document.fullscreenElement)
  await page.keyboard.press('f')
  await page.waitForFunction(() => !document.fullscreenElement)
  for (const viewport of [{ width: 1366, height: 768 }, { width: 480, height: 850 }, { width: 1280, height: 800 }]) {
    await page.setViewportSize(viewport)
    const rect = await page.locator('.stage').boundingBox()
    assert(Math.abs(rect.width / rect.height - 16 / 9) < .003)
    assert(rect.width <= viewport.width + 1 && rect.height <= viewport.height + 1)
  }
  console.log('PASS: F, D, Scene 3 → 4 → 3, laptop and portrait resizing')
  console.log('Checking a 30-second final hold…')
  await assertHold(7, 30000)

  for (let beat = 6; beat >= 0; beat--) {
    await page.keyboard.press('ArrowLeft')
    await hold('scene03', beat)
    assert.deepEqual(await layout(), layouts[beat], `Repeated left arrow reconstructs beat ${beat}`)
  }
  await page.keyboard.press('ArrowLeft')
  await hold('scene02', 7)
  assert(await page.evaluate(() => document.querySelector('canvas') === window.__savedCanvas))
  assert.equal((await snapshot()).details.visitors, 33)
  await page.keyboard.press('ArrowRight')
  await hold('scene03', 0)
  await page.evaluate(() => window.__BEYOND_EXHIBIT__.seekBeat(3))
  await page.keyboard.press('Space')
  await page.waitForTimeout(500)
  await page.keyboard.press('r')
  await hold('scene03', 0)
  await assertHold(0, 1800)
  assert.equal(await page.locator('.s3-venn').evaluate(element => getComputedStyle(element).opacity), '0')
  assert.equal(await page.locator('.s3-comparison').evaluate(element => getComputedStyle(element).opacity), '0')
  assert.equal(await page.locator('.dev-overlay').isVisible(), false)
  assert(audioRequests.every(url => /\/audio\/approved\//.test(url)), 'Audio requests stay inside the approved asset folder')
  assert.deepEqual(errors, [])
  console.log('PASS: 30-second hold, repeated backward navigation, Scene 2 return with original canvas, R during drawing, zero browser errors')
} finally { await browser.close() }
