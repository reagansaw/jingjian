# 声音流水线 + 合成音效 + 钩子 / 特效（让「普通」变「不普通」）

回答：**为什么你剪出来的片「还是普通」，作者的几集真实口播（奇门 / 故事片 / 播客）多做了哪几件事，怎么让每个学生都能做。**
前面的文件讲零件（版式 / 字 / 动画）；这份讲**声音**（降噪 / 精剪 / 母带 / 音效）和**钩子与「讲什么画什么」的特效**。

## 来源与可信度（先读）
- 来自作者做的几集真实口播（Ivy 奇门「六合借力 co-broke」v4、Podcast EP1、故事片 EP1、Vanta 系列）的**实际做法**：由剪那几集的 session 写成笔记，本库只搬走**没有绑定私人素材**的部分并重写成通用版。每一项的「做过 / 没做过 / 没验证」都标了。
- **验证过的**（在作者这台 macOS Apple Silicon 8GB 机器上，用作者自己的两条口播素材）：`align.py` + `tighten.py` 对齐精剪出片、`make_captions.py`（字幕）、`denoise.py`、`vocals.py`、`transcribe.py`、`master.sh`、`qa.py` 都跑通；34 个合成音效生成并看了频谱；`fx.tsx` 等新组件通过类型检查并渲了静帧 / 预览。
- **没验证的**：Windows / Linux；`setup.sh` 在干净机器上的完整安装（只做了依赖解析 `--dry-run`，磁盘不够）；faster-whisper 后端；合成音效**好不好听**（作者的流程里没有耳朵，只量了时长 / 峰值 / 频谱——要人耳判断）。

## 一、为什么「普通」——对照表
| 作者多做的 | 在哪 | 本库里 |
|---|---|---|
| 开头 3–8 秒钩子三件套：**台词**（她最强的一句原话 + 一个具体数字）+ **画面**（白闪 / 冲镜 / 逐词放大变色 / 数字砸下）+ **音效** | `essence.md` §一 + `fx.tsx` | `camera-punch`、`white-flash`、`kinetic-line`、`counter-slam` |
| 每个字出场配音效，**挂在文字第 0 帧**（字因入场动画第 1–3 帧才看得见，所以听感上声音略早，绝不晚） | `autosfx.ts` | `Edit` 的 `autoSfx`（默认开） |
| **讲什么画什么**（缩成圆头像、两个她并排、画面缩进手机飞走、电视关机、真截图放手机框里）；画面**最多 5 秒**就换 | `fx.tsx` | `camera-circle` / `camera-send` / `camera-tvoff` / `rapid-montage` / `chat-dm` |
| 字幕永远一行、短、白；强调字才用强调色；**3D 厚度阴影，不用黑描边** | `depth3d()`、`captions.tsx` | `Captions`、`depth3d`、`jy-text` |
| **声音先干净**：降噪 → 精剪掉停顿 / 重讲 / 口头禅 → 母带 −15 LUFS | `tools/audio/` | 见下 |
| 24 个剪映文字动画，音效自动配 | `jytext.tsx` | `jy-text`（见 `motion-measured.md` 里两套独立测量互相印证的部分） |
| 国风氛围层（星空 / 宣纸颗粒 / 粒子 / 水墨转场） | `backdrop.tsx` | `backdrop-cosmos`、`particles`、`ink-wipe` |

## 二、声音流水线（`tools/audio/`，一步一个脚本）
```bash
bash tools/audio/setup.sh                                  # 一次：装两个独立虚拟环境（降噪 / 其它），装在 ~/.cache/video-craft/
python3 tools/audio/denoise.py   in.mp4 clean.mp4          # 1 降噪（环境杂音才有用）
python3 tools/audio/vocals.py    in.mp4 vocals.wav         # 1' 讲话下面有 BGM / 音乐才用
python3 tools/audio/transcribe.py clean.mp4 tx/ --prompt "主题词，名字，英文词"   # 2 转写两遍（普通 + 口头禅），并列出低置信度的词
#   → 对稿：低置信度（<0.6）的词一定要和说话的人确认；写 script.txt（见下）
python3 tools/audio/tighten.py --src clean.mp4 --script script.txt --out tight.mp4 --meta tight.json   # 3 精剪 + 字幕
bash tools/audio/master.sh        out.mp4 final.mp4        # 4 母带 −15 LUFS / −2 dBTP
python3 tools/audio/qa.py         final.mp4                # 5 质检（响度 + 逐格黑帧）
```
**降噪（DeepFilterNet3）**：作者实测同一段 26 秒咖啡厅口播，用「讲话 p90 − 停顿 p10」的分贝差衡量（越大越干净）：

| 做法 | 讲话 | 停顿 | 差 |
|---|---|---|---|
| 原声 | −19.4 | −42.1 | 22.7 dB |
| Demucs 只留人声 | −19.4 | −42.4 | 23.0（几乎没用） |
| Demucs + 一串 ffmpeg 滤波 | −14.5 | −40.1 | 25.6 |
| **DeepFilterNet3 全力** | −12.1 | **−71.3** | **59.2** ← 作者听 A/B 选了它 |
| DeepFilterNet3 `--atten-lim 18` | −12.2 | −50.1 | 37.9 |

- **环境杂音**（咖啡厅 / 空调 / 街道）→ DeepFilterNet；**讲话下面有音乐** → Demucs；两样都有 → 先 Demucs 再 DF（**这个组合没实测过**）。
- **版本要钉死**：deepfilternet 0.5.6 依赖 `torchaudio.backend.common.AudioMetaData`，torchaudio ≥2.1 拿掉了会坏 → torch 2.0.1 + torchaudio 2.0.2 + Python 3.11，并且和其它环境**分开装**。
- 作者自己的两条素材（近距离收音、安静房间）降噪前后几乎没差别（差 36.2 → 36.7 dB）——**底噪本来就低的录音不需要它**。
- 比较过 ffmpeg `afftdn`（弱）；**没比较过** RNNoise、剪映自带降噪。

**精剪（`tighten.py`）**：强制对齐到字（torchaudio MMS_FA）→ 删重讲 / 口头禅 → 压停顿 → 变速 → 每段响度 −16 LUFS → 字幕。
- `script.txt` = 你校对过的、原片里真正讲的话。`[重讲]` 硬删；`{啊}{啦}` 软删（只有「和前一个字之间有停顿」才删）；数字写阿拉伯数字（自动读成中文对齐）。
- 停顿规则：空隙 >0.45s 当成拖音 / 呃，剪到下一字起音前；0.20–0.45s 只剪静音，两边各留 0.05s。
- 语速目标 **4.5–5.0 音节/秒**（本来就快的别加速；太慢才 `--speed 1.05–1.08`）。作者这条素材 5.47，不加速。
- 转写**会听错字**（中英混说 / 口音 / 专有名词）：本库实测同一句「销冠」被听成「消关」、「me time」被听成「秘态」；large-v3 + 主题提示好很多，但仍要问本人。`--prompt` 给主题词。
- 转写两遍的原因：普通转写会把「呃」「OK」洗掉，**口头禅（disf）那遍才看得到重讲和口头禅**。成片精剪完最好再用 disf 转一次，找残留。

**母带**：`loudnorm=I=-15:TP=-2` + `alimiter`。作者一支 2:42 的片实测 −15.1 LUFS / 真峰值 −2.0 dB；本库一条 18 秒的实测 −15.6 / −2.4。短视频平台会把太响的压回来，所以不要超过。

## 三、音效（合成的原创一套，34 个）
- 为什么合成：剪映的 2-1 / 2-2 音效包是别人的素材，学生拿不到，也不能再分发；本库用纯数学合成（正弦 / 噪声 / 滤波 / 包络）出一套**原创**的，没有授权问题，随库附带（`remotion/public/sfx/`，约 350KB）。重新生成：`python3 tools/audio/make_sfx.py`（需要 numpy + ffmpeg；`--audition` 出一条带报名字的试听音轨，macOS 用 `say`）。
- **质量要靠人耳**：我只量了时长 / 峰值 / 频谱形状（嗖上扬频率在升、叮是几条平行泛音、打字是 10 下点击）。**不好听的，改 `make_sfx.py` 里对应函数的参数重跑**。第一版的嗖声用「分块带通」会有 ~50Hz 的颤动（听起来「突突突」），已换成短时傅里叶合成。
- 名字按**用途**取，不按「像什么」：`whoosh_up/down/short/long`、`swish`、`pop`、`click`、`tick`、`tap`、`ding`、`bell_long`、`chime_up`、`success`、`notify`、`boom`、`thud`、`hit`、`slam`、`sub_drop`、`punch`、`shimmer`、`flash`、`sweep_light`、`magic`、`typing`、`paper`、`camera`、`coin`、`cash`、`stamp`、`riser`、`suspense_hit`、`heartbeat`、`zip_up`。
- **音效 ↔ 动画的配对**来自剪映 2-1 样片（每个文字段同一帧挂一个音效，作者另一个 session 逐个对过、量过音量）：见 `remotion/craft/autosfx.ts`（预设 / 版式 / 特效 → 音效 id + 相对音量）。`Edit` 的 `autoSfx: true`（默认）自动配；`sfxGain`（默认 0.5）调总音量，垫在人声 −16 LUFS 底下约 −24 LUFS；某个版式不要就在它的 props 里写 `"sfx": false`。**约 1/3 的字块安静**，这是节奏。
- **关于「音效早字 1–3 帧」**：音效挂在文字片段的第 0 帧；字因为入场动画，第 1–3 帧才看得见，所以听感上声音略早，**绝不晚**。（在工程文件里量，音效起点和文字起点是同一帧：89.6%；这两个说法不矛盾。）
- 没做的：音量的**闪避**（说话时自动压低音效 / BGM）、混响空间感、可商用的外部音效库评估。

## 四、BGM（不附带）
- **不随库附带 BGM**：作者用过的《诸神降临》来源和授权不明；别的歌授权也没核。学生自己找合法来源（自己的作品 / 付费授权 / 平台允许商用的库——使用前自己核对许可）。
- 混音用已有的 `tools/mix_bgm.py`（淡入 / 金句压低 / 淡出，−15 LUFS）。作者奇门片的做法：BGM 整片固定 0.447 倍（≈ −7 dB）、loop、前 0.5 秒淡入、最后 2 秒淡出，**没有做闪避**，靠母带 loudnorm 整体拉。故事片则**交「无 BGM」版**，BGM 由作者自己在剪映里放。
- 讲话底下本来有音乐（别人的片 / 活动现场）要去掉：`vocals.py`（Demucs）。

## 五、字体（不附带；清单）
| 字体 | 用在 | 授权（我知道的） |
|---|---|---|
| 思源宋体 / 思源黑体（Source Han Serif / Sans） | 大字 / 字幕 | Adobe + Google，**SIL OFL，免费可商用** |
| 得意黑（Smiley Sans） | 标签 / 胶囊 | **SIL OFL，免费可商用** |
| 抖音美好体（Douyin Sans） | 字幕 / 小字 | 字节跳动公开的**免费商用**字体（作者从包里的说明得知，**没去官网核**） |
| 霞鹜文楷（LXGW WenKai） | 国风 / 楷体 | SIL OFL（没测过版式） |
| 方正粗金陵、Aa研宋、造字工房系列 | 作者奇门片的头顶大字 / 强调句 | **授权不明或要买** → **不能进公开 skill**；学生用上面的 OFL 字代替 |
| macOS 系统字（宋体-简 / 行楷 / 魏碑 / 楷体） | 字幕 | Apple 系统字，作者没查「商用到影片」的授权；Windows 学生没有 |
放进 `remotion/public/craft/fonts/`（文件名见那里的 README）；缺了会退到系统中文字体（能出片，字形不同）。**下载和授权请自己核对。**

## 六、特效组件速查（`craft/fx.tsx`、`jytext.tsx`、`backdrop.tsx`）
| 组件 | 作用 | 用在 edit.json 的 |
|---|---|---|
| `camera: punch` | 开场冲镜 1.28→1.0 回弹 + 动态模糊 | `camera` |
| `camera: shake`（`hits:[秒…]`） | 冲击点震动 + 放大 1.06；只震画面，字不震 | `camera` |
| `camera: tvoff`（`at`,`until`） | 电视关机（线 → 点 → 黑）；**一定要给 until** | `camera` |
| `camera: send` | 画面缩进手机 → 飞走 | `camera` |
| `camera: circle`（`face:[x,y]`,`peers`,`popAt`） | 缩成圆头像 + 周围圆圈连线 | `camera` |
| `white-flash` | 白闪 0.22s | `beats` |
| `kinetic-line`（`words:[{t,text,hot?}]`） | 逐词放大变色 | `beats` |
| `counter-slam`（`to`,`land`,`suffix`） | 数字滚动砸下 | `beats` |
| `stamp` | 印章字从大盖下来 | `beats` |
| `chat-dm`（`text`,`sendAt`） | 聊天框打字 → 发送 → 气泡飞走 | `beats` |
| `slot-row`（`n`） | N 个空位一个个弹出 | `beats` |
| `rapid-montage`（`images:[{src,w,h}]`,`step`,`label`） | 真截图快闪（**截图要自己准备**） | `beats` |
| `jy-text`（`preset`: 24 个剪映预设） | 剪映文字动画 + 3D 厚度阴影 | `beats` |
| `particles` / `mist` / `paper-grain` / `ink-wipe` | 氛围层 / 水墨转场（纯代码） | `beats` |
**什么时候别用**：抽象装饰（星网乱线压在脸上——作者被批「不知道在画什么」）；头顶大字 >3 字（会被头盖）；一个画面同时 2 种以上强调色；连续两段用同一种特效。
**「讲什么画什么」是核心**：用说话人自己的画面去演那句话（缩成圆头像、两个她并排、缩进手机飞走、电视关机），比贴素材 / 抽象线条强太多；有真截图就用真截图，不要做动画。

## 七、没做的 / 平台限制（诚实）
| 东西 | 限制 | 替代 |
|---|---|---|
| `mlx_whisper` 转写 | 仅 Apple Silicon | faster-whisper（CPU / CUDA，较慢；**没测过**） |
| MMS_FA 强制对齐 | 跨平台（pip） | — |
| DeepFilterNet3 / Demucs | 跨平台，版本要钉；**Windows 没测** | — |
| 透明人像抠像（字在人后） | **macOS only**（Vision） | RobustVideoMatting / MediaPipe / rembg（**没做过**） |
| 深度视差背景（给任意图 + 深度图 → 真 2.5D） | 要 three.js + 深度模型；Depth Anything V2 **Large 是非商用授权（CC-BY-NC，需核实）**，Small 是 Apache | **没搬进来** |
| 2.5D 照片视差（`make_parallax`）、国风九宫盘、八神报告等 | 绑定奇门 / Ivy 内容 | 没搬 |
| 残留口头禅质检 | 要再转写一次成片找 | 手动用 `transcribe.py` 的 disf 那遍 |
