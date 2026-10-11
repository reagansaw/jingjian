# Text animation vocabulary (Motion vocabulary)

Answers: **how text moves** — which entrance animations exist, how each one moves, how fast, when to use it, and which sound effect to pair. For static layout see `typography-pairing.md`.

## Sources and reliability (read first)
- **"2-1 common pairings of text animation and sound effects"**: 38 entrance animations, each demoed for 1–2 seconds. Every one was slowed down and **split every one into frames** (8 frames per animation, covering "entrance duration + 0.15 seconds", about 0.55–0.85 seconds) and watched how each one moves.
- **Statistics** come from the text tracks of 70 talking-head projects (plaintext backups): 2684 text segments, 1249 entrance animations.
⚠ Limitations:
- Each has only 8 frames, so **you can see "how it moves" but not the exact speed curve**; this library's implementation approximates with easeOutCubic, it is not a reproduction.
- The "enlarge / shrink" factors are estimated from frames (缩小 II (Shrink II) starts at about 3–4× and lands at 1× in ~0.35 seconds), not parameters read out.
- The implementation here is **original code**; it borrows only the "way of moving" and the "duration", and contains none of the original pack's assets.

## 1. Numbers (statistics)
| Metric | Value |
|---|---|
| Entrance animation duration | Median **0.4 seconds** (p10 0.3 / p90 0.5); blur / light-effect types 0.7 seconds |
| Text segment dwell time | Median 1.22 seconds (p25 0.88 / p75 1.72) |
| **Text segments with no animation at all** | **52%** (1400 / 2684) |
| Entrance only | 45% (1197) |
| Entrance + exit | 2% (50) |
| Looping animations (used for emotion words) | 34 uses: 飘起 (float up) 8, 文字泛光 (text glow) 7, 弹幕滚动 (danmaku scroll) 5, 扩音器 (megaphone) 4, 喷涌 (gush) 3, 情绪加载 (emotion loading) 2 |
| Exit animations (54 uses) | 炸开 II (burst II) 11, 渐隐 (fade out) 10, 消散 (dissipate) 7, 炸开 (burst) 5, 滚出 (roll out) 4, 向下弹出 (pop out downward) 4 |
**The 10 most-used entrances** (44% of all entrances): 渐显 (fade in) 110 · 缩小 (shrink) 80 · 放大 (enlarge) 57 · 滚入 (roll in) 50 · 打字光标 (typing cursor) 48 · 随机上升 (random rise) 43 · 雪光模糊 (snow-light blur) 43 · 轻微放大 (slight enlarge) 40 · 冰雪飘动 (ice-snow drift) 39 · 开幕 (curtain open) 37.
→ Rule: **not every word needs to move.** Half the text gets nothing; save animation for the key words; exits are almost never used (2%), and to close out, fade out or use "炸开 / 消散" (burst / dissipate).

## 2. The 38 entrance animations (split into slowed-down frames)
Five categories. "Preset" column: ✅ = this library has it (the `preset` of `MotionText`); ⏳ = not built (mostly particle / 3D, or a mirror / variant of an existing preset).
Count = number of appearances across the 70 projects (only the top 30 are listed).

### Movement / wipe
| Animation | Duration | Observed motion | When to use | Count | Preset |
|---|---|---|---|---|---|
| 渐显 (fade in) | 0.5 | Plain fade-in (not in 2-1, but the most used in the projects) | Base: knowledge, narration | 110 | ✅ `fade` |
| 向上滑动 (slide up) | 0.4 | Fades in while floating up ~15–30px | Gentle information, titles, items | 30 | ✅ `slide-up` |
| 向上露出 (reveal upward) | 0.4 | "Wiped" in from bottom to top (mask) | Definitions, conclusions | — | ✅ `reveal-up` |
| 向下露出 (reveal downward) | 0.4 | Wiped in from top to bottom | Same (mirror) | 23 | ⏳ (mirror of `reveal-up`) |
| 向右缓入 (ease in to the right) | 0.4 | Slides in slightly from the left, very small amplitude | A low-key appearance | 26 | ⏳ |
| 滚入 (roll in) | 0.4 | Rolls up from below, with vertical blur and cropping | Numbers, money, deals closed | 50 | ✅ `roll-in` |
| 开幕 (curtain open) | 0.5 | Unfolds from the middle toward both sides | Opening titles, chapter names; Chinese-style / knowledge | 37 | ✅ `curtain` |
| 跃进 (leap in) | 0.4 | Leaps up from below into place, with a bounce-back | Forceful short words | 30 | ✅ `leap` |
| 左上弹入 (pop in from upper left) | 0.4 | Flies in along an arc from the upper left, with rotation | A playful appearance | — | ⏳ |
| 向右集合 (gather to the right) | 0.7 | Letter-spacing closes in from very wide (left characters appear first) | Titles, punchlines | — | ✅ `tracking-in` |
| 收拢 (draw together) | 0.7 | Letter-spacing closes in (same as above, smaller amplitude) | Same | 26 | ✅ `tracking-in` |

### Scale
| Animation | Duration | Observed motion | When to use | Count | Preset |
|---|---|---|---|---|---|
| 放大 (enlarge) | 0.7 | Grows from small (~half) into place + fades in | Numbers, key points | 57 | ✅ `grow` |
| 轻微放大 (slight enlarge) | 0.5 | A subtle ~6% enlarge | Emphasizing a keyword without stealing the scene | 40 | ✅ `grow-soft` |
| 缩小 (shrink) | 0.5 | Shrinks from slightly larger + dimmer to normal, brightening | Emphasis, reversal | 80 | ✅ `shrink` |
| 缩小 II (shrink II) | 0.5 | Slams from 3–4× size down to 1×, very fast (~0.35s) | **The heaviest word in the whole video** | — | ✅ `slam` |
| 生长 / 生长 II (grow / grow II) | 0.4–0.5 | A small enlarge with letter-spacing | Light emphasis | 17 (II) | ⏳ (`grow` variant) |
| 吸入 (suck in) | 0.4 | Quickly grows from tiny into place | Small pop-up elements | 21 | ⏳ |
| 慢速放大 (slow enlarge) | 0.5 | (Very little changes within the 8 frames; **inferred** to be a continuous slow enlarge during the whole dwell) | Giving still text a "breathing" feel | — | ⏳ (replaced by a camera push-in) |

### Blur / light effects
| Animation | Duration | Observed motion | When to use | Count | Preset |
|---|---|---|---|---|---|
| 模糊发光 (blur glow) | 0.4 | Vertical-streak blur → blurred text with a glow → sharp | Emotional, mystical, soft | 34 | ✅ `glow-blur` |
| 发光模糊 (glow blur) | 0.7 | Heavy blur + dimmer → sharp bold text with a glow | Same, slower | 29 | ✅ `glow-blur` |
| 雪光模糊 (snow-light blur) | 0.7 | Sharp from the start, with a soft white glow that slowly fades | Same | 43 | ✅ `glow-blur` |
| 向左模糊 (blur to the left) | 0.7 | A horizontal motion-blur streak, slides in from the right and sharpens | Change of topic, a transition feel | 30 | ✅ `blur-left` |
| 向右模糊 II (blur to the right II) | 0.7 | A blur from the left, sharpening with a trailing smear | Same (mirror) | 27 | ⏳ (mirror of `blur-left`) |
| 辉光 (radiance) | 0.5 | A golden-orange glow at the start, fading to white text | Punchlines | — | ⏳ (colored version of `glow-blur`) |
| 光效转场（激光雕刻）(light-effect transition, laser engraving) | 0.5 | A blue-white beam sweeps across, revealing the text as it goes | Transitions, tech feel | 28 | ⏳ |
| 流光扩散 (flowing light spread) | 0.7 | Golden sparks spread outward and gather into the text | Gorgeous | — | ⏳ (particles) |
| 星光闪闪 (twinkling stars) | 0.4 | Golden star points gather, the text appears from within | Gorgeous | — | ⏳ (particles) |
| 冰雪飘动 (ice-snow drift) | 0.4 | White light points → particles scatter → gather into text, with sparkle points on the right | Ethereal, soft | 39 | ⏳ (particles) |
| 晕开（水墨散开）(ink bloom, ink spreading) | 0.4 | Ink fragments scatter and piece together into the text | Chinese-style, literary | 33 | ⏳ |

### Per character
| Animation | Duration | Observed motion | When to use | Count | Preset |
|---|---|---|---|---|---|
| 随机上升 (random rise) | 0.4 | Each character floats up from a different height (staggered) | Knowledge / reading content | 43 | ✅ `rise-random` |
| 波浪弹入 (wave bounce-in) | 0.4 | Characters pop up one by one, like a wave | Relaxed, playful | 20 | ✅ `wave-bounce` |
| 打字光标 (typing cursor) | 0.4 | A block cursor, characters typed out one at a time | Definitions, keywords; **pair with typing sound** | 48 | ✅ `typewriter` |
| 逐字显影 (develop character by character) | 0.7 | Each character goes from blurred gray to sharp white, one by one | Steady, literary | 25 | ✅ `develop` |

### Structure
| Animation | Duration | Observed motion | When to use | Count | Preset |
|---|---|---|---|---|---|
| 呐喊声波 (shout sound wave) | 0.5 | The text pops out while several rings of "echo" spread outward | Shouting, "attention!" | 27 | ✅ `echo` |
| 折叠 (fold) | 0.4 | Unfolds from a squashed / folded state | Organizing, storage-type content | 26 | ⏳ |
| 便利贴 (sticky note) | 0.4 | Fragments piece together, with a torn-off glitch feel | A notes feel | — | ⏳ |
| 圆柱体滚动 (cylinder roll) | 0.4 | Vertical stripes (a cylinder surface) unfold into text (3D feel) | Tech | — | ⏳ |
| 向上重叠 (overlap upward) | 0.7 | Several ghosted lines merge into one line, fading in | Stacked emphasis | — | ⏳ |

## 3. Choosing an animation by "function"
| This sentence is meant to… | Use | Pair with sound effect |
|---|---|---|
| Plain narration (knowledge / narration) | `fade` · `slide-up` · `curtain` | Paper / light breath, or none |
| **Hit hard** (turn, harsh line, punchline) | `slam` · `shrink` · `echo` | Boom / thud / impact |
| A number / key point appears | `grow` · `grow-soft` · `roll-in` | Ding / click / cash register |
| Definition / keyword | `typewriter` · `develop` | Typing sound / none |
| Emotional / mystical / soft | `glow-blur` | Water drop / bell / magic |
| Change of topic / transition | `blur-left` · `roll-in` | Whoosh / swoosh |
| Relaxed / playful | `wave-bounce` · `leap` | Bubble / pop / spring |
| Title / punchline focus | `tracking-in` | Swoosh (light) |
**Change the entrance animation on each sentence** (from an earlier analysis: the "female emotion" (女性情感) template rotates through random rise / leap / typing cursor / fold / shrink on every sentence), don't use the same one for the whole video; but **text that isn't a key point doesn't need to move**.

## 4. Usage
```tsx
<MotionText th={th} text="剪出网感" preset="glow-blur" at={1.2} until={3.4} y={1040} size={150} />
```
`MotionText` goes through `FitBox` internally (measure width → shrink if it exceeds the safe zone → push back), so animation won't carry text out of the safe zone. Per-character presets (`rise-random` / `wave-bounce` / `typewriter` / `develop`) use one span per character, and **≤8 characters is best** (long sentences drag).

## 5. Not built yet (honestly)
Particle types (冰雪飘动 / twinkling stars / flowing light spread), 3D types (cylinder roll), light-effect transitions, 折叠 / sticky note / overlap upward, all mirrors / variants, **exit animations** (burst / dissipate / roll out), **looping animations** (float up / text glow / megaphone, used for emotion words).

## 6. Emotion words (loop animations — 4 done)
An emotion word in the original pack = an ordinary text + a **loop animation**, placed above the head. Slowed down and split into frames (12 frames, 0.12 s apart):
| Emotion word | Original loop animation (period) | What was seen | Colour | This library |
|---|---|---|---|---|
| 哭泣 (crying) | emotion loading (1.27 s) | the text starts white and **red fills it like liquid from the bottom** (~0.7 s); tracking stretched | deep red `#b71c1c` | ✅ `EmotionWord kind="cry"` |
| 惊讶 (surprised) | wave (0.98 s) | two characters **bob up and down out of phase**, each tilted ±8°, looping | gold `#ffbf17` | ✅ `kind="surprise"` |
| 非常开心 (very happy) | text glow (0.98 s) | pale-yellow text with **radiating light rays** pulsing in beat behind it | pale yellow + golden glow | ✅ `kind="joy"` |
| 救命 (help) | megaphone (3.0 s) | two characters **tilt outward**, fade in, then sway gently and send echoes outward | gold | ✅ `kind="shout"` (the sway is approximate) |
⚠ The original pack places emotion words **above the head** (y≈220–355); this library has no safe room above the head, so it puts them in the chest band. ⚠ The "真香" glow-and-wings and "嘤嘤嘤" tears are JianYing's built-in **face effects** (sad / "so good" / big head), not text — **not built** (they need face tracking). ⚠ For "megaphone" only a short slice of the 3 s cycle is visible; the sway amplitude and echo are approximated from the picture, not reproduced.
Usage: `<EmotionWord th={th} text="非常开心" kind="joy" at={1.2} until={3.4} />`. With 2–3 characters the tracking stretches across the width automatically; longer words keep normal tracking.
⚠ One implementation trap: gradient-filled text (`background-clip: text`) stops rendering once its child elements each get their own `transform` — the gradient must sit on each character itself.
