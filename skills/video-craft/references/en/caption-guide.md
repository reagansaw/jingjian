# Choosing a caption style (the 12 most common categories)

**Do not read `caption-presets.json` (800 KB).** Decide which category the line belongs to, then run `python3 tools/pick_caption.py --cat <category> --segs <segments> --chars <longest segment length> --band <above|mid|lower>` to get 3–5 candidates and pick one. Use the same preset at most twice per video, never the same category on two lines in a row (`--seed N` to rotate).

> ⚠ The "use for" column is **inferred from category names and spec numbers** (segments / characters per segment / position / duration / animation). It has not been checked preset by preset in motion, nor confirmed line by line by the author; questions / numbers / numbering / size were checked against real projects (see the end). When unsure, use the generic "2-line caption" categories or look in the gallery first.

| Category (zh name) | Count | Use for | Spec features (median) | Avoid |
|---|---|---|---|---|
| **关键词 keyword** | 35 | The core word(s) to stress inside a sentence (product, action, result), one to a few words popping in | ≈4 chars; 1–19 segments; 2.7 s; low y≈1270; reveal / blur animations | Whole sentences; every line (dilutes emphasis) |
| **金句 golden line** | 20 | One opinion / quote / closing line that needs reading time | 1–4 segments; ≈6 chars (some full sentences); 2.3 s; middle y≈720; fade-in / typing cursor | Fast speech |
| **重点信息 key info** | 19 | Points, selling points, data points, one short word per segment | ≈3 chars; 1–10 segments; 3 s; upper-middle y≈570; grow / slide | Long sentences; big faces (upper-middle hits the head, run place_check) |
| **疑问 question** | 11 | Questions (why…? what now? aren't you…?), building suspense | 2–4 segments; ≈4 chars; 2.1 s; low y≈1380; per-character reveal | Statements |
| **开场文案 opening copy** | 12 | The hook in the first 3 s | 2–5 segments; ≈4 chars; 3 s; low y≈1330; shrink / curtain / slide up | Mid-video |
| **序号 numbering** | 6 | "Point 1 / Point 2 / 01 02" | 1–2 segments; ≈4 chars; 1.4 s; middle y≈720 | Content without points |
| **三段字幕 / 3句并列 three-part** | 16 / 13 | Three parallel points, or "first… then… finally…" | 3 segments; ≈3–5 chars; 2.4–3 s; fade / grow / bloom | Only two points (use "2句并列") |
| **数字展示 number display** | 5 | Specific numbers (how many orders, how much, what percent) | 3–4 segments; ≈2 chars; 2.2 s; low; roll-in | Numbers he did not actually say |
| **框架概要 outline** | 8 | Structure: "three parts", "first A then B" | 2–3 segments; ≈3–4 chars; 3 s; fade / grow | Single-point content |
| **2句字幕 / 2行字幕 / 1句字幕 generic captions** | 69 / 29 / 11 | Generic caption replacement: one sentence on two lines, second line recoloured / heavier | 2–4 segments; ≈5–6 chars; 1.4–2 s; low y≈1310 (sits on the caption band) | When you need "emphasis" (use keyword / golden line) |
| **2个大字 / 4个大字 big words** | 16 / 21 | Hook words, emotion words, one word slams in | 1–4 segments; 2–4 chars; 1.1–1.2 s; upper y≈440–550 (close to the head!); shrink / fold / glow-blur | Big faces (covers the face; run place_check or add a reframe) |
| Others (overlay / side-by-side / scrolling comments / fun text / emotion…) | — | Filter by segments + characters with `pick_caption.py` | — | — |

## General rules
1. **Length**: `--chars` = the longest segment of his line; the preset segment must hold at least that many characters (longer text is auto-shrunk; if shrunk too much, pick another).
2. **Position**: many presets are "lower-third captions" (y≈1300) and sit on the caption band and interaction buttons. `pick_caption.py` already computes `dy` for the safe zone (y250–1250); `place_check.py` checks the safe zone and the face again.
3. **Never cover the face** (hard rule): run `face_track.py` + `place_check.py --fix` first. Upper-positioned categories (big words, key info) hit the head most easily.
4. **Rhythm**: at most 1–2 style presets per 5–10 s; plain captions the rest of the time. Don't chain the same category.
5. **SFX**: a `pop` plays at the start; add finer sounds in `sfx` yourself.

## Checked against real talking-head projects (88 projects · 2,813 text segments)
The inferences above were compared with the **real scripts and styles** in the 70 talking-head projects (72/73 readable), the 30 creator breakdowns (15/31 readable) and the 40 "Yichuang" projects (only 1/40 readable, the rest are encrypted). The scripts are client content and are analysed locally only; below are statistics, not original lines.

| Sentence type (judged from the script) | Segments | Real usage | Matches the table above? |
|---|---|---|---|
| **Questions** (? / why / how / "ma") | 175 | median 6 chars, 1.3 s; 77% in the lower third; entrances mostly fade-in, per-character reveal, slide up | ✔ matches (per-character reveal, low) |
| **Numbering** (first / 1. / one,) | 93 | median 3 chars, 0.8 s (very short); 83% low; mostly the Smiley Sans-style font | Partly: real usage is shorter, fewer characters than the presets |
| **Numbers** (digits / 10k / yuan / % / count) | 318 | median 7 chars, 1.6 s; 70% low; "roll-in" most common, then fade-in, typing cursor, cylinder roll | ✔ matches (roll-in) |
| Other statements | 2,227 | median 5 chars, 1.3 s; 70% low; fade-in, shrink, grow, snow-light blur, random rise | — |

**By position in the video:**
- **First 3 s** (554 segments): mostly shrink, fade-in, glow blur, slow slide-in.
- **Last 5 s** (384): mostly grow, fade-in, shrink, slight grow.
- Opening and closing text is not noticeably bigger: the hook comes from **animation + position**, not size.

**By length:** 1–3 characters are 25% of segments, clearly bigger (≈22), 1.1 s; 4–6 characters are the most common (40%), size ≈15; 7–12 characters ≈12, 1.5 s; 13+ ≈11, held 2.7 s. → **More characters = smaller and held longer**; `cap-preset` auto-shrinks over-long text, which is the right direction.

**The key finding: 72% of real captions sit in the lower third (y≈1335).** That conflicts with our safe zone (y250–1250): the real templates' lower-third caption position falls inside the band we reserve for interaction buttons. That is why `pick_caption.py` computes a `dy` for every preset to move it into the safe zone; it is our rule, not what the JianYing templates do.
**Limits:** the sample is mostly the 70 projects (knowledge / industry talks); most of the creator breakdowns and Yichuang projects cannot be opened; the statistics show how real templates place text, not what works best.

## Matched preset by preset against real segments (2,813 segments in 88 projects × 657 presets)
Method: every real text segment and every segment of every preset is scored on font name, colour, entrance animation, size × scale, y position, duration, character count and stroke / shadow (maximum ≈15.7), and the most similar preset is taken; a score ≥10 counts as a match (2,080 of 2,813, median score 11.5). **This is matching by style similarity; the project files do not record which preset was used**, so it is a strong hint, not proof.

**Results:**
- **405 of 657** presets appear in real projects; **112 appear ≥5 times**; **68 appear in ≥3 different projects**. The count is stored in the `real` field of `caption-presets.json` (counts only, no scripts); `pick_caption.py` prefers the more-used preset when others are equally suitable, and the gallery can filter "used in real projects".
- **The most used are the generic caption categories**: 2-sentence captions (≈466 segments in 58 projects), staggered 2-sentence captions, 2-line captions, 2-sentence overlay, multi-caption display, golden line, 3-sentence parallel, keyword. Most captions in most talking-head videos are these.

**Correction to "category name = what to use it for" (important):**
- Category names are only **weak hints**. In most categories about 80% of real use is plain statements; sentence types barely differ.
- Categories with a real signal (above baseline): **question** — 36% are real questions (baseline 6%, ≈6×); **multi-caption display** — 21% are numbered lines (baseline 3%, ≈7×); **opening copy** — 33% sit in the first 3 s (baseline 20%); **scrolling comments** — 40% at the start.
- **Keyword, key info, golden line, 2-sentence captions** show no clear sentence-type preference in real use: don't expect "right category = right sentence"; look at **segments, characters per segment, animation and position**.
- So the picking order is: **filter by segments and characters → filter by position band → among equals prefer the more-used preset → treat the category name as a hint only**.

**Limits:** matching is by style similarity; the sample is mostly the 70 talking-head projects; "used a lot" does not mean "works well" (only that template makers use it often).
