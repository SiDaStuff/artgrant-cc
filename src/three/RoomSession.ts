import type { ImmersiveRoom } from '../scenes/scene01/room'

/** Ownership of the existing WebGL canvas moves between scenes. */
export interface RoomSession {
  room: ImmersiveRoom | null
  canvas: HTMLCanvasElement | null
  ambientTime: number
}
