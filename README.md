# Beyond the Exhibit

A live grant presentation for the Classical Conversations Challenge 2 art proposal. Scene 1 is the original ink-on-paper concept opening and doorway transition. Scene 2 continues inside the same physical museum room. Scene 3 explains why the experience matters. Scene 4 explains the proposed $10,000 prototype and the path toward future museum partnerships. Scene 5 demonstrates five possible worlds in that same room. Scene 6 closes with the prototype ask and STEP INSIDE IT. There is no Scene 7.

## Run

```sh
npm install
npm run dev
```

Open the printed local URL. `npm run build` runs TypeScript and produces `dist/`. `npm run preview` serves the production build. Fonts, paper texture and visuals are local. Music and sound start automatically when the browser allows playback; narration notes remain off screen.

## Presenter controls

Presentation uses the keyboard only. The on-screen toolbar, pointer handlers, reveal timer and toolbar CSS have been removed. Mouse movement or clicks never reveal controls. D explicitly enables the practice overlay; it remains hidden by default.

| Key | Action |
| --- | --- |
| 1–6 | Jump to that scene's first beat; works during any reveal |
| 7–9 | Reserved for registered future scenes; currently safe no-ops |
| Right arrow / Up arrow / Space | Animate the next beat, or enter the next implemented scene after the last beat |
| Left arrow / Down arrow | Restore the previous beat's stable end state; from a scene's entry hold, return to the previous scene's final hold |
| R | Restart the **current scene**, including during a reveal |
| F | Toggle fullscreen |
| D | Toggle audio settings |
| Shift+D | Toggle the normally hidden practice/debug overlay |

Every beat ends in an indefinite hold. No beat or scene automatically starts the next one. Arrow/Space navigation during a reveal is ignored rather than queued; R and number keys remain available to interrupt and reset. Switching tabs pauses an active reveal and resumes only that reveal when returning. A tab switch never starts a held beat. The final Scene 6 hold never exits fullscreen, restarts or moves elsewhere on its own.

The opening exhibit sketch still draws automatically on launch. To support the new live control requirement, the original Scene 1 timeline now has manual hold points: exhibit at 3.1 s, brainstorm at 7.1 s, doorway sketch at 12 s, final room/title at 20 s. Its art, walking animation, room and doorway shot are preserved. These are animation-clock positions, excluding time spent speaking in holds.

## Scene 2 — What This Room Is

| Beat | Reveal | Animation length, then indefinite hold |
| --- | --- | --- |
| 0 | Shared room continues; the existing title fades; camera remains still | 1.15 s |
| 1 | Establish the neutral physical room; eye-height push | 2.5 s |
| 2 | Activate a wall, another wall and the ceiling | 3.2 s |
| 3 | Discreet speaker indicators and restrained spatial arcs | 2.8 s |
| 4 | Dynamic architectural lighting, then an anchored transparent scrim with a particle wave | 4.2 s |
| 5 | Rear-corner wide view; 33 visitors including the original scale figure | 3.1 s |
| 6 | Ocean → space → microscopic → neutral digital projections; reuse statement | 8.2 s |
| 7 | Wide final hold: ONE ROOM. UNLIMITED EXPERIENCES. | 0.65 s |

The camera remains at 1.7 m for the room and feature reveals. The capacity beat moves to a slightly elevated 2.45 m rear-corner view. This angle remains fixed for the environment transformations and final hold and is suitable for tracing the architecture back into scrapbook linework later.

The longer reusable-environment beat is one manually initiated demonstration: its internal morphs animate together, then stop on the reuse statement. It never triggers beat 7 or Scene 3.

## Important files

- `src/presentation/PresentationController.ts`: active scene, manual beat navigation, keyboard filtering, fullscreen, current-scene restart, practice overlay, shared-room scene changes, and future scene-exit events.
- `src/presentation/PresentationScene.ts`: scene lifecycle, beat navigation and snapshot contract.
- `src/scenes/scene01/Scene01.ts`: preserved opening with manual segment playback; transfers room ownership to Scene 2.
- `src/scenes/scene01/timeline.ts`: original GSAP artwork/timing; `Scene01.ts` defines its manual hold positions.
- `src/scenes/scene01/scrapbook.ts`, `scene01.css`: original scrapbook art and typography.
- `src/scenes/scene01/room.ts`: existing physical architecture, camera, projection shaders, reflection and shared renderer. Its architecture is reused unchanged.
- `src/scenes/scene02/Scene02.ts`: Scene 2 lifecycle, transitions, holds, deterministic backward navigation, reset, render loop and captured scrapbook handoff.
- `src/scenes/scene02/state.ts`: complete stable room/camera/feature state for each beat.
- `src/scenes/scene02/timeline.ts`: finite GSAP reveal timelines, projection activation order, sequential feature labels and environment morph timings.
- `src/scenes/scene02/cues.ts`: beat names, durations, live narration references and all Scene 2 audio cue names.
- `src/scenes/scene02/features.ts`: removable projector/speaker fixtures, ceiling screen, supported scrim, particle field and instanced visitors.
- `src/scenes/scene02/scene02.css`: minimal feature labels and reuse statement using existing Manrope typography.
- `src/scenes/scene03/Scene03.ts`: manual scrapbook scene lifecycle, entry transition, holds, backward navigation, restart and return to Scene 2.
- `src/scenes/scene03/scrapbook.ts`: SVG notebook compositions, same faceless ink figure language, handwritten labels, comparison, Venn, branches and beneficiaries.
- `src/scenes/scene03/timeline.ts`: finite per-beat drawing timelines and deterministic end layouts.
- `src/scenes/scene03/transition.ts`: captured-room handoff and actual camera-projected architecture/visitor traces.
- `src/scenes/scene03/cues.ts`: Scene 3 beat names, durations, narration references and silent audio hook names.
- `src/scenes/scene03/scene03.css`: paper/ink layer styling.
- `src/scenes/scene04/Scene04.ts`: manual prototype-plan scene lifecycle, page-clear entry, stable layouts, backward navigation, restart and future-room anchor.
- `src/scenes/scene04/scrapbook.ts`: proposed location, prototype scope, eight funded-work components, development pipeline, leadership, funding path and three-stage final composition.
- `src/scenes/scene04/timeline.ts`: per-beat GSAP drawing timelines and complete stable layouts for backward navigation.
- `src/scenes/scene04/cues.ts`: Scene 4 names, durations, live narration references and silent cue names.
- `src/scenes/scene04/handoff.ts`: previous scrapbook page, retained room/canvas and existing room image transferred from Scene 3.
- `src/scenes/scene04/scene04.css`: handwritten/print typography and notebook layer styling.
- `src/three/RoomSession.ts`: renderer/room ownership handoff with continuous ambient time.
- `src/three/createRenderer.ts`, `postprocessing.ts`: capped pixel ratio, tone mapping, restrained bloom and resource cleanup.
- `src/audio/AudioManager.ts`: silent, typed cue bus; reset deduplication and optional cleanup callbacks.
- `scripts/verify-scene.mjs`: actual keyboard-driven integration checks for both scenes.
- `scripts/inspect-scene.mjs`, `inspect-scene02.mjs`: key-frame screenshots, including the three digital environments.

## Continuity, backward navigation and cleanup

The scene transition moves the **same canvas, Three.js scene, camera, materials and renderer** from Scene 1 into Scene 2. Ambient shader time continues. No second WebGL context or substitute room is created. Scene 2 entry fades the original title without moving the camera; only the next key starts the establishing move.

Left arrow kills the current completed beat timeline, stops optional audio, copies the preceding beat's complete stable state, restores its caption and renders it. It does not attempt to reverse each reveal. This resets camera, projections, lighting, scrim, visitors, environment and statement together. Navigation during an active transition stays locked; R interrupts immediately.

Returning from Scene 2 to Scene 1 removes and disposes the extra feature layer, resets shared presentation materials, transfers the same room back and reconstructs the original title hold. Unmount disposes owned geometries/materials, instance data, reflection/render targets, event listeners, audio callbacks and animation frames. Shared room geometries are disposed only by the current room owner.

## Reusable environments and the Scene 3 transition

Only shader uniforms and accent-light colors change during the environment demo. World-space wall projections and a ceiling screen morph between underwater caustics, star fields, organic cell membranes and the neutral flowing-light concept. Architecture, crowd placement, supports and camera remain unchanged. The existing floor reflector catches those changes.

An explicit next action on Scene 2 beat 7 captures the actual room framebuffer and uses the held camera to project architecture edges, visitor positions and projection marks into an SVG trace. `releaseForScrapbook()` transfers that snapshot/trace and the retained room to Scene 3. During a 2.7-second entry beat the image desaturates, ink draws over its edges and visitors, paper appears, and the traced composition settles into the notebook. This is a frozen-camera trace transformation, not a new room render or hard cut.

After entry, Scene 3 never renders the retained WebGL room. It uses SVG, CSS and finite GSAP timelines with no scene animation-frame loop. The detached room and canvas remain available for backward navigation. Left arrow at Scene 3 beat 0 transfers that same canvas back to Scene 2 and rebuilds its final feature state.

## Scene 3 — Why This Matters

| Beat | Composition | Animation, then indefinite hold |
| --- | --- | --- |
| 0 | Held 3D room becomes an ink sketch on paper | 2.7 s |
| 1 | Traditional exhibit, observer, LOOK AT IT | 2.2 s |
| 2 | Side-by-side comparison, STEP INSIDE IT emphasized | 2.4 s |
| 3 | Sensory doodles, MEMORABLE, Sight + Sound + Space + Story | 2.6 s |
| 4 | ART / SCIENCE / TECHNOLOGY Venn, THE EXPERIENCE at the intersection | 2.6 s |
| 5 | ONE ROOM branches to ATOM, SPACE, OCEAN, HUMAN BODY and HISTORY | 3.0 s |
| 6 | STUDENTS, FAMILIES and MUSEUMS connect to the same room | 2.6 s |
| 7 | LOOK AT IT → STEP INSIDE IT, walking figure, ART + SCIENCE + TECHNOLOGY | 3.2 s |

Only entry beat 0 runs as a consequence of the manual Scene 2 → Scene 3 advance. No content beat begins until another Right arrow/Space action. R replays entry and returns to its hold. Previous beat reconstructs the complete SVG layout and text masks without replaying intermediate animations. An explicit next action at the final hold transfers a clone of that final notebook page and the retained room to Scene 4.

Scene 3 uses the original Caveat handwriting and paper texture. Main label sizes are 29–74 SVG units (about 35–89 px at 1920 × 1080); small folio text is decorative. The room trace preserves projected visitor placement, including perspective overlap, and simplifies silhouettes and optical details. Text writes through progressive masks while drawings use actual stroke-length reveals. No budget, funding plan or new museum details appear in Scene 3.

## Scene 4 — From Idea to Prototype

| Beat | Composition | Animation, then indefinite hold |
| --- | --- | --- |
| 0 | Scene 3 page slides/sketches away; a fresh chapter page holds | 1.4 s |
| 1 | First proposed location: The Franklin Institute, Philadelphia | 2.4 s |
| 2 | $10,000 → A PROFESSIONAL PROTOTYPE; permanent room is a later funding phase | 3.8 s |
| 3 | Eight grant-funded work categories around a prototype-room mockup | 3.5 s |
| 4 | DESIGN → BUILD → TEST → PRESENT, then the longer-term partnership path | 3.8 s |
| 5 | Silas Davis, Founder & Creative Director, with creative interests and specialist collaboration | 3.3 s |
| 6 | Grant → working prototype → partnership/larger funding → first full room as future goal | 3.2 s |
| 7 | FROM IDEA TO PROTOTYPE; sketch → working mockup → full-room future goal | 2.8 s |

The first beat clears the actual cloned Scene 3 final page, then holds without revealing grant information. Every subsequent beat needs another Right arrow/Space press. R replays the page-clear entry and stops there. The full room is never presented as funded by $10,000 or guaranteed: the scope clarification, development path, funding path and final goal label make the distinction explicit. Main presentation content contains no line-item dollar breakdown.

SVG draws the location silhouette, mockup, leaders and planning diagrams. Manrope is used for financial and planning statements; Caveat retains the concept-book voice for annotations. The eight categories are 3D room design, immersive visual development, projection testing, sound/music design, lighting tests, holographic-effect prototype, physical mockup/materials and museum-ready proposal.

Backward navigation reconstructs the full previous layout, including scope qualifiers, stage opacity, writing masks and final image placement. Left arrow at beat 0 restores Scene 3's final hold. The room/canvas stays detached and idle throughout Scene 4 and can still be returned to Scene 2. A manual Next at beat 7 transfers the retained room and cloned notebook page into Scene 5. The future-room thumbnail opens like an iris; the live room pushes through as the blueprint page sweeps away with a flash and temporal motion blur.

The museum silhouette is illustrative rather than a measured reconstruction. The center room is a schematic prototype mockup; the right-side future-goal image reuses the existing Three.js concept room rather than inventing a funded installation. Main Scene 4 labels are at least 27 SVG units (32.4 px at 1080p); small folio text is decorative. A more specific prototype hardware layout and target-projector contrast review remain useful before the presentation.

## Scene 5 — Imagine What This Room Could Become

| Beat | Experience | Length, then indefinite hold |
| --- | --- | --- |
| 0 | The future-room thumbnail opens like an iris; the live room pushes through as the blueprint page sweeps away | 3.2 s |
| 1 | INSIDE THE ATOM: luminous nucleus-like knot, open energy strands, microscopic particles | 3.4 s |
| 2 | DEEP OCEAN: blue depth, caustics, sediment, bioluminescence, a distant creature shadow | 3.2 s |
| 3 | HUMAN BODY: flowing instanced biconcave cells, soft vascular projections, heartbeat pulse | 3.2 s |
| 4 | BEYOND OUR REACH: body scene fades under a short blackout; space and the new camera position settle before the reveal | 4.0 s |
| 5 | ANCIENT ROME: straight fluted columns, stone, coffer imagery, street silhouettes and torchlight | 3.4 s |
| 6 | Fixed wide shot; ONE ROOM. then ENDLESS PLACES TO GO. | 3.6 s |

The existing wall meshes, floor, ceiling, doorway, renderer and 33 visitor positions
remain in place. A removable material layer changes world-space projections and
colored architectural lighting. The existing floor reflector catches the same
imagery. A shared 1,250-point atmospheric field, four open atomic energy strands and
76 instanced cells supply depth. Camera paths are finite pushes; every hold has a
fixed camera. Each world and the final statement advances only on a presenter key.
There is no montage or automatic world sequence. Motion blur is a temporal
AfterimagePass in the WebGL postprocessing chain, used during the room launch and
the body-to-space move. Camera-flash pulses use a shader pass during those
transitions; neither effect is a DOM overlay. Labels stay within safe margins, with
main type above 32 px at 1080p. Normal presentation mode shows neither narration
nor controls.

The regular exhibit music bed continues through Scene 5. The final statement is
beat 6; a further manual key enters Scene 6. D shows the active beat, upcoming cue,
FPS and draw-call count. Left reconstructs the previous stable world, and Left at
the entry hold restores Scene 4's final notebook page. R interrupts any reveal,
resets the camera, environment, lights, particle time, labels and audio, then
replays entry. All Scene 5 materials, lights and fog are restored/disposed before
returning the shared room.

New files in `src/scenes/scene05/`:

- `Scene05.ts`: lifecycle, render loop, manual navigation, cancellation, reset and ownership.
- `state.ts`: complete stable world/camera states.
- `timeline.ts`: entry push, world transformations and final text.
- `projections.ts`: procedural wall/ceiling imagery, including black-hole lensing approximation.
- `worlds.ts`: removable screen materials, atmosphere, energy strands, instanced cells and lights.
- `cues.ts`: narration, durations, typed audio names and exact cue times.
- `handoff.ts`, `scene05.css`: notebook/room transfer and projector-safe composition.

Scene 5 uses the same retained room and its normal audio bed. `public/audio/scene05/README.md` documents its world-reveal cues. The three supplied bass drops are mapped to the Scene 5 arrival, black-hole hit and Scene 6 final resolution. Audio follows browser autoplay policy.

All layers are created and compiled before their world reveal. No environment
loads assets during playback. Hidden strands/cells skip their draws. DPR remains
capped at 1.5, reflection stays 768×512, and the existing restrained bloom is reused.
There are no shadow maps, volumetric ray marches, external models or large textures.
The black hole is a procedural projection with approximate lensing, not a physical
simulation. Rome is an illustrative portico, and the distant ocean creature is the
simplest visual. Further useful polish is a more organic creature
silhouette, richer historical depth, final sound synchronization, and contrast/FPS
checks on the actual projector computer. The room remains a future-funded concept.

## Scene 6 — The Ask

| Beat | Closing composition | Animation, then indefinite hold |
| --- | --- | --- |
| 0 | Briefly retain Scene 5's exact frame, then blend into the detailed proposal hero | 2.8 s |
| 1 | $10,000, then FOR THE FIRST PROFESSIONAL PROTOTYPE | 2.6 s |
| 2 | IDEA → PROTOTYPE → MUSEUM PARTNERSHIP → FIRST ROOM; future-funding qualifier | 3.2 s |
| 3 | START WITH ONE ROOM. BUILD SOMETHING BIGGER.; four restrained room outlines | 3.0 s |
| 4 | BEYOND THE EXHIBIT / Immersive museum experiences; pause before the final line | 3.1 s |
| 5 | STEP INSIDE IT.; small lighting swell, then a fixed final hold | 3.6 s |

The natural Scene 5 → 6 boundary transfers the actual shared room, screen materials,
visitors, effect layer, shader time, vignette and held camera. Its first 0.25 seconds
retain that composition. The remaining 2.55 seconds simplify the projections into a
layered blue/gold memory field, fade the old typography, soften lighting and reframe
the room. New architectural detail fades in while the dense crowd settles into seven
rounded figures at retained visitor positions. The grant and final line remain hidden at the
entry hold. All subsequent beats require a separate presenter key. The last spoken
sentence is split between beats 4 and 5 and appears only in D mode. No automatic
thank-you, credits, extra paragraph or ending action is present.

Left reconstructs the previous full camera/text state. Left from entry transfers
the same room back to Scene 5's final hold and rebuilds its exact environment. R
kills the closing timeline, clears optional audio, resets shader time, camera,
lighting and typography, then replays entry. Main text is at least 32 px at 1080p
inside safe margins; the background and all holds retain gentle ambient movement.
The four room outlines express an aspiration, not agreed museum locations. The
optional extra scrapbook stick figure was omitted to keep the final room coherent.

Created files:

- `src/scenes/scene06/Scene06.ts`: closing lifecycle, render loop, navigation, reset and room ownership.
- `src/scenes/scene06/state.ts`: complete starting/stable camera, projection and light states.
- `src/scenes/scene06/timeline.ts`: finite entry, grant, path, expansion, title and final-line timelines.
- `src/scenes/scene06/layout.ts`, `scene06.css`: clean typography, room outlines and safe composition.
- `src/scenes/scene06/heroDetails.ts`: reversible material finishing, instanced ceiling baffles, screen frames, projector haze, centerpiece, seven rounded visitors, contact shadows and floor path.
- `src/scenes/scene06/cues.ts`, `handoff.ts`: eight typed audio hooks, narration, timing and live-layer transfer.
- `public/audio/scene06/README.md`: future audio locations, cue times and playback-cleanup contract.
- `scripts/verify-scene06.mjs`, `inspect-scene06.mjs`: keyboard/continuity checks and 1080p frames.
- `src/presentation/sceneRegistry.ts`, `scripts/verify-navigation.mjs`: generic scene selection and instrumented navigation checks.

Modified files are `PresentationController.ts`, `PresentationScene.ts`,
`scene01/Scene01.ts` (stable beat inspection for hash loading), `scene05/Scene05.ts`
(live closing transfer), `audio/AudioManager.ts` (typed cue union), `package.json`,
the Scene 5 regression's boundary expectation, and this README. Earlier scenes'
visual compositions and beat timing are preserved.

Scene 6's eight optional silent hooks are `scene6_enter`, `grant_reveal`,
`prototype_path_reveal`, `expansion_reveal`, `final_title_reveal`, `final_pause`,
`step_inside_reveal`, and `final_resolution`. No assets are fetched and no heavy
Scene 5 impacts are used. The room remains procedural and the visitors stand still.
Projector contrast and final sound/narration balance remain presentation refinements;
no full optical simulation or final audio transport was added.

## Scene 5 and closing refinements

Scene 5 now advances directly through the five manual world reveals to its closing
statement. The ocean shadow has a curved body/tail, particulate and depth light;
biology has a paired heartbeat pulse; Rome has cool recessed arches behind warm
fluted columns; space adds distant galaxy detail and a more varied accretion
texture. The same room and all manual/number controls are retained. No scene was added.

Scene 6's new finishing layer adds eighteen instanced ceiling baffles, recessed screen
bay lines, edge lights and projector apertures, subtle bump/roughness variation,
stronger existing planar reflections, two soft fill lights, inexpensive projector
haze, a small supported particle-light centerpiece, and seven volumetric figures
with contact shading. Their positions are selected from the original crowd to avoid
an unrelated people swap. The path beat connects architectural callouts to a curved
line and glowing markers on the real floor. Expansion rooms now contain screen,
ceiling, floor and visitor detail rather than empty wireframe cubes. The final
camera/light hierarchy leaves quiet space behind the closing type.

All finishing geometries, instance buffers, cloned materials, the small generated
grain texture and added lights are disposed on exit. Original wall/floor materials
and original-figure visibility are restored before returning the room. There is no
independent detail render loop. Transparent details disable depth writing while
fading, and the light configuration is prewarmed before the entry timeline starts.

The extra detail costs two fill lights and additional reflected draw calls, but
adds only one 128×128 texture. DPR remains capped at 1.5 and the existing 768×512
reflector is reused. There are no shadow maps or volumetric ray marches. People are
still stylized low-detail figures, the creature remains a projected silhouette, and
black-hole lensing remains approximate. Better character assets and physical sound
design would be the next artistic upgrades. Tune projector brightness and the
centerpiece/floor reflection levels on the presentation machine.

Useful adjustment points: `SCENE05_BEATS` and `worlds.ts`, camera/focus values in
`scene06/state.ts`, finishing opacity/light strengths in `heroDetails.ts`, and
type/safe margins in `scene06.css`. Beat numbers, grant scope and narration are unchanged.

## Direct scene navigation and URL state

Plain main-row digits and NumLock-enabled numpad digits select scenes. Ctrl, Alt,
Meta, Shift+digit and repeated keydowns are ignored. All presentation keys are
ignored in inputs, textareas, selects and contenteditable regions. Missing scenes
do nothing; an optional notice appears only if D is already enabled.

The registry maps scene numbers to starting factories. Before a jump, the controller
releases the shared architecture, disposes the outgoing scene's timelines, frame
loop, audio callbacks, event listeners, extra materials/geometry and DOM, then resets
the shared room. The selected factory creates only the prerequisite static final
pages/room captures needed by that scene's entry transition, disposing each temporary
scene immediately. It never plays previous content or restores an old visited beat.
The same canvas and WebGL context are reused. Future scenes can be registered for
7–9 without changing the keyboard handler. Direct jumps may incur a brief synchronous
snapshot/prewarm cost on slower hardware; they do not allocate another room context.
The main presentation/fullscreen element and the user's D preference survive jumps.

URL state is included without a routing library. The controller replaces the hash
with `#scene=6&beat=0` as the active scene/beat changes, without adding history entries
for every beat. A valid initial or changed hash can open a specific scene and a valid
stable beat. An omitted/invalid beat opens beat 0. Unknown scene hashes leave the
current scene alone (initial load falls back to Scene 1). Number keys always open
beat 0, even after a specific-beat URL was loaded. D shows the scene title, current
scene/count, beat/count (beats use zero-based numbering), and all controls.

## Room handoff regression fix

Scene 1 no longer calls `room.attach()`: `createRoom()` mounts a fresh canvas directly, and `RoomSession.canvas` explicitly transfers that DOM node between scenes. Scene 2 likewise mounts the handed-off node without requiring an `attach` method. Initialization failures clear the failed room and report an initialization error rather than mislabeling every failure as missing WebGL 2. `npm run test:handoff` deliberately removes `attach()` from the runtime room module and verifies startup plus Scene 1 → 2 → 1 with the same canvas.

## Audio and narration

Narration references appear only after D is pressed. No subtitles or spoken narration appear in normal presentation mode. There are no WebAudio tones or fetched sound files.

Attach optional future sound design with `scene.audio.onCue((name, beatTime) => { ... })`. Return a cleanup callback to stop a cue when leaving/restarting a beat. Missing/throwing optional hooks are skipped without interrupting the scene.

Scene 2 hooks: `scene2_enter`, `room_ambience`, `projection_activate`, `surround_reveal`, `low_sub_pulse`, `spatial_whoosh`, `subtle_sub_hit`, `lighting_activate`, `hologram_reveal`, `visitors_reveal`, `environment_ocean`, `environment_space`, `environment_micro`, `reusable_room_reveal`. Scene 1's eight original hooks remain intact.

Scene 3 hooks: `scene3_paper_transition`, `ink_draw`, `comparison_reveal`, `memorable_reveal`, `venn_reveal`, `experience_branch`, `benefit_reveal`, `final_scrapbook_hold`. Narration references are stored in `src/scenes/scene03/cues.ts` and appear only in D mode.

Scene 4 hooks: `scene4_page_clear`, `location_reveal`, `funding_reveal`, `prototype_reveal`, `component_draw`, `process_step`, `leadership_reveal`, `funding_path`, `final_prototype_hold`. Narration references and beat durations live in `src/scenes/scene04/cues.ts`; they never appear as normal-mode subtitles. No sound files or final music are required.

## Verification and inspection

Start the dev server, then use the installed Microsoft Edge browser:

```sh
npm run test:scene
npm run test:scene3
npm run test:scene4
npm run test:scene5
npm run test:scene6
npm run test:navigation
npm run test:repair
npm run test:handoff
npm run inspect:scene
npm run inspect:scene2
npm run inspect:scene3
npm run inspect:scene4
npm run inspect:scene5
npm run inspect:scene6
npm run build
```

The integration checks use real keyboard input and wait for actual animations. They cover manual holds, navigation lock, title/room continuity, all feature and scrapbook beats, repeated backwards state reconstruction, current-scene restart during animation, cross-scene return, silent audio hooks, fullscreen, resizing, visitor draw calls, 1080p scrapbook text bounds/sizes and 30-second final holds. The Scene 3 check instruments actual WebGL draw methods to confirm the room is idle during scrapbook content/holds. Screenshots are saved under ignored `artifacts/`.

Scene 5 checks cover the blueprint-to-live-room aperture, all five manual worlds,
the blacked-out body-to-space transition, actual postprocessed motion blur and
camera flash, the direct finale, backward reconstruction, fullscreen, resizing,
1080p text bounds and repeated handoffs. They also assert that no montage or
synthwave playback is scheduled.
Scene 6 adds a 30-second closing hold, every closing reveal, all eight hooks and
repeated Scene 5 ↔ 6 continuity checks. Number-navigation checks cover all digits,
the requested rapid jump sequence, same-scene reset, modifier/focus guards, jumps
from active Scene 5 reveals to Scenes 6/2/3, silent audio cleanup, no old WebGL draws
behind the scrapbook, one WebGL context, one scene root and bounded RAF callbacks,
fullscreen preservation, valid hash loading and unknown-scene fallback. Run timing-
sensitive browser suites sequentially if GPU contention makes fixed-time frame
assertions flaky.

In Vite development only, `window.__BEYOND_EXHIBIT__` offers `.snapshot()`, `.audio`, `.seek(seconds)`, `.seekBeat(index)` (all scenes), and `.handoff()` (Scene 2 final-state data or Scene 4 future-room viewport). Seek helpers pause for frame inspection; R returns to normal manual playback. The helper is stripped from production. D remains available for practice in either build.

## Visual and performance limits

This remains a concept visualization, not a measured reconstruction of The Franklin Institute or a certified capacity/layout. Visitors use the same low-detail silhouette geometry with variations in height, orientation and color, with 32 extra visitors rendered through two instanced meshes. They stand still. The scrim's transparency and dot field suggest a feasible projection medium without simulating an optical installation.

Environment visuals are procedural illustrations, not final ocean/science content. Haze uses depth fog rather than volumetric scattering; the matte-overlaid planar reflection is intentionally subdued. Pixel ratio stays capped at 1.5, reflection resolution at 768 × 512, bloom is restrained, and there are no shadow maps, external models or expensive individual visitor rigs. The full crowd view adds two body/head draw calls per room pass; reflection and postprocessing add their own passes. FPS and total frame draw calls are visible in D mode. Final projector brightness and target-device performance should be tuned before presenting. Vite may report a non-failing bundle-size advisory for Three.js.
