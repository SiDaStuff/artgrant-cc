import type { PrototypeHandoff } from '../scene04/handoff'

export interface VisionHandoff {
  prototype: PrototypeHandoff
  page: HTMLElement
  roomFrame: string | null
}
