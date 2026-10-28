import { gsap } from 'gsap'
import { audioCues } from './cues'
import type { AudioManager } from '../../audio/AudioManager'
import type { PortalState } from './room'

/** All scene beats live here, in seconds. No automatic scene advancement. */
export const TIMING = {
  exhibit: 0.25, brainstorm: 3.2, walk: 7.4, doorway: 7.15,
  transition: 12, passage: 15.2, room: 16.2, title: 17, hold: 20,
} as const

export interface SceneAnimationState extends PortalState { walkX: number; walkScale: number; elapsed: number }
export const initialState = (): SceneAnimationState => ({
  zoom: 1, shiftX: 0, shiftY: 0, passage: 0, push: 0, wake: 0,
  human: 0, walkX: 488, walkScale: 1, elapsed: 0,
})

export function createTimeline(root: HTMLElement, state: SceneAnimationState, audio: AudioManager) {
  const select = (selector: string) => Array.from(root.querySelectorAll<SVGElement | HTMLElement>(selector))
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } })
  const draw = (selector: string, at: number, duration = .8, stagger = .07) => {
    const paths = select(selector).flatMap(element => element.matches('.draw') ? [element] : Array.from(element.querySelectorAll<SVGGeometryElement>('.draw')))
    paths.forEach(element => {
      const length = (element as SVGGeometryElement).getTotalLength()
      gsap.set(element, { strokeDasharray: length, strokeDashoffset: length })
    })
    tl.to(paths, { strokeDashoffset: 0, duration, stagger, ease: 'none' }, at)
    if (paths.length) tl.call(() => audio.playSketch(duration + stagger * (paths.length - 1)), [], at)
  }
  const write = (selector: string, at: number, duration = .7) => {
    select(`${selector} .writing-mask`).forEach(element => {
      tl.to(element, { attr: { width: Number(element.dataset.width) }, duration, ease: 'none' }, at)
    })
    if (select(`${selector} .writing-mask`).length) tl.call(() => audio.playSketch(duration), [], at)
  }

  gsap.set(select('.idea, .question, .room-sketch, .annotation'), { opacity: 0 })
  gsap.set(select('.opening-title'), { opacity: 1 })
  gsap.set(select('.title-lockup, .title-footnote, .room-layer, .cinematic-vignette, .portal-sweep'), { opacity: 0 })
  gsap.set(select('.figure-shadow'), { opacity: 0 })
  gsap.set(select('.portal-hole'), { attr: { opacity: 0 } })
  gsap.set(select('.scrapbook'), { opacity: 1, scale: 1, xPercent: 0, yPercent: 0 })
  gsap.set(select('.exhibit, .ground, .figure-position, .opening-note, .folio, .room-detail'), { opacity: 1 })
  gsap.set(select('.writing-mask'), { attr: { width: 0 } })

  draw('.figure-ink', .15, .5, .12)
  tl.to(select('.opening-title'), { opacity: 0, duration: .45 }, .55)
  draw('.exhibit', .45, .9, .11)
  draw('.ground', 1.5, .6)
  write('.exhibit', 1.4)
  tl.to(select('.figure-shadow'), { opacity: .08, duration: .5 }, 1)
  tl.set(select('.question'), { opacity: 1 }, TIMING.brainstorm)
  draw('.question', TIMING.brainstorm, .45)
  const ideas = [
    ['.idea-projection', 3.6], ['.idea-sound', 4.35], ['.idea-light', 5.1], ['.idea-motion', 5.8],
  ] as const
  for (const [selector, time] of ideas) {
    tl.set(select(selector), { opacity: 1 }, time)
    draw(selector, time, .47, .065)
    write(selector, time + .25, .55)
    tl.to(select(selector), { opacity: .27, duration: .6 }, time + .95)
  }
  tl.to(select('.question'), { opacity: 0, duration: .35 }, 7)
  tl.set(select('.room-sketch'), { opacity: 1 }, TIMING.doorway)
  draw('.door-drawing', TIMING.doorway, 1, .12)
  draw('.room-detail', 8.5, 1.3, .15)
  tl.to(state, { walkX: 1175, walkScale: .82, duration: 4.9, ease: 'sine.inOut' }, TIMING.walk)
  tl.to(select('.exhibit, .ground'), { opacity: .21, duration: 1.4 }, 8)
  const notes = [['.note-visuals', 8.6], ['.note-sound', 9.5], ['.note-light', 10.3]] as const
  for (const [selector, at] of notes) {
    tl.set(select(selector), { opacity: 1 }, at)
    write(selector, at, .8)
    draw(selector, at + .3, .5)
  }
  tl.to(select('.idea'), { opacity: .11, duration: .8 }, 10.5)
  tl.to(select('.opening-note, .folio'), { opacity: 0, duration: .9 }, 11.5)
  tl.set(select('.room-layer'), { opacity: 1 }, TIMING.transition)
  tl.to(select('.portal-hole'), { attr: { opacity: 1 }, duration: 1.0 }, TIMING.transition)
  tl.to(select('.room-detail'), { opacity: 0, duration: .8 }, TIMING.transition)
  tl.to(select('.figure-position'), { opacity: 0, duration: .7 }, 12.2)
  tl.to(state, { human: 1, duration: .9 }, 12.35)
  tl.to(state, { zoom: 8.2, shiftX: -390, shiftY: -25, duration: 3.2, ease: 'power2.in' }, TIMING.transition)
  tl.to(select('.scrapbook'), { scale: 8.2, xPercent: -24.375, yPercent: -2.777778, duration: 3.2, ease: 'power2.in' }, TIMING.transition)
  // The doorway already fills the frame before paper is removed.
  tl.set(select('.scrapbook'), { opacity: 0 }, TIMING.passage)
  tl.to(state, { passage: 1, duration: 1.0, ease: 'sine.inOut' }, TIMING.passage)
  tl.to(select('.portal-sweep'), { opacity: .35, duration: .4 }, 15)
  tl.to(select('.portal-sweep'), { opacity: 0, duration: 1 }, 15.4)
  tl.to(select('.cinematic-vignette'), { opacity: 1, duration: 1 }, 15.3)
  tl.to(state, { push: 1, duration: 3.8, ease: 'power2.out' }, TIMING.room)
  tl.to(state, { wake: .85, duration: 3.8, ease: 'sine.inOut' }, TIMING.room)
  tl.fromTo(select('.title-lockup'), { opacity: 0, y: 13 }, { opacity: 1, y: 0, duration: 1.7, ease: 'power2.out' }, TIMING.title)
  tl.to(select('.title-footnote'), { opacity: .75, duration: 1 }, 18.5)
  for (const cue of audioCues) tl.call(() => audio.cue(cue.name, cue.time), [], cue.time)
  tl.to(state, { elapsed: TIMING.hold, duration: TIMING.hold, ease: 'none' }, 0)
  return tl
}
