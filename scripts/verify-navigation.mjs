import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { appURL } from './test-url.mjs'

const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', e => errors.push(e.message))
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
await page.addInitScript(() => {
  const nativeRAF = window.requestAnimationFrame.bind(window), nativeCancel = window.cancelAnimationFrame.bind(window)
  const pending = new Set(), contexts = new Set()
  let draws = 0
  window.requestAnimationFrame = callback => {
    const id = nativeRAF(time => { pending.delete(id); callback(time) }); pending.add(id); return id
  }
  window.cancelAnimationFrame = id => { pending.delete(id); nativeCancel(id) }
  const originalContext = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (...args) {
    const context = originalContext.apply(this, args)
    if (args[0] === 'webgl2' && context) contexts.add(context)
    return context
  }
  for (const method of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) {
    const original = WebGL2RenderingContext.prototype[method]
    WebGL2RenderingContext.prototype[method] = function (...args) { draws++; return original.apply(this, args) }
  }
  window.__navigationStats = () => ({ pending: pending.size, contexts: contexts.size, draws })
})
const snapshot = () => page.evaluate(() => window.__BEYOND_EXHIBIT__.snapshot())
const ready = (scene, hold = false) => page.waitForFunction(({ scene, hold }) => {
  const s = window.__BEYOND_EXHIBIT__.snapshot(); return s.sceneId === `scene0${scene}` && s.beat === 0 && (!hold || s.holding)
}, { scene, hold })
const clean = async () => {
  assert.equal(await page.locator('.stage > [class^="scene0"]').count(), 1, 'Exactly one scene root')
  assert.equal(await page.locator('.scene-preparation').count(), 0, 'Static handoff staging has been removed')
  const buttons = await page.locator('button').count()
  // The settings panel is keyboard-only; its close button is the only control.
  assert.equal(buttons, 2, `Only hidden audio settings and panel close buttons exist (found ${buttons})`)
  assert.equal(await page.locator('nav,.presentation-controls').count(), 0, 'No presentation navigation controls')
  const stats = await page.evaluate(() => window.__navigationStats())
  assert.equal(stats.contexts, 1, 'All jumps reuse the original WebGL context')
  assert(stats.pending <= 7, `Controller, room, GSAP and finite music crossfades stay bounded (${stats.pending})`)
  if (await page.locator('canvas').count()) assert(await page.evaluate(() => document.querySelector('canvas') === window.__initialCanvas))
}
const jump = async (scene, wait = true) => {
  await page.keyboard.press(String(scene)); await ready(scene, wait); await clean()
  await page.waitForFunction(scene => location.hash === `#scene=${scene}&beat=0`, scene)
}
try {
  await page.goto(appURL())
  await page.evaluate(() => { window.__initialCanvas = document.querySelector('canvas') })
  for (let scene = 1; scene <= 6; scene++) {
    await jump(scene)
    assert.equal((await snapshot()).beat, 0)
    console.log(`PASS: ${scene} opens Scene ${scene} beat 0 with one room context, one scene root and bounded RAF callbacks`)
  }
  for (const scene of [1, 6, 3, 5, 2, 4, 1]) await jump(scene, false)
  await ready(1, true); await page.waitForTimeout(1200); await clean()
  assert.equal((await snapshot()).sceneId, 'scene01')
  console.log('PASS: rapid 1 → 6 → 3 → 5 → 2 → 4 → 1 safely interrupts active entry timelines')
  for (const scene of [5, 2, 6, 1, 5]) await jump(scene, false)
  await ready(5, true); await clean()
  console.log('PASS: focused repair jump sequence 5 → 2 → 6 → 1 → 5 removes the closing detail layer')

  await jump(3)
  for (let beat = 1; beat <= 3; beat++) {
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(b => { const s = window.__BEYOND_EXHIBIT__.snapshot(); return s.beat === b && s.holding }, beat)
  }
  await jump(3)
  assert.equal((await snapshot()).beat, 0)
  const before = await snapshot(), hash = await page.evaluate(() => location.hash)
  for (const key of ['Control+6', 'Alt+6', 'Meta+6', 'Shift+6']) {
    await page.keyboard.press(key); assert.equal((await snapshot()).sceneId, before.sceneId)
  }
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: '6', code: 'Digit6', repeat: true, bubbles: true })))
  assert.equal((await snapshot()).sceneId, 'scene03')
  for (const tag of ['input', 'textarea', 'div', 'div']) {
    await page.evaluate(tag => {
      const e = document.createElement(tag); e.id = 'focus-test'
      if (tag === 'div') e.setAttribute('contenteditable', '')
      document.body.append(e); e.focus()
    }, tag)
    for (const key of ['6', 'r', 'd', 'f', 'ArrowRight', 'ArrowLeft', 'Space']) await page.keyboard.press(key)
    assert.equal((await snapshot()).sceneId, 'scene03'); assert.equal((await snapshot()).beat, 0)
    await page.locator('#focus-test').evaluate(e => e.remove())
  }
  for (const scene of [7, 8, 9]) await page.keyboard.press(String(scene))
  assert.equal((await snapshot()).sceneId, 'scene03'); assert.equal(await page.evaluate(() => location.hash), hash)
  assert.equal(await page.locator('.dev-overlay').isVisible(), false)
  await page.keyboard.press('d')
  assert.equal(await page.locator('.audio-panel').isVisible(), true, 'D opens audio settings')
  assert.equal(await page.locator('.dev-overlay').isVisible(), false, 'D does not open the debug overlay')
  await page.keyboard.press('d')
  assert.equal(await page.locator('.audio-panel').isVisible(), false, 'D closes audio settings')
  await page.keyboard.press('Shift+d'); await page.keyboard.press('7')
  await page.waitForFunction(() => document.querySelector('.dev-notice').textContent.includes('Scene 7 not implemented'))
  await page.keyboard.press('Shift+d')
  // Playwright sends navigation keys for numpad codes and cannot toggle NumLock.
  await page.keyboard.press('Numpad6')
  assert.equal((await snapshot()).sceneId, 'scene03', 'NumLock-off ArrowRight/Numpad6 is not a digit jump')
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', {
    key: '6', code: 'Numpad6', location: 3, modifierNumLock: true, bubbles: true,
  })))
  await ready(6, true); await clean()
  console.log('PASS: same-scene reset, modifiers/Shift/repeat guards, editable focus guards, missing scenes and numpad digit')

  // Regression: pressing Next/Observable input DURING an active reveal must not be
  // silently dropped. The current reveal finishes in its stable state and the single
  // queued advance fires immediately after, yielding exactly one extra beat.
  await jump(3)
  await page.keyboard.press('ArrowRight')
  await page.waitForFunction(() => { const s = window.__BEYOND_EXHIBIT__.snapshot(); return s.beat === 1 && s.transitioning })
  await page.keyboard.press('ArrowRight')
  await page.waitForFunction(() => { const s = window.__BEYOND_EXHIBIT__.snapshot(); return s.beat === 2 && s.holding })
  console.log('PASS: Next pressed during an active reveal finishes it, then advances exactly one beat')
  // Same guarantee for Previous during an active reveal (queued rewind).
  await page.keyboard.press('ArrowRight')
  await page.waitForFunction(() => { const s = window.__BEYOND_EXHIBIT__.snapshot(); return s.beat === 3 && s.transitioning })
  await page.keyboard.press('ArrowLeft')
  await page.waitForFunction(() => { const s = window.__BEYOND_EXHIBIT__.snapshot(); return s.beat === 2 && s.holding })
  console.log('PASS: Previous pressed during an active reveal finishes it, then rewinds exactly one beat')

  await jump(5)
  await page.evaluate(() => {
    window.__BEYOND_EXHIBIT__.seekBeat(5)
    window.__scene5Audio = 0; window.__scene5Stops = 0
    window.__BEYOND_EXHIBIT__.audio.onCue(() => {
      window.__scene5Audio++; return () => { window.__scene5Stops++ }
    })
  })
  await page.keyboard.press('Space'); await page.waitForTimeout(700)
  assert.equal((await snapshot()).phase, 'transforming')
  await jump(6)
  assert(await page.evaluate(() => window.__scene5Stops > 0))
  assert.equal((await snapshot()).details.postMotionBlurDamp, 0, 'A scene jump clears temporal blur on the retained room')
  assert.equal((await snapshot()).details.postCameraFlashUniform, 0, 'A scene jump clears its camera flash')
  const cuesAfterJump = await page.evaluate(() => window.__scene5Audio)
  await page.waitForTimeout(1800)
  assert.equal(await page.evaluate(() => window.__scene5Audio), cuesAfterJump, 'No remaining Scene 5 cue callbacks')
  for (const key of ['atom', 'ocean', 'body', 'space', 'history']) assert.equal((await snapshot()).details[key], 0)
  assert.equal(await page.locator('.s5-label,.s5-paper,.s5-motion-blur,.s5-flash').count(), 0)
  await jump(5); await page.evaluate(() => { window.__BEYOND_EXHIBIT__.seekBeat(5) })
  await page.keyboard.press('Space'); await page.waitForTimeout(800); await jump(2)
  assert.deepEqual((await snapshot()).camera, { x: 0, y: 1.7, z: .9 })
  assert.equal((await snapshot()).details.environment, 0)
  assert.equal((await snapshot()).details.lighting, 0)
  await jump(5); await page.evaluate(() => { window.__BEYOND_EXHIBIT__.seekBeat(5) })
  await page.keyboard.press('Space'); await page.waitForTimeout(900); await jump(3)
  const idleDraws = (await page.evaluate(() => window.__navigationStats())).draws
  await page.waitForTimeout(1600)
  assert.equal((await page.evaluate(() => window.__navigationStats())).draws, idleDraws, 'No old render loop draws behind the scrapbook')
  console.log('PASS: interrupted Scene 5 reveals → 6/2/3 stop audio and clear post effects, camera/light state and background drawing')

  await jump(6); await page.keyboard.press('f'); await page.waitForFunction(() => !!document.fullscreenElement)
  await jump(2, false)
  assert(await page.evaluate(() => !!document.fullscreenElement), 'Scene jumps preserve fullscreen')
  await page.keyboard.press('f'); await page.waitForFunction(() => !document.fullscreenElement)
  await page.goto(appURL('/#scene=6&beat=4'))
  await page.waitForFunction(() => { const s = window.__BEYOND_EXHIBIT__.snapshot(); return s.sceneId === 'scene06' && s.beat === 4 && s.holding })
  await page.keyboard.press('6'); await ready(6, true)
  assert.equal((await snapshot()).beat, 0, 'A number key always resets even after loading a specific beat hash')
  await page.goto(appURL('/#scene=1&beat=2'))
  await page.waitForFunction(() => { const s = window.__BEYOND_EXHIBIT__.snapshot(); return s.sceneId === 'scene01' && s.beat === 2 && s.holding })
  await page.goto(appURL('/#scene=9&beat=30'))
  assert.equal((await snapshot()).sceneId, 'scene01'); assert.equal((await snapshot()).beat, 2, 'An unknown hash preserves the current scene and beat')
  // A different query forces a new document, unlike same-document hash navigation.
  await page.goto(appURL('/?invalid-scene-check#scene=9&beat=30')); await ready(1, true)
  assert.deepEqual(errors, [])
  console.log('PASS: fullscreen remains active through jumps, scene/beat hash load/update, invalid hash fallback, zero browser errors')
} finally { await browser.close() }
