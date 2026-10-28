import { gsap } from 'gsap'
import type { PresentationScene, SceneSnapshot, FoldDirection } from '../../presentation/PresentationScene'
import type { ScrapbookHandoff } from '../scene03/transition'
import { AudioManager } from '../../audio/AudioManager'
import type { PrototypeHandoff } from './handoff'
import type { VisionHandoff } from '../scene05/handoff'
import { createScene04Scrapbook } from './scrapbook'
import { SCENE04_BEATS } from './cues'
import { applyScene04Layout, createScene04Timeline } from './timeline'
import './scene04.css'

export class Scene04 implements PresentationScene {
  readonly id = 'scene04'
  readonly name = 'From Idea to Prototype'
  readonly audio = new AudioManager()
  private root!: HTMLElement
  private handoff: PrototypeHandoff
  private beat = 0
  private transitioning = false
  private timeline: gsap.core.Timeline | null = null
  private wasPlaying = false
  private abort = new AbortController()
  private queued: FoldDirection | null = null
  onSceneFold?: (direction: FoldDirection) => void

  constructor(handoff: PrototypeHandoff) { this.handoff = handoff }

  mount(container: HTMLElement) {
    this.root = document.createElement('div')
    this.root.className = 'scene04'
    this.root.append(createScene04Scrapbook(this.handoff.scrapbook.frame))
    const outgoing = document.createElement('div')
    outgoing.className = 's4-outgoing'
    outgoing.append(this.handoff.previousPage)
    this.root.append(outgoing)
    container.append(this.root)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { this.wasPlaying = !!this.timeline?.isActive(); this.timeline?.pause() }
      else if (this.wasPlaying) { this.timeline?.resume(); this.wasPlaying = false }
    }, { signal: this.abort.signal })
  }

  play(atEnd = false) { if (atEnd) this.seekBeat(7); else this.animateBeat() }
  private animateBeat() {
    this.timeline?.kill()
    this.audio.reset()
    this.transitioning = true
    this.timeline = createScene04Timeline(this.root, this.beat, this.audio, () => {
      applyScene04Layout(this.root, this.beat)
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
    if (this.beat === SCENE04_BEATS.length - 1) return false
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
    applyScene04Layout(this.root, this.beat)
  }

  seek(seconds: number) { this.timeline?.pause().time(Math.max(0, Math.min(SCENE04_BEATS[this.beat].duration, seconds)), false) }
  restart() { this.beat = 0; this.wasPlaying = false; this.queued = null; this.animateBeat() }
  resize(width: number, height: number) { this.handoff.scrapbook.session.room?.resize(width, height) }

  releaseScrapbook(): ScrapbookHandoff {
    const scrapbook = this.handoff.scrapbook
    this.handoff.scrapbook = { ...scrapbook, session: { room: null, canvas: null, ambientTime: scrapbook.session.ambientTime } }
    return scrapbook
  }

  /** Geometry-independent viewport for the manual push into Scene 5. */
  visionHandoff() {
    return { roomFrame: this.handoff.scrapbook.frame,
      roomViewport: { x: 1100 / 1600, y: 437 / 900, width: 370 / 1600, height: 240 / 900 },
      fullRoomIsFutureGoal: true }
  }

  releaseForVision(): VisionHandoff {
    const prototype = { ...this.handoff, scrapbook: this.releaseScrapbook() }
    return { prototype, page: this.root.querySelector('.s4-notebook')!.cloneNode(true) as HTMLElement,
      roomFrame: prototype.scrapbook.frame }
  }

  snapshot(): SceneSnapshot {
    return {
      sceneId: this.id, sceneName: this.name, beat: this.beat, totalBeats: SCENE04_BEATS.length,
      beatName: SCENE04_BEATS[this.beat].name, transitioning: this.transitioning,
      narration: SCENE04_BEATS[this.beat].narration, nextNarration: SCENE04_BEATS[this.beat + 1]?.narration,
      elapsed: this.timeline?.time() ?? SCENE04_BEATS[this.beat].duration,
      duration: SCENE04_BEATS[this.beat].duration, holding: !this.transitioning,
      phase: this.transitioning ? 'drawing' : 'hold', camera: null,
      details: { medium: 'SVG / prototype plan', webglIdle: true, grant: 10000, grantFunds: 'professional prototype', fullRoomFunded: false },
    }
  }

  dispose() {
    this.abort.abort()
    this.timeline?.kill()
    gsap.killTweensOf(this.root.querySelectorAll('*'))
    this.audio.dispose()
    this.handoff.scrapbook.session.room?.dispose()
    this.handoff.scrapbook.frame = null
    this.root.remove()
  }
}
