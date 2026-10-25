#!/bin/bash
# 母带：响度 −15 LUFS、真峰值 −2 dB（短视频平台常见偏好；放大声会被平台压回来，所以不要超过）。视频流直接复制，只处理声音。
# 用法：master.sh in.mp4 out.mp4          实测（作者一支 2:42 的片）：−15.1 LUFS / 真峰值 −2.0 dB
set -e
[ $# -ge 2 ] || { echo "用法: $0 in.mp4 out.mp4"; exit 1; }
ffmpeg -nostdin -v error -y -i "$1" -c:v copy \
  -af "loudnorm=I=-15:TP=-2:LRA=11,aresample=192000,alimiter=limit=0.79:attack=3:release=60:level=false,aresample=48000" \
  -c:a aac -b:a 256k -movflags +faststart "$2"
echo "母带完成 → $2"
