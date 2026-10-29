// craft/fx2 — 第三批：镜头层（故障 / 无限画中画 / 手绘圈标 / 形状放大）+ 叠加层（打勾清单 / 杂志封面 / 环绕文字 / 散落文字）。
// 来自一位创作者的「20 个口播特效」演示片，30fps 逐帧拆解后用自己的代码重写；无对方素材、字体、文字。时间都是成片里的绝对秒。
import React from 'react';
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import { Theme, useT } from './kit';

const C = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const W = 1080, H = 1920;
const oc = Easing.out(Easing.cubic), ioc = Easing.inOut(Easing.cubic);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
type Kids = { children: React.ReactNode };

/** 故障（参考 6.9–8.3 秒，30fps）：不是一直抖，而是 2–3 帧的「爆发」，间隔不规律：爆发时画面切成 6–8 条横带，每条横向错位 ±20–70px，同时红 / 青通道左右分离 ~8px，带细扫描线；爆发过后立刻恢复干净画面。
 *  bursts = 每次爆发开始的秒数（每次持续 frames 帧，默认 3；最后一次建议和重点词同帧）。需要把视频复制 3 份（只在爆发那几帧），其余时间只渲 1 份。 */
export const GlitchCam: React.FC<Kids & { bursts: number[]; frames?: number; strength?: number }> = ({ bursts, frames = 3, strength = 1, children }) => {
  const t = useT(), fps = 30, f = Math.round(t * fps);
  const hit = bursts.findIndex((b) => f >= Math.round(b * fps) && f < Math.round(b * fps) + frames);
  if (hit < 0) return <AbsoluteFill>{children}</AbsoluteFill>;
  const seed = hit * 17 + (f - Math.round(bursts[hit] * fps)) * 5, bands = 7;
  const band = (i: number) => ({ y0: (i / bands) * 100, y1: ((i + 1) / bands) * 100, dx: (rnd(seed + i * 3) - 0.5) * 120 * strength });
  const ch = (m: string) => `url(#gl_${m})`;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="gl_r"><feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter>
        <filter id="gl_g"><feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter>
        <filter id="gl_b"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" /></filter>
      </svg>
      {[['r', -9 * strength], ['g', 0], ['b', 9 * strength]].map(([m, dx]) => (
        <AbsoluteFill key={m as string} style={{ mixBlendMode: 'screen', filter: ch(m as string), transform: `translateX(${dx}px)` }}>
          {Array.from({ length: bands }, (_, i) => { const b = band(i); return <AbsoluteFill key={i} style={{ clipPath: `inset(${b.y0}% 0 ${100 - b.y1}% 0)`, transform: `translateX(${b.dx}px)` }}>{children}</AbsoluteFill>; })}
        </AbsoluteFill>
      ))}
      <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 2px, rgba(0,0,0,0) 2px 5px)' }} />
    </AbsoluteFill>
  );
};

/** 无限画中画（参考 16–18 秒）：画面上方出现一个相框（白边 + 细黑边），框里是同一支视频，框里的视频里又有一个更小的相框……（递归 3 层）；
 *  相框 0.2 秒淡入，停住，最后整体镜头向相框里推进（放大 ~4 倍、0.3 秒）再切走。frame = [中心 x, 中心 y, 相框宽]（默认上方居中）。 */
export const DrosteCam: React.FC<Kids & { at: number; until: number; frame?: [number, number, number]; depth?: number }> = ({ at, until, frame = [540, 480, 420], depth = 3, children }) => {
  const t = useT();
  if (t < at || t > until) return <AbsoluteFill>{children}</AbsoluteFill>;
  const [cx, cy, fw] = frame, fh = fw * (H / W), lt = t - at, a = interpolate(lt, [0, 0.2], [0, 1], C), zin = interpolate(t, [until - 0.35, until], [0, 1], { ...C, easing: Easing.in(Easing.cubic) });
  const scale = 1 + zin * (W / fw - 1) * 0.92, ox = cx + (W / 2 - cx) * 0, oy = cy;
  const Layer = ({ d, w }: { d: number; w: number }) => {
    const h = w * (H / W), pad = Math.max(4, w * 0.035);
    return (
      <div style={{ position: 'absolute', left: -w / 2, top: -h / 2, width: w, height: h, background: '#fff', padding: pad, boxSizing: 'border-box', boxShadow: '0 12px 30px rgba(0,0,0,0.5)', border: '2px solid #111' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#000' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${(w - pad * 2) / W})`, transformOrigin: '0 0' }}>{children}</div>
          {d > 1 && <div style={{ position: 'absolute', left: (w - pad * 2) * 0.5, top: (h - pad * 2) * 0.24 }}><Layer d={d - 1} w={(w - pad * 2) * 0.42} /></div>}
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ transformOrigin: `${ox}px ${oy}px`, transform: `scale(${scale})` }}>
      {children}
      <div style={{ position: 'absolute', left: cx, top: cy, opacity: a, transform: `scale(${interpolate(lt, [0, 0.2], [0.85, 1], C)})` }}><Layer d={depth} w={fw} /></div>
    </AbsoluteFill>
  );
};

/** 手绘圈标（参考 20.3–22.2 秒）：整个画面先变灰（0.15 秒），橙色手绘椭圆圈从一点画出（0.45 秒、一笔顺时针、略不闭合），圈外保持灰，圈里是原色；左下角手写体标签一个字一个字写出（每字 ~0.1 秒）。
 *  圈的位置用 ellipse=[cx, cy, rx, ry] 指到脸上（用 face_track.py 的人脸框算）。 */
export const HandMarkCam: React.FC<Kids & { th: Theme; at: number; until: number; ellipse?: [number, number, number, number]; label?: string; labelY?: number }> = ({ th, at, until, ellipse = [540, 760, 230, 290], label, labelY = 1090, children }) => {
  const t = useT();
  if (t < at || t > until + 0.15) return <AbsoluteFill>{children}</AbsoluteFill>;
  const [cx, cy, rx, ry] = ellipse, lt = t - at, g = interpolate(lt, [0, 0.15], [0, 1], C) * (t > until ? interpolate(t, [until, until + 0.15], [1, 0], C) : 1);
  const prog = interpolate(lt, [0.1, 0.55], [0, 1], { ...C, easing: Easing.inOut(Easing.quad) }), per = 2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2) * 1.06, chars = [...(label ?? '')], nc = Math.min(chars.length, Math.floor(Math.max(0, lt - 0.45) / 0.1) + 1);
  const path = `M ${cx + rx * 0.2} ${cy - ry} A ${rx} ${ry} 0 1 1 ${cx - rx} ${cy - 10} A ${rx * 1.02} ${ry * 1.03} 0 0 1 ${cx + rx * 0.35} ${cy - ry * 1.02}`;
  return (
    <AbsoluteFill>
      {children}
      <AbsoluteFill style={{ opacity: g, backdropFilter: 'grayscale(1) brightness(0.92)', WebkitBackdropFilter: 'grayscale(1) brightness(0.92)', WebkitMaskImage: `radial-gradient(ellipse ${rx}px ${ry}px at ${cx}px ${cy}px, transparent 98%, #000 100%)`, maskImage: `radial-gradient(ellipse ${rx}px ${ry}px at ${cx}px ${cy}px, transparent 98%, #000 100%)` }} />
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, opacity: g }}>
        <path d={path} fill="none" stroke={th.accent2} strokeWidth={9} strokeLinecap="round" strokeDasharray={per} strokeDashoffset={per * (1 - prog)} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }} />
      </svg>
      {label && <div style={{ position: 'absolute', left: 70, top: labelY, fontFamily: th.fonts.hand, fontSize: 84, color: '#fff', opacity: g, textShadow: '0 4px 14px rgba(0,0,0,0.6)', transform: 'rotate(-3deg)' }}>{chars.slice(0, nc).join('')}</div>}
    </AbsoluteFill>
  );
};

/** 形状放大（参考 27.4–28.6 秒）/ 标题字卡 + 圆形小窗（1–2.6 秒）：奶油色底，人像缩进圆窗（cx, cy, R），圆窗外一圈橙色实线；
 *  ring=true 时再向外扩散 2–3 圈同心圆（每圈 0.35 秒间隔，扩大 + 渐隐）；title 大字在旁边 / 下方。圆窗放大进场 0.25 秒。 */
export const ShapeCam: React.FC<Kids & { th: Theme; at: number; until: number; cx?: number; cy?: number; R?: number; title?: string; sub?: string; titleAt?: [number, number]; titleSize?: number; ring?: boolean; bg?: string; ink?: string }> = ({ th, at, until, cx = 540, cy = 820, R = 300, title, sub, titleAt = [540, 1230], titleSize = 84, ring = true, bg = '#F4EEDC', ink = '#1b140c', children }) => {
  const t = useT();
  if (t < at || t > until + 0.2) return <AbsoluteFill>{children}</AbsoluteFill>;
  const lt = t - at, o = interpolate(lt, [0, 0.12], [0, 1], C) * (t > until ? interpolate(t, [until, until + 0.2], [1, 0], C) : 1), k = interpolate(lt, [0, 0.25], [1.5, 1], { ...C, easing: oc });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - o * 0 }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ opacity: o, background: bg }}>
        {ring && [0, 1, 2].map((i) => { const u = ((lt - 0.3 - i * 0.35) / 0.9); if (u < 0) return null; const p = Math.min(1, u % 1.2); return <div key={i} style={{ position: 'absolute', left: cx - (R + 40 + p * 260), top: cy - (R + 40 + p * 260), width: (R + 40 + p * 260) * 2, height: (R + 40 + p * 260) * 2, borderRadius: '50%', border: `4px solid ${th.accent2}`, opacity: (1 - p) * 0.8 }} />; })}
        <div style={{ position: 'absolute', left: cx - R * k, top: cy - R * k, width: R * 2 * k, height: R * 2 * k, borderRadius: '50%', overflow: 'hidden', border: `8px solid ${th.accent2}`, boxShadow: '0 16px 40px rgba(0,0,0,0.25)', boxSizing: 'border-box' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${R * k - 540 * (R * 2 * k) / 720}px, ${R * k - 600 * (R * 2 * k) / 720}px) scale(${(R * 2 * k) / 720})` }}>{children}</div>
        </div>
        {title && <div style={{ position: 'absolute', left: 0, right: 0, top: titleAt[1] - titleSize * 0.6, textAlign: 'center', fontFamily: th.fonts.display, fontSize: titleSize, color: ink, opacity: interpolate(lt, [0.15, 0.35], [0, 1], C) }}>{title}</div>}
        {sub && <div style={{ position: 'absolute', left: 0, right: 0, top: titleAt[1] + titleSize * 0.7, textAlign: 'center', fontFamily: 'monospace', fontSize: 24, letterSpacing: 4, color: 'rgba(30,20,10,0.5)' }}>{sub}</div>}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 打勾清单（参考 10.5–12.5 秒）：奶油色便签卡（带橙色小标签 + 微倾 −2°）在左上角 2 帧弹出（0.9 → 1，轻回弹）；3 行空方框；
 *  每隔 ~0.5 秒一行被橙色勾打上（勾 2 帧画出）。items = [{ text, at }]（at＝打勾的秒数）。放在画面上角，不挡脸。 */
export const Checklist: React.FC<{ th: Theme; title: string; items: { text: string; at: number }[]; at: number; until: number; x?: number; y?: number }> = ({ th, title, items, at, until, x = 60, y = 300 }) => {
  const t = useT();
  if (t < at || t > until + 0.2) return null;
  const lt = t - at, o = interpolate(t, [until, until + 0.15], [1, 0], C), pop = interpolate(lt, [0, 0.1], [0.82, 1], { ...C, easing: Easing.out(Easing.back(2.4)) });
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
      <div style={{ position: 'absolute', left: x, top: y, width: 420, padding: '54px 30px 22px', background: '#F5EFE0', borderRadius: 10, boxShadow: '0 16px 34px rgba(0,0,0,0.4)', transform: `rotate(-2deg) scale(${pop})`, transformOrigin: '0 0', opacity: interpolate(lt, [0, 0.06], [0, 1], C) }}>
        <div style={{ position: 'absolute', left: -8, top: -16, background: th.accent2, color: '#fff', fontFamily: th.fonts.display, fontSize: 36, padding: '4px 20px', borderRadius: 6 }}>{title}</div>
        {items.map((it, i) => {
          const ck = interpolate(t, [it.at, it.at + 0.07], [0, 1], C);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, height: 70, fontFamily: th.fonts.body, fontSize: 36, color: '#1b140c' }}>
              <div style={{ width: 38, height: 38, border: '3px solid #1b140c', borderRadius: 6, position: 'relative', flexShrink: 0 }}>
                <svg width={52} height={46} viewBox="0 0 52 46" style={{ position: 'absolute', left: 2, top: -12 }}><path d="M4 24 L18 38 L48 4" fill="none" stroke={th.accent2} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={90} strokeDashoffset={90 * (1 - ck)} /></svg>
              </div>
              <span style={{ opacity: ck > 0.5 ? 0.55 : 1 }}>{it.text}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** 杂志封面（参考 15–16.3 秒）：视频本身当封面照（不遮脸）：顶部超大细衬线刊头，旁边小字期号；左下角橙色大数字 + 白色标题 + 小副标；左下条形码；右下小标签。持续 ~1.2 秒，镜头带轻微缓推。
 *  这是整屏「封面」设计，刊头在 y≈60–200（安全区外），因为是整屏封面，是少数允许的例外。 */
export const MagazineCover: React.FC<{ th: Theme; masthead: string; issue?: string; big: string; title: string; sub?: string; tag?: string; at: number; until: number }> = ({ th, masthead, issue, big, title, sub, tag, at, until }) => {
  const t = useT();
  if (t < at || t > until) return null;
  const lt = t - at, a = interpolate(lt, [0, 0.1], [0, 1], C), z = 1 + lt * 0.015;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: a, transform: `scale(${z})` }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.7) 100%)' }} />
      {issue && <div style={{ position: 'absolute', left: 50, top: 40, fontFamily: 'monospace', fontSize: 22, letterSpacing: 2, color: 'rgba(255,255,255,0.8)' }}>{issue}</div>}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: th.fonts.display, fontSize: Math.min(250, Math.floor(980 / Math.max(3, [...masthead].length) * 1.55)), lineHeight: 1, letterSpacing: 6, color: 'rgba(255,255,255,0.95)', textShadow: '0 6px 24px rgba(0,0,0,0.4)' }}>{masthead}</div>
      <div style={{ position: 'absolute', left: 56, top: 1190 }}>
        <div style={{ fontFamily: th.fonts.display, fontSize: 112, color: th.accent2, lineHeight: 1 }}>{big}</div>
        <div style={{ fontFamily: th.fonts.display, fontSize: 84, color: '#fff', lineHeight: 1.15, textShadow: '0 4px 14px rgba(0,0,0,0.5)' }}>{title}</div>
        {sub && <div style={{ marginTop: 10, fontFamily: th.fonts.body, fontSize: 30, color: 'rgba(255,255,255,0.8)' }}>{sub}</div>}
      </div>
      <div style={{ position: 'absolute', left: 56, bottom: 60, width: 150, height: 66, background: '#fff', padding: 6, boxSizing: 'border-box', display: 'flex', gap: 3 }}>{Array.from({ length: 28 }, (_, i) => <div key={i} style={{ flex: 1, background: '#000', opacity: rnd(i) > 0.45 ? 1 : 0.15 }} />)}</div>
      {tag && <div style={{ position: 'absolute', right: 50, bottom: 70, background: th.accent2, color: '#fff', fontFamily: th.fonts.body, fontSize: 24, padding: '6px 18px' }}>{tag}</div>}
    </AbsoluteFill>
  );
};

/** 环绕文字（参考 26.3–28 秒）：一圈小号加宽字距的文字（如「AROUND · 环绕文字 ·」）沿一个椭圆绕着头转，约 2.4 秒一圈；字很小（24px）、半透明白，不挡脸（椭圆比头大一圈，从头顶绕到肩）。
 *  椭圆中心 / 半径用人脸框算：cx, cy, rx, ry。 */
export const OrbitText: React.FC<{ th: Theme; text: string; cx?: number; cy?: number; rx?: number; ry?: number; size?: number; period?: number; at: number; until: number }> = ({ th, text, cx = 540, cy = 640, rx = 380, ry = 430, size = 30, period = 2.4, at, until }) => {
  const t = useT();
  if (t < at || t > until + 0.2) return null;
  const lt = t - at, o = interpolate(lt, [0, 0.2], [0, 1], C) * (t > until ? interpolate(t, [until, until + 0.2], [1, 0], C) : 1), chars = [...text], n = chars.length, rot = (lt / period) * 2 * Math.PI;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
      {chars.map((c, i) => {
        const a = rot + (i / n) * 2 * Math.PI, x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a), tang = Math.atan2(ry * Math.cos(a), -rx * Math.sin(a)) * 180 / Math.PI;
        const depth = (Math.sin(a) + 1) / 2;            // 越靠下越大越亮（离镜头近）
        return <div key={i} style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${tang}deg) scale(${0.75 + 0.5 * depth})`, fontFamily: th.fonts.body, fontSize: size, letterSpacing: 4, color: '#fff', opacity: 0.45 + 0.5 * depth, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>{c}</div>;
      })}
    </AbsoluteFill>
  );
};

/** 散落文字（参考 4–5.5 秒，30fps）：一行字（先排整齐，如「版本 2.0」）在 ~0.5 秒后「散架」：每个字母带重力往下掉、绕自己旋转（±200°）、横向飘开，
 *  落到画面下部后堆在那里（落地一次小回弹）。和 drop-text（一堆叠在一起）不同：这个是一整行字被打散。 */
export const ScatterText: React.FC<{ th: Theme; text: string; at: number; until: number; y?: number; size?: number; breakAt?: number }> = ({ th, text, at, until, y = 360, size = 74, breakAt = 0.6 }) => {
  const t = useT();
  if (t < at || t > until + 0.2) return null;
  const lt = t - at, o = t > until ? interpolate(t, [until, until + 0.2], [1, 0], C) : 1, chars = [...text], adv = chars.map((c) => (/[\u0000-ÿ]/.test(c) ? size * 0.6 : size)), tot = adv.reduce((a, b) => a + b, 0);
  let x0 = (W - tot) / 2;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
      {chars.map((c, i) => {
        const bx = x0; x0 += adv[i];
        const d = Math.max(0, lt - breakAt - i * 0.03), g = 1900, floor = 1500 + rnd(i + 4) * 160;
        const vx = (rnd(i + 1) - 0.5) * 420, vy = -rnd(i + 2) * 260, yy = y + vy * d + 0.5 * g * d * d;
        let py = Math.min(yy, floor), px = bx + vx * d;
        if (yy >= floor) { const b = Math.min(1, (d - Math.sqrt(2 * (floor - y) / g)) / 0.4); py = floor - Math.sin(Math.max(0, b) * Math.PI) * 30 * (1 - b); }
        const rot = (rnd(i + 3) - 0.5) * 400 * Math.min(1, d / 0.8);
        return <div key={i} style={{ position: 'absolute', left: px, top: py - size / 2, fontFamily: th.fonts.display, fontSize: size, lineHeight: 1, color: '#fff', transform: `rotate(${rot}deg)`, textShadow: '0 4px 12px rgba(0,0,0,0.5)', whiteSpace: 'pre' }}>{c}</div>;
      })}
    </AbsoluteFill>
  );
};
