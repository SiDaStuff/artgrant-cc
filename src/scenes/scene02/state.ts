export interface RoomState {
  cx: number; cy: number; cz: number
  tx: number; ty: number; tz: number; fov: number
  back: number; left: number; right: number; ceiling: number
  sound: number; lighting: number; hologram: number; visitors: number
  environment: number; hero: number; entryTitle: number
}

const start: RoomState = {
  cx: 0, cy: 1.7, cz: .9, tx: 0, ty: 1.7, tz: -6, fov: 50,
  back: .85, left: .85, right: .85, ceiling: 0,
  sound: 0, lighting: 0, hologram: 0, visitors: 0,
  environment: 0, hero: 0, entryTitle: 0,
}

export const beatStates: readonly RoomState[] = [
  start,
  { ...start, cx: -.45, cz: -.1, fov: 58, back: .08, left: .08, right: .08 },
  { ...start, cx: -1.2, cz: -.6, tx: -1.8, ty: 1.9, fov: 60, back: 1, left: .85, right: .35, ceiling: .65 },
  { ...start, cx: -.4, cz: -.25, tx: .6, ty: 1.9, fov: 60, back: .9, left: .7, right: .6, ceiling: .6, sound: 1 },
  { ...start, cx: .6, cz: .8, tx: .5, ty: 1.75, tz: -4.8, fov: 60, back: .85, left: .65, right: .6, ceiling: .7, sound: 1, lighting: 1, hologram: 1 },
  { ...start, cx: -4.75, cy: 2.45, cz: 5.8, tx: 0, ty: 1.4, tz: -2.8, fov: 65, back: .85, left: .65, right: .6, ceiling: .6, sound: 1, lighting: 1, hologram: 1, visitors: 1 },
  { ...start, cx: -4.75, cy: 2.45, cz: 5.8, tx: 0, ty: 1.4, tz: -2.8, fov: 65, back: .85, left: .75, right: .75, ceiling: .65, sound: 1, lighting: .8, hologram: .5, visitors: 1, hero: 1 },
  { ...start, cx: -4.75, cy: 2.45, cz: 5.8, tx: 0, ty: 1.4, tz: -2.8, fov: 65, back: .85, left: .75, right: .75, ceiling: .65, sound: 1, lighting: .8, hologram: .5, visitors: 1, hero: 1 },
]

export const initialRoomState = (): RoomState => ({ ...start, entryTitle: 1 })
