#!/usr/bin/env python3
"""挑字幕样式预设：按「分类 / 段数 / 每段最多几个字 / 位置带 / 时长」筛，给 3–5 个候选（AI 再从里面选，别去读整份 caption-presets.json）。
用法：python3 pick_caption.py --cat 关键词 --segs 3 --chars 6 --band lower [--dur 3] [--top 5] [--seed N] [--list-cats]
  --cat   分类（见 --list-cats；可写多个用逗号）   --segs  需要几段文字（预设段数 ≥ 它，多出的段用不到会显示占位字，所以优先段数相等的）
  --chars 你最长那段有几个字（预设那一段的字数 ≥ 它才算放得下；超出会自动缩字）   --band  above（头顶上方）/ mid / lower（下巴下面）/ any
  --seed  同一支视频里换款用：结果里按种子轮换，避免每次都挑同一个
同样合适时，**真实口播工程里用得多的排前面**（真实使用＝在 88 个真实工程里按样式相似度对上的片段数，不是效果评分）。
输出每个候选：id、名字、段数、每段字数、位置、需要的 dy（把整体挪进安全区 y250–1250）、动画、可直接粘的 beat。"""
import argparse, collections, json, os, random
H = os.path.dirname(os.path.abspath(__file__))
SP = json.load(open(os.path.join(H, "..", "remotion/craft/caption-presets.json"), encoding="utf-8"))
ap = argparse.ArgumentParser(); ap.add_argument("--cat"); ap.add_argument("--segs", type=int); ap.add_argument("--chars", type=int, default=0)
ap.add_argument("--band", default="any"); ap.add_argument("--dur", type=float, default=0); ap.add_argument("--top", type=int, default=5); ap.add_argument("--seed", type=int, default=0); ap.add_argument("--list-cats", action="store_true")
a = ap.parse_args()
if a.list_cats:
    for c, n in collections.Counter(x["cat"] for x in SP).most_common(): print(f"{c}\t{n}")
    raise SystemExit
def box(x):
    lo, hi = 1e9, -1e9
    for g in x["segs"]:
        px = g["styles"][0]["size"] * 5 * g["scale"]; lo = min(lo, g["y"] - px * g["lines"] * 0.6); hi = max(hi, g["y"] + px * g["lines"] * 0.6)
    return lo, hi
cats = a.cat.split(",") if a.cat else None; out = []
for x in SP:
    if cats and x["cat"] not in cats: continue
    n = len(x["segs"])
    if a.segs and n < a.segs: continue
    if a.chars and max(g["n"] for g in x["segs"]) < a.chars: continue
    if a.dur and x["dur"] > a.dur: continue
    lo, hi = box(x); mid = (lo + hi) / 2
    band = "above" if mid < 700 else "mid" if mid < 1100 else "lower"
    if a.band != "any" and band != a.band: continue
    dy = 0
    if hi > 1250: dy = 1250 - hi
    if lo + dy < 250: dy = 250 - lo
    ok = lo + dy >= 250 and hi + dy <= 1250
    score = (0 if n == (a.segs or n) else 1, 0 if ok else 1, abs(max(g["n"] for g in x["segs"]) - a.chars) if a.chars else 0, -x.get("real", {}).get("proj", 0))
    out.append((score, x, round(lo), round(hi), band, round(dy), ok))
out.sort(key=lambda t: t[0])
pool = [t for t in out if t[0] == out[0][0]] if out else []
if a.seed and len(pool) > a.top: random.Random(a.seed).shuffle(pool)
pick = (pool[: a.top] + [t for t in out if t not in pool][: max(0, a.top - len(pool))]) if out else []
if not pick: print("没有符合的预设：放宽 --segs / --chars / --band，或换一个 --cat（--list-cats 看全部）")
for s, x, lo, hi, band, dy, ok in pick:
    beat = {"kind": "cap-preset", "props": {"preset": x["id"], "texts": ["…"] * len(x["segs"]), "at": 0}}
    if dy: beat["props"]["dy"] = dy
    an = sorted({g[k]["name"] for g in x["segs"] for k in ("in", "out") if g[k]})
    print(f"{x['id']}  {x['name']}  {len(x['segs'])}段  每段字数{[g['n'] for g in x['segs']]}  位置{band}(y{lo}–{hi})  {x['dur']}s  dy={dy}{'' if ok else ' ⚠放不进安全区'}  动画:{'/'.join(an[:4])}  真实使用:{x.get('real', {}).get('n', 0)}次/{x.get('real', {}).get('proj', 0)}个工程")
    print("   ", json.dumps(beat, ensure_ascii=False))
