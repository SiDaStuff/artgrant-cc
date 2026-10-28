import * as THREE from 'three'
import { Reflector } from 'three/addons/objects/Reflector.js'
import { createRenderer } from '../../three/createRenderer'
import { createPostprocessing } from '../../three/postprocessing'

export interface PortalState { zoom: number; shiftX: number; shiftY: number; passage: number; push: number; wake: number; human: number }

const projectionVertex = `varying vec3 vWorld;
void main(){vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}`
const projectionFragment = `uniform float uTime;uniform float uWake;uniform float uEnvironment;varying vec3 vWorld;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 p=vec2(vWorld.x+vWorld.z*.35,vWorld.y);
  vec2 surface=abs(vWorld.x)>5.9?vec2(vWorld.z,vWorld.y):vec2(vWorld.x,vWorld.y);
  if(vWorld.y>4.45)surface=vec2(vWorld.x,vWorld.z*.7);
  float wave=sin(p.x*.38+uTime*.035)*.48+sin(p.x*.71-uTime*.022)*.17;
  float veil=exp(-pow((p.y-1.5-wave)*1.3,2.));
  float fine=pow(.5+.5*sin(p.y*15.+p.x*1.8+sin(p.x*.5+uTime*.025)*3.),18.);
  float glow=exp(-pow((p.x+1.5)*.14,2.))*veil;
  vec3 base=vec3(.036,.046,.041);
  vec3 sage=vec3(.19,.29,.23)*glow+vec3(.10,.15,.12)*fine*veil;
  vec3 warmth=vec3(.14,.105,.05)*exp(-pow((p.x-4.)*.32,2.))*veil;
  vec3 content=sage+warmth;
  if(uEnvironment>.001){
    vec2 q=surface;
    float caustic=pow(.5+.5*sin(q.x*1.65+sin(q.y*2.7+uTime*.10)*1.5+uTime*.055),6.);
    caustic*=.55+.45*sin(q.y*1.7-q.x*.4+uTime*.035);
    float depth=exp(-pow((q.y-2.8)*.43,2.));
    vec3 ocean=vec3(.018,.10,.16)*depth+vec3(.035,.17,.20)*caustic*depth;
    vec2 starCell=floor(q*17.);vec2 starUv=fract(q*17.)-.5;
    float stars=step(.984,hash(starCell))*exp(-dot(starUv,starUv)*130.);
    float cloud=pow(.5+.5*sin(q.x*.24+sin(q.y*.7)+uTime*.006),5.);
    vec3 space=vec3(.017,.025,.055)+vec3(.07,.055,.10)*cloud+stars*vec3(.6,.64,.57);
    vec2 organic=q*1.5+vec2(sin(q.y*1.7+uTime*.012),sin(q.x*1.3-uTime*.015))*.24;
    vec2 cell=floor(organic);vec2 uv=fract(organic)-.5;
    vec2 center=vec2(hash(cell)*2.-1.,hash(cell+13.7)*2.-1.)*.19;
    float radius=length((uv-center)*vec2(1.,.8+hash(cell+2.)*.5));
    float membrane=.16+hash(cell+4.)*.17;
    float ring=exp(-pow((radius-membrane)*25.,2.))*(.4+hash(cell+7.)*.6);
    vec3 micro=vec3(.018,.055,.045)+vec3(.065,.15,.09)*ring+vec3(.05,.09,.06)*exp(-radius*5.);
    content=mix(content,ocean,clamp(uEnvironment,0.,1.));
    content=mix(content,space,clamp(uEnvironment-1.,0.,1.));
    content=mix(content,micro,clamp(uEnvironment-2.,0.,1.));
    content=mix(content,sage+warmth,clamp(uEnvironment-3.,0.,1.));
  }
  gl_FragColor=vec4(base+uWake*content,1.);
}`

export function createRoom(container: HTMLElement) {
  const renderer = createRenderer(container)
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#101713')
  scene.fog = new THREE.FogExp2('#18221c', .022)
  const camera = new THREE.PerspectiveCamera(50, 16 / 9, .08, 70)
  camera.position.set(0, 1.7, 20.16)
  const post = createPostprocessing(renderer, scene, camera)
  let width = 1600, height = 900
  const matte = new THREE.MeshStandardMaterial({ color: '#242b26', roughness: .94 })
  const trim = new THREE.MeshStandardMaterial({ color: '#101612', roughness: .78, metalness: .2 })
  const warm = new THREE.MeshBasicMaterial({ color: '#afa586', toneMapped: false })
  const sage = new THREE.MeshBasicMaterial({ color: '#819786', toneMapped: false })
  const projection = new THREE.ShaderMaterial({
    vertexShader: projectionVertex, fragmentShader: projectionFragment,
    uniforms: { uTime: { value: 0 }, uWake: { value: 0 }, uEnvironment: { value: 0 } },
  })
  const leftProjection = projection.clone()
  const rightProjection = projection.clone()
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material = matte) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
    mesh.position.set(x, y, z)
    scene.add(mesh)
    return mesh
  }
  // A buildable 12 m × 15 m × 4.5 m room, with a 3 m wide entrance.
  box(12.4, .25, 15.4, 0, 4.625, -.5)
  box(.25, 4.5, 15.4, -6.125, 2.25, -.5)
  box(.25, 4.5, 15.4, 6.125, 2.25, -.5)
  box(12.4, 4.5, .25, 0, 2.25, -8.125)
  box(4.5, 4.5, .3, -3.75, 2.25, 7.15)
  box(4.5, 4.5, .3, 3.75, 2.25, 7.15)
  box(3.1, .25, .35, 0, 4.625, 7.12)
  box(.075, 4.5, .4, -1.54, 2.25, 7.1, trim)
  box(.075, 4.5, .4, 1.54, 2.25, 7.1, trim)
  // Seamless screen surfaces sit just inside their architectural walls.
  box(11.8, 3.95, .025, 0, 2.25, -7.975, projection)
  box(.025, 3.95, 14.75, -5.975, 2.25, -.45, leftProjection)
  box(.025, 3.95, 14.75, 5.975, 2.25, -.45, rightProjection)
  box(11.85, .035, .035, 0, .16, -7.94, sage)
  box(.035, .035, 14.8, -5.94, .16, -.5, sage)
  box(.035, .035, 14.8, 5.94, .16, -.5, sage)
  box(11.85, .018, .025, 0, 4.38, -7.94, warm)
  box(.025, .018, 14.8, -5.94, 4.38, -.5, warm)
  box(.025, .018, 14.8, 5.94, 4.38, -.5, warm)
  for (let z = -6; z <= 5; z += 3.5) {
    box(11.9, .12, .12, 0, 4.42, z, trim)
    for (const x of [-3.7, 3.7]) {
      box(.24, .055, .32, x, 4.38, z, trim)
      box(.12, .018, .17, x, 4.343, z, warm)
      const light = new THREE.SpotLight('#ded6b8', 10, 9, .55, .95, 1.8)
      light.position.set(x, 4.25, z)
      light.target.position.set(x * .7, 0, z - 1)
      scene.add(light, light.target)
    }
  }
  // Low-contrast real planar reflection, softened by a translucent matte floor.
  const reflector = new Reflector(new THREE.PlaneGeometry(12, 15), {
    color: 0x555f55, textureWidth: 768, textureHeight: 512, clipBias: .005,
  })
  reflector.rotation.x = -Math.PI / 2
  reflector.position.set(0, -.012, -.5)
  scene.add(reflector)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 15), new THREE.MeshStandardMaterial({
    color: '#202820', roughness: .45, metalness: .15, transparent: true, opacity: .88, depthWrite: false,
  }))
  floor.rotation.x = -Math.PI / 2
  floor.position.set(0, 0, -.5)
  scene.add(floor)
  const seam = new THREE.LineBasicMaterial({ color: '#4e5a4c', transparent: true, opacity: .11 })
  for (let x = -4; x <= 4; x += 2) {
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, .002, -8), new THREE.Vector3(x, .002, 7)]), seam)
    scene.add(line)
  }
  scene.add(new THREE.HemisphereLight('#c5d6bd', '#141a14', 1.15))
  const backlight = new THREE.PointLight('#9ebd9f', 17, 15, 2)
  backlight.position.set(0, 2.8, -6)
  scene.add(backlight)

  // A quiet, proportioned visitor provides human scale; no facial features.
  const visitor = new THREE.Group()
  const humanMaterial = new THREE.MeshStandardMaterial({ color: '#111713', roughness: .98, transparent: true, opacity: 0 })
  const head = new THREE.Mesh(new THREE.SphereGeometry(.112, 16, 12), humanMaterial)
  head.position.set(0, 1.56, 0)
  head.scale.set(.84, 1.15, .92)
  visitor.add(head)
  const contour = new THREE.Shape()
  contour.moveTo(-.065, 1.48)
  contour.lineTo(.065, 1.48)
  contour.quadraticCurveTo(.06, 1.40, .145, 1.40)
  contour.quadraticCurveTo(.23, 1.39, .25, 1.29)
  contour.lineTo(.29, .91)
  contour.quadraticCurveTo(.32, .76, .27, .74)
  contour.quadraticCurveTo(.22, .74, .23, .85)
  contour.lineTo(.17, 1.18)
  contour.lineTo(.145, .92)
  contour.quadraticCurveTo(.18, .83, .15, .67)
  contour.lineTo(.125, .10)
  contour.lineTo(.155, .035)
  contour.quadraticCurveTo(.15, -.01, .055, .02)
  contour.lineTo(.035, .65)
  contour.quadraticCurveTo(.015, .76, -.015, .65)
  contour.lineTo(-.045, .08)
  contour.quadraticCurveTo(-.035, 0, -.15, .02)
  contour.lineTo(-.16, .055)
  contour.lineTo(-.125, .12)
  contour.lineTo(-.16, .76)
  contour.lineTo(-.14, .92)
  contour.lineTo(-.17, 1.18)
  contour.lineTo(-.22, .90)
  contour.quadraticCurveTo(-.20, .76, -.26, .75)
  contour.quadraticCurveTo(-.31, .76, -.285, .91)
  contour.lineTo(-.245, 1.29)
  contour.quadraticCurveTo(-.235, 1.38, -.145, 1.40)
  contour.quadraticCurveTo(-.06, 1.40, -.065, 1.48)
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(contour, { depth: .13, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .012, bevelThickness: .025 }), humanMaterial)
  body.position.z = -.065
  visitor.add(body)
  visitor.position.set(-3.1, .02, -6.1)
  scene.add(visitor)

  // Sparse drifting dust, not a full projected show.
  const dustPositions = new Float32Array(85 * 3)
  for (let i = 0; i < 85; i++) {
    dustPositions[i * 3] = Math.sin(i * 97.3) * 5.7
    dustPositions[i * 3 + 1] = .3 + ((i * 17.37) % 3.8)
    dustPositions[i * 3 + 2] = -7 + ((i * 21.13) % 12)
  }
  const dustGeometry = new THREE.BufferGeometry()
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
  const dustMaterial = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 } },
    vertexShader: `uniform float uTime;varying float vAlpha;void main(){vec3 p=position;p.x+=sin(uTime*.05+position.y)*.09;p.y+=sin(uTime*.035+position.z)*.05;vec4 view=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*view;gl_PointSize=clamp(12./-view.z,1.,2.7);vAlpha=.3+.3*sin(position.x*3.);}`,
    fragmentShader: `uniform float uOpacity;varying float vAlpha;void main(){float a=smoothstep(.5,.08,length(gl_PointCoord-.5));gl_FragColor=vec4(.69,.76,.62,a*vAlpha*uOpacity);}`,
  })
  scene.add(new THREE.Points(dustGeometry, dustMaterial))

  let lastState: PortalState | null = null
  const setCamera = (state: PortalState) => {
    const distance = 4.5 / (2 * Math.tan(THREE.MathUtils.degToRad(25)) * (330 / 900)) / state.zoom
    const portalZ = 7 + distance
    camera.position.set(0, 1.7, THREE.MathUtils.lerp(portalZ, 2.6, state.passage) - state.push * 1.7)
    camera.rotation.set(0, 0, 0)
    const cx = (1190 + state.shiftX) / 1600 * width
    const cy = (475 + state.shiftY) / 900 * height
    const offsetX = (width / 2 - cx) * (1 - state.passage)
    const offsetY = (height / 2 - cy - .55 / (2 * distance * Math.tan(THREE.MathUtils.degToRad(25))) * height) * (1 - state.passage)
    camera.setViewOffset(width, height, offsetX, offsetY, width, height)
  }

  return {
    camera, scene,
    surfaces: { back: projection, left: leftProjection, right: rightProjection },
    accents: { warm, sage, backlight },
    visitor,
    humanGeometry: { head: head.geometry, body: body.geometry },
    attach(target: HTMLElement) { target.append(renderer.domElement) },
    setPostEffects(motionBlur: number, cameraFlash: number) { post.setEffects(motionBlur, cameraFlash) },
    postEffects() { return post.effects() },
    captureFrame() {
      post.render()
      return renderer.domElement.toDataURL('image/png')
    },
    render() { post.render() },
    /** Compile a newly attached digital layer before its first timed reveal. */
    prewarm() { renderer.compile(scene, camera) },
    stats() {
      return { drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles,
        geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures,
        pixelRatio: renderer.getPixelRatio() }
    },
    resize(w: number, h: number) {
      width = Math.max(1, w); height = Math.max(1, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      post.resize(width, height)
      if (lastState) setCamera(lastState)
    },
    update(time: number, state: PortalState) {
      lastState = state
      setCamera(state)
      for (const material of [projection, leftProjection, rightProjection]) {
        material.uniforms.uTime.value = time
        material.uniforms.uWake.value = state.wake
        material.uniforms.uEnvironment.value = 0
      }
      dustMaterial.uniforms.uTime.value = time
      dustMaterial.uniforms.uOpacity.value = state.wake * .55
      humanMaterial.opacity = state.human
      post.render()
    },
    updateAmbient(time: number, wake: number, human = 1) {
      dustMaterial.uniforms.uTime.value = time
      dustMaterial.uniforms.uOpacity.value = wake * .55
      humanMaterial.opacity = human
    },
    resetPresentation() {
      lastState = null
      camera.fov = 50
      camera.clearViewOffset()
      camera.updateProjectionMatrix()
      warm.color.set('#afa586')
      sage.color.set('#819786')
      backlight.color.set('#9ebd9f')
      backlight.intensity = 17
      for (const material of [projection, leftProjection, rightProjection]) material.uniforms.uEnvironment.value = 0
    },
    dispose() {
      post.dispose()
      reflector.getRenderTarget().dispose()
      const geometries = new Set<THREE.BufferGeometry>()
      const materials = new Set<THREE.Material>()
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          geometries.add(object.geometry)
          const list = Array.isArray(object.material) ? object.material : [object.material]
          list.forEach(material => materials.add(material))
        }
      })
      geometries.forEach(geometry => geometry.dispose())
      materials.forEach(material => material.dispose())
      scene.clear()
      renderer.renderLists.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    },
  }
}
export type ImmersiveRoom = ReturnType<typeof createRoom>
