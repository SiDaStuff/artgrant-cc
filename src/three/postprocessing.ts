import { Vector2, type WebGLRenderer, type Scene, type Camera } from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'

export function createPostprocessing(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
  const composer = new EffectComposer(renderer)
  const render = new RenderPass(scene, camera)
  const bloom = new UnrealBloomPass(new Vector2(800, 450), .18, .6, .85)
  const motionBlur = new AfterimagePass(0)
  const cameraFlash = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, strength: { value: 0 } },
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform sampler2D tDiffuse;uniform float strength;varying vec2 vUv;
      void main(){vec4 frame=texture2D(tDiffuse,vUv);gl_FragColor=vec4(mix(frame.rgb,vec3(1.),clamp(strength,0.,1.)),frame.a);}`,
  })
  const output = new OutputPass()
  composer.addPass(render)
  composer.addPass(bloom)
  // Temporal frame history creates visible trails during fast camera motion.
  composer.addPass(motionBlur)
  composer.addPass(cameraFlash)
  composer.addPass(output)
  renderer.info.autoReset = false
  let blurStrength = 0, flashStrength = 0
  return {
    setEffects(blur: number, flash: number) {
      blurStrength = Math.max(0, Math.min(1, blur))
      flashStrength = Math.max(0, Math.min(1, flash))
      motionBlur.damp = blurStrength * .76
      cameraFlash.uniforms.strength.value = flashStrength
    },
    effects: () => ({ motionBlur: blurStrength, cameraFlash: flashStrength,
      temporalDamp: motionBlur.damp, flashUniform: cameraFlash.uniforms.strength.value as number }),
    render: () => { renderer.info.reset(); composer.render() },
    resize: (width: number, height: number) => composer.setSize(width, height),
    dispose: () => { bloom.dispose(); motionBlur.dispose(); cameraFlash.dispose(); output.dispose(); render.dispose(); composer.dispose() },
  }
}
