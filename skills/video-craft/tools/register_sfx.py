#!/usr/bin/env python3
"""登记你自己的音效：扫一个文件夹里的 lg-<id>.mp3 / .wav，量时长和峰值，写成 sfx-lib.json（合成里按峰值把每颗调到同样响）。
id = 语义（见 references/sfx-pairing.md），不是文件名；换文件不用改代码。
用法：python3 register_sfx.py <音效文件夹> <输出 sfx-lib.json>
⚠ 请只用你有权再发布 / 使用的音效（建议 CC0 或自己录制）。"""
import json, os, re, subprocess, sys
src, out = sys.argv[1], sys.argv[2]; lib = {}
for fn in sorted(os.listdir(src)):
    m = re.match(r"lg-(.+)\.(mp3|wav|m4a|aac)$", fn)
    if not m: continue
    p = os.path.join(src, fn)
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]))
    r = subprocess.run(["ffmpeg", "-nostdin", "-i", p, "-af", "volumedetect", "-vn", "-f", "null", "-"], capture_output=True, text=True).stderr
    mx = re.search(r"max_volume: (-?[\d.]+) dB", r)
    lib[m.group(1)] = {"name": fn, "dur": round(dur, 2), "max": float(mx.group(1)) if mx else -3.0}
json.dump(lib, open(out, "w"), ensure_ascii=False, indent=1); print(len(lib), "条音效 →", out)
