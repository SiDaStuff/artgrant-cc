import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const audioSource = await readFile(resolve('src/audio/AudioManager.ts'), 'utf8')
const generatorSource = await readFile(resolve('scripts/generate-impact-sfx.mjs'), 'utf8')
for (const [approved, supplied] of [
  ['bass-drop-new-1.mp3', 'bass drop new 1.mp3'],
  ['bass-drop-new-2.mp3', 'bass drop new 2.mp3'],
  ['bass-drop-new-3.mp3', 'bass drop new 3.mp3'],
]) {
  assert.deepEqual(await readFile(resolve('public/audio/approved', approved)), await readFile(resolve(supplied)),
    `${approved} is an unchanged copy of the presenter-supplied file`)
}
const impactMappings = [...audioSource.matchAll(/^\s+(\w+): \{ file: '([^']+)', channel: 'impact'/gm)]
assert.equal(impactMappings.length, 12, 'Every impact cue has an explicit asset mapping')
assert.equal(new Set(impactMappings.map(([, , file]) => file)).size, impactMappings.length, 'Impact cues have unique designs')
assert.doesNotMatch(audioSource, /deep-impact\.mp3|(?:^|\/)boom\.mp3|bass-drop\.mp3|big-bass-drop\.mp3/, 'Runtime no longer uses sampled boom sources')

for (const [, cue, file] of impactMappings) {
  const asset = await readFile(resolve('public/audio/approved', file))
  if (file.endsWith('.mp3')) {
    assert(asset.length > 10_000, `${cue} MP3 is present and non-empty`)
    const hasId3 = asset.toString('ascii', 0, 3) === 'ID3'
    const hasMpegFrame = asset[0] === 0xff && (asset[1] & 0xe0) === 0xe0
    assert(hasId3 || hasMpegFrame, `${cue} has a recognizable MP3 header`)
    continue
  }
  assert(generatorSource.includes(`file: '${file}'`), `${file} is reproducible from the generator`)
  const wave = asset
  assert.equal(wave.toString('ascii', 0, 4), 'RIFF', `${cue} has a valid RIFF header`)
  assert.equal(wave.toString('ascii', 8, 12), 'WAVE', `${cue} is a WAV file`)
  assert.equal(wave.readUInt32LE(24), 48_000, `${cue} uses 48 kHz audio`)
  assert.equal(wave.readUInt16LE(22), 2, `${cue} is stereo`)
  assert.equal(wave.readUInt16LE(34), 16, `${cue} uses 16-bit PCM`)
  const dataSize = wave.readUInt32LE(40)
  assert.equal(dataSize, wave.length - 44, `${cue} has a complete PCM payload`)
  const duration = dataSize / (48_000 * 2 * 2)
  assert(duration >= 2.3 && duration <= 4, `${cue} duration is tailored to its impact (${duration.toFixed(2)} s)`)
  let peak = 0, sumSquares = 0, count = dataSize / 2
  for (let offset = 44; offset < wave.length; offset += 2) {
    const sample = wave.readInt16LE(offset) / 32768
    peak = Math.max(peak, Math.abs(sample)); sumSquares += sample * sample
  }
  const rms = Math.sqrt(sumSquares / count)
  assert(peak < .995 && peak > .05, `${cue} has headroom without silence (peak ${peak.toFixed(3)})`)
  assert(rms > .015 && rms < .4, `${cue} has a controlled average level (RMS ${rms.toFixed(3)})`)
}

assert.match(audioSource, /blackhole_sub_hit: \{ file: 'bass-drop-new-1\.mp3', channel: 'impact', gain: \.34 \}/)
assert.match(audioSource, /scene5_enter: \{ file: 'bass-drop-new-2\.mp3', channel: 'impact', gain: \.33 \}/)
assert.match(audioSource, /final_resolution: \{ file: 'bass-drop-new-3\.mp3', channel: 'impact', gain: \.95 \}/)

assert.match(audioSource, /musicForScene = \(scene: string\) => scene === 'scene06' \? 'closing-proposal\.mp3' : 'main-exhibit-bed\.mp3'/)
assert.doesNotMatch(audioSource, /montage|synthwave-bed/i, 'Montage audio routing is removed')
const scene05Source = await readFile(resolve('src/scenes/scene05/Scene05.ts'), 'utf8')
const scene05Cues = await readFile(resolve('src/scenes/scene05/cues.ts'), 'utf8')
assert.doesNotMatch(scene05Source + scene05Cues, /montage/i, 'Scene 5 contains no montage beat or cues')
process.stdout.write(`PASS: ${impactMappings.length} unique impact assets, generated WAV integrity/headroom, supplied bass drops, and no montage playback routing\n`)
