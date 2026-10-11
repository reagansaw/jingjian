# Layout parameters (matching the real signatures in `remotion/craft/layouts.tsx`)

Parameters shared by all layouts: `th` (a theme object: `THEME_DARK_LIME` / `THEME_DARK_GOLD` / `THEME_BIZ_GOLD_RED` / `THEME_GUOFENG_CREAM` / `THEME_KNOWLEDGE_YELLOW`; in the starter's edit.json write the id: `dark-lime` / `biz-gold-red` / `guofeng-cream` / `knowledge-yellow`), `until` (the time the speech ends, in seconds). Times are always "seconds after the composition starts".
Text goes inside `<Zone>` (shifts the whole thing up 150px into the chest band (胸口带)), and text goes through `Txt/FitBox` (measure width → shrink if it exceeds the safe zone → push back).

| Layout | Parameters | Notes |
|---|---|---|
| `ChestBig` #23 | `small` `big` `at` `bigAt?` `tone?` `bigSize?` | Small text 54px on top, big text 190px slams down (slam) |
| `StrikeSwap` #24 | `lead` `old` `at` `strikeAt` `next?` `nextAt?` `oldSize?` | If the old wording is too long it shrinks automatically, and the strikethrough shrinks with it; when `next` appears the old one fades out |
| `LeftStair` #53 | `rows[{pre,key,at,big?}]` `y0?` | Each row indented 44px, the previous row dims; the last row with `big` uses the secondary accent color |
| `AtoB` #41 | `a` `b` `at` `bAt` | Arrow position is computed from A's width; B's font size shrinks to the remaining width |
| `TwoColumn` #17 | `left` `right` (`{pre,key,tail?,at}`) `lineAt?` | Two columns each 430 wide; the center line draws down first |
| `Bars` #9 | `lead` `leadAt` `bars[{text,at}]` | Highlighter bars use `FitBox`, shrink automatically if too long |
| `VerticalWall` #35 | `chars[{c,at,tone?}]` `x?` `top?` `size?` | Default x=850, top=270; shrinks if there are many characters, the whole column ≤ y1250 |
| `DarkQuestion` #27 | `small` `big` `at` `bigAt?` | The dark vignette is outside the Zone, the text is inside the Zone |
| `Chapter` | `num` `title` `at` `chips[{text,at}]` `punch?` | The whole block uses `Zone dy=-110`, height ≤360 |
| `GiantFill` #25 | `char` `at` `fillAt` `size?` `top?` | `top` defaults to 250 (top edge of the safe zone); place only 1 character |
| `TypedQuote` #38 | `at` `lines[{toks,size?,tone?,pre?,post?}]` `window?` | `toks` = `[character, seconds][]`; round window 400px, window top 270; the font size is precomputed from the width of the whole sentence, so the size doesn't jump while typing |
| `SignatureCard` | `at` `name` `slogan[3]` `tag?` `y?` | The whole block ≤ y1240; `y` defaults to 980 |
| `BehindPerson` #3 | `chars[{c,at,x,y?,tone?}]` `at` `matteSrc?` | Characters are clamped into the safe zone; needs per-frame matting, and without it falls back to text in front of the person |

## Scene changes (`scenes.tsx`)
| Component | Parameters | Notes |
|---|---|---|
| `SplitScene` | `a` `b` `src` `cardH?` `children(t)` | Top card (y250–650) + bottom portrait window (y690–1230); background darkened |
| `RetentionCard` | `t` `title` | Audience-retention curve, labeled "swipe away" (划走) once drawn |
| `CompareCard` | `t` `leftLabel` `rightLabel` `leftAt` `rightAt` | Left side a messy pile of colored bars (✗), right side aligned (✓) |
| `PhoneSwipe` | `a` `b` `src` `swipeAt` `lines[{text,at,big?}]` | Phone 480×840 on the left, three lines of text on the right (≤360 wide); swipes up and away at `swipeAt` |
| `Reporter` | `a` `b` `matteRange` `cardH?` `standIn?` `children(t)` | Top card + matted person standing in front; `matteRange` = the frame range where matting exists; `standIn` is a placeholder human figure for preview |
| `PipBroll` | `a` `b` `src` `pos?`(tr/tl/bc) `label?` `broll?` | Footage full screen + 270px white-bordered round window; all window positions are inside the safe zone |
| `SplitBroll` | `a` `b` `src` `label?` `broll?` | The top 1040px is you, a footage strip below; the label tag (标签牌) sits on the strip |
| `BrollBottom` | `a` `b` `label?` `broll?` | Footage strip slides up from y1060; captions must make way |
| `PosterHero` | `a` `b` `word` `tone?`(accent/pain) `sub?` `broll?` | Darkened 40%; the giant text auto-shrinks to the width (≤4 characters is best) and slowly grows |
| `LabelTag` | `at` `until` `text` `x?` `y` | Yellow label tag (标签牌), goes through FitBox |
| `BrollPlaceholder` | `hue?` `word?` | Placeholder footage for preview; swap in `<OffthreadVideo>`/`<Img>` for real use |
| `LabelHero` | `label` `hero` `at` `heroAt?` `tag?` `tagAt?` `labelTone?` `heroSize?` | Small label pressed onto the top-left corner of the big text; `tag` = small white-background red-text label |
| `SpreadHero` | `top` `bottom` `at` `bottomAt?` `topTone?` `bottomTone?` `spanW?` | Letter-spacing widened to span `spanW` (default 860); spacing is added after each character, total width = n·size + n·ls |
| `GhostWord` | `ghost` `line` `at` `lineAt?` `tone?`(pain/white/accent2) `ghostSize?` | Giant semi-transparent text, placed in the chest band; `ghost` ≤3 characters |
| `QuoteCard` | `items[{tag?,lines[[{t,hl?}]],at}]` `source?` `sourceAt?` | Full-screen darkening + `backdropFilter: blur(16px)`; each line goes through `FitBox`; source right-aligned |
| `ChapterTag` | `num` `title` `at` `color?` | Yellow block + arrow + dashed-box title; in the chest band |
| `MotionText` | `text` `preset` `at` `until` `y` `size` `tone?` `font?` `align?` `x?` `ls?` | 18 entrance-animation presets; goes through `FitBox` internally; per-character presets use one span per character |
| `EmotionWord` | `text` `kind` (cry/surprise/joy/shout) `at` `until` `y?` `size?` `spanW?` | Emotion word; with 2–3 characters the tracking auto-stretches across `spanW` (default 800); goes through `Zone` + `FitBox`; `cry` fills red from the bottom, `joy` has radiating light, `surprise` / `shout` move character by character |
| `GlassWord` | `text` `size` `at` `until` `y` `x?` `grad?` (gold/pearl/rose/aqua or a CSS gradient) `italic?` `baseAlpha?` `lightAlpha?` `font?` `maxW?` | Glass text; **must not go inside Zone / FitBox** (the hard-light blend would fail); sizes itself by width; its container has no opacity/transform/filter |
| `Headroom` | `src` `startFrom?` `dy` `children` | Makes headroom for the text: shifts the whole camera container down by `dy`, fills the top with a mirror of the video's top; children use container coordinates (screen y = container y + dy); only for footage with no person at the top |
| `TextBehind` | `matteSrc(frame)` `children` | Text behind the person: children (the text) + matte PNG stacked; draws no text on a frame without a matte; put it in the same camera container as the video |
| `FaceCard` | `src` `w` `h` `zoom` `faceY?` | Crops the face out of the same talking-head video (assumes the face is at x550 y640 in the original framing; change `FACE` if you swap the footage) |

## What to change when swapping footage
- `FACE = {x, y}` in `scenes.tsx`: the center of the face in the original video.
- `FONT_BASE` in `kit.tsx`: where the fonts live (in a standalone repo change it to `''` and put the fonts in `public/fonts/`).
- Fonts (all commercially usable): Source Han Serif (思源宋体) Heavy (OFL), Smiley Sans (得意黑) (OFL), Douyin Meihao (抖音美好体) (free for commercial use). **The repo does not bundle font files; please download them yourself.**
