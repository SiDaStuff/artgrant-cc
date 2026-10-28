import { gsap } from 'gsap'
import { SCENE02_BEATS, type Scene02AudioCueName } from './cues'
import { beatStates, type RoomState } from './state'
import type { AudioManager } from '../../audio/AudioManager'

export const featureLabels = [
  ['', ''], ['', ''], ['', ''],
  ['', ''], ['', ''],
  ['25–40 VISITORS', 'per experience'], ['', ''], ['', ''],
] as const

/** A fresh finite timeline is created only after a manual navigation action. */
export function createBeatTimeline(
  beat: number, state: RoomState, root: HTMLElement, audio: AudioManager,
  setLabel: (title: string, subtitle?: string) => void, complete: () => void,
) {
  const duration = SCENE02_BEATS[beat].duration
  const caption = root.querySelector<HTMLElement>('.feature-label')!
  const tl = gsap.timeline({ paused: true, onComplete: complete, defaults: { ease: 'sine.inOut' } })
  const target = { ...beatStates[beat] }
  const cue = (name: Scene02AudioCueName, at: number) => tl.call(() => audio.cue(name, at), [], at)
  gsap.set(caption, { opacity: 0, y: 6 })
  setLabel(featureLabels[beat][0], featureLabels[beat][1])
  const camera = { cx: target.cx, cy: target.cy, cz: target.cz, tx: target.tx, ty: target.ty, tz: target.tz, fov: target.fov }
  // Every room feature gets an intentional move instead of a single generic
  // drift: dolly into projection, orbit around audio, rise to the scrim, then
  // pull back for people and worlds.
  if (beat === 2) {
    tl.to(state, { cx: -.55, cy: 1.95, cz: .55, tx: -2.25, ty: 2.05, tz: -5.45, fov: 54, duration: 1.15 }, 0)
      .to(state, { ...camera, duration: 1.45 }, 1.15)
  } else if (beat === 3) {
    tl.to(state, { cx: .55, cy: 1.8, cz: .2, tx: .9, ty: 1.85, tz: -5.35, fov: 56, duration: 1.1 }, 0)
      .to(state, { ...camera, duration: 1.55 }, 1.1)
  } else if (beat === 4) {
    tl.to(state, { cx: .15, cy: 2.65, cz: 1.35, tx: .45, ty: 1.7, tz: -4.9, fov: 57, duration: 1.55 }, 0)
      .to(state, { ...camera, duration: 2.2 }, 1.55)
  } else if (beat === 5) {
    tl.to(state, { cx: -2.8, cy: 2.15, cz: 3.9, tx: 0, ty: 1.45, tz: -3.5, fov: 61, duration: 1.25 }, 0)
      .to(state, { ...camera, duration: 1.85 }, 1.25)
  } else {
    tl.to(state, { ...camera, duration: Math.min(duration, 2.7) }, 0)
  }
  tl.to(state, { entryTitle: 0, duration: Math.min(duration, .95) }, 0)

  if (beat === 1) {
    tl.to(state, { back: .08, left: .08, right: .08, duration: 1.6 }, 0)
    cue('room_ambience', 0)
  }
  if (beat === 2) {
    tl.to(state, { back: target.back, duration: 1.6 }, .15)
    tl.to(state, { left: target.left, right: target.right, duration: 1.5 }, .9)
    tl.to(state, { ceiling: target.ceiling, duration: 1.3 }, 1.65)
    cue('projection_activate', .15)
  }
  if (beat === 3) {
    tl.to(state, { sound: 1, back: target.back, left: target.left, right: target.right, ceiling: target.ceiling, duration: 1.8 }, .2)
    cue('surround_reveal', .2); cue('low_sub_pulse', .5)
    cue('subtle_sub_hit', .5); cue('spatial_whoosh', 1)
  }
  if (beat === 4) {
    setLabel('')
    tl.to(state, { lighting: 1, back: target.back, left: target.left, right: target.right, ceiling: target.ceiling, duration: 1.6 }, 0)
    tl.to(state, { hologram: 1, duration: 1.8 }, 1.9)
    cue('lighting_activate', .05); cue('hologram_reveal', 1.9)
    tl.to(caption, { opacity: 0, duration: .25 }, 0)
  } else if (featureLabels[beat][0]) {
    tl.to(caption, { opacity: 1, y: 0, duration: .45 }, .15)
    tl.to(caption, { opacity: .65, duration: .6 }, Math.max(.7, duration - .7))
  }
  if (beat === 5) {
    tl.to(state, { visitors: 1, duration: 2.2 }, .5)
    cue('visitors_reveal', .5)
  }
  if (beat === 6) {
    tl.to(state, { back: .95, left: .9, right: .9, ceiling: .8, hologram: .5, duration: .7 }, 0)
    tl.to(state, { environment: 1, duration: .9 }, .3)
    tl.to(state, { environment: 2, duration: .9 }, 2.1)
    tl.to(state, { environment: 3, duration: .9 }, 3.9)
    tl.to(state, { environment: 4, duration: 1 }, 5.7)
    tl.to(state, { hero: 1, back: target.back, left: target.left, right: target.right, ceiling: target.ceiling, lighting: target.lighting, duration: 1.3 }, 6.7)
    cue('environment_ocean', .3); cue('environment_space', 2.1)
    cue('environment_micro', 3.9); cue('reusable_room_reveal', 6.7)
    // Mode 4 and mode 0 are the same image; normalize without a visible change.
    tl.set(state, { environment: 0 }, duration)
  }
  // A finite clock only ends THIS beat. It never starts another beat or scene.
  const progress = { time: 0 }
  tl.to(progress, { time: duration, duration, ease: 'none' }, 0)
  return tl
}
