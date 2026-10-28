import { gsap } from 'gsap'
import type { AudioManager } from '../../audio/AudioManager'
import { closingCues, SCENE06_BEATS } from './cues'
import { closingStates, type ClosingState } from './state'

const panels = ['.s6-entry', '.s6-grant', '.s6-path', '.s6-expansion', '.s6-title', '.s6-finale']
export function closingLayout(root: HTMLElement, beat: number) {
  gsap.set(root.querySelectorAll('.s6-panel'), { opacity: 0, y: 0 })
  if (beat > 0) gsap.set(root.querySelector(panels[beat]), { opacity: 1 })
  gsap.set(root.querySelectorAll('.s6-path-stage,.s6-path-note,.s6-grant > *,.s6-expansion > *,.s6-small-room,.s6-title > *,.s6-finale > *'), { opacity: 1, y: 0 })
  gsap.set(root.querySelectorAll('.s6-path-arrow'), { scaleX: 1 })
  gsap.set(root.querySelector('.s6-outgoing'), { opacity: 0, display: 'none' })
}

export function closingTimeline(root: HTMLElement, beat: number, state: ClosingState, audio: AudioManager, complete: () => void) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' }, onComplete: complete })
  const all = (selector: string) => root.querySelectorAll(selector)
  closingLayout(root, Math.max(0, beat - 1))
  if (beat === 0) {
    gsap.set(all('.s6-outgoing'), { display: 'block', opacity: 1 })
    tl.to(all('.s6-outgoing'), { opacity: 0, duration: 1.1, ease: 'sine.inOut' }, .25).set(all('.s6-outgoing'), { display: 'none' }, 1.35)
  } else {
    if (beat > 1) tl.to(all(panels[beat - 1]), { opacity: 0, duration: .5 }, 0)
    tl.set(all(panels[beat]), { opacity: 1 }, .35)
    const reveal = (selector: string, at: number, duration = .85) => {
      gsap.set(all(selector), { opacity: 0, y: 14 })
      tl.to(all(selector), { opacity: 1, y: 0, duration }, at)
    }
    if (beat === 1) { reveal('.s6-amount', .4, 1.15); reveal('.s6-grant h1', 1.2, 1) }
    if (beat === 2) {
      all('.s6-path-stage').forEach((element, index) => {
        gsap.set(element, { opacity: 0, y: 10 })
        tl.to(element, { opacity: 1, y: 0, duration: .65 }, .4 + index * .5)
      })
      all('.s6-path-arrow').forEach((element, index) => {
        gsap.set(element, { scaleX: 0 })
        tl.to(element, { scaleX: 1, duration: .5 }, .8 + index * .5)
      })
      reveal('.s6-path-note', 2.3, .75)
    }
    if (beat === 3) {
      reveal('.s6-expansion p', .4); reveal('.s6-expansion h1', 1)
      gsap.set(all('.s6-small-room'), { opacity: 0 })
      tl.to(all('.s6-small-room'), { opacity: 1, duration: .65, stagger: .27 }, .9)
    }
    if (beat === 4) { reveal('.s6-title .s6-location', .45, 1.2) }
    if (beat === 5) reveal('.s6-finale h1', .55, 1.5)
  }
  tl.to(state, { ...closingStates[beat], duration: beat === 0 ? 2.55 : beat === 3 ? 2.7 : 2.4, ease: beat === 0 ? 'sine.inOut' : 'power2.inOut' }, beat === 0 ? .25 : 0)
  if (beat === 5) {
    tl.to(state, { cx: -1.65, cy: 2.9, cz: 4.7, tx: .2, ty: 1.85, tz: -4.7, fov: 54, duration: 1.55, ease: 'power2.inOut' }, .2)
      .to(state, { ...closingStates[5], duration: 1.15, ease: 'power3.out' }, 1.55)
      .to(state, { brightness: 1.08, duration: .5, ease: 'sine.out' }, 2.25)
      .to(state, { brightness: closingStates[5].brightness, duration: .85, ease: 'sine.inOut' }, 2.75)
  }
  for (const [name, at] of closingCues[beat]) tl.call(() => audio.cue(name, at), [], at)
  tl.to({}, { duration: SCENE06_BEATS[beat].duration }, 0)
  return tl
}
