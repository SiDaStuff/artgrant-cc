import type { AudioCueName } from '../scenes/scene01/cues'
import type { Scene02AudioCueName } from '../scenes/scene02/cues'
import type { Scene03AudioCueName } from '../scenes/scene03/cues'
import type { Scene04AudioCueName } from '../scenes/scene04/cues'
import type { Scene05AudioCueName } from '../scenes/scene05/cues'
import type { Scene06AudioCueName } from '../scenes/scene06/cues'

type CueName = AudioCueName | Scene02AudioCueName | Scene03AudioCueName | Scene04AudioCueName | Scene05AudioCueName | Scene06AudioCueName
export type MixChannel = 'master' | 'music' | 'ambience' | 'effects' | 'impact'
export type MixSettings = Record<MixChannel, number>

const initialMix: MixSettings = { master: .8, music: .2, ambience: .45, effects: .42, impact: .48 }
const cueAssets: Partial<Record<CueName, { file: string; channel: 'effects' | 'impact' | 'ambience'; gain?: number }>> = {
  paper_draw: { file: 'pencil-writing.mp3', channel: 'effects', gain: .5 },
  pencil_scratch: { file: 'pencil-writing.mp3', channel: 'effects', gain: .3 },
  footsteps_doodle: { file: 'page-turn.mp3', channel: 'effects', gain: .24 },
  transition_riser: { file: 'paper-portal-sweep.mp3', channel: 'effects', gain: .3 },
  room_reveal: { file: 'impact-room-reveal.wav', channel: 'impact', gain: .34 },
  scene2_enter: { file: 'impact-scene2-arrival.wav', channel: 'impact', gain: .17 },
  room_ambience: { file: 'museum-room.mp3', channel: 'ambience', gain: .16 },
  projection_activate: { file: 'projector-click.mp3', channel: 'effects', gain: .18 },
  spatial_whoosh: { file: 'light-whoosh.mp3', channel: 'effects', gain: .18 },
  surround_reveal: { file: 'light-whoosh.mp3', channel: 'effects', gain: .18 },
  hologram_reveal: { file: 'shimmer.mp3', channel: 'effects', gain: .24 },
  lighting_activate: { file: 'shimmer.mp3', channel: 'effects', gain: .17 },
  reusable_room_reveal: { file: 'impact-room-reuse.wav', channel: 'impact', gain: .2 },
  scene3_paper_transition: { file: 'page-turn.mp3', channel: 'effects', gain: .22 },
  ink_draw: { file: 'pencil-writing.mp3', channel: 'effects', gain: .2 },
  scene4_page_clear: { file: 'page-turn.mp3', channel: 'effects', gain: .2 },
  atom_low_pulse: { file: 'subtle-pulse.mp3', channel: 'ambience', gain: .2 },
  particle_rise: { file: 'soft-riser.mp3', channel: 'effects', gain: .17 },
  atom_reveal: { file: 'shimmer.mp3', channel: 'effects', gain: .28 },
  sub_hit_01: { file: 'impact-atom.wav', channel: 'impact', gain: .24 },
  ocean_transition: { file: 'water-swish.mp3', channel: 'effects', gain: .26 },
  underwater_rumble: { file: 'underwater-room.mp3', channel: 'ambience', gain: .25 },
  sub_hit_02: { file: 'impact-ocean.wav', channel: 'impact', gain: .22 },
  heartbeat_start: { file: 'heartbeat.mp3', channel: 'ambience', gain: .25 },
  body_transition: { file: 'light-whoosh.mp3', channel: 'effects', gain: .24 },
  heartbeat_impact: { file: 'impact-body.wav', channel: 'impact', gain: .26 },
  biological_rise: { file: 'soft-riser.mp3', channel: 'effects', gain: .18 },
  blackhole_sub_hit: { file: 'bass-drop-new-1.mp3', channel: 'impact', gain: .34 },
  cosmic_rise: { file: 'soft-riser.mp3', channel: 'effects', gain: .34 },
  gravitational_rumble: { file: 'space-room.mp3', channel: 'ambience', gain: .24 },
  stone_rumble: { file: 'impact-rome-stone.wav', channel: 'impact', gain: .18 },
  rome_footsteps: { file: 'rome-footsteps.mp3', channel: 'effects', gain: .45 },
  scene5_enter: { file: 'bass-drop-new-2.mp3', channel: 'impact', gain: .33 },
  scene6_enter: { file: 'impact-closing-arrival.wav', channel: 'impact', gain: .24 },
  grant_reveal: { file: 'impact-grant-reveal.wav', channel: 'impact', gain: .18 },
  prototype_path_reveal: { file: 'paper-portal-sweep.mp3', channel: 'effects', gain: .18 },
  expansion_reveal: { file: 'soft-riser.mp3', channel: 'effects', gain: .25 },
  final_title_reveal: { file: 'shimmer.mp3', channel: 'effects', gain: .3 },
  step_inside_reveal: { file: 'paper-portal-sweep.mp3', channel: 'effects', gain: .28 },
  final_resolution: { file: 'bass-drop-new-3.mp3', channel: 'impact', gain: .95 },
}

/** How many equal sections of the sketch file we rotate through. */
const SKETCH_SECTIONS = 4
const SKETCH_FILE = 'pencil-writing.mp3'
const SKETCH_GAIN = .5
const sketchCueNames = new Set<CueName>(['paper_draw', 'pencil_scratch', 'ink_draw'])

const musicForScene = (scene: string) => scene === 'scene06' ? 'closing-proposal.mp3' : 'main-exhibit-bed.mp3'
const musicVolume = (settings: MixSettings, speakerMode: boolean, ducked = false) => settings.master * settings.music * (speakerMode ? .42 : 1) * (ducked ? .16 : 1)

/** Presentation audio adapter. Audio starts on launch and follows browser autoplay policy. */
export class AudioManager extends EventTarget {
  private static mix = { ...initialMix }
  private static enabled = false
  private static speakerMode = true
  private static music: HTMLAudioElement | null = null
  private static musicScene = ''
  private static musicFrames = new Map<HTMLAudioElement, number>()
  private static ambience: HTMLAudioElement | null = null
  private static ambienceFile = ''
  private static ambienceFrames = new Map<HTMLAudioElement, number>()
  private static musicGeneration = 0
  private static ducked = false
  private static currentScene = 'scene01'
  private static visible = true
  private static activeSounds = new Set<HTMLAudioElement>()
  // Sustained "sketch" playback: one looping pencil-writing element that spans
  // the whole drawing action and rotates through different sections of the file
  // so consecutive sketches do not play the same identical loop.
  private static sketch: HTMLAudioElement | null = null
  private static sketchStopAt = 0       // performance.now() deadline (absolute ms)
  private static sketchRotation = 0
  private static sketchStopTimer: number | undefined = undefined

  private fired = new Set<CueName>()
  private cleanups = new Set<() => void>()
  private listeners = new Set<(event: Event) => void>()
  private sounds = new Set<HTMLAudioElement>()

  cue(name: CueName, time: number) {
    if (this.fired.has(name)) return
    this.fired.add(name)
    this.dispatchEvent(new CustomEvent('cue', { detail: { name, time } }))
    // Drawing timelines provide the precise visual duration through playSketch.
    // A fixed cue here would span the gaps between separate sketches.
    if (sketchCueNames.has(name)) return
    const ambient = name === 'atom_low_pulse' ? 'subtle-pulse.mp3'
      : name === 'underwater_rumble' ? 'underwater-room.mp3'
        : name === 'heartbeat_start' ? 'heartbeat.mp3'
          : name === 'gravitational_rumble' ? 'space-room.mp3' : null
    if (ambient) AudioManager.setAmbience(ambient)
    else this.playCue(name)
    if (name === 'blackhole_sub_hit') AudioManager.setMusicDuck(false)
    if (name === 'rome_footsteps') AudioManager.setAmbience(null)
    if (name === 'scene6_enter') { AudioManager.setAmbience(null); AudioManager.setMusic('scene06', true) }
  }

  /** Play the pencil sound for one ink or handwriting animation. */
  playSketch(duration: number) {
    AudioManager.sustainSketch(duration)
  }

  /**
   * Play the sketch writing sound for as long as the drawing runs. A single
   * looping element is reused; consecutive sketch cues within one active
   * sketch extend it (so paper_draw → pencil_scratch stay continuous), while a
   * fresh sketch that begins after the previous one ends rotates to a
   * different section of the file so it never repeats the same loop.
   */
  private static sustainSketch(duration: number) {
    if (!AudioManager.enabled) return
    const now = performance.now()
    const stillActive = AudioManager.sketch && now < AudioManager.sketchStopAt
    if (stillActive) {
      // Same ongoing sketch: extend the stop so overlapping cues stay continuous.
      AudioManager.sketchStopAt = Math.max(AudioManager.sketchStopAt, now + duration * 1000)
      AudioManager.scheduleSketchStop()
      return
    }
    // Fresh sketch: rotate to the next section of the file and play it looping.
    const el = AudioManager.sketch ?? new Audio(`/audio/approved/${SKETCH_FILE}`)
    const section = AudioManager.sketchRotation % SKETCH_SECTIONS
    AudioManager.sketchRotation++
    el.loop = true
    el.preload = 'auto'
    el.volume = AudioManager.sketchVolume()
    const setOffset = () => {
      const dur = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : 22.57
      el.currentTime = (section / SKETCH_SECTIONS) * dur
    }
    if (Number.isFinite(el.duration) && el.duration > 0) setOffset()
    else el.addEventListener('loadedmetadata', setOffset, { once: true })
    AudioManager.sketch = el
    AudioManager.sketchStopAt = now + duration * 1000
    AudioManager.scheduleSketchStop()
    if (!AudioManager.visible) return
    void el.play().catch(() => {})
  }

  private static scheduleSketchStop() {
    if (AudioManager.sketchStopTimer) clearTimeout(AudioManager.sketchStopTimer)
    AudioManager.sketchStopTimer = window.setTimeout(() => {
      AudioManager.sketchStopTimer = 0
      AudioManager.stopSketch()
    }, Math.max(0, AudioManager.sketchStopAt - performance.now()))
  }

  static stopSketch() {
    if (AudioManager.sketch) { AudioManager.sketch.pause(); AudioManager.sketch.currentTime = 0 }
    AudioManager.sketchStopAt = 0
    if (AudioManager.sketchStopTimer) { clearTimeout(AudioManager.sketchStopTimer); AudioManager.sketchStopTimer = 0 }
  }

  private static sketchVolume() { return this.mix.master * this.mix.effects * SKETCH_GAIN }

  onCue(callback: (name: CueName, time: number) => void | (() => void)) {
    const listener = (event: Event) => {
      const { name, time } = (event as CustomEvent<{ name: CueName; time: number }>).detail
      try { const cleanup = callback(name, time); if (cleanup) this.cleanups.add(cleanup) }
      catch (error) { console.warn(`Optional audio hook '${name}' was skipped.`, error) }
    }
    this.addEventListener('cue', listener); this.listeners.add(listener)
    return () => { this.removeEventListener('cue', listener); this.listeners.delete(listener) }
  }

  static enable() {
    this.enabled = true
    this.setMusic(this.currentScene)
  }
  static isEnabled() { return this.enabled }
  static setScene(scene: string) {
    this.currentScene = scene
    this.stopSketch()
    this.setAmbience(null)
    if (this.enabled) this.setMusic(scene)
  }
  static getMix(): MixSettings { return { ...this.mix } }
  static setMix(channel: MixChannel, value: number) {
    this.mix[channel] = Math.max(0, Math.min(1, value))
    if (this.music) this.music.volume = musicVolume(this.mix, this.speakerMode, this.ducked)
    if (this.ambience) this.ambience.volume = this.mix.master * this.mix.ambience * (this.speakerMode ? .72 : 1)
    if (this.sketch) this.sketch.volume = this.sketchVolume()
    window.dispatchEvent(new CustomEvent('audio-mix-change', { detail: { ...this.mix, speakerMode: this.speakerMode } }))
  }
  static getSpeakerMode() { return this.speakerMode }
  static setSpeakerMode(value: boolean) {
    this.speakerMode = value
    if (this.music) this.music.volume = musicVolume(this.mix, value, this.ducked)
    if (this.ambience) this.ambience.volume = this.mix.master * this.mix.ambience * (value ? .72 : 1)
    window.dispatchEvent(new CustomEvent('audio-mix-change', { detail: { ...this.mix, speakerMode: value } }))
  }
  static setVisible(visible: boolean) {
    this.visible = visible
    if (!visible) { this.music?.pause(); this.ambience?.pause(); this.sketch?.pause(); this.activeSounds.forEach(sound => sound.pause()); return }
    if (this.enabled && this.music) void this.music.play().catch(() => {})
    if (this.enabled && this.ambience) void this.ambience.play().catch(() => {})
    if (this.enabled && this.sketch && performance.now() < this.sketchStopAt) void this.sketch.play().catch(() => {})
    this.activeSounds.forEach(sound => { void sound.play().catch(() => {}) })
  }

  private static setMusic(scene: string, force = false) {
    if (!this.enabled) return
    const file = musicForScene(scene)
    if (!force && this.musicScene === file && this.music && !this.music.paused) return
    if (this.musicScene === file && this.music) { this.fade(this.music, musicVolume(this.mix, this.speakerMode), 700); return }
    const generation = ++this.musicGeneration
    const previous = this.music
    const next = new Audio(`/audio/approved/${file}`)
    next.loop = true; next.preload = 'none'; next.volume = 0
    this.music = next; this.musicScene = file
    next.addEventListener('error', () => { if (this.music === next) { this.music = null; this.musicScene = '' } }, { once: true })
    if (!this.visible) return
    void next.play().then(() => {
      if (generation !== this.musicGeneration) { next.pause(); return }
      this.fade(next, musicVolume(this.mix, this.speakerMode, this.ducked), 1100)
      if (previous) this.fade(previous, 0, 1000, () => previous.pause())
    }).catch(() => { if (this.music === next) { this.music = null; this.musicScene = '' } })
  }
  private static fade(audio: HTMLAudioElement, target: number, duration: number, complete?: () => void) {
    const oldFrame = this.musicFrames.get(audio)
    if (oldFrame !== undefined) cancelAnimationFrame(oldFrame)
    const start = audio.volume, began = performance.now()
    const frame = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - began) / duration))
      audio.volume = Math.min(1, Math.max(0, start + (target - start) * p))
      if (p < 1) this.musicFrames.set(audio, requestAnimationFrame(frame))
      else { this.musicFrames.delete(audio); complete?.() }
    }
    this.musicFrames.set(audio, requestAnimationFrame(frame))
  }
  private static setMusicDuck(value: boolean) {
    this.ducked = value
    if (this.music) this.fade(this.music, musicVolume(this.mix, this.speakerMode, value), value ? 130 : 260)
  }
  private static setAmbience(file: string | null) {
    if (!this.enabled || (file === this.ambienceFile && this.ambience)) return
    const previous = this.ambience
    this.ambienceFile = file ?? ''
    if (!file) {
      if (previous) this.fadeOn(previous, 0, 450, this.ambienceFrames, () => previous.pause())
      this.ambience = null
      return
    }
    const next = new Audio(`/audio/approved/${file}`)
    next.loop = true; next.preload = 'none'; next.volume = 0
    this.ambience = next
    next.addEventListener('error', () => { if (this.ambience === next) { this.ambience = null; this.ambienceFile = '' } }, { once: true })
    if (!this.visible) return
    void next.play().then(() => {
      if (this.ambience !== next) { next.pause(); return }
      this.fadeOn(next, this.mix.master * this.mix.ambience * (this.speakerMode ? .72 : 1), 650, this.ambienceFrames)
      if (previous) this.fadeOn(previous, 0, 450, this.ambienceFrames, () => previous.pause())
    }).catch(() => { if (this.ambience === next) { this.ambience = null; this.ambienceFile = '' } })
  }
  private static fadeOn(audio: HTMLAudioElement, target: number, duration: number,
    frames: Map<HTMLAudioElement, number>, complete?: () => void) {
    const oldFrame = frames.get(audio)
    if (oldFrame !== undefined) cancelAnimationFrame(oldFrame)
    const start = audio.volume, began = performance.now()
    const frame = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - began) / duration))
      audio.volume = Math.min(1, Math.max(0, start + (target - start) * p))
      if (p < 1) frames.set(audio, requestAnimationFrame(frame))
      else { frames.delete(audio); complete?.() }
    }
    frames.set(audio, requestAnimationFrame(frame))
  }
  private playCue(name: CueName) {
    if (!AudioManager.enabled) return
    const spec = cueAssets[name]
    if (!spec) return
    if (spec.channel === 'ambience') return
    const audio = new Audio(`/audio/approved/${spec.file}`)
    audio.preload = 'none'
    const settings = AudioManager.mix
    const channel = spec.channel === 'impact' ? settings.impact : settings.effects
    audio.volume = settings.master * channel * (spec.gain ?? 1)
    this.sounds.add(audio)
    AudioManager.activeSounds.add(audio)
    const cleanup = () => { audio.pause(); audio.currentTime = 0; this.sounds.delete(audio); this.cleanups.delete(cleanup) }
    const removeActive = () => { AudioManager.activeSounds.delete(audio) }
    audio.addEventListener('ended', cleanup, { once: true })
    audio.addEventListener('error', cleanup, { once: true })
    audio.addEventListener('ended', removeActive, { once: true })
    audio.addEventListener('error', removeActive, { once: true })
    this.cleanups.add(cleanup)
    if (AudioManager.visible) void audio.play().catch(cleanup)
  }

  reset() {
    this.cleanups.forEach(cleanup => { try { cleanup() } catch { /* Optional audio. */ } })
    this.cleanups.clear(); this.sounds.clear(); this.fired.clear()
  }
  dispose() {
    this.reset()
    this.listeners.forEach(listener => this.removeEventListener('cue', listener))
    this.listeners.clear()
  }
  static shutdown() {
    this.musicGeneration++
    this.musicFrames.forEach(frame => cancelAnimationFrame(frame)); this.musicFrames.clear()
    this.music?.pause(); this.music = null; this.musicScene = ''; this.enabled = false
    this.ambienceFrames.forEach(frame => cancelAnimationFrame(frame)); this.ambienceFrames.clear()
    this.ambience?.pause(); this.ambience = null; this.ambienceFile = ''
    this.activeSounds.forEach(sound => sound.pause()); this.activeSounds.clear()
    this.stopSketch()
  }
}
