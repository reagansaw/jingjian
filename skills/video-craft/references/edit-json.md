# edit.json 速查：每个 `kind` 要写哪些属性

起步项目 `remotion/` 的 `Edit` 读 `edit.json`。`beats[i] = { "kind": 版式 id, "props": { … } }`。时间（`at` / `until` 等）都是**秒**，从片头算。`th` 不用写（由 `theme` 带上）。
这张表照 `remotion/craft/*.tsx` 的真实类型写的；**`?` = 可不写**。`tone` 的取值：`white` `chrome` `accent` `accent2`。

## 顶层
| 字段 | 说明 |
|---|---|
| `src` | `public/` 下的视频文件名（1080×1920）；`null` = 占位人形（先看版式） |
| `durationSec` | 视频秒数（`ffprobe -v error -show_entries format=duration -of csv=p=0 public/<文件>`） |
| `theme` | `dark-lime` / `biz-gold-red` / `guofeng-cream` / `knowledge-yellow` |
| `cuts` | 硬切推近时间点（秒）；相邻两段在 `zoom[0]` / `zoom[1]` 之间交替 |
| `zoom` | 两档缩放，默认 `[1.0, 1.12]`；实战值 `[1.15, 1.2]` |
| `shiftY` | 整个画面上移像素（负数）；脸很大时 `-120` 并配 `zoom` ≥1.12 |
| `sfx` | `[{ "t": 秒, "file": "xx.mp3", "volume"?: 0.8 }]`，文件放 `public/sfx/`；没有就写 `[]` |
| `guides` | `true` = 画安全区红框（只在检查静帧时开；`npm run final` 会拒绝 `true`） |

## 版式（`beats[].props`）
所有版式都要 `until`（讲完的时间），`signature` 除外（它不淡出）。

| kind | 属性 |
|---|---|
| `chest-big` | `small` `big` `at` `until` · `bigAt?` `tone?` `bigSize?` |
| `strike-swap` | `lead` `old` `at` `strikeAt` `until` · `next?` `nextAt?` `oldSize?` |
| `left-stair` | `rows: [{ pre, key, at, big? }]` `until` · `y0?` |
| `a-to-b` | `a` `b` `at` `bAt` `until` |
| `two-column` | `left` `right`（各 `{ pre, key, tail?, at }`）`until` · `lineAt?` |
| `bars` | `lead` `leadAt` `bars: [{ text, at }]` `until` |
| `vertical-wall` | `chars: [{ c, at, tone? }]` `until` · `x?` `top?` `size?` |
| `dark-question` | `small` `big` `at` `until` · `bigAt?` |
| `chapter` | `num` `title` `at` `chips: [{ text, at }]` `until` · `punch?: { text, at }` |
| `giant-fill` | `char`（1 个字）`at` `fillAt` `until` · `size?` `top?` |
| `signature` | `at` `name` `slogan: [三句]` · `tag?` `y?` |
| `label-hero` | `label` `hero` `at` `until` · `heroAt?` `tag?` `tagAt?` `labelTone?` `heroSize?` |
| `spread-hero` | `top` `bottom` `at` `until` · `bottomAt?` `topTone?` `bottomTone?` `spanW?` |
| `ghost-word` | `ghost` `line` `at` `until` · `lineAt?` `tone?`（`white`/`pain`/`accent2`）`ghostSize?` |
| `quote-card` | `items: [{ tag?, lines, at }]` `until` · `source?` `sourceAt?`；`lines` = 行数组，每行 = `[{ t, hl? }]` |
| `chapter-tag` | `num` `title` `at` `until` · `color?` |
| `top-title` | `line1` `line2` `until` · `at?` `size1?` `size2?`（整块在 y≥250，脸大要先下移画面） |
| `stack-list` | `items: [{ text, at }]` `until` · `punch?: { text, at }` `size?`（带 `punch` 最多 3 条） |
| `end-cta` | `label` `at` `until` · `hint?` `arrow?` `color?`（文案由用户给 / 用口播原话，别编账号） |

## 写 edit.json 的顺序
1. 先写 `top-title`（如要）和钩子（`chest-big` / `giant-fill` / `spread-hero` 之一，`at` ≤ 0.3）。
2. 内容段挑**一个套路**（`essence.md` §三）：编号用 `chapter-tag`，累加用 `stack-list`，递进用 `left-stair`。
3. 结尾 `end-cta`。
4. `"guides": true` → `npx remotion still index.ts Edit check.jpg --props=edit.json --frame=<帧>` 逐款看 → 改回 `false` → `npm run final`。
