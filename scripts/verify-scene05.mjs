import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { appURL } from './test-url.mjs'

const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })
const errors = [], audioRequests = []
page.on('pageerror', e => errors.push(e.message))
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
await page.route(/\.(mp3|wav|ogg|m4a)(\?|$)/, r => { audioRequests.push(r.request().url()); return r.continue() })
const snapshot = () => page.evaluate(() => window.__BEYOND_EXHIBIT__.snapshot())
const hold = (scene, beat) => page.waitForFunction(({ scene, beat }) => {
  const s = window.__BEYOND_EXHIBIT__.snapshot(); return s.sceneId === scene && s.beat === beat && s.holding
}, { scene, beat })
const stable = s => ({ camera: s.camera, ...Object.fromEntries(['atom', 'ocean', 'body', 'space', 'history', 'brightness', 'particles', 'final'].map(k => [k, s.details[k]])) })
const holdStill = async (beat, delay = 800) => {
  const before = stable(await snapshot())
  await page.waitForTimeout(delay)
  const after = await snapshot()
  assert.equal(after.sceneId, 'scene05'); assert.equal(after.beat, beat); assert(after.holding)
  assert.deepEqual(stable(after), before, 'Camera and world state stay fixed during a hold')
}
const checkText = async () => {
  await page.setViewportSize({ width: 1920, height: 1080 }); await page.waitForTimeout(70)
  const failures = await page.evaluate(() => {
    const stage = document.querySelector('.stage').getBoundingClientRect()
    return [...document.querySelectorAll('.s5-label h2,.s5-final > *')].flatMap(e => {
      if (Number(getComputedStyle(e).opacity) < .1 || Number(getComputedStyle(e.parentElement).opacity) < .1) return []
      const r = e.getBoundingClientRect(), font = parseFloat(getComputedStyle(e).fontSize)
      return r.x < stage.x + 80 || r.right > stage.right - 80 || r.y < stage.y + 65 || r.bottom > stage.bottom - 65 || font < 32
        ? [{ text: e.textContent, font, x: r.x, right: r.right }] : []
    })
  })
  assert.deepEqual(failures, [], 'Visible titles stay projector-safe and at least 32px at 1080p')
  await page.setViewportSize({ width: 1280, height: 800 })
}

try {
  await page.goto(appURL('/#scene=2&beat=0')); await hold('scene02', 0)
  await page.evaluate(() => { window.__roomCanvas = document.querySelector('canvas') })
  await page.keyboard.press('4'); await hold('scene04', 0)
  await page.evaluate(() => window.__BEYOND_EXHIBIT__.seekBeat(7)); await hold('scene04', 7)
  const frame = await page.locator('.s4-future-room image').getAttribute('href')
  await page.keyboard.press('ArrowRight')
  await page.waitForFunction(() => {
    const e = document.querySelector('.s5-paper')
    return e && parseFloat(e.style.getPropertyValue('--portal-radius')) > 0
  })
  assert.equal((await snapshot()).sceneId, 'scene05')
  assert.equal(await page.locator('.s5-paper .s4-future-room image').getAttribute('href'), frame)
  assert.equal(await page.locator('.s5-paper').evaluate(e => getComputedStyle(e).display), 'block')
  const aperture = await page.locator('.s5-paper').evaluate(e => parseFloat(e.style.getPropertyValue('--portal-radius')))
  assert(aperture > 0 && aperture < 155, 'The future-room blueprint iris opens onto the retained 3D room')
  assert(await page.evaluate(() => document.querySelector('canvas') === window.__roomCanvas))
  let effects = (await snapshot()).details
  assert(effects.postMotionBlurDamp > 0, 'The 2D-to-3D move uses temporal motion blur in the WebGL render pass')
  assert.equal(await page.locator('.s5-motion-blur,.s5-flash').count(), 0, 'No CSS blur or flash overlays are present')
  await page.waitForFunction(() => window.__BEYOND_EXHIBIT__.snapshot().details.postCameraFlashUniform > .5)
  await hold('scene05', 0)
  assert.equal(await page.locator('.s5-paper').evaluate(e => getComputedStyle(e).display), 'none')

  await page.evaluate(() => {
    window.__scene5Cues = []
    window.__BEYOND_EXHIBIT__.audio.onCue((name, time) => { window.__scene5Cues.push({ name, time }) })
  })
  const layouts = [stable(await snapshot())]
  for (let beat = 1; beat <= 5; beat++) {
    await page.keyboard.press(beat % 2 ? 'Space' : 'ArrowRight')
    assert.equal((await snapshot()).beat, beat)
    if (beat === 4) {
      await page.waitForFunction(() => window.__BEYOND_EXHIBIT__.snapshot().elapsed > .38)
      const dark = await snapshot(); effects = dark.details
      assert(dark.elapsed < .7 && effects.brightness < .025 && effects.body < .01 && effects.space > .95,
        'The blackout hides the body before space appears')
      assert(effects.postMotionBlurDamp > .5, 'The body-to-space transition uses actual temporal motion blur')
      await page.waitForFunction(() => window.__BEYOND_EXHIBIT__.snapshot().details.postCameraFlashUniform > .5)
      await page.waitForFunction(() => window.__BEYOND_EXHIBIT__.snapshot().elapsed > 2.05)
      effects = (await snapshot()).details
      assert(effects.brightness > .8 && effects.body < .01 && effects.space > .95, 'Space is revealed after the body fades away')
    }
    await hold('scene05', beat); await holdStill(beat); await checkText()
    layouts.push(stable(await snapshot()))
    assert.equal((await snapshot()).details.visitors, 33)
    console.log(`PASS: manual world beat ${beat}, transition, stable hold and readable title`)
  }
  await holdStill(5, 1500)
  assert.equal((await snapshot()).beat, 5, 'Rome remains a manual hold with no automatic sequence')
  assert.equal((await snapshot()).totalBeats, 7, 'Scene 5 has no extra montage beat')
  assert(!audioRequests.some(url => url.endsWith('/synthwave-bed.mp3')), 'No montage music is requested')
  await page.keyboard.press('Space'); await hold('scene05', 6)
  const finale = await snapshot()
  assert.equal(finale.totalBeats, 7); assert.equal(finale.beatName, 'One Room. Endless Places to Go.')
  assert.equal(await page.locator('.s5-final h1').evaluate(e => getComputedStyle(e).opacity), '1')
  await checkText(); await holdStill(6, 1500)
  assert(!audioRequests.some(url => url.endsWith('/synthwave-bed.mp3')), 'The manual finale stays on the regular exhibit bed')
  const cues = await page.evaluate(() => window.__scene5Cues)
  assert(cues.every(cue => !cue.name.startsWith('montage_')), 'No montage cue is scheduled')
  for (const name of ['atom_low_pulse', 'particle_rise', 'atom_reveal', 'sub_hit_01', 'ocean_transition', 'underwater_rumble', 'distant_creature', 'sub_hit_02', 'heartbeat_start', 'body_transition', 'heartbeat_impact', 'biological_rise', 'blackhole_sub_hit', 'cosmic_rise', 'gravitational_rumble', 'stone_rumble', 'rome_footsteps', 'distant_city', 'torch_ambience', 'final_vision_reveal']) assert(cues.some(cue => cue.name === name), name)
  assert(cues.some(cue => cue.name === 'blackhole_sub_hit' && cue.time === 1.35))
  assert(audioRequests.some(url => url.endsWith('/bass-drop-new-1.mp3')))
  assert(audioRequests.some(url => url.endsWith('/bass-drop-new-2.mp3')))
  console.log('PASS: five manual world reveals and direct finale, seven beats total, no montage playback or cues')

  await page.keyboard.press('ArrowRight'); await hold('scene06', 0)
  assert(audioRequests.some(url => url.endsWith('/closing-proposal.mp3')), 'Scene 6 switches to its closing music')
  await page.keyboard.press('ArrowLeft'); await hold('scene05', 6)
  assert.equal((await snapshot()).beat, 6, 'Returning from Scene 6 lands on the final hold')
  await page.keyboard.press('ArrowLeft'); await hold('scene05', 5)
  assert.deepEqual(stable(await snapshot()), layouts[5])
  for (let beat = 4; beat >= 0; beat--) {
    await page.keyboard.press('ArrowLeft'); await hold('scene05', beat)
    assert.deepEqual(stable(await snapshot()), layouts[beat])
  }
  await page.keyboard.press('ArrowLeft'); await hold('scene04', 7)
  assert.equal(await page.locator('.s4-future-room image').getAttribute('href'), frame)
  await page.keyboard.press('ArrowRight'); await hold('scene05', 0)
  assert(await page.evaluate(() => document.querySelector('canvas') === window.__roomCanvas))
  await page.keyboard.press('f'); await page.waitForFunction(() => !!document.fullscreenElement)
  await page.keyboard.press('f'); await page.waitForFunction(() => !document.fullscreenElement)
  assert(!audioRequests.some(url => url.endsWith('/synthwave-bed.mp3')))
  assert(audioRequests.every(url => /\/audio\/approved\//.test(url)))
  assert.deepEqual(errors, [])
  console.log('PASS: Scene 5 ↔ 6 finale handoff, backward navigation, retained canvas, audio paths and zero browser errors')
} finally { await browser.close() }
