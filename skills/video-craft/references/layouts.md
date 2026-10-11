# 版式参数（照 `remotion/craft/layouts.tsx` 的真实签名）

所有版式共同参数：`th`（主题对象 `THEME_DARK_LIME` / `THEME_DARK_GOLD` / `THEME_BIZ_GOLD_RED` / `THEME_GUOFENG_CREAM` / `THEME_KNOWLEDGE_YELLOW`；起步项目的 edit.json 里写 id：`dark-lime` / `biz-gold-red` / `guofeng-cream` / `knowledge-yellow`）、`until`（讲完的时间，秒）。时间一律是「合成开始后的秒数」。
字放进 `<Zone>`（整体上移 150px 落进胸口带），文字走 `Txt/FitBox`（量宽 → 超出安全区就缩小 → 推回）。

| 版式 | 参数 | 要点 |
|---|---|---|
| `ChestBig` #23 | `small` `big` `at` `bigAt?` `tone?` `bigSize?` | 小字 54px 在上，大字 190px 砸下（slam） |
| `StrikeSwap` #24 | `lead` `old` `at` `strikeAt` `next?` `nextAt?` `oldSize?` | 旧说法太长会自动缩小，划线跟着缩；`next` 出现时旧的淡掉 |
| `LeftStair` #53 | `rows[{pre,key,at,big?}]` `y0?` | 每行缩进 44px，上一行变暗；最后一行 `big` 用副强调色 |
| `AtoB` #41 | `a` `b` `at` `bAt` | 箭头位置按 A 的宽度算；B 字号按剩余宽度缩 |
| `TwoColumn` #17 | `left` `right`（`{pre,key,tail?,at}`）`lineAt?` | 两栏各 430 宽；中线先划下来 |
| `Bars` #9 | `lead` `leadAt` `bars[{text,at}]` | 荧光条用 `FitBox`，太长自动缩 |
| `VerticalWall` #35 | `chars[{c,at,tone?}]` `x?` `top?` `size?` | 默认 x=850、top=270；字多就缩，整列 ≤ y1250 |
| `DarkQuestion` #27 | `small` `big` `at` `bigAt?` | 四周暗角在 Zone 外，字在 Zone 里 |
| `Chapter` | `num` `title` `at` `chips[{text,at}]` `punch?` | 整块 `Zone dy=-110`，高度 ≤360 |
| `GiantFill` #25 | `char` `at` `fillAt` `size?` `top?` | `top` 默认 250（安全区上沿）；只放 1 个字 |
| `TypedQuote` #38 | `at` `lines[{toks,size?,tone?,pre?,post?}]` `window?` | `toks` = `[字, 秒][]`；圆窗 400px、窗顶 270；整句按宽度预先算字号，打字中字号不跳 |
| `SignatureCard` | `at` `name` `slogan[3]` `tag?` `y?` | 整块 ≤ y1240；`y` 默认 980 |
| `BehindPerson` #3 | `chars[{c,at,x,y?,tone?}]` `at` `matteSrc?` | 字夹进安全区；需要逐帧抠像，没有就退回字在人前 |

## 换场（`scenes.tsx`）
| 组件 | 参数 | 说明 |
|---|---|---|
| `SplitScene` | `a` `b` `src` `cardH?` `children(t)` | 上卡（y250–650）+ 下人像窗（y690–1230）；背景压暗 |
| `RetentionCard` | `t` `title` | 观众留存曲线，画出来后标「划走」 |
| `CompareCard` | `t` `leftLabel` `rightLabel` `leftAt` `rightAt` | 左边乱堆彩色条（✗），右边对齐（✓） |
| `PhoneSwipe` | `a` `b` `src` `swipeAt` `lines[{text,at,big?}]` | 手机 480×840 在左，三行字在右（≤360 宽）；`swipeAt` 往上划走 |
| `Reporter` | `a` `b` `matteRange` `cardH?` `standIn?` `children(t)` | 上卡 + 抠像站前面；`matteRange` = 抠像有的帧范围；`standIn` 预览用占位人形 |
| `PipBroll` | `a` `b` `src` `pos?`(tr/tl/bc) `label?` `broll?` | 素材全屏 + 270px 白边圆窗；窗位置都在安全区内 |
| `SplitBroll` | `a` `b` `src` `label?` `broll?` | 上 1040px 是你、下面素材条；标签牌在条上 |
| `BrollBottom` | `a` `b` `label?` `broll?` | 素材条从 y1060 往上滑；字幕要让开 |
| `PosterHero` | `a` `b` `word` `tone?`(accent/pain) `sub?` `broll?` | 压暗 40%；大字按宽度自动缩（≤4 字最好）并慢慢长大 |
| `LabelTag` | `at` `until` `text` `x?` `y` | 黄色标签牌，走 FitBox |
| `BrollPlaceholder` | `hue?` `word?` | 预览用占位素材；真用时换成 `<OffthreadVideo>`/`<Img>` |
| `LabelHero` | `label` `hero` `at` `heroAt?` `tag?` `tagAt?` `labelTone?` `heroSize?` | 小标压在大字左上角；`tag` = 白底红字小标 |
| `SpreadHero` | `top` `bottom` `at` `bottomAt?` `topTone?` `bottomTone?` `spanW?` | 字距拉开到横跨 `spanW`（默认 860）；字距加在每个字后，总宽 = n·size + n·ls |
| `GhostWord` | `ghost` `line` `at` `lineAt?` `tone?`(pain/white/accent2) `ghostSize?` | 巨字半透明，放胸口带；`ghost` ≤3 个字 |
| `QuoteCard` | `items[{tag?,lines[[{t,hl?}]],at}]` `source?` `sourceAt?` | 全屏压暗 + `backdropFilter: blur(16px)`；每行走 `FitBox`；出处右对齐 |
| `ChapterTag` | `num` `title` `at` `color?` | 黄色块 + 箭头 + 虚线框标题；在胸口带 |
| `MotionText` | `text` `preset` `at` `until` `y` `size` `tone?` `font?` `align?` `x?` `ls?` | 18 个入场动画预设；内部走 `FitBox`；逐字类每字一个 span |
| `EmotionWord` | `text` `kind`(cry/surprise/joy/shout) `at` `until` `y?` `size?` `spanW?` | 情绪字；2–3 个字字距自动拉开横跨 `spanW`（默认 800）；走 `Zone` + `FitBox`；`cry` 的红色从下往上灌满，`joy` 带放射光芒，`surprise` / `shout` 逐字摆动 |
| `GlassWord` | `text` `size` `at` `until` `y` `x?` `grad?`(gold/pearl/rose/aqua 或 CSS 渐层) `italic?` `baseAlpha?` `lightAlpha?` `font?` `maxW?` | 玻璃字；**不能放进 Zone / FitBox**（强光混合会失效）；自己按宽度缩字号；容器没有 opacity/transform/filter |
| `Headroom` | `src` `startFrom?` `dy` `children` | 给字腾头顶空间：整个镜头容器下移 `dy`，顶部用视频顶部的镜像补上；children 用容器坐标（屏幕 y = 容器 y + dy）；只适合视频顶部没有人的素材 |
| `TextBehind` | `matteSrc(frame)` `children` | 字在人后：children（字）+ 抠像 PNG 叠在一起；没有抠像的帧不画字；放进和视频同一个镜头容器 |
| `FaceCard` | `src` `w` `h` `zoom` `faceY?` | 同一条口播视频裁出脸（假设脸在原始构图 x550 y640，换素材要改 `FACE`） |

## 换素材要改什么
- `scenes.tsx` 的 `FACE = {x, y}`：脸在原始视频里的中心。
- `kit.tsx` 的 `FONT_BASE`：字体放哪（独立 repo 里改成 `''`，字体放 `public/fonts/`）。
- 字体（均可商用）：思源宋体 Heavy（OFL）、得意黑 Smiley Sans（OFL）、抖音美好体（免费商用）。**字体文件仓库不附带，请自行下载。**
