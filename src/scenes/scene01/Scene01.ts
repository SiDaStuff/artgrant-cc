import { gsap } from 'gsap'
import type { PresentationScene, SceneSnapshot, FoldDirection } from '../../presentation/PresentationScene'
import { AudioManager } from '../../audio/AudioManager'
import { createScrapbook } from './scrapbook'
import { createRoom, type ImmersiveRoom } from './room'
import { createTimeline, initialState, TIMING } from './timeline'
import './scene01.css'
import type { RoomSession } from '../../three/RoomSession'
import { narrationCues } from './cues'

const BEATS = [
  { end: 3.1, name: 'The traditional exhibit' },
  { end: 7.1, name: 'An idea takes shape' },
  { end: 12, name: 'Step inside the idea' },
  { end: 20, name: 'Beyond the Exhibit' },
] as const

export class Scene01 implements PresentationScene {
  readonly id = 'scene01'
  readonly name = 'The Idea Begins'
  readonly audio = new AudioManager()
  private root!: HTMLElement
  private room: ImmersiveRoom | null = null
  private timeline!: gsap.core.Timeline
  private context!: gsap.Context
  private state = initialState()
  private ambientTime = 0
  private frame = 0
  private lastFrame = 0
  private abort = new AbortController()
  private beat = 0
  private transition: gsap.core.Tween | null = null
  private wasPlaying = false
  private queued: FoldDirection | null = null
  onSceneFold?: (direction: FoldDirection) => void

  private session?: RoomSession
  constructor(session?: RoomSession) { this.session = session }

  mount(container: HTMLElement) {
    this.root = document.createElement('div')
    this.root.className = 'scene01'
    this.root.innerHTML = `<div class="room-layer" aria-hidden="true"></div>
      <div class="opening-title" style="position:absolute;z-index:3;inset:0;display:grid;place-items:center;color:#30382e;font:400 5.1cqw/1 Manrope,sans-serif;letter-spacing:.055em;pointer-events:none">Beyond the Exhibit</div>
      <div class="cinematic-vignette"></div><div class="portal-sweep"></div>
      <div class="title-lockup"><h1>BEYOND THE EXHIBIT</h1><div class="title-rule"></div></div>`
    this.root.insertBefore(createScrapbook(), this.root.querySelector('.cinematic-vignette'))
    container.append(this.root)
    const roomLayer = this.root.querySelector<HTMLElement>('.room-layer')!
    try {
      this.room = this.session?.room ?? createRoom(roomLayer)
      // createRoom mounts a fresh canvas itself; a handoff moves that same node.
      if (this.session?.canvas) roomLayer.append(this.session.canvas)
      this.ambientTime = this.session?.ambientTime ?? 0
    } catch (error) {
      this.room?.dispose()
      this.room = null
      console.error('Unable to initialize the museum room.', error)
      this.root.querySelector('.room-layer')!.innerHTML = `<div class="webgl-message"><p>The immersive room could not be initialized. Please check the browser console for details.</p></div>`
    }
    this.createAnimation()
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.wasPlaying = !!this.transition?.isActive()
        this.transition?.pause()
      } else if (this.wasPlaying) {
        this.lastFrame = 0
        this.transition?.resume()
        this.wasPlaying = false
      }
    }, { signal: this.abort.signal })
    this.frame = requestAnimationFrame(this.render)
  }

  private createAnimation() {
    this.context = gsap.context(() => {
      this.timeline = createTimeline(this.root, this.state, this.audio)
    }, this.root)
  }
  play(atEnd = false) {
    if (atEnd) this.seek(TIMING.hold)
    else this.animateBeat()
  }

  private animateBeat() {
    this.transition = this.timeline.tweenTo(BEATS[this.beat].end, {
      ease: 'none',
      onComplete: () => { this.transition = null; this.settleQueued() },
    })
  }

  nextBeat() {
    if (this.transition) { this.queued = 1; return true }
    return this.advance()
  }

  private advance(): boolean {
    if (this.beat === BEATS.length - 1) return false
    this.beat++
    this.animateBeat()
    return true
  }

  previousBeat() {
    if (this.transition) { this.queued = -1; return true }
    return this.rewind()
  }

  private rewind(): boolean {
    if (this.beat === 0) return false
    this.beat--
    this.audio.reset()
    this.timeline.pause().time(BEATS[this.beat].end, true)
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

  /** Development-only frame inspection; normal navigation always uses beats. */
  seek(seconds: number) {
    this.transition?.kill()
    this.transition = null
    this.queued = null
    const time = Math.max(0, Math.min(TIMING.hold, seconds))
    this.beat = Math.max(0, BEATS.findIndex(beat => time <= beat.end))
    this.timeline.pause().time(time, true)
    this.room?.update(this.ambientTime, this.state)
  }

  releaseRoom(): RoomSession {
    const transfer = { room: this.room, canvas: this.root.querySelector('canvas'), ambientTime: this.ambientTime }
    this.room = null
    return transfer
  }

  seekBeat(beat: number) {
    this.audio.reset(); this.wasPlaying = false
    this.seek(BEATS[Math.max(0, Math.min(BEATS.length - 1, Math.trunc(beat)))].end)
  }

  restart() {
    this.transition?.kill()
    this.transition = null
    this.timeline.kill()
    this.context.revert()
    this.audio.reset()
    this.state = initialState()
    this.ambientTime = 0
    this.lastFrame = 0
    this.beat = 0
    this.wasPlaying = false
    this.queued = null
    this.createAnimation()
    this.room?.update(0, this.state)
    this.animateBeat()
  }

  resize(width: number, height: number) { this.room?.resize(width, height) }

  private render = (now: number) => {
    const delta = this.lastFrame ? Math.min((now - this.lastFrame) / 1000, .1) : 0
    this.lastFrame = now
    if (!document.hidden) this.ambientTime += delta
    const t = this.state.elapsed
    const figure = this.root.querySelector<SVGGElement>('.figure-position')!
    const walking = t >= TIMING.walk && t <= 12.3
    const gait = walking ? Math.sin((t - TIMING.walk) * 10.5) : 0
    const bob = walking ? Math.abs(Math.cos((t - TIMING.walk) * 10.5)) * 2 : Math.sin(t * 1.8) * .5
    figure.setAttribute('transform', `translate(${this.state.walkX} ${640 - bob}) scale(${this.state.walkScale})`)
    const pose = this.root.querySelector<SVGGElement>('.figure-pose')!
    pose.setAttribute('transform', `rotate(${walking ? 3 : Math.sin(t * 1.3) * 1.4} 0 -55)`)
    if (walking) {
      this.root.querySelector('.arm-left')!.setAttribute('d', `M0-96L${-9 + gait * 13}-76 ${-5 + gait * 21}-56`)
      this.root.querySelector('.arm-right')!.setAttribute('d', `M0-96L${9 - gait * 13}-76 ${5 - gait * 21}-56`)
      this.root.querySelector('.leg-left')!.setAttribute('d', `M0-54L${-5 - gait * 11}-29 ${-gait * 24} ${-Math.max(0, gait) * 8} ${-gait * 24 + 8} ${-Math.max(0, gait) * 8}`)
      this.root.querySelector('.leg-right')!.setAttribute('d', `M0-54L${5 + gait * 11}-29 ${gait * 24} ${-Math.max(0, -gait) * 8} ${gait * 24 + 8} ${-Math.max(0, -gait) * 8}`)
    } else if (t < TIMING.walk) {
      this.root.querySelector('.arm-left')!.setAttribute('d', 'M0-96L-17-76-13-56')
      this.root.querySelector('.arm-right')!.setAttribute('d', t < 3.2 ? 'M1-95L17-76 23-91' : 'M1-95L15-76 13-56')
      this.root.querySelector('.leg-left')!.setAttribute('d', 'M0-54L-11-28-17 0-25 0')
      this.root.querySelector('.leg-right')!.setAttribute('d', 'M0-54L11-28 19 0 27 0')
    }
    // Never move the camera beyond the clamped 20-second timeline.
    // Only the projection shader and dust continue on ambient time.
    if (t >= TIMING.transition && !document.hidden) this.room?.update(this.ambientTime, this.state)
    this.frame = requestAnimationFrame(this.render)
  }

  snapshot(): SceneSnapshot {
    const t = this.state.elapsed
    return {
      sceneId: this.id, sceneName: this.name, beat: this.beat, totalBeats: BEATS.length,
      beatName: BEATS[this.beat].name, transitioning: !!this.transition,
      narration: narrationCues[this.beat]?.text,
      nextNarration: narrationCues[this.beat + 1]?.text,
      elapsed: t, duration: TIMING.hold, holding: !this.transition,
      phase: t < 3.2 ? 'exhibit' : t < 7.4 ? 'brainstorm' : t < 12 ? 'walk' : t < 16.2 ? 'doorway' : t < 20 ? 'room' : 'hold',
      camera: this.room ? { x: this.room.camera.position.x, y: this.room.camera.position.y, z: this.room.camera.position.z } : null,
    }
  }

  dispose() {
    cancelAnimationFrame(this.frame)
    this.abort.abort()
    this.transition?.kill()
    this.timeline.kill()
    this.context.revert()
    this.audio.dispose()
    this.room?.dispose()
    this.root.remove()
  }
}
