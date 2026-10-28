import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Fully synthesized, deterministic 48 kHz stereo impact cues. The generator
// uses decaying frequency sweeps, sub oscillators, resonant partials and shaped
// noise. It reads no source audio, so these files contain no sampled booms.
const sampleRate = 48_000
const outDir = resolve('public/audio/approved')
const presets = [
  { file: 'impact-room-reveal.wav', duration: 3.25, sub: [40, 22, 1.15], body: [174, 54, .72], ring: [620, 255, .42], noise: .12, tail: .34, stereo: .06 },
  { file: 'impact-scene2-arrival.wav', duration: 2.8, sub: [38, 24, .92], body: [146, 48, .58], ring: [480, 185, .33], noise: .09, tail: .25, stereo: .08 },
  { file: 'impact-room-reuse.wav', duration: 2.5, sub: [42, 26, .78], body: [210, 66, .48], ring: [760, 310, .3], noise: .08, tail: .2, stereo: .1 },
  { file: 'impact-atom.wav', duration: 2.5, sub: [48, 27, .72], body: [230, 62, .62], ring: [1040, 285, .42], noise: .2, tail: .23, stereo: .12 },
  { file: 'impact-ocean.wav', duration: 2.65, sub: [34, 20, 1.25], body: [124, 39, .72], ring: [350, 135, .55], noise: .32, tail: .4, stereo: .22, soft: true },
  { file: 'impact-body.wav', duration: 2.5, sub: [40, 24, .75], body: [106, 42, .5], ring: [285, 110, .46], noise: .08, tail: .18, stereo: .04, secondPulse: .58 },
  { file: 'impact-black-hole.wav', duration: 3.8, sub: [26, 14, 2.3], body: [92, 27, 1.8], ring: [220, 58, 1.4], noise: .22, tail: .82, stereo: .24, dark: true },
  { file: 'impact-rome-stone.wav', duration: 2.6, sub: [48, 25, .88], body: [196, 62, .55], ring: [830, 360, .72], noise: .42, tail: .27, stereo: .1, hard: true },
  { file: 'impact-prototype-launch.wav', duration: 3.8, sub: [44, 20, 1.55], body: [205, 45, .92], ring: [530, 155, .78], noise: .34, tail: .58, stereo: .16, launch: true },
  { file: 'impact-closing-arrival.wav', duration: 3.1, sub: [38, 22, 1.12], body: [156, 47, .75], ring: [460, 175, .6], noise: .17, tail: .42, stereo: .12 },
  { file: 'impact-grant-reveal.wav', duration: 2.4, sub: [46, 26, .66], body: [188, 60, .48], ring: [690, 280, .35], noise: .12, tail: .2, stereo: .06 },
  { file: 'impact-final-resolution.wav', duration: 3.4, sub: [34, 19, 1.55], body: [132, 34, 1.05], ring: [390, 118, .84], noise: .2, tail: .57, stereo: .16 },
]

function xorshift(seed) {
  let x = seed >>> 0
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5
    return (x >>> 0) / 0x1_0000_0000 * 2 - 1
  }
}

function sweep(t, [start, end, decay], scale = 1) {
  const k = 5 / decay
  const phase = 2 * Math.PI * (end * t + (start - end) * (1 - Math.exp(-k * t)) / k)
  return Math.sin(phase) * Math.exp(-t / decay) * scale
}

function writeWave(preset, presetIndex) {
  const count = Math.round(sampleRate * preset.duration)
  const data = Buffer.allocUnsafe(count * 4)
  const randomL = xorshift(0x51f15e + presetIndex * 0x9e3779b9)
  const randomR = xorshift(0x29a7b31 + presetIndex * 0x85ebca6b)
  let noiseL = 0, noiseR = 0
  const norm = 0.9 / (0.42 + preset.noise + (preset.hard ? .16 : 0))
  for (let i = 0; i < count; i++) {
    const t = i / sampleRate
    const attack = 1 - Math.exp(-t * (preset.soft ? 18 : 52))
    const pulse = offset => {
      const local = t - offset
      return local < 0 ? 0 : sweep(local, preset.sub, .44) + sweep(local, preset.body, .4) + sweep(local, preset.ring, preset.hard ? .18 : .12)
    }
    let hit = pulse(0)
    if (preset.secondPulse) hit += pulse(preset.secondPulse) * .62
    const noiseInL = randomL(), noiseInR = randomR()
    noiseL += .11 * (noiseInL - noiseL)
    noiseR += .11 * (noiseInR - noiseR)
    const noiseEnv = Math.exp(-t * (preset.hard ? 9 : preset.soft ? 2.3 : 4.5)) * attack
    let left = hit + (noiseInL - noiseL * .72) * preset.noise * noiseEnv
    let right = hit + (noiseInR - noiseR * .72) * preset.noise * noiseEnv
    if (preset.launch) {
      const rise = Math.max(0, Math.min(1, (t - .5) / .75))
      const phase = 2 * Math.PI * (68 * t + 85 * t * t * .5)
      const swell = Math.sin(phase) * rise * Math.exp(-Math.max(0, t - 1.25) / .68) * .12
      left += swell; right += swell
    }
    const pan = Math.sin(t * 2.2) * preset.stereo
    left = Math.tanh((left + hit * pan) * norm)
    right = Math.tanh((right - hit * pan) * norm)
    data.writeInt16LE(Math.round(left * 32767), i * 4)
    data.writeInt16LE(Math.round(right * 32767), i * 4 + 2)
  }
  const header = Buffer.alloc(44)
  header.write('RIFF', 0); header.writeUInt32LE(36 + data.length, 4); header.write('WAVE', 8)
  header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20)
  header.writeUInt16LE(2, 22); header.writeUInt32LE(sampleRate, 24); header.writeUInt32LE(sampleRate * 4, 28)
  header.writeUInt16LE(4, 32); header.writeUInt16LE(16, 34); header.write('data', 36); header.writeUInt32LE(data.length, 40)
  writeFileSync(resolve(outDir, preset.file), Buffer.concat([header, data]))
}

mkdirSync(outDir, { recursive: true })
presets.forEach(writeWave)
process.stdout.write(`Generated ${presets.length} original impact WAVs in ${outDir}\n`)
