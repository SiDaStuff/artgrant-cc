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
    const state = window.__BEYOND_EXHIBIT__.snapshot()
    return state.sceneId === sceneId && state.beat === beat && state.holding
  }, { sceneId, beat })
  await page.waitForTimeout(70)
}
const layout = () => page.evaluate(() => Array.from(document.querySelectorAll('.scene04 .s4-panel,.scene04 .s4-scope-not,.scene04 .s4-scope-yes,.scene04 .s4-component,.scene04 .s4-process-stage,.scene04 .s4-long-path,.scene04 .s4-collaboration,.scene04 .s4-path-stage,.scene04 .s4-future-room')).map(element => ({
  name: element.getAttribute('class'), opacity: getComputedStyle(element).opacity, transform: element.getAttribute('transform'),
})))
const assertHold = async (beat, duration = 650) => {
  const before = await layout()
  const count = await page.locator('.scene04 svg *').count()
  await page.waitForTimeout(duration)
  const current = await snapshot()
  assert.equal(current.sceneId, 'scene04'); assert.equal(current.beat, beat); assert(current.holding)
  assert.deepEqual(await layout(), before)
  assert.equal(await page.locator('.scene04 svg *').count(), count, 'No duplicate SVG content')
}
const verifyReadability = async () => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  const problems = await page.evaluate(() => {
    const stage = document.querySelector('.stage').getBoundingClientRect()
    return Array.from(document.querySelectorAll('.scene04 .s4-hand,.scene04 .s4-print')).flatMap(text => {
      let parent = text
      while (parent && !parent.classList.contains('scene04')) {
        if (Number(getComputedStyle(parent).opacity) < .01 || getComputedStyle(parent).display === 'none') return []
        parent = parent.parentElement
      }
      const rect = text.getBoundingClientRect()
      const fontSize = parseFloat(getComputedStyle(text).fontSize) * stage.width / 1600
      return rect.x < stage.x + 60 || rect.right > stage.right - 60 || rect.y < stage.y + 125 || rect.bottom > stage.bottom - 60 || fontSize < 32
        ? [{ text: text.textContent, rect: { x: rect.x, y: rect.y, width: rect.width }, fontSize }] : []
    })
  })
  assert.deepEqual(problems, [], 'Important 1080p text stays within safe margins at ≥32 px')
  await page.setViewportSize({ width: 1280, height: 800 })
}

try {
  await page.goto(appURL())
  // The settings are keyboard-only; only the panel's close button exists.
  const appButtons = await page.locator('button').count()
  assert.equal(appButtons, 2, `Only hidden audio settings and panel close buttons exist (found ${appButtons})`)
  assert.equal(await page.locator('.presentation-controls,nav').count(), 0)
  await page.mouse.move(640, 790)
  await page.mouse.click(640, 790)
  assert.equal(await page.locator('.presentation-controls').count(), 0, 'Pointer activity never reveals a toolbar')
  assert.equal(await page.locator('.dev-overlay').isVisible(), false)
  await page.evaluate(() => { window.__retainedCanvas = document.querySelector('canvas'); window.__BEYOND_EXHIBIT__.seek(20) })
  await page.keyboard.press('ArrowRight'); await hold('scene02', 0)
  await page.evaluate(() => window.__BEYOND_EXHIBIT__.seekBeat(7))
  await page.keyboard.press('Space'); await hold('scene03', 0)
  await page.evaluate(() => window.__BEYOND_EXHIBIT__.seekBeat(7))
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(300)
  assert.equal((await snapshot()).sceneId, 'scene04')
  const outgoing = Number(await page.locator('.s4-outgoing').evaluate(element => getComputedStyle(element).opacity))
  assert(outgoing > 0 && outgoing < 1, 'Existing Scene 3 page clears smoothly')
  assert.equal((await snapshot()).beat, 0)
  await hold('scene04', 0)
  await assertHold(0, 2000)
  assert.equal(await page.locator('.s4-scope').evaluate(element => getComputedStyle(element).opacity), '0')
  assert.equal(await page.locator('.s4-outgoing').evaluate(element => getComputedStyle(element).display), 'none')
  await page.evaluate(() => {
    window.__scene4Audio = []
    window.__BEYOND_EXHIBIT__.audio.onCue((name, time) => { window.__scene4Audio.push({ name, time }) })
    window.__BEYOND_EXHIBIT__.audio.onCue(() => { throw new Error('Optional sound unavailable') })
  })
  console.log('PASS: no toolbar at startup or after pointer activity; keyboard entry clears Scene 3 and holds without funding reveal')

  const layouts = [await layout()]
  for (let beat = 1; beat <= 7; beat++) {
    await page.keyboard.press(beat % 2 ? 'Space' : 'ArrowRight')
    assert.equal((await snapshot()).beat, beat, 'Advance Input reaches the expected beat')
    if (beat === 2) {
      await page.waitForFunction(() => window.__BEYOND_EXHIBIT__.snapshot().elapsed >= 1.2)
      assert.equal(await page.locator('.s4-scope-not').evaluate(element => getComputedStyle(element).opacity), '1')
      assert.equal(await page.locator('.s4-scope-yes').evaluate(element => getComputedStyle(element).opacity), '0')
    }
    await hold('scene04', beat)
    await assertHold(beat)
    await verifyReadability()
    layouts.push(await layout())
    if (beat === 2) {
      assert.equal(await page.locator('.s4-scope-not').evaluate(element => getComputedStyle(element).opacity), '0')
      assert.equal(await page.locator('.s4-scope-yes').evaluate(element => getComputedStyle(element).opacity), '1')
      assert.match(await page.locator('.s4-scope-clarification').textContent(), /later phase \+ additional funding/)
    }
    if (beat === 3) assert.equal(await page.locator('.s4-component').count(), 8)
    if (beat === 5) {
      assert.match(await page.locator('.s4-leadership').textContent(), /SILAS DAVIS/)
      await page.keyboard.press('Shift+d')
      assert.match(await page.locator('.dev-overlay').innerText(), /specialized knowledge/)
      await page.keyboard.press('Shift+d')
    }
    if (beat === 6) assert.match(await page.locator('.s4-funding-path').textContent(), /partnership \+ larger funding/)
    console.log(`PASS: Scene 4 beat ${beat} — ${(await snapshot()).beatName} — manual hold, funding scope and 1080p readability`)
  }

  assert.match(await page.locator('.s4-future-room').textContent(), /future goal/)
  assert.match(await page.locator('.s4-future-room image').getAttribute('href'), /^data:image\/png;base64,/)
  const handoff = await page.evaluate(() => window.__BEYOND_EXHIBIT__.handoff())
  assert(handoff.x > .5 && handoff.width > 0 && handoff.y + handoff.height < 1)
  await page.keyboard.press('f'); await page.waitForFunction(() => !!document.fullscreenElement)
  await page.keyboard.press('f'); await page.waitForFunction(() => !document.fullscreenElement)
  await page.keyboard.press('Shift+d')
  assert.match(await page.locator('.dev-overlay').innerText(), /Scene 4 \/ Beat 7/i)
  assert.equal((await snapshot()).sceneId, 'scene04')
  await page.keyboard.press('Shift+d')
  for (const viewport of [{ width: 1366, height: 768 }, { width: 480, height: 850 }, { width: 1280, height: 800 }]) {
    await page.setViewportSize(viewport)
    const rect = await page.locator('.stage').boundingBox()
    assert(Math.abs(rect.width / rect.height - 16 / 9) < .003)
    assert(rect.width <= viewport.width + 1 && rect.height <= viewport.height + 1)
  }
  console.log('PASS: F, D, resizing and future-room transition anchor (Scene 5 entry covered in test:scene5)')
  console.log('Checking a 30-second final hold…')
  await assertHold(7, 30000)
  for (let beat = 6; beat >= 0; beat--) {
    await page.keyboard.press('ArrowLeft'); await hold('scene04', beat)
    assert.deepEqual(await layout(), layouts[beat], `Backward navigation reconstructs beat ${beat} exactly`)
  }
  await page.evaluate(() => window.__BEYOND_EXHIBIT__.seekBeat(5))
  await page.keyboard.press('Space')
  await page.waitForTimeout(450)
  await page.keyboard.press('r'); await hold('scene04', 0)
  await assertHold(0, 1500)
  assert.deepEqual(await layout(), layouts[0])
  const audio = await page.evaluate(() => window.__scene4Audio)
  for (const name of ['scene4_page_clear', 'location_reveal', 'funding_reveal', 'prototype_reveal', 'component_draw', 'process_step', 'leadership_reveal', 'funding_path', 'final_prototype_hold']) {
    assert(audio.some(cue => cue.name === name), `Cue hook ${name} fires safely`)
  }
  await page.keyboard.press('ArrowLeft'); await hold('scene03', 7)
  assert.equal(await page.locator('.s3-finale').evaluate(element => getComputedStyle(element).opacity), '1')
  await page.evaluate(() => window.__BEYOND_EXHIBIT__.seekBeat(0))
  await page.keyboard.press('ArrowLeft'); await hold('scene02', 7)
  assert(await page.evaluate(() => document.querySelector('canvas') === window.__retainedCanvas))
  assert(audioRequests.every(url => /\/audio\/approved\//.test(url)), 'Audio requests stay inside the approved asset folder')
  assert.equal(await page.locator('.presentation-controls').count(), 0)
  assert.deepEqual(errors, [])
  console.log('PASS: 30-second hold, repeated back navigation, mid-beat R, all silent cues, Scene 4 → 3 → 2 ownership, zero browser errors')
} finally { await browser.close() }
