import { gsap } from 'gsap'
import type { PresentationScene, SceneSnapshot, FoldDirection } from '../../presentation/PresentationScene'
import type { RoomSession } from '../../three/RoomSession'
import type { ImmersiveRoom } from '../scene01/room'
import { AudioManager } from '../../audio/AudioManager'
import { createRoomFeatures, type RoomFeatures } from './features'
import { beatStates, initialRoomState } from './state'
import { SCENE02_BEATS } from './cues'
import { createBeatTimeline, featureLabels } from './timeline'
import './scene02.css'
import { traceRoom, type ScrapbookHandoff } from '../scene03/transition'

export class Scene02 implements PresentationScene {
  readonly id = 'scene02'
  readonly name = 'What This Room Is'
  readonly audio = new AudioManager()
  private root!: HTMLElement
  private room: ImmersiveRoom | null
  private features: RoomFeatures | null = null
  private state = initialRoomState()
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
  private canvas: HTMLCanvasElement | null
  private queued: FoldDirection | null = null
  onSceneFold?: (direction: FoldDirection) => void

  constructor(session: RoomSession) { this.room = session.room; this.canvas = session.canvas; this.ambientTime = session.ambientTime }

  mount(container: HTMLElement) {
    this.root = document.createElement('div')
    this.root.className = 'scene02'
    this.root.innerHTML = `<div class="room-layer" aria-hidden="true"></div><div class="cinematic-vignette"></div>
      <div class="title-lockup"><h1>BEYOND THE EXHIBIT</h1></div>
      <div class="feature-label"><h2></h2><p></p></div>
      <div class="reuse-title"><p>ONE ROOM.</p><h2>UNLIMITED EXPERIENCES.</h2></div>`
    container.append(this.root)
    if (this.room) {
      if (this.canvas) this.root.querySelector('.room-layer')!.append(this.canvas)
      this.room.resetPresentation()
      this.features = createRoomFeatures(this.room)
    } else {
      this.root.querySelector('.room-layer')!.innerHTML = `<div class="webgl-message"><p>The immersive room requires a WebGL 2 compatible browser with hardware acceleration enabled.</p></div>`
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.wasPlaying = !!this.timeline?.isActive()
        this.timeline?.pause()
      } else if (this.wasPlaying) {
        this.lastFrame = 0; this.timeline?.resume(); this.wasPlaying = false
      }
    }, { signal: this.abort.signal })
    this.applyState()
    this.frame = requestAnimationFrame(this.render)
  }

  play(atEnd = false) {
    if (atEnd) this.seekBeat(7)
    else this.animateBeat()
  }

  private setLabel = (title: string, subtitle = '') => {
    this.root.querySelector('.feature-label h2')!.textContent = title
    this.root.querySelector('.feature-label p')!.textContent = subtitle
  }

  private animateBeat() {
    this.audio.reset()
    this.timeline?.kill()
    this.transitioning = true
    this.timeline = createBeatTimeline(this.beat, this.state, this.root, this.audio, this.setLabel, () => {
      Object.assign(this.state, beatStates[this.beat])
      this.transitioning = false
      this.applyState()
      this.settleQueued()
    })
    this.timeline.play(0)
  }

  nextBeat() {
    if (this.transitioning) { this.queued = 1; return true }
    return this.advance()
  }

  private advance(): boolean {
    if (this.beat === SCENE02_BEATS.length - 1) return false
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

  /** Also used by previousBeat: reconstruct a deterministic, stable end state. */
  seekBeat(beat: number) {
    this.timeline?.kill()
    this.timeline = null
    this.audio.reset()
    this.beat = Math.max(0, Math.min(7, Math.trunc(beat)))
    this.transitioning = false
    this.wasPlaying = false
    this.queued = null
    Object.assign(this.state, beatStates[this.beat])
    this.setLabel(featureLabels[this.beat][0], featureLabels[this.beat][1])
    gsap.set(this.root.querySelector('.feature-label'), { opacity: featureLabels[this.beat][0] ? .65 : 0, y: 0 })
    this.applyState()
  }

  seek(seconds: number) {
    this.timeline?.pause().time(Math.max(0, Math.min(SCENE02_BEATS[this.beat].duration, seconds)), false)
    this.applyState()
  }

  restart() {
    this.timeline?.kill()
    this.timeline = null
    this.audio.reset()
    this.state = initialRoomState()
    this.beat = 0
    this.lastFrame = 0
    this.wasPlaying = false
    this.queued = null
    this.applyState()
    this.animateBeat()
  }

  resize(width: number, height: number) { this.room?.resize(width, height); this.applyState() }

  private applyState() {
    const state = this.state
    this.root.querySelector<HTMLElement>('.title-lockup')!.style.opacity = String(state.entryTitle)
    this.root.querySelector<HTMLElement>('.reuse-title')!.style.opacity = String(state.hero)
    if (!this.room) return
    const camera = this.room.camera
    camera.clearViewOffset()
    camera.position.set(state.cx, state.cy, state.cz)
    camera.lookAt(state.tx, state.ty, state.tz)
    if (camera.fov !== state.fov) { camera.fov = state.fov; camera.updateProjectionMatrix() }
    this.features?.update(this.ambientTime, state)
    this.room.updateAmbient(this.ambientTime, Math.max(state.back, state.left), 1)
    this.room.render()
  }

  private render = (now: number) => {
    const delta = this.lastFrame ? Math.min((now - this.lastFrame) / 1000, .1) : 0
    this.lastFrame = now
    if (!document.hidden) {
      this.ambientTime += delta
      this.frameCount++
      this.frameTime += delta
      if (this.frameTime >= 1) { this.fps = this.frameCount / this.frameTime; this.frameTime = 0; this.frameCount = 0 }
      this.applyState()
    }
    this.frame = requestAnimationFrame(this.render)
  }

  snapshot(): SceneSnapshot {
    const duration = SCENE02_BEATS[this.beat].duration
    return {
      sceneId: this.id, sceneName: this.name, beat: this.beat, totalBeats: SCENE02_BEATS.length,
      beatName: SCENE02_BEATS[this.beat].name, transitioning: this.transitioning,
      narration: SCENE02_BEATS[this.beat].narration, nextNarration: SCENE02_BEATS[this.beat + 1]?.narration,
      elapsed: this.timeline?.time() ?? duration, duration,
      phase: this.transitioning ? 'revealing' : 'hold', holding: !this.transitioning,
      camera: { x: this.state.cx, y: this.state.cy, z: this.state.cz },
      details: { fps: Math.round(this.fps), visitors: this.state.visitors > .99 ? this.features?.visitorCount ?? 0 : 1,
        environment: this.state.environment, projection: this.state.back, sound: this.state.sound,
        lighting: this.state.lighting, hologram: this.state.hologram, hero: this.state.hero,
        fov: this.state.fov, targetX: this.state.tx, targetY: this.state.ty, targetZ: this.state.tz,
        drawCalls: this.room?.stats().drawCalls ?? 0, geometries: this.room?.stats().geometries ?? 0 },
    }
  }

  /** Future Scene 3 can use these actual camera/geometry references to trace ink. */
  scrapbookHandoff() {
    return { camera: this.room?.camera, architecture: this.room?.scene,
      visitorCount: this.features?.visitorCount ?? 0, state: { ...this.state } }
  }

  releaseForScrapbook(): ScrapbookHandoff {
    this.applyState()
    const frame = this.room?.captureFrame() ?? null
    const trace = traceRoom(this.room, this.features?.visitorPositions() ?? [])
    return { frame, trace, session: this.releaseRoom() }
  }

  releaseRoom(): RoomSession {
    this.features?.dispose()
    this.features = null
    const session = { room: this.room, canvas: this.canvas, ambientTime: this.ambientTime }
    this.room = null
    return session
  }

  dispose() {
    cancelAnimationFrame(this.frame)
    this.abort.abort()
    this.timeline?.kill()
    gsap.killTweensOf(this.root.querySelector('.feature-label'))
    this.audio.dispose()
    this.features?.dispose()
    this.room?.dispose()
    this.root.remove()
  }
}
