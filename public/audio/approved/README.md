# Approved audio files

The runtime loads sound effects and music from this directory. Most scene-specific
impact WAVs are original procedural syntheses. Regenerate them with
`node scripts/generate-impact-sfx.mjs`; the generator uses only oscillators,
frequency sweeps, and shaped noise and does not sample the old boom recordings.

Three presenter-supplied bass drops are used for the black-hole hit, Scene 5
arrival, and final resolution. Their gains are individually set in the audio
cue map to account for their different loudness and duration.

## Impact design

Each impact has its own tuning for the scene: low sub oscillators provide weight,
decaying sweeps give the hit its body, resonant partials add material character,
and shaped noise supplies the attack. The WAVs are 48 kHz stereo and are kept
separate so the mix can give each cue its own level.

| Generated file | Intended moment |
| --- | --- |
| `impact-room-reveal.wav` | Scene 1 room reveal |
| `impact-scene2-arrival.wav` | Scene 2 arrival |
| `impact-room-reuse.wav` | Reusable room reveal |
| `impact-atom.wav` | Atom reveal |
| `impact-ocean.wav` | Ocean reveal |
| `impact-body.wav` | Heartbeat impact |
| `impact-black-hole.wav` | Black-hole reveal |
| `impact-rome-stone.wav` | Ancient Rome stone impact |
| `impact-prototype-launch.wav` | Scene 4 to 5 launch |
| `impact-closing-arrival.wav` | Scene 6 room arrival |
| `impact-grant-reveal.wav` | Grant amount reveal |
| `impact-final-resolution.wav` | Final “Step Inside It” moment |

### Presenter-supplied impact replacements

The generated `impact-black-hole.wav`, `impact-prototype-launch.wav`, and
`impact-final-resolution.wav` entries above are retained as unused alternates;
the supplied MP3s below are mapped to those moments.

| File | Intended moment | Source characteristics |
| --- | --- | --- |
| `bass-drop-new-1.mp3` | Scene 5 black-hole hit | 6.56 s, mono, sustained low-frequency impact |
| `bass-drop-new-2.mp3` | Scene 5 arrival after Scene 4→5 launch | 2.59 s, stereo, short high-energy impact |
| `bass-drop-new-3.mp3` | Scene 6 final resolution | 6.07 s, stereo, long decaying low-end tail |

### Source mapping
| Target | Source / origin |
| --- | --- |
| main-exhibit-bed | atmospheric-music.mp3 |
| closing-proposal | piano-music.mp3 |
| pencil-writing | pencil-writing-full-mix.mp3 |
| page-turn | paper-tear.mp3 |
| light-whoosh | swoosh.mp3 |
| soft-riser | deep-woosh.mp3 |
| scene-specific impact WAVs | Procedurally synthesized by `scripts/generate-impact-sfx.mjs` |
| `bass-drop-new-1.mp3`, `bass-drop-new-2.mp3`, `bass-drop-new-3.mp3` | Supplied by the presenter |
| shimmer | lightning.mp3 |
| underwater-room | underwater-ambience.mp3 |
| heartbeat | heartbeat.mp3 |
| space-room | space-ambience.mp3 |
| museum-room | synth (room-tone) |
| projector-click | synth (click) |
| water-swish | synth (swish) |
| subtle-pulse | synth (sub-pulse) |

## Licensing caveat

The source files copied from `../` are the pre-existing **license-unverified**
MP3s; the synthesized clips are original. Re-audit licensing (or download the
licensed candidates from `../manifest.json`) before public distribution.

> The live-browser regression tests for audio now fetch every file with an
> HTTP 200 and zero console errors, including the scene 5 space ambience.
