# Industry style presets

Answers: **for talking-head videos in different industries, how are fonts, accent colours, entrances, SFX and pacing usually combined?** Pick one "family" and keep to it for the whole video.

## Source and reliability (read first)
- Source: the **66 industry clips** (64 after removing duplicate copies) in the JianYing talking-head pack's "70 talking-head projects"; median length about 23 s. Read from each project's plain-text backup `template.json.bak` (fonts, colours, entrance animations, SFX names).
- ⚠ **The "families" were grouped by "primary font + accent colour" when writing this up — they are not the pack's own categories.** The grouping is heuristic and clips on the border may be misplaced (the same industry can appear in two families because it has several clips).
- ⚠ This is statistics of "how people usually combine things", **not a conclusion about which combination works better**; no effect comparison was done.
- Most of the pack's fonts cannot be redistributed; the fonts this library bundles are only Source Han Serif Heavy, Smiley Sans (得意黑) and Douyin Meihao (抖音美好体).

## 1. The four families
| Family | Clips | Typical fonts (clips where it is a top-2 font) | Accent colors | Top entrances | Top SFX | Median text blocks/min | Median SFX/min | Best for |
|---|---|---|---|---|---|---|---|---|
| **A · Business gold & red** | 33 | 得意黑 (28)、俊雅体 (14)、思源粗宋 (5)、特黑体 (5) | `#ffbf17` ×16 · `#b71c1c` ×15 · `#fff589` ×12 · `#f9f3c4` ×3 | 渐显 ×11, 发光模糊 ×8, 放大 ×7, 缩小 ×6 | “呼”2 ×10, 综艺悬疑 不对劲 ×6, 撞击光1 ×5 | 65 | 34 | Law, finance, loans, property, education, business, cars, study-abroad, career — content that needs to feel credible and crisp |
| **B · Classical cream** | 11 | 古典体 (6)、研宋体 (2)、思源宋体-Bold.otf (2)、抖音美好体 (2) | `#fff589` ×9 · `#b71c1c` ×6 · `#ffbf17` ×3 · `#990000` ×1 | 渐显 ×6, 轻微放大 ×4, 开幕 ×3, 逐字显影 ×3 | 纸张抖动声 ×6, “呼”2 ×4, 打字声 ×2 | 69 | 44 | Wellness, women's emotion / growth, psychology, relationships, yoga, custom homes — content that should feel gentle and refined |
| **C · Knowledge yellow** | 15 | 抖音美好体 (10)、思源宋体-Bold.otf (7)、思源粗宋 (5)、俊雅体 (5) | `#fff589` ×7 · `#b71c1c` ×7 · `#ffbf17` ×4 · `#ffde00` ×3 | 缩小 ×6, 渐显 ×5, 开幕 ×4, 雪光模糊 ×3 | “呼”2 ×6, 回忆-刷一下 ×5, 纸张抖动声 ×4 | 78 | 54 | Paid knowledge, career, founder IP, business coaches, used cars, property agents, reading, tax — bright, practical content |
| **D · Other / one-offs** | 5 | 思源宋体-Bold.otf (1)、新青年体 (1)、未来黑 (1)、方正超粗黑繁体.ttf (1) | `#b71c1c` ×3 · `#ffde00` ×2 · `#ffbf17` ×2 · `#bcff00` ×1 | 缩小 ×2, 滚入 ×2, 跃进 ×2, 向右集合 ×1 | 综艺紧张噔噔 ×2, 综艺 悬疑 轻敲 ×2, 回忆-刷一下 ×1 | 82 | 43 | Individual styles (New Youth / Future Black / extra-bold black / lime): one each for cars, healing, paid knowledge |

**Theme presets in this library** (`kit.tsx`, built with `makeTheme`): A → `THEME_BIZ_GOLD_RED` (Smiley Sans + Source Han Serif Heavy, gold `#ffbf17` + deep red `#b71c1c`) · B → `THEME_GUOFENG_CREAM` (the Classical font is not bundled, falls back to Source Han Serif Heavy; cream `#fff589` + deep red) · C → `THEME_KNOWLEDGE_YELLOW` (Source Han Serif Heavy + Douyin Meihao; bright yellow `#fff589` + deep red). No preset for D.

## 2. How to choose
1. **One family per video** (don't mix fonts + accent colours + animation style).
2. The accent-colour roles are the same in every family: **yellow / gold = benefit, key point; red = pain point, turn**.
3. For "crisp and credible" (A): Smiley Sans as the main font, mostly `fade` / `grow` / `shrink` / `glow-blur`, SFX leaning to whoosh and impact.
4. For "gentle and refined" (B): serif fonts, mostly `fade` / `grow-soft` / `curtain` / `develop`, SFX leaning to paper and whoosh.
5. For "bright and practical" (C): Douyin Meihao as the supporting font, mostly `shrink` / `fade` / `curtain` / `blur-left`, SFX leaning to swish, paper and typing.
6. Pacing reference: A about 65 blocks/min + 34 SFX/min; B about 69 + 44; C about 78 + 54 (all are medians for 15–60 s shorts — don't copy them to long videos).

## Appendix: fingerprints of 65 clips
| Clip | Duration (s) | Blocks/min | SFX/min | Fonts (top 2) | Accent colors (top 2) | Top entrances |
|---|---|---|---|---|---|---|
| 1-知识付费 | 29.5 | 83 | 43 | 思源宋体-Bold.otf | `#bcff00` `#b71c1c` | 向右集合、开幕 |
| 10-女性情感 | 9.8 | 129 | 92 | 研宋体、古典体 | `#990000` `#b71c1c` | 随机上升、渐显 |
| 11-汽车行业 | 17.4 | 86 | 76 | 新青年体、未来黑 | `#ffde00` `#b71c1c` | 缩小、滚入 |
| 12-美业 | 19.5 | 77 | 43 | 思源粗宋 | `#fff589` `#b71c1c` | 缩小、开幕 |
| 13-心理 | 20.7 | 67 | 14 | 思源宋体-Bold.otf | `#fff589` | 渐显、开幕 |
| 14-读书 | 41.8 | 49 | 19 | 俊雅体、思源宋体-Bold.otf | `#fff589` | 渐显、随机上升 |
| 15-女性成长 | 20.1 | 78 | 36 | 古典体 | `#b71c1c` `#fff589` | 开幕、逐字显影 |
| 16-疗愈 | 58.5 | 72 | 31 | 方正超粗黑繁体.ttf、HYXinRenWenSong65F.ttf | `#ffde00` | 缩小、跃进 |
| 17-二手车 | 16.0 | 90 | 60 | 思源粗宋、抖音美好体 | `#fff589` `#ffde00` | 渐显、随机上升 |
| 18-情感 | 33.9 | 58 | 34 | 抖音美好体、思源粗宋 | `#fff589` `#b71c1c` | 开幕、缩小 |
| 19-房产中介 | 13.0 | 83 | 69 | 抖音美好体、招牌体 | `#ffde00` | 开幕、轻微放大 |
| 2-女性成长 | 21.7 | 58 | 39 | 古典体、arial.ttf | `#fff589` | 逐字显影、轻微放大 |
| 20-家庭教育 | 20.1 | 69 | 42 | 俊雅体、思源宋体-Bold.otf | `#b71c1c` `#8a8a8a` | 雪光模糊、向左模糊 |
| 21-贷款 | 26.6 | 90 | 41 | 得意黑、思源粗宋 | `#ffbf17` `#fff589` | 新年打字机、晕开 |
| 22-留学 | 24.7 | 97 | 5 | 得意黑、俊雅体 | `#ffbf17` `#047bff` | 晕开、轻微放大 |
| 23-财税 | 23.4 | 59 | 54 | 思源宋体-Bold.otf、俊雅体 | `#ffbf17` | 心动瞬间、放大 |
| 24-美业 | 15.6 | 92 | 54 | 思源粗宋、俊雅体 | `#fff589` | 缩小、日出 |
| 25-法律 | 42.5 | 65 | 27 | 得意黑、思源粗宋 | `#ff1837` `#ffbf17` | 渐显、向左模糊 |
| 26-养生 | 24.8 | 58 | 39 | 俊雅体、抖音美好体 | `#ffbf17` `#b71c1c` | 雪光模糊、渐显 |
| 27-瑜伽健身 | 17.8 | 71 | 44 | 思源宋体-Bold.otf、俊雅体 | `#fff589` `#b71c1c` | 晕开、轻微放大 |
| 28-家居 | 21.5 | 61 | 42 | 得意黑、思源粗宋 | `#ffbf17` `#f9f3c4` | 渐显、生长 |
| 29-升学规划 | 23.5 | 97 | 36 | 得意黑、俊雅体 | `#b71c1c` `#3982f6` | 开幕、缩小 |
| 3-职场规划 | 60.1 | 58 | 35 | 抖音美好体、思源宋体-Bold.otf | `#fff589` `#b71c1c` | 晕开、渐显 |
| 30-商业认知 | 18.4 | 78 | 43 | 俊雅体、得意黑 | `#ffbf17` `#b71c1c` | 模糊、向上滑动 |
| 31-知识付费 | 26.3 | 64 | 41 | 后现代体、汉仪天宇风行体W.ttf | `#ffa800` `#ffbf17` | 雪光模糊、跃进 |
| 32-职场规划 | 21.0 | 83 | 40 | 得意黑、思源粗宋 | `#b71c1c` `#ffbf17` | 向右缓入、打字光标 |
| 33-全屋定制 | 28.1 | 62 | 45 | 抖音美好体、研宋体 | `#ffbf17` `#b71c1c` | 流光扩散、轻微放大 |
| 34-家庭教育 | 24.4 | 79 | 34 | 得意黑、俊雅体 | `#ffbf17` `#b71c1c` | 向下滑动、跃进 |
| 35-房产经纪 | 38.2 | 74 | 35 | 得意黑、俊雅体 | `#b71c1c` `#ffbf17` | 向上露出、向右模糊 II |
| 36-商业认知 | 29.3 | 68 | 27 | 得意黑、尔雅新大黑 | `#b71c1c` `#ffbf17` | 折叠、向下露出 |
| 37-银行贷款 | 30.2 | 62 | 38 | 得意黑、俊雅体 | `#ffbf17` `#ff0000` | 滚入、向左模糊 |
| 38-家庭教育 | 22.0 | 82 | 44 | 得意黑、俊雅体 | `#b71c1c` `#fff589` | 开幕、渐显 |
| 39-知识付费 | 26.4 | 70 | 34 | 得意黑、研宋体 | `#b71c1c` `#fff589` | 向下露出、渐显 |
| 4-中医养生 | 30.7 | 82 | 53 | 金陵体、古典体 | `#fff589` `#ffbf17` | 水墨晕开、冰雪飘动 |
| 40-养生 | 16.9 | 67 | 53 | 古典体 | `#fff589` `#b71c1c` | 放大、日出 |
| 41-创业分享 | 29.8 | 58 | 4 | 得意黑、俊雅体 | `#fff589` `#ff0000` | 向右露出、发光模糊 |
| 42-社会评论 | 23.5 | 79 | 33 | 俊雅体、得意黑 | `#fff589` `#ff0000` | 折叠、缩小 |
| 43-财经金融 | 23.9 | 60 | 35 | 得意黑、尔雅新大黑 | `#b71c1c` `#fff589` | 渐显、呐喊声波 |
| 44-汽车行业 | 26.4 | 66 | 52 | 得意黑、俊雅体 | `#fff589` `#fe8a80` | 折叠、轻微放大 |
| 45-知识付费 | 126.9 | 70 | 27 | 特黑体、金陵体 | `#fff589` `#b71c1c` | 冰雪飘动、逐字显影 |
| 46-家居美学 | 23.4 | 82 | 41 | 得意黑、金陵体 | `#fff589` | 渐显、冰雪飘动 |
| 47-律师 | 38.2 | 64 | 24 | 得意黑、俊雅体 | `#ffbf17` `#b71c1c` | 发光模糊、向下滑动 |
| 48-金融 | 28.3 | 66 | 40 | 金陵体、得意黑 | `#fff589` `#ff619d` | 放大、轻微放大 |
| 49-财经 | 22.5 | 53 | 32 | 得意黑、三极黑宋体中粗 | `#fe5252` `#000000` | 呐喊声波、向上露出 |
| 5-职场 | 21.6 | 78 | 58 | 抖音美好体、古典体 | `#fff589` `#b71c1c` | 渐显、模糊发光 |
| 50-法律 | 23.0 | 60 | 52 | 星汉宋、得意黑 | `#ffbf17` `#fe5252` | 向右模糊 II、波浪弹入 |
| 51-职场 | 20.5 | 59 | 32 | 特黑体、思源粗宋 | `#edc65d` `#f9f3c4` | 晕开、向下露出 |
| 52-家庭教育 | 21.1 | 63 | 43 | 得意黑、俊雅体 | `#b71c1c` `#e9d7a4` | 雪光模糊、晕开 |
| 53-金融 | 24.0 | 65 | 42 | 特黑体、方正超粗黑简体.TTF | `#ffbf17` `#ff1837` | 放大、滚入 |
| 54-家庭教育 | 17.3 | 62 | 38 | 俊雅体、得意黑 | `#b71c1c` `#f9f3c4` | 放大、模糊缩小 |
| 55-女性成长 | 19.9 | 78 | 42 | 抖音美好体、思源粗宋 | `#ffaac1` `#ffbf17` | 放大、向上滑动 |
| 56-律师 | 21.8 | 60 | 30 | 特黑体、抖音美好体 | `#ffbf17` | 缩小、向右模糊 II |
| 57-留学 | 22.5 | 75 | 29 | 得意黑、俊雅体 | `#fe5252` `#fff589` | 放大、生长 II |
| 58-汽车销售 | 36.4 | 59 | 33 | 惊鸿体、得意黑 | `#ffbf17` `#ffde00` | 放大、缩小 |
| 59-女性成长 | 23.4 | 69 | 26 | 细体、庞门正道粗书体 | `#fff589` `#ffbf17` | 渐显、向右模糊 II |
| 6-法律行业 | 13.7 | 92 | 66 | 抖音美好体、思源宋体-Bold.otf | `#b71c1c` `#fff589` | 吸入、向左模糊 |
| 60-职场规划 | 18.9 | 82 | 51 | 知新体、DINNextW1G-Black.otf | `#b71c1c` `#ffbf17` | 放大、滚入 |
| 61-升学规划 | 20.9 | 55 | 32 | 知新体、得意黑 | `#ffbf17` | 渐显、放大 |
| 62-育儿 | 31.0 | 54 | 31 | 得意黑、知新体 | `#edc65d` `#b71c1c` | 生长 II、渐显 |
| 63-情感 | 34.1 | 55 | 21 | 细体、知新体 | `#e9d7a4` `#fff589` | 渐显、放大 |
| 64-商业认知 | 28.3 | 57 | 30 | 特黑体、抖音美好体 | `#b71c1c` `#fff589` | 渐显、滚入 |
| 7-金融知识 | 15.1 | 92 | 60 | 抖音美好体、未来黑 | `#ffde00` `#ffdf00` | 向下滑动、打字光标 |
| 8-创业IP | 30.6 | 96 | 71 | 思源宋体-Bold.otf、抖音美好体 | `#000000` `#ffbf17` | 渐显、模糊发光 |
| 9-商业导师 | 10.8 | 156 | 89 | 思源宋体-Bold.otf、抖音美好体 | `#ffdc8b` `#b71c1c` | 向右缓入、缩小 |
