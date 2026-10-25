#!/usr/bin/env python3
"""降噪：视频 / 音频 → 降噪后的视频（DeepFilterNet3，全力）。**先降噪，后面的转写 / 对齐 / 精剪都吃干净音。**
用法：python3 denoise.py in.mp4 out.mp4 [--atten 18]
  --atten N   最多压 N dB（「自然」档，留一点房间感）；不写 = 全力。作者实测同一段咖啡厅口播：全力 讲话/停顿差 59 dB（听完选这个），--atten 18 是 38 dB。
找 deepFilter 的顺序：环境变量 DEEPFILTER → ~/.cache/video-craft/df/bin/deepFilter → PATH 里的 deepFilter。装法见 setup.sh（版本要钉：torch 2.0.1 + torchaudio 2.0.2 + deepfilternet 0.5.6 + Python 3.11，新版 torchaudio 会让它坏）。
什么时候不用它：讲话下面有「音乐 / BGM」→ 用 vocals.py（Demucs）。环境杂音（咖啡厅、空调、街道、人声嘈杂）才用这个。
"""
import argparse, os, shutil, subprocess, sys, tempfile

def find():
    for c in (os.environ.get("DEEPFILTER"), os.path.expanduser("~/.cache/video-craft/df/bin/deepFilter"), shutil.which("deepFilter")):
        if c and os.path.exists(c): return c
    sys.exit("找不到 deepFilter。先跑 tools/audio/setup.sh，或 export DEEPFILTER=/路径/deepFilter")

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("src"); ap.add_argument("out"); ap.add_argument("--atten", type=float)
    a = ap.parse_args(); df = find(); T = tempfile.mkdtemp()
    run = lambda *c, **k: subprocess.run(c, check=True, **k)
    run("ffmpeg", "-nostdin", "-v", "error", "-y", "-i", a.src, "-vn", "-ac", "1", "-ar", "48000", f"{T}/raw.wav")      # DF 要 48k 单声道
    cmd = [df, f"{T}/raw.wav", "-o", f"{T}/df"] + (["--atten-lim", str(a.atten)] if a.atten else [])
    env = dict(os.environ, OMP_NUM_THREADS="2")
    r = subprocess.run(cmd, env=env, capture_output=True, text=True)
    if r.returncode: sys.exit("deepFilter 失败：\n" + r.stderr[-600:])
    out = f"{T}/df/raw_DeepFilterNet3.wav"
    has_v = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=codec_type", "-of", "csv=p=0", a.src], capture_output=True, text=True).stdout.strip()
    if has_v: run("ffmpeg", "-nostdin", "-v", "error", "-y", "-i", a.src, "-i", out, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-af", "highpass=f=70", "-c:a", "aac", "-b:a", "256k", "-shortest", a.out)
    else: run("ffmpeg", "-nostdin", "-v", "error", "-y", "-i", out, "-af", "highpass=f=70", a.out)
    shutil.rmtree(T, ignore_errors=True); print("降噪完成 →", a.out)

if __name__ == "__main__": main()
