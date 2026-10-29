#!/usr/bin/env python3
"""每隔 step 秒量一次人脸框（仅 macOS Vision），输出 JSON：[{t, x, y, w, h}]（视频原始 1080×1920 坐标，原点左上；没脸的时刻不输出）。
用法：python3 face_track.py <视频> <输出.json> [step=0.25]
前置：swiftc -O facebox.swift -o facebox（同目录）。依赖 ffmpeg。
Vision 的脸框只到眉上—下巴，头发顶比它高、下巴下面还有脖子：place_check.py 里会按比例放大。"""
import json, os, subprocess, sys, tempfile, shutil
H = os.path.dirname(os.path.abspath(__file__))
video, out = sys.argv[1], sys.argv[2]; step = float(sys.argv[3]) if len(sys.argv) > 3 else 0.25
tmp = tempfile.mkdtemp()
subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", video, "-vf", f"fps=1/{step},scale=540:-2", "-q:v", "3", f"{tmp}/%05d.jpg"], check=True)
res = []
for i, fn in enumerate(sorted(os.listdir(tmp))):
    r = subprocess.run([f"{H}/facebox", f"{tmp}/{fn}"], capture_output=True, text=True).stdout.split()
    if len(r) == 4:
        x, y, w, h = map(float, r); res.append({"t": round(i * step, 3), "x": round(x * 1080), "y": round(y * 1920), "w": round(w * 1080), "h": round(h * 1920)})
shutil.rmtree(tmp, ignore_errors=True)
json.dump(res, open(out, "w"), ensure_ascii=False)
print(len(res), "个时刻有脸 →", out)
