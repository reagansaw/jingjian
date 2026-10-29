# edit.json cheat sheet: which props each `kind` takes

The starter project's `Edit` (`remotion/`) reads `edit.json`. `beats[i] = { "kind": layout id, "props": { … } }`. Times (`at` / `until` etc.) are **seconds** from the start. You don't write `th` (it comes from `theme`).
Written from the real types in `remotion/craft/*.tsx`; **`?` = optional**. `tone` values: `white` `chrome` `accent` `accent2`.

## Top level
| Field | Meaning |
|---|---|
| `src` | file name under `public/` (1080×1920); `null` = placeholder figure (to preview layouts) |
| `durationSec` | video length in seconds (`ffprobe -v error -show_entries format=duration -of csv=p=0 public/<file>`) |
| `theme` | `dark-lime` / `biz-gold-red` / `guofeng-cream` / `knowledge-yellow` |
| `cuts` | hard-cut push-in times (seconds); neighbouring segments alternate between `zoom[0]` / `zoom[1]` |
| `zoom` | two zoom levels, default `[1.0, 1.12]`; the author's values `[1.15, 1.2]` |
| `shiftY` | shift the whole picture up (negative px); for a big face use `-120` together with `zoom` ≥ 1.12 |
| `scrim` | strength 0–1 of the dark gradient under the chest, default 0.75. White clothes / a bright background make text mushy; this darkens it. 0 = none |
| `captions` | Subtitles: `[{ from, to, text }]` (seconds). Generate with `python3 ../tools/make_captions.py --words transcript.json --text proofread.txt [--offset start-seconds] [--length segment-seconds]`; each ≤12 width (CJK 1, Latin/digits 0.55), checked by `npm run check` |
| `captionHl` | words in the subtitles to colour with the accent, e.g. `["销冠", "AI 自动化"]` |
| `captionSize` | subtitle size, default 54 (bottom edge ≤ y1230). With subtitles, move the `end-cta` `cy` up (e.g. 1020) so they don't collide |
| `reframe` | local re-framing: `[{ at, until, shiftY?, zoom? }]`, eases (0.2 s) to another shiftY / zoom inside the window; tighten the shot or open headroom while an effect plays |
| `behind` | text behind the person: `[{ text, at, until, matte, from, to, y?, size?, small?, tone? }]`; `matte` dir under public + source frame range `from`–`to`; frames without a matte draw no text |
| `fill` | `'blur'` (default) / `'none'`: how the edge exposed by shifting/shrinking the video is filled |
| `camera` | Camera effects (wrap the video layer; text is unaffected): `[{ kind, at, … }]`. `punch` (`at?` `dur?` `from?`) · `shake` (`hits:[seconds…]`) · `tvoff` (`at` `until?`, **give `until`**) · `send` (`at` `until?`) · `circle` (`at` `until` `cy?` `R?` `face?:[x,y]` `peers?` `popAt?`) |
| `autoSfx` / `sfxGain` | Automatic sound effects (on by default) / master gain (default 0.5). The table is in `craft/autosfx.ts`; to turn one layout off write `"sfx": false` in its props |
| `sfx` | `[{ "t": seconds, "file": "xx.mp3", "volume"?: 0.8 }]`, files in `public/sfx/`; write `[]` if none |
| `guides` | `true` = draw the safe-zone red box (only while checking stills; `npm run final` refuses `true`) |

## Layouts (`beats[].props`)
Every layout needs `until` (when the speech ends) except `signature` (it doesn't fade out).

| kind | props |
|---|---|
| `chest-big` | `small` `big` `at` `until` · `bigAt?` `tone?` `bigSize?` |
| `strike-swap` | `lead` `old` `at` `strikeAt` `until` · `next?` `nextAt?` `oldSize?` |
| `left-stair` | `rows: [{ pre, key, at, big? }]` `until` · `y0?` |
| `a-to-b` | `a` `b` `at` `bAt` `until` |
| `two-column` | `left` `right` (each `{ pre, key, tail?, at }`) `until` · `lineAt?` |
| `bars` | `lead` `leadAt` `bars: [{ text, at }]` `until` |
| `vertical-wall` | `chars: [{ c, at, tone? }]` `until` · `x?` `top?` `size?` |
| `dark-question` | `small` `big` `at` `until` · `bigAt?` |
| `chapter` | `num` `title` `at` `chips: [{ text, at }]` `until` · `punch?: { text, at }` |
| `giant-fill` | `char` (one character) `at` `fillAt` `until` · `size?` `top?` |
| `signature` | `at` `name` `slogan: [three lines]` · `tag?` `y?` |
| `label-hero` | `label` `hero` `at` `until` · `heroAt?` `tag?` `tagAt?` `labelTone?` `heroSize?` |
| `spread-hero` | `top` `bottom` `at` `until` · `bottomAt?` `topTone?` `bottomTone?` `spanW?` |
| `ghost-word` | `ghost` `line` `at` `until` · `lineAt?` `tone?` (`white`/`pain`/`accent2`) `ghostSize?` |
| `quote-card` | `items: [{ tag?, lines, at }]` `until` · `source?` `sourceAt?`; `lines` = array of lines, each line = `[{ t, hl? }]` |
| `chapter-tag` | `num` `title` `at` `until` · `color?` |
| `top-title` | `line1` `line2` `until` · `at?` `size1?` `size2?` (whole block at y ≥ 250; lower the picture first if the face is big) |
| `stack-list` | `items: [{ text, at }]` `until` · `punch?: { text, at }` `size?` (at most 3 lines with `punch`) |
| `end-cta` | `label` `at` `until` · `hint?` `arrow?` `color?` `cy?` (pill centre line, default 1150; use 1020 with subtitles) (wording from the user / the speech's own words; never invent an account) |

## Hooks & effects (`beats[].props`; `at` / `until` are absolute seconds in the final video)
| kind | props |
|---|---|
| `white-flash` | `at` · `dur?` `color?` |
| `kinetic-line` | `words: [{ t, text, hot? }]` `y` · `until?` |
| `counter-slam` | `land` · `to?` (default 8) `at?` `top?` `x?` (centre x, default 540; **put it beside the face when the face is big, e.g. 820**) `suffix?` (unit, small) `until?` `size?` |
| `stamp` | `text` `at` `until` `y` · `color?` `size?` |
| `chat-dm` | `text` `at` `until` · `sendAt?` `placeholder?` `y?` |
| `slot-row` | `n` `y` `at` `until` |
| `rapid-montage` | `images: [{ src, w, h }]` (`src` relative to public; **bring your own screenshots**) `at` `until` · `step?` `label?` (`{n}` = index) `y?` |
| `jy-text` | `text` `at` `dur` `preset` `y` `size` · `x?` `tone?` (`gold` `cream` `white` `cinnabar` `pale` `ink` `accent`) `font?` `color?` `gradient?` `dimAt?` `ls?` |
| `particles` | · `kind?` (`gold`/`firefly`) `n?` `seed?` `area?` `at?` `until?` |
| `mist` / `paper-grain` | · `bands?` `color?` / `vignette?` |
| `ink-wipe` | `at` · `dur?` `color?` `kind?` (`blot` `brush` `splash` `rise`) `cx?` `cy?` |
The 24 `jy-text` presets (Chinese names, as in JianYing): 向上露出, 向下露出, 向上滑动, 随机上升, 向右缓入, 模糊发光, 向左模糊, 放大, 轻微放大, 呐喊声波, 生长, 缩小, 缩小II, 辉光, 激光雕刻, 发光模糊, 逐字显影, 收拢, 折叠, 波浪弹入, 打字光标, 跃进, 开幕, 流光扩散.

## Order for writing edit.json
1. `top-title` first (if wanted), then the hook: one of `chest-big` / `giant-fill` / `spread-hero` (`at` ≤ 0.3), plus `camera: punch` + `white-flash` + a number (`counter-slam`) — the hook triple (script + picture + sound; the sound is automatic).
2. Pick **one routine** for the content (`essence.md` §3): numbered → `chapter-tag`, stacking → `stack-list`, progression → `left-stair`.
3. Ending `end-cta`.
4. `"guides": true` → `npx remotion still index.ts Edit check.jpg --props=edit.json --frame=<n>` and look at each → set back to `false` → `npm run final`.
