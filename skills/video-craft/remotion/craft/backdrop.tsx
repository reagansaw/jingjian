// craft/backdrop — 纯代码背景和氛围层（不需要任何图片 / 素材）：星空视差 / 宣纸 / 渐层底、粒子、雾、宣纸颗粒 + 暗角、水墨转场。
// 来源：作者做的国风口播里用的氛围层，去掉了人物和私有图后改成通用版：颜色全部来自主题（th.accent / th.accent2 / th.bg）。
// 用法：Backdrop 当「黑底页」的底（人像缩小成圆头像 / 手机时露出来的那层）；Particles / Mist / PaperGrain 叠在画面上当氛围；InkWipe 当两段之间的转场。
// 没做的：深度视差（给任意图 + 深度图 → 真 2.5D）——要 three.js 和深度模型，见 references/audio-pipeline.md 「没做的」。
import React from 'react';
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import { Theme, useT } from './kit';

const W = 1080, H = 1920, C = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const rng = (seed: number) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };   // 确定性随机（渲染要可重复）
const STARS = [0, 1, 2].map((layer) => { const r = rng(31 + layer * 9); return Array.from({ length: [130, 60, 24][layer] }, () => ({ x: r() * 1180 - 50, y: r() * 2020 - 50, s: [1.3, 2.1, 3.2][layer] * (0.6 + r() * 0.8), ph: r() * 6.28, sp: 0.6 + r() * 1.8, gold: r() < 0.35 })); });

/** 背景页。cosmos = 深色星空（三层视差 + 慢转的九宫格线）；paper = 宣纸米色 + 颗粒；gradient = 主题色渐层。 */
export const Backdrop: React.FC<{ th: Theme; kind?: 'cosmos' | 'paper' | 'gradient'; grid?: boolean }> = ({ th, kind = 'cosmos', grid = true }) => {
  const t = useT(), push = 1 + t * 0.012;
  if (kind === 'paper') return <AbsoluteFill style={{ background: 'linear-gradient(180deg,#F1E8D4,#E4D8BC)' }}><PaperGrain vignette={0.3} /></AbsoluteFill>;
  if (kind === 'gradient') return <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 55% at 50% 38%, ${th.accent2}33 0%, ${th.bg} 70%)` }} />;
  return (
    <AbsoluteFill style={{ background: th.bg, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${1.1 + t * 0.01}) rotate(${t * 0.5}deg)` }}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 45% at 30% 35%, ${th.accent2}55 0%, ${th.accent2}22 45%, rgba(0,0,0,0) 75%)` }} />
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 40% at 72% 64%, ${th.accent}40 0%, ${th.accent}18 45%, rgba(0,0,0,0) 75%)` }} />
      </AbsoluteFill>
      {STARS.map((layer, li) => (
        <AbsoluteFill key={li} style={{ transform: `scale(${1 + (push - 1) * (li + 1)}) translateY(${-t * (li + 1) * 3}px)`, transformOrigin: '50% 45%' }}>
          {layer.map((st, i) => {
            const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * st.sp + st.ph));
            return <div key={i} style={{ position: 'absolute', left: st.x, top: st.y, width: st.s, height: st.s, borderRadius: '50%', background: st.gold ? th.accent : '#F4EEDC', opacity: tw * (0.5 + li * 0.25), boxShadow: li === 2 ? `0 0 ${st.s * 3}px ${th.accent}66` : undefined }} />;
          })}
        </AbsoluteFill>
      ))}
      {grid && (
        <svg width={W} height={H} style={{ position: 'absolute', opacity: 0.22 }}>
          <g transform={`translate(540,860) rotate(${t * 2.5})`} stroke={th.accent} strokeWidth={2} fill="none">
            <rect x={-420} y={-420} width={840} height={840} />
            {[-140, 140].map((d) => <React.Fragment key={d}><line x1={d} y1={-420} x2={d} y2={420} /><line x1={-420} y1={d} x2={420} y2={d} /></React.Fragment>)}
            <circle r={560} strokeDasharray="4 14" />
          </g>
        </svg>
      )}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%)' }} />
    </AbsoluteFill>
  );
};

/** 粒子：firefly = 暖色萤火（会闪、飘）；gold = 光尘（往上飘）。at / until 之外不画。area = [x, y, 宽, 底] 。 */
export const Particles: React.FC<{ th: Theme; kind?: 'firefly' | 'gold'; n?: number; seed?: number; area?: [number, number, number, number]; at?: number; until?: number }> = ({ th, kind = 'gold', n = 46, seed = 7, area = [0, 900, W, 1900], at = 0, until }) => {
  const t = useT();
  if (t < at || (until !== undefined && t > until + 0.4)) return null;
  const o = until === undefined ? interpolate(t, [at, at + 0.4], [0, 1], C) : Math.min(interpolate(t, [at, at + 0.4], [0, 1], C), interpolate(t, [until, until + 0.4], [1, 0], C));
  const r = rng(seed), ps = Array.from({ length: n }, () => ({ x: r(), y: r(), s: 0.5 + r(), ph: r() * 6.28, sp: 0.4 + r() * 0.8 })), [ax, ay, aw, ah] = area, id = `pt_${kind}_${seed}`;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
      <svg width={W} height={H}>
        <defs><radialGradient id={id}><stop offset="0%" stopColor="#FFFBEA" /><stop offset="40%" stopColor={th.accent} stopOpacity={0.85} /><stop offset="100%" stopColor={th.accent} stopOpacity={0} /></radialGradient></defs>
        {ps.map((p, i) => {
          if (kind === 'firefly') {
            const x = ax + p.x * aw + Math.sin(t * p.sp + p.ph) * 26, y = ay + p.y * (ah - ay) + Math.cos(t * p.sp * 0.8 + p.ph) * 18, tw = 0.35 + 0.65 * Math.max(0, Math.sin(t * (1.2 + p.sp) + p.ph * 2));
            return <circle key={i} cx={x} cy={y} r={9 * p.s} fill={`url(#${id})`} opacity={tw} />;
          }
          const y = ay + ((((p.y * (ah - ay) - t * 38 * p.sp) % (ah - ay)) + (ah - ay)) % (ah - ay)), x = ax + p.x * aw + Math.sin(t * 0.7 + p.ph) * 22;
          return <circle key={i} cx={x} cy={y} r={5.5 * p.s} fill={`url(#${id})`} opacity={0.75} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** 雾：几条缓慢横向飘的柔光带，压在画面下半部让它有「空气感」。 */
export const Mist: React.FC<{ bands?: { y: number; h: number; o: number; speed: number }[]; color?: string }> = ({ bands = [{ y: 1180, h: 260, o: 0.32, speed: 0.6 }, { y: 1520, h: 320, o: 0.38, speed: -0.45 }], color = '#F3EEE4' }) => {
  const t = useT();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={W} height={H}>
        <defs><filter id="mistblur" x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="46" /></filter></defs>
        {bands.map((b, i) => {
          const dx = ((t * 30 * b.speed) % 600) - 300;
          return <g key={i} filter="url(#mistblur)" opacity={b.o}><ellipse cx={200 + dx} cy={b.y} rx={620} ry={b.h / 2} fill={color} /><ellipse cx={900 + dx * 0.8} cy={b.y + 40} rx={520} ry={b.h / 2.4} fill={color} /></g>;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** 宣纸颗粒 + 暗角：让画面有「质感」，压在最上层。 */
export const PaperGrain: React.FC<{ vignette?: number }> = ({ vignette = 0.38 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <svg width={W} height={H}>
      <defs>
        <filter id="pgrain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed={11} /><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0.10 0" /></filter>
        <radialGradient id="pvig" cx="50%" cy="46%" r="72%"><stop offset="62%" stopColor="#1A140C" stopOpacity={0} /><stop offset="100%" stopColor="#1A140C" stopOpacity={vignette} /></radialGradient>
      </defs>
      <rect width={W} height={H} filter="url(#pgrain)" /><rect width={W} height={H} fill="url(#pvig)" />
    </svg>
  </AbsoluteFill>
);

/** 水墨转场：一团墨从中心晕开盖满，再退开露出下一幕。kind：blot 圆晕 / brush 一笔横扫 / splash 墨点四溅 / rise 墨浪上涌。at = 开始，dur 默认 0.9 秒（前半盖上、后半揭开）。 */
export type InkKind = 'blot' | 'brush' | 'splash' | 'rise';
export const InkWipe: React.FC<{ at: number; dur?: number; color?: string; cx?: number; cy?: number; kind?: InkKind }> = ({ at, dur = 0.9, color = '#15120E', cx = W / 2, cy = H * 0.52, kind = 'blot' }) => {
  const t = useT();
  if (t < at || t > at + dur) return null;
  const inn = t <= at + dur / 2, u = inn ? interpolate(t, [at, at + dur / 2], [0, 1], { ...C, easing: Easing.in(Easing.cubic) }) : interpolate(t, [at + dur / 2, at + dur], [1, 0], { ...C, easing: Easing.out(Easing.cubic) });
  const fid = `ink_${kind}_${Math.round(at * 100)}`, seed = Math.floor(t * 30) % 5 + 3, sc = kind === 'brush' ? 220 : kind === 'rise' ? 180 : 160, bf = kind === 'brush' ? 0.008 : 0.012;
  let shape: React.ReactNode;
  if (kind === 'brush') { const xx = inn ? (u - 1) * W * 1.4 : (1 - u) * W * 1.4; shape = <g transform={`rotate(-7 ${W / 2} ${H / 2})`}><rect x={xx - 200} y={-300} width={W + 400} height={H + 600} fill={color} filter={`url(#${fid})`} /></g>; }
  else if (kind === 'splash') {
    const drops = [[0.5, 0.45, 0], [0.2, 0.25, 0.12], [0.82, 0.3, 0.2], [0.25, 0.78, 0.26], [0.78, 0.8, 0.32]];
    shape = drops.map(([dx, dy, d], i) => { const v = Math.max(0, Math.min(1, (u - d * (inn ? 1 : 0.5)) / (1 - d * (inn ? 1 : 0.5)))); return <circle key={i} cx={dx * W} cy={dy * H} r={v * 1300} fill={color} filter={`url(#${fid})`} />; });
  } else if (kind === 'rise') { const top = inn ? H * (1.1 - u * 1.3) : -H * 0.2 - (1 - u) * H * 1.2, bottom = inn ? H * 1.3 : H * 1.3 - (1 - u) * H * 1.5; shape = <rect x={-200} y={top} width={W + 400} height={Math.max(0, bottom - top)} fill={color} filter={`url(#${fid})`} />; }
  else shape = <circle cx={cx} cy={cy} r={u * 1500} fill={color} filter={`url(#${fid})`} />;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={W} height={H}>
        <defs><filter id={fid} x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency={bf} numOctaves="4" seed={seed} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={sc} xChannelSelector="R" yChannelSelector="G" /></filter></defs>
        {shape}
      </svg>
    </AbsoluteFill>
  );
};
