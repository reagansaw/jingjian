# tools

| 脚本 | 做什么 | 备注 |
|---|---|---|
| `build_master.py` | 在句间补停顿（定帧 + 静音），输出底片 + `rec-map.json` | 参数化：`--video --words --pauses --out` |
| `personmatte.swift` + `mk_matte.py` | 逐帧抠像（仅 macOS，Apple Vision） | 先 `swiftc -O personmatte.swift -o personmatte` |
| `register_sfx.py` | 登记你自己的音效 → `sfx-lib.json` | 文件命名 `lg-<id>.mp3`；**只用你有权使用的音效** |
| `subjectlift.swift` + `mk_subject_matte.py` | 逐帧**主体**抠像（人 / 猫 / 产品…，仅 macOS） | 先 `swiftc -O subjectlift.swift -o subjectlift`；约 2 秒/帧 |
| `make_captions.py` | 字幕：校对后的文字 + whisper 逐字时间 → 每行 ≤12 字宽的字幕 JSON（时间 = 他讲那个字的时间；可选 `pip install jieba` 让断行不切开词） | 多条素材拼接时用 `--offset` / `--length` |
| `check_text_visible.py` | 量「字在人后」时字被人遮住的比例（平均 / 最大） | 目标：平均 8–20%、最多 ≤30% |
| `analyze_bgm.py` / `mix_bgm.py` | 估算 BGM 的 BPM/鼓点；给无 BGM 成片混 BGM | 可选；默认不加 BGM |
| `build_library.py` + `library.template.html` + `i18n.json` | 生成 `docs/library.html`（中/英双语） | 读 `remotion/craft/gallery.tsx` 的注册表 |

⚠ 这些脚本只在作者的 macOS 上验证过；`build_master.py` 的参数化版本我没有重新跑过完整流程，用之前先在一条短视频上试。
