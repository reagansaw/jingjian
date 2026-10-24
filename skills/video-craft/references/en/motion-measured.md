# Text motion: measured curves (frame-by-frame, from 2-1)

Answers: **for each entrance animation, what are the scale / offset / brightness at each moment of the entrance?** This supplements and **corrects** `motion-vocabulary.md`: that file only had "8 frames per animation, read by eye"; this one has numbers measured by locating each demo with the project file and reading the preview video frame by frame.

## Source and method
1. **The project file** (`template.json.bak`) gives each demo's **exact start, duration, animation name and entrance duration**: 83 text segments, 38 entrance animations; the text sits in the middle of the frame, white on pure black.
2. **The preview video** (`02-对应预览视频/…/2-1-文字动画和音效常用搭配.mp4`, 1920×1080, 30 fps): for each segment, 30 fps grayscale frames from the project-file start, cropped to the middle 1600×500.
3. Per frame: text block extent (→ scale), centre (→ offset), brightness, edge sharpness; per-character appearance = split the settled text block into N equal columns and take the time each column's ink reaches 50%. The ink threshold is **adaptive per frame** (a fixed threshold shrinks the low-opacity first frames — the first version made exactly this mistake).
4. **Closed-loop check**: render the revised presets as white-on-black video, measure **again with the same code**, and compare with the pack's curves (see "Verification" below).

Data: `motion-measured.json` (all 38, six time points).

## Reliability (read first)
- **Grade A (whole-block animation, clean measurement)**: enlarge, slight enlarge, shrink, shrink II, slide up (trust only offset and brightness). `MotionText` was updated and verified in a closed loop.
- **Grade B (reference only)**: everything else. Glow / blur block extents are inflated by the halo; per-character animations' scale / offset are affected by characters appearing one by one; animations starting far off-frame (blur-left) are cut off by the crop window. For B, only **entrance duration, starting brightness and per-character stagger** are reliable.
- "Sharpness" is edge/ink; **enlarging lowers it, so it does not mean blur**: shrink goes from 1.43× to 1× and its sharpness goes 0.73→1.0, but it is not blurred.
- Only the 2-1 demos were measured (white on black, centred); text with stroke / shadow over live footage will look different.
- Not measured: **sound** (at project-file level the effect starts on the same frame as the text: 89.6% of pairs have a 0-frame difference, only 0.9% are 1–3 frames early), exit animations, loop animations.

## Grade A curves (τ = entrance duration × 0 / .1 / .25 / .5 / .75 / 1)
| Animation | In (s) | Scale | Offset dy (text heights, + = below) | Brightness |
|---|---|---|---|---|
| Enlarge (放大) | 0.55 | `0.56 / 0.60 / 0.73 / 0.88 / 0.97 / 1.00` | `-0.00 / -0.00 / -0.00 / -0.00 / -0.00 / 0.00` | `0.13 / 0.20 / 0.46 / 0.80 / 0.98 / 1.00` |
| Slight enlarge (轻微放大) | 0.5 | `0.92 / 0.93 / 0.95 / 0.98 / 1.00 / 1.00` | `0.09 / 0.09 / 0.06 / 0.03 / 0.01 / 0.00` | `0.58 / 0.80 / 1.00 / 1.00 / 1.00 / 1.00` |
| Shrink (缩小) | 0.5 | `1.43 / 1.40 / 1.28 / 1.12 / 1.03 / 1.00` | `0.01 / 0.01 / 0.01 / 0.00 / 0.00 / 0.00` | `0.12 / 0.20 / 0.46 / 0.78 / 0.98 / 1.00` |
| Shrink II (缩小 II) | 0.5 | `4.12 / 4.12 / 4.02 / 3.71 / 1.78 / 1.00` | `0.00 / 0.00 / 0.00 / 0.00 / 0.01 / 0.00` | `0.21 / 0.34 / 0.81 / 1.00 / 1.00 / 1.00` |
| Slide up (向上滑动) | 0.4 | `0.72 / 0.74 / 0.98 / 1.01 / 1.00 / 1.00` | `1.32 / 1.29 / 1.06 / 0.47 / 0.11 / 0.00` | `0.17 / 0.20 / 0.46 / 0.79 / 0.98 / 1.00` |

What the numbers say:
1. **The brightness curve is nearly identical** for enlarge / shrink / slide up: first frame ≈ 0.13–0.17 → 0.46 at 25% → 0.79 at 50% → 0.98 at 75%.
2. **Scale and offset each have their own easing — not all "ease-out"**: the slide-up offset is slow-fast-settle (only 20% done at 25%, 64% at 50%); the enlarge / shrink scale is a mild ease-out (≈34% at 25%, ≈69% at 50%, ≈93% at 75%).
3. **Shrink returns from 1.43× to 1×** while brightness rises from 0.13, **with no blur**. (I had mistaken Shrink II's 3–4× for plain Shrink.)
4. **Shrink II (slam) does not start falling at once**: it holds at **4.1×**, very blurry, already at 0.8 brightness, and **slams down only after half the time** (3.7× still at 50%, 1.8× at 75%, 1× at 100%).
5. **Slight enlarge** already starts at 0.58 brightness, 8.5% smaller and 0.09 text-heights low, settling in 0.5 s.
6. The settle time is a little earlier than the nominal entrance (enlarge: nominal 0.55 s, stable by ≈0.48 s).

## Grade B: the only things you can trust
| Animation | In (s) | Brightness (start → at 50%) | Per-char stagger (4 chars, first to last) |
|---|---|---|---|
| Reveal up (向上露出) | 0.4 | 1.00 → 1.00 (at 50%) | 0.12 s |
| Curtain (开幕) | 0.5 | 0.24 → 1.00 (at 50%) | 0.0 s |
| Roll in (滚入) | 0.4 | 0.12 → 1.00 (at 50%) | 0.0 s |
| Leap (跃进) | 0.4 | 0.17 → 1.00 (at 50%) | 0.0 s |
| Blur glow (模糊发光) | 0.4 | 0.35 → 1.00 (at 50%) | 0.1 s |
| Glow blur (发光模糊) | 0.7 | 0.06 → 0.89 (at 50%) | 0.0 s |
| Blur left (向左模糊) | 0.7 | 0.06 → 0.94 (at 50%) | 0.0 s |
| Random rise (随机上升) | 0.45 | 0.14 → 0.98 (at 50%) | 0.22 s |
| Wave bounce (波浪弹入) | 0.4 | 0.57 → 1.00 (at 50%) | 0.13 s |
| Typewriter (打字光标) | 0.4 | 1.00 → 1.00 (at 50%) | 0.3 s |
| Develop (逐字显影) | 0.6 | 0.08 → 0.70 (at 50%) | 0.0 s |
| Tighten (收拢) | 0.7 | 0.71 → 1.00 (at 50%) | 0.05 s |
| Shout wave (呐喊声波) | 0.5 | 1.00 → 1.00 (at 50%) | 0.0 s |
- Per-character: **random rise 0.22 s, wave bounce 0.13 s, typewriter 0.30 s (≈ 0.075 s/char)**; random rise's order correlates ≈0.4 with position (roughly left to right but shuffled), typewriter 0.7 (essentially left to right).
- Blur-left starts about 4.5 text-heights off-frame — **that number is unreliable** (cut off by the crop window).

## What changed in this library (`MotionText`)
| Preset | Before | Now (measured) | Verification (I rendered it and measured again; max difference from the pack's curve) |
|---|---|---|---|
| `grow` | 0.5→1, brightness ×1.6 | 0.56→1, shared brightness curve, in 0.55 s | scale ≤0.01 · brightness ≤0.04 |
| `grow-soft` | 0.94→1 | 0.915→1 + 0.09 text-heights low + start brightness 0.58 | scale ≤0.01 · offset ≤0.01 · brightness ≤0.04 |
| `shrink` | 1.25→1, brightness 0.3→1 | 1.43→1, shared brightness curve, in 0.5 s | scale ≤0.01 · brightness ≤0.05 |
| `slam` (Shrink II) | 3.2→1, falls immediately | holds at 4.1× + heavy blur, slams after half the time, in 0.5 s; **the start scale is capped so the block is about 1.25× the frame width** (the pack's 3 characters at 4.1× roughly fill the frame; four big characters get capped near 1.8×, otherwise they fly far off-frame) | scale ≤0.15 · brightness ≤0.12 (start too dim) · whole block about 0.12 text-heights low (different scale origin, not fixed) |
| `slide-up` | offset 30 px | starts 1.32 text-heights low, separate offset and brightness curves | offset ≤0.05 text-heights · brightness ≤0.08 (the pack's "scale 0.72" is an artefact of the crop window; mine is 1.0) |
The other 13 presets were **not changed** (Grade B data is not clean enough) and remain eyeballed approximations.

## Not done / next
- Calibrate each Grade B animation by "render, then measure again" (first the halo-inflates-the-block measurement problem has to be solved).
- Measure exit and loop animations.
- Use the same method on the 56 layout demos in `1-3` (so far only still frames were read).
