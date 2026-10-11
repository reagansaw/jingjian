# 工作流命令（本机 macOS 的做法；其它系统要换工具）

## 1. 转写（逐字时间）
```bash
uvx --from mlx-whisper mlx_whisper "video.mp4" --model mlx-community/whisper-large-v3-turbo \
  --language zh --condition-on-previous-text False --word-timestamps True \
  --output-format all --output-name rec --output-dir out/
```
- 8GB 内存的机器：转写时别同时跑别的重活；67 秒音频约 1–2 分钟。
- 无人声的视频会出幻觉（「请不吝点赞…」）→ 先确认有人声。
- 转写错字：中英混说、口音词。**字幕以校对后的为准。**

## 2. 补停顿（`tools/build_master.py`：`--video --words --pauses --out`）
思路：在句间的「下一个词开始时间」处，把前一段的最后一帧定住 `p` 秒（`tpad stop_mode=clone`），音频补 `p` 秒静音（`apad`），再 `concat`。
- 切点取「上一个词结束」与「下一个词开始」的中点，并吸到 1/30 秒。
- 输出 `rec-map.json`：每个切点 `{c, p}`；合成里用 `M(t) = t + Σ(p for c ≤ t)` 把原片时间换算成补停顿后的时间。
- 补多少：钩子后 0.35、重点词前 0.3–0.45、其余 0.2–0.3，共约 3–4 秒/分钟。

## 3. 抠像（仅 macOS，可选）
`tools/mk_matte.py <视频> <起始帧> <结束帧> <输出目录>`（先编译 `tools/personmatte.swift`；Swift + Apple Vision `VNGeneratePersonSegmentationRequest`）→ 逐帧 RGBA webp，**只抠要用的那一段**（75 帧约 1 分钟，300 帧约 4 分钟）。

## 4. 渲染
```bash
# 预览某一款（带安全区红框的静帧）
LITE_ONLY=craft node out/stills-lite.mjs '[["CraftDemo-guides","name",12.3]]'
# 整支
CONCURRENCY=2 LITE_ONLY=craft node out/render-lite.mjs CraftDemo out.mp4
```
- 渲染进程渲完不一定退出：长渲染外面包 `perl -e 'alarm 1500; exec @ARGV' …`，渲完检查有没有残留的 headless chrome。
- 渲染时别同时跑别的重活（8GB 机器会慢 2–3 倍）。

## 5. 响度
`ffmpeg -i in.mp4 -af "loudnorm=I=-15:TP=-2:LRA=11" ...`；检查：`-af ebur128=peak=true`。

## 6. 可选：加 BGM
`python3 tools/mix_bgm.py <无BGM成片.mp4> <bgm.mp3> <out.mp4> --start 秒 --gain dB`
BGM 自动：钩子后 1.2 秒淡入、金句/引用/收尾压低、结尾淡出。**默认不加**。
