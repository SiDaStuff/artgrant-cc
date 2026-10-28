import { gsap } from 'gsap'
import { Color } from 'three'
import type { PresentationScene, SceneSnapshot, FoldDirection } from '../../presentation/PresentationScene'
import { AudioManager } from '../../audio/AudioManager'
import type { VisionHandoff } from '../scene05/handoff'
import type { ClosingHandoff } from './handoff'
import { beatStates } from '../scene02/state'
import { closingEntry, closingStates, type ClosingState } from './state'
import { SCENE06_BEATS } from './cues'
import { closingMarkup } from './layout'
import { closingLayout, closingTimeline } from './timeline'
import { createHeroDetails, type HeroDetails } from './heroDetails'
import './scene06.css'

export class Scene06 implements PresentationScene {
  readonly id = 'scene06'
  readonly name = 'The Ask'
  readonly audio = new AudioManager()
  private root!: HTMLElement
  private handoff: ClosingHandoff
  private state: ClosingState
  private beat = 0
  private timeline: gsap.core.Timeline | null = null
  private transitioning = false
  private frame = 0
  private lastFrame = 0
  private ambientTime: number
  private fps = 0
  private frameCount = 0
  private frameTime = 0
  private wasPlaying = false
  private abort = new AbortController()
  private warm = new Color('#c9bf9e')
  private details: HeroDetails | null = null
  private queued: FoldDirection | null = null
  onSceneFold?: (direction: FoldDirection) => void

  constructor(handoff: ClosingHandoff) {
    this.handoff = handoff
    this.ambientTime = handoff.ambientTime
    this.state = { ...handoff.state, shade: 0, warmth: 0, detail: 0, focus: 0, pathway: 0 }
  }
  private get session() { return this.handoff.vision.prototype.scrapbook.session }
  mount(container: HTMLElement) {
    this.root = document.createElement('div'); this.root.className = 'scene06'
    this.root.innerHTML = closingMarkup()
    this.root.querySelector('.s6-outgoing')!.append(this.handoff.outgoingShade, this.handoff.outgoingTitle)
    container.append(this.root)
    if (this.session.canvas) this.root.querySelector('.s6-room')!.append(this.session.canvas)
    if (!this.session.room) this.root.querySelector('.s6-room')!.innerHTML = '<div class="s6-fallback">The live room is unavailable. Enable WebGL 2 and hardware acceleration for the room backdrop.</div>'
    else { this.details = createHeroDetails(this.session.room, this.handoff.features?.visitorPositions()); this.session.room.prewarm() }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { this.wasPlaying = !!this.timeline?.isActive(); this.timeline?.pause() }
      else { this.lastFrame = 0; if (this.wasPlaying) { this.timeline?.resume(); this.wasPlaying = false } }
    }, { signal: this.abort.signal })
    this.applyState()
    this.frame = requestAnimationFrame(this.render)
  }
  play(atEnd = false) { if (atEnd) this.seekBeat(5); else this.animateBeat() }
  private stopTimeline() { this.timeline?.kill(); this.timeline = null; this.audio.reset(); this.wasPlaying = false }
  private animateBeat() {
    this.stopTimeline(); this.transitioning = true
    this.timeline = closingTimeline(this.root, this.beat, this.state, this.audio, () => {
      Object.assign(this.state, closingStates[this.beat]); closingLayout(this.root, this.beat)
      this.transitioning = false; this.applyState(); this.settleQueued()
    })
    this.timeline.play(0)
  }
  nextBeat() {
    if (this.transitioning) { this.queued = 1; return true }
    return this.advance()
  }
  private advance(): boolean {
    if (this.beat === 5) return false
    this.beat++; this.animateBeat(); return true
  }
  previousBeat() {
    if (this.transitioning) { this.queued = -1; return true }
    return this.rewind()
  }
  private rewind(): boolean {
    if (this.beat === 0) return false
    this.seekBeat(this.beat - 1); return true
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
    this.stopTimeline(); this.queued = null; this.beat = Math.max(0, Math.min(5, Math.trunc(beat)))
    Object.assign(this.state, closingStates[this.beat]); this.transitioning = false
    closingLayout(this.root, this.beat); this.applyState()
  }
  seek(seconds: number) { this.timeline?.pause().time(Math.max(0, Math.min(SCENE06_BEATS[this.beat].duration, seconds)), false); this.applyState() }
  restart() {
    this.stopTimeline(); this.queued = null; this.state = closingEntry(); this.beat = 0
    this.ambientTime = 0; this.lastFrame = 0; this.applyState(); this.animateBeat()
  }
  resize(width: number, height: number) { this.session.room?.resize(width, height); this.applyState() }
  private applyState() {
    this.root.querySelector<HTMLElement>('.s6-shade')!.style.opacity = String(this.state.shade)
    const room = this.session.room
    if (!room) return
    const s = this.state
    room.camera.clearViewOffset(); room.camera.position.set(s.cx, s.cy, s.cz); room.camera.lookAt(s.tx, s.ty, s.tz)
    if (room.camera.fov !== s.fov) { room.camera.fov = s.fov; room.camera.updateProjectionMatrix() }
    this.handoff.features?.update(this.ambientTime, { ...beatStates[7], ceiling: 0, sound: 0, hologram: 0, hero: 0, visitors: 1 - s.detail })
    this.handoff.worlds?.update(this.ambientTime, s)
    this.handoff.worlds?.refine(s.detail, s.focus)
    this.details?.update(this.ambientTime, s)
    room.accents.backlight.color.lerp(this.warm, s.warmth * .38)
    room.accents.warm.color.lerp(this.warm, s.warmth * .22)
    room.updateAmbient(this.ambientTime, .08, 1 - s.detail)
    room.camera.updateMatrixWorld()
    this.root.querySelector<SVGElement>('.s6-world-path')!.style.opacity = String(s.pathway * s.detail)
    this.details?.anchors().forEach((anchor, index) => {
      const x = Math.max(90, Math.min(1510, anchor.x)), y = Math.max(300, Math.min(850, anchor.y))
      const startX = [185, 465, 815, 1190][index]
      this.root.querySelectorAll('.s6-world-path polyline')[index].setAttribute('points', `${startX},235 ${startX},265 ${x},${y}`)
      const marker = this.root.querySelectorAll('.s6-world-path circle')[index]
      marker.setAttribute('cx', String(x)); marker.setAttribute('cy', String(y))
    })
    room.render()
  }
  private render = (now: number) => {
    const delta = this.lastFrame ? Math.min((now - this.lastFrame) / 1000, .1) : 0
    this.lastFrame = now
    if (!document.hidden) {
      this.ambientTime += delta; this.frameCount++; this.frameTime += delta
      if (this.frameTime >= 1) { this.fps = this.frameCount / this.frameTime; this.frameCount = 0; this.frameTime = 0 }
      this.applyState()
    }
    this.frame = requestAnimationFrame(this.render)
  }
  snapshot(): SceneSnapshot {
    return { sceneId: this.id, sceneName: this.name, beat: this.beat, totalBeats: 6,
      beatName: SCENE06_BEATS[this.beat].name, narration: SCENE06_BEATS[this.beat].narration,
      nextNarration: SCENE06_BEATS[this.beat + 1]?.narration,
      elapsed: this.timeline?.time() ?? SCENE06_BEATS[this.beat].duration, duration: SCENE06_BEATS[this.beat].duration,
      transitioning: this.transitioning, holding: !this.transitioning, phase: this.transitioning ? 'settling' : 'hold',
      camera: { x: this.state.cx, y: this.state.cy, z: this.state.cz },
      details: { fps: Math.round(this.fps), visitors: this.state.detail > .99 ? this.details?.visitorCount ?? 0 : this.handoff.features?.visitorCount ?? 0,
        drawCalls: this.session.room?.stats().drawCalls ?? 0, geometries: this.session.room?.stats().geometries ?? 0,
        textures: this.session.room?.stats().textures ?? 0,
        postMotionBlurDamp: this.session.room?.postEffects().temporalDamp ?? 0,
        postCameraFlashUniform: this.session.room?.postEffects().flashUniform ?? 0,
        atom: this.state.atom, ocean: this.state.ocean, body: this.state.body, space: this.state.space, history: this.state.history,
        brightness: this.state.brightness, particles: this.state.particles, grant: 10000, fullRoomFunded: false,
        heroDetail: this.state.detail, heroFocus: this.state.focus, heroPath: this.state.pathway,
        detailLayers: this.details ? 1 : 0 },
    }
  }
  releaseVision(): VisionHandoff {
    this.stopTimeline(); this.details?.dispose(); this.details = null
    this.handoff.worlds?.dispose(); this.handoff.features?.dispose()
    this.handoff.worlds = null; this.handoff.features = null
    this.session.ambientTime = this.ambientTime
    const vision = this.handoff.vision
    this.handoff.vision = { ...vision, prototype: { ...vision.prototype, scrapbook: { ...vision.prototype.scrapbook,
      session: { room: null, canvas: null, ambientTime: this.ambientTime } } } }
    return vision
  }
  dispose() {
    cancelAnimationFrame(this.frame); this.abort.abort(); this.stopTimeline()
    gsap.killTweensOf(this.root.querySelectorAll('*'))
    this.audio.dispose(); this.details?.dispose(); this.handoff.worlds?.dispose(); this.handoff.features?.dispose()
    this.session.room?.dispose(); this.root.remove()
  }
}
