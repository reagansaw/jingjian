# Douyin refined cut (抖音精剪) recipe

"Refined cut" (精剪) = adding **dense picture-layer changes** on top of a talking head: footage (B-roll), small portrait window (PIP), split screen, poster hero text (hero 字), label tags (标签牌), paired with dense sound effects.
This document turns the "Douyin refined cut" (抖音精剪) into executable rules.

## Sources and credibility (read this first)
| Source | What it is | What was done with it |
|---|---|---|
| 3 reference videos (editor kiki's tutorial on **rough cut (粗剪) vs refined cut (精剪)**: rough cut on the left, refined cut on the right, the JianYing/CapCut (剪映) timeline at the bottom) | The recipe was extracted frame by frame in August | This time the maintainer **looked again** at extracted frames of one of them: side-by-side comparison, full-screen footage + small portrait window, full-screen poster, red keyword text, consistent with the recipe |
| A commercial JianYing talking-head template pack (99 projects, not included here; each project has a plain-text `template.json.bak`) | Caption styles, animation names, sound-effect names and placements were extracted | From the earlier teardown conclusions; not redone this time |
| The maintainer's ad "Douyin color rules" (抖音色规) | Red = pain point, cyan = benefit | From the finished video at the time |

⚠ **"21–47 cut points per minute in the refined-cut area" is a measurement from August; it was not re-measured this time.** The bottom half of the reference videos is a static JianYing timeline, so global shot detection gets diluted — to measure, **first crop to the refined-cut area (top right) and then detect** (threshold 0.12).

## First law: a visual change every 1.5–3 seconds, audio continuous
The audio doesn't break; only the picture layer changes. ⚠ This does not conflict with the main SKILL's "change the **picture** every 5–10 seconds"; they are **two layers**:
| Layer | Rhythm | Examples |
|---|---|---|
| **Visual change** (any kind) | Every 1.5–3 seconds | A text block pops, an emphasis-beat push-in, footage enters, the small window changes position, a label tag appears |
| **Scene change** (the whole-screen composition is replaced) | Every 5–10 seconds | Card / black-background round window / phone / split screen / full-screen footage |
(The "two layers" framing was written to reconcile the two rules, **not a quote from the reference videos**.)

## 6 layouts in rotation (reference videos)
| Layout in the reference videos | Equivalent in this library | Status |
|---|---|---|
| Full-screen talking head | Default picture (`camZ` shot-size alternation) | ✅ |
| B-roll slides in from the bottom | `broll-bottom` | ✅ new |
| Full-screen B-roll + PIP small window (round avatar or white-bordered square window, position rotates among top-right / top-left / bottom-center) | `pip-broll` | ✅ new (round window) |
| Top/bottom split screen (person on top, footage below) | `split-broll` | ✅ new |
| Footage in a phone frame | `phone-swipe` (the talking head goes in the phone; to put footage there you have to swap the content yourself) | ⚠ partial |
| Full-screen AI poster image + giant text | `poster-hero` | ✅ new |
**The footage (B-roll) itself is not bundled**: the components contain a placeholder picture; for real use pass real footage / stock / AI images in as `broll`.

## Text, 3 layers
1. **Persistent bottom captions** (as usual).
2. **Poster giant hero text (hero 字)**: appears only for key nouns, gold (benefit) or red (pain point), **slowly grows across shots**, and darkens the whole frame by 40% when it appears (`poster-hero`).
3. **Yellow label tag (标签牌)**: names the footage, e.g. 「3 号海洋塑料清理装置」 ("No. 3 ocean plastic cleanup device") (`LabelTag`, ≤12 characters).

## Caption style (shared foundation of the template pack)
- White bold + **black outline (13% of the font size)**, no background block.
- Keywords change color: yellow (benefit) / red (pain point).
- The original recipe hangs the captions at **60–72% of the frame height** (y≈1150–1380). ⚠ **This conflicts with the safe zone** (lower edge 1250). This skill takes the intersection: **captions y ≤ 1230**, i.e. only the 60–64% stretch is used, the rest yields.
- At the instant a hero text appears, the captions make way (don't overlap the giant text at the same y — "the caption cutting across the middle of the giant text" is a pitfall already hit).

## One entrance animation per sentence ("women's emotion" (女性情感) template)
- Rotate a different entrance animation for each sentence: random rise / leap / typing cursor / fold / shrink.
- Key words are enlarged **inline** by about 2.25× and recolored golden yellow / dark red (not a separate hero-text layer).
- **Beat grammar**: a key word **takes a beat to itself**, with the whole line enlarged (closer to the original than "a giant word embedded in a long sentence"); the longest 1–2 giant-word beats can be paired with full-screen semi-transparent floating text.

## Effects and sound effects
- Effects (read directly from the timeline): 1.1× speed change, motion-blur transition, torn-paper transition, filter, thought-bubble sticker, black-out spotlight. (This library has **not built** the torn-paper / motion-blur transitions / spotlight yet.)
- The sound effects are **very dense**: one is laid under every layout switch, footage entrance, and giant-text pop. → See `sfx-pairing.md`; one **different** sound per animation.

## B-roll pattern: whatever noun is being said, cut to matching footage
- Picking points: one point every 8–12 seconds; don't cover the first 3 seconds of the hook; each point 1–6 seconds; rotate layouts; labels ≤12 characters.
- Three sources of footage:
  - **Concepts / objects (about 80%)**: stock (Pexels / Pixabay) is enough, **no need to distinguish ethnic Chinese**.
  - **Needs people / local / a specific product**: **your own footage (first-class)** or **AI generation** (image → video).
  - With no real footage, use an AI poster image (the eagle/wolf/snake poster for "引来天敌" ("attracting natural predators") in the reference video was AI).
- The second half of AI video often warps → take only the clean stretch, and slow it down if it isn't long enough.

## Copyright (must be observed when open-sourcing)
- Music/sound effects in the JianYing cache and audio files in the template pack are **licensed for use inside JianYing only** and cannot be republished — "can be downloaded" does not mean "can be made public". Fonts are the same.
- Approach: use the **acoustic fingerprint as a recipe** (measure duration / peak position: peak at the head = impact, early-middle = whoosh, tail = rising tone), then find a replacement with the same fingerprint from a **commercially usable source**.
- ⚠ **"Free to use" ≠ "may be redistributed with the repo"**: the licenses of sites like Mixkit / Pixabay usually **do not allow redistributing audio files on their own**. To put sound effects into an open-source repo, choose **CC0** sources and **check the license of each one**; otherwise only include a download script/links and let users download them themselves. (The license terms were not checked site by site; please confirm before publishing.)

## Not done yet (honest)
Torn-paper transition, motion-blur transition, black-out spotlight, thought-bubble sticker; square-window PIP; footage in a phone frame; a text component for inline key-word enlargement + entrance-animation rotation; automatic B-roll point picking / sourcing (built in a separate backend in August, not moved into this library).
