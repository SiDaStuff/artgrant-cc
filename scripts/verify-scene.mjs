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
const waitHold = async (sceneId, beat, timeout = 14000) => {
  await page.waitForFunction(({ sceneId, beat }) => {
    const state = window.__BEYOND_EXHIBIT__.snapshot()
    return state.sceneId === sceneId && state.beat === beat && state.holding && !state.transitioning
  }, { sceneId, beat }, { timeout })
  await page.waitForTimeout(80)
  return snapshot()
}
const stableState = state => ({
  scene: state.sceneId, beat: state.beat, camera: state.camera,
  environment: state.details?.environment, projection: state.details?.projection,
  sound: state.details?.sound, lighting: state.details?.lighting,
  hologram: state.details?.hologram, visitors: state.details?.visitors,
  hero: state.details?.hero, fov: state.details?.fov,
})
const verifyHold = async (state, ms = 700) => {
  await page.waitForTimeout(ms)
  assert.deepEqual(stableState(await snapshot()), stableState(state), `Beat ${state.beat} must not move or advance while holding`)
}

try {
  await page.goto(appURL(), { waitUntil: 'load' })
  await page.waitForFunction(() => !!window.__BEYOND_EXHIBIT__)
  assert.equal((await page.locator('.opening-title').textContent()).trim(), 'Beyond the Exhibit')
  assert.equal(await page.locator('.audio-panel').isVisible(), false)
  await page.keyboard.press('d')
  assert.equal(await page.locator('.audio-panel').isVisible(), true)
  await page.keyboard.press('d')
  assert.equal(await page.locator('.audio-panel').isVisible(), false)
  assert.equal(await page.locator('.scrapbook').count(), 1)
  assert.equal(await page.locator('.dev-overlay').isVisible(), false)
  await page.keyboard.press('r')
  await page.keyboard.press('ArrowRight')
  assert.equal((await snapshot()).beat, 0, 'A queued advance during the opening draw does not skip it mid-draw')
  const first = await waitHold('scene01', 1)
  assert.equal(first.beat, 1, 'Next during the opening draw is queued and advances exactly one beat when the draw ends')
  assert(Math.abs(first.elapsed - 7.1) < .01)
  await verifyHold(first, 3500)
  await page.keyboard.press('ArrowLeft')
  const opening = await waitHold('scene01', 0)
  assert(Math.abs(opening.elapsed - 3.1) < .01)
  await verifyHold(opening, 2000)
  await page.keyboard.press('Shift+d')
  assert.match(await page.locator('.dev-overlay').innerText(), /Scene 1 \/ Beat 0/i)
  await page.keyboard.press('Shift+d')
  console.log('PASS: Scene 1 scrapbook preserved; opening draws; queued Next during the opening resolves to beat 1; Left returns to the opening hold')

  for (const beat of [1, 2, 3]) {
    await page.keyboard.press(beat % 2 ? 'ArrowRight' : 'Space')
    const state = await waitHold('scene01', beat)
    await verifyHold(state)
  }
  const scene1Final = await snapshot()
  assert.equal(scene1Final.elapsed, 20)
  assert.equal(await page.locator('.title-lockup').evaluate(element => getComputedStyle(element).opacity), '1')
  await page.evaluate(() => { window.__originalCanvas = document.querySelector('canvas') })
  console.log('PASS: all Scene 1 sections animate only on input and hold on the original final room')

  await page.keyboard.press('ArrowRight')
  assert.equal((await snapshot()).sceneId, 'scene02')
  assert.equal((await snapshot()).beat, 0, 'Scene 2 entry opens on beat 0')
  assert.equal(await page.evaluate(() => document.querySelector('canvas') === window.__originalCanvas), true, 'Scene 2 retains the actual WebGL canvas')
  await page.waitForTimeout(300)
  const entryOpacity = Number(await page.locator('.title-lockup').evaluate(element => getComputedStyle(element).opacity))
  assert(entryOpacity > 0 && entryOpacity < 1, 'Scene 1 title fades rather than cutting')
  const holds = [await waitHold('scene02', 0)]
  assert(Math.abs(holds[0].camera.z - scene1Final.camera.z) < .00001)
  assert.equal(holds[0].camera.y, 1.7)
  await verifyHold(holds[0], 1800)
  await page.evaluate(() => {
    window.__audioEvents = []
    window.__removeMissingAudio = window.__BEYOND_EXHIBIT__.audio.onCue(() => { throw new Error('Simulated unavailable optional audio') })
    window.__BEYOND_EXHIBIT__.audio.onCue((name, time) => { window.__audioEvents.push({ name, time }) })
  })
  console.log('PASS: seamless shared-room handoff, title fade, and stationary Scene 2 entry hold')

  for (const beat of [1, 2, 3, 4, 5]) {
    await page.keyboard.press(beat % 2 ? 'Space' : 'ArrowRight')
    assert.equal((await snapshot()).beat, beat)
    if (beat === 4) {
      await page.waitForTimeout(600)
      assert.equal(await page.locator('.feature-label h2').innerText(), '', 'Beat 4 carries no redundant feature caption')
    }
    const hold = await waitHold('scene02', beat)
    holds.push(hold)
    await verifyHold(hold)
    if (beat < 5) assert.equal(hold.camera.y, 1.7)
    if (beat === 4) assert.equal(await page.locator('.feature-label h2').innerText(), '', 'Beat 4 ends with no redundant feature caption')
    console.log(`PASS: Scene 2 beat ${beat} — ${hold.beatName} — stable manual hold`)
  }
  assert.equal(holds[5].details.visitors, 33)
  assert(holds[5].details.drawCalls < 240, 'Instanced visitors keep render calls bounded, including reflection and postprocessing')
  console.log('Crowd performance:', JSON.stringify({ fps: holds[5].details.fps, visitors: holds[5].details.visitors, drawCalls: holds[5].details.drawCalls }))

  await page.keyboard.press('ArrowRight')
  const environments = []
  for (const [time, mode] of [[1.5, 1], [3.3, 2], [5.1, 3]]) {
    await page.waitForFunction(time => window.__BEYOND_EXHIBIT__.snapshot().elapsed >= time, time)
    const state = await snapshot()
    assert(Math.abs(state.details.environment - mode) < .03, `Environment ${mode} becomes legible`)
    assert.deepEqual(state.camera, holds[5].camera, 'Reusable room keeps the same camera and architecture')
    environments.push(state.details.environment)
  }
  const reuse = await waitHold('scene02', 6)
  holds.push(reuse)
  assert.equal(reuse.details.environment, 0)
  assert.equal(reuse.details.hero, 1)
  await verifyHold(reuse, 2200)
  assert.equal(await page.locator('.reuse-title').evaluate(element => getComputedStyle(element).opacity), '1')
  console.log('PASS: ocean → space → microscopic → neutral morphs; camera stays fixed; reuse title holds')

  await page.keyboard.press('Space')
  const final = await waitHold('scene02', 7)
  holds.push(final)
  await page.keyboard.press('Shift+d')
  assert.match(await page.locator('.dev-overlay').innerText(), /Scene 2 \/ Beat 7/i)
  await page.keyboard.press('ArrowRight')
  await waitHold('scene03', 0)
  assert.equal(await page.locator('.s3-trace').count(), 1)
  await page.keyboard.press('ArrowLeft')
  await waitHold('scene02', 7)
  assert.equal((await snapshot()).sceneId, 'scene02')
  await page.keyboard.press('Shift+d')
  await page.keyboard.press('f')
  await page.waitForFunction(() => !!document.fullscreenElement)
  await page.keyboard.press('f')
  await page.waitForFunction(() => !document.fullscreenElement)
  for (const viewport of [{ width: 480, height: 850 }, { width: 1920, height: 1080 }, { width: 1280, height: 800 }]) {
    await page.setViewportSize(viewport)
    const rect = await page.locator('.stage').boundingBox()
    assert(Math.abs(rect.width / rect.height - 16 / 9) < .003)
    assert(rect.width <= viewport.width + 1 && rect.height <= viewport.height + 1)
    assert.deepEqual((await snapshot()).camera, final.camera)
  }
  console.log('PASS: Scene 2 → 3 → 2 continuity; F, D, Space and portrait / 1080p resizing')

  console.log('Checking a 30-second final hold…')
  await verifyHold(final, 30000)
  for (let beat = 6; beat >= 0; beat--) {
    await page.keyboard.press('ArrowLeft')
    const state = await waitHold('scene02', beat)
    assert.deepEqual(stableState(state), stableState(holds[beat]), `Left arrow reconstructs beat ${beat} exactly`)
  }
  const audio = await page.evaluate(() => window.__audioEvents)
  for (const name of ['projection_activate', 'surround_reveal', 'lighting_activate', 'hologram_reveal', 'visitors_reveal', 'environment_ocean', 'environment_space', 'environment_micro', 'reusable_room_reveal']) {
    assert(audio.some(cue => cue.name === name), `Audio hook ${name} fires without an asset`)
  }
  console.log('PASS: stationary 30-second final hold; every previous beat reconstructs its stable state; all reveal cues fire')

  await page.keyboard.press('ArrowLeft')
  await waitHold('scene01', 3)
  assert.equal(await page.evaluate(() => document.querySelector('canvas') === window.__originalCanvas), true)
  await page.keyboard.press('ArrowLeft')
  await waitHold('scene01', 2)
  assert.equal(await page.locator('.portal-hole').getAttribute('opacity'), '0')
  await page.keyboard.press('r')
  assert.equal((await snapshot()).beat, 0)
  assert.equal(await page.locator('.title-lockup').evaluate(element => getComputedStyle(element).opacity), '0')
  assert.equal(await page.locator('.room-layer').evaluate(element => getComputedStyle(element).opacity), '0')
  console.log('PASS: back across scenes preserves canvas; Scene 1 backward navigation and restart remain intact')

  await page.evaluate(() => window.__BEYOND_EXHIBIT__.seek(20))
  await page.keyboard.press('ArrowRight')
  await waitHold('scene02', 0)
  await page.evaluate(() => window.__BEYOND_EXHIBIT__.seekBeat(3))
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(600)
  await page.keyboard.press('r')
  const reset = await waitHold('scene02', 0)
  assert.equal(reset.details.hologram, 0)
  assert.equal(reset.details.sound, 0)
  assert.equal(reset.details.visitors, 1)
  assert.equal(reset.details.environment, 0)
  assert.equal(reset.details.hero, 0)
  assert.deepEqual(reset.camera, holds[0].camera)
  await verifyHold(reset, 1500)
  assert.equal(await page.locator('canvas').count(), 1)
  assert(audioRequests.every(url => /\/audio\/approved\//.test(url)), 'Audio requests stay inside the approved asset folder')
  assert.deepEqual(errors, [])
  console.log('PASS: R during reveal completely resets Scene 2; no audio fetches, duplicate canvases, or browser errors')
} finally { await browser.close() }
