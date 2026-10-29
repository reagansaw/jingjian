// craft/ui-data — 「数据 / 卡片 / 面板」类特效（参考演示片逐帧观察，素材全部去掉重写）。时间都是成片里的绝对秒。
import React from 'react';
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import { SAFE, Theme, useT, FitBox } from './kit';

const C = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const H = 1920;
const oc = Easing.out(Easing.cubic), ioc = Easing.inOut(Easing.sin);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const fade = (t: number, a: number, b: number, fi = 0.1, fo = 0.15) => interpolate(t, [a, a + fi, b - fo, b], [0, 1, 1, 0], C);
const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(22px) saturate(1.3)', WebkitBackdropFilter: 'blur(22px) saturate(1.3)', border: '1.5px solid rgba(255,255,255,0.28)', boxShadow: '0 18px 50px rgba(0,0,0,0.35)' };
const fmt = (v: number, d: number) => v.toFixed(d);

/** 玻璃图表（参考 5.0–6.0 秒）：毛玻璃卡 1–2 帧淡入放大；左上标签，右上大数字用正弦缓动从 from 数到 to（0.8 秒）；下方折线图左→右画出，末端带发光点。
 *  数据曲线 pts 为 0–1 的相对高度（默认一条上升线）。 */
export const GlassChart: React.FC<{ th: Theme; label: string; from: number; to: number; unit?: string; decimals?: number; at: number; until: number; y?: number; pts?: number[]; scale?: number }> = ({ th, label, from, to, unit = '', decimals = 1, at, until, y = 1010, scale = 1, pts = [0.1, 0.16, 0.14, 0.26, 0.33, 0.3, 0.46, 0.6, 0.57, 0.78, 0.95] }) => {
  const t = useT();
  if (t < at || t > until + 0.2) return null;
  const lt = t - at, o = fade(t, at, until, 0.06, 0.15), k = interpolate(lt, [0.1, 0.9], [0, 1], { ...C, easing: ioc }), v = from + (to - from) * k;
  const cw = 860, ch = 440, x0 = 60, cy = y - ch / 2, gw = cw - 80, gh = 190, gx = 40, gy = ch - 50;
  const n = pts.length, prog = interpolate(lt, [0.15, 0.95], [0, n - 1], { ...C, easing: Easing.inOut(Easing.quad) });
  const P = (i: number) => [gx + (gw * i) / (n - 1), gy - pts[i] * gh];
  let d = ''; let end = P(0);
  for (let i = 0; i < n; i++) { if (i <= prog) { const [px, py] = P(i); d += `${i ? 'L' : 'M'}${px},${py} `; end = [px, py]; } else if (i - 1 < prog) { const [ax, ay] = P(i - 1), [bx, by] = P(i), f = prog - (i - 1); end = [ax + (bx - ax) * f, ay + (by - ay) * f]; d += `L${end[0]},${end[1]} `; } }
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
      <div style={{ position: 'absolute', left: x0, top: cy, width: cw, height: ch, borderRadius: 40, ...glass, transform: `scale(${scale * interpolate(lt, [0, 0.07], [0.94, 1], C)})`, transformOrigin: '50% 50%' }}>
        <div style={{ position: 'absolute', left: 40, top: 32, fontFamily: th.fonts.body, fontSize: 34, color: 'rgba(255,255,255,0.8)' }}>{label}</div>
        <div style={{ position: 'absolute', right: 40, top: 14, fontFamily: th.fonts.display, fontSize: 104, color: '#fff', textShadow: '0 4px 18px rgba(0,0,0,0.4)' }}>{fmt(v, decimals)}<span style={{ fontSize: 46, marginLeft: 6 }}>{unit}</span></div>
        <svg width={cw} height={ch} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <path d={d} fill="none" stroke="#35E07A" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 10px rgba(53,224,122,0.8))' }} />
          <circle cx={end[0]} cy={end[1]} r={10} fill="#fff" style={{ filter: 'drop-shadow(0 0 12px #35E07A)' }} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

/** 对比数字牌（参考 6.0–7.0 / 11.25–12.25 秒）：两块牌「以前 / 现在」。以前＝固定值；现在＝从 from 缓入缓出数到 to，数完后牌变强调色并在下面淡入结论句（如「省下 98% 时间」）。
 *  区别于 GlassChart：这是并排两个数的对比。dir='down' 数字下降，'up' 上升（用于「3.6 万 → 14.5 万」）。 */
export const CompareTiles: React.FC<{ th: Theme; chip?: string; beforeLabel?: string; afterLabel?: string; before: number; to: number; unit?: string; decimals?: number; verdict?: string; at: number; until: number; y?: number; from?: number; scale?: number }> = ({ th, chip, beforeLabel = '以前', afterLabel = '现在', before, to, unit = '', decimals = 0, verdict, at, until, y = 1020, from, scale = 1 }) => {
  const t = useT();
  if (t < at || t > until + 0.25) return null;
  const lt = t - at, o = fade(t, at, until, 0.15, 0.2), s = from ?? before, k = interpolate(lt, [0.25, 0.95], [0, 1], { ...C, easing: ioc }), v = s + (to - s) * k, done = k >= 1;
  const rise = interpolate(lt, [0, 0.3], [60, 0], { ...C, easing: oc });
  const Tile = ({ x, label, val, hot }: { x: number; label: string; val: string; hot?: boolean }) => (
    <div style={{ position: 'absolute', left: x, top: 90, width: 440, height: 250, borderRadius: 36, ...glass, background: hot ? th.accent : glass.background as string, border: hot ? 'none' : glass.border }}>
      <div style={{ position: 'absolute', left: 30, top: 22, fontFamily: th.fonts.body, fontSize: 34, color: hot ? th.onAccent : 'rgba(255,255,255,0.75)' }}>{label}</div>
      <div style={{ position: 'absolute', left: 30, bottom: 18, fontFamily: th.fonts.display, fontSize: 120, lineHeight: 1, color: hot ? th.onAccent : '#fff', whiteSpace: 'nowrap' }}>{val}<span style={{ fontSize: 44, marginLeft: 6 }}>{unit}</span></div>
    </div>
  );
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
      <div style={{ position: 'absolute', left: 50, top: y - 200, width: 980, height: 520, transform: `translateY(${rise}px) scale(${scale})`, transformOrigin: '50% 40%' }}>
        {chip && <div style={{ position: 'absolute', left: 6, top: 6, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 30, padding: '4px 22px', fontFamily: th.fonts.body, fontSize: 30, color: '#fff' }}>{chip}</div>}
        <Tile x={0} label={beforeLabel} val={fmt(before, decimals)} />
        <Tile x={500} label={afterLabel} val={fmt(v, decimals)} hot={done} />
        {verdict && <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontFamily: th.fonts.display, fontSize: 70, color: th.accent, opacity: interpolate(lt, [0.95, 1.15], [0, 1], C), textShadow: '0 4px 16px rgba(0,0,0,0.5)' }}><FitBox yMid={y + 220} style={{}}>{verdict}</FitBox></div>}
      </div>
    </AbsoluteFill>
  );
};

/** 快门卡（参考 4.25–5.0 秒）：整屏轻微蒙雾（去饱和变亮），拍立得卡片（白边 + 阴影 + ±8–10° 旋转）一张张从角落 / 顶部飞入，冲过头（大→小）后落定，间隔 ~0.27 秒。
 *  cards 里每项是相对位置（0–1 屏宽 / 屏高）和旋转角；图片用 srcs（public 里的路径），不给就画纯色占位块。 */
export const PhotoCards: React.FC<{ th: Theme; srcs?: string[]; at: number; until: number; slots?: { x: number; y: number; r: number; from: 'l' | 'r' | 't' | 'b' }[]; w?: number; haze?: boolean; gap?: number }> = ({ th, srcs = [], at, until, slots, w = 300, haze = true, gap = 0.27 }) => {
  const t = useT();
  if (t < at || t > until + 0.25) return null;
  const S = slots ?? [{ x: 0.2, y: 0.22, r: -9, from: 'l' }, { x: 0.8, y: 0.22, r: 8, from: 'r' }, { x: 0.5, y: 0.17, r: -2, from: 't' }];
  const o = fade(t, at, until, 0.1, 0.2), lt = t - at;
  const COL = ['#F2B84B', '#7FB7E8', '#E58F8F', '#9AD6A5', '#C6A5E8'];
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {haze && <AbsoluteFill style={{ background: 'rgba(235,235,240,0.2)', opacity: o }} />}
      <AbsoluteFill style={{ opacity: o }}>
        {S.map((s, i) => {
          const u = (lt - i * gap) / 0.38; if (u < 0) return null;
          const k = interpolate(u, [0, 1], [0, 1], { ...C, easing: Easing.out(Easing.back(1.7)) }), sc = interpolate(u, [0, 0.7, 1], [1.5, 1.04, 1], C);
          const dx = s.from === 'l' ? -1 : s.from === 'r' ? 1 : 0, dy = s.from === 't' ? -1 : s.from === 'b' ? 1 : 0;
          const px = s.x * 1080 + dx * (1 - Math.min(1, k)) * 700, py = s.y * H + dy * (1 - Math.min(1, k)) * 600;
          const h = w * 1.25, src = srcs[i % Math.max(1, srcs.length)];
          return (
            <div key={i} style={{ position: 'absolute', left: px - w / 2, top: py - h / 2, width: w, height: h, background: '#fff', padding: 14, boxSizing: 'border-box', borderRadius: 8, boxShadow: '0 16px 36px rgba(0,0,0,0.45)', transform: `rotate(${s.r * Math.min(1.4, 1 + (1 - Math.min(1, u)) * 0.4)}deg) scale(${sc})`, opacity: Math.min(1, u * 5) }}>
              {src ? <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 3 }} /> : <div style={{ width: '100%', height: '100%', background: COL[i % COL.length], borderRadius: 3 }} />}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 头旁贴纸（参考 7.0–7.75 秒）：一块小白边卡（或手机缩略图）旋转 −6° 飞到头的左边，稍后右边弹出白色数字贴纸（先模糊后清晰、带轻微回弹）和一个小红标签。 */
export const SideSticker: React.FC<{ th: Theme; value: string; tag?: string; src?: string; at: number; until: number; y?: number }> = ({ th, value, tag, src, at, until, y = 640 }) => {
  const t = useT();
  if (t < at || t > until + 0.2) return null;
  const lt = t - at, o = fade(t, at, until, 0.05, 0.2);
  const cardK = interpolate(lt, [0, 0.17], [0, 1], { ...C, easing: oc }), stk = interpolate(lt, [0.3, 0.45], [0, 1], { ...C, easing: Easing.out(Easing.back(2.2)) });
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
      <div style={{ position: 'absolute', left: 60 + (1 - cardK) * -300, top: y - 150, width: 230, height: 300, background: '#fff', padding: 10, boxSizing: 'border-box', borderRadius: 18, boxShadow: '0 16px 36px rgba(0,0,0,0.45)', transform: 'rotate(-6deg)' }}>
        {src ? <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} /> : <div style={{ width: '100%', height: '100%', borderRadius: 10, background: 'linear-gradient(160deg,#EDE6D6,#B9A98A)' }} />}
      </div>
      <div style={{ position: 'absolute', right: 70, top: y - 80, opacity: stk, transform: `scale(${0.7 + 0.3 * stk}) rotate(4deg)`, filter: `blur(${(1 - stk) * 8}px)` }}>
        <div style={{ background: '#fff', borderRadius: 18, padding: '8px 28px', fontFamily: th.fonts.display, fontSize: 84, color: '#111', boxShadow: '0 12px 30px rgba(0,0,0,0.4)' }}>{value}</div>
        {tag && <div style={{ position: 'absolute', left: -18, top: -26, background: th.accent2, color: '#fff', borderRadius: 8, padding: '2px 14px', fontFamily: th.fonts.body, fontSize: 26 }}>{tag}</div>}
      </div>
    </AbsoluteFill>
  );
};

/** 粒子装满（参考 10.5–11.25 秒）：上方滑下奶油色面板，里面有细黑线 U 形容器 + 红色标题；橙色小颗粒带重力落进去、堆满，约 1 秒装满。
 *  确定性物理：每颗粒子的落点用种子随机定，堆叠高度按列计算，不用物理引擎，帧间无状态。 */
export const ParticleFill: React.FC<{ th: Theme; title: string; at: number; until: number; count?: number; panelH?: number; color?: string }> = ({ th, title, at, until, count = 70, panelH = 820, color }) => {
  const t = useT();
  if (t < at || t > until + 0.3) return null;
  const col = color ?? th.accent, lt = t - at, slide = interpolate(lt, [0, 0.25], [-panelH, 0], { ...C, easing: oc }) + interpolate(t, [until, until + 0.25], [0, -panelH], { ...C, easing: Easing.in(Easing.cubic) });
  const bw = 520, bh = 300, bx = (1080 - bw) / 2, by = panelH - bh - 90, cols = 12, cw = bw / cols;
  const parts = Array.from({ length: count }, (_, i) => {
    const t0 = 0.3 + (i / count) * 1.0, col_ = Math.floor(rnd(i) * cols), landIdx = i;       // 按顺序落
    return { i, t0, col_, jx: (rnd(i + 99) - 0.5) * cw * 0.5 };
  });
  const heights = new Array(cols).fill(0), settled: { x: number; y: number; i: number }[] = [], pr = cw * 0.52;
  const items = parts.map((p) => {
    const rest = by + bh - pr - heights[p.col_] * pr * 1.55; heights[p.col_] += 1;
    const x = bx + p.col_ * cw + cw / 2 + p.jx, u = (lt - p.t0) / 0.45;
    return { ...p, x, restY: rest, u };
  });
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 0, top: slide, width: 1080, height: panelH, background: 'linear-gradient(180deg,#F6F0DF,#EFE6CF)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: SAFE.top - 60, zIndex: 5, textAlign: 'center', fontFamily: th.fonts.display, fontSize: 76, color: '#C4302B' }}>{title}</div>
        <div style={{ position: 'absolute', left: bx, top: by, width: bw, height: bh, borderLeft: '5px solid #111', borderRight: '5px solid #111', borderBottom: '5px solid #111', borderRadius: '0 0 28px 28px', boxSizing: 'border-box' }} />
        {items.map((p) => {
          if (p.u < 0) return null;
          const k = Math.min(1, p.u), y = -60 + (p.restY - (-60)) * k * k;
          return <div key={p.i} style={{ position: 'absolute', left: p.x - pr, top: y - pr, width: pr * 2, height: pr * 2, borderRadius: p.i % 3 === 0 ? '50%' : '30%', background: col, transform: `rotate(${rnd(p.i + 7) * 60}deg)` }} />;
        })}
      </div>
    </AbsoluteFill>
  );
};

/** 左右文件（参考 12.25–13.25 秒）：深灰底，白色文件卡从左滑入（~0.17 秒）；标题 + 编号步骤，浅橙色高亮条逐项下移（每项 ~0.55 秒）；人像在右侧（用 Edit 的 zoom/shiftY 把人推到右边）。
 *  这个组件只画左边的文件卡和底；要把人推右，在 edit.json 的 camera 里放一个 `shift-x` 或用 `split` 布局。 */
export const SideDoc: React.FC<{ th: Theme; title: string; items: string[]; at: number; until: number; stepSec?: number; dark?: boolean }> = ({ th, title, items, at, until, stepSec = 0.55, dark = true }) => {
  const t = useT();
  if (t < at || t > until + 0.3) return null;
  const lt = t - at, o = 1 - interpolate(t, [until, until + 0.25], [0, 1], C), slide = interpolate(lt, [0, 0.17], [-700, 0], { ...C, easing: oc });
  const hi = Math.min(items.length - 1, Math.max(0, Math.floor((lt - 0.3) / stepSec))), pos = interpolate(lt - 0.3 - hi * stepSec, [0, 0.1], [0, 1], C);
  const rowH = 124, top0 = 330;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
      {dark && <AbsoluteFill style={{ background: '#222428', opacity: interpolate(lt, [0, 0.12], [0, 1], C) }} />}
      <div style={{ position: 'absolute', left: 36 + slide, top: 250, width: 560, height: 1060, background: '#fff', borderRadius: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.45)', padding: '44px 36px', boxSizing: 'border-box' }}>
        <div style={{ fontFamily: th.fonts.display, fontSize: 64, color: '#16110C', marginBottom: 12 }}>{title}</div>
        <div style={{ height: 8, width: 90, background: th.accent2, borderRadius: 4, marginBottom: 20 }} />
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: -14, right: -14, top: (hi - 1 + pos) * rowH + 4, height: rowH - 12, borderRadius: 18, background: 'rgba(255,170,90,0.35)' }} />
          {items.map((it, i) => (
            <div key={i} style={{ height: rowH, display: 'flex', alignItems: 'center', fontFamily: th.fonts.body, fontSize: 44, color: '#16110C', position: 'relative' }}>
              <span style={{ color: th.accent2, fontFamily: th.fonts.display, marginRight: 16 }}>{i + 1}</span>{it}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** 合集墙（参考 13.25–14.25 秒）：深色底，大白标题 + 橙色药丸；下面 cols×rows 缩略格按列错开 1 帧依次填满（~0.5 秒）。缩略图 srcs 可空（空则用主题色块）。 */
export const ThumbWall: React.FC<{ th: Theme; title: string; pill?: string; srcs?: string[]; cols?: number; rows?: number; at: number; until: number }> = ({ th, title, pill, srcs = [], cols = 5, rows = 4, at, until }) => {
  const t = useT();
  if (t < at || t > until + 0.2) return null;
  const lt = t - at, o = fade(t, at, until, 0.1, 0.2), cw = 176, ch = 250, gx = (1080 - cols * cw - (cols - 1) * 12) / 2;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o, background: 'rgba(24,24,28,0.97)' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: th.fonts.display, fontSize: 108, color: '#fff', opacity: interpolate(lt, [0.15, 0.3], [0, 1], C), transform: `scale(${interpolate(lt, [0.15, 0.3], [0.92, 1], C)})` }}>{title}</div>
      {pill && <div style={{ position: 'absolute', left: 0, right: 0, top: 460, display: 'flex', justifyContent: 'center', opacity: interpolate(lt, [0.3, 0.4], [0, 1], C) }}><div style={{ background: '#E5783A', color: '#fff', borderRadius: 40, padding: '8px 36px', fontFamily: th.fonts.body, fontSize: 40 }}>{pill}</div></div>}
      {Array.from({ length: cols * rows }, (_, k) => {
        const c = k % cols, r = Math.floor(k / cols), u = (lt - 0.5 - c * 0.04 - r * 0.012) / 0.12; if (u < 0) return null;
        const src = srcs[k % Math.max(1, srcs.length)], hue = (k * 37) % 360;
        return <div key={k} style={{ position: 'absolute', left: gx + c * (cw + 12), top: 600 + r * (ch + 12), width: cw, height: ch, borderRadius: 14, overflow: 'hidden', opacity: Math.min(1, u * 2), transform: `scale(${0.8 + 0.2 * Math.min(1, u)})`, background: src ? undefined : `hsl(${hue},35%,38%)` }}>{src && <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}</div>;
      })}
    </AbsoluteFill>
  );
};

/** 留言卡（参考 14.25–15.0 秒，CTA 结尾）：人像缩成圆角卡（74% 宽、偏下）落在深色底上；上面标题淡入上浮，随后橙色药丸弹出。
 *  同样只画底 / 标题 / 药丸，缩小视频用 Edit 的 camera 里 `card` 或 zoom<1 实现。 */
export const CommentCard: React.FC<{ th: Theme; title: string; pill?: string; at: number; until?: number }> = ({ th, title, pill, at, until = 1e9 }) => {
  const t = useT();
  if (t < at || t > until) return null;
  const lt = t - at;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: '#1D1E22', opacity: interpolate(lt, [0, 0.18], [0, 1], C) }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: th.fonts.display, fontSize: 96, color: '#fff', opacity: interpolate(lt, [0.15, 0.3], [0, 1], C), transform: `translateY(${interpolate(lt, [0.15, 0.3], [24, 0], { ...C, easing: oc })}px)` }}><FitBox yMid={340} style={{}}>{title}</FitBox></div>
      {pill && <div style={{ position: 'absolute', left: 0, right: 0, top: 450, display: 'flex', justifyContent: 'center', transform: `scale(${interpolate(lt, [0.4, 0.55], [0.6, 1], { ...C, easing: Easing.out(Easing.back(2)) })})`, opacity: interpolate(lt, [0.4, 0.5], [0, 1], C) }}><div style={{ background: '#E5783A', color: '#fff', borderRadius: 44, padding: '10px 40px', fontFamily: th.fonts.body, fontSize: 46 }}>{pill}</div></div>}
    </AbsoluteFill>
  );
};
