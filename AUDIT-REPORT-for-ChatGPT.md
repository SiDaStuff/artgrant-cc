# Beyond the Exhibit — Presentation Walkthrough Report for ChatGPT

**Audit basis:** This report was produced by inspecting the actual source files in `C:\Users\silas\Downloads\artgrant` AND by running the app in a real browser (Playwright + Microsoft Edge / SwiftShader) against the Vite dev server, stepping every beat and reading the live DOM. Exact on-screen text was cross-checked in the rendered DOM, not guessed. Where the code and the running app agree, they are reported together. Where the README contradicts the actual code, the code+during-run behavior is reported and the contradiction flagged.

---

## A. Presentation Overview

**Scene order (as the audience experiences them):**

| # | Scene name (aria / controller) | Source |
|---|---|---|
| 1 | The Idea Begins | `scene01` |
| 2 | What This Room Is | `scene02` |
| 3 | Why This Matters | `scene03` |
| 4 | From Idea to Prototype | `scene04` |
| 5 | Imagine What This Room Could Become | `scene05` |
| 6 | The Ask | `scene06` |

There is **no Scene 7**. Number keys `7`, `8`, `9` are registered as safe no-ops.

**Overall structure:**
- Scene 1 is a hand-drawn ink scrapbook opening on paper that ends by "stepping through a doorway" into a real 3D museum room with the title.
- Scene 2 stays in that same 3D room and reveals its hardware (projectors, sound, lighting/scrim, visitors, reusable environments).
- Scene 3 returns to scrapbook/ink: why the concept matters (look-at vs step-inside, memorable, art+science+technology, one-room-many-experiences, who benefits).
- Scene 4 is a scrapbook "proposal page": from idea to prototype, the Franklin Institute location, the $10,000 scope, what the grant funds, development path, leadership, funding path.
- Scene 5 returns to the 3D room and demonstrates five possible worlds (atom, ocean, body, space, Rome), followed directly by the closing line.
- Scene 6 is the "ask": returns to the room, states $10,000 for the first professional prototype, the path, expansion, and the final line STEP INSIDE IT.

**Total number of beats:** **41** (Scene 1: 4, Scene 2: 8, Scene 3: 8, Scene 4: 8, Scene 5: 7, Scene 6: 6). Beats are numbered from **0** internally.

**Navigation behavior:**
- **Launch:** Scene 1's opening *auto-draws* once on load (beat 0 runs by itself to the 3.1 s hold). Everything after every beat is a manual advance.
- **Advance:** `Right Arrow` or `Space` animates the next beat; on the last beat of a scene it enters the next scene. During an in-progress reveal, advancing is ignored (not queued).
- **Previous:** `Left Arrow` rebuilds the previous beat's stable end state; from a scene's entry, it returns to the previous scene's final hold.
- **Scene jump:** `1`–`6` jump directly to that scene's first beat (works during reveals).
- **Restart:** `R` restarts the current scene. `F` fullscreen. `D` toggles hidden audio settings; `Shift+D` toggles the hidden practice overlay (narration/durations/timing).
- **Every beat ends in an indefinite hold.** No beat or scene auto-starts the next. The only automatic content is Scene 1's opening draw.
- **Important caveats:**
  1. The README (Scenes "6 beat 3 / beat 4" descriptions) is **out of date** and contradicts the actual Scene 6 code. See contradiction note in Section B, Scene 6.
  2. Audio starts automatically when the browser permits playback; the app retries on the first pointer or key gesture if autoplay is blocked. Press `D` to show audio settings. Narration remains hidden during normal presentation and is available in the practice overlay opened with `Shift+D`.
  3. Scene transitions are smooth same-canvas "handoffs" (the same WebGL canvas/room moves between scenes), so the audience sees continuous visuals with no loading or cut.

---

## B. Scene-by-Scene Walkthrough

Notation: beats are indexed 0-based (the app uses 0-based numbering). "Advance" = how the presenter reaches the next beat. Durations are the animation-clock lengths measured from code; every beat then **holds indefinitely** until the next manual key.

### Scene 1 — The Idea Begins (`scene01`)

| Beat | Exact visible text | What appears visually | How it advances | Duration / pause |
|---|---|---|---|---|
| 0 | `Museum exhibit` (label); at the end of the opening, the idea doodles labelled `Projection`, `Sound`, `Light`, `Motion`, and the handwritten `The idea begins.` | Automatic opening on launch. Ink **draws** a traditional museum exhibit (a vitrine) and a ground line; a faceless ink figure appears. Then four idea doodles pop in one by one around it (Projection, Sound, Light, Motion) while the pencil hand-writes their labels. | **Automatic** on launch (0 → 3.1 s), then holds. | ~3.1 s auto; then presenter holds. |
| 1 | Idea doodles (small) + handwritten opening note | The question mark draws; the four idea doodles fade to a dim 0.27 opacity as background. A doorway starts to sketch at the far right; moving notes appear: `Floor-to-ceiling visuals`, `Surround sound`, `Immersive lighting`. The figure begins walking. | **Manual** (Right/Space). Timeline from 3.1 → 7.1 s. | ~4 s to reach hold. |
| 2 | Doorway sketch + notes `Floor-to-ceiling visuals`, `Surround sound`, `Immersive lighting` | The figure walks toward a hand-drawn doorway; the paper scrolls/scales inward through the portal; the room's 3D layer fades in behind a "portal hole". | **Manual**. 7.1 → 12 s. | ~4.9 s to reach hold. |
| 3 | `BEYOND THE EXHIBIT` (large title, h1) — only title text is populated in the DOM; no eyebrow/subtitle/footnote text is actually present | Camera pushes through the doorway into the 3D room; title lockup fades up over the lit room; a light sweep and vignette; gentle ambient projection motion. | **Manual**. 12 → 20 s. | ~8 s to reach final hold. |

- **Main message:** "Beyond the Exhibit" is an immersive room you can step *inside of*, moving from a flat exhibit to a doorway into a full 3D space.
- **Facts presenter must explain:** none numeric. The presenter introduces the working title "BEYOND THE EXHIBIT" (only text in the title slot). The four idea doodle words (Projection, Sound, Light, Motion) preview the core features that Scene 2 elaborates.
- **Recommended speaking time:** ~25 s. Let beat 0's auto-draw play silently (~2 s), then speak over beats 1–2, pause at the doorway, and speak the title on beat 3.

> **Source note:** The CSS defines `.title-eyebrow`, `.title-subtitle`, `.title-footnote`, but the Scene 1 mount HTML contains **only** the `<h1>BEYOND THE EXHIBIT</h1>` and a title rule. So only the main title is actually visible; do not imply an eyebrow or subtitle exists.

---

### Scene 2 — What This Room Is (`scene02`)

The room title `BEYOND THE EXHIBIT` from Scene 1 remains and fades during beat 0. All beats hold at fixed cameras.

| Beat | Exact visible text | What appears visually | How it advances | Duration / pause |
|---|---|---|---|---|
| 0 | `BEYOND THE EXHIBIT` (held title, fading) | Same room continues; the existing title fades out; camera stays still. Establishes "this is that room". | **Manual** (Scene 1 → 2 entry) | 1.15 s |
| 1 | No visible text | Neutral physical room; camera does an eye-height push. No features yet. | **Manual** | 2.5 s |
| 2 | No visible text | Activates a back wall, a left wall, and the ceiling screen as live projection surfaces; projector fixtures appear. | **Manual** | 3.2 s |
| 3 | No visible text | Discreet speaker boxes appear on the walls with small indicator dots and restrained spatial sound arcs. | **Manual** | 2.8 s |
| 4 | No visible text | Dynamic architectural lighting, then an anchored transparent holographic scrim with a drifting particle-wave field appears in the room. | **Manual** | 4.2 s |
| 5 | `25–40 VISITORS` (title) / `per experience` (subtitle) | Camera pulls to a rear-corner wide view; 33 low-detail visitor silhouettes (1 original + 32 instanced) appear scattered in the room. | **Manual** | 3.1 s |
| 6 | No visible text (the reuse title first appears on beat 7) | A *single* manually-initiated demonstration: the same technology morphs through **Ocean → Space → Microscopic → neutral flowing-light** projections (projection shader + accent light changes only), then stops. | **Manual** (one long animated beat) | 8.2 s |
| 7 | `ONE ROOM.` / `UNLIMITED EXPERIENCES.` (two-line reuse statement, top-left) | Wide final hold over the transformed room. This is the payoff line of the scene. | **Manual** | 0.65 s |

- **Main message:** This is a single physical room whose walls and ceiling can become *almost any environment*, holding 25–40 people, built on projectors, sound, lighting, and a holographic-style scrim.
- **Facts presenter must explain:** The **25–40 visitor** range and **33 figures shown** (the label says 25–40; the visual show 33). These are the only quantitative claims in this scene. Also explain that the technology is fixed/reusable — the room does not need rebuilding for each new experience (that's what beat 6 demonstrates).
- **Recommended speaking time:** ~45 s. Beat 6 (the environment morph demo) deserves a silent moment; beat 7's two-line statement should be spoken slowly and paused before advancing to Scene 3.

> **Source note:** The `25–40 VISITORS` uses an en-dash (`–`), exactly as shown. The reuse statement appears only from beat 6's end/beat 7 onward (`hero` flag). Beats 0–4 have **no** on-screen label.

---

### Scene 3 — Why This Matters (`scene03`)

All content is SVG/paper with the same faceless ink-figure language. Text is hand-written via progressive masks (Caveat font). Each beat draws in over ~2.2–3.2 s then holds.

| Beat | Exact visible text (labels that draw) | What appears visually | How it advances | Duration / pause |
|---|---|---|---|---|
| 0 | (entry) `ONE ROOM.` / `UNLIMITED EXPERIENCES.` fades, then the room becomes an ink trace | The Scene 2 room frame desaturates into a paper sketch; the room's architecture + visitors are re-drawn as traced ink lines settling into the notebook. | **Manual** (Scene 2 → 3 entry) | 2.7 s |
| 1 | `LOOK AT IT` | A traditional exhibit vitrine draws beside a lone standing observer figure. | **Manual** | 2.2 s |
| 2 | `STEP INSIDE IT` | Side-by-side comparison: the "LOOK AT IT" exhibit slides left and an immersive room grows on the right with an arrow between them; a person inside the room. | **Manual** | 2.4 s |
| 3 | `MEMORABLE` | Sensory doodles (an eye, a speaker, a hand, abstract motion) around the immersive room. | **Manual** | 2.6 s |
| 4 | `ART` , `SCIENCE` , `TECHNOLOGY` , `THE` , `EXPERIENCE` | A three-circle Venn; ART (left), SCIENCE (right), TECHNOLOGY (bottom), with `THE` `EXPERIENCE` centered at the intersection. | **Manual** | 2.6 s |
| 5 | `ONE ROOM` , `MANY EXPERIENCES` , `ATOM` , `SPACE` , `OCEAN` , `HISTORY` , `HUMAN BODY` | A central room with branching lines to five small concept doodles: ATOM, SPACE (orbit), OCEAN (wave), HISTORY (column), HUMAN BODY (figure). | **Manual** | 3.0 s |
| 6 | `STUDENTS` , `FAMILIES` , `MUSEUMS` , `MORE WAYS TO EXPERIENCE AN IDEA` | Three groups (three small figures each for students/families, a portico for museums) all connect into a central room. | **Manual** | 2.6 s |
| 7 | `LOOK AT IT` , `STEP INSIDE IT` (seen again) | The walking stick figure walks from the "LOOK AT IT" exhibit toward the "STEP INSIDE IT" immersive room; ART + SCIENCE + TECHNOLOGY interchange shown; final scrapbook hold. | **Manual** | 3.2 s |

> **Note on the SVG masks:** In the running DOM all label `<text>` nodes exist for every beat (they are revealed by per-beat clip-path width masks, not opacity). The "exact visible text" above is what the source draws for *that specific beat*. Do not assume all are visible at once — only the current beat's mask is open.

- **Main message:** Traditional exhibits make you look *at* an idea; this room lets you *step inside it*, and combining art + science + technology makes difficult ideas memorable. The same room could host many experiences for students, families, and museums.
- **Facts presenter must explain:** No budget or funding is mentioned in Scene 3 — it is purely conceptual. The presenter must make the emotional/logical case: immersion → memorability → many audiences. The five concept labels (ATOM, SPACE, OCEAN, HISTORY, HUMAN BODY) foreshadow Scene 5 and should be pointed out.
- **Recommended speaking time:** ~35 s. This is the most text-dense scene; read the labels as they draw and let the Venn and the branches breathe.

> **Source note:** Beat 2's label is `STEP INSIDE IT` — the eye-catching phrase the presentation returns to at the very end (Scene 6 beat 5).

---

### Scene 4 — From Idea to Prototype (`scene04`)

A fresh notebook "proposal page". Uses Manrope print for financial/planning statements and Caveat handwriting for annotations. Every beat draws then holds. This is where all concrete grant/funding/planning claims live.

| Beat | Exact visible text | What appears visually | How it advances | Duration / pause |
|---|---|---|---|---|
| 0 | `From idea` / `to prototype.` (handwritten title) | The Scene 3 notebook page slides/sketches away; a fresh blank chapter page holds. | **Manual** (Scene 3 → 4 entry) | 1.4 s |
| 1 | `FIRST PROPOSED LOCATION` ; `THE FRANKLIN INSTITUTE` ; `Philadelphia, Pennsylvania` | A schematic museum silhouette draws with a small marker-dot; location typography settles. | **Manual** | 2.4 s |
| 2 | `$10,000` ; first `NOT: A COMPLETE PERMANENT INSTALLATION` (shown, then fades); then `A PROFESSIONAL` , `PROTOTYPE` , and `Permanent room: a later phase + additional funding.` | Scope story: the big $10,000, the "not this" line flashes then fades, then the arrow-down to "A PROFESSIONAL PROTOTYPE". | **Manual** | 3.8 s |
| 3 | `WHAT THE GRANT MAKES POSSIBLE` ; a central `PROTOTYPE` room; eight work categories: `3D ROOM DESIGN`, `IMMERSIVE VISUAL DEVELOPMENT`, `PROJECTION TESTING`, `SOUND + MUSIC DESIGN`, `LIGHTING TESTS`, `HOLOGRAPHIC-EFFECT PROTOTYPE`, `PHYSICAL MOCKUP + MATERIALS`, `MUSEUM-READY PROPOSAL` | A polished schematic prototype room in the center with eight leader-lined categories (four left, four right). | **Manual** | 3.5 s |
| 4 | `DESIGN` , `BUILD` , `TEST` , `PRESENT` (four stages with arrows); then `Next, with the prototype…` ; `PROTOTYPE` → `MUSEUM PARTNER` → `FULL INSTALLATION` , with `feedback + refinement` , `partners + sponsors` , `future funding` | Development pipeline (DESIGN → BUILD → TEST → PRESENT) then a longer-term partnership path below. | **Manual** | 3.8 s |
| 5 | `SILAS DAVIS` ; `CODING` , `VISUAL DESIGN` , `MUSIC + SOUND` , `EXPERIENCE DESIGN` ; `COLLABORATION` , `SCIENTISTS` , `ENGINEERS` , `MUSEUM PROFESSIONALS` , `EDUCATORS` | A lead figure beside a room; the four creative-interest tags; a collaboration bracket listing specialist partners. | **Manual** | 3.3 s |
| 6 | `$10,000` → `WORKING PROTOTYPE` (`funded proof of concept`) → `MUSEUM PARTNER` (`partnership + larger funding`) → `FIRST FULL ROOM` (`future goal`) | A vertical funding path: grant → working prototype → museum partner → first full room. | **Manual** | 3.2 s |
| 7 | `FROM IDEA` , `TO PROTOTYPE` ; `$10,000 starts the path toward the first immersive room.` ; `SKETCH`, `WORKING PROTOTYPE`, `FULL ROOM` (`future goal`) | Final composition: sketch room → working prototype room → a full-room future-goal image (reuses the actual 3D room render), with arrows. | **Manual** | 2.8 s |

- **Main message:** $10,000 does **not** build the final room. It funds a **professional prototype** — eight concrete work categories — which makes possible a museum partner, larger funding, and eventually the first full room.
- **Facts presenter must explain (the grant story):** $10,000; location **The Franklin Institute, Philadelphia, Pennsylvania**; the **eight** funded work areas; the phrase **"Permanent room: a later phase + additional funding"** (scope qualifier); the **DESIGN → BUILD → TEST → PRESENT** process; the **funding path** ($10,000 → working prototype → museum partner + larger funding → first full room as a future goal). The presenter must emphasise the "prototype, not the finished room" distinction, which appears verbatim in beats 2, 6, and 7.
- **Claims that should NOT be made:** The presentation never claims $10,000 will build the full permanent room. Beat 2 explicitly *rejects* "A COMPLETE PERMANENT INSTALLATION". It never shows a line-item dollar breakdown. The museum silhouette and center room are schematic/illustrative, and the "FULL ROOM" future-goal image reuses the conceptual 3D room — it is not a funded installation or a confirmed partnership.
- **Recommended speaking time:** ~40 s. Slow down on beat 2 (the scope distinction) and beat 6/7 (the path), since these carry the actual grant argument.

> **Runtime confirmation:** The live DOM at Scene 4 returned every label above verbatim (the programmatic text dump matched the source exactly).

---

### Scene 5 — Imagine What This Room Could Become (`scene05`)

Returns to the live 3D room. Five manually selected worlds lead directly to the closing vision.

| Beat | Exact visible text | What appears visually | How it advances | Duration / pause |
|---|---|---|---|---|
| 0 | No text | Scene 4's future-room thumbnail opens like an iris; the retained live room pushes through while the blueprint sweeps away with a flash and motion blur. | **Manual** (Scene 4 → 5 entry) | 3.2 s |
| 1 | `INSIDE THE ATOM` | Luminous nucleus-like knot, four open energy strands, scattered microscopic particles; blue/cyan. | **Manual** | 3.4 s |
| 2 | `DEEP OCEAN` | Blue depth, caustics, sediment, bioluminescent particles, and a distant creature silhouette (whale). | **Manual** | 3.2 s |
| 3 | `HUMAN BODY` | Flowing instanced biconcave red cells, soft vascular projections, a paired heartbeat pulse. | **Manual** | 3.2 s |
| 4 | `BEYOND OUR REACH` | The body world fades under a short blackout. The projection and camera change to space while dark; the blackout lifts after the space world settles, with motion blur on the transition. | **Manual** | 4.0 s |
| 5 | `ANCIENT ROME` | Straight fluted columns, stone, coffer imagery on the ceiling, street silhouettes and flickering torchlight. | **Manual** | 3.4 s |
| 6 | `ONE ROOM.` / `ENDLESS PLACES TO GO.` | Fixed wide shot of the neutral room with this two-line closing statement. | **Manual** | 3.6 s |

- **Main message:** The same room can become the atom, the ocean, the human body, deep space, and ancient Rome. It is a reusable space, not a single exhibit — "ONE ROOM. ENDLESS PLACES TO GO."
- **Facts presenter must explain:** These are **procedural illustrations**, not final museum content. Name the worlds as they appear, then pause on the closing statement.
- **Recommended speaking time:** ~30 s, leaving time to name each world and deliver the closing line without rushing.

> **Runtime confirmation:** The five worlds remain manual holds and advance directly to the closing statement. Scene 5 stays on the regular exhibit bed; it contains no montage, synthwave sequence, recap flashes or montage cues.

---

### Scene 6 — The Ask (`scene06`)

Returns to the live room (backed by a softening blue/gold memory projection). This is the grant ask and the final line. All panels are clean Manrope typography.

| Beat | Exact visible text | What appears visually | How it advances | Duration / pause |
|---|---|---|---|---|
| 0 | No text | Briefly retain Scene 5's exact frame (~0.25 s), then blend into a detailed proposal hero room: blue/gold memory field, softened projections, reframed camera; seven rounded figures settle at retained visitor positions; architectural detail (ceiling baffles, screen frames, projector apertures, haze, small centerpiece) fades in. | **Manual** (Scene 5 → 6 entry) | 2.8 s |
| 1 | `$10,000` (huge) ; then `FOR THE FIRST` (line 1) / `PROFESSIONAL PROTOTYPE` (line 2) | The grant amount reveals, then the two-line purpose statement below it. | **Manual** | 2.6 s |
| 2 | `IDEA` → `PROTOTYPE` → `MUSEUM` `PARTNERSHIP` → `FIRST ROOM` (four stages with arrows) ; caption `A beginning — with partners and larger future funding.` | A horizontal path diagram connecting the four milestones; glowing markers and a curved line on the real floor. | **Manual** | 3.2 s |
| 3 | `START WITH ONE ROOM.` / `TOWARD THE FIRST IMMERSIVE ROOM.` ; four small room-outline diagrams | Expansion motif: four conceptual rooms in perspective (aspiration, not confirmed museum locations). | **Manual** | 3.0 s |
| 4 | `FIRST PROPOSED LOCATION — THE FRANKLIN INSTITUTE, PHILADELPHIA` | The proposal location line appears; a deliberate quiet beat before the final line. | **Manual** | 3.1 s |
| 5 | `DON'T JUST LOOK AT SCIENCE.` / `STEP INSIDE IT.` (second line emphasized/bold) | Small lighting swell, then a fixed final hold. **This is the last frame; it stays.** | **Manual** | 3.6 s |

- **Main message:** "$10,000 → the first professional prototype", which is a beginning that could grow into the first immersive room and eventually museums. Ends on the memorable line: **STEP INSIDE IT.**
- **Facts presenter must explain:** $10,000 is for a **prototype** (not a finished room — beat 2 repeats "FIRST ROOM" as an *eventual* milestone, and beat 3's four rooms are aspiration). The **Franklin Institute, Philadelphia** is named as the *first proposed location*. The path stages are proposal/aspiration, not secured deals.
- **Recommended speaking time:** ~25 s. Pause dramatically at beat 4 before delivering beat 5's final line.

> **CONTRADICTION (README vs code):**
> The README describes Scene 6 beat 3 as "*START WITH ONE ROOM. BUILD SOMETHING BIGGER.*" and beat 4 as "*BEYOND THE EXHIBIT / Immersive museum experiences*". The **actual code** (and live DOM) shows beat 3 = "START WITH ONE ROOM. / **TOWARD THE FIRST IMMERSIVE ROOM.**" and beat 4 = "FIRST PROPOSED LOCATION — THE FRANKLIN INSTITUTE, PHILADELPHIA". The README is out of date. Trust the code/runtime.

---

## C. Timed Sequences

**Fixed / automatic sequences (measured or code-specified):**

1. **Scene 1 opening (beat 0)** — auto-draws on launch for **3.1 s**, then holds. (Animation-clock positions: brainstorm 3.2 s, walk 7.4 s, doorway 12 s, room/title 20 s.)
2. **Scene 2 beat 6 (reusable environments)** — a single manually-initiated 8.2 s morph (Ocean → Space → Microscopic → neutral), no auto-advance.

**Fixed beat durations (animation clock, then indefinite hold) per scene:**

- Scene 2: 1.15 / 2.5 / 3.2 / 2.8 / 4.2 / 3.1 / 8.2 / 0.65 s
- Scene 3: 2.7 / 2.2 / 2.4 / 2.6 / 2.6 / 3.0 / 2.6 / 3.2 s
- Scene 4: 1.4 / 2.4 / 3.8 / 3.5 / 3.8 / 3.3 / 3.2 / 2.8 s
- Scene 5: 3.2 / 3.4 / 3.2 / 3.2 / 4.0 / 3.4 / 3.6 s
- Scene 6: 2.8 / 2.6 / 3.2 / 3.0 / 3.1 / 3.6 s

If you let every animation play to completion with no added pauses and no speaking, the total floor time is ~**135.6 s** across 41 beats. A strict 3-minute (180 s) talk leaves about 44 s for pauses and speech.

---

## D. Three-Minute Timing Plan (~180 s)

Workable budget. **Speaking** = presenter talks; **Silent** = let the visual play without narration. Scene subtotals sum to **180 s**.

| Scene | Beats | Speaking (over animation) | Silent viewing | Scene subtotal |
|---|---|---|---|---|
| 1 — The Idea Begins | 0–3 | 22 s (open line at beat 0, speak beats 1–2, speak title beat 3) | 3 s (let beat 0 auto-draw open) | **25 s** |
| 2 — What This Room Is | 0–7 | 29 s (narrate beats 0–5, visitor claim at 5) | 11 s (beat 6 environment morph; beat 7 line) | **40 s** |
| 3 — Why This Matters | 0–7 | 24 s (narrate as labels draw) | 6 s (Venn on beat 4, branches on beat 5) | **30 s** |
| 4 — From Idea to Prototype | 0–7 | 32 s (money/scope at 2, eight categories at 3, path at 6–7) | 3 s (beat 5 leadership holds) | **35 s** |
| 5 — Imagine… | 0–6 | 25 s (name worlds on beats 1–5; final line on beat 6) | 5 s (short holds) | **30 s** |
| 6 — The Ask | 0–5 | 17 s (grant ask beat 1, path beat 2, expansion beat 3, pause beat 4, final line beat 5) | 3 s (entry beat 0 breather) | **20 s** |
| **Total** | **41** | **149 s speak** | **31 s silent** | **180 s** |

**Guidance:**
- **Reserve the Scene 2 environment demonstration:** beat 6 runs for about 8 seconds; let visitors take in the room transformation.
- **Pause before advancing** at: Scene 2 beat 7 (deliver "ONE ROOM. UNLIMITED EXPERIENCES."), Scene 3 beats 4 and 5 (let the Venn/branches read), Scene 4 beat 2 (the "$10,000 → prototype, not the room" distinction), and Scene 6 beat 4 → 5 (the dramatic pause before STEP INSIDE IT).
- **Where time can be saved if needed (no slide changes):** shorten conversational pauses on low-density beats (Scene 2 beats 0–4, Scene 3 beats 1–3, Scene 6 beat 0).
- **Measured vs estimated:** All beat durations above are measured from the animation code/runtime. The 180 s split (152 speak + 58 silent) is the presenter's estimate — a natural pace fits this, but if you speak more slowly you must trim the conversational beats.

---

## E. Presentation Facts and Claims

Only facts the presentation actually establishes, with the scene/beat that establishes them:

| Claim / detail | Exact wording shown | Established in |
|---|---|---|
| Working title | `BEYOND THE EXHIBIT` | Scene 1 beat 3 (title); Scene 2 beat 0 (repeated) |
| Grant amount | `$10,000` | Scene 4 beats 2, 6, 7; Scene 6 beat 1 |
| Grant purpose | `FOR THE FIRST PROFESSIONAL PROTOTYPE` / scope: `A PROFESSIONAL` `PROTOTYPE` | Scene 6 beat 1; Scene 4 beat 2 |
| Proposed location | `THE FRANKLIN INSTITUTE` , `Philadelphia, Pennsylvania` | Scene 4 beat 1; Scene 6 beat 4 (`FIRST PROPOSED LOCATION — THE FRANKLIN INSTITUTE, PHILADELPHIA`) |
| Grant does NOT build the permanent room | `NOT: A COMPLETE PERMANENT INSTALLATION` ; `Permanent room: a later phase + additional funding.` ; `FIRST FULL ROOM` … `future goal` | Scene 4 beat 2 and beat 6 |
| What the grant funds (8 areas) | `3D ROOM DESIGN`, `IMMERSIVE VISUAL DEVELOPMENT`, `PROJECTION TESTING`, `SOUND + MUSIC DESIGN`, `LIGHTING TESTS`, `HOLOGRAPHIC-EFFECT PROTOTYPE`, `PHYSICAL MOCKUP + MATERIALS`, `MUSEUM-READY PROPOSAL` | Scene 4 beat 3 |
| Visitor capacity | `25–40 VISITORS` / `per experience` (33 figures shown) | Scene 2 beat 5 |
| Development process | `DESIGN` → `BUILD` → `TEST` → `PRESENT` | Scene 4 beat 4 |
| Funding / partnership path | `$10,000` → `WORKING PROTOTYPE` (funded proof of concept) → `MUSEUM PARTNER` (partnership + larger funding) → `FIRST FULL ROOM` (future goal) | Scene 4 beat 6; Scene 6 beat 2 (IDEA → PROTOTYPE → MUSEUM PARTNERSHIP → FIRST ROOM; caption `A beginning — with partners and larger future funding.`) |
| Founder / creative lead | `SILAS DAVIS` with interests `CODING`, `VISUAL DESIGN`, `MUSIC + SOUND`, `EXPERIENCE DESIGN`; collaborates with `SCIENTISTS`, `ENGINEERS`, `MUSEUM PROFESSIONALS`, `EDUCATORS` | Scene 4 beat 5 |
| Reusable room concept | `ONE ROOM.` / `UNLIMITED EXPERIENCES.` | Scene 2 beat 7; Scene 3 beat 0 (echo) |
| Five demonstrable worlds | `INSIDE THE ATOM`, `DEEP OCEAN`, `HUMAN BODY`, `BEYOND OUR REACH`, `ANCIENT ROME` (also `ATOM`, `SPACE`, `OCEAN`, `HISTORY`, `HUMAN BODY` in Scene 3) | Scene 5 beats 1–5; Scene 3 beat 5 |
| Closing vision line | `ONE ROOM.` / `ENDLESS PLACES TO GO.` | Scene 5 beat 6 |
| Final ask line | `DON'T JUST LOOK AT SCIENCE.` / `STEP INSIDE IT.` | Scene 6 beat 5 |
| Expansion aspiration | `START WITH ONE ROOM.` / `TOWARD THE FIRST IMMERSIVE ROOM.` (four conceptual rooms) | Scene 6 beat 3 |

**What is NOT established (do not claim):**
- No total project cost, no line-item breakdown, and no guarantee that $10,000 funds the full room (the presentation explicitly rejects this).
- No confirmed museum partnership or secured commitment — "MUSEUM PARTNER/PARTNERSHIP" are presented as the *next* step and "future funding".
- The expansion four rooms and the "FULL ROOM" future-goal image are **aspiration / concept**, not agreed locations or installed exhibits.
- The Franklin Institute silhouette and the prototype center room are **schematic/illustrative**, not architectural drawings.

---

## F. Verification

**Source files inspected (primary):**
- `src/main.ts`, `index.html`, `src/presentation/PresentationController.ts`, `src/presentation/PresentationScene.ts`, `src/presentation/sceneRegistry.ts`
- `src/audio/AudioManager.ts`
- `src/scenes/scene01/`: `Scene01.ts`, `timeline.ts`, `scrapbook.ts`, `cues.ts`, `room.ts`, `scene01.css`
- `src/scenes/scene02/`: `Scene02.ts`, `state.ts`, `timeline.ts`, `cues.ts`, `features.ts`, `scene02.css`
- `src/scenes/scene03/`: `Scene03.ts`, `scrapbook.ts`, `timeline.ts`, `cues.ts`, `transition.ts`, `scene03.css`
- `src/scenes/scene04/`: `Scene04.ts`, `scrapbook.ts`, `timeline.ts`, `cues.ts`, `handoff.ts`, `scene04.css`
- `src/scenes/scene05/`: `Scene05.ts`, `state.ts`, `timeline.ts`, `worlds.ts`, `projections.ts`, `cues.ts`, `handoff.ts`, `scene05.css`
- `src/scenes/scene06/`: `Scene06.ts`, `state.ts`, `timeline.ts`, `layout.ts`, `heroDetails.ts` (referenced), `cues.ts`, `handoff.ts`, `scene06.css`
- `src/styles/global.css`, `README.md` (for cross-checking)

**Runtime checks actually performed:**
- Launched the Vite dev server and drove the app with the installed Playwright + Microsoft Edge (headless, SwiftShader). Stepped **every beat** across all six scenes (`Scene 1 → 2 → 3 → 4 → 5 → 6`), confirming each scene's beat count (4/8/8/8/8/6) and beat names via the live `snapshot()`.
- Confirmed Scene 5 has seven manual beats: the five individual worlds lead directly into the closing statement, with no montage, synthwave track or automatic recap.
- Read the rendered DOM text on Scene 2, 4, 5, 6 and confirmed the exact strings (Scene 4 returned every label verbatim; Scene 2/5/6 labels and final lines confirmed).
- Confirmed no browser console **errors** (only benign pre-existing GSAP "target not found" warnings tied to cross-scene selectors; these did not break navigation).

**Uncertainties / limitations:**
- **Audio routing and assets were verified** with `npm run test:audio` and the scene browser checks. Nine impact cues use distinct generated 48 kHz stereo WAVs; three use the newly supplied bass drops at the Scene 5 arrival, black-hole hit, and Scene 6 final resolution. The regular exhibit bed continues through Scene 5 and Scene 6 switches to its closing bed. Browser checks confirm those requests and scene cue hooks; they do not replace a listening review on museum playback hardware.
- The visual quality/contrast of the worlds was rendered headless via software (SwiftShader) at 1× scale; exact rendered *appearance* is coded but I did not do a photometric review of the projected imagery.
- The practice/production note in the README says narration text is used as speaker notes; I reported narration guidance in the scene tables only where it names content, but the visible-on-screen text is what was verified.

**Note on the README:** The README is otherwise highly detailed and largely accurate, but Scene 6's beat 3 and beat 4 descriptions are **out of date** relative to the current code (see the contradiction callout in Section B, Scene 6).

## G. Current Quality Checkoffs (2026-10-27)

All listed checks passed against the current browser build unless marked as a listening limitation above.

| Area | Quality checkoffs | Result |
|---|---|---|
| Scene 1 — opening | Simple `Beyond the Exhibit` title, opening draw, paper-to-room transition, beat holds, and navigation | Pass |
| Scene 2 — room tour | Projector, surround sound, lighting, hologram, and visitor features receive distinct camera moves; reuse comparison remains fixed; labels and transitions remain legible | Pass |
| Scene 3 — rationale | All eight beats, room-to-ink handoff, text safe margins, holds, and navigation | Pass |
| Scene 4 — prototype proposal | All eight beats, funding scope and claims, readable labels, then the thumbnail-to-live-room iris/flash/motion-blur handoff | Pass |
| Scene 5 — worlds and finale | Five manually selected environments including Rome, temporal postprocessing blur and shader flashes on transitions, direct closing statement, no montage or synthwave playback, and Scene 4↔5 handoffs | Pass |
| Scene 6 — ask | Closing music bed, final copy readability, camera motion, holds, navigation, and handoff | Pass |
| Cross-scene behavior | Rapid scene jumps, queued navigation, audio settings on `D`, debug overlay on `Shift+D`, reveal interruption, hash/fullscreen, retained-room ownership, and disposal without resource growth | Pass |
| Generated and supplied audio | 9 distinct procedural impact WAVs plus 3 supplied MP3 drops; RIFF/PCM integrity, MP3 headers, duration/level mapping, and no old sampled boom mappings | Pass |
| Build and browser console | Production build succeeds; scene runs report no browser console errors | Pass |

**Commands run:** `npm run build`, `npm run test:audio`, `npm run test:scene`, `npm run test:scene3`, `npm run test:scene4`, `npm run test:scene5`, `npm run test:scene6`, `npm run test:navigation`, and `npm run test:handoff`.
