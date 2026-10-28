import * as THREE from 'three'
import type { ImmersiveRoom } from '../scene01/room'
import type { RoomState } from './state'

/** Removable feature layer: the walls, floor, entrance and ceiling never change. */
export function createRoomFeatures(room: ImmersiveRoom) {
  const group = new THREE.Group()
  group.name = 'scene02-features'
  room.scene.add(group)
  const geometry = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const own = <T extends THREE.Material>(material: T) => { materials.add(material); return material }
  const mesh = (w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material, parent = group) => {
    const shape = new THREE.BoxGeometry(w, h, d)
    geometry.add(shape)
    const object = new THREE.Mesh(shape, material)
    object.position.set(x, y, z)
    parent.add(object)
    return object
  }
  const graphite = own(new THREE.MeshStandardMaterial({ color: '#1a201c', roughness: .85 }))
  const hardware = new THREE.Group()
  group.add(hardware)
  // Discreet, ceiling-mounted projector bodies and lens apertures.
  const lensMaterial = own(new THREE.MeshBasicMaterial({ color: '#d3dfcb', transparent: true, opacity: 0 }))
  for (const x of [-2.5, 2.5]) {
    mesh(.035, .32, .035, x, 4.29, 1.5, graphite, hardware)
    mesh(.48, .19, .40, x, 4.04, 1.5, graphite, hardware)
    mesh(.15, .09, .015, x, 4.025, 1.29, lensMaterial, hardware)
  }

  const ceilingMaterial = own(room.surfaces.back.clone())
  const ceiling = mesh(11.7, .012, 14.7, 0, 4.48, -.45, ceilingMaterial)
  const speakerMaterial = own(new THREE.MeshStandardMaterial({ color: '#131b16', roughness: 1 }))
  const indicator = own(new THREE.MeshBasicMaterial({ color: '#b8c9ac', transparent: true, opacity: 0 }))
  const soundWaves = new THREE.Group()
  const waveMaterial = own(new THREE.LineBasicMaterial({ color: '#b6c5a9', transparent: true, opacity: 0, depthWrite: false }))
  group.add(soundWaves)
  for (const side of [-1, 1]) {
    for (const z of [-5.3, -.4, 4]) {
      mesh(.12, .63, .35, side * 5.89, 2.65, z, speakerMaterial)
      mesh(.015, .025, .23, side * 5.818, 2.42, z, indicator)
      for (let n = 0; n < 5; n++) mesh(.012, .018, .27, side * 5.82, 2.48 + n * .075, z, graphite)
      for (const radius of [.32, .49]) {
        const points = []
        for (let i = 0; i <= 26; i++) {
          const angle = -.85 + i / 26 * 1.7
          points.push(new THREE.Vector3(side * (5.78 - Math.cos(angle) * radius), 2.65 + Math.sin(angle) * radius, z))
        }
        const arcGeometry = new THREE.BufferGeometry().setFromPoints(points)
        geometry.add(arcGeometry)
        soundWaves.add(new THREE.Line(arcGeometry, waveMaterial))
      }
    }
  }

  // An anchored, transparent projection scrim provides a plausible display medium.
  const scrim = new THREE.Group()
  scrim.position.set(1.35, 0, -3.8)
  scrim.rotation.y = -.12
  group.add(scrim)
  const frameMaterial = own(new THREE.MeshStandardMaterial({ color: '#818b7d', roughness: .65, transparent: true, opacity: 0 }))
  const glassMaterial = own(new THREE.MeshPhysicalMaterial({ color: '#bbcab9', transparent: true, opacity: 0, roughness: .36, metalness: .08, side: THREE.DoubleSide, depthWrite: false }))
  mesh(.025, 2.85, .035, -1.53, 1.425, 0, frameMaterial, scrim)
  mesh(.025, 2.85, .035, 1.53, 1.425, 0, frameMaterial, scrim)
  mesh(3.08, .025, .035, 0, 2.85, 0, frameMaterial, scrim)
  for (const x of [-1.53, 1.53]) mesh(.34, .045, .42, x, .025, 0, frameMaterial, scrim)
  mesh(3, 2.77, .007, 0, 1.42, 0, glassMaterial, scrim)
  const fieldPositions = new Float32Array(48 * 22 * 3)
  for (let y = 0; y < 22; y++) for (let x = 0; x < 48; x++) {
    const index = (y * 48 + x) * 3
    fieldPositions[index] = (x / 47 - .5) * 2.65
    fieldPositions[index + 1] = (y / 21 - .5) * 1.25 + 1.48
    fieldPositions[index + 2] = .028
  }
  const fieldGeometry = new THREE.BufferGeometry()
  fieldGeometry.setAttribute('position', new THREE.BufferAttribute(fieldPositions, 3))
  geometry.add(fieldGeometry)
  const fieldMaterial = own(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 } },
    vertexShader: `uniform float uTime;varying float vAlpha;void main(){vec3 p=position;float edge=1.-pow(abs(p.x)/1.4,4.);p.y+=sin(p.x*3.4+uTime*.19+(position.y-1.48)*2.)*.22*edge;p.z+=sin(p.x*2.8+uTime*.12)*.015;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(21./-mv.z,1.3,3.1);vAlpha=edge*(.4+.6*pow(.5+.5*cos(position.y*6.+p.x*2.),2.));}`,
    fragmentShader: `uniform float uOpacity;varying float vAlpha;void main(){float a=smoothstep(.5,.04,length(gl_PointCoord-.5));gl_FragColor=vec4(.72,.82,.65,a*vAlpha*uOpacity);}`,
  }))
  scrim.add(new THREE.Points(fieldGeometry, fieldMaterial))

  // Thirty-two additional low-detail visitors use two draw calls, plus reflection.
  const crowdMaterial = own(new THREE.MeshStandardMaterial({ color: '#a8b2a1', roughness: .98, transparent: true, opacity: 0 }))
  const bodies = new THREE.InstancedMesh(room.humanGeometry.body, crowdMaterial, 32)
  const heads = new THREE.InstancedMesh(room.humanGeometry.head, crowdMaterial, 32)
  bodies.name = 'visitor-bodies'; heads.name = 'visitor-heads'
  bodies.frustumCulled = heads.frustumCulled = false
  group.add(bodies, heads)
  let seed = 1907
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
  const placements: { x: number; z: number; scale: number; angle: number }[] = []
  for (let attempt = 0; placements.length < 32 && attempt < 9000; attempt++) {
    const x = -4.85 + random() * 9.7, z = -6.25 + random() * 10.5
    if (z > 2 && Math.abs(x) < 1.3) continue // Circulation from the entrance.
    if (Math.hypot(x - 1.35, z + 3.8) < 2.1) continue // Clear area around the scrim.
    if (Math.hypot(x + 3.1, z + 6.1) < 1.1) continue
    if (placements.some(point => Math.hypot(point.x - x, point.z - z) < 1.15)) continue
    placements.push({ x, z, scale: .86 + random() * .22, angle: -.8 + random() * 1.6 })
  }
  const dummy = new THREE.Object3D()
  const colors = ['#333d36', '#525c50', '#696b5d', '#293a32', '#4c514b']
  placements.forEach((person, index) => {
    const scale = person.scale
    dummy.position.set(person.x, .015, person.z)
    dummy.rotation.set(0, person.angle, 0)
    dummy.scale.set(scale, scale, scale * 1.2)
    dummy.updateMatrix()
    const bodyOffset = new THREE.Matrix4().makeTranslation(0, 0, -.065)
    bodies.setMatrixAt(index, dummy.matrix.clone().multiply(bodyOffset))
    dummy.position.y = 1.56 * scale + .015
    dummy.scale.set(.84 * scale, 1.15 * scale, .92 * scale)
    dummy.updateMatrix()
    heads.setMatrixAt(index, dummy.matrix)
    bodies.setColorAt(index, new THREE.Color(colors[index % colors.length]))
    heads.setColorAt(index, new THREE.Color('#30382f'))
  })
  bodies.count = heads.count = placements.length
  bodies.instanceMatrix.needsUpdate = heads.instanceMatrix.needsUpdate = true
  const palette = [new THREE.Color('#9ebd9f'), new THREE.Color('#709fa5'), new THREE.Color('#9295af'), new THREE.Color('#93b993'), new THREE.Color('#9ebd9f')]
  const lightColor = new THREE.Color()
  let disposed = false

  return {
    visitorCount: placements.length + 1,
    visitorPositions: () => placements.map(person => ({ ...person })),
    update(time: number, state: RoomState) {
      if (disposed) return
      const surfaces = { ...room.surfaces, ceiling: ceilingMaterial }
      for (const key of ['back', 'left', 'right', 'ceiling'] as const) {
        surfaces[key].uniforms.uTime.value = time
        surfaces[key].uniforms.uWake.value = state[key]
        surfaces[key].uniforms.uEnvironment.value = state.environment
      }
      ceiling.visible = state.ceiling > .001
      lensMaterial.opacity = Math.max(state.back, state.left) * .65
      indicator.opacity = state.sound * .6
      soundWaves.visible = state.sound > .001
      waveMaterial.opacity = state.sound * (.075 + Math.sin(time * .6) * .014)
      scrim.visible = state.hologram > .001
      frameMaterial.opacity = state.hologram * .48
      glassMaterial.opacity = state.hologram * .055
      fieldMaterial.uniforms.uTime.value = time
      fieldMaterial.uniforms.uOpacity.value = state.hologram * .75
      bodies.visible = heads.visible = state.visitors > .001
      crowdMaterial.opacity = state.visitors
      crowdMaterial.depthWrite = state.visitors > .98
      const mode = Math.min(3.999, Math.max(0, state.environment))
      lightColor.lerpColors(palette[Math.floor(mode)], palette[Math.min(4, Math.floor(mode) + 1)], mode % 1)
      room.accents.backlight.color.copy(lightColor)
      room.accents.backlight.intensity = 17 + state.lighting * 10
      room.accents.sage.color.set('#819786').lerp(lightColor, state.lighting * .7)
      room.accents.warm.color.set('#afa586').lerp(lightColor, state.lighting * .5)
    },
    dispose() {
      if (disposed) return
      disposed = true
      group.removeFromParent()
      bodies.dispose(); heads.dispose()
      // Shared visitor geometries are owned and eventually disposed by the room.
      geometry.forEach(item => item.dispose())
      materials.forEach(item => item.dispose())
      group.clear()
      room.resetPresentation()
    },
  }
}
export type RoomFeatures = ReturnType<typeof createRoomFeatures>
