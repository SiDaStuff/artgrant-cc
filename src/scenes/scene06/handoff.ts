import type { VisionHandoff } from '../scene05/handoff'
import type { VisionState } from '../scene05/state'
import type { RoomFeatures } from '../scene02/features'
import type { VisionWorlds } from '../scene05/worlds'

/** Transfer the active room layer itself, so the closing starts on the exact held frame. */
export interface ClosingHandoff {
  vision: VisionHandoff
  state: VisionState
  features: RoomFeatures | null
  worlds: VisionWorlds | null
  ambientTime: number
  outgoingTitle: HTMLElement
  outgoingShade: HTMLElement
}
