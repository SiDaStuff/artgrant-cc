import * as THREE from 'three'
import type { ImmersiveRoom } from '../scene01/room'
import type { VisionState } from './state'
import { projectionVertex, projectionFragment } from './projections'

export function createVisionWorlds(room: ImmersiveRoom) {
  const group = new THREE.Group()
  group.name = 'scene05-digital-experiences'
  room.scene.add(group)
  const geometry = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const own = <T extends THREE.Material>(m: T) => { materials.add(m); return m }
  const shape = <T extends THREE.BufferGeometry>(g: T) => { geometry.add(g); return g }
  const uniforms = {
    uTime: { value: 0 }, uAtom: { value: 0 }, uOcean: { value: 0 }, uBody: { value: 0 },
    uSpace: { value: 0 }, uHistory: { value: 0 }, uBrightness: { value: 1 }, uFinal: { value: 0 },
    uClosing: { value: 0 }, uFocus: { value: 0 },
  }
  const projection = own(new THREE.ShaderMaterial({ vertexShader: projectionVertex, fragmentShader: projectionFragment, uniforms }))
  const replaced: { mesh: THREE.Mesh; material: THREE.Material }[] = []
  room.scene.traverse(object => {
    if (object instanceof THREE.Mesh && Object.values(room.surfaces).includes(object.material as THREE.ShaderMaterial)) {
      replaced.push({ mesh: object, material: object.material as THREE.Material })
      object.material = projection
    }
  })
  const ceiling = new THREE.Mesh(shape(new THREE.PlaneGeometry(11.7, 14.7)), projection)
  ceiling.position.set(0, 4.47, -.45)
  ceiling.rotation.x = Math.PI / 2
  group.add(ceiling)

  const positions = new Float32Array(1250 * 3)
  for (let i = 0; i < 1250; i++) {
    positions[i * 3] = Math.sin(i * 127.13) * 5.65
    positions[i * 3 + 1] = .3 + ((i * 1.6180339) % 3.95)
    positions[i * 3 + 2] = -7.7 + ((i * 2.41421356) % 13.8)
  }
  const particleGeometry = shape(new THREE.BufferGeometry())
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particles = own(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: .1 }, uOcean: { value: 0 }, uBody: { value: 0 }, uColor: { value: new THREE.Color('#9ecbdd') } },
    vertexShader: `uniform float uTime,uOcean,uBody;varying float vAlpha;
      void main(){vec3 p=position;p.x+=sin(uTime*.09+position.z)*.16;
      p.y+=sin(uTime*.1+position.x)*.10-uOcean*sin(uTime*.07+position.z)*.09;
      p.z+=sin(uTime*.08+position.y)*.19;
      vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
      gl_PointSize=clamp((11.+uBody*9.)/-mv.z,1.,5.);
      vAlpha=(.2+.65*pow(.5+.5*sin(position.z*12.4),2.))*smoothstep(.1,.8,-mv.z);}`,
    fragmentShader: `uniform float uOpacity;uniform vec3 uColor;varying float vAlpha;
      void main(){float a=exp(-dot(gl_PointCoord-.5,gl_PointCoord-.5)*20.);gl_FragColor=vec4(uColor,a*vAlpha*uOpacity);}`,
  }))
  const points = new THREE.Points(particleGeometry, particles)
  points.frustumCulled = false
  group.add(points)

  // Irregular open energy strands: no neat textbook electron orbits.
  const ribbons: THREE.Mesh[] = []
  const ribbonMaterial = own(new THREE.MeshBasicMaterial({ color: '#74c8ed', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }))
  for (let strand = 0; strand < 4; strand++) {
    const points: THREE.Vector3[] = []
    for (let i = 0; i <= 80; i++) {
      const a = i / 80 * 2 - 1
      points.push(new THREE.Vector3(a * 5.65,
        2.45 + Math.sin(a * 2.1 + strand * 1.45) * .95 + Math.sin(a * 6.2 + strand) * .14,
        -5.3 + Math.sin(a * 2.8 + strand * 1.7) * 1.65 + Math.cos(a * 4.4) * .21))
    }
    const ribbon = new THREE.Mesh(shape(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 96, .012, 4, false)), ribbonMaterial)
    ribbons.push(ribbon)
    group.add(ribbon)
  }
  const cellMaterial = own(new THREE.MeshStandardMaterial({ color: '#c55c65', emissive: '#441923', emissiveIntensity: .45, roughness: .5, transparent: true, opacity: 0 }))
  const cellGeometry = shape(new THREE.LatheGeometry([
    new THREE.Vector2(0, .008), new THREE.Vector2(.025, .009), new THREE.Vector2(.06, .025),
    new THREE.Vector2(.085, .032), new THREE.Vector2(.103, .021), new THREE.Vector2(.11, 0),
    new THREE.Vector2(.103, -.021), new THREE.Vector2(.085, -.032), new THREE.Vector2(.06, -.025),
    new THREE.Vector2(.025, -.009), new THREE.Vector2(0, -.008),
  ], 16))
  const cells = new THREE.InstancedMesh(cellGeometry, cellMaterial, 76)
  cells.frustumCulled = false
  cells.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  group.add(cells)
  const dummy = new THREE.Object3D()
  const palette = ['#8da799', '#73bfe7', '#3299ad', '#c67b86', '#aba5cf', '#dfac73'].map(c => new THREE.Color(c))
  const color = new THREE.Color()
  const oldFog = room.scene.fog
  const oldBackground = room.scene.background
  room.scene.fog = new THREE.FogExp2('#071018', .018)
  room.scene.background = new THREE.Color('#070e12')
  const lights: { light: THREE.Light; intensity: number; color: THREE.Color }[] = []
  room.scene.traverse(object => {
    if (object instanceof THREE.Light) lights.push({ light: object, intensity: object.intensity, color: object.color.clone() })
  })
  let disposed = false
  return {
    refine(amount: number, focus: number) { uniforms.uClosing.value = amount; uniforms.uFocus.value = focus },
    update(time: number, state: VisionState) {
      uniforms.uTime.value = time
      uniforms.uAtom.value = state.atom; uniforms.uOcean.value = state.ocean
      uniforms.uBody.value = state.body; uniforms.uSpace.value = state.space
      uniforms.uHistory.value = state.history; uniforms.uBrightness.value = state.brightness; uniforms.uFinal.value = state.final
      color.copy(palette[0])
      for (const [i, weight] of [state.atom, state.ocean, state.body, state.space, state.history].entries()) color.lerp(palette[i + 1], weight)
      for (const { light, intensity } of lights) {
        const spaceDark = 1 - state.space * .67
        light.intensity = intensity * (.52 + state.final * .12) * spaceDark * state.brightness
        light.color.copy(color)
      }
      room.accents.backlight.intensity = (24 + state.atom * 9 + state.history * 6) * state.brightness
      room.accents.sage.color.copy(color).multiplyScalar(.52 * state.brightness)
      room.accents.warm.color.copy(color).multiplyScalar((.45 - state.space * .22) * state.brightness)
      particles.uniforms.uTime.value = time
      particles.uniforms.uOpacity.value = state.particles * state.brightness
      particles.uniforms.uOcean.value = state.ocean; particles.uniforms.uBody.value = state.body
      particles.uniforms.uColor.value.copy(color)
      ribbonMaterial.opacity = state.atom * .42 * state.brightness
      ribbons.forEach((ribbon, index) => { ribbon.visible = state.atom > .005; ribbon.rotation.z = Math.sin(time * .055 + index) * .025 })
      cells.visible = state.body > .005
      cellMaterial.opacity = state.body * .78 * state.brightness
      if (cells.visible) {
        for (let i = 0; i < 76; i++) {
          const travel = (i * .6180339 + time * .035) % 1
          dummy.position.set(Math.sin(i * 3.73 + time * .06) * 4.7,
            1.1 + Math.sin(i * 1.13 + travel * 4.) * .75 + travel * 1.8, -7.6 + travel * 13.)
          dummy.rotation.set(i * 1.37 + time * .12, i * .71 + time * .08, i * 2.3)
          const s = (.7 + (i % 7) * .16) * Math.min(1, travel * 12, (1 - travel) * 12)
          dummy.scale.set(s, s, s * .5)
          dummy.updateMatrix(); cells.setMatrixAt(i, dummy.matrix)
        }
        cells.instanceMatrix.needsUpdate = true
      }
    },
    dispose() {
      if (disposed) return
      disposed = true
      replaced.forEach(({ mesh, material }) => { mesh.material = material })
      lights.forEach(({ light, intensity, color }) => { light.intensity = intensity; light.color.copy(color) })
      room.scene.fog = oldFog; room.scene.background = oldBackground
      cells.dispose()
      group.removeFromParent(); group.clear()
      geometry.forEach(g => g.dispose()); materials.forEach(m => m.dispose())
      room.resetPresentation()
    },
  }
}
export type VisionWorlds = ReturnType<typeof createVisionWorlds>
