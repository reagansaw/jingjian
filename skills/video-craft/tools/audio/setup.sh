#!/bin/bash
# 一键装声音流水线的依赖（两个独立的虚拟环境，装在 ~/.cache/video-craft/，不污染系统）。需要 uv（https://docs.astral.sh/uv/）和 ffmpeg。
#   df/    降噪：DeepFilterNet3。版本要钉死：deepfilternet 0.5.6 依赖 torchaudio.backend.common.AudioMetaData，torchaudio ≥2.1 拿掉了 → 会坏。约 365MB。
#   main/  对齐 + 去 BGM + 转写：torch / torchaudio / numpy / scipy / pypinyin / jieba / demucs（+ mac: mlx-whisper；其它: faster-whisper）。约 2–3GB。
# 用法：bash setup.sh [df|main|all]        --dry-run：只解析依赖、不下载
# ⚠ 作者只在 macOS Apple Silicon 上用现成的环境验证过；这个脚本本身在干净机器上的完整安装 **没有验证过**（磁盘不够）。
set -e
W="${1:-all}"; D=""; [ "$2" = "--dry-run" ] && D="--dry-run"
B="$HOME/.cache/video-craft"; mkdir -p "$B"
command -v uv >/dev/null || { echo "先装 uv：curl -LsSf https://astral.sh/uv/install.sh | sh"; exit 1; }
command -v ffmpeg >/dev/null || { echo "先装 ffmpeg（mac: brew install ffmpeg）"; exit 1; }
if [ "$W" = "df" ] || [ "$W" = "all" ]; then
  uv venv --python 3.11 "$B/df" 2>/dev/null || true
  uv pip install $D --python "$B/df/bin/python" "torch==2.0.1" "torchaudio==2.0.2" "deepfilternet==0.5.6" "numpy<2"
fi
if [ "$W" = "main" ] || [ "$W" = "all" ]; then
  uv venv --python 3.11 "$B/main" 2>/dev/null || true
  EXTRA="faster-whisper"; [ "$(uname -s)-$(uname -m)" = "Darwin-arm64" ] && EXTRA="mlx-whisper"
  uv pip install $D --python "$B/main/bin/python" torch torchaudio numpy scipy pypinyin jieba demucs soundfile $EXTRA
fi
echo "完成。降噪：python3 denoise.py in.mp4 out.mp4；对齐 / 精剪用 $B/main/bin/python tighten.py …"
