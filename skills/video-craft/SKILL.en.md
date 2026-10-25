---
name: video-craft
description: Cut real-person talking-head vertical short videos so they feel native to the platform. Uses Remotion for text layouts, scene changes, padded pauses and sound effects, and keeps everything inside the social-media safe zone. Use for: talking-head editing, Douyin-style refined cut (精剪) with B-roll / small portrait-window PIP / split screen / poster hero text, Douyin (抖音) / Reels / Shorts vertical video, captions that are too long or run out of bounds, footage that feels flat, "use that JianYing/CapCut (剪映) kinetic-caption look", kinetic captions, typography pairing (fonts / colors / size ratio / position / layout families), text animation presets (entrance animations), safe zone. Needs a 1080×1920 talking-head video; a script helps.
---

# video-craft: cut talking-head videos so they feel native

中文版: see SKILL.md. Reply in the user's language.

**Goal**: a student takes one real-person talking-head clip and cuts it, by these rules, into a vertical short video that has rhythm, has visuals, and keeps its text inside the bounds.
The rules come from: statistics over 70 JianYing/CapCut (剪映) talking-head projects, plus pitfalls from real finished videos (the maintainer's own finished videos). **Every rule is tagged with its source; anything not verified is marked as such.**

> Read the details in `references/en/` first; when picking layouts, open the library page (`docs/library.html`), where every layout has a preview.
> If you want the **Douyin refined cut** (精剪) look (dense footage, a visual change every 1.5–3 seconds) → read `references/en/douyin-jingjian.md`.
> **Matting · text behind the person · glass text** → `references/en/text-behind-glass.md`.
> **Industry presets** (4 style families + 3 theme presets) → `references/en/industry-styles.md`; **exact SFX timing / level / animation pairing table** → `references/en/sfx-timing.md`.
> **Which props each layout takes in edit.json** → `references/en/edit-json.md`.
> **Sound pipeline / synthesised sound effects / hooks & effects / font licences** → `references/en/audio-pipeline.md`.
> **The skeleton of a video** (hook → content routine → breathing → ending action; the arrangement shared by 64 finished videos) → `references/en/essence.md`, **read before laying out a video**.
> **How to pair text** (fonts / colors / size ratio / position, layout families) → `references/en/typography-pairing.md`; **how text moves** (38 entrance animations, 18 presets) → `references/en/motion-vocabulary.md`; **frame-by-frame measured animation curves** (5 presets rewritten from them and verified in a closed loop) → `references/en/motion-measured.md`.
> Answer in whatever language the user speaks. 中文: see `SKILL.md`.

## 0. Confirm before cutting (ask if anything is missing, don't guess)
> **When you can't ask** (automation / the user said don't): defaults — treat the video as valid, platform Douyin, use the transcript as the script, face not large, no matting; **ending action**: if the speech already contains a call to action (tap bottom-left, DM me), use those words; if not, **leave the ending pill out**, never invent an account. State these defaults in your report.
1. Video: 1080×1920, a talking-head with a voice track? If not, don't cut yet.
2. Platform: Douyin / Reels / Shorts (decides the safe zone; default is the set below).
3. Is there a script? Yes → use it to proofread typos; no → transcribe first.
4. Is the face very large (close-up)? Yes → shift the frame up and scale up first, see §3.2.
5. Can matting be used? Matting only runs on macOS (Apple Vision); if it can't run, don't pick "reporter" (记者出镜).

## 1. Workflow (in order, don't skip)
> Commands and measured numbers for sound, captions and tightening: `references/en/audio-pipeline.md`; every script is in `tools/audio/`. **The starter project `remotion/` is where the video gets rendered** (see §9).
1. **Clean the sound first**: `tools/audio/denoise.py` (ambient noise: cafés / air-con / street; close-mic recordings with a low noise floor don't need it); music / BGM under the speech → `vocals.py` (Demucs).
2. **Transcribe + proofread**: `tools/audio/transcribe.py` (a normal pass + a filler-word pass, and it lists low-confidence words). **Recognition mishears** (mixed languages, accents, proper nouns; e.g. 「销冠」→「消关」, 「me time」→「秘态」) → every word below 0.6 confidence **must be confirmed with the speaker**; captions use the proofread text. You can't actually "hear" the audio — don't say you did.
3. **Split into beats + hook**: 8–12 segments by meaning: hook (0–8s) → story/problem → turn → method → punchline → closing action. Read `references/en/essence.md` for the arrangement. **The hook triple (script + picture + sound)**: script = his strongest line, reordered, plus one concrete number (never add things he didn't say); picture = `camera: punch` / `white-flash` / `kinetic-line` / `counter-slam`; sound = automatic.
4. **Tighten + captions**: `tools/audio/tighten.py` (force-align to characters → delete re-takes / fillers with `[ ]` `{ }` → squeeze pauses → captions ≤12 width → jump-cut points). Speech-rate target 4.5–5.0 syllables/s. Only talkers who read in one breath, too fast, need `tools/build_master.py` to pad pauses (0.2–0.45 s, freeze + silence, with one shot-size change).
5. **Assign layouts / effects**: apply the rhythm rules in §4 and the selection tables in §5. **Change the picture at most every 5 seconds**; draw every "thing being talked about" (circle avatar / shrink into a phone / TV off / real screenshots), no abstract decoration.
6. **Pin the timing**: the appearance time of each word/visual = the **start time** of that spoken word. `tighten.py` / `make_captions.py` already give real caption times; look up key words with `make_captions.py --find`.
7. **Add sound effects**: the `Edit` `autoSfx` (on by default) pairs them per layout / preset / effect using the 34 bundled original synthesised sounds; see §6.
8. **Render + check**: set `guides` and render stills with the **safe-zone red box** (`node scripts/stills.mjs`), inspect each by eye, then `npm run final`; then `tools/audio/master.sh` (−15 LUFS) + `qa.py`. See §7.
9. **No BGM by default, and none is bundled** (licensing). If a student wants it: `tools/mix_bgm.py` (fade in / duck on punchlines / fade out, −15 LUFS).

## 2. Hard rules (break one and you redo the work)
| Rule | Explanation | Source |
|---|---|---|
| **Safe zone** | All text sits entirely inside x 60–1010, y 250–1250; where y>900 the right edge pulls in to 950 | Maintainer's two corrections; the bottom 35% is covered by caption copy + buttons |
| **Captions: at most two lines, each line ≤12 characters** | If it overflows, break the line at punctuation; the bottom edge sits at y≤1230 | Maintainer "the captions are too long every time" |
| **Text never covers the face** | When the face is large, text goes only in the "chest band" (胸口带) y≈880–1250; when a card is on screen, push the face up / switch to a portrait window | Finished videos in practice |
| **One giant word per segment** | Use small captions for everything else; if every block is colored, the emphasis is diluted | Review feedback |
| **Two layers of rhythm** | **Scene change** (the whole-screen composition changes) every 5–10 seconds; **visual change** (text block pops, push in, footage, small window) every 1.5–3 seconds. About 1/3 of the time is not a full-screen front-facing shot | Review feedback + maintainer "change it every 5–10 seconds"; reference videos "a visual change every 1.5–3 seconds". The two layers are a framing used to reconcile the two rules when writing this up, not a quote from the reference videos|
| **The hook needs "something"** | Give a visual in the first 3 seconds (card / curve / phone / punch-in / white flash), not captions alone; script = his strongest line + one concrete number | Review feedback |
| **Sound sticks to the text** | The sound hits on the **same frame** the text appears (88% of SFX start on the same frame as the text); about 1/3 of text blocks stay silent (room to breathe) | 70-talking-head statistics (see §6) |

## 3. Picture framework (real-person talking head)
### 3.1 Camera
- Handheld shake: stack several sine waves of different frequencies; in the first second the hand isn't steady yet (amplitude ≈ ±7px / ±0.2°).
- Jump cuts: each sentence alternates between two zoom levels with a hard cut, pushing in around the face as the center. **The author's own edits use 1.15× / 1.20×; the JianYing data median is 1.1×. The starter's `Edit` defaults to `zoom:[1.0,1.12]`; for the author's values write `"zoom":[1.15,1.2]` in edit.json.**
- Emphasis beat: at the instant of the key word, push in **+0.09**, decaying back over 0.18 seconds.
**Data check** (video tracks of 73 JianYing talking-head projects, `template.json.bak`): the clip scale of the portrait has a median of **1.1×** (p10 0.8 / p90 1.4); **54%** of the 1614 video segments are re-scaled (= punch-in jump cuts); **64 of 73 projects use masks** — circle 131, rectangle 120, linear 33, mirror 11, pen 3 (portrait windows are mostly circles and rounded rectangles); 0.9× slow-motion is used 27 times (for dramatic pauses); beauty-type effects are applied to the portrait a lot (about 270 places; this library has none).
### 3.2 When the face is large (close-up talking head, chin at about y860–940)
Shift the whole frame **up 120px and scale it up ≥1.12×** (without scaling, the bottom edge shows), and squeeze the text into the ~370px "chest band" between the chin and y1250. Lay out the layout coordinates starting from y≈1050, and use `<Zone>` to shift the whole thing up 150px.
### 3.3 Ending
Shrink the person to 0.56× and put them in the center, put the giant word above the head (y≥250), and the signature card below (≤y1240).

## 4. Rhythm numbers (70 JianYing talking-head projects, finished videos from 66 industries, median length 23.5 seconds)
| Metric | Median |
|---|---|
| Text segments / minute | ~69 |
| Sound effects / minute | ~39 |
| Duration of a single text segment | 1.22 seconds (p25 0.88 / p75 1.72) |
| Sound effect relative to text start | 0.00 seconds (same frame) |
| Share of text with a sound effect following | 66% |

⚠ This is the density of **15–60 second short videos**. This skill's 66-second sample used about 44 sound effects/minute (close). For longer videos don't copy 69 text blocks/minute (it wears people out); use high density on the heavy hits (hook / turn / punchline / signature) and drop the rest to about 40/minute — **this is a judgment call from experience, not validated by data**.

## 5. Layout / scene-change selection table (previews in the library)
**Text layouts** (overlaid on the talking-head video, placed in the chest band):
| id | Library # | When to use |
|---|---|---|
| `chest-big` | 23 | One setup line + one key word (most common, at least 3 per video) |
| `strike-swap` | 24 | Correcting a misconception: the old wording gets struck through, the new one slams in |
| `left-stair` | 53 | Progression: cause → process → result |
| `a-to-b` | 41 | Cause and effect / "the more A, the more B" |
| `two-column` | 17 | Two options side by side (A｜B) |
| `bars` | 9 | Two parallel points (highlighter bars) |
| `vertical-wall` | 35 | A key word of 2–4 characters, stuck vertically on the right wall |
| `dark-question` | 27 | Low voice, rhetorical question, suspense (at most 1–2 per video) |
| `chapter` | — | Explaining steps: 01/02 + checkmark card |
| `giant-fill` | 25 | Landing punchline (at most 1 per video, save it for the last sentence) |
| `typed-quote` | 38 | Quote / punchline: black background round window + typed out character by character |
| `signature` | — | End signature card |
| `top-title` | skeleton | Two-line series name pinned to the top for the whole video (needs room above the head) |
| `stack-list` | skeleton | Stacking list, older lines dim as a new one lands (≤3 lines + closing word) |
| `end-cta` | skeleton | Ending blue pill + arrow to the bottom-left (wording supplied by the user) |
**Scene changes** (replace the whole picture, used to break up "the same front-facing shot"):
| id | When to use |
|---|---|
| `split-retention` | Hook / talking about "nobody watches to the end": retention-curve card on top + portrait window below |
| `split-compare` | "Messy vs. aligned": comparison chart on top + portrait window below |
| `phone-swipe` | Talking about "swiping away": the talking head sits in a phone, which swipes up and away at the key line |
| `reporter` | Explaining steps: card + matted person standing in front (needs matting, macOS only) |
**Douyin refined cut · footage types** (cut to whatever footage matches the noun being said; footage is not bundled, pass it in as `broll`):
| id | When to use |
|---|---|
| `pip-broll` | Talking about a concrete noun: footage full screen + you shrunk into a white-bordered small round window (position rotates among top-right / top-left / bottom-center) |
| `split-broll` | Showing while talking: you on top, footage below + a yellow label tag (标签牌) naming it |
| `broll-bottom` | The lightest footage insert: footage slides up from the bottom and covers the lower half of the screen (captions must make way) |
| `poster-hero` | A key noun / pain-point word: full-screen poster darkened 40% + gold (benefit) / red (pain point) giant text, slowly growing |
Parameters and scenarios to avoid for each: `references/en/layouts.md`; the full refined-cut recipe: `references/en/douyin-jingjian.md`.

**How to pair text** (5 typographic pairings, overlaid on the talking-head video, placed in the chest band):
| id | When to use |
|---|---|
| `label-hero` | Small label + big text stacked (numbers, keywords readable at a glance) |
| `spread-hero` | Big text with widened letter-spacing (1–3 characters, the hardest-hitting line) |
| `ghost-word` | Giant background word (semi-transparent) + one small line that names the point |
| `quote-card` | Quote card: darkened blurred background + numbered small label + keyword in yellow + source |
| `chapter-tag` | Chapter tag: "01 ▶ title" yellow block + dashed box |
**Pairing formula** (from statistics over 81–88 layouts, full-parse version; details in `typography-pairing.md`): ① white as the base + **one** accent color (yellow = benefit / red = pain point; 80% of layouts use only 1–2 colors) ② ≤2 fonts: serif bold for the hero word (主角词), sans-serif for the supporting text ③ supporting : hero ≈ 1 : 2, giant text at ≥4× only 1–2 times per video ④ ≤3 lines ⑤ everything inside the safe zone. The four typesetting principles (alignment / contrast / proximity / repetition): one alignment per video; the hero word is obviously the hero; related lines sit close together; parallel content uses the same style.

**Text behind the person / glass text** (`TextBehind` / `GlassWord`): `text-behind` (background → text → matte PNG on top) · `glass-hero` glass text (translucent gradient, the texture behind shows through) · `glass-behind` both together. Three hard rules: glass text **must not be wrapped in an element with transform / opacity / filter** (so not inside `Zone` / `FitBox`); the text must be in the **same camera container** as the video; the background needs light/dark variation. 🔴 **The text must be readable at a glance — the person may cover only a little of it** (8–20% on average, ≤30% at most): make headroom with `Headroom` first, then measure with `tools/check_text_visible.py`; frames without a matte draw no text. Matting is macOS only (`tools/mk_matte.py` for people, `tools/mk_subject_matte.py` for any subject).

**Emotion words** (one word carries one emotion, `EmotionWord`): `emo-cry` crying (red fills from the bottom) · `emo-surprise` surprised (two characters bob out of phase) · `emo-joy` joy (pulsing radiating light) · `emo-shout` shout (outward tilt + echo). 1–2 per video; put them in the chest band (the original pack puts them above the head; there is no room in this library's framing). ⚠ Only the **text** part is built; the pack's tears / "真香" glow-and-wings are JianYing **face effects** and are not built.

**How text moves** (18 entrance-animation presets, the `preset` of `MotionText`): `fade` `slide-up` `reveal-up` `curtain` `roll-in` `leap` `grow` `grow-soft` `shrink` `slam` `glow-blur` `blur-left` `rise-random` `wave-bounce` `typewriter` `develop` `tracking-in` `echo`.
Rules (statistics over 70 projects): entrance **0.4 seconds** (0.3–0.5; blur/glow types 0.7); **52% of text has no animation at all, 45% has only an entrance, 2% has an exit** — save animation for the key words, don't animate every word; change the entrance on each sentence; heavy-hit words get `slam`/`shrink`/`echo` + a heavy sound effect. Choosing an animation by function: `references/en/motion-vocabulary.md` §3.

## 6. Sound effects
**Principle**: one **different** sound per animation; don't use only 10 sounds across the whole video. Set peaks at −11 ~ −20 dBFS; transition sounds lower (≈−22 ~ −26).
**Pairing** (from the 70-talking-head statistics + real-world use; the id is the semantics, you supply the files yourself):
| Animation / moment | Sound-effect semantic id |
|---|---|
| Typing cursor / typed out character by character | `type` `typing` |
| Blur glow, soft, emotional | `drip` `bowl` |
| Random rise / opening (knowledge) | `paper` |
| Shrink / heavy hit / emphasis | `peng` `stamp` `dong` `fist` `clang` `heavy` `filmdong` |
| Enlarge / numbers / key points | `click` `ding` `ding3` `tishi` |
| Rolling in / talking about money | `cash` `gold` |
| Transition / change of topic | `sou` `sou2` `hu` `shua` `wind` `zoom` `page` `whoosh` |
| Disappointment / swipe away / rhetorical question | `sigh` `huh` `sus` `eerie` |
| Correct (✓) / confirmation | `correct` `bowl` |
| Magic / reveal | `magic` `fairy` `chime` |
All 57 ids and their semantics: `references/en/sfx-pairing.md`.
**A set of 34 original synthesised sound effects is bundled (`remotion/public/sfx/`, no licensing issue)**; the `Edit` `autoSfx` pairs them by "preset / layout / effect → sfx id + volume" (`craft/autosfx.ts`), placing each on the text's frame 0 (the text only becomes visible 1–3 frames later because of its entrance animation, so it sounds slightly early, never late); about 1/3 of the text blocks stay silent. **Whether the synthesised sounds sound good has to be judged by ear** — if not, edit `tools/audio/make_sfx.py` and rerun. The 57-id semantic table above is statistics from the JianYing sample; to use your own sounds name them `lg-<id>.mp3`, put them in `public/sfx/` and list them by hand in edit.json's `sfx`.

## 7. Checklist (go through it item by item before delivering)
- [ ] Starter project: set `"guides": true` in edit.json and sample one frame per layout with `npx remotion still …` (only the old preview compositions were called `*-guides`). **Set it back to `false` before the final render and use `npm run final` (it runs `scripts/check-edit.mjs` first and refuses to render with the red box still on):** **all text is inside the red box** (x60–1010, y250–1250, where y>900 right edge 950)
- [ ] Captions ≤2 lines, each line ≤12 characters
- [ ] The hook (first 3 seconds) has a visual, not just captions
- [ ] A scene change every 5–10 seconds; about 1/3 of the time is not a full-screen front-facing shot
- [ ] One giant word per segment
- [ ] No repeated sound effect across animations; about 1/3 of text blocks silent
- [ ] Loudness −15 LUFS, true peak ≤ −2 dBFS
- [ ] **Listen once, watch the motion once** (stills can't show the feel; see "Known limitations" below)

## 8. Known limitations (don't pretend they don't exist)
- **No automatic out-of-bounds detection**: it relies on `Txt/FitBox` measuring width at render time → shrinking → pushing back, plus eyeballing the red box. Character-by-character typed text and nested text can still be off by a few pixels.
- **The feel of the motion can only be judged by a human**: a still check can't tell the force of a text slam or the timing of a fade-out.
- **Matting is macOS only** (Apple Vision).
- **Sound effects / BGM are not bundled** (copyright).
- **Text pairing / animation not finished**: white-background small-block list, white-border matted sticker, viewfinder / REC / scan lines, scattered / diagonal staggered layout, the face-effect part of emotion words, chat-bubble CTA, pinyin annotation; particle-type / 3D-type / light-effect transition animations, exit animations, looping animations (see the "not built yet" section of the two references).
- Animations were verified only on **still frames (mid-motion moments)**; the speed curve was not checked frame by frame; the animation scale factors are estimated from frames.
- The hook is currently a "card"; the TV-color-bars + beep ("嘟") kind of hook is not built yet.
- **The footage (B-roll) itself is not bundled**: the refined-cut components contain a placeholder picture; for real use pass in real footage / stock / AI images; torn-paper / motion-blur transitions, black-out spotlight, square-window PIP, and automatic footage-point picking are **not built yet** (see `douyin-jingjian.md`).
- "21–47 cut points per minute in the refined-cut area" is a measurement from August; it was not re-measured this time.
- The component for a real-footage ending (real picture + matting + signature) is **still TODO**.

## 9. Where the code is
**A runnable starter project: `remotion/`** (`npm install` → put the video in `public/` → write `edit.json` → `npm run check` → `npm run final` (it blocks a final render with the red box still on); details in `remotion/README.md`). **Don't rewrite one elsewhere — use it.**
**Copy first, then use**: once installed as a plugin these files live in Claude's cache directory, which is wiped on update — **don't `npm install` or put videos in place**. First copy the whole `remotion/` folder into the user's working folder (`cp -R <the directory you read this SKILL.md from>/remotion ./my-video`) and do everything in that copy; `references/` and `tools/` stay where they are, read-only.
`remotion/craft/`: `kit.tsx` (SAFE, Zone, Txt/FitBox, themes) · `layouts.tsx` (12 layouts) · `scenes.tsx` (4 scene changes + 4 refined-cut footage types + `LabelTag`) · `typo.tsx` (5 typographic pairings) · `motion.tsx` (18 entrance-animation presets, `MotionText`) · `emotion.tsx` (4 emotion words) · `glass.tsx` (glass text `GlassWord` + text-behind `TextBehind`) · `gallery.tsx` (preview compositions + layout registry).
Tools: `tools/` (pause padding, BGM mixing, BGM analysis, sound-effect library build).
