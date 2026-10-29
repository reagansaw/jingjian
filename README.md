# video-craft

**中文** · [English below](#english)

口播剪出网感：给 Claude Code 用的**口播剪辑 skill** + **版式库** + **字幕样式预设**（中 / 英双语）。当前版本 **v0.2.0**。

## 里面有什么
- 🎬 **版式库**（打开 `docs/library.html`，右上角可切 EN）：100 张卡 — 文字版式、换场、抖音精剪、文字动画、行业主题、情绪字、抠像 / 玻璃字、骨架，以及 44 个「特效」（冲镜 / 震动 / 故障 / 无限画中画 / 手绘圈标 / 形状放大 / 玻璃图表 / 对比数字牌 / 时间轴 / 色板 / 打勾清单 / 杂志封面 / 环绕文字…）。每张卡点开有**可直接粘进 `edit.json` 的代码**和**一句可以复制给 AI 的话**。预览里站的是占位人形，不是真人。
- 🔤 **字幕样式预设 657 款**（`docs/caption-presets.html`）：颜色 / 渐变 / 描边 / 阴影 / 入场·出场·循环动画，可按分类和段数筛选，也可筛「真实口播工程里用过」的。怎么选见 `references/caption-guide.md`，**别让 AI 去读整份规格文件**，用 `tools/pick_caption.py`。
- 🧠 **SKILL.md**（English: `SKILL.en.md`）：节奏数字、安全区、版式选用、字怎么搭配 / 怎么动、音效配对、**字遮脸时怎么办（先量脸再放）**、出片检查清单。
- 🙂 **不遮脸检查**：`tools/face_track.py` 量人脸 → `tools/place_check.py` 检查每个特效有没有压到头 / 超出安全区，并给出建议位置；`edit.json` 还支持 `reframe`（特效出现时收紧构图）和 `behind`（字在人后）。
- 🔊 **声音流水线** `tools/audio/`：降噪 / 去 BGM / 转写 / 强制对齐精剪 / 字幕 / 母带 / 质检 + 34 个原创合成音效；`references/audio-pipeline.md` 讲「为什么你剪的片普通」。
- 🧱 **起步项目** `remotion/`：可运行的 Remotion 工程（`edit.json` 驱动，`npm run check` / `npm run final`）+ `craft/` 全部组件。

## 安装（Claude Code）
**前提：** Claude Code、Node 18+、ffmpeg、Python 3.10+。声音流水线另需 [uv](https://docs.astral.sh/uv/)，然后 `bash tools/audio/setup.sh`（装降噪 / 对齐 / 去 BGM / 转写，约 3GB）。
```
/plugin marketplace add reagansaw/jingjian
/plugin install video-craft@video-craft
```
装好后**新开一个会话**，说：「用 video-craft 剪这条口播」，并给它视频路径。
**更新：** `/plugin marketplace update video-craft`，再 `/plugin update video-craft`，再新开会话。第三方来源默认**不会**自动更新，也没有新版本通知，要手动更新。
**手动安装：** 把 `skills/video-craft/` 整个文件夹放进 `~/.claude/skills/video-craft/`（里面要有 `SKILL.md`）。
> 起步项目 `remotion/` 要先**复制到你自己的工作文件夹**再用（plugin 缓存会在更新时被清掉），读 `remotion/README.md`。

## 哪些系统能用什么
| 功能 | macOS | Windows / Linux |
|---|---|---|
| 版式库 / 字幕预设 / 起步项目 / `check` / `place_check` | ✔（作者验证） | 理论上能，**没试过** |
| 声音流水线 | ✔（Apple Silicon，作者验证） | **没试过**；转写在非 Apple 芯片走 faster-whisper（未验证） |
| 量脸 `face_track.py`、抠像 `mk_subject_matte.py` / 字在人后 | ✔（用系统自带 Vision） | ✘（需要自己换方案） |

## 诚实的限制（v0.2.0）
- **动画手感**：5 个文字动画和一批剪映文字动画是逐帧量过的；**新加的特效和 657 款字幕预设的 84 种动画，是按名字归类后用通用曲线近似的**，方向对、细节不保证和参考一致。出片前自己看一遍动态。
- **没有真人 sample**：预览是占位人形。静帧我看过一部分，不是每款都看过动态。
- **没有学员从零装过**：安装在隔离环境里验证过（v0.1.0），v0.2.0 的干净机器 `setup.sh` 完整安装没验证。
- **音效 BGM 不附带**（只有 34 个原创合成音效）；**字体不附带**（思源宋体 Heavy / 得意黑 / 抖音美好体等，自行下载并核对授权）。字幕预设里的原字体没带，渲染时按类别退到本库字体，字形不同。
- 字幕预设来自第三方素材包，本库只取**样式数字**并用自己的代码重画：不含原文字、预览图、字体文件。
- **授权**：目前没有 LICENSE（默认保留所有权利）。别人能在 GitHub 上看 / fork，但没有复制、修改、再分发的授权。

## 目录
```
SKILL.md / SKILL.en.md          skill 本体（中 / 英）
references/ , references/en/    版式参数、字搭配、文字动画、特效、字幕预设与选用指南、音效、安全区、edit.json 说明（中 / 英）
remotion/                       起步项目 + craft/ 组件
docs/library.html               版式库（100 张）      docs/caption-presets.html  字幕样式图鉴（657 款）
tools/                          脚本：音频 / 字幕 / 量脸 / 检查 / 挑选 / 生成网页 / 打包
```
重新生成网页：`python3 tools/build_library.py`、`python3 tools/build_caption_gallery.py`。打包 plugin：`python3 tools/build_plugin.py`。

---

## English

**video-craft** — a talking-head editing **skill** for Claude Code, plus a **layout library** and **caption style presets** (Chinese / English). Current version **v0.2.0**.

## What is inside
- 🎬 **Layout library** (`docs/library.html`, toggle EN at the top right): 100 cards — text layouts, scene changes, Douyin-style cuts, text-motion presets, industry themes, emotion words, matte / glass type, skeletons, plus 44 "effects" (punch-in / shake / glitch / infinite picture-in-picture / hand-drawn circle / shape reveal / glass chart / before-after tiles / timeline / palette / tick list / magazine cover / orbiting text…). Each card opens with **code you can paste into `edit.json`** and **a line you can copy to the AI**. Previews use a placeholder figure, not a real person.
- 🔤 **657 caption style presets** (`docs/caption-presets.html`): colour / gradient / stroke / shadow / in-out-loop animation, filterable by category and segments, and by "used in real talking-head projects". How to choose: `references/en/caption-guide.md`; **do not make the AI read the whole spec file** — use `tools/pick_caption.py`.
- 🧠 **SKILL.en.md**: rhythm numbers, safe zone, layout selection, typography pairing / motion, SFX pairing, **what to do when text would cover the face (measure the face first)**, a pre-flight checklist.
- 🙂 **Face-clear check**: `tools/face_track.py` measures the face → `tools/place_check.py` checks every effect for covering the head / leaving the safe zone and proposes a position; `edit.json` also supports `reframe` (tighten the shot while an effect plays) and `behind` (text behind the person).
- 🔊 **Sound pipeline** `tools/audio/`: denoise / strip BGM / transcribe / force-aligned tightening / captions / mastering / QA + 34 original synthesised sound effects; `references/en/audio-pipeline.md` explains why your video looks ordinary.
- 🧱 **Starter project** `remotion/`: a runnable Remotion project (driven by `edit.json`, `npm run check` / `npm run final`) + all `craft/` components.

## Install (Claude Code)
**Prerequisites:** Claude Code, Node 18+, ffmpeg, Python 3.10+. The sound pipeline also needs [uv](https://docs.astral.sh/uv/), then `bash tools/audio/setup.sh` (denoise / alignment / BGM removal / transcription, about 3 GB).
```
/plugin marketplace add reagansaw/jingjian
/plugin install video-craft@video-craft
```
Then **open a new session** and say: "Use video-craft to edit this talking-head video", giving it the video path.
**Update:** `/plugin marketplace update video-craft`, then `/plugin update video-craft`, then a new session. Third-party marketplaces do **not** auto-update by default and there is no new-version notification — update by hand.
**Manual install:** put the whole `skills/video-craft/` folder at `~/.claude/skills/video-craft/` (it must contain `SKILL.md`).
> Copy the starter project `remotion/` to **your own working folder** before use (the plugin cache is wiped on update); read `remotion/README.md`.

## What works where
| Feature | macOS | Windows / Linux |
|---|---|---|
| Layout library / caption presets / starter project / `check` / `place_check` | ✔ (verified by the author) | should work, **not tried** |
| Sound pipeline | ✔ (Apple Silicon, verified by the author) | **not tried**; transcription falls back to faster-whisper on non-Apple chips (unverified) |
| Face tracking `face_track.py`, matting `mk_subject_matte.py` / text behind person | ✔ (uses the built-in Vision framework) | ✘ (bring your own solution) |

## Honest limits (v0.2.0)
- **Motion feel**: 5 text motions and a set of JianYing text animations were measured frame by frame; **the newly added effects and the 84 animations of the 657 caption presets are name-based approximations with generic curves** — right direction, details not guaranteed to match the reference. Watch the motion yourself before delivering.
- **No real-person sample**: previews use a placeholder figure. I looked at part of the stills; not every preset has been watched in motion.
- **No student has installed it from scratch**: install was verified in an isolated environment (v0.1.0); a full `setup.sh` install on a clean v0.2.0 machine was not verified.
- **No SFX/BGM bundled** (only 34 original synthesised effects); **no fonts bundled** (Source Han Serif Heavy / Smiley Sans / Douyin Meihao etc. — download and check licences yourself). The original fonts of the caption presets are not included, rendering falls back by class to this library's fonts, so glyph shapes differ.
- The caption presets come from third-party asset packs; this library takes only the **style numbers** and redraws them in its own code: no original text, preview images or font files.
- **Licence**: currently no LICENSE (all rights reserved by default). Others can view / fork on GitHub but have no grant to copy, modify or redistribute.

## Layout
```
SKILL.md / SKILL.en.md          the skill (zh / en)
references/ , references/en/    layout params, typography, text motion, effects, caption presets & guide, SFX, safe zone, edit.json reference (zh / en)
remotion/                       starter project + craft/ components
docs/library.html               the library (100 cards)      docs/caption-presets.html  caption style gallery (657)
tools/                          scripts: audio / captions / face / checks / picker / page builders / packager
```
Regenerate the pages: `python3 tools/build_library.py`, `python3 tools/build_caption_gallery.py`. Package the plugin: `python3 tools/build_plugin.py`.
