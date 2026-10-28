import { gsap } from 'gsap'
import type { PresentationScene, SceneSnapshot, FoldDirection } from '../../presentation/PresentationScene'
import { AudioManager } from '../../audio/AudioManager'
import type { PrototypeHandoff } from '../scene04/handoff'
import type { VisionHandoff } from './handoff'
import type { ClosingHandoff } from '../scene06/handoff'
import { createRoomFeatures, type RoomFeatures } from '../scene02/features'
import { beatStates } from '../scene02/state'
import { createVisionWorlds, type VisionWorlds } from './worlds'
import { entryState, stableState } from './state'
import { beatCues, SCENE05_BEATS } from './cues'
import { createVisionTimeline, worldLabels } from './timeline'
import './scene05.css'

export class Scene05 implements PresentationScene {
  readonly id = 'scene05'
  readonly name = 'Imagine What This Room Could Become'
  readonly audio = new AudioManager()
  private root!: HTMLElement
  private handoff: VisionHandoff
  private features: RoomFeatures | null = null
  private worlds: VisionWorlds | null = null
  private state = entryState()
  private beat = 0
  private timeline: gsap.core.Timeline | null = null
  private transitioning = false
  private frame = 0
  private lastFrame = 0
  private fps = 0
  private frameCount = 0
  private frameTime = 0
  private ambientTime = 0
  private wasPlaying = false
  private queued: FoldDirection | null = null
  onSceneFold?: (direction: FoldDirection) => void
  private abort = new AbortController()

  constructor(handoff: VisionHandoff) { this.handoff = handoff; this.ambientTime = handoff.prototype.scrapbook.session.ambientTime }
  private get session() { return this.handoff.prototype.scrapbook.session }

  mount(container: HTMLElement) {
    this.root = document.createElement('div')
    this.root.className = 'scene05'
    this.root.innerHTML = `<div class="s5-room" aria-hidden="true"></div><div class="s5-shade"></div>
      <div class="s5-label"><h2></h2></div>
      <div class="s5-final"><p>ONE ROOM.</p><h1>ENDLESS PLACES TO GO.</h1></div>
      <div class="s5-paper"></div>`
    this.root.querySelector('.s5-paper')!.append(this.handoff.page)
    container.append(this.root)
    const room = this.session.room
    if (room) {
      if (this.session.canvas) this.root.querySelector('.s5-room')!.append(this.session.canvas)
      room.resetPresentation()
      this.features = createRoomFeatures(room)
      this.worlds = createVisionWorlds(room)
      // All shaders and meshes exist before a reveal begins.
      room.prewarm()
      room.render()
    } else {
      this.root.querySelector('.s5-room')!.innerHTML = '<div class="s5-fallback"><p>The live room is unavailable. Enable WebGL 2 and hardware acceleration to view the immersive environments.</p></div>'
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { this.wasPlaying = !!this.timeline?.isActive(); this.timeline?.pause() }
      else { this.lastFrame = 0; if (this.wasPlaying) { this.timeline?.resume(); this.wasPlaying = false } }
    }, { signal: this.abort.signal })
    this.applyState()
    this.frame = requestAnimationFrame(this.render)
  }
  play(atEnd = false) { if (atEnd) this.seekBeat(6); else this.animateBeat() }
  private setLabel = (label: string) => { this.root.querySelector('.s5-label h2')!.textContent = label }
  private animateBeat() {
    this.stopTimeline()
    this.transitioning = true
    this.timeline = createVisionTimeline(this.beat, this.state, this.root, this.audio, this.setLabel, () => {
      Object.assign(this.state, stableState(this.beat))
      this.transitioning = false
      this.applyState()
      this.settleQueued()
    })
    this.timeline.play(0)
  }
  private stopTimeline() {
    this.timeline?.kill(); this.timeline = null
    this.audio.reset(); this.wasPlaying = false
    this.session.room?.setPostEffects(0, 0)
  }
  nextBeat() {
    if (this.transitioning) { this.queued = 1; return true }
    return this.advance()
  }
  private advance(): boolean {
    if (this.beat === SCENE05_BEATS.length - 1) return false
    this.beat++
    this.animateBeat(); return true
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
    this.stopTimeline()
    this.queued = null
    this.beat = Math.max(0, Math.min(SCENE05_BEATS.length - 1, Math.trunc(beat)))
    Object.assign(this.state, stableState(this.beat))
    this.transitioning = false
    this.setLabel(worldLabels[this.beat])
    gsap.set(this.root.querySelector('.s5-label'), { opacity: this.beat > 0 && this.beat < 6 ? .9 : 0, y: 0 })
    gsap.set(this.root.querySelectorAll('.s5-final > *'), { opacity: this.beat === 6 ? 1 : 0, y: 0 })
    gsap.set(this.root.querySelectorAll('.s5-paper'), { display: 'none', opacity: 0 })
    this.applyState()
  }
  seek(seconds: number) {
    this.timeline?.pause().time(Math.max(0, Math.min(SCENE05_BEATS[this.beat].duration, seconds)), false)
    this.applyState()
  }
  restart() {
    this.stopTimeline()
    this.queued = null
    this.state = entryState(); this.beat = 0; this.ambientTime = 0; this.lastFrame = 0
    this.applyState(); this.animateBeat()
  }
  resize(width: number, height: number) { this.session.room?.resize(width, height); this.applyState() }
  private applyState() {
    const room = this.session.room
    if (!room) return
    const s = this.state
    room.camera.clearViewOffset()
    room.camera.position.set(s.cx, s.cy, s.cz)
    room.camera.lookAt(s.tx, s.ty, s.tz)
    if (room.camera.fov !== s.fov) { room.camera.fov = s.fov; room.camera.updateProjectionMatrix() }
    this.features?.update(this.ambientTime, { ...beatStates[7], ceiling: 0, sound: 0, hologram: s.hologram, hero: 0 })
    this.worlds?.update(this.ambientTime, s)
    room.setPostEffects(s.motionBlur, s.cameraFlash)
    room.updateAmbient(this.ambientTime, .15 * s.brightness, 1)
    room.render()
  }
  private render = (now: number) => {
    const delta = this.lastFrame ? Math.min((now - this.lastFrame) / 1000, .1) : 0
    this.lastFrame = now
    if (!document.hidden) {
      this.ambientTime += delta; this.frameCount++; this.frameTime += delta
      if (this.frameTime >= 1) { this.fps = this.frameCount / this.frameTime; this.frameTime = 0; this.frameCount = 0 }
      this.applyState()
    }
    this.frame = requestAnimationFrame(this.render)
  }
  snapshot(): SceneSnapshot {
    const elapsed = this.timeline?.time() ?? SCENE05_BEATS[this.beat].duration
    const upcoming = (beatCues[this.beat] ?? []).find(([, at]) => at > elapsed)
    return {
      sceneId: this.id, sceneName: this.name, beat: this.beat, totalBeats: SCENE05_BEATS.length,
      beatName: SCENE05_BEATS[this.beat].name, narration: SCENE05_BEATS[this.beat].narration,
      nextNarration: SCENE05_BEATS[this.beat + 1]?.narration, elapsed, duration: SCENE05_BEATS[this.beat].duration,
      holding: !this.transitioning, transitioning: this.transitioning,
      phase: this.transitioning ? 'transforming' : 'hold',
      camera: { x: this.state.cx, y: this.state.cy, z: this.state.cz },
      details: { fps: Math.round(this.fps), visitors: this.features?.visitorCount ?? 0,
        drawCalls: this.session.room?.stats().drawCalls ?? 0, geometries: this.session.room?.stats().geometries ?? 0,
        textures: this.session.room?.stats().textures ?? 0, pixelRatio: this.session.room?.stats().pixelRatio ?? 0,
        atom: this.state.atom, ocean: this.state.ocean, body: this.state.body, space: this.state.space, history: this.state.history,
        brightness: this.state.brightness, particles: this.state.particles, final: this.state.final,
        motionBlur: this.state.motionBlur, cameraFlash: this.state.cameraFlash,
        postMotionBlurDamp: this.session.room?.postEffects().temporalDamp ?? 0,
        postCameraFlashUniform: this.session.room?.postEffects().flashUniform ?? 0,
        timelineCount: this.timeline ? 1 : 0,
        upcomingCue: upcoming ? `${upcoming[0]} @ ${upcoming[1].toFixed(2)}s` : 'None / hold',
      },
    }
  }
  releaseForClosing(): ClosingHandoff {
    this.stopTimeline()
    const closing: ClosingHandoff = { vision: this.handoff, state: { ...this.state },
      features: this.features, worlds: this.worlds, ambientTime: this.ambientTime,
      outgoingTitle: this.root.querySelector('.s5-final')!.cloneNode(true) as HTMLElement,
      outgoingShade: this.root.querySelector('.s5-shade')!.cloneNode(true) as HTMLElement }
    this.features = null; this.worlds = null
    const prototype = this.handoff.prototype
    this.handoff = { ...this.handoff, prototype: { ...prototype, scrapbook: { ...prototype.scrapbook,
      session: { room: null, canvas: null, ambientTime: this.ambientTime } } } }
    return closing
  }
  releasePrototype(): PrototypeHandoff {
    this.stopTimeline()
    this.worlds?.dispose(); this.worlds = null
    this.features?.dispose(); this.features = null
    this.session.ambientTime = this.ambientTime
    const prototype = this.handoff.prototype
    this.handoff.prototype = { ...prototype, scrapbook: { ...prototype.scrapbook,
      session: { room: null, canvas: null, ambientTime: this.ambientTime } } }
    return prototype
  }
  dispose() {
    cancelAnimationFrame(this.frame); this.abort.abort(); this.stopTimeline()
    gsap.killTweensOf(this.root.querySelectorAll('*'))
    this.audio.dispose(); this.worlds?.dispose(); this.features?.dispose(); this.session.room?.dispose()
    this.root.remove()
  }
}
