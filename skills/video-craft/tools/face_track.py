#!/usr/bin/env python3
"""每隔 step 秒量一次人脸框（macOS 用系统 Vision；Windows / Linux 自动改用 MediaPipe，见 vision_fallback.py），输出 JSON：[{t, x, y, w, h}]（视频原始 1080×1920 坐标，原点左上；没脸的时刻不输出）。
用法：python3 face_track.py <视频> <输出.json> [step=0.25]
前置（macOS）：swiftc -O facebox.swift -o facebox（同目录）。Windows / Linux：python -m pip install mediapipe。依赖 ffmpeg。
Vision 的脸框只到眉上—下巴，头发顶比它高、下巴下面还有脖子：place_check.py 里会按比例放大。"""
import json, os, subprocess, sys, tempfile, shutil
H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, H)
from vision_fallback import use_native, face_box
NATIVE = use_native(f"{H}/facebox")
video, out = sys.argv[1], sys.argv[2]; step = float(sys.argv[3]) if len(sys.argv) > 3 else 0.25
tmp = tempfile.mkdtemp()
subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", video, "-vf", f"fps=1/{step},scale=540:-2", "-q:v", "3", f"{tmp}/%05d.jpg"], check=True)
res = []
for i, fn in enumerate(sorted(os.listdir(tmp))):
    if NATIVE:
        r = subprocess.run([f"{H}/facebox", f"{tmp}/{fn}"], capture_output=True, text=True).stdout.split()
        r = tuple(map(float, r)) if len(r) == 4 else None
    else:
        r = face_box(f"{tmp}/{fn}")
    if r:
        x, y, w, h = r; res.append({"t": round(i * step, 3), "x": round(x * 1080), "y": round(y * 1920), "w": round(w * 1080), "h": round(h * 1920)})
shutil.rmtree(tmp, ignore_errors=True)
json.dump(res, open(out, "w"), ensure_ascii=False)
print(len(res), "个时刻有脸 →", out, "" if NATIVE else "（MediaPipe）")
