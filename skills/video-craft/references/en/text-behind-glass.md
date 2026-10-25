# Matting · text behind the person · glass text

Answers: **how to put big text behind the person (so the person covers it a little), and how to make big text with a translucent "glass" look.** They can be used separately or together (glass text behind the person looks the most premium).

## Source and reliability (read first)
- The recipe comes from a technique the author used repeatedly in a series of ads (glass text: the same text stacked in two layers — one translucent to fix the colour, one with a hard-light blend that lets the background through; text behind the person: background → text → a matte PNG on top). This library rewrites them as original components `GlassWord` / `TextBehind`.
- **Does the original pack use this? Yes (data)**: **62 of 73** projects contain matte material (the `videos[].matting` flag, 259 segments in all), and **196 of 2684 (7.3%)** text segments are covered ≥50% in time by a matte segment on a **higher track** — track order = layer order, so a matte copy above the text is "text behind the person". Examples: the emotion words in 1-3 (消失 / 落伍 / 没节奏 / 哭泣 / 惊讶 / 非常开心 / 救命) mostly use this stacking. ⚠ Limits: only **time** overlap was compared, not spatial position; the `matting` flag is not necessarily a person (could be an object cut-out); **Correction**: my earlier "there is no section-label track" was a miss — track 13 of `1-3-文字排版` is exactly that, split by function: opening view (0–24 s) / raising the question / pain point / emotion / punchline / number / framework summary / quote·memory / closing call to action (162–168 s). Track names are empty and `time_marks` has only ids; the labels are stored as **text segments**. For the other projects I only spot-checked 1-1 and 3 industry projects (none there), not all of them.
- **Verified**:
  - Placeholder figure + wooden wall: the **light/dark texture of the wall slats shows through the glass text** (checked zoomed in); the figure covers the text.
  - **A real talking-head clip + 304 frames of per-frame matting**: after making headroom, the gold glass text sits above the head and the hair covers only a little of its lower edge (measured: 13.6% on average); the text reads clearly; the hands and body are in front of the text, the hair edges are clean (still frames at 3 moments were checked). The first version (text at head height) was covered 49.9%, failed, and was discarded.
  - The `lift` subject-matting tool: one frame gives a clean PNG (person, hands and clothes cut out cleanly, with a small leftover patch beside the shoulder); the per-frame script ran on 5 frames.
- **Not verified**: motion (does per-frame matting flicker?), matte edges under different lighting / backgrounds, long windows, non-macOS, frames with no clear foreground subject.

## 1. Glass text (`GlassWord`)
One hero word with a gold gradient, but the **light/dark texture of the picture behind shows through the text**, like frosted glass.
- **How**: the same text stacked in two layers — a base layer of ordinary translucent gradient (`baseAlpha` 0.28, fixes the colour plus a slight shadow) + a top layer with `mix-blend-mode: hard-light` (`lightAlpha` 1, lets the background texture through).
- **Three hard rules (break one and the glass look disappears)**:
  1. The two layers **must not be wrapped in any element with `transform` / `opacity` / `filter`**, or the hard-light blend only blends with a "transparent backdrop". So **`GlassWord` must not go inside `Zone` / `FitBox`** (both use transform); the component sizes itself with `fitSize` and its entrance animation only changes each layer's own opacity / `top` / font size.
  2. The "picture behind" it blends with must be in the **same stacking context**: put it inside the same `div` that holds the video, not outside.
  3. The picture behind needs **light/dark variation** (wood grain, brick, curtains). A flat dark wall barely shows the glass effect.
- Gradient presets: `gold` / `pearl` / `rose` / `aqua` (or pass a CSS gradient string).
- Usage: `<GlassWord th={th} text="剪出网感" size={230} at={0.3} until={3.4} y={760} grad="gold" />`. Text that is too wide shrinks automatically to the safe-zone width.

## 2. Text behind the person (`TextBehind`)
Layers: **background picture → text → matte PNG (person = opaque, everything else transparent) on top.** The person covers the text a little and the frame gains depth.
- Put both the text and the matte inside **the same camera container as the video** (coordinates in the video's 1080×1920). They then follow hand-shake / push-ins together, so the text feels "stuck on the wall" and the matte stays aligned.
- **Fail-closed**: `TextBehind` **draws no text** on a frame without a matte. Better no text than text across the face.
- 🔴 **Hard rule: the text must be readable at a glance — the person may cover only "a little" of it.** Target: the share of the text block covered by the person is **8–20% on average, ≤30% at most** (the maintainer's requirement + a rule-of-thumb threshold, not pack data). **Unreadable = failure.**
- **Why it is easy to get wrong**: there is no room above the head in the frame (head top ≈ y 230, safe-zone top 250), so the text can only sit at head height and the head inevitably blocks a big middle chunk. Measured: with the text at head height (y 330–720) it was **covered 49.9% on average**, and a two-character word (420 px) was almost unreadable — that was the mistake of the first version.
- **The right approach = make headroom for the text first** (`Headroom`): shift the whole camera container (video + text + matte) down by `dy` (e.g. 250 px), fill the strip that opens at the top with a **mirror** of the video's top, and put the text above the head so the head only covers the text's lower edge. Measured: with the text block at y=150 (container coordinates, ~200 px tall) the average cover is 13.6%, max 16.9% (at y=40 it is 0% — no sense of "behind"; at y=130 about 10%).
  - Screen y = container y + `dy`; the text's screen position must still be inside the safe zone (y ≥ 250).
  - ⚠ Mirror-filling the top only suits footage where the top `dy` pixels contain no person (just wall / background); otherwise it mirrors half a head. If the footage already has room above the head, you don't need `Headroom`.
- **Measure with `tools/check_text_visible.py`**, not just by eye: give it the text block's rectangle in video coordinates and it reports the average / maximum share covered by the person; if it fails, move the text.
- Per-frame matting is slow: **keep the window to ~3 s** (75 frames ≈ 9 MB, 304 frames ≈ 44 MB).
- Usage (headroom + text behind + glass text):
```tsx
<Headroom src={staticFile('rec.mp4')} startFrom={START} dy={250}>
  <TextBehind matteSrc={(f) => (f < N ? staticFile(`matte/${START + f}.webp`) : null)}>
    <GlassWord th={th} text="剪出网感" size={230} at={0.2} until={4.6} y={150} />
  </TextBehind>
</Headroom>
```
- Check the cover: `python3 tools/check_text_visible.py <matte dir> <start frame> <end frame> 126 150 954 350` (the text block's rectangle, video coordinates).

## 3. How to produce the matte (macOS only)
| What to cut out | Tool | Speed (on this machine) | Notes |
|---|---|---|---|
| **A person** | `tools/mk_matte.py` (`personmatte.swift`, Apple Vision person segmentation) | about 1 minute for 75 frames | cuts out people only; edges get "shrink 1 px + feather" |
| **Any subject** (person, cat, product…) | `tools/mk_subject_matte.py` (`subjectlift.swift`, Vision foreground subject) | 11 s for 5 frames (machine busy), about 2 s/frame | cuts the "foreground subject"; if no subject is found for a frame no file is written, so the composition draws no text there |
Both write `<out dir>/<frame number>.webp` (RGBA). The frame number is the frame index in the video and must match Remotion's `useCurrentFrame()` (the base video is this video).
**Other platforms**: not verified in this library. In principle any tool that produces per-frame RGBA mattes (e.g. rembg, MediaPipe, SAM) can feed the same file format (RGBA webp, filename = frame number), **but this has not been tried**, so quality is not guaranteed.

## 4. When to use / when not to
- **Use**: opening titles, brand words, the one big word in a video; a portrait background with light/dark variation.
- **Don't use**: several times in one video (at most 1–2 per video); a flat dark background (no visible glass effect); when matte edges are unclean (hair, translucent objects) — the text gets ragged edges; fast motion or segments where the person is heavily occluded.
- The safe zone still applies: the text sits entirely inside x 60–1010, y 250–1250 (when text is behind the person, the covered part doesn't count as out of bounds, but the visible part must be inside the frame).

## 5. Not done yet (honest)
- Post-processing of matte edges (despeckle, temporal smoothing against flicker).
- A non-macOS matting workflow.
- Choosing the text position automatically with `check_text_visible.py` (for now you try a `y`, then measure).
- A ready-made wrapper that integrates "matte + text" into the camera container (for now you place them inside the same `div` as the video yourself).
