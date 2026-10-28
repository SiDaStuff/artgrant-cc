export interface VisionState {
  atom: number; ocean: number; body: number; space: number; history: number
  brightness: number; particles: number; cx: number; cy: number; cz: number
  tx: number; ty: number; tz: number; fov: number; final: number; hologram: number
  motionBlur: number; cameraFlash: number
}
const neutral: VisionState = {
  atom: 0, ocean: 0, body: 0, space: 0, history: 0, brightness: 1, particles: .12,
  cx: -2.4, cy: 2.15, cz: 4.8, tx: 0, ty: 2, tz: -4.5, fov: 61, final: 0, hologram: 0,
  motionBlur: 0, cameraFlash: 0,
}
export const worlds = [
  neutral,
  { ...neutral, atom: 1, particles: .9, cx: -.7, cy: 1.9, cz: 3.4, ty: 2.35, fov: 59 },
  { ...neutral, ocean: 1, particles: .75, cx: .65, cy: 1.85, cz: 3.6, ty: 2.35, fov: 61 },
  { ...neutral, body: 1, particles: .45, cx: -1.05, cy: 2, cz: 3.9, ty: 2.2, fov: 60 },
  { ...neutral, space: 1, particles: .55, cx: .1, cy: 1.8, cz: 3.4, ty: 2.3, fov: 60 },
  { ...neutral, history: 1, particles: .25, cx: -1.8, cy: 2.05, cz: 4.1, ty: 2.1, fov: 61 },
] satisfies VisionState[]
export const finalState: VisionState = { ...neutral, atom: .04, ocean: .13, space: .08, history: .03,
  particles: .16, cx: -3.9, cy: 2.45, cz: 5.9, ty: 1.55, fov: 63, final: 1 }
export const stableState = (beat: number): VisionState => ({ ...(beat === 6 ? finalState : worlds[beat]) })
export const entryState = (): VisionState => ({ ...neutral, cx: -4.75, cy: 2.45, cz: 5.8, ty: 1.4, tz: -2.8, fov: 65, hologram: .5 })
