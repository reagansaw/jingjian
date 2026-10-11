#!/usr/bin/env python3
"""在句间补停顿：把前一段的最后一帧定住 p 秒（定帧）+ 补 p 秒静音，再拼起来。
输出补停顿后的底片 + rec-map.json（每个切点 {c, p}，合成里用 M(t)=t+Σ(p for c≤t) 换算时间）。

用法：
  python3 build_master.py --video in.mp4 --words rec.json --pauses pauses.json --out out_dir
    --words   whisper 的 json（--word-timestamps True 产出，里面要有 segments[].words[].{word,start,end}）
    --pauses  [[下一个词的开始时间(秒), 停顿秒数], ...]，例：[[3.08,0.35],[4.60,0.40],[6.90,0.30]]
  输出：out_dir/rec.mp4 、 out_dir/rec-map.json
切点取「上一个词结束」与「下一个词开始」的中点，并吸到 1/30 秒（不吸画格，音画会漂）。
"""
import argparse, json, os, subprocess
ap = argparse.ArgumentParser()
ap.add_argument("--video", required=True); ap.add_argument("--words", required=True); ap.add_argument("--pauses", required=True); ap.add_argument("--out", required=True)
ap.add_argument("--fps", type=int, default=30)
a = ap.parse_args()
FPS = a.fps; sn = lambda t: round(t * FPS) / FPS
os.makedirs(a.out, exist_ok=True)
d = json.load(open(a.words)); W = [x for s in d["segments"] for x in s["words"]]
cuts = []
for s, p in json.load(open(a.pauses)):
    i = min(range(len(W)), key=lambda k: abs(W[k]["start"] - s)); assert abs(W[i]["start"] - s) < 0.03, f"找不到开始时间≈{s} 的词：最近的是 {W[i]}"
    prev = W[i - 1]["end"] if i else 0; c = sn((prev + W[i]["start"]) / 2) if W[i]["start"] > prev else sn(W[i]["start"] - 0.02)
    cuts.append({"c": c, "p": round(sn(p), 3), "next": s})
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.video]))
edges = [0] + [c["c"] for c in cuts] + [sn(dur)]
fc, cat = [], []
for i in range(len(edges) - 1):
    lo, hi = edges[i], edges[i + 1]; p = cuts[i]["p"] if i < len(cuts) else 0
    fc.append(f"[0:v]trim={lo}:{hi},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration={p}[v{i}]")
    fc.append(f"[0:a]atrim={lo}:{hi},asetpts=PTS-STARTPTS,apad=pad_dur={p}[a{i}]"); cat.append(f"[v{i}][a{i}]")
fc.append("".join(cat) + f"concat=n={len(edges) - 1}:v=1:a=1[v][a]")
out_mp4 = os.path.join(a.out, "rec.mp4")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.video, "-filter_complex", ";".join(fc), "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "14", "-preset", "fast", "-pix_fmt", "yuv420p", "-r", str(FPS), "-c:a", "aac", "-b:a", "192k", out_mp4], check=True)
tot = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out_mp4]))
json.dump({"cuts": cuts, "total": tot, "orig": dur, "words": [{"w": x["word"].strip(), "s": x["start"], "e": x["end"]} for x in W]}, open(os.path.join(a.out, "rec-map.json"), "w"), ensure_ascii=False, indent=1)
print("cuts", len(cuts), "added", round(sum(c["p"] for c in cuts), 2), "s  orig", dur, "→ new", tot)
