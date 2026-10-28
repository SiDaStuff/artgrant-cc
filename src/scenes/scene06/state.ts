import { finalState, type VisionState } from '../scene05/state'

export interface ClosingState extends VisionState { shade: number; warmth: number; detail: number; focus: number; pathway: number }
export const closingEntry = (): ClosingState => ({ ...finalState, shade: 0, warmth: 0, detail: 0, focus: 0, pathway: 0 })
const hero: ClosingState = { ...finalState, atom: 0, ocean: 0, body: 0, space: 0, history: 0,
  brightness: 1.08, particles: .045, cx: -3.85, cy: 2.5, cz: 6.3, tx: .4, ty: 1.75, tz: -4.8,
  fov: 60, final: .15, shade: .18, warmth: 1, detail: 1, focus: .45, pathway: 0 }
export const closingStates: readonly ClosingState[] = [
  hero,
  { ...hero, shade: .32, focus: 1 },
  { ...hero, shade: .28, cx: -3.65, focus: .7, pathway: 1 },
  { ...hero, cx: -4.1, cy: 2.65, cz: 6.7, fov: 61, shade: .28, focus: .55 },
  { ...hero, cx: -3.3, cy: 2.35, cz: 5.8, fov: 58.8, shade: .32, focus: .8 },
  { ...hero, cx: -3.3, cy: 2.35, cz: 5.8, fov: 58.8, brightness: .92, shade: .38, focus: 1 },
]
