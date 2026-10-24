#!/usr/bin/env python3
"""字幕：把「校对后的文字」对齐到 whisper 的逐字时间，切成每行 ≤12 字的字幕 → JSON（可直接放进 edit.json 的 captions）。
用法：
  python3 tools/make_captions.py --words clip.json --text clip.txt [--offset 18.45] [--max 12] [--out captions.json] [--find 销冠 "me time"]
    --words   whisper 的 json（要带 word_timestamps：segments[].words[].{word,start,end}）
    --text    校对后的整段文字（一个文件；标点用来断句，没有标点也行）
    --offset  这一段在成片里的起点（秒）。多条素材拼接时，第 2 条填第 1 条的长度
    --length  这段素材在成片里的长度（秒）。拼接多条素材时填，避免上一条的字幕溢进下一条
    --max     每行最多多少「字宽」（中文 1，英文字母 / 数字 0.55，空格 0.3）。默认 12 —— SKILL.md 的安全区规则
    --find    打印这些词在成片里的开始 / 结束时间（给版式 / 重点词定时间用）
原理：把识别出的字和校对后的字做序列对齐（difflib）。对得上的字直接用识别的时间；被改过的字（例如识别成「秘态」、你校对成「me time」）
在前后对得上的字之间平均分配时间。所以：字幕的时间是「他讲那个字的时间」，字是「校对后的字」。
限制：识别错得很多（整句漏听 / 多听）的地方，时间只能估；没有验证过英文单词内部的时间（按字母平均分）。
"""
import argparse, difflib, json, re, sys
try:
    import jieba; jieba.setLogLevel(60)       # 可选依赖：有就用分词决定在哪里断行，没有就按字断（可能把词切开）
except Exception:
    jieba = None

PUNCT = "，。！？、；：,.!?;:…—“”\"'‘’（）()《》[]【】 \t\n\r"
BREAK = "，。！？、；：,.!?;:…"

def width(ch): return 0.3 if ch == " " else 0.55 if re.match(r"[A-Za-z0-9%&@.\-+/]", ch) else 1.0

def asr_chars(words):
    """识别结果 → 每个字一个 (字, 开始, 结束)。多字的词（英文 / 数字）把时间平均分给每个字符。"""
    out = []
    for w in words:
        t = w["word"].strip()
        t = "".join(c for c in t if c not in PUNCT)
        if not t: continue
        s, e = float(w["start"]), float(w["end"])
        if e <= s: e = s + 0.05 * len(t)
        step = (e - s) / len(t)
        for i, c in enumerate(t): out.append((c.lower(), s + i * step, s + (i + 1) * step))
    return out

def align(text, asr):
    """校对后的每个字 → (开始, 结束)。返回 [(字, 原文下标, 开始, 结束)]（不含标点）。"""
    ref = [(i, c) for i, c in enumerate(text) if c not in PUNCT]
    a = "".join(c for c, _, _ in asr); b = "".join(c.lower() for _, c in ref)
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    times = [None] * len(ref)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1): times[j1 + k] = (asr[i1 + k][1], asr[i1 + k][2])
        elif tag == "replace" and i2 > i1:                       # 被改过的字：用被替换那一段识别的时间，平均分
            s, e = asr[i1][1], asr[i2 - 1][2]; n = j2 - j1
            for k in range(n): times[j1 + k] = (s + (e - s) * k / n, s + (e - s) * (k + 1) / n)
    # 还没有时间的（插入的字）：在前后有时间的字之间平均分
    k = 0
    while k < len(times):
        if times[k] is None:
            j = k
            while j < len(times) and times[j] is None: j += 1
            lo = times[k - 1][1] if k > 0 else (times[j][0] - 0.1 * (j - k) if j < len(times) else 0.0)
            hi = times[j][0] if j < len(times) else lo + 0.1 * (j - k)
            n = j - k
            for m in range(n): times[k + m] = (lo + (hi - lo) * m / n, lo + (hi - lo) * (m + 1) / n)
            k = j
        else: k += 1
    return [(c, i, times[n][0], times[n][1]) for n, (i, c) in enumerate(ref)]

def split_clause(chars, mx):
    """一个分句 → 若干行，每行宽度 ≤ mx。只在「词边界」断行（有 jieba 用分词；没有就每个字后面都可以断，但不在英文单词 / 数字中间断），
    用动态规划让各行长度尽量均匀。"""
    ws = [width(c[0]) for c in chars]; total = sum(ws)
    if total <= mx: return [chars]
    n = int(-(-total // mx)); target = total / n
    txt = "".join(c[0] for c in chars)
    cut = {0, len(chars)}
    if jieba:
        pos = 0
        for tok in jieba.lcut(txt):
            pos += len(tok); cut.add(pos)
    else:
        for k in range(1, len(chars)):
            if not (re.match(r"[A-Za-z0-9%]", txt[k - 1]) and re.match(r"[A-Za-z0-9%]", txt[k])): cut.add(k)
    cut = sorted(cut)
    def w(a, b): return sum(ws[a:b])
    INF = float("inf"); best = {0: (0.0, [0])}
    for b in cut[1:]:
        cand = []
        for a in cut:
            if a >= b or a not in best: continue
            if w(a, b) > mx + 1e-6: continue
            lines_so_far = len(best[a][1])
            if lines_so_far >= n + 1: continue
            cost = best[a][0] + (w(a, b) - target) ** 2
            cand.append((cost, best[a][1] + [b]))
        if cand: best[b] = min(cand, key=lambda x: (len(x[1]), x[0]))
    if len(chars) not in best:                                   # 有超长的词放不下：退回按字断
        idx = [0]; acc = 0.0
        for k, x in enumerate(ws):
            acc += x
            if acc > mx: idx.append(k); acc = x
        idx.append(len(chars)); return [chars[a:b] for a, b in zip(idx, idx[1:]) if b > a]
    path = best[len(chars)][1]
    return [chars[a:b] for a, b in zip(path, path[1:])]

def build(text, asr, offset, mx, length=None):
    chars = align(text, asr)
    # 按原文标点断句
    clauses, cur, last = [], [], -1
    for ch in chars:
        i = ch[1]
        if cur and any(c in BREAK for c in text[last + 1:i]): clauses.append(cur); cur = []
        cur.append(ch); last = i
    if cur: clauses.append(cur)
    lines = [l for cl in clauses for l in split_clause(cl, mx)]
    caps = []
    for k, ln in enumerate(lines):
        t0 = ln[0][2]; t1 = ln[-1][3]
        nxt = lines[k + 1][0][2] if k + 1 < len(lines) else None
        end = (nxt if nxt is not None and nxt - t1 < 0.6 else t1 + 0.25)      # 下一句紧接着就一直挂到下一句开始；有停顿就收在讲完后 0.25 秒
        raw = text[ln[0][1]: ln[-1][1] + 1]
        shown = re.sub(r"\s+", " ", "".join(ch for ch in raw if ch not in BREAK)).strip()      # 保留英文 / 中文之间的空格，去掉标点
        end = min(end, length) if length else end
        caps.append(dict(**{"from": round(t0 + offset, 2), "to": round(end + offset, 2)}, text=shown))
    return caps, chars

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--words", required=True); ap.add_argument("--text", required=True)
    ap.add_argument("--offset", type=float, default=0.0); ap.add_argument("--max", type=float, default=12.0)
    ap.add_argument("--out"); ap.add_argument("--find", nargs="*", default=[])
    ap.add_argument("--length", type=float, default=None, help="这段素材在成片里的长度（秒）；字幕不会超出它，拼接多条素材时必填")
    a = ap.parse_args()
    d = json.load(open(a.words, encoding="utf-8"))
    words = [w for s in d["segments"] for w in s.get("words", [])]
    if not words: sys.exit("whisper 的 json 里没有逐字时间：转写时要加 --word-timestamps True")
    text = open(a.text, encoding="utf-8").read().strip()
    caps, chars = build(text, asr_chars(words), a.offset, a.max, a.length)
    for kw in a.find:
        k = "".join(c for c in kw if c not in PUNCT).lower(); s = "".join(c.lower() for c, *_ in chars)
        p = s.find(k)
        print(f"{kw!r}: " + ("没找到" if p < 0 else f"{chars[p][2] + a.offset:.2f}–{chars[p + len(k) - 1][3] + a.offset:.2f} 秒"), file=sys.stderr)
    out = json.dumps(caps, ensure_ascii=False, indent=1)
    if a.out: open(a.out, "w", encoding="utf-8").write(out); print(f"{len(caps)} 条字幕 → {a.out}", file=sys.stderr)
    else: print(out)

if __name__ == "__main__": main()
