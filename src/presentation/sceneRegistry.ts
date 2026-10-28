import type { PresentationScene } from './PresentationScene'
import type { RoomSession } from '../three/RoomSession'
import { Scene01 } from '../scenes/scene01/Scene01'
import { Scene02 } from '../scenes/scene02/Scene02'
import { Scene03 } from '../scenes/scene03/Scene03'
import { Scene04 } from '../scenes/scene04/Scene04'
import { Scene05 } from '../scenes/scene05/Scene05'
import { Scene06 } from '../scenes/scene06/Scene06'

/** Build only the prerequisite static handoffs. No predecessor animation is played. */
class SceneStartContext {
  readonly session: RoomSession
  private host: HTMLElement
  private width: number
  private height: number
  constructor(session: RoomSession, host: HTMLElement, width: number, height: number) {
    this.session = session; this.host = host; this.width = width; this.height = height
  }
  private prepare<T extends PresentationScene, H>(scene: T, release: (scene: T) => H): H {
    scene.mount(this.host)
    try { scene.resize(this.width, this.height); scene.play(true); return release(scene) }
    finally { scene.dispose() }
  }
  scrapbook() { return this.prepare(new Scene02(this.session), scene => scene.releaseForScrapbook()) }
  prototype() { return this.prepare(new Scene03(this.scrapbook()), scene => scene.releaseForPrototype()) }
  vision() { return this.prepare(new Scene04(this.prototype()), scene => scene.releaseForVision()) }
  closing() { return this.prepare(new Scene05(this.vision()), scene => scene.releaseForClosing()) }
}

interface SceneRegistration {
  create: (context: SceneStartContext) => PresentationScene
  release: (scene: PresentationScene) => RoomSession
}
function register<T extends PresentationScene>(create: (context: SceneStartContext) => T, release: (scene: T) => RoomSession): SceneRegistration {
  return { create, release: scene => release(scene as T) }
}
/** Future scenes 7–9 need one create/release entry; the keyboard handler stays generic. */
export const SCENE_REGISTRY = new Map<number, SceneRegistration>([
  [1, register(context => new Scene01(context.session), scene => scene.releaseRoom())],
  [2, register(context => new Scene02(context.session), scene => scene.releaseRoom())],
  [3, register(context => new Scene03(context.scrapbook()), scene => scene.releaseRoom())],
  [4, register(context => new Scene04(context.prototype()), scene => scene.releaseScrapbook().session)],
  [5, register(context => new Scene05(context.vision()), scene => scene.releasePrototype().scrapbook.session)],
  [6, register(context => new Scene06(context.closing()), scene => scene.releaseVision().prototype.scrapbook.session)],
])

/** Release only the shared architecture. Each exiting scene disposes its own effects. */
export function releaseRoomForJump(scene: PresentationScene): RoomSession {
  const registration = SCENE_REGISTRY.get(Number(scene.id.replace('scene', '')))
  if (!registration) throw new Error(`No room transfer registered for ${scene.id}`)
  return registration.release(scene)
}

export function createSceneStart(number: number, session: RoomSession, stage: HTMLElement) {
  const factory = SCENE_REGISTRY.get(number)
  if (!factory) throw new Error(`Scene ${number} not implemented`)
  session.ambientTime = 0
  const room = session.room
  if (room) {
    room.resetPresentation()
    room.camera.position.set(0, 1.7, 20.16); room.camera.rotation.set(0, 0, 0)
    for (const material of Object.values(room.surfaces)) {
      material.uniforms.uTime.value = 0; material.uniforms.uWake.value = 0
    }
    room.updateAmbient(0, 0, 0)
  }
  const host = document.createElement('div')
  host.className = 'scene-preparation'
  host.style.cssText = 'position:absolute;inset:0;visibility:hidden;pointer-events:none'
  stage.append(host)
  const { width, height } = stage.getBoundingClientRect()
  try { return factory.create(new SceneStartContext(session, host, width, height)) }
  finally { host.remove() }
}
