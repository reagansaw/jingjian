# Sound-effect semantics table (57 ids)

**The repo does not bundle sound-effect files** (sources: JianYing/CapCut (剪映) library / paid asset packs, cannot be republished). Supply your own **commercially usable** sound effects, name them `lg-<id>.mp3`, and register them in the SPEC table of `tools/build_sfx_lib.py`.
The code only recognizes ids, so swapping files needs no code change. `Original name (zh)` is the JianYing sound-effect name used at the time, to help you find replacements.

Suggested peaks: heavy hits −13 ~ −17 dBFS · ding/prompt −17 ~ −20 · transitions −21 ~ −26 · typing −24.

The duration column = length after trimming (seconds).

## Transitions

| id | Original name (zh) | Duration | Used for |
|---|---|---|---|
| `sou` | 综艺嗖咻刷 | 0.43 | Card/picture entrance |
| `sou2` | 嗖，咻，唰 | 0.43 | Card entrance (lighter) |
| `hu` | 转场音  呼~ | 1.5 | Change of topic, first line of small text |
| `shua` | 回忆-刷一下 | 0.8 | Swipe away, turning the page |
| `wind` | 风效转场 | 1.6 | Long transition |
| `zoom` | 嗖一声转场 | 1.4 | Split-screen entrance |
| `flash` | 闪的一声 | 0.75 | Flash cut |
| `page` | 页面切换 | 1 | Page-turn style cut |
| `whoosh` | whoosh-呼 | 0.68 | Lightest transition, laid under a hard cut |

## Heavy hit / emphasis

| id | Original name (zh) | Duration | Used for |
|---|---|---|---|
| `peng` | 综艺嘭字幕音效震撼出场 | 1.13 | Key word slams in (dramatic entrance) |
| `stamp` | 嘭！盖章音效素材 | 0.43 | "Stamp"-style confirmation, switching to a new wording |
| `dong` | 咚 | 1.1 | General heavy hit |
| `dong2` | 综艺 咚 | 0.37 | Short heavy hit, the B in A→B |
| `fist` | 砰，拳击声 | 0.37 | First character of a vertical stack |
| `clang` | 哐，撞击轻响 | 1.4 | Impact feel, third character of a vertical stack |
| `heavy` | 重音转场 砰 | 1.13 | The final hit |
| `dd2` | 综艺咚咚两声鼓点转场音效 | 0.7 | Two-beat drum transition |
| `tense` | 综艺紧张噔噔 | 0.7 | Tension, before a reversal |
| `filmdong` | 影视 咚 | 2.2 | Cinematic ending (last sentence) |
| `openboom` | 综艺开头-咚（空旷） | 2.4 | Opening / big finale |

## Key point / prompt / money

| id | Original name (zh) | Duration | Used for |
|---|---|---|---|
| `ding` | 叮 | 0.8 | A key point appears |
| `ding3` | 叮3 | 0.87 | A very light ding |
| `dingdong` | 叮咚，提示音1 | 0.97 | Prompt |
| `tishi` | 滴，提示音 | 1.0 | Step prompt |
| `cash` | 超市电子钱柜 结账 | 2 | Talking about money / closing a deal / highlighter bars |
| `gold` | 金币到账叮咚声 | 1.67 | Coins arriving (second key point) |
| `correct` | 正确 | 1.6 | ✓ checkmark, got it right |
| `dudong` | 嘟咚，提示音1 | 0.67 | Light prompt |
| `bowl` | 敲击碗 叮的一声 | 1.4 | Crisp "correct" |
| `bubble` | 气泡弹出 | 0.5 | Small text pops up |
| `pop` | 啵，气泡音2 | 0.4 | Phone / small element pops up |
| `click` | 鼠标单击 | 0.35 | Click / finger |
| `gameclick` | 游戏点击 音效 | 1 | Game-style click |

## Typing

| id | Original name (zh) | Duration | Used for |
|---|---|---|---|
| `type` | 打字（字幕专用） | 1.4 | Caption typing |
| `typing` | 打字声 | 2 | Keyboard typing |

## Reaction / emotion

| id | Original name (zh) | Duration | Used for |
|---|---|---|---|
| `huh` | 疑惑 | 1.17 | Puzzlement, rhetorical question |
| `sigh` | 无奈 | 2.0 | Disappointment, swipe away |
| `startle` | 猛然一惊 | 1.6 | A startle |
| `wow` | 女声哇哦 | 1.6 | Pleasant surprise |
| `duck` | 挤压玩具鸭 | 0.7 | Goofy (use sparingly) |
| `appear` | 忽然出现 卡通音效 | 1.07 | An element suddenly appears |
| `spring` | 卡通弹簧拉伸 | 1.3 | Elastic scale-up |
| `blink` | 眨眼 | 0.7 | Blink |

## Tech

| id | Original name (zh) | Duration | Used for |
|---|---|---|---|
| `techshow` | 高科技 显示出来 | 2 | Data/curve display |
| `scan` | 扫光音效4 | 1.5 | Light sweep |
| `glitch` | 故障音效 | 1 | Glitch (use sparingly) |

## Suspense

| id | Original name (zh) | Duration | Used for |
|---|---|---|---|
| `sus` | 综艺悬疑 不对劲 | 2.2 | Something's off, before a reversal |
| `drip` | 空灵的水滴声 | 1.6 | Ethereal, suspense |
| `eerie` | 诡异的滴水声 | 2.2 | Eerie, lowered-voice question |
| `suspense` | 悬疑声 | 2 | Suspense build-up |

## Magic / other

| id | Original name (zh) | Duration | Used for |
|---|---|---|---|
| `magic` | 魔法音效 | 1.6 | Reveal, magic |
| `fairy` | 仙尘音效 | 1.8 | Soft reveal |
| `chime` | 风铃 魔法转场 | 1.5 | Magic transition |
| `sword` | 拔刀 游戏音效 宝剑出鞘 | 1.4 | Striking through (a sword-draw slash) |
| `paper` | 纸张抖动声 | 1.2 | Knowledge / flipping paper |
| `clock` | 发条转动 | 0.97 | Clockwork / rhythm |
| `tick` | 秒钟嘀嗒 | 1.2 | Countdown / time |
