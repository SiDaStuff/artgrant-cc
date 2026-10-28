import { ACESFilmicToneMapping, SRGBColorSpace, WebGLRenderer } from 'three'

export function createRenderer(container: HTMLElement) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  container.append(renderer.domElement)
  return renderer
}
