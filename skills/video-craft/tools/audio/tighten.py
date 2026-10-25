#!/usr/bin/env python3
"""精剪：强制对齐到字 → 删重讲 / 口头禅 → 压停顿 → 分段变速 → 响度 → 字幕（一次做完）。
用法：
  python3 tighten.py --src input.mp4 --script script.txt --out tight.mp4 --meta tight.json [--range 0 18.4] [--speed 1.0] [--work work/]

script.txt = 你**校对过**的、原片里真正讲出来的话（一段，标点随意）。标记：
  [重讲或口误]   硬删：这段话从影片里剪掉
  {啊}{啦}{呢}   软删：只有「它和前一个字之间有停顿」才删（连着讲的语气词不删，不然会切到字）
  数字写阿拉伯数字就行（90% → 对齐时自动读成「百分之九十」）；你念得不一样（比如「两千」）就直接写中文。
  英文单词照写。没标记的字全部保留，对齐 = 台词里每个字都要在原声里出现，**多一个少一个都会整段错位**，所以先校对再跑。
输出：
  tight.mp4   精剪后的影片（停顿压掉、变速、每段响度 −16 LUFS）
  tight.json  { dur, subs:[{from,to,text}], cuts:[…], removed, syll_per_sec }
              subs 可以直接放进 edit.json 的 captions；cuts 放进 edit.json 的 cuts（跳切推近的时间点）
停顿规则（字与字之间，时间来自强制对齐，切点落在能量最低处）：
  空隙 > 0.45s：当成「拖音 / 没被转录的 呃~ 嗯~ + 停顿」，从前一字尾音收掉处剪到下一字起音前
  空隙 0.20–0.45s：只剪里面的静音，两边各留 0.05s
依赖：torch / torchaudio / numpy / scipy / pypinyin / jieba（见 setup.sh）+ ffmpeg。没验证过：Windows / Linux。
"""
import argparse, json, os, re, subprocess, sys, difflib
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE); sys.path.insert(0, os.path.dirname(HERE))
from align import align, load_wav, tokens, zh_digits          # noqa: E402
from make_captions import build as build_captions             # noqa: E402

GAPMIN, LONG, KEEP, SILMIN = 0.20, 0.45, 0.05, 0.22

def energy(wav):
    x, sr = load_wav(wav, 16000); hop = 160; n = len(x) // hop
    return 20 * np.log10(np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, 1)) + 1e-9)     # 10ms 一格

def argmin_t(db, a, b):
    i, j = int(round(a * 100)), int(round(b * 100))
    if j <= i: return (a + b) / 2
    return (i + int(np.argmin(db[i:j]))) / 100

def tail_end(db, e, thr):
    for k in range(int(e * 100) + 3, min(len(db) - 1, int(e * 100) + 40)):
        if db[k] < thr: return k / 100 + 0.06
    return e + 0.3

def parse(script):
    """[ ]=删、{ }=软删（有停顿才删）→ (spoken 文字, token 列表, 每个 token 的 True / False / 'soft', 显示文字)"""
    toks, keep, spoken, display = [], [], [], []
    for m in re.finditer(r"\[([^\]]*)\]|\{([^}]*)\}|([^\[\]{}]+)", script.replace("\n", " ")):
        if m.group(1) is not None: seg, k = m.group(1), False
        elif m.group(2) is not None: seg, k = m.group(2), "soft"
        else: seg, k = m.group(3), True
        if k is True: display.append(seg)
        t = tokens(zh_digits(seg)); toks += t; keep += [k] * len(t)
        spoken.append(" ".join(t))
    return " ".join(spoken), toks, keep, "".join(display)

def plan(wav, t0, t1, script, work):
    spoken, toks, keep, display = parse(script)
    al = align(wav, t0, t1, "".join(t if re.match(r"[一-鿿]", t) else f" {t} " for t in toks), cache_dir=work)
    assert len(al) == len(toks), f"对齐出来 {len(al)} 个字，台词里有 {len(toks)} 个：台词和原声对不上，先校对"
    db = energy(wav); i0, i1 = int(t0 * 100), int(t1 * 100)
    lo = np.percentile(db[i0:i1], 10); hi = np.percentile(db[i0:i1], 90); thr = lo + 0.3 * (hi - lo)
    for i, k in enumerate(keep):
        if k == "soft":
            if i == 0: keep[i] = False; continue
            g0, g1 = al[i - 1]["e"], al[i]["s"]
            mn = db[int(g0 * 100): max(int(g0 * 100) + 1, int(g1 * 100))].min()
            keep[i] = not (mn < lo + 0.45 * (hi - lo))                 # 前一字跟它之间掉下去了 = 分得开 → 删
    runs, cur = [], []
    for i, k in enumerate(keep):
        if k: cur.append(i)
        elif cur: runs.append(cur); cur = []
    if cur: runs.append(cur)
    ranges, removed = [], []
    for r in runs:
        first, last = al[r[0]], al[r[-1]]
        prev_i = r[0] - 1
        a = argmin_t(db, al[prev_i]["e"] + 0.03, first["s"] - 0.02) if prev_i >= 0 else max(t0, first["s"] - 0.08)
        nxt = r[-1] + 1
        b = argmin_t(db, last["e"] + 0.02, al[nxt]["s"] - 0.03) if nxt < len(al) else min(t1, max(tail_end(db, last["e"], thr), last["e"] + 0.35))
        if prev_i >= 0: a = max(a, first["s"] - 0.12)
        if nxt < len(al): b = min(b, last["e"] + 0.18)
        cuts = []
        for i, j in zip(r[:-1], r[1:]):
            g0, g1 = al[i]["e"], al[j]["s"]
            if g1 - g0 <= GAPMIN: continue
            if g1 - g0 > LONG:
                c0 = argmin_t(db, g0 + 0.06, min(g0 + 0.22, g1 - 0.1)) + 0.02
                c1 = max(argmin_t(db, max(g1 - 0.30, c0 + 0.05), g1 - 0.03) - 0.02, g1 - 0.12)
            else:
                qi = [k / 100 for k in range(int(g0 * 100) + 3, int(g1 * 100) - 2) if db[k] < thr]
                if not qi: continue
                c0, c1 = qi[0] + KEEP, qi[-1] - KEEP
            if c1 - c0 >= 0.06: cuts.append((c0, c1))
        k, kend = int(first["s"] * 100), int(last["e"] * 100)           # 兜底：对齐把停顿算进某个字时，纯看能量压静音
        while k < kend:
            if db[k] < thr:
                j = k
                while j < kend and db[j] < thr: j += 1
                if (j - k) / 100 >= SILMIN:
                    c0, c1 = k / 100 + KEEP, j / 100 - KEEP
                    if not any(x0 <= c0 <= x1 or x0 <= c1 <= x1 for x0, x1 in cuts): cuts.append((c0, c1))
                k = j
            else: k += 1
        cuts.sort(); merged = []
        for c0, c1 in cuts:
            c0, c1 = max(c0, a + 0.02), min(c1, b - 0.02)
            if c1 - c0 < 0.04: continue
            if merged and c0 <= merged[-1][1]: merged[-1] = (merged[-1][0], max(merged[-1][1], c1))
            else: merged.append((c0, c1))
        seg_a = a
        for c0, c1 in merged:
            ranges.append((round(seg_a, 3), round(c0, 3))); removed.append(c1 - c0); seg_a = c1
        ranges.append((round(seg_a, 3), round(b, 3)))
    assert all(b > a for a, b in ranges) and all(r2[0] >= r1[1] for r1, r2 in zip(ranges, ranges[1:])), "剪出来的区间不递增（对齐不稳），看 --plan 的输出"
    return dict(toks=toks, keep=keep, al=al, ranges=ranges, removed=removed, display=display)

def mapper(ranges, speed):
    def f(t):
        acc = 0.0
        for a, b in ranges:
            if t < a: return acc / speed
            if t <= b: return (acc + t - a) / speed
            acc += b - a
        return acc / speed
    return f

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--src", required=True); ap.add_argument("--script", required=True)
    ap.add_argument("--out", required=True); ap.add_argument("--meta", required=True)
    ap.add_argument("--range", nargs=2, type=float, metavar=("起", "止"), help="只处理原片的这一段（秒），默认全片")
    ap.add_argument("--speed", type=float, default=1.0, help="整段变速（口播太慢 1.05–1.08；本来就快的不要加）")
    ap.add_argument("--maxw", type=float, default=12.0, help="一行字幕最多多少字宽（中文 1、英文数字 0.55、空格 0.3）")
    ap.add_argument("--work", default="work"); ap.add_argument("--plan", action="store_true", help="只看剪点和语速，不输出影片")
    a = ap.parse_args()
    os.makedirs(a.work, exist_ok=True)
    wav = os.path.join(a.work, "src16k.wav")
    if not os.path.exists(wav) or os.path.getmtime(wav) < os.path.getmtime(a.src):
        subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", a.src, "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
    dur_src = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.src]).decode())
    t0, t1 = a.range if a.range else (0.0, dur_src)
    script = open(a.script, encoding="utf-8").read().strip()
    P = plan(wav, t0, t1, script, a.work)
    rng, sp = P["ranges"], a.speed
    dur = sum(b - x for x, b in rng) / sp
    nsyl = sum(2 if re.match(r"[A-Za-z]", t) else 1 for t, k in zip(P["toks"], P["keep"]) if k)
    m = mapper(rng, sp)
    print(f"{len(rng)} 段 · 剪掉 {sum(P['removed']):.1f}s（{len(P['removed'])} 处）→ 成片 {dur:.2f}s · {nsyl / dur:.2f} 音节/秒"
          f"（目标 4.5–5.0；太慢可加 --speed 1.05–1.08，本来就快的别加）")
    # 字幕：用「保留下来的字」在成片里的时间 + 你的显示文字（不含 [ ] { } 里的）
    asr = []
    for t, k, w in zip(P["toks"], P["keep"], P["al"]):
        if not k: continue
        s, e = m(w["s"]), m(w["e"])
        if re.match(r"[A-Za-z]", t):
            step = (e - s) / len(t)
            asr += [(c.lower(), s + i * step, s + (i + 1) * step) for i, c in enumerate(t)]
        else: asr.append((t, s, e))
    caps, _ = build_captions(P["display"], asr, 0.0, a.maxw, dur)
    cut_t = [round(m(r[0]), 3) for r in rng[1:] if True]
    gaps = [rng[i + 1][0] - rng[i][1] for i in range(len(rng) - 1)]
    cuts = [round(m(r[0]), 3) for r, g in zip(rng[1:], gaps) if g >= 0.15]
    meta = dict(dur=round(dur, 3), speed=sp, ranges=rng, removed=[round(x, 3) for x in P["removed"]], subs=caps, cuts=cuts, syll_per_sec=round(nsyl / dur, 2))
    json.dump(meta, open(a.meta, "w"), ensure_ascii=False, indent=1)
    print(f"字幕 {len(caps)} 条 · 剪点 {len(cuts)} 个 → {a.meta}")
    if a.plan: return
    fx = 0.005
    vf = "".join(f"[0:v]trim={x}:{b},setpts=PTS-STARTPTS[v{i}];[0:a]atrim={x}:{b},asetpts=PTS-STARTPTS,afade=t=in:st=0:d={fx},afade=t=out:st={max(0, b - x - fx):.3f}:d={fx}[a{i}];" for i, (x, b) in enumerate(rng))
    vf += "".join(f"[v{i}][a{i}]" for i in range(len(rng))) + f"concat=n={len(rng)}:v=1:a=1[vc][ac];"
    vf += f"[vc]setpts=PTS/{sp},fps=30[vo];[ac]atempo={sp},loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[ao]"
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-threads", "2", "-i", a.src, "-filter_complex", vf, "-map", "[vo]", "-map", "[ao]",
                    "-c:v", "libx264", "-crf", "17", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", a.out], check=True)
    print("→", a.out)

if __name__ == "__main__":
    main()
