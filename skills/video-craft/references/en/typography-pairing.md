# How to pair text (Typography pairing)

Answers three questions: **how text pairs with text** (font / color / size / line count / position), **which layout families exist**, and **how to use them correctly**.
These are the rules for "text layout"; for motion see `motion-vocabulary.md`.

## Sources and reliability (read first)
| What was looked at | How it was looked at | What it yields |
|---|---|---|
| JianYing/CapCut (剪映) talking-head template pack, "1-2 text layout style reference" | A 2-second video, **59 frames viewed one by one**, one layout per frame | Layout families |
| "1-3 text layout" | 56 demos, one frame taken from each **after the entrance finished** (2.5 seconds after the demo starts) | Many ways to lay out the same sentence; **entrance motion was not viewed** (for motion see `motion-vocabulary.md`) |
| "1-1 text layout principles" | 11 demos | Four layout principles |
| The text tracks of these three tutorial projects (plaintext backups) | Grouped by "appearing at the same moment" = 88 layouts | **Statistics** on font / color / size ratio / line count / position |

⚠ Limitations:
- The font sizes in the statistics are JianYing's **relative font-size units**; only the "ratios" can be trusted, the absolute values cannot be used directly as pixels.
- Positions: JianYing's y is converted to frame height (1080×1920) with **y_px = 960 × (1 − y)**. **Checked against the first demo of 1-1**: in the project y = −0.422 ↔ the first line's centre at about y 1365 px, and y = −0.544 ↔ the second line at about 1483 px — matching the screenshot.
- "the 40 Yichuang projects" and "the 30 creator breakdowns" were not viewed (the projects are encrypted, only preview videos exist).
- Frame numbers follow the order of the catalog video (1-2 #N); they may differ by ±1 from the layout numbers in your project, **go by the picture**.

## 1. The four layout principles (1-1)
The same sentence, "35岁的我们 / 已经被这个时代抛弃了" ("We, at 35 / have been abandoned by this era"), was laid out many times, each time changing only one principle:
| Principle | Demo (as seen) | How to use |
|---|---|---|
| **Alignment** | The same two lines, laid out centered / left / right | **Pick one alignment per video**; if you want to break it (diagonal stagger) it must be deliberate |
| **Contrast** | "35岁" huge, "的我们" tiny; or the first line yellow, the second white | Separate them by **size, color, weight**; no "medium vs. medium-large". Hero word (主角词) vs. supporting text at least ~2× |
| **Proximity** (亲密) | A title and its description tight together, a full blank line between the two groups; white-background squares "1" "2" numbering each group | Related lines close together, unrelated lines apart; numbers / small labels separate the groups |
| **Repetition** | NO.1 / NO.2 / NO.3, three **identical** yellow cards | Parallel content uses **the same style**, with a regular position pattern |

## 2. Pairing numbers (statistics from the project files: colors / fonts / size ratio use a full parse of 81 layouts; line count uses the first pass of 88)
### Color
| Role | Colors seen | Count |
|---|---|---|
| Base (white) | `#ffffff` | 162 |
| Emphasis / benefit (yellow) | soft yellow `#fff589` (63), gold yellow `#ffbf17` (40) | 103 |
| Pain point / turn (red) | deep red `#b71c1c` (19), bright red `#ff1837` / `#fe5252` (6) | 25 |
| Emphasis on a dark base | pink `#ff619d` | 9 |
| Black text | `#000000` (all the ones observed are inside small white blocks) | 22 |
**Number of colors in one layout** (full parse, 81 layouts): 1 color 26% · **2 colors 54%** · 3 colors 12% · 4 or more 7% → **80% use only 1–2 colors**. (The first pass counted only the first style of each text and got 75%; the full parse gives 80%.)
→ Rule: **white as the base + one accent color**; red for pain points, yellow for benefits; a third color goes only to small blocks (labels / red text on white).

### Fonts
| Font | Count | Used for |
|---|---|---|
| Source Han Serif Heavy (思源粗宋, serif bold) | 137 (41%) | Hero words, titles, numbers |
| ZhiXin Ti (知新体) | 80 | Supporting text, descriptions |
| Douyin Meihao (抖音美好体, sans-serif) | 61 | Supporting text, lists, captions |
| TeHei Ti (特黑体, extra-bold black-weight sans) | 18 | List small blocks (extra-bold sans) |
| Source Han Serif Bold (思源宋体 Bold) | 17 | Quotes |
| Smiley Sans (得意黑) | 11 | Modern / hard-edged big text |
**Number of fonts in one layout** (full parse, 81 layouts): 1 font 56% (45) · **2 fonts 41% (33)** · 3 fonts 4% (3) → **96% use ≤2**. When mixing, the most common pairing is **serif + sans-serif** (first pass: 18 of the 31 mixed layouts; most common Source Han Serif Heavy + Douyin Meihao).
→ Rule: **≤2 fonts**; serif bold for the hero word, sans-serif for supporting text. This library's theme: display = Source Han Serif Heavy (思源粗宋), body = Douyin Meihao (抖音美好体), hand = Smiley Sans (得意黑).

### Size ratio (largest : smallest text in the same layout, 81 layouts)
Full parse (81 layouts, counting every style run within a text): median **1.5×**, quartiles 1.2–2.58×; **only 8 (10%) reach ≥4×**, given only to the "hero word" (first pass: up to ~12×).
**Contrast within a single text is small**: only 32 of 332 texts have more than one style run, and their median size ratio is 1.0× (most change only colour or font, not size), at most 1.7×.
→ Rule: **supporting : hero ≈ 1 : 2**; lines of the same level use ~1.2× for hierarchy; **keep only 1–2 giant words at ≥4× in the whole video**.

### Line count (88 layouts)
1 line 13% · 2 lines 28% · 3 lines 23% · 4 lines 11% · 5 lines or more 25% (mostly "list" demos). → In a talking head, **≤3 lines**.

### Shadow, stroke, line spacing (added by the full parse)
- **Stroke: none in these three teaching projects.** The text styles contain no `strokes`; `border_width = 0.08` is a default carried by every text and is not enabled. (Don't confuse this with "bold white + 13% black stroke" — that is a conclusion from a different template pack.)
- **Shadow: one uniform hard shadow.** 316 of 385 style runs carry a shadow with almost the same recipe: **black, opacity 0.9 (194) / 0.8 (96) / about 0.5 (21), distance 5, angle −45°, diffuse 0.025 (≈ hard edge, not a soft glow)**. → The text is held against the background by a **down-right hard shadow**, not a stroke. CSS approximation: `text-shadow: 4px 4px 2px rgba(0,0,0,0.9)` (JianYing's "distance 5" is not px; this is an approximate conversion). This library's default is a soft shadow (`0 4px 16px`) and was **not** changed to the hard one — use `SHADOW_PACK` (see `kit.tsx`) to get this look.
- **Line spacing** (`line_spacing`): single line 0.02 (159 texts) · multi-line quotes 0.17–0.22 (110) · loose parallel items 0.67 (23). → tight for single lines, looser for quoted paragraphs, loosest for parallel items.
- **Effects / keyframes**: no keyframes in these projects; the "effects" are only colour-adjust parameters (brightness / contrast); portrait cards use a "rectangle" mask. **The motion itself is not in the JSON** (only the animation name and duration; the motion lives in JianYing's effect resources) — so motion must be studied by slowing the picture down; see `motion-vocabulary.md`.

### Position
In the original pack the median y of the text ≈ −0.34 (JianYing coordinates, 0 = frame center, −1 = very bottom), i.e. about **67% of frame height (≈ y 1290)**; the 10th percentile is at −0.55 (≈ y 1490). **More than half of the text is in the lower third of the frame.**
⚠ **This conflicts with the safe zone** (lower edge y 1250; the bottom 35% is covered by caption copy and buttons). This skill takes the intersection: **all text is pressed into y ≤ 1250**, moving the original pack's "lower third" band up as a whole (`Zone`, see `layouts.md`).

## 3. Layout families (59 frames + 56 demos)
"This library" column: ✅ = component exists; 🆕 = added this round; ⏳ = not built yet.
| # | Family | Look | When to use | Original-pack frames | This library |
|---|---|---|---|---|---|
| A | **Small label + big text stacked** | A yellow small label pressed onto the top-left of big white text; 2–3 staggered layers; a white-background red-text small label can be added | Numbers, keywords, "readable at a glance" | 1-2 #1 #2 #7 #8 #42 | 🆕 `label-hero` |
| B | **Big text with widened letter-spacing** | A hero word of 1–3 characters, letter-spacing stretched across the full width, yellow on top, white (or red) below | The hardest-hitting line | #3 #32 #42 | 🆕 `spread-hero` |
| C | **In-line emphasis word** | Within one line, the keyword turns yellow / red / bigger | Almost every sentence | #4 #5 #19 #22 #23 #45 #53 #54 | ✅ use a span nested in the children of `Txt` |
| D | **Strike out and reword** | The old sentence is struck through with a red line, the new sentence below it | Correcting a misconception | #24 | ✅ `strike-swap` |
| E | **List** | Centered numbered list; white-background small-block list; dark-background groups (big title + small items) | Steps, checklists | #6 #9 #30 #52 | ✅ `chapter` / `bars` (partly); ⏳ white-background small-block list |
| F | **Quote card** | Background darkened + blurred; "first / second" white-background black-text small labels; quote keyword in yellow; source in small gray text, right-aligned | Data, famous sayings, research | #10 #11 #13 #26 #34 #29 #57; 1-3 #38 #39 | 🆕 `quote-card` |
| G | **Comparison** | A vertical line in the middle, one word + small text on each side; or `A ≠ B`, `A → B` | Contrasting two concepts | #17 #18 #37 #39 #41 | ✅ `two-column` / `a-to-b` |
| H | **Background giant word (ghost word, 幽灵字)** | A huge semi-transparent word laid behind the person ("烦" (annoyed), "为什么" (why), "100%"), a small line in front | Naming the point | #25 #51; 1-3 #11 #35 | 🆕 `ghost-word` (placed in the chest band, doesn't cover the face); `giant-fill` is its "hollow fill-up" version |
| I | **Vertical text** | 2–4 characters stuck vertically on the left or right edge | Emotion words, conclusion words | #35 | ✅ `vertical-wall` |
| J | **Portrait window** | Round window on top, text below; rounded card on top; **white-border matted sticker**; black-background portrait with blurred border | Switching pictures, quotes | #38 #44 #52 (round) · #40 #49 #50 #59 #60 (card) · #43 (white border) · #46 #47 (blurred border) | ✅ `typed-quote` / `split-*`; ⏳ white-border matted sticker, blurred border |
| K | **Footage insert** | A book cover / picture / light-effect footage fills half the screen, text below | When talking about a concrete thing | #14 #58 | ✅ `pip-broll` / `split-broll` (see `douyin-jingjian.md`) |
| L | **Frame dressing** | Phone frame, viewfinder + vignette, REC badge + 30fps, scan lines | "Looks like a shoot / looks like it's on a phone" | 1-3 #50 #51 #52 #53 | ✅ `phone-swipe` (phone frame); ⏳ viewfinder / REC / scan lines |
| M | **Chapter marker** | A big gray italic number + gold title; a white vertical bar + vertical title; a yellow block + arrow + dashed-box title | Introducing point number N | 1-3 #43–48 | 🆕 `chapter-tag`; ✅ `chapter` |
| N | **Scattered / diagonal stagger** | Three words scattered around the face; two red words slanted, one high and one low; three round windows each with a label | Several parallel concepts | #16 #56; 1-3 #12–17 | ⏳ |
| O | **Emotion words** | "哭泣" (crying): the text starts white and red fills it from the bottom, tracking widened; "惊讶" (surprised): two characters bob out of phase; "非常开心" (very happy): pale-yellow text with pulsing radiating light; "救命" (help): two characters tilt outward + echo; ("真香" glow-and-wings and the "嘤嘤嘤" tears are **face effects**, not text) | One word is one emotion | 1-3 #18–23 | 🆕 `emo-cry` / `emo-surprise` / `emo-joy` / `emo-shout` (text part); ⏳ face-effect part |
| P | **Chat-bubble CTA** | A blue iMessage bubble "找我聊聊" ("chat with me") + one line of small text | End-of-video call to action | 1-3 #55 | ⏳ |
| Q | **Pinyin annotation** | Small red pinyin above the big characters | Rare words, stressing pronunciation | #31 | ⏳ |

### 12 ways to lay out the same quote (1-3 #24–35, "天才是 1% 的天分加上 99% 的努力" — "Genius is 1% talent plus 99% effort")
White-border matted portrait + quote on top · quote pressed over the portrait · blurred background + quote + right-aligned source ("——爱迪生", "— Edison") · **white-border sticker of the quoted person** + vertical name · round window + quote (second line yellow) · viewfinder + vignette · phone frame · big quotation mark + round window + second line beside the window · plain black background centered · portrait below + quote (yellow) above · round window + multicolor lines · **a giant red italic "100%" laid behind the head + small text on the chest**.
→ The same sentence has 12 solutions; **which one to pick depends on this sentence's function in the video** (a quote → its source; data → giant numerals).

## 4. Pairing formulas you can apply directly
1. **Base**: white; **emphasis**: yellow (benefit / key point) or red (pain point / turn); ≤2 colors per layout.
2. **Fonts**: serif bold for the hero word + sans-serif for supporting text, ≤2.
3. **Size**: supporting : hero ≈ 1 : 2; giant text (≥4×) 1–2 per video.
4. **Lines**: ≤3 lines; more than 3, split into two layouts.
5. **Position**: everything inside the safe zone (x 60–1010, y 250–1250); when the face is large, use only the chest band y≈880–1250.
6. **Principle check**: one alignment within a video; parallel content in the same style (repetition); related lines close, unrelated lines apart (proximity); the hero word is obviously the hero at a glance (contrast).

## 5. Not built yet (honestly)
White-background small-block list, white-border matted sticker, blurred-border portrait, viewfinder / REC / scan lines, scattered and diagonal stagger, the face-effect part of emotion words (tears, the "真香" glow-and-wings; needs face tracking), chat-bubble CTA, pinyin annotation.
