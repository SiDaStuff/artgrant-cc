import type { AudioManager } from '../audio/AudioManager'

export interface SceneSnapshot {
  sceneId: string
  sceneName: string
  beat: number
  totalBeats: number
  beatName: string
  transitioning: boolean
  narration?: string
  nextNarration?: string
  elapsed: number
  duration: number
  phase: string
  holding: boolean
  camera: { x: number; y: number; z: number } | null
  details?: Record<string, number | string | boolean>
}

/** Direction of a queued navigation advance. */
export type FoldDirection = 1 | -1

export interface PresentationScene {
  readonly id: string
  readonly name: string
  readonly audio: AudioManager
  mount(container: HTMLElement): void
  play(atEnd?: boolean): void
  /**
   * Set by the controller. A scene calls this to request an immediate scene
   * change after finishing a queued advance/rewind that lands on a scene
   * boundary (its final or first beat). 1 = advance to the next scene,
   * -1 = return to the previous scene.
   */
  onSceneFold?(direction: FoldDirection): void
  nextBeat(): boolean
  previousBeat(): boolean
  restart(): void
  seek?(seconds: number): void
  seekBeat?(beat: number): void
  resize(width: number, height: number): void
  snapshot(): SceneSnapshot
  dispose(): void
}

