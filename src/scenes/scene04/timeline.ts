import { gsap } from 'gsap'
import type { AudioManager } from '../../audio/AudioManager'
import { SCENE04_BEATS, type Scene04AudioCueName } from './cues'

const PANELS = ['intro', 'location', 'scope', 'components', 'process', 'leadership', 'funding-path', 'finale'] as const

export function applyScene04Layout(root: HTMLElement, beat: number) {
  const all = (selector: string) => root.querySelectorAll(selector)
  gsap.set(all('.s4-panel'), { opacity: 0 })
  gsap.set(all(`.s4-${PANELS[beat]},.s4-folio`), { opacity: 1 })
  gsap.set(all('.s4-component,.s4-process-stage,.s4-long-path,.s4-process-arrows,.s4-collaboration,.s4-path-stage,.s4-final-sketch,.s4-final-prototype,.s4-future-room,.s4-final-arrows,.s4-scope-yes'), { opacity: 1 })
  gsap.set(all('.s4-scope-not'), { opacity: 0 })
  gsap.set(all('.s4-draw'), { strokeDashoffset: 0 })
  all('.s4-writing-mask').forEach(element => element.setAttribute('width', (element as SVGElement).dataset.width!))
  gsap.set(all('.s4-outgoing'), { display: 'none', xPercent: 0, yPercent: 0, rotation: 0, opacity: 1 })
  gsap.set(all('.s4-future-room'), { attr: { transform: 'translate(1100 437) scale(1)' } })
}

export function createScene04Timeline(root: HTMLElement, beat: number, audio: AudioManager, complete: () => void) {
  const all = (selector: string) => root.querySelectorAll(selector)
  const tl = gsap.timeline({ paused: true, onComplete: complete, defaults: { ease: 'power2.inOut' } })
  const duration = SCENE04_BEATS[beat].duration
  const cue = (name: Scene04AudioCueName, at: number) => tl.call(() => audio.cue(name, at), [], at)
  const show = (selector: string, at: number) => tl.set(all(selector), { opacity: 1 }, at)
  const draw = (selector: string, at: number, length = .7, stagger = .025) => {
    const elements = Array.from(all(selector)).flatMap(element => element.matches('.s4-draw') ? [element] : Array.from(element.querySelectorAll('.s4-draw')))
    elements.forEach(element => {
      const pathLength = (element as SVGGeometryElement).getTotalLength()
      gsap.set(element, { strokeDasharray: pathLength, strokeDashoffset: pathLength })
    })
    tl.to(elements, { strokeDashoffset: 0, duration: length, stagger, ease: 'none' }, at)
    if (elements.length) tl.call(() => audio.playSketch(length + stagger * (elements.length - 1)), [], at)
  }
  const write = (selector: string, at: number, length = .7) => {
    all(`${selector} .s4-writing-mask`).forEach(element => {
      gsap.set(element, { attr: { width: 0 } })
      tl.to(element, { attr: { width: Number((element as SVGElement).dataset.width) }, duration: length, ease: 'none' }, at)
    })
    if (all(`${selector} .s4-writing-mask`).length) tl.call(() => audio.playSketch(length), [], at)
  }
  applyScene04Layout(root, Math.max(0, beat - 1))
  if (beat > 0) {
    tl.to(all(`.s4-${PANELS[beat - 1]}`), { opacity: 0, duration: .4 }, 0)
    show(`.s4-${PANELS[beat]}`, .25)
  }

  if (beat === 0) {
    gsap.set(all('.s4-intro,.s4-folio'), { opacity: 0 })
    gsap.set(all('.s4-outgoing'), { display: 'block', opacity: 1, xPercent: 0, yPercent: 0, rotation: 0 })
    tl.to(all('.s4-outgoing'), { opacity: 0, xPercent: -6, yPercent: -3, rotation: -1.2, duration: .9 }, 0)
    tl.to(all('.s4-folio'), { opacity: 1, duration: .45 }, .55)
    show('.s4-intro', .6)
    write('.s4-intro', .65, .65)
    draw('.s4-intro-rule', .95, .35)
    cue('scene4_page_clear', 0)
  }
  if (beat === 1) {
    draw('.s4-location', .35, .75, .06)
    write('.s4-location', .65, 1)
    cue('location_reveal', .35)
  }
  if (beat === 2) {
    gsap.set(all('.s4-scope-yes'), { opacity: 0 })
    write('.s4-scope-amount', .25, .65)
    show('.s4-scope-not', .9)
    write('.s4-scope-not', .9, .6)
    tl.to(all('.s4-scope-not'), { opacity: 0, duration: .3 }, 1.65)
    show('.s4-scope-yes', 1.95)
    draw('.s4-scope-yes', 1.95, .4)
    write('.s4-scope-yes', 2.1, .9)
    write('.s4-scope-clarification', 2.65, .8)
    cue('funding_reveal', .25); cue('prototype_reveal', 2.1)
  }
  if (beat === 3) {
    gsap.set(all('.s4-component'), { opacity: 0 })
    draw('.s4-components > .s4-room', .35, .8, .04)
    write('.s4-components > .s4-text', .4, .7)
    all('.s4-component').forEach((_element, index) => {
      const selector = `.s4-component[data-component="${index}"]`
      const at = .55 + index * .27
      tl.to(all(selector), { opacity: 1, duration: .4 }, at)
      draw(selector, at, .6)
      write(selector, at + .05, .65)
    })
    cue('component_draw', .35)
  }
  if (beat === 4) {
    gsap.set(all('.s4-process-stage,.s4-long-path,.s4-process-arrows'), { opacity: 0 })
    all('.s4-process-stage').forEach((_element, index) => {
      const selector = `.s4-process-stage:nth-child(${index + 1})`
      const at = .35 + index * .4
      tl.to(all(selector), { opacity: 1, duration: .3 }, at)
      draw(selector, at, .65, .025)
      write(selector, at, .6)
    })
    show('.s4-process-arrows', .65)
    draw('.s4-process-arrows', .65, .5, .25)
    show('.s4-long-path', 2)
    draw('.s4-long-path', 2, .6, .1)
    write('.s4-long-path', 2.1, 1.05)
    cue('process_step', .35)
  }
  if (beat === 5) {
    gsap.set(all('.s4-collaboration'), { opacity: 0 })
    draw('.s4-leadership > .s4-figure,.s4-leadership > .s4-room,.s4-leadership > path', .4, .8, .025)
    write('.s4-leadership > .s4-text', .5, .9)
    show('.s4-collaboration', 1.55)
    draw('.s4-collaboration', 1.55, .65, .1)
    write('.s4-collaboration', 1.75, .9)
    cue('leadership_reveal', .4)
  }
  if (beat === 6) {
    gsap.set(all('.s4-path-stage'), { opacity: 0 })
    all('.s4-path-stage').forEach((_element, index) => {
      const selector = `.s4-path-stage:nth-child(${index + 1})`
      const at = .3 + index * .65
      tl.to(all(selector), { opacity: 1, duration: .3 }, at)
      draw(selector, at, .4)
      write(selector, at + .05, .6)
    })
    cue('funding_path', .3)
  }
  if (beat === 7) {
    gsap.set(all('.s4-final-sketch,.s4-final-prototype,.s4-future-room,.s4-final-arrows'), { opacity: 0 })
    write('.s4-finale > .s4-text', .35, .75)
    show('.s4-final-sketch', .6)
    draw('.s4-final-sketch', .6, .75, .025)
    write('.s4-final-sketch', .8, .65)
    show('.s4-final-prototype', 1)
    draw('.s4-final-prototype', 1, .75, .025)
    write('.s4-final-prototype', 1.2, .65)
    show('.s4-final-arrows', 1.15)
    draw('.s4-final-arrows', 1.15, .6, .2)
    gsap.set(all('.s4-future-room'), { attr: { transform: 'translate(1118 456) scale(.9)' } })
    tl.to(all('.s4-future-room'), { opacity: 1, attr: { transform: 'translate(1100 437) scale(1)' }, duration: .9 }, 1.3)
    write('.s4-future-room', 1.5, .8)
    cue('final_prototype_hold', 2.3)
  }
  const clock = { time: 0 }
  tl.to(clock, { time: duration, duration, ease: 'none' }, 0)
  return tl
}
