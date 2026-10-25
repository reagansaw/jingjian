#!/usr/bin/env python3
"""合成一套原创音效（纯数学合成：正弦 / 噪声 / 滤波 / 包络），没有任何授权问题，可以随库分发。
用法：python3 make_sfx.py [输出目录=sfx]          → 每个音效一个 mp3（44.1kHz 单声道）+ sfx-index.json
      python3 make_sfx.py sfx --audition          → 另外出一条「试听」音轨 audition.mp3（macOS 会用 say 报名字）
依赖：numpy（pip install numpy）+ ffmpeg。
⚠ 这些是合成的，**质量要靠人耳判断**——作者的流程里没有人耳，只量了峰值 / 时长 / 频谱形状。不好听的改这个文件里对应函数的参数，重跑即可。
音量：每个音效峰值归一到 −3 dBFS，响度之间有差别是故意的（重击比提示音大），混进片子时用 sfx-map.json 里的 volume（垫在人声下 ≈ −24 LUFS）。
"""
import json, os, subprocess, sys, wave
import numpy as np

SR = 44100
RNG = np.random.default_rng(7)                 # 固定种子：每次生成一样

# ---------- 基础零件 ----------
def tt(d): return np.arange(int(SR * d)) / SR
def noise(d): return RNG.standard_normal(int(SR * d))
def sine(f, d, ph=0.0): return np.sin(2 * np.pi * f * tt(d) + ph)
def chirp(f0, f1, d, exp=True):
    t = tt(d); k = (f1 / f0) ** (t / d) if exp else None
    if exp:
        ph = 2 * np.pi * f0 * d / np.log(f1 / f0) * ((f1 / f0) ** (t / d) - 1)
    else:
        ph = 2 * np.pi * (f0 * t + (f1 - f0) * t ** 2 / (2 * d))
    return np.sin(ph)
def decay(d, tau): return np.exp(-tt(d) / tau)
def adsr(d, a=0.005, r=0.05, curve=2.0):
    n = int(SR * d); e = np.ones(n); na = min(n, max(1, int(SR * a))); nr = min(n, max(1, int(SR * r)))
    e[:na] = np.linspace(0, 1, na) ** curve; e[-nr:] *= np.linspace(1, 0, nr) ** curve
    return e
def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x))
def sweep_band(x, f0, f1, width=0.5, exp=True):
    """随时间移动的带通（嗖声的核心）。短时傅里叶合成：每帧乘一个以 fc(t) 为中心的高斯带通（width ≈ 标准差，单位倍频程），再重叠相加。
    比「分块带通再拼」平滑得多——后者会产生 ~50Hz 的颤动（听起来是「突突突」）。"""
    n = len(x); N = 1024; H = 256; win = np.hanning(N)
    pad = np.pad(x, (N, N)); out = np.zeros(len(pad)); wsum = np.zeros(len(pad)); fr = np.fft.rfftfreq(N, 1 / SR); lf = np.log2(fr + 1e-9)
    for i in range(0, len(pad) - N, H):
        p = min(1.0, max(0.0, (i - N) / n)); fc = f0 * (f1 / f0) ** p if exp else f0 + (f1 - f0) * p
        mask = np.exp(-0.5 * ((lf - np.log2(fc)) / max(width, 0.05)) ** 2)
        out[i:i + N] += np.fft.irfft(np.fft.rfft(pad[i:i + N] * win) * mask, N) * win; wsum[i:i + N] += win ** 2
    return (out / np.maximum(wsum, 1e-6))[N:N + n]
def lp(x, fc): return band(x, 0, fc)
def hp(x, fc): return band(x, fc, SR / 2 - 1)
def fade(x, i_ms=2, o_ms=8):
    x = x.copy(); a = int(SR * i_ms / 1000); b = int(SR * o_ms / 1000)
    if a: x[:a] *= np.linspace(0, 1, a)
    if b: x[-b:] *= np.linspace(1, 0, b)
    return x
def mix(*parts, n=None):
    n = n or max(len(p) for p, *_ in [(q,) for q in parts]); out = np.zeros(n)
    for p in parts: out[:len(p)] += p[:n]
    return out
def at(x, t0, n):
    out = np.zeros(n); i = int(SR * t0); m = min(len(x), n - i)
    if m > 0: out[i:i + m] = x[:m]
    return out
def reverb(x, tail=0.35, wet=0.25):
    ir = noise(tail) * np.exp(-tt(tail) / (tail / 4)); ir[0] = 0
    y = np.convolve(x, ir[: int(SR * tail)])[: len(x) + int(SR * tail)]
    out = np.zeros(len(y)); out[:len(x)] += x; out += wet * y / (np.abs(y).max() + 1e-9) * np.abs(x).max()
    return out
def norm(x, peak_db=-3.0):
    x = x - np.mean(x); p = np.abs(x).max() + 1e-9
    return x / p * 10 ** (peak_db / 20)
def bell(f, d, tau, partials=((1, 1), (2.76, 0.5), (5.4, 0.25), (8.93, 0.12))):
    return sum(a * sine(f * r, d) * decay(d, tau / (1 + 0.5 * i)) for i, (r, a) in enumerate(partials))

# ---------- 音效（名字 = 用途，别用「像什么」命名）----------
def whoosh_up():   n = noise(0.55); return fade(sweep_band(n, 300, 3500, .6) * adsr(0.55, .35, .12, 1.6), 5, 30)
def whoosh_down(): n = noise(0.55); return fade(sweep_band(n, 3500, 300, .6) * adsr(0.55, .12, .35, 1.6), 5, 30)
def whoosh_short():n = noise(0.28); return fade(sweep_band(n, 500, 4500, .7) * adsr(0.28, .12, .1, 1.5), 3, 20)
def whoosh_long(): n = noise(1.0);  return fade(sweep_band(n, 200, 2600, .8) * adsr(1.0, .55, .3, 1.8), 5, 60)
def swish():       n = noise(0.18); return fade(hp(n, 2500) * adsr(0.18, .08, .08, 1.4), 2, 15)
def pop():         return fade(chirp(900, 220, 0.09) * decay(0.09, .03) + 0.2 * noise(0.09) * decay(0.09, .008), 1, 10)
def click():       return fade(hp(noise(0.03), 1500) * decay(0.03, .004) + sine(2400, 0.03) * decay(0.03, .006) * .4, 0, 5)
def tick():        return fade(sine(1800, 0.05) * decay(0.05, .008) + hp(noise(0.05), 3000) * decay(0.05, .004) * .3, 0, 6)
def tap():         return fade(sine(320, 0.09) * decay(0.09, .02) + lp(noise(0.09), 1500) * decay(0.09, .01) * .5, 1, 8)
def ding():        return fade(bell(1318, 1.1, .35), 1, 120)
def bell_long():   return fade(bell(880, 2.2, .8), 1, 250)
def chime_up():    n = int(SR * 1.5); return mix(at(bell(784, .9, .3), 0, n), at(bell(988, .9, .3), .14, n), at(bell(1318, 1.2, .4), .28, n), n=n)
def success():     n = int(SR * 1.0); return mix(at(bell(659, .6, .22), 0, n), at(bell(988, .8, .3), .12, n), n=n)
def notify():      n = int(SR * 0.6); return mix(at(bell(1568, .3, .1), 0, n), at(bell(2093, .4, .15), .09, n), n=n)
def boom():        n = 1.4; s = sine(48, n) * decay(n, .35) + chirp(140, 38, n) * decay(n, .22) * .8; return fade(s + lp(noise(n), 400) * decay(n, .08) * .5, 1, 120)
def thud():        n = .5; return fade(chirp(160, 50, n) * decay(n, .09) + lp(noise(n), 500) * decay(n, .03) * .4, 1, 40)
def hit():         n = .7; return fade(chirp(220, 60, n) * decay(n, .12) + hp(noise(n), 800) * decay(n, .025) * .6 + sine(90, n) * decay(n, .2) * .5, 1, 60)
def slam():        n = 1.8; y = mix(boom(), at(hp(noise(.4), 1500) * decay(.4, .06) * .6, 0, int(SR * 1.4))); return reverb(y[: int(SR * 1.4)], .4, .3)
def sub_drop():    n = 1.2; return fade(chirp(160, 34, n) * (0.2 + 0.8 * decay(n, .5)), 5, 150)
def punch():       n = .35; return fade(chirp(260, 70, n) * decay(n, .07) + hp(noise(n), 1200) * decay(n, .015) * .5, 0, 25)
def shimmer():     n = 1.3; f = [2093, 2637, 3136, 3951, 4699]; s = sum(sine(x, n) * decay(n, .25 + .05 * i) * adsr(n, .02 + .03 * i, .4, 1.5) for i, x in enumerate(f)); return fade(s, 5, 150)
def flash():       n = .8; return fade(sweep_band(noise(n), 1500, 9000, .5) * adsr(n, .25, .4, 1.5) + sine(3520, n) * decay(n, .15) * .4, 2, 80)
def sweep_light(): n = .7; return fade(chirp(500, 5200, n) * adsr(n, .6, .15, 1.8) * .7 + sweep_band(noise(n), 800, 6000, .5) * adsr(n, .5, .2, 1.8) * .5, 2, 60)
def magic():       n = int(SR * 1.2); arp = [1047, 1319, 1568, 2093, 2637]; return mix(*[at(bell(f, .6, .25, ((1, 1), (2, .3))) * .8, i * .07, n) for i, f in enumerate(arp)], n=n)
def typing():
    n = int(SR * 1.2); out = np.zeros(n)
    for i, tm in enumerate([0, .11, .19, .33, .41, .5, .66, .75, .9, 1.0]):
        k = fade(hp(noise(.03), 1800) * decay(.03, .005) + sine(1200 + 150 * (i % 3), .03) * decay(.03, .005) * .5, 0, 4)
        out += at(k * (0.7 + 0.3 * RNG.random()), tm, n)
    return out
def paper():
    n = int(SR * .9); out = np.zeros(n)
    for tm, d in [(0, .22), (.18, .18), (.4, .25), (.65, .15)]:
        x = band(noise(d), 1500, 7000) * adsr(d, .05, .6 * d, 1.5) * RNG.uniform(.5, 1)
        out += at(x, tm, n)
    return out * np.abs(np.sin(tt(.9) * 90)) ** .3
def camera():
    n = int(SR * .35); return mix(at(click() * .9, 0, n), at(lp(hp(noise(.05), 400), 3500) * decay(.05, .01), .12, n), n=n)
def coin():        n = int(SR * 1.0); return mix(at(bell(2637, .5, .12, ((1, 1), (2.4, .3))), 0, n), at(bell(3520, .8, .2, ((1, 1), (2.4, .3))), .07, n), n=n)
def cash():        n = int(SR * 1.3); return mix(at(click() * 1.2, 0, n), at(hp(noise(.06), 2000) * decay(.06, .02), .05, n), at(bell(2093, 1, .35, ((1, 1), (2.76, .5))), .12, n), at(bell(2637, 1, .4, ((1, 1), (2.76, .5))), .2, n), n=n)
def stamp():       n = int(SR * .5); return mix(at(thud(), 0, n), at(click() * .6, 0, n), n=n)
def riser():       n = 2.0; return fade(sweep_band(noise(n), 200, 7000, .5) * adsr(n, .95, .04, 2.0) + chirp(150, 1200, n) * adsr(n, .95, .04, 2.2) * .25, 5, 40)
def suspense_hit():n = 1.2; return fade(sine(55, n) * decay(n, .5) + chirp(400, 90, n) * decay(n, .15) * .4 + sine(233, n) * decay(n, .6) * .2 + sine(247, n) * decay(n, .6) * .2, 2, 150)
def heartbeat():   n = int(SR * 1.0); k = lambda: fade(chirp(90, 45, .15) * decay(.15, .05), 1, 15); return mix(at(k(), 0, n), at(k() * .7, .22, n), n=n)
def zip_up():      n = .35; return fade(chirp(300, 3000, n) * adsr(n, .7, .1, 1.5) * .5 + hp(noise(n), 2000) * adsr(n, .7, .1, 1.5) * .3, 2, 20)

SFX = {k: v for k, v in dict(
    whoosh_up=whoosh_up, whoosh_down=whoosh_down, whoosh_short=whoosh_short, whoosh_long=whoosh_long, swish=swish,
    pop=pop, click=click, tick=tick, tap=tap, ding=ding, bell_long=bell_long, chime_up=chime_up, success=success, notify=notify,
    boom=boom, thud=thud, hit=hit, slam=slam, sub_drop=sub_drop, punch=punch,
    shimmer=shimmer, flash=flash, sweep_light=sweep_light, magic=magic,
    typing=typing, paper=paper, camera=camera, coin=coin, cash=cash, stamp=stamp, riser=riser, suspense_hit=suspense_hit, heartbeat=heartbeat, zip_up=zip_up,
).items()}
LABEL = dict(whoosh_up="嗖 上扬", whoosh_down="嗖 下落", whoosh_short="短嗖", whoosh_long="长嗖", swish="轻扫", pop="啵", click="点击", tick="嘀", tap="轻敲", ding="叮", bell_long="长铃",
             chime_up="上行风铃", success="成功", notify="提示", boom="轰", thud="闷响", hit="撞击", slam="重砸", sub_drop="低频下沉", punch="拳击", shimmer="闪烁", flash="闪光",
             sweep_light="扫光", magic="魔法", typing="打字", paper="纸张", camera="快门", coin="金币", cash="收银", stamp="印章", riser="升起铺垫", suspense_hit="悬疑重音", heartbeat="心跳", zip_up="拉链上滑")

def write_mp3(x, path):
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    wavp = path[:-4] + ".wav"
    with wave.open(wavp, "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", wavp, "-c:a", "libmp3lame", "-q:a", "2", path], check=True); os.remove(wavp)

def main():
    out = next((a for a in sys.argv[1:] if not a.startswith("--")), "sfx"); os.makedirs(out, exist_ok=True)
    idx = {}
    for name, fn in SFX.items():
        x = norm(fn()); write_mp3(x, f"{out}/{name}.mp3")
        rms = float(np.sqrt(np.mean(x ** 2)))
        idx[name] = dict(label=LABEL[name], dur=round(len(x) / SR, 2), peak_db=round(20 * np.log10(np.abs(x).max()), 1), rms_db=round(20 * np.log10(rms + 1e-9), 1))
    json.dump(idx, open(f"{out}/sfx-index.json", "w"), ensure_ascii=False, indent=1)
    print(f"{len(idx)} 个音效 → {out}/")
    if "--audition" in sys.argv:       # 试听音轨：每个音效前面用 macOS say 报一下名字
        parts = []
        for i, name in enumerate(SFX):
            lab = f"{out}/_lab_{i}.aiff"
            subprocess.run(["say", "-v", "Tingting", "-o", lab, f"{i + 1}，{LABEL[name]}"], check=False)
            parts += [lab, f"{out}/{name}.mp3"]
        lst = os.path.join(out, "_aud.txt")
        fl = "".join(f"[{i}:a]aresample=44100,aformat=channel_layouts=mono[a{i}];" for i in range(len(parts)))
        fl += "".join(f"[a{i}]" + (f"apad=pad_dur=0.6[p{i}];" if False else "") for i in range(0))
        args = sum([["-i", p] for p in parts], [])
        chain = "".join(f"[a{i}]apad=pad_dur=0.7[p{i}];" for i in range(len(parts))) + "".join(f"[p{i}]" for i in range(len(parts))) + f"concat=n={len(parts)}:v=0:a=1[o]"
        subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *args, "-filter_complex", fl + chain, "-map", "[o]", "-c:a", "libmp3lame", "-q:a", "3", f"{out}/audition.mp3"], check=True)
        for i in range(len(SFX)): os.remove(f"{out}/_lab_{i}.aiff")
        print(f"试听音轨 → {out}/audition.mp3")

if __name__ == "__main__": main()
