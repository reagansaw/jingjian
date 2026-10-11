#!/usr/bin/env python3
"""逐帧抠像（仅 macOS：Apple Vision）。只抠要用的那一段——75 帧约 1 分钟、300 帧约 4 分钟。
前置：swiftc -O personmatte.swift -o personmatte        （同目录）
用法：python3 mk_matte.py <视频> <起始帧> <结束帧> <输出目录>
产出：<输出目录>/<帧号>.webp（RGBA，人=不透明）。帧号 = 视频里的第几帧（和 Remotion 的 useCurrentFrame 对得上，前提是底片就是这条视频）。
依赖：ffmpeg、Pillow。"""
import os, subprocess, sys, shutil, tempfile
from PIL import Image, ImageFilter
H = os.path.dirname(os.path.abspath(__file__))
video, f0, f1, out = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
tmp = tempfile.mkdtemp(); os.makedirs(tmp + "/in"); os.makedirs(tmp + "/mask"); os.makedirs(out, exist_ok=True)
subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", video, "-vf", f"select='between(n\\,{f0}\\,{f1})'", "-vsync", "0", "-start_number", str(f0), "-q:v", "2", f"{tmp}/in/%05d.jpg"], check=True)
subprocess.run([f"{H}/personmatte", f"{tmp}/in", f"{tmp}/mask"], check=True)
n = 0
for fn in sorted(os.listdir(tmp + "/in")):
    rgb = Image.open(f"{tmp}/in/{fn}").convert("RGB")
    m = Image.open(f"{tmp}/mask/{fn[:-4]}.png").convert("L").resize(rgb.size, Image.BICUBIC)
    m = m.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.6))     # 往里收 1px 再羽化，免得带一圈墙
    rgb.putalpha(m); rgb.save(f"{out}/{int(fn[:-4])}.webp", "WEBP", quality=88, method=4); n += 1
shutil.rmtree(tmp, ignore_errors=True)
print(n, "张 →", out)
