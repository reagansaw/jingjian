# The essence: the shared "skeleton" of 64 finished videos

Answers: **whatever the industry, what do the JianYing talking-head templates all get right?** The other files cover parts (layouts, fonts, motion, sound effects); this one covers **how to arrange the parts into one video**.

## Source and reliability (read first)
- Watched 64 industry preview videos (de-duplicated): for each, one frame every 1.2 s tiled into a contact sheet and read one by one; plus three overview sheets of all 64 at **second 1 / second 3 / 0.8 s before the end**; then **measured** whatever can be measured from the text tracks of the matching project files (`template.json.bak`).
- **Eyeballed** (contact sheets): the "skeleton / section patterns" below. These are patterns seen by eye; quantities are worded "most / about half" and **were not counted one by one**.
- **Measured** (project text tracks, 66 videos): hook size and ending call-to-action words. The basis is stated next to each number.
- **Not seen**: motion (sampled frames only; for motion details trust `motion-vocabulary.md`) and sound (picture only).

## 1. The skeleton of a video (almost all follow this order)
```
0–1 s    Hook: one giant word / phrase, before any explanation
1–5 s    Set-up: a persistent small title (some videos) + first sentence + keyword
Middle   Content: 2–4 "points", each with one fixed routine (see §3)
          Interleaved: full-screen footage / black cards / the person shrunk to a small window, so the picture is not always a full face
End      Action: tell them where to tap next (see §4)
```
- **Hook**: **45 of 66 (68%) have text at ≥ 1.8× the video's median text size within the first 1.5 s**; the median ratio is **2.4×**. (Basis: project text tracks, JianYing size units, compared as a ratio.) On the contact sheets the hook is almost always a **2–4 character word** (垃圾 / 降息 / 广州 / 高考 / 亲子共读 / 失败 / 赚钱 / 一人之力), at head or chest height, in yellow / red / white.
- **The hook word may sit behind the head**: in "垃圾", "降息", "一人之力" and "醒醒" hair / the top of the head covers a small part of the word (just a little; the word stays readable) → use the `text-behind` Headroom method **and keep the rule "the person covers only 8–20%"** (`text-behind-glass.md`).
- When the hook appears, a small caption is already speaking underneath — **the giant word is the headline, the caption is the body, both are on screen together**.

## 2. The picture is not always a full face: four kinds of "breathing"
| Technique | What it looks like | Existing component |
|---|---|---|
| Person shrunk to a **circular avatar**, text beside / below | Black background, circular avatar + one caption line; "谁 ● 被打脸" and "直接 ● 拉黑" split the big word into two blocks that sandwich the avatar | `typed-quote` (circular window); **split-word sandwich = missing** |
| Person in a **rounded small window**, evidence / footage above | Most common in law, commentary, entrepreneurship; a small red headline in the window's corner | `pip-broll` / `split-broll` |
| **Black quote card** | Quotation marks + typed-out text + a keyword turning colour, circular avatar + one caption line below | `quote-card` / `typed-quote` |
| **Full-page footage** (poster, document, paper, real object) | Full screen for 1–3 s, caption below | `poster-hero` / `broll-bottom` |
- By eye, **about 1/3 of the time is not a full-screen face** (consistent with the "two layers of rhythm" in SKILL.md §2; eyeballed, not timed one by one).
- Black cards and avatars appear at **chapter turns, when giving an example, when reading a quote** — not at random.

## 3. Six fixed routines for the content section (pick one for the whole video; don't switch each segment)
1. **Numbered**: a small tag in the corner `No.1 / No.2 / No.3` (or "第一点 / 第二点"), unchanged through the section; under each point, a small caption + keyword. (parenting, workplace)
2. **Stacking list**: "1. … 2. … 3. …" appear one by one, **when a new line appears the older ones dim**; a closing line lands as a big word on top. (knowledge products)
3. **Paper-card list**: cream paper background, a circular avatar top-left + a "three essentials" title, items appear one by one, each with a cartoon / object icon. (entrepreneurship, side hustles)
4. **Keyword above the caption**: the chest caption stays put; **the key word gets its own bigger size in yellow / red, placed right above the caption**, the caption itself doesn't move. (almost every video)
5. **Keyword as a wall**: the same word (出轨) surfaces in several places around the person at different sizes, semi-transparent, for pressure. (relationships)
6. **Number / price slams in**: torn-paper footage card + big yellow number (29888) + a name; the number uses `roll-in` or `slam`. (cars, home, finance)

## 4. The ending: always a "next step"
- **27 of 66 (41%) have an action word in the text of the last 4 s** (找我聊聊 / 点击左下角 / 下期揭秘 / 联系我 / 点赞收藏). (Basis: text in the project text tracks; **blue pills and arrows are mostly stickers and were not counted, so the real share is higher** — on the overview sheet almost every video has one in the last 0.8 s.)
- What the endings look like (overview sheet):
  - **Blue pill button** "找我聊聊 / 点我试试 / 点击领取", below the chest (`Pill` can do it);
  - **Red / yellow arrow pointing to the bottom-left** (the platform's avatar / follow button);
  - **A "下期揭秘 / 下期揭晓" big word**, semi-transparent behind the person (`ghost-word` can do it);
  - **"转给他看" + circular avatar** on a black closing card;
  - a closing golden line on black (quote card).
- Position: inside the safe zone (the arrow to the bottom-left is the exception, **but it must still be at y ≤ 1250**).

## 5. A persistent small title (about a quarter of videos)
- Example: `/成交高端客户/` white + `简单到离谱` yellow (two lines), **at the top for the whole video** (by eye about y 150–300 of 1920, **the upper part is outside our safe zone y ≥ 250**, so copying it as-is gets covered by platform UI — move the whole block down to y ≥ 250).
- Purpose: someone who scrolls in late still knows the topic; it also leaves room for the hook word.

## 6. Three cheap "small moves" for emphasis (nearly every video has them)
1. **Push-in + vignette**: at the key moment push in and darken the corners, back within 0.2–0.5 s.
2. **One word changes colour and goes one size up**; the rest does not move.
3. **Stickers**: red circle, arrow, a "拒绝" stamp, a `?`, a REC viewfinder — one next to the text, not many.

## 7. Still missing from this library (honest)
| Missing pattern | Seen in | Note |
|---|---|---|
| Split-word sandwich (谁 ● 被打脸) | commentary, loans | circular avatar between two blocks of big text |
| Person as a **white-outlined cut-out** (sticker style) + blurred background | custom home | needs matting; `lift` + white outline would do it; not built |
| Torn-paper footage card | cars | zig-zag-edged paper + footage; not built |
| REC / viewfinder overlay | cars | pure overlay; not built |
| ~~Stacking list (older lines dim)~~ | knowledge products | ✅ done: `stack-list` (`skeleton.tsx`) |
| Paper-card list (cream background + icons) | entrepreneurship | needs your own icons |
| ~~Persistent small title~~ | healing, women's growth | ✅ done: `top-title` (make headroom first if the head reaches the top) |
| ~~Ending blue pill + arrow~~ | most | ✅ done: `end-cta` (motion feel in the preview not verified) |
| Vignette push-in | healing | not wrapped |

The three ✅ are in the library's "Skeleton" category, code in `remotion/craft/skeleton.tsx`; safe zone checked on still frames, **motion was not checked frame by frame**.

## 8. How to use this file
1. First decide the **hook word** (2–4 characters; offer 3 candidates for the user to choose).
2. Pick **one content routine** (§3) for the whole video.
3. Place 2–3 "breathing" moments (§2) at turns / examples / quotes.
4. **Always** add an ending action (§4): if the speech already has a call to action (tap bottom-left / DM me) use those words; use an account / contact if the user gave one; otherwise ask; **if you can't ask, leave the pill out — never invent an account**.
5. Build with existing components; for gaps (§7) use the nearest substitute and tell the user "there is no ready-made component for this part".
