import * as THREE from 'three'
import type { RoomSession } from '../../three/RoomSession'
import type { ImmersiveRoom } from '../scene01/room'

export interface ScrapbookHandoff {
  session: RoomSession
  frame: string | null
  trace: string
}

export function stickFigure(x: number, y: number, scale = 1, extra = '') {
  return `<g class="s3-figure ${extra}" transform="translate(${x} ${y}) scale(${scale})" stroke-width="3.3">
    <path class="s3-draw" d="M-16-126C-17-152 18-154 20-128C23-101-14-100-16-126Z"/>
    <path class="s3-draw" d="M1-106Q-2-81 0-54"/>
    <path class="s3-draw s3-arm-left" d="M0-96L-17-76-13-56"/><path class="s3-draw s3-arm-right" d="M1-95L17-76 23-91"/>
    <path class="s3-draw s3-leg-left" d="M0-54L-11-28-17 0-25 0"/><path class="s3-draw s3-leg-right" d="M0-54L11-28 19 0 27 0"/>
  </g>`
}

/** Project real architectural edges and visitor positions using the held camera. */
export function traceRoom(room: ImmersiveRoom | null, people: { x: number; z: number; scale: number }[]) {
  if (!room) return `<path class="s3-trace-line" d="M210 230L1390 230 1390 720 210 720ZM210 230L470 360 1130 360 1390 230M470 360L470 600 1130 600 1130 360M210 720L470 600M1390 720L1130 600"/>`
  const camera = room.camera
  camera.updateMatrixWorld()
  room.scene.updateMatrixWorld(true)
  const project = (point: THREE.Vector3) => point.project(camera)
  const linePaths: string[] = []
  const clip = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1, dy = y2 - y1
    let begin = 0, end = 1
    for (const [p, q] of [[-dx, x1], [dx, 1600 - x1], [-dy, y1], [dy, 900 - y1]]) {
      if (Math.abs(p) < .00001) { if (q < 0) return null; continue }
      const ratio = q / p
      if (p < 0) begin = Math.max(begin, ratio)
      else end = Math.min(end, ratio)
      if (begin > end) return null
    }
    return [x1 + begin * dx, y1 + begin * dy, x1 + end * dx, y1 + end * dy]
  }
  // Direct children are the shared architecture; feature/crowd groups are traced separately.
  for (const object of room.scene.children) {
    if (!(object instanceof THREE.Mesh) || !(object.geometry instanceof THREE.BoxGeometry)) continue
    const edges = new THREE.EdgesGeometry(object.geometry, 35)
    const positions = edges.getAttribute('position')
    for (let i = 0; i < positions.count; i += 2) {
      const a = project(new THREE.Vector3().fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld))
      const b = project(new THREE.Vector3().fromBufferAttribute(positions, i + 1).applyMatrix4(object.matrixWorld))
      if (a.z < -1 || a.z > 1 || b.z < -1 || b.z > 1) continue
      if ((a.x < -1.2 && b.x < -1.2) || (a.x > 1.2 && b.x > 1.2) || (a.y < -1.2 && b.y < -1.2) || (a.y > 1.2 && b.y > 1.2)) continue
      const clipped = clip((a.x + 1) * 800, (1 - a.y) * 450, (b.x + 1) * 800, (1 - b.y) * 450)
      if (clipped) linePaths.push(`M${clipped[0].toFixed(1)} ${clipped[1].toFixed(1)}L${clipped[2].toFixed(1)} ${clipped[3].toFixed(1)}`)
    }
    edges.dispose()
  }
  const figures = [...people, { x: room.visitor.position.x, z: room.visitor.position.z, scale: 1 }].map(person => {
    const feet = project(new THREE.Vector3(person.x, .02, person.z))
    const top = project(new THREE.Vector3(person.x, 1.7 * person.scale, person.z))
    if (feet.z < -1 || feet.z > 1 || Math.abs(feet.x) > 1.1) return ''
    const height = Math.max(10, (top.y - feet.y) * 450)
    return stickFigure((feet.x + 1) * 800, (1 - feet.y) * 450, height / 150, 'traced-person')
  }).join('')
  const wavePaths: string[] = []
  for (const level of [1.25, 1.55]) {
    for (const surface of ['back', 'right', 'left']) {
      const points: string[] = []
      for (let i = 0; i <= 48; i++) {
        const along = surface === 'back' ? -5.7 + i / 48 * 11.4 : -7.6 + i / 48 * 13.8
        const point = project(new THREE.Vector3(surface === 'back' ? along : surface === 'right' ? 5.94 : -5.94, level + Math.sin(along * .38) * .28, surface === 'back' ? -7.94 : along))
        if (point.z < -1 || point.z > 1 || Math.abs(point.x) > 1 || Math.abs(point.y) > 1) continue
        points.push(`${points.length ? 'L' : 'M'}${((point.x + 1) * 800).toFixed(1)} ${((1 - point.y) * 450).toFixed(1)}`)
      }
      if (points.length > 1) wavePaths.push(points.join(' '))
    }
  }
  return `<g class="s3-trace-architecture" stroke-width="1.5">${linePaths.map(d => `<path class="s3-trace-line" d="${d}"/>`).join('')}</g><g class="s3-trace-projections" opacity=".3" stroke-width="1.3">${wavePaths.map(d => `<path class="s3-trace-line" d="${d}"/>`).join('')}</g><g class="s3-trace-visitors">${figures}</g>`
}
