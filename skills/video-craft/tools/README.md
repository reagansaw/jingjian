# tools

| 脚本 | 做什么 | 备注 |
|---|---|---|
| `build_master.py` | 在句间补停顿（定帧 + 静音），输出底片 + `rec-map.json` | 参数化：`--video --words --pauses --out` |
| `personmatte.swift` + `mk_matte.py` | 逐帧抠像（仅 macOS，Apple Vision） | 先 `swiftc -O personmatte.swift -o personmatte` |
| `register_sfx.py` | 登记你自己的音效 → `sfx-lib.json` | 文件命名 `lg-<id>.mp3`；**只用你有权使用的音效** |
| `subjectlift.swift` + `mk_subject_matte.py` | 逐帧**主体**抠像（人 / 猫 / 产品…，仅 macOS） | 先 `swiftc -O subjectlift.swift -o subjectlift`；约 2 秒/帧 |
| `facebox.swift` + `face_track.py` | 每 0.25 秒量一次人脸框（仅 macOS） | 先 `swiftc -O facebox.swift -o facebox` |
| `place_check.py` | 不遮脸检查：edit.json × 人脸时间线，✗ 的给出头顶上方 / 下巴下面的建议 y，`--fix` 写回 | `python3 place_check.py edit.json face.json [--fix]` |
| `audio/setup.sh` | 一键装声音流水线依赖（两个独立虚拟环境，装在 `~/.cache/video-craft/`；版本钉死） | 只做过 `--dry-run` 解析，干净机器上的完整安装没验证 |
| `audio/denoise.py` | 降噪（DeepFilterNet3 全力 / `--atten N`） | 环境杂音才有用；底噪低的近距离收音几乎没差别 |
| `audio/vocals.py` | 去 BGM，只留人声（Demucs，前后多切 1 秒） | 讲话下面有音乐才用 |
| `audio/transcribe.py` | 转写两遍（普通 + 口头禅）+ 列出低置信度词 | mac 用 mlx-whisper；其它用 faster-whisper（没测过） |
| `audio/align.py` | 强制对齐到字（torchaudio MMS_FA） | 数字自动读成中文；英文冷门词按字母读 |
| `audio/tighten.py` | 精剪：删 `[重讲]` `{语气词}`、压停顿、变速、字幕、跳切点 | 一次出 `tight.mp4` + `tight.json` |
| `audio/master.sh` / `audio/qa.py` | 母带 −15 LUFS / −2 dBTP；质检（响度 + 逐格黑帧） | |
| `audio/make_sfx.py` | 合成 34 个原创音效（纯数学合成，无授权问题） | **好不好听要人耳判断**；`--audition` 出试听音轨 |
| `make_captions.py` | 字幕：校对后的文字 + whisper 逐字时间 → 每行 ≤12 字宽的字幕 JSON（时间 = 他讲那个字的时间；可选 `pip install jieba` 让断行不切开词） | 多条素材拼接时用 `--offset` / `--length` |
| `check_text_visible.py` | 量「字在人后」时字被人遮住的比例（平均 / 最大） | 目标：平均 8–20%、最多 ≤30% |
| `analyze_bgm.py` / `mix_bgm.py` | 估算 BGM 的 BPM/鼓点；给无 BGM 成片混 BGM | 可选；默认不加 BGM |
| `build_library.py` + `library.template.html` + `i18n.json` | 生成 `docs/library.html`（中/英双语） | 读 `remotion/craft/gallery.tsx` 的注册表 |

⚠ 这些脚本只在作者的 macOS 上验证过；`build_master.py` 的参数化版本我没有重新跑过完整流程，用之前先在一条短视频上试。
