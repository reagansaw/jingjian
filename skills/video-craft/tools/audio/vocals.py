#!/usr/bin/env python3
"""去 BGM：只留人声（Demucs htdemucs，two-stems=vocals）。
用法：python3 vocals.py in.mp4 out.wav [--from 12.3 --to 40.0]
  讲话下面有音乐（活动现场、别人的片、采访带背景乐）才用；只有环境杂音请用 denoise.py（Demucs 对环境杂音几乎没用，实测只降 0.3 dB）。
做法：前后各多切 1 秒再分离（接点才不会有怪声），分完切回原长度，highpass 70，拉到 −16 LUFS，头尾 15/30ms 淡入淡出。
效果（作者的一支采访）：停顿处的音乐 −29 dB → −82 dB，字一个不少。CPU 上跑，1 分钟音频约 1–2 分钟。
找 demucs 的顺序：环境变量 DEMUCS_PY（带 demucs 的 python）→ ~/.cache/video-craft/main/bin/python → 当前 python。
"""
import argparse, os, shutil, subprocess, sys, tempfile

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("src"); ap.add_argument("out")
    ap.add_argument("--from", dest="t0", type=float, default=0.0); ap.add_argument("--to", dest="t1", type=float)
    a = ap.parse_args()
    py = os.environ.get("DEMUCS_PY") or (os.path.expanduser("~/.cache/video-craft/main/bin/python") if os.path.exists(os.path.expanduser("~/.cache/video-craft/main/bin/python")) else sys.executable)
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.src]).decode())
    t1 = a.t1 or dur; s0 = max(0.0, a.t0 - 1.0); s1 = min(dur, t1 + 1.0); T = tempfile.mkdtemp()
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", str(s0), "-to", str(s1), "-i", a.src, "-vn", "-ac", "2", "-ar", "44100", f"{T}/raw.wav"], check=True)
    env = dict(os.environ, OMP_NUM_THREADS="2", MKL_NUM_THREADS="2")
    r = subprocess.run([py, "-m", "demucs", "--two-stems", "vocals", "-n", "htdemucs", "-d", "cpu", "-j", "1", "-o", f"{T}/sep", f"{T}/raw.wav"], env=env, capture_output=True, text=True)
    if r.returncode: sys.exit("demucs 失败：\n" + r.stderr[-600:])
    voc = f"{T}/sep/htdemucs/raw/vocals.wav"; keep = t1 - a.t0; lead = a.t0 - s0
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{lead:.3f}", "-t", f"{keep:.3f}", "-i", voc,
                    "-af", f"highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=0.015,afade=t=out:st={max(0, keep - 0.03):.3f}:d=0.03", a.out], check=True)
    shutil.rmtree(T, ignore_errors=True); print("人声 →", a.out)

if __name__ == "__main__": main()
