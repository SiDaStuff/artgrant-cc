import { gsap } from 'gsap'
import type { AudioManager } from '../../audio/AudioManager'
import { SCENE03_BEATS, type Scene03AudioCueName } from './cues'

const PANELS = '.s3-trace,.s3-comparison,.s3-memorable,.s3-venn,.s3-reuse,.s3-benefits,.s3-finale'

/** Complete, deterministic end layouts for left-arrow navigation and inspection. */
export function applyBeatLayout(root: HTMLElement, beat: number) {
  const all = (selector: string) => root.querySelectorAll(selector)
  gsap.set(all(PANELS), { opacity: 0 })
  gsap.set(all('.s3-sheet,.s3-folio,.s3-traditional,.s3-immersive,.s3-observer,.s3-inside-label,.s3-room-person,.s3-comparison-arrow'), { opacity: 1 })
  gsap.set(all('.s3-traditional,.s3-immersive'), { x: 0, y: 0, scale: 1 })
  gsap.set(all('.s3-trace'), { attr: { transform: 'translate(224 150) scale(.72)' } })
  gsap.set(all('.s3-draw,.s3-trace-line'), { strokeDashoffset: 0 })
  all('.s3-writing-mask').forEach(element => element.setAttribute('width', (element as SVGElement).dataset.width!))
  gsap.set(all('.s3-capture'), { display: 'none' })
  const stepper = root.querySelector('.s3-stepper')!
  stepper.setAttribute('transform', beat === 7 ? 'translate(1120 620) scale(.85)' : 'translate(830 641) scale(1)')
  stepper.querySelector('.s3-arm-left')!.setAttribute('d', 'M0-96L-17-76-13-56')
  stepper.querySelector('.s3-arm-right')!.setAttribute('d', 'M1-95L17-76 23-91')
  stepper.querySelector('.s3-leg-left')!.setAttribute('d', 'M0-54L-11-28-17 0-25 0')
  stepper.querySelector('.s3-leg-right')!.setAttribute('d', 'M0-54L11-28 19 0 27 0')
  if (beat === 0) gsap.set(all('.s3-trace'), { opacity: 1 })
  if ([1, 2, 3, 7].includes(beat)) gsap.set(all('.s3-comparison'), { opacity: 1 })
  if (beat === 1) gsap.set(all('.s3-immersive,.s3-comparison-arrow'), { opacity: 0 })
  if ([2, 7].includes(beat)) gsap.set(all('.s3-traditional'), { x: -400 })
  if (beat === 3) {
    gsap.set(all('.s3-traditional,.s3-comparison-arrow,.s3-inside-label'), { opacity: 0 })
    gsap.set(all('.s3-immersive'), { x: -370, y: -55 })
    gsap.set(all('.s3-memorable'), { opacity: 1 })
  }
  if (beat === 4) gsap.set(all('.s3-venn'), { opacity: 1 })
  if (beat === 5) gsap.set(all('.s3-reuse'), { opacity: 1 })
  if (beat === 6) gsap.set(all('.s3-benefits'), { opacity: 1 })
  if (beat === 7) {
    gsap.set(all('.s3-finale'), { opacity: 1 })
    gsap.set(all('.s3-immersive .s3-room-person'), { opacity: 0 })
  }
}

export function createScene03Timeline(root: HTMLElement, beat: number, audio: AudioManager, complete: () => void) {
  const all = (selector: string) => root.querySelectorAll(selector)
  const tl = gsap.timeline({ paused: true, onComplete: complete, defaults: { ease: 'power2.inOut' } })
  const duration = SCENE03_BEATS[beat].duration
  const cue = (name: Scene03AudioCueName, at: number) => tl.call(() => audio.cue(name, at), [], at)
  const draw = (selector: string, at: number, length = .7, stagger = .025) => {
    const paths = Array.from(all(selector)).flatMap(element => element.matches('.s3-draw,.s3-trace-line') ? [element] : Array.from(element.querySelectorAll('.s3-draw,.s3-trace-line')))
    paths.forEach(element => {
      const pathLength = (element as SVGGeometryElement).getTotalLength()
      gsap.set(element, { strokeDasharray: pathLength, strokeDashoffset: pathLength })
    })
    tl.to(paths, { strokeDashoffset: 0, duration: length, stagger, ease: 'none' }, at)
    if (paths.length) tl.call(() => audio.playSketch(length + stagger * (paths.length - 1)), [], at)
  }
  const write = (selector: string, at: number, length = .6) => {
    all(`${selector} .s3-writing-mask`).forEach(element => {
      gsap.set(element, { attr: { width: 0 } })
      tl.to(element, { attr: { width: Number((element as SVGElement).dataset.width) }, duration: length, ease: 'none' }, at)
    })
    if (all(`${selector} .s3-writing-mask`).length) tl.call(() => audio.playSketch(length), [], at)
  }
  const show = (selector: string, at = 0) => tl.set(all(selector), { opacity: 1 }, at)
  const fade = (selector: string) => tl.to(all(selector), { opacity: 0, duration: .4 }, 0)
  applyBeatLayout(root, Math.max(0, beat - 1))

  if (beat === 0) {
    gsap.set(all('.s3-sheet,.s3-trace,.s3-folio'), { opacity: 0 })
    gsap.set(all('.s3-trace'), { attr: { transform: 'translate(0 0) scale(1)' } })
    gsap.set(all('.s3-capture'), { display: 'block', opacity: 1 })
    gsap.set(all('.s3-capture img'), { opacity: 1, filter: 'grayscale(0) brightness(1)' })
    gsap.set(all('.s3-capture .reuse-title'), { opacity: 1 })
    tl.to(all('.s3-capture img'), { filter: 'grayscale(1) brightness(1.25)', duration: 1.1 }, 0)
    tl.to(all('.s3-capture .reuse-title'), { opacity: 0, duration: .55 }, .2)
    show('.s3-trace', .7)
    draw('.s3-trace', .7, .7, .001)
    tl.to(all('.s3-sheet'), { opacity: 1, duration: 1 }, .95)
    tl.to(all('.s3-capture img'), { opacity: 0, duration: .9 }, 1.15)
    tl.to(all('.s3-trace'), { attr: { transform: 'translate(224 150) scale(.72)' }, duration: .65 }, 2)
    tl.to(all('.s3-folio'), { opacity: 1, duration: .45 }, 2.1)
    cue('scene3_paper_transition', 0)
  }
  if (beat === 1) {
    fade('.s3-trace')
    show('.s3-comparison,.s3-traditional')
    gsap.set(all('.s3-immersive,.s3-comparison-arrow'), { opacity: 0 })
    draw('.s3-traditional', .3, .8, .035)
    write('.s3-traditional', 1.25, .75)
    cue('ink_draw', .3)
  }
  if (beat === 2) {
    tl.to(all('.s3-traditional'), { x: -400, duration: .8 }, 0)
    show('.s3-immersive', .2)
    show('.s3-comparison-arrow', .4)
    draw('.s3-immersive', .35, .8, .035)
    draw('.s3-comparison-arrow', .8, .6)
    write('.s3-immersive', 1.35, .8)
    cue('comparison_reveal', .35)
  }
  if (beat === 3) {
    fade('.s3-traditional,.s3-comparison-arrow,.s3-inside-label')
    tl.to(all('.s3-immersive'), { x: -370, y: -55, duration: .8 }, 0)
    show('.s3-memorable', .3)
    draw('.s3-senses', .65, .65, .05)
    write('.s3-memory-title', 1.25)
    write('.s3-memory-subtitle', 1.85)
    cue('memorable_reveal', 1.25)
  }
  if (beat === 4) {
    fade('.s3-comparison,.s3-memorable')
    show('.s3-venn', .3)
    draw('.s3-venn-circles', .4, .85, .08)
    draw('.s3-category-doodles', 1.1, .6, .03)
    write('.s3-venn', 1.3, .9)
    cue('venn_reveal', .4)
  }
  if (beat === 5) {
    fade('.s3-venn')
    show('.s3-reuse', .25)
    draw('.s3-reuse > .s3-room-drawing', .4, .7, .03)
    draw('.s3-branches', .85, .65, .09)
    draw('.s3-experience-concepts', 1, .65, .025)
    write('.s3-reuse', 1.55, 1.1)
    cue('experience_branch', .85)
  }
  if (beat === 6) {
    fade('.s3-reuse')
    show('.s3-benefits', .25)
    draw('.s3-benefit-students,.s3-benefit-families,.s3-benefit-museums', .4, .7, .018)
    draw('.s3-benefits > .s3-room-drawing', .75, .7, .025)
    draw('.s3-benefit-links', 1.2, .6)
    write('.s3-benefits', 1.5, .85)
    cue('benefit_reveal', .4)
  }
  if (beat === 7) {
    fade('.s3-benefits')
    gsap.set(all('.s3-traditional'), { x: -400 })
    gsap.set(all('.s3-immersive'), { x: 0, y: 0 })
    gsap.set(all('.s3-immersive .s3-room-person'), { opacity: 0 })
    show('.s3-comparison,.s3-traditional,.s3-immersive,.s3-comparison-arrow,.s3-inside-label,.s3-finale', .25)
    draw('.s3-comparison', .3, .65, .015)
    write('.s3-comparison', .85, .7)
    write('.s3-finale', 2.25, .7)
    const motion = { x: 830, y: 641, scale: 1, gait: 0 }
    const stepper = root.querySelector('.s3-stepper')!
    stepper.setAttribute('transform', 'translate(830 641) scale(1)')
    tl.to(motion, { x: 1120, y: 620, scale: .85, gait: 1, duration: 2.15,
      onUpdate: () => {
        const swing = Math.sin(motion.gait * Math.PI * 8)
        stepper.setAttribute('transform', `translate(${motion.x} ${motion.y - Math.abs(swing) * 2}) scale(${motion.scale})`)
        stepper.querySelector('.s3-arm-left')!.setAttribute('d', `M0-96L${swing * 14 - 8}-76 ${swing * 23 - 5}-56`)
        stepper.querySelector('.s3-arm-right')!.setAttribute('d', `M0-96L${8 - swing * 14}-76 ${5 - swing * 23}-56`)
        stepper.querySelector('.s3-leg-left')!.setAttribute('d', `M0-54L${-swing * 12}-29 ${-swing * 25} 0 ${-swing * 25 + 8} 0`)
        stepper.querySelector('.s3-leg-right')!.setAttribute('d', `M0-54L${swing * 12}-29 ${swing * 25} 0 ${swing * 25 + 8} 0`)
      },
    }, .65)
    cue('final_scrapbook_hold', 2.8)
  }
  const clock = { time: 0 }
  tl.to(clock, { time: duration, duration, ease: 'none' }, 0)
  return tl
}
