# video-craft

**中文** · [English below](#english)

口播剪出网感：给 Claude Code 用的**口播剪辑 skill** + **版式库**（中 / 英双语）。

- 🎬 **版式库**（打开 `docs/library.html`，右上角可切 EN）：56 个预览（17 个文字版式 / 4 个换场 / 4 个抖音精剪 / 18 个文字动画 / 3 个行业主题 / 4 个情绪字 / 3 个抠像·玻璃字 / 3 个骨架：常驻小标题·累加清单·结尾行动）+ 音效配对表，悬停预览，点开看什么时候用、别用在哪、配什么音效、代码。
- 🧠 **SKILL.md**（English: `SKILL.en.md`）：节奏数字、安全区规则、版式选用、**字怎么搭配**、**字怎么动**、音效配对、抖音精剪配方、出片检查清单。
- 🧱 **remotion/**：可运行的起步项目 + `craft/` 版式组件（`kit` / `layouts` / `scenes` / `gallery` / `skeleton`…）。

### 安装（Claude Code）
**方式一：plugin（推荐，发布到 GitHub 之后）**
```
/plugin marketplace add <owner>/jingjian
/plugin install video-craft@video-craft
```
装好后新开一个会话，说：「用 video-craft 剪这条口播」。更新：`/plugin update video-craft`（第三方 marketplace 默认**不会**自动更新；有新版本时没有推送通知，要手动更新）。
> 本地验证过：`plugin validate` 通过（只剩「没写作者」一条警告）；在隔离的临时配置里 `marketplace add <本地路径>` → `install` 成功，识别出 1 个 skill，常驻上下文约 70 token、触发时约 2.1k。**还没发布到 GitHub，所以 `<owner>/jingjian` 这条路没有真实跑过。**

**方式二：手动复制**：把 `skills/video-craft/` 整个文件夹放进 `~/.claude/skills/video-craft/`（里面要有 `SKILL.md`）。
> 这个仓库是用 `tools/build_plugin.py` 从源目录生成的；`skills/video-craft/` 里的内容和 plugin 安装的一样。

### 状态：v0，还不能直接发布
- [ ] 音效 / BGM 不附带（版权）。自备可商用音效，按 `references/sfx-pairing.md` 的 id 命名，用 `tools/register_sfx.py` 登记。
- [ ] 字体不附带（思源宋体 Heavy / 得意黑 / 抖音美好体，均可商用，需自行下载）。
- [x] `remotion/` 是可运行的起步项目（`package.json` / `Root.tsx` / `Edit.tsx` / `edit.example.json`，读 `remotion/README.md`）：在一台干净目录里 `npm install` → 类型检查 → 出静帧 → 出 8 秒短片都跑通过（macOS + Node 24；其它系统没试）。
- [ ] **无 LICENSE**（作者决定）：默认保留所有权利——别人能在 GitHub 上看 / fork，但没有复制、修改、再分发的授权；想让学生合法使用，以后要补一个。
- [ ] 「记者出镜」需要逐帧抠像，目前只有 macOS（Apple Vision）。
- [ ] 预览用占位人形，**没有真人 sample**。精剪的素材（B-roll）也是占位画面。
- [ ] 这些脚本和组件只在作者的 macOS + Remotion 4 上验证过。

### 目录
```
SKILL.md / SKILL.en.md   skill 本体（中 / 英）
references/ , references/en/   版式参数、字搭配、文字动画、行业主题、音效语义 / 时间表、工作流命令、安全区、抖音精剪（中 / 英）
remotion/craft/          Remotion 组件
docs/library.html        版式库（GitHub Pages 托管 docs/）
docs/previews/           每款 4 秒预览（mp4 + 封面 jpg）
tools/                   脚本 + 生成网页 build_library.py
```
重新生成网页：`python3 tools/build_library.py`

---

## English

**video-craft** — a talking-head editing **skill** for Claude Code, plus a **layout library** (Chinese / English).

- 🎬 **Layout library** (`docs/library.html`, toggle EN at the top right): 56 previews (17 text layouts / 4 scene changes / 4 Douyin-style cuts / 18 text-motion presets / 3 industry themes / 4 emotion words / 3 matte & glass / 3 skeleton: persistent title · stacking list · ending action) + an SFX pairing table. Hover to preview; click for when to use, when not to, which SFX to pair, and the code.
- 🧠 **SKILL.en.md**: rhythm numbers, safe-zone rules, layout selection, **typography pairing**, **text motion**, SFX pairing, the Douyin-style recipe, a pre-flight checklist.
- 🧱 **remotion/**: a runnable starter project + the `craft/` layout components (`kit` / `layouts` / `scenes` / `gallery` / `skeleton`…).

### Install (Claude Code)
**Option 1: plugin (recommended, once it is published on GitHub)**
```
/plugin marketplace add <owner>/jingjian
/plugin install video-craft@video-craft
```
Then open a new session and say: "Use video-craft to edit this talking-head video." To update: `/plugin update video-craft` (third-party marketplaces do **not** auto-update by default, and there is no push notification for new versions — update by hand).
> Verified locally: `plugin validate` passes (one warning left: no author); in an isolated temporary config, `marketplace add <local path>` → `install` succeeded, 1 skill was detected, about 70 tokens always-on and about 2.1k when it fires. **It is not published to GitHub yet, so the `<owner>/jingjian` route has never actually been run.**

**Option 2: copy by hand**: put the whole `skills/video-craft/` folder at `~/.claude/skills/video-craft/` (it must contain `SKILL.md`).
> This repository is generated from the source folder by `tools/build_plugin.py`; `skills/video-craft/` has the same content the plugin installs.

### Status: v0 — not ready to publish
- [ ] No SFX/BGM included (licensing). Bring your own commercially usable files, named by id per `references/en/sfx-pairing.md`, and register them with `tools/register_sfx.py`.
- [ ] No fonts included (Source Han Serif Heavy / Smiley Sans / Douyin Meihao — all commercially usable; download them yourself).
- [x] `remotion/` is a runnable starter project (`package.json` / `Root.tsx` / `Edit.tsx` / `edit.example.json`; read `remotion/README.md`): in a clean directory `npm install` → typecheck → still → an 8-second clip all ran (macOS + Node 24; other systems not tried).
- [ ] **No LICENSE** (the author's decision): all rights reserved by default — others can view / fork on GitHub but have no grant to copy, modify or redistribute; to let students use it legally, one has to be added later.
- [ ] "Reporter stand-up" needs per-frame matting — macOS only (Apple Vision).
- [ ] Previews use a placeholder figure — **no real-person sample**. B-roll in the Douyin-style cuts is a placeholder too.
- [ ] The scripts and components have only been verified on the author's macOS + Remotion 4.

### Layout
```
SKILL.md / SKILL.en.md   the skill (zh / en)
references/ , references/en/   layout params, typography pairing, text motion, industry themes, SFX semantics / timing, workflow commands, safe zone, Douyin-style recipe (zh / en)
remotion/craft/          Remotion components
docs/library.html        the library (host docs/ on GitHub Pages)
docs/previews/           4-second previews per layout (mp4 + poster jpg)
tools/                   scripts + build_library.py
```
Regenerate the page: `python3 tools/build_library.py`
