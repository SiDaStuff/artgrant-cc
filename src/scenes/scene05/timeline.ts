import { gsap } from 'gsap'
import type { AudioManager } from '../../audio/AudioManager'
import { beatCues, SCENE05_BEATS } from './cues'
import { stableState, worlds, type VisionState } from './state'

export const worldLabels = ['', 'INSIDE THE ATOM', 'DEEP OCEAN', 'HUMAN BODY', 'BEYOND OUR REACH', 'ANCIENT ROME', '']

export function createVisionTimeline(beat: number, state: VisionState, root: HTMLElement, audio: AudioManager,
  setLabel: (label: string) => void, complete: () => void) {
  const timeline = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' }, onComplete: complete })
  const label = root.querySelector('.s5-label')!
  const paper = root.querySelector<HTMLElement>('.s5-paper')!
  const finalLines = root.querySelectorAll('.s5-final > *')
  gsap.set(finalLines, { opacity: 0, y: 18 })
  gsap.set(label, { opacity: 0, y: 12 })
  setLabel(worldLabels[beat])
  if (beat === 0) {
    const aperture = { radius: 0 }
    const futureRoom = paper.querySelector('.s4-future-room')
    gsap.set(paper, { display: 'block', opacity: 1, scale: 1, yPercent: 0, rotation: 0,
      transformOrigin: '80.3% 61.9%', '--portal-radius': '0%' })
    if (futureRoom) timeline.to(futureRoom, { opacity: .42, duration: .16, repeat: 3, yoyo: true }, .05)
    // Open the blueprint's future-room panel as an iris onto the live 3D room.
    // The room itself rushes forward through the aperture; no still image is scaled up.
    timeline.to(aperture, { radius: 155, duration: 1.8, ease: 'power3.in', onUpdate: () => {
      paper.style.setProperty('--portal-radius', `${aperture.radius}%`)
    } }, .2)
      .to(state, { cx: -.65, cy: 1.75, cz: 2.65, tx: 0, ty: 2.2, tz: -4.5, fov: 49,
        motionBlur: .9, duration: 1.05, ease: 'power3.in' }, .25)
      .to(state, { cameraFlash: .82, duration: .06 }, 1.04)
      .to(state, { cameraFlash: 0, duration: .42, ease: 'power2.out' }, 1.1)
      .to(paper, { yPercent: -7, rotation: -1.4, scale: 1.13, opacity: 0, duration: 1.6, ease: 'power3.in' }, .95)
      .to(state, { ...(({ cameraFlash: _cameraFlash, ...roomState }) => roomState)(stableState(0)),
        duration: 1.45, ease: 'power2.out' }, 1.35)
      .set(paper, { display: 'none' }, 2.65)
  } else {
    gsap.set(paper, { display: 'none', opacity: 0 })
    if (beat === 4) {
      const { cx, cy, cz, tx, ty, tz, fov, ...space } = worlds[4]
      // Cover the body world first. Swap to space while the room is dark, then
      // lift the blackout after the camera and projection have settled.
      timeline.to(state, { brightness: .012, particles: 0, motionBlur: .92, duration: .24 }, 0)
        .set(state, { atom: 0, ocean: 0, body: 0, history: 0, space: 1, brightness: .012, particles: .025 }, .28)
        .to(state, { cx, cy, cz, tx, ty, tz, fov, duration: 1.28, ease: 'power3.inOut' }, .28)
        .to(state, { ...space, brightness: .012, particles: .025, motionBlur: .7, duration: .42 }, .28)
        .to(state, { brightness: 1, particles: .55, motionBlur: 0, duration: .58, ease: 'power2.out' }, 1.38)
        .to(state, { cameraFlash: .68, duration: .08 }, 1.3)
        .to(state, { cameraFlash: 0, duration: .42, ease: 'power2.out' }, 1.38)
    } else {
      timeline.to(state, { ...stableState(beat), duration: beat === 6 ? 2.8 : 2.55 }, 0)
    }
    if (beat > 0 && beat < 6) timeline.to(label, { opacity: .9, y: 0, duration: .85 }, beat === 4 ? 1.6 : 1.3)
    if (beat === 6) {
      timeline.to(finalLines[0], { opacity: 1, y: 0, duration: 1.15 }, .65)
        .to(finalLines[1], { opacity: 1, y: 0, duration: 1.35 }, 1.7)
    }
  }
  for (const [name, at] of beatCues[beat] ?? []) timeline.call(() => audio.cue(name, at), [], at)
  // Every beat has a finite reveal followed by a manual hold.
  timeline.to({}, { duration: SCENE05_BEATS[beat].duration }, 0)
  return timeline
}
