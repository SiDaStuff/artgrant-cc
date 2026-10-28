import { gsap } from 'gsap'
import type { PresentationScene, SceneSnapshot, FoldDirection } from '../../presentation/PresentationScene'
import type { RoomSession } from '../../three/RoomSession'
import { AudioManager } from '../../audio/AudioManager'
import { createScene03Scrapbook } from './scrapbook'
import type { ScrapbookHandoff } from './transition'
import { SCENE03_BEATS } from './cues'
import { applyBeatLayout, createScene03Timeline } from './timeline'
import './scene03.css'
import type { PrototypeHandoff } from '../scene04/handoff'

export class Scene03 implements PresentationScene {
  readonly id = 'scene03'
  readonly name = 'Why This Matters'
  readonly audio = new AudioManager()
  private root!: HTMLElement
  private handoff: ScrapbookHandoff
  private beat = 0
  private transitioning = false
  private timeline: gsap.core.Timeline | null = null
  private abort = new AbortController()
  private wasPlaying = false
  private queued: FoldDirection | null = null
  onSceneFold?: (direction: FoldDirection) => void

  constructor(handoff: ScrapbookHandoff) { this.handoff = handoff }

  mount(container: HTMLElement) {
    this.root = document.createElement('div')
    this.root.className = 'scene03'
    this.root.append(createScene03Scrapbook(this.handoff.trace))
    const capture = document.createElement('div')
    capture.className = 's3-capture'
    if (this.handoff.frame) {
      const image = document.createElement('img')
      image.src = this.handoff.frame
      image.alt = ''
      capture.append(image)
    }
    capture.insertAdjacentHTML('beforeend', `<div class="reuse-title"><p>ONE ROOM.</p><h2>UNLIMITED EXPERIENCES.</h2></div>`)
    this.root.append(capture)
    container.append(this.root)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { this.wasPlaying = !!this.timeline?.isActive(); this.timeline?.pause() }
      else if (this.wasPlaying) { this.timeline?.resume(); this.wasPlaying = false }
    }, { signal: this.abort.signal })
  }

  play(atEnd = false) { if (atEnd) this.seekBeat(7); else this.animateBeat() }

  private animateBeat() {
    this.audio.reset()
    this.timeline?.kill()
    this.transitioning = true
    this.timeline = createScene03Timeline(this.root, this.beat, this.audio, () => {
      applyBeatLayout(this.root, this.beat)
      this.transitioning = false
      this.settleQueued()
    })
    this.timeline.play(0)
  }

  nextBeat() {
    if (this.transitioning) { this.queued = 1; return true }
    return this.advance()
  }

  private advance(): boolean {
    if (this.beat === SCENE03_BEATS.length - 1) return false
    this.beat++
    this.animateBeat()
    return true
  }

  previousBeat() {
    if (this.transitioning) { this.queued = -1; return true }
    return this.rewind()
  }

  private rewind(): boolean {
    if (this.beat === 0) return false
    this.seekBeat(this.beat - 1)
    return true
  }

  /** Resolve a queued advance/rewind after the current reveal reaches its stable end. */
  private settleQueued() {
    const q = this.queued
    if (q == null) return
    this.queued = null
    if (q === 1) { if (!this.advance()) queueMicrotask(() => this.onSceneFold?.(1)) }
    else if (!this.rewind()) queueMicrotask(() => this.onSceneFold?.(-1))
  }

  seekBeat(beat: number) {
    this.timeline?.kill()
    this.timeline = null
    this.audio.reset()
    this.beat = Math.max(0, Math.min(7, Math.trunc(beat)))
    this.transitioning = false
    this.wasPlaying = false
    this.queued = null
    applyBeatLayout(this.root, this.beat)
  }

  seek(seconds: number) { this.timeline?.pause().time(Math.max(0, Math.min(SCENE03_BEATS[this.beat].duration, seconds)), false) }
  restart() { this.beat = 0; this.wasPlaying = false; this.queued = null; this.animateBeat() }
  resize(width: number, height: number) {
    // SVG stays in a fixed 16:9 viewBox. The retained WebGL room is idle.
    this.handoff.session.room?.resize(width, height)
  }

  releaseRoom(): RoomSession {
    const session = this.handoff.session
    this.handoff.session = { room: null, canvas: null, ambientTime: session.ambientTime }
    return session
  }

  releaseForPrototype(): PrototypeHandoff {
    return {
      previousPage: this.root.querySelector<HTMLElement>('.s3-notebook')!.cloneNode(true) as HTMLElement,
      scrapbook: { session: this.releaseRoom(), frame: this.handoff.frame, trace: this.handoff.trace },
    }
  }

  snapshot(): SceneSnapshot {
    return {
      sceneId: this.id, sceneName: this.name, beat: this.beat, totalBeats: SCENE03_BEATS.length,
      beatName: SCENE03_BEATS[this.beat].name, transitioning: this.transitioning,
      narration: SCENE03_BEATS[this.beat].narration,
      nextNarration: SCENE03_BEATS[this.beat + 1]?.narration,
      elapsed: this.timeline?.time() ?? SCENE03_BEATS[this.beat].duration,
      duration: SCENE03_BEATS[this.beat].duration, holding: !this.transitioning,
      phase: this.transitioning ? 'drawing' : 'hold', camera: null,
      details: { medium: 'SVG / paper', webglIdle: true },
    }
  }

  dispose() {
    this.abort.abort()
    this.timeline?.kill()
    gsap.killTweensOf(this.root.querySelectorAll('*'))
    this.audio.dispose()
    this.handoff.session.room?.dispose()
    this.handoff.frame = null
    this.root.remove()
  }
}
