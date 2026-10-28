import type { PresentationScene } from './PresentationScene'
import { Scene01 } from '../scenes/scene01/Scene01'
import { Scene02 } from '../scenes/scene02/Scene02'
import { Scene03 } from '../scenes/scene03/Scene03'
import { Scene04 } from '../scenes/scene04/Scene04'
import { Scene05 } from '../scenes/scene05/Scene05'
import { Scene06 } from '../scenes/scene06/Scene06'
import { createSceneStart, releaseRoomForJump, SCENE_REGISTRY } from './sceneRegistry'
import { AudioManager, type MixChannel } from '../audio/AudioManager'

export class PresentationController {
  private scene: PresentationScene
  private root: HTMLElement
  private stage: HTMLElement
  private overlay: HTMLElement
  private observer: ResizeObserver
  private abort = new AbortController()
  private frame = 0
  private development = false
  private notice = ''
  private overlayVersion = ''
  private wakeLock: WakeLockSentinel | null = null

  constructor(app: HTMLElement, scene: PresentationScene) {
    this.scene = scene
    app.innerHTML = `<main class="presentation" aria-label="Beyond the Exhibit presentation">
      <section class="stage" aria-label="Scene 1: The Idea Begins"></section>
      <button class="audio-toggle" type="button" aria-expanded="false" aria-controls="audio-panel" hidden>Audio settings</button>
      <section class="audio-panel" id="audio-panel" aria-label="Audio settings" hidden>
        <div class="audio-panel-heading"><strong>Audio mix</strong><button class="audio-close" type="button" aria-label="Close audio settings">Ã—</button></div>
        <label class="speaker-setting"><input class="speaker-mode" type="checkbox" checked> Presenter mode</label>
        <label>Master <input data-mix="master" type="range" min="0" max="1" step="0.01" value="0.8"></label>
        <label>Music <input data-mix="music" type="range" min="0" max="1" step="0.01" value="0.2"></label>
        <label>Ambience <input data-mix="ambience" type="range" min="0" max="1" step="0.01" value="0.14"></label>
        <label>Effects <input data-mix="effects" type="range" min="0" max="1" step="0.01" value="0.42"></label>
        <label>Impacts <input data-mix="impact" type="range" min="0" max="1" step="0.01" value="0.48"></label>
        <span class="audio-status" aria-live="polite">Audio is enabled. Press D to close these settings.</span>
      </section>
      <aside class="dev-overlay" hidden aria-label="Development and narration timing"></aside>
    </main>`
    this.root = app.querySelector('.presentation')!
    this.stage = app.querySelector('.stage')!
    this.overlay = app.querySelector('.dev-overlay')!
    const audioButton = app.querySelector<HTMLButtonElement>('.audio-toggle')!
    const audioPanel = app.querySelector<HTMLElement>('.audio-panel')!
    const status = app.querySelector<HTMLElement>('.audio-status')!
    audioButton.addEventListener('click', () => {
      AudioManager.enable()
      const open = audioPanel.hidden
      audioPanel.hidden = !open
      audioButton.setAttribute('aria-expanded', String(open))
      audioButton.textContent = 'Audio settings'
      status.textContent = 'Audio unlocked Â· approved local files go in public/audio/approved.'
    }, { signal: this.abort.signal })
    app.querySelector('.audio-close')!.addEventListener('click', () => {
      audioPanel.hidden = true; audioButton.setAttribute('aria-expanded', 'false')
    }, { signal: this.abort.signal })
    app.querySelectorAll<HTMLInputElement>('[data-mix]').forEach(input => input.addEventListener('input', () => {
      AudioManager.setMix(input.dataset.mix as MixChannel, Number(input.value))
    }, { signal: this.abort.signal }))
    app.querySelector<HTMLInputElement>('.speaker-mode')!.addEventListener('change', event => {
      const enabled = (event.currentTarget as HTMLInputElement).checked
      AudioManager.setSpeakerMode(enabled)
      status.textContent = enabled ? 'Presenter mode keeps the music restrained.' : 'Full music mix selected.'
    }, { signal: this.abort.signal })
    scene.mount(this.stage)
    this.observer = new ResizeObserver(([entry]) => {
      if (entry) this.scene.resize(entry.contentRect.width, entry.contentRect.height)
    })
    this.observer.observe(this.stage)
    const options = { signal: this.abort.signal }
    window.addEventListener('keydown', this.onKey, options)
    // Start immediately; a first pointer interaction retries playback where a
    // browser requires a user gesture for unmuted media.
    AudioManager.enable()
    window.addEventListener('pointerdown', () => AudioManager.enable(), { once: true, signal: this.abort.signal })
    window.addEventListener('hashchange', this.openHash, options)
    document.addEventListener('visibilitychange', () => AudioManager.setVisible(!document.hidden), options)
    if (import.meta.env.DEV) {
      const controller = this
      Object.defineProperty(window, '__BEYOND_EXHIBIT__', {
        configurable: true,
        value: {
          snapshot: () => controller.scene.snapshot(),
          get audio() { return controller.scene.audio },
          seek: (seconds: number) => {
            controller.scene.seek?.(seconds)
          },
          seekBeat: (beat: number) => { controller.scene.seekBeat?.(beat) },
          handoff: () => controller.scene instanceof Scene02 ? controller.scene.scrapbookHandoff().state : controller.scene instanceof Scene04 ? controller.scene.visionHandoff().roomViewport : null,
        },
      })
    }
  }

  start() {
    AudioManager.setScene(this.scene.id); AudioManager.enable(); this.scene.play(); this.openHash(); this.update()
    this.acquireWakeLock()
  }

  /**
   * Keep the display awake while the exhibit is showing so the screen
   * does not go to sleep mid-presentation. Uses the Wake Lock API when
   * available and degrades gracefully (no-op) elsewhere.
   */
  private acquireWakeLock = async () => {
    if ('wakeLock' in navigator === false) return
    try {
      this.wakeLock = await navigator.wakeLock.request('screen')
      this.wakeLock.addEventListener('release', () => { this.wakeLock = null })
    } catch {
      this.wakeLock = null
    }
    // The UA may drop the lock when the tab is hidden (e.g. display off or
    // window switched). Re-acquire as soon as the tab is visible again.
    document.addEventListener('visibilitychange', this.reacquireWakeLock, { passive: true })
  }

  private reacquireWakeLock = () => {
    if (document.visibilityState !== 'visible' || this.wakeLock) return
    this.acquireWakeLock()
  }

  private releaseWakeLock = () => {
    document.removeEventListener('visibilitychange', this.reacquireWakeLock)
    this.wakeLock?.release().catch(() => {})
    this.wakeLock = null
  }

  private openHash = () => {
    const params = new URLSearchParams(location.hash.slice(1))
    const number = Number(params.get('scene'))
    if (!SCENE_REGISTRY.has(number)) return
    this.jumpToScene(number)
    const beat = Number(params.get('beat'))
    if (Number.isInteger(beat) && beat > 0 && beat < this.scene.snapshot().totalBeats) this.scene.seekBeat?.(beat)
  }

  private jumpToScene(number: number) {
    if (!SCENE_REGISTRY.has(number)) {
      if (this.development) { this.notice = `Scene ${number} not implemented`; this.overlayVersion = '' }
      return
    }
    const session = releaseRoomForJump(this.scene)
    this.scene.dispose()
    const next = createSceneStart(number, session, this.stage)
    this.mountScene(next)
  }

  private changeScene(next: PresentationScene, atEnd = false) {
    this.scene.dispose()
    this.mountScene(next, atEnd)
  }

  private mountScene(next: PresentationScene, atEnd = false) {
    this.scene = next
    AudioManager.setScene(next.id)
    // Let the scene request a boundary scene change after it finishes a queued
    // advance/rewind on its first/last beat from a single presenter action.
    next.onSceneFold = direction => {
      if (this.scene !== next) return
      if (direction === 1) this.next()
      else this.previous()
    }
    next.mount(this.stage)
    const { width, height } = this.stage.getBoundingClientRect()
    next.resize(width, height)
    next.play(atEnd)
    this.stage.setAttribute('aria-label', `Scene ${Number(next.id.replace('scene', ''))}: ${next.name}`)
    this.notice = ''
    this.overlayVersion = ''
  }

  private next() {
    if (this.scene.nextBeat()) { this.notice = ''; return }
    if (this.scene instanceof Scene01) {
      const session = this.scene.releaseRoom()
      this.stage.dispatchEvent(new CustomEvent('scene-exit-request', { bubbles: true, detail: { from: 'scene01', to: 'scene02' } }))
      this.changeScene(new Scene02(session))
    } else if (this.scene instanceof Scene02) {
      const handoff = this.scene.releaseForScrapbook()
      this.stage.dispatchEvent(new CustomEvent('scene-exit-request', { bubbles: true, detail: { from: 'scene02', to: 'scene03' } }))
      this.changeScene(new Scene03(handoff))
    } else if (this.scene instanceof Scene03) {
      const handoff = this.scene.releaseForPrototype()
      this.stage.dispatchEvent(new CustomEvent('scene-exit-request', { bubbles: true, detail: { from: 'scene03', to: 'scene04' } }))
      this.changeScene(new Scene04(handoff))
    } else if (this.scene instanceof Scene04) {
      const handoff = this.scene.releaseForVision()
      this.stage.dispatchEvent(new CustomEvent('scene-exit-request', { bubbles: true, detail: { from: 'scene04', to: 'scene05' } }))
      this.changeScene(new Scene05(handoff))
    } else if (this.scene instanceof Scene05) {
      const handoff = this.scene.releaseForClosing()
      this.stage.dispatchEvent(new CustomEvent('scene-exit-request', { bubbles: true, detail: { from: 'scene05', to: 'scene06' } }))
      this.changeScene(new Scene06(handoff))
    }
  }

  private previous() {
    if (this.scene.previousBeat()) { this.notice = ''; return }
    if (this.scene instanceof Scene02) {
      const session = this.scene.releaseRoom()
      this.changeScene(new Scene01(session), true)
    } else if (this.scene instanceof Scene03) {
      const session = this.scene.releaseRoom()
      this.changeScene(new Scene02(session), true)
    } else if (this.scene instanceof Scene04) {
      const handoff = this.scene.releaseScrapbook()
      this.changeScene(new Scene03(handoff), true)
    } else if (this.scene instanceof Scene05) {
      const handoff = this.scene.releasePrototype()
      this.changeScene(new Scene04(handoff), true)
    } else if (this.scene instanceof Scene06) {
      const handoff = this.scene.releaseVision()
      this.changeScene(new Scene05(handoff), true)
    }
  }

  private update = () => {
    const state = this.scene.snapshot()
    this.stage.dataset.scene = state.sceneId
    this.stage.dataset.beat = String(state.beat)
    this.stage.dataset.phase = state.phase
    this.stage.dataset.holding = String(state.holding)
    this.stage.dataset.transitioning = String(state.transitioning)
    const hash = `#scene=${Number(state.sceneId.replace('scene', ''))}&beat=${state.beat}`
    if (location.hash !== hash) history.replaceState(null, '', hash)
    if (this.development) this.updateOverlay()
    this.frame = requestAnimationFrame(this.update)
  }

  private updateOverlay() {
    if (!this.development) return
    const state = this.scene.snapshot()
    const version = `${state.sceneId}:${state.beat}:${state.elapsed.toFixed(1)}:${state.transitioning}:${this.notice}:${state.details?.fps ?? ''}`
    if (version === this.overlayVersion) return
    this.overlayVersion = version
    this.overlay.innerHTML = `<h2>Scene ${Number(state.sceneId.replace('scene', ''))} / Beat ${state.beat} Â· ${state.totalBeats} beats</h2>
      <div class="dev-position">Scene ${Number(state.sceneId.replace('scene', ''))} / ${SCENE_REGISTRY.size} scenes Â· Beat ${state.beat} / ${state.totalBeats} beats (from 0)</div>
      <div class="dev-scene-title">${state.sceneName}</div>
      <div class="dev-beat-name">${state.beatName}</div>
      <div class="dev-time">${state.elapsed.toFixed(1)}s <span style="opacity:.35">/ ${state.duration.toFixed(1)}s</span> Â· ${state.transitioning ? 'ANIMATING' : 'HOLD Â· manual advance'}</div>
      <p><strong>NOW</strong> ${state.narration ?? 'â€”'}</p>
      <p><strong>NEXT</strong> ${state.nextNarration ?? (state.sceneId === 'scene01' ? 'Scene 2 Â· What This Room Is' : state.sceneId === 'scene02' ? 'Scene 3 Â· Why This Matters' : state.sceneId === 'scene03' ? 'Scene 4 Â· From Idea to Prototype' : state.sceneId === 'scene04' ? 'Scene 5 Â· Imagine What This Room Could Become' : state.sceneId === 'scene05' ? 'Scene 6 Â· The Ask' : 'Final hold')}</p>
      ${state.sceneId === 'scene05' ? `<p>Current: ${state.beatName}<br>Cue: ${state.details?.upcomingCue}</p>` : ''}
      ${state.details?.fps !== undefined ? `<p class="dev-performance">${state.details.fps} fps Â· ${state.details.visitors} visitors Â· ${state.details.drawCalls} draw calls</p>` : state.details?.webglIdle ? '<p class="dev-performance">SVG / paper Â· WebGL idle</p>' : ''}
      <p class="dev-controls">1â€“9 jump to scene<br>â† / â†“ / PgUp previous beat Â· â†’ / â†‘ / SPACE / PgDn / ENTER next beat<br>R restart scene Â· F fullscreen Â· D debug overlay</p>
      <div class="dev-notice">${this.notice}</div>`
  }

  private restart() { this.notice = ''; this.scene.restart(); this.overlayVersion = '' }
  private toggleDevelopment() {
    this.development = !this.development
    this.overlay.hidden = !this.development
    this.overlayVersion = ''
    this.updateOverlay()
  }
  private toggleAudioSettings() {
    const panel = this.root.querySelector<HTMLElement>('.audio-panel')!
    panel.hidden = !panel.hidden
  }
  private async fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await this.root.requestFullscreen()
    } catch { this.notice = 'Fullscreen unavailable in this browser context'; this.overlayVersion = '' }
  }
  private onKey = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return
    const target = event.target instanceof Element ? event.target : document.body
    if ((target as HTMLElement).isContentEditable || target.closest<HTMLElement>('[contenteditable]')?.isContentEditable || target.closest('input,textarea,select')) return
    AudioManager.enable()
    if (!event.shiftKey && /^[1-9]$/.test(event.key) && /^(Digit|Numpad)[1-9]$/.test(event.code)) {
      event.preventDefault(); this.jumpToScene(Number(event.key)); return
    }
    // Space/Enter on a button should activate the button, not advance the slide.
    if ((event.code === 'Space' || event.code === 'Enter') && target.closest('button')) return
    switch (event.code) {
      case 'KeyR': event.preventDefault(); this.restart(); break
      case 'ArrowLeft': case 'ArrowDown': case 'PageUp': event.preventDefault(); this.previous(); break
      case 'ArrowRight': case 'ArrowUp': case 'Space': case 'PageDown': case 'Enter': event.preventDefault(); this.next(); break
      case 'KeyF': event.preventDefault(); void this.fullscreen(); break
      case 'KeyD':
        event.preventDefault()
        if (event.shiftKey) this.toggleDevelopment()
        else this.toggleAudioSettings()
        break
    }
  }

  dispose() {
    cancelAnimationFrame(this.frame)
    this.abort.abort()
    this.observer.disconnect()
    this.scene.dispose()
    AudioManager.shutdown()
    this.releaseWakeLock()
    if (import.meta.env.DEV) Reflect.deleteProperty(window, '__BEYOND_EXHIBIT__')
    if (document.fullscreenElement === this.root) void document.exitFullscreen().catch(() => {})
    this.root.remove()
  }
}
