#!/usr/bin/env python3
"""强制对齐到字：已知台词 + 原声 → 每个字（英文按词）的起止秒。
做法：torchaudio 的 MMS_FA（多语种强制对齐）+ 拼音罗马化；中文一字一 token，英文一词一 token。
比 whisper 自带的「词时间戳」准：台词是你校对过的，不会因为听错字而飘；不会把「呃」洗掉。
用法（库）：from align import align, tokens, zh_digits → align("work/a.wav", t0, t1, "台词")
用法（命令行）：python3 align.py a.wav 0 18.4 "我一个买卖车的朋友 每天出来都看他忙着回复顾客"
依赖：torch、torchaudio（≥2.0）、numpy、scipy、pypinyin（setup.sh 会装）。第一次运行会下载 MMS_FA 模型（约 1.2GB，之后缓存）。
没验证过：Windows / Linux；GPU。不熟的英文单词按字母读（ROMAN 里没有就退到字母），对齐要的是「音像」，不用精准。
"""
import hashlib, json, os, re

# 英文词 → 大概的读音（对齐只要音像）。遇到常用词读不准，往这里加：ROMAN["send"] = "sen"
ROMAN = {"ai": "eiai", "ok": "oukei", "gps": "jipiaisi", "pm": "piaimu", "whatsapp": "wotsap", "follow": "folou", "up": "ap",
         "leads": "lids", "lead": "lid", "sales": "seils", "co": "kou", "broke": "brouk", "me": "mi", "time": "taim", "send": "sen",
         "ebook": "ibuk", "book": "buk", "dm": "dieim", "app": "ep", "vip": "viaipi", "ceo": "sieiou"}

_ZH = "零一二三四五六七八九"

def zh_digits(s):
    """台词里的阿拉伯数字 → 说出来的中文，给对齐用：90% → 百分之九十；2024 → 二零二四（年份读法）；8 → 八；10 → 十；25 → 二十五。
    读法不对（例如你其实念的是「两千零二十四」）→ 在台词里直接写中文数字，别写阿拉伯数字。"""
    def num(n):
        n = int(n)
        if n < 10: return _ZH[n]
        if n < 20: return "十" + (_ZH[n - 10] if n > 10 else "")
        if n < 100: return _ZH[n // 10] + "十" + (_ZH[n % 10] if n % 10 else "")
        if n < 1000: return _ZH[n // 100] + "百" + ("" if n % 100 == 0 else ("零" + _ZH[n % 100] if n % 100 < 10 else num(n % 100)))
        return "".join(_ZH[int(c)] for c in str(n))
    s = re.sub(r"(\d+)\s*%", lambda m: "百分之" + num(m.group(1)), s)
    return re.sub(r"\d+", lambda m: num(m.group(0)), s)

def tokens(spoken):
    """台词 → token 列表：中文逐字、英文逐词；标点和空格丢掉。数字要先用 zh_digits 转成中文。"""
    return [m.group(0) for m in re.finditer(r"[A-Za-z]+|[一-鿿]", spoken)]

def roman(tok):
    from pypinyin import lazy_pinyin
    if re.match(r"[A-Za-z]", tok): return ROMAN.get(tok.lower(), re.sub(r"[^a-z]", "", tok.lower()))
    return re.sub(r"[^a-z]", "", lazy_pinyin(tok)[0].lower()) or "a"

_M = {}
def _model():
    if not _M:
        import torchaudio
        b = torchaudio.pipelines.MMS_FA
        _M.update(model=b.get_model(with_star=False).eval(), tok=b.get_tokenizer(), aligner=b.get_aligner(), sr=b.sample_rate)
    return _M

def load_wav(path, sr=16000):
    import numpy as np, torch, torchaudio
    from scipy.io import wavfile
    fs, x = wavfile.read(path)
    x = x.astype(np.float32)
    if x.ndim > 1: x = x.mean(1)
    x /= (np.abs(x).max() + 1e-9)
    if fs != sr: x = torchaudio.functional.resample(torch.from_numpy(x), fs, sr).numpy()
    return x, sr

def align(wav, t0, t1, spoken, cache_dir=None):
    """→ [dict(tok, s, e, score)]，s / e 是原片里的秒。台词里的 token 必须和说的话一一对应（多一个少一个都会整体错位）。"""
    import numpy as np, torch
    toks = tokens(spoken)
    cache = None
    if cache_dir:
        os.makedirs(cache_dir, exist_ok=True)
        key = hashlib.md5(f"{os.path.abspath(wav)}|{os.path.getmtime(wav)}|{t0}|{t1}|{''.join(toks)}".encode()).hexdigest()[:12]
        cache = os.path.join(cache_dir, f"align_{key}.json")
        if os.path.exists(cache): return json.load(open(cache))
    M = _model(); x, sr = load_wav(wav, M["sr"])
    seg = torch.from_numpy(x[int(t0 * sr): int(t1 * sr)]).unsqueeze(0)
    with torch.inference_mode(): em, _ = M["model"](seg)
    spans = M["aligner"](em[0], M["tok"]([roman(t) for t in toks]))
    ratio = seg.size(1) / em.size(1) / sr
    res = [dict(tok=t, s=round(t0 + sp[0].start * ratio, 3), e=round(t0 + sp[-1].end * ratio, 3), score=round(float(np.mean([z.score for z in sp])), 3)) for t, sp in zip(toks, spans)]
    if cache: json.dump(res, open(cache, "w"), ensure_ascii=False)
    return res

if __name__ == "__main__":
    import sys
    wav, t0, t1, spoken = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
    for r in align(wav, t0, t1, zh_digits(spoken)): print(f'{r["s"]:8.2f}-{r["e"]:8.2f} {r["tok"]:6s} {r["score"]:.2f}')
