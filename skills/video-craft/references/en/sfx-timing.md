# SFX timing and level

Answers: **on which frame an SFX should sit relative to the text, how loud it should be, and which animation pairs with which sound.** The kinds and semantic pairing are in `sfx-pairing.md`; this file has the **timing, level and pairing statistics**.

## Source and reliability (read first)
- Source: plain-text backups of the 66 industry clips: start of the text segment vs start of the SFX segment; the `volume` field of SFX segments; each text's entrance-animation name.
- ⚠ A "pair" = the **nearest** SFX within ±0.5 s of each text segment (1356 pairs). SFX further away are not counted. A pair means **close in position**, not necessarily that the author meant "this SFX belongs to this text".
- ⚠ The pairing table only counts "the 5 most common SFX per animation"; it is not a full co-occurrence matrix.

## 1. Timing: on the text's first frame
Of 1356 "text → nearest SFX" pairs: **1199 (88%) have the SFX start on the same frame as the text start**, 1226 (90%) are within ±0.1 s; the rest are scattered (mostly SFX that actually belong to something else).
→ Rule: **the SFX starts on the first frame the text appears — no earlier, no later.** About 1/3 of text blocks stay silent (see SKILL.md §6).

## 2. Level: no single level
Of 1098 SFX segments: 534 have no volume change (= 1.0); 564 set a volume explicitly — **339 lowered** (median 0.43×, about −7 dB), **196 raised** (median 2.0×, about +6 dB, p10–p90 1.58–3.52×), 29 exactly 1.
→ Reading: the author **adjusted volumes one by one**, raising heavy hits and lowering background layers. ⚠ Volume was **not** matched to SFX type, so we cannot say "which kind of SFX is raised". This library aligns by **peak**: heavy hits −13 to −17 dBFS, dings / prompts −17 to −20, transitions −21 to −26, typing −24.

## 3. Entrance animation → SFX pairing (29 animations, ≥10 pairs)
| Entrance animation | Pairs | Most common SFX (count) | Library id |
|---|---|---|---|
| 缩小 | 41 | 诡异的滴水声 ×17; 综艺咚 ×8; 哐，撞击轻响 ×7 | `eerie` — `clang` |
| 打字光标 | 39 | 打字声 ×28; 打字（字幕专用） ×8; 卡式录音机磁带倒带或者快进 ×1 | `typing` `type` — |
| 滚入 | 33 | 叮，收银机提示音1 ×12; 超市电子钱柜 结账 ×8; 发条转动 ×6 | — `cash` `clock` |
| 放大 | 29 | 鼠标单击 ×15; 啵，气泡音2 ×6; off ×5 | `click` `pop` — |
| 模糊发光 | 28 | 一滴水滴声 ×23; 翻页 ×2; 打字声 ×2 | — — `typing` |
| 渐显 | 27 | “呼”2 ×8; 纸张抖动声 ×6; 打字声 ×5 | — `paper` `typing` |
| 雪光模糊 | 27 | 撞击光1 ×9; 综艺开头-咚（空旷） ×7; 一声响铃 ×5 | — `openboom` — |
| 冰雪飘动 | 27 | 高音闪光 (3) ×9; 魔法音效 ×8; 仙尘音效 ×5 | — `magic` `fairy` |
| 随机上升 | 23 | 纸张抖动声 ×18; 大明王朝悬疑 ×2; 键盘空格声 ×1 | `paper` — — |
| 跃进 | 22 | 综艺紧张噔噔 ×15; 啵1 ×2; 嘟咚，提示音1 ×2 | `tense` — `dudong` |
| 轻微放大 | 21 | 叮，提示音4 ×13; 叮3 ×4; 综艺影视紧张回响 ×2 | — `ding3` — |
| 向左模糊 | 21 | “呼”2 ×17; 回忆-刷一下 ×1; 旋风 ×1 | — `shua` — |
| 向上滑动 | 21 | 综艺悬疑 不对劲 ×13; “呼”2 ×4; 旋风 ×2 | `sus` — — |
| 开幕 | 20 | 纸张抖动声 ×12; 诡异的滴水声 ×2; 报纸报纸: 折叠或展开 ×2 | `paper` `eerie` — |
| 发光模糊 | 18 | 一声响铃 ×7; 诡异的滴水声 ×4; 综艺咚 ×3 | — `eerie` — |
| 新年打字机 | 17 | 打字声 ×8; 打字（字幕专用） ×6; 键盘打字长音效2 ×2 | `typing` `type` — |
| 晕开 | 16 | 一滴水滴声 ×6; 气泡弹出 ×4; “呼”2 ×3 | — `bubble` — |
| 折叠 | 16 | 枪拉栓 ×9; 纸张抖动声 ×4; 报纸报纸: 折叠或展开 ×1 | — `paper` — |
| 收拢 | 16 | 诡异的滴水声 ×5; 综艺影视紧张回响 ×4; 哐，撞击轻响 ×3 | `eerie` — `clang` |
| 逐字显影 | 15 | 综艺悬疑 沙锤长 ×5; “呼”2 ×4; 纸张抖动声 ×2 | — — `paper` |
| 激光雕刻 | 14 | 突然出现音效 ×4; 扫光音效4 ×4; 扫光 ×3 | — `scan` — |
| 向右露出 | 14 | 回忆-刷一下 ×5; “呼”2 ×5; “呼”的转场音效 ×2 | `shua` — — |
| 向右模糊 II | 14 | “呼”2 ×4; 旋风 ×4; 综艺悬疑 沙锤长 ×3 | — — — |
| 向右缓入 | 12 | 回忆-刷一下 ×6; 拔刀 游戏音效 宝剑出鞘 ×3; 交通 车辆引擎 汽车发动 ×1 | `shua` `sword` — |
| 呐喊声波 | 11 | 撞击光1 ×3; 综艺嘭字幕音效震撼出场 ×2; 嘭！盖章音效素材 ×2 | — `peng` `stamp` |
| 吸入 | 11 | 综艺拉扯 ×4; 气泡弹出 ×4; 刀子捅人 ×1 | — `bubble` — |
| 圆柱体滚动 | 11 | 发条旋钮转动齿轮 ×4; 发条转动 ×4; 叮，收银机提示音1 ×1 | — `clock` — |
| 波浪弹入 | 11 | 综艺清脆敲声 ×7; 综艺紧张咚咚声 ×1; 嗖，咻 ×1 | — — — |
| 向下露出 | 10 | 滴，提示音 ×2; 旋风 ×2; 叮咚，提示音1 ×2 | `tishi` — `dingdong` |
"Library id" = the semantic id in `sfx-pairing.md`; `—` = this library does not include that sound.
