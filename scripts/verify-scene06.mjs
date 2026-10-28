import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { appURL } from './test-url.mjs'

const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })
const errors = [], requests = []
page.on('pageerror', e => errors.push(e.message))
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
await page.route(/\.(mp3|wav|ogg|m4a)(\?|$)/, r => { requests.push(r.request().url()); return r.continue() })
const snapshot = () => page.evaluate(() => window.__BEYOND_EXHIBIT__.snapshot())
const hold = (scene, beat) => page.waitForFunction(({ scene, beat }) => {
  const s = window.__BEYOND_EXHIBIT__.snapshot(); return s.sceneId === scene && s.beat === beat && s.holding
}, { scene, beat })
const layout = () => page.evaluate(() => [...document.querySelectorAll('.scene06 .s6-panel,.s6-path-stage,.s6-path-arrow,.s6-small-room,.s6-finale h1')].map(e => ({
  class: e.getAttribute('class'), opacity: getComputedStyle(e).opacity, transform: getComputedStyle(e).transform,
})))
const still = async (beat, delay = 700) => {
  const before = await snapshot(), dom = await layout()
  await page.waitForTimeout(delay)
  const after = await snapshot()
  assert.equal(after.sceneId, 'scene06'); assert.equal(after.beat, beat); assert(after.holding)
  assert.deepEqual(after.camera, before.camera); assert.deepEqual(await layout(), dom)
}
const readable = async () => {
  await page.setViewportSize({ width: 1920, height: 1080 }); await page.waitForTimeout(80)
  const failures = await page.evaluate(() => {
    const stage = document.querySelector('.stage').getBoundingClientRect()
    return [...document.querySelectorAll('.s6-panel h1,.s6-panel p,.s6-path-stage span')].flatMap(e => {
      let parent = e
      while (parent && !parent.classList.contains('scene06')) {
        if (Number(getComputedStyle(parent).opacity) < .1) return []
        parent = parent.parentElement
      }
      const r = e.getBoundingClientRect(), font = parseFloat(getComputedStyle(e).fontSize)
      return r.x < stage.x + 90 || r.right > stage.right - 90 || r.y < stage.y + 70 || r.bottom > stage.bottom - 70 || font < 32
        ? [{ text: e.textContent, font, x: r.x, right: r.right }] : []
    })
  })
  assert.deepEqual(failures, [], 'All important closing text is at least 32px inside 1080p safe margins')
  await page.setViewportSize({ width: 1280, height: 800 })
}
try {
  await page.goto(appURL('/#scene=5&beat=6'))
  await hold('scene05', 6)
  const final5 = await snapshot()
  await page.evaluate(() => { window.__closingCanvas = document.querySelector('canvas') })
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(150)
  const entry = await snapshot()
  assert.equal(entry.sceneId, 'scene06'); assert.equal(entry.beat, 0); assert(entry.transitioning)
  assert(Math.abs(entry.camera.x - final5.camera.x) < .1, 'Entry begins from Scene 5 camera with no unrelated cut')
  assert(entry.details.atom > 0 && entry.details.space > 0, 'The actual projection layers fade rather than disappearing on entry')
  await page.evaluate(() => {
    window.__closingAudio = []; window.__closingStops = 0
    window.__BEYOND_EXHIBIT__.audio.onCue((name, time) => {
      window.__closingAudio.push({ name, time }); return () => { window.__closingStops++ }
    })
  })
  await hold('scene06', 0); await still(0, 1400)
  assert(await page.evaluate(() => document.querySelector('canvas') === window.__closingCanvas))
  assert.equal((await snapshot()).details.atom, 0); assert.equal((await snapshot()).details.space, 0)
  assert.equal((await snapshot()).details.heroDetail, 1)
  assert.equal((await snapshot()).details.detailLayers, 1)
  assert.equal((await snapshot()).details.visitors, 7)
  assert.equal(await page.locator('.s6-outgoing').evaluate(e => getComputedStyle(e).display), 'none')
  assert.equal(await page.locator('.s6-finale').evaluate(e => getComputedStyle(e).opacity), '0')
  const layouts = [await layout()], cameras = [(await snapshot()).camera]
  for (let beat = 1; beat <= 5; beat++) {
    await page.keyboard.press(beat % 2 ? 'Space' : 'ArrowRight')
    assert.equal((await snapshot()).beat, beat, 'One input starts exactly one closing reveal')
    await hold('scene06', beat); await still(beat); await readable()
    layouts.push(await layout()); cameras.push((await snapshot()).camera)
    assert.equal(await page.locator('.s6-finale').evaluate(e => getComputedStyle(e).opacity), beat === 5 ? '1' : '0')
    console.log(`PASS: Scene 6 beat ${beat}, manual reveal/hold, no premature final line, safe 1080p type`)
  }
  assert.equal(await page.locator('.s6-finale').innerText(), "DON'T JUST LOOK AT SCIENCE.\nSTEP INSIDE IT.")
  assert.match(await page.locator('.s6-title').innerText(), /THE FRANKLIN INSTITUTE, PHILADELPHIA/)
  assert.equal(await page.locator('button:visible,nav,.presentation-controls').count(), 0)
  assert(!/thank you|credits/i.test(await page.locator('.scene06').innerText()))
  await page.keyboard.press('Shift+d')
  assert.match(await page.locator('.dev-overlay').innerText(), /Scene 6 \/ 6 scenes/)
  assert.match(await page.locator('.dev-overlay').innerText(), /Beat 5 \/ 6 beats/)
  assert.match(await page.locator('.dev-overlay').innerText(), /It's to help them step inside it/)
  assert.match(await page.locator('.dev-overlay').innerText(), /1–9 jump to scene/)
  await page.keyboard.press('Shift+d')
  await page.keyboard.press('f'); await page.waitForFunction(() => !!document.fullscreenElement)
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('Space')
  assert.equal((await snapshot()).beat, 5)
  assert(await page.evaluate(() => !!document.fullscreenElement), 'Final advance never exits fullscreen')
  await page.keyboard.press('f'); await page.waitForFunction(() => !document.fullscreenElement)
  for (const size of [{ width: 480, height: 850 }, { width: 1366, height: 768 }, { width: 1280, height: 800 }]) {
    await page.setViewportSize(size); await page.waitForTimeout(80)
    const r = await page.locator('.stage').boundingBox(); assert(Math.abs(r.width / r.height - 16 / 9) < .003)
  }
  console.log('Checking the 30-second final hold…'); await still(5, 30000)
  for (let beat = 4; beat >= 0; beat--) {
    await page.keyboard.press('ArrowLeft'); await hold('scene06', beat)
    assert.deepEqual(await layout(), layouts[beat]); assert.deepEqual((await snapshot()).camera, cameras[beat])
  }
  await page.keyboard.press('Space'); await page.waitForTimeout(500)
  await page.keyboard.press('r'); await hold('scene06', 0); await still(0)
  assert.deepEqual(await layout(), layouts[0])
  const cues = await page.evaluate(() => window.__closingAudio)
  for (const name of ['scene6_enter', 'grant_reveal', 'prototype_path_reveal', 'expansion_reveal', 'final_title_reveal', 'final_pause', 'step_inside_reveal', 'final_resolution']) assert(cues.some(c => c.name === name), name)
  assert(await page.evaluate(() => window.__closingStops) > 0)
  await page.keyboard.press('ArrowLeft'); await hold('scene05', 6)
  assert.deepEqual((await snapshot()).camera, final5.camera)
  await page.keyboard.press('ArrowRight'); await hold('scene06', 0)
  assert(await page.evaluate(() => document.querySelector('canvas') === window.__closingCanvas))
  assert(requests.some(url => url.endsWith('/bass-drop-new-3.mp3')), 'Scene 6 plays the supplied final bass drop')
  assert.deepEqual(errors, []); assert(requests.every(url => /\/audio\/approved\//.test(url)))
  console.log('PASS: calm shared-room transition, all eight silent hooks, Left/R/F/D, final hold, repeated Scene 5↔6 handoff, zero browser errors')
} finally { await browser.close() }
