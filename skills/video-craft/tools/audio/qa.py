#!/usr/bin/env python3
"""成片质检：响度（EBU R128）、真峰值、逐格黑帧扫描。
用法：python3 qa.py out.mp4
  响度：期望 −15 ±1 LUFS、真峰值 ≤ −1.5 dB。
  黑帧：单格亮度比前后都暗 >10% 列出来（Remotion 的 Sequence 帧数四舍五入会在段尾差一格 → 闪黑一格）；场景硬切会被报出，人眼看一下就知道是不是故意的。
没做的：残留口头禅 / 重讲（要再转写一次成片，用 transcribe.py 的 disf 那遍找）。
"""
import re, subprocess, sys

def main():
    f = sys.argv[1]
    r = subprocess.run(["ffmpeg", "-nostats", "-hide_banner", "-i", f, "-af", "ebur128=peak=true", "-vn", "-f", "null", "-"], capture_output=True, text=True).stderr
    last = r[r.rfind("Summary:"):] if "Summary:" in r else r
    g = lambda k: (re.search(k + r"\s*:?\s*(-?[\d.]+)", last) or [None, "?"])[1]
    print(f"响度 I = {g('I:')} LUFS · LRA = {g('LRA:')} LU · 真峰值 = {g('Peak:')} dBFS")
    s = subprocess.run(["ffprobe", "-v", "error", "-f", "lavfi", "-i", f"movie={f},signalstats", "-show_entries", "frame_tags=lavfi.signalstats.YAVG", "-of", "csv=p=0"], capture_output=True, text=True).stdout.split()
    y = [float(v) for v in s if v.replace(".", "", 1).isdigit()]
    dips = [(i / 30, y[i]) for i in range(1, len(y) - 1) if y[i] < y[i - 1] * 0.9 and y[i] < y[i + 1] * 0.9 and y[i - 1] > 8]
    print(f"逐格亮度：{len(y)} 格，单格突然变暗 {len(dips)} 处" + (f"：{[(round(t, 2), round(v, 1)) for t, v in dips[:12]]}" if dips else "（没有）"))

if __name__ == "__main__": main()
