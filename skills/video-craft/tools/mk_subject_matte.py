#!/usr/bin/env python3
"""逐帧「主体抠像」（仅 macOS：Vision VNGenerateForegroundInstanceMaskRequest）——人、猫、产品…画面里的前景主体都行。
和 mk_matte.py（只抠人）的区别：这个按「前景主体」抠，不限于人；每帧单独跑一次，比 mk_matte.py 慢（每帧约 0.3–3 秒，视机器）。
前置：swiftc -O subjectlift.swift -o subjectlift        （同目录）
用法：python3 mk_subject_matte.py <视频> <起始帧> <结束帧> <输出目录>
产出：<输出目录>/<帧号>.webp（RGBA，主体 = 不透明）。依赖 ffmpeg、Pillow。
⚠ 抠像质量只在一条真人口播上看过；边缘（头发、手指、半透明物体）和「没有明确前景主体」的画面请自己抽几帧确认。"""
import os, subprocess, sys, shutil, tempfile
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__))
video, f0, f1, out = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
tmp = tempfile.mkdtemp(); os.makedirs(tmp + "/in"); os.makedirs(out, exist_ok=True)
subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", video, "-vf", f"select='between(n\\,{f0}\\,{f1})'", "-vsync", "0", "-start_number", str(f0), "-q:v", "2", f"{tmp}/in/%05d.jpg"], check=True)
n = miss = 0
for fn in sorted(os.listdir(tmp + "/in")):
    k = int(fn[:-4]); png = f"{tmp}/{k}.png"
    r = subprocess.run([f"{H}/subjectlift", f"{tmp}/in/{fn}", png], capture_output=True, text=True)
    if r.returncode != 0 or not os.path.exists(png):
        miss += 1; continue                       # 这一帧没抠到主体 → 不出文件 → 合成里 TextBehind 会不画字（fail-closed）
    Image.open(png).convert("RGBA").save(f"{out}/{k}.webp", "WEBP", quality=88, method=4); n += 1
shutil.rmtree(tmp, ignore_errors=True)
print(n, "张", f"（{miss} 帧没抠到主体）" if miss else "", "→", out)
