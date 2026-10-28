import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { ImmersiveRoom } from '../scene01/room'
import type { ClosingState } from './state'

/** Reversible finishing layer. The original room meshes and reflector are retained. */
export function createHeroDetails(room: ImmersiveRoom, visitorPositions: { x: number; z: number; scale: number; angle: number }[] = []) {
  const group = new THREE.Group(); group.name = 'scene06-hero-details'
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>(), instances: THREE.InstancedMesh[] = []
  const geo = <T extends THREE.BufferGeometry>(g: T) => { geometries.add(g); return g }
  const mat = <T extends THREE.Material>(m: T) => { materials.add(m); return m }
  const metal = mat(new THREE.MeshStandardMaterial({ color: '#202d35', roughness: .68, metalness: .38, transparent: true, opacity: 0 }))
  const edge = mat(new THREE.MeshBasicMaterial({ color: '#a0c8cf', transparent: true, opacity: 0, depthWrite: false, toneMapped: false }))
  const warm = mat(new THREE.MeshBasicMaterial({ color: '#d8c49a', transparent: true, opacity: 0, depthWrite: false }))
  // Merge static trim by material. These details used to be separate draw calls,
  // which the planar reflection then submitted a second time every frame.
  const boxParts = new Map<THREE.Material, THREE.BufferGeometry[]>()
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material) => {
    const part = new THREE.BoxGeometry(w, h, d)
    part.translate(x, y, z)
    const parts = boxParts.get(material) ?? []
    parts.push(part); boxParts.set(material, parts)
  }
  const mergeBoxes = () => boxParts.forEach((parts, material) => {
    const merged = mergeGeometries(parts, false)
    parts.forEach(part => part.dispose())
    if (!merged) return
    group.add(new THREE.Mesh(geo(merged), material))
  })
  const grain = new Uint8Array(128 * 128 * 4)
  let seed = 941
  for (let i = 0; i < 128 * 128; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    const value = 240 + (seed >>> 28)
    grain.set([value, value, value, 255], i * 4)
  }
  const texture = new THREE.DataTexture(grain, 128, 128)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(20, 8); texture.magFilter = THREE.LinearFilter
  texture.needsUpdate = true; textures.add(texture)
  const replacements: { mesh: THREE.Mesh; original: THREE.Material; clone: THREE.MeshStandardMaterial; color: THREE.Color; opacity: number }[] = []
  const clones = new Map<THREE.MeshStandardMaterial, THREE.MeshStandardMaterial>()
  room.scene.traverse(object => {
    if (!(object instanceof THREE.Mesh) || !(object.material instanceof THREE.MeshStandardMaterial)) return
    const original = object.material
    const floor = object.geometry instanceof THREE.PlaneGeometry && Math.abs(object.position.y) < .01
    const architecture = object.geometry instanceof THREE.BoxGeometry && (object.geometry.parameters.height > 4 || object.position.y > 4.5)
    if (!floor && !architecture) return
    let clone = clones.get(original)
    if (!clone) {
      clone = mat(original.clone()); clone.bumpMap = texture; clone.bumpScale = .008
      clone.roughnessMap = texture; clone.needsUpdate = true; clones.set(original, clone)
    }
    replacements.push({ mesh: object, original, clone, color: original.color.clone(), opacity: original.opacity })
    object.material = clone
  })
  room.scene.add(group)
  const baffleCount = 10
  const baffles = new THREE.InstancedMesh(geo(new THREE.BoxGeometry(.032, .065, 14.3)), metal, baffleCount)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < baffleCount; i++) {
    dummy.position.set(-5.45 + i * 10.9 / (baffleCount - 1), 4.34, -.5); dummy.updateMatrix(); baffles.setMatrixAt(i, dummy.matrix)
  }
  group.add(baffles); instances.push(baffles)
  for (const x of [-5.86, 5.86]) {
    box(.028, .045, 14.4, x, .11, -.45, edge)
    box(.024, .022, 14.4, x, 4.23, -.45, warm)
    for (const z of [-6, -2, 2, 5]) box(.025, 3.95, .035, x, 2.23, z, metal)
  }
  box(11.6, .025, .025, 0, 4.23, -7.87, warm)
  box(11.6, .045, .025, 0, .11, -7.87, edge)
  for (const x of [-2.5, 2.5]) box(.11, .035, .016, x, 4.025, 1.275, edge)
  mergeBoxes()

  // Soft projector cones and light pools; no shadow maps or volumetric ray march.
  const haze = mat(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uAmount: { value: 0 } },
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `uniform float uTime,uAmount;varying vec2 vUv;void main(){float density=pow(sin(vUv.x*3.14159),2.)*pow(1.-vUv.y,1.5);float veil=.75+.25*sin(vUv.y*12.+uTime*.09+sin(vUv.x*18.));gl_FragColor=vec4(.33,.53,.60,density*veil*.018*uAmount);}`,
  }))
  for (const x of [-2.5, 2.5]) {
    const cone = new THREE.Mesh(geo(new THREE.ConeGeometry(1.3, 3.8, 24, 1, true)), haze)
    cone.position.set(x, 2.1, .7); cone.rotation.x = -.15; group.add(cone)
  }
  const fill = new THREE.PointLight('#a2cbdb', 0, 8, 2); fill.position.set(1.3, 1.6, -4)
  const rim = new THREE.PointLight('#d4b988', 0, 12, 2); rim.position.set(-3.6, 2.9, -2.5)
  group.add(fill, rim)

  const plinth = new THREE.Mesh(geo(new THREE.CylinderGeometry(.49, .52, .06, 48)), metal)
  plinth.position.set(1.3, .035, -4); group.add(plinth)
  const halo = new THREE.Mesh(geo(new THREE.TorusGeometry(.45, .006, 6, 64)), edge)
  halo.rotation.x = Math.PI / 2; halo.position.set(1.3, .072, -4); group.add(halo)
  const fieldPositions = new Float32Array(720 * 3)
  for (let i = 0; i < 720; i++) {
    const phase = i / 720 * Math.PI * 22, height = (i * .6180339) % 1
    const radius = .2 + .48 * Math.sin(height * Math.PI)
    fieldPositions.set([Math.cos(phase) * radius, height * 2.8, Math.sin(phase) * radius * .5], i * 3)
  }
  const fieldGeometry = geo(new THREE.BufferGeometry()); fieldGeometry.setAttribute('position', new THREE.BufferAttribute(fieldPositions, 3))
  const fieldMaterial = mat(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uAmount: { value: 0 }, uFocus: { value: 0 } },
    vertexShader: `uniform float uTime,uFocus;varying float vAlpha;void main(){vec3 p=position;p.x+=sin(p.y*2.+uTime*.12)*(.08+uFocus*.04);p.z+=cos(p.y*2.+uTime*.12)*.08;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(16./-mv.z,1.,3.2);vAlpha=pow(sin(position.y/2.8*3.14159),.6)*(.3+.7*pow(.5+.5*sin(position.y*14.+position.x*7.),3.));}`,
    fragmentShader: `uniform float uAmount;varying float vAlpha;void main(){float a=exp(-dot(gl_PointCoord-.5,gl_PointCoord-.5)*20.);gl_FragColor=vec4(.53,.79,.85,a*vAlpha*uAmount*.65);}`,
  }))
  const field = new THREE.Points(fieldGeometry, fieldMaterial); field.position.set(1.3, .12, -4); group.add(field)

  // A few rounded, grounded figures replace the dense flat crowd during the settle.
  const bodyParts: THREE.BufferGeometry[] = []
  const capsule = (r: number, length: number, x: number, y: number, sx = 1, sz = 1, angle = 0) => {
    const g = new THREE.CapsuleGeometry(r, length, 4, 8); g.scale(sx, 1, sz); g.rotateZ(angle); g.translate(x, y, 0); bodyParts.push(g)
  }
  capsule(.16, .42, 0, 1.15, 1, .68); capsule(.14, .11, 0, .81, 1, .75)
  capsule(.063, .53, -.09, .335); capsule(.063, .53, .09, .335)
  capsule(.068, .045, -.09, .06, 1, 1.35); capsule(.068, .045, .09, .06, 1, 1.35)
  capsule(.053, .39, -.21, 1.10, 1, 1, -.12); capsule(.053, .39, .21, 1.10, 1, 1, .16)
  const bodyGeometry = geo(mergeGeometries(bodyParts)); bodyParts.forEach(g => g.dispose())
  const peopleMaterial = mat(new THREE.MeshStandardMaterial({ color: '#a9b7be', roughness: .86, transparent: true, opacity: 0 }))
  const headMaterial = mat(new THREE.MeshStandardMaterial({ color: '#726e64', roughness: .94, transparent: true, opacity: 0 }))
  const bodies = new THREE.InstancedMesh(bodyGeometry, peopleMaterial, 7)
  const heads = new THREE.InstancedMesh(geo(new THREE.SphereGeometry(.105, 12, 10)), headMaterial, 7)
  instances.push(bodies, heads); group.add(bodies, heads)
  const available = visitorPositions.slice()
  const desired = [[-2.8, -2.4], [-1.9, -2.2], [.1, -.2], [3.7, -4.7], [3.9, -2.8], [2.7, 1.6]]
  const people = [[-3.1, -6.1, 1, 0], ...desired.map(([x, z]) => {
    const best = available.reduce((best, person, index) =>
      Math.hypot(person.x - x, person.z - z) < Math.hypot(available[best].x - x, available[best].z - z) ? index : best, 0)
    const person = available.splice(best, 1)[0]
    return person ? [person.x, person.z, person.scale, person.angle] : [x, z, 1, 0]
  })]
  const coatColors = ['#27353e', '#38474d', '#625d50', '#293b44', '#51636b', '#363e46', '#686451']
  people.forEach(([x, z, scale, angle], i) => {
    dummy.position.set(x, .02, z); dummy.rotation.set(0, angle, 0); dummy.scale.setScalar(scale); dummy.updateMatrix(); bodies.setMatrixAt(i, dummy.matrix)
    bodies.setColorAt(i, new THREE.Color(coatColors[i])); dummy.position.y = 1.62 * scale
    dummy.scale.set(.87 * scale, 1.16 * scale, .97 * scale); dummy.updateMatrix(); heads.setMatrixAt(i, dummy.matrix)
  })
  const shadowMaterial = mat(new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
    uniforms: { uAmount: { value: 0 } },
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}',
    fragmentShader: 'varying vec2 vUv;uniform float uAmount;void main(){float a=exp(-dot((vUv-.5)*vec2(1.,1.2),(vUv-.5)*vec2(1.,1.2))*12.);gl_FragColor=vec4(.006,.012,.018,a*.65*uAmount);}',
  }))
  const shadows = new THREE.InstancedMesh(geo(new THREE.PlaneGeometry(.85, .65)), shadowMaterial, 7)
  people.forEach(([x, z], i) => {
    dummy.position.set(x, .008, z); dummy.rotation.set(-Math.PI / 2, 0, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); shadows.setMatrixAt(i, dummy.matrix)
  })
  group.add(shadows); instances.push(shadows)

  const pathPoints = [new THREE.Vector3(-1.1, .025, 3.8), new THREE.Vector3(-.3, .025, .8), new THREE.Vector3(1.4, .025, -2), new THREE.Vector3(2.7, .025, -5.8)]
  const pathMaterial = mat(new THREE.MeshBasicMaterial({ color: '#b1ccce', transparent: true, opacity: 0, depthWrite: false }))
  const path = new THREE.Mesh(geo(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pathPoints), 80, .009, 4, false)), pathMaterial)
  group.add(path)
  const markerGeometry = geo(new THREE.TorusGeometry(.16, .012, 6, 32))
  for (const point of pathPoints) { const marker = new THREE.Mesh(markerGeometry, pathMaterial); marker.rotation.x = -Math.PI / 2; marker.position.copy(point); group.add(marker) }
  const darkBlue = new THREE.Color('#15232e'), floorBlue = new THREE.Color('#26343c')
  const originalVisitorVisible = room.visitor.visible
  let disposed = false
  return {
    visitorCount: 7,
    anchors: () => pathPoints.map(point => {
      const projected = point.clone().project(room.camera); return { x: (projected.x + 1) * 800, y: (1 - projected.y) * 450 }
    }),
    update(time: number, state: ClosingState) {
      const a = state.detail
      // Keep the light configuration resident throughout the handoff; zero-alpha
      // details must never write depth over the outgoing frame.
      metal.depthWrite = a > .98
      room.visitor.visible = originalVisitorVisible && a < .98
      metal.opacity = a; edge.opacity = a * (.48 + state.focus * .22); warm.opacity = a * .44
      peopleMaterial.opacity = headMaterial.opacity = a
      peopleMaterial.depthWrite = headMaterial.depthWrite = a > .98
      haze.uniforms.uTime.value = time; haze.uniforms.uAmount.value = a
      fieldMaterial.uniforms.uTime.value = time; fieldMaterial.uniforms.uAmount.value = a
      fieldMaterial.uniforms.uFocus.value = state.focus
      shadowMaterial.uniforms.uAmount.value = a
      fill.intensity = a * (15 + state.focus * 8); rim.intensity = a * 22
      pathMaterial.opacity = a * state.pathway * .65
      for (const item of replacements) {
        const floor = item.clone.transparent
        item.clone.color.copy(item.color).lerp(floor ? floorBlue : darkBlue, a * .7)
        item.clone.opacity = floor ? item.opacity - a * .23 : item.opacity
        item.clone.bumpScale = .008 * a
      }
    },
    dispose() {
      if (disposed) return; disposed = true
      replacements.forEach(({ mesh, original }) => { mesh.material = original })
      room.visitor.visible = originalVisitorVisible
      group.removeFromParent(); group.clear(); instances.forEach(item => item.dispose())
      geometries.forEach(item => item.dispose()); materials.forEach(item => item.dispose()); textures.forEach(item => item.dispose())
    },
  }
}
export type HeroDetails = ReturnType<typeof createHeroDetails>
