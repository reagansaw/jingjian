#!/usr/bin/env python3
"""检查「字在人后」时字被人遮住了多少。字必须一眼读得清：人只能遮住「一点点」。
用法：python3 check_text_visible.py <抠像目录> <起始帧> <结束帧> <x0> <y0> <x1> <y1> [--step 5]
  <x0 y0 x1 y1> = 字块在**视频坐标**（1080×1920，和抠像 PNG 同一个坐标系）里的矩形。
输出：这个矩形里被抠像（人，alpha>128）盖住的比例 —— 平均 / 最大 / 超标的帧数。
判定（经验阈值，不是原包数据）：平均 ≤20% 且 最大 ≤30% = 通过；超过就把字挪开 / 放大 / 给字腾头顶空间（Headroom）。
依赖 Pillow。"""
import os, sys
from PIL import Image
args = [a for a in sys.argv[1:] if not a.startswith("--")]
step = int(sys.argv[sys.argv.index("--step") + 1]) if "--step" in sys.argv else 5
d, f0, f1, x0, y0, x1, y1 = args[0], int(args[1]), int(args[2]), *map(int, args[3:7])
if "--step" in sys.argv: args = [a for a in args if a != str(step)]
area = (x1 - x0) * (y1 - y0); vals = []
for k in range(f0, f1 + 1, step):
    p = os.path.join(d, f"{k}.webp")
    if not os.path.exists(p): continue
    a = Image.open(p).convert("RGBA").getchannel("A").crop((x0, y0, x1, y1))
    covered = a.point(lambda v: 255 if v > 128 else 0).histogram()[255]
    vals.append(100.0 * covered / area)
if not vals: sys.exit("没有找到抠像帧")
mean, mx = sum(vals) / len(vals), max(vals)
ok = mean <= 20 and mx <= 30
print(f"字块 ({x0},{y0})–({x1},{y1})，{len(vals)} 帧：被人遮住 平均 {mean:.1f}% · 最大 {mx:.1f}% · 超过 30% 的帧 {sum(1 for v in vals if v > 30)} 个 → {'通过 ✓' if ok else '不通过 ✗（字被遮得太多，或完全没被遮）'}")
if mean < 3: print("  提示：几乎没有遮挡 → 看不出「字在人后」的层次，可以把字再往人这边靠一点（目标：平均 8–20%）。")
