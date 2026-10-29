#!/usr/bin/env python3
"""不遮脸检查：edit.json × face_track.py 的人脸时间线 → 每个特效在它出现的时间里（头 = 发顶到下巴），有没有压到头 / 脸；有就给出「头顶上方」或「下巴下面」的建议 y。
用法：python3 place_check.py edit.json face.json [--fix]   （--fix 把建议 y 直接写回 edit.json；默认只报告）
假设：视频从 0 秒开始播（src 没有裁切）；字幕占 y≈1190–1290，所以下方空位只算到 1180。
只检查有位置参数的版式：y / yMid / top（chest-big 等没有这些参数的不查，报「未检查」）。"""
import json, os, sys
ed_path, face_path = sys.argv[1], sys.argv[2]; fix = "--fix" in sys.argv
ed = json.load(open(ed_path)); face = json.load(open(face_path))
Y0 = 0.38 * 1920
cuts, zoom, shift = ed.get("cuts", []), ed.get("zoom", [1.0, 1.12]), ed.get("shiftY", 0)
def cam(t):                # 和 Edit.tsx 一样：reframe 窗口内 0.2 秒缓入缓出
    z0 = zoom[1] if len([c for c in cuts if c <= t]) % 2 else zoom[0]; z, s = z0, shift
    for r in ed.get("reframe", []):
        if t <= r["at"] or t >= r["until"]: continue
        k = min(1, (t - r["at"]) / 0.2, (r["until"] - t) / 0.2); k = k * k * (3 - 2 * k)
        if "zoom" in r: z += (r["zoom"] - z0) * k
        if "shiftY" in r: s += (r["shiftY"] - shift) * k
    return z, s
def head(t, f):          # 脸框 → 头（发顶 ~ 下巴下 0.2h）在成片里的纵向范围、横向范围
    z, s = cam(t); top = f["y"] - 0.55 * f["h"]; bot = f["y"] + f["h"] * 1.05
    m = lambda y: Y0 + (y - Y0) * z + s
    return m(top), m(bot)
# kind → (位置参数, 模式, 高度估计)
POS = {"title-tag": ("y", "top", 140), "huge-caption": ("y", "mid", 200), "pixel-text": ("y", "mid", 220), "prompt-box": ("y", "top", 100), "counter-slam": ("top", "top", 230),
       "glass-chart": ("y", "mid", 440), "compare-tiles": ("y", "mid", 520), "stamp": ("y", "mid", 220), "kinetic-line": ("y", "mid", 200),
       "chat-dm": ("y", "mid", 160), "slot-row": ("y", "mid", 140), "end-cta": ("cy", "mid", 160), "drop-text": ("y", "mid", 200)}
bad = 0
CAP = {x["id"]: x for x in json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "remotion/craft/caption-presets.json"), encoding="utf-8"))}
def check_cap(i, b):
    """字幕样式预设：按规格里每段的位置 / 字号算出占的纵向范围，和同一时间的头比。"""
    global bad
    p = b["props"]; sp = CAP.get(p["preset"])
    if not sp: print(f"  beats[{i}] cap-preset: 没有这个预设 {p['preset']}"); return
    at, dy, k = p.get("at", 0), p.get("dy", 0), p.get("k", 1); worst = None; lo_all, hi_all = 1e9, -1e9; ht_all, hb_all = 1e9, -1e9
    for g in sp["segs"]:
        a, u = at + g["start"], at + g["start"] + g["dur"]; px = g["styles"][0]["size"] * 5 * g["scale"] * k
        lo, hi = g["y"] + dy - px * g["lines"] * 0.6, g["y"] + dy + px * g["lines"] * 0.6
        fs = [head(f["t"], f) for f in face if a <= f["t"] <= u]
        if not fs: continue
        ht, hb = min(x[0] for x in fs), max(x[1] for x in fs); lo_all, hi_all = min(lo_all, lo), max(hi_all, hi); ht_all, hb_all = min(ht_all, ht), max(hb_all, hb)
        if lo < hb and hi > ht: worst = (lo, hi, ht, hb)
    # 安全区（y 250–1250）：很多字幕预设本来是「下三分之一字幕」，y≈1300，压在字幕带 / 互动按钮上
    flo = min(g["y"] + dy - g["styles"][0]["size"] * 5 * g["scale"] * k * g["lines"] * 0.6 for g in sp["segs"]); fhi = max(g["y"] + dy + g["styles"][0]["size"] * 5 * g["scale"] * k * g["lines"] * 0.6 for g in sp["segs"])
    if fhi > 1250 or flo < 250:
        sd = (1250 - fhi) if fhi > 1250 else (250 - flo); bad += 1
        print(f"  beats[{i}] cap-preset {p['preset']}: ✗ 超出安全区（字 y{flo:.0f}–{fhi:.0f}，要在 250–1250）→ 建议 dy={round(dy + sd)}")
        if fix: p["dy"] = round(dy + sd); dy = p["dy"]
    if lo_all > hi_all: print(f"  beats[{i}] cap-preset {p['preset']}: 这段时间没测到脸，未检查"); return
    if not worst: print(f"  beats[{i}] cap-preset {p['preset']}: ✓ 不遮脸"); return
    bad += 1; shift = hb_all + 10 - lo_all; msg = f"  beats[{i}] cap-preset {p['preset']}: ✗ 压到头（字 y{worst[0]:.0f}–{worst[1]:.0f}，头 y{worst[2]:.0f}–{worst[3]:.0f}）"
    if hi_all + shift <= 1180:
        msg += f" → 建议 dy={round(dy + shift)}（整体移到下巴下面）"
        if fix: p["dy"] = round(dy + shift)
    else: msg += " → 放不下：用 k 缩小、reframe 收紧构图，或换一个字少 / 位置高的预设"
    print(msg)
for i, b in enumerate(ed.get("beats", [])):
    k, p = b["kind"], b["props"]
    if k == "cap-preset": check_cap(i, b); continue
    if k not in POS: print(f"  beats[{i}] {k}: 未检查（没有 y 参数）"); continue
    name, mode, h = POS[k]; y = p.get(name)
    if y is None: print(f"  beats[{i}] {k}: 没写 {name}，用默认位置，未检查"); continue
    a, u = p.get("at", 0), p.get("until", p.get("at", 0) + 1.5)
    h = h * p.get("scale", 1)      # 有 scale（缩放）的版式按缩放后的高度算
    lo, hi = (y, y + h) if mode == "top" else (y - h / 2, y + h / 2)
    fs = [(f["t"], head(f["t"], f)) for f in face if a <= f["t"] <= u]
    if not fs: print(f"  beats[{i}] {k}: 这段时间没测到脸，未检查"); continue
    ht = min(x[1][0] for x in fs); hb = max(x[1][1] for x in fs)
    hit = lo < hb and hi > ht
    if not hit: print(f"  beats[{i}] {k}: ✓ 不遮脸（字 y{lo:.0f}–{hi:.0f}，头 y{ht:.0f}–{hb:.0f}）"); continue
    bad += 1
    up = ht - 10 - h >= 250; dn = hb + 10 + h <= 1180
    cand = []
    if up: cand.append(("头顶上方", ht - 10 - h))
    if dn: cand.append(("下巴下面", hb + 10))
    msg = f"  beats[{i}] {k}: ✗ 压到头（字 y{lo:.0f}–{hi:.0f}，头 y{ht:.0f}–{hb:.0f}）"
    if cand:
        pick = min(cand, key=lambda c: abs(c[1] - lo)); newy = round(pick[1] if mode == "top" else pick[1] + h / 2)
        msg += f" → 建议 {name}={newy}（{pick[0]}）"
        if fix: p[name] = newy
    else: msg += " → 上下都放不下：用 behind（字在人后）或 reframe 腾位置（SKILL.md §3.2b）"
    print(msg)
if fix: json.dump(ed, open(ed_path, "w"), ensure_ascii=False, indent=1); print("已写回", ed_path)
sys.exit(1 if bad else 0)
