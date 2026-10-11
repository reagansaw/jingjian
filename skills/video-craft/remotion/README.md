# 起步项目（可运行）

一条口播视频 + 一份 `edit.json` → 带版式 / 小标题 / 累加清单 / 结尾行动的竖屏成片。所有字守安全区（x 60–1010、y 250–1250）。

**要求**：Node 18+（作者用 24）、1080×1920 的口播视频。**不需要 Mac**（抠像那几款才需要，起步项目不含）。

## 1. 装
**如果是用 plugin 装的：先把这个 `remotion/` 文件夹整个复制到你自己的工作文件夹**（plugin 的缓存目录更新时会被清掉）：
```bash
cp -R <plugin 里的 remotion 路径> ~/my-video
cd ~/my-video
npm install
```
（直接让 Claude 做：「把 video-craft 的 remotion 复制到 ~/my-video 并 npm install」。）
> 如果 `npm install` 报 `EACCES … ~/.npm`（缓存里有 root 拥有的文件）：`npm install --cache /tmp/npm-cache`，或按提示 `sudo chown -R $(id -u):$(id -g) ~/.npm`。
> 第一次渲染会自动下载无头 Chrome（约 100MB）。

## 2. 看一眼（不需要任何素材）
```bash
npm run dev                      # 打开 Remotion Studio：左边选 Edit 或 Craft-<版式 id>
npx remotion still index.ts Craft-end-cta out.jpg --frame=48
```
`Craft-<id>` 就是 library 里每张卡的 id（文字版式 / 字搭配 / 骨架 / 动画 / 主题 / 情绪字）。换场和抠像那几款要素材，起步项目里没有。

## 3. 剪你的口播
0. **要逐字时间就先转写**（没有就只能估，字会对不上嘴）：命令在 `../references/workflow.md` §1（`mlx_whisper … --word-timestamps True`，macOS）；其它系统用任一能出词级时间戳的 whisper。
1. 把视频放进 `public/`（例如 `public/input.mp4`），**1080×1920**。
2. 复制 `edit.example.json` → `edit.json`，**每个 `kind` 要写哪些属性看 `../references/edit-json.md`**，改：
   - `src`: `"input.mp4"`；`durationSec`: 视频秒数（`ffprobe -v error -show_entries format=duration -of csv=p=0 public/input.mp4`）
   - `theme`: `dark-lime` / `biz-gold-red` / `guofeng-cream` / `knowledge-yellow`
   - `cuts`: 硬切推近的时间点（秒），相邻两段在 `zoom`（默认 `[1.0,1.12]`）之间交替；脸很大用 `shiftY: -120`
   - `beats`: 每一项 `{ "kind": 版式 id, "props": { ... } }`，`props` 就是 library 每张卡「代码」里的那些属性（`at` / `until` 单位是秒）
   - `sfx`: `[{ "t": 1.2, "file": "ding.mp3" }]`，文件放 `public/sfx/`（自备，只用有权使用的）；**没有音效就写 `[]`，不会报错**
   - `guides`: 先设 `true` 画出安全区红框，逐款目视检查，出片前改回 `false`
3. 出静帧检查，再出片：
```bash
npx remotion still index.ts Edit check.jpg --props=edit.json --frame=90
npm run check            # 检查 edit.json：红框没关 / 版式 id 写错 / 文件不存在 / 时间超出片长
npm run final            # = 先 check，通过才渲 out.mp4（--concurrency=2）
```
机器忙的话前面加 `nice -n 19`（macOS / Linux）。**`guides: true` 时 `npm run final` 会拒绝出片**，所以不会带着红框发出去。
可用的 `kind`：`chest-big` `strike-swap` `left-stair` `a-to-b` `two-column` `bars` `vertical-wall` `dark-question` `chapter` `giant-fill` `signature` `label-hero` `spread-hero` `ghost-word` `quote-card` `chapter-tag` `top-title` `stack-list` `end-cta`。写错会直接报错并列出可用的。

## 4. 字体
放进 `public/craft/fonts/`，见那里的 `README.md`。没放也能出片（退到系统中文字体）。

## 5. 没有的 / 没验证的
- 没有口播转写、补停顿、抠像、BGM：用 `../tools/` 里的脚本（见 `../tools/README.md`），其中多数只在 macOS 验证过。
- `Edit` 只做「视频 + 版式 + 推近 + 音效」，不做换场（上卡下脸 / 手机划走 / PIP）和字在人后；那些要素材，看 `../references/`。
- 渲染速度：1080×1920 / 30fps，作者的机器上 8 秒约 1–2 分钟（机器忙时更久）。长片先出静帧检查，别一上来渲全片。
