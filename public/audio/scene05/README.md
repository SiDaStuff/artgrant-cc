# Scene 5 audio timing

Scene 5 uses one finite GSAP timeline per manual beat. Cue callbacks are attached
directly to each world reveal in `src/scenes/scene05/timeline.ts` and timed from
`src/scenes/scene05/cues.ts`. The regular exhibit music continues throughout
Scene 5; there is no montage track or automatic sequence.

Audio cue times below are beat-local seconds:

| Beat | Time | Cue |
| --- | --- | --- |
| 0 — Room entry | 0.38 | `scene5_enter` |
| 1 — Atom | 0.0 / 0.35 / 1.4 | `atom_low_pulse`, `particle_rise`, `atom_reveal`, `sub_hit_01` |
| 2 — Ocean | 0.0 / 0.3 / 1.1 / 1.8 | `ocean_transition`, `underwater_rumble`, `sub_hit_02`, `distant_creature` |
| 3 — Human body | 0.0 / 0.25 / 1.25 / 1.5 | `heartbeat_start`, `body_transition`, `heartbeat_impact`, `biological_rise` |
| 4 — Space | 0.55 / 1.35 / 1.8 | `cosmic_rise`, `blackhole_sub_hit`, `gravitational_rumble` |
| 5 — Ancient Rome | 0.0 / 0.5 / 1.5 / 2.2 | `rome_footsteps`, `stone_rumble`, `distant_city`, `torch_ambience` |
| 6 — Closing statement | 1.25 | `final_vision_reveal` |

Scene navigation, restart, and beat changes run cue cleanup callbacks. Tab
visibility pauses the active scene clock and its audio.
