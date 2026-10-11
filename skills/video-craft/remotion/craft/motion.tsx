// craft/motion — 文字入场动画预设（18 个）。来源：剪映口播模板包「2-1 文字动画和音效常用搭配」，38 种入场动画逐个慢放拆帧后，
// 挑「用得最多 + 彼此动法不同」的 18 种用代码重写（原创实现，不含原包的任何素材）。
// 时间一律是「合成开始后的秒数」；入场时长默认 0.4s（原包中位数 0.4s，p10 0.3 / p90 0.5；模糊/光效类 0.7s）。
// 不是每个字都要动：原包 2684 个文字片段里 52% 没有动画、45% 只有入场、2% 有出场 —— 只给重点词上动画。
import React from 'react';
import { Easing, interpolate } from 'remotion';
import { FitBox, Theme, Tone, lin, toneStyle, useT } from './kit';

export type MotionId =
  | 'fade' | 'slide-up' | 'reveal-up' | 'curtain' | 'grow' | 'grow-soft' | 'shrink' | 'slam'
  | 'rise-random' | 'wave-bounce' | 'typewriter' | 'develop' | 'glow-blur' | 'blur-left' | 'roll-in' | 'leap' | 'tracking-in' | 'echo';

/** id → 中文名（对应剪映动画名）/ 入场时长 / 类别 */
export const MOTIONS: Record<MotionId, { zh: string; jy: string; dur: number; cls: '位移' | '缩放' | '模糊光效' | '逐字' | '结构' }> = {
  'fade': { zh: '渐显', jy: '渐显', dur: 0.5, cls: '位移' },
  'slide-up': { zh: '向上滑动', jy: '向上滑动', dur: 0.4, cls: '位移' },
  'reveal-up': { zh: '向上露出', jy: '向上露出', dur: 0.4, cls: '位移' },
  'curtain': { zh: '开幕', jy: '开幕', dur: 0.5, cls: '位移' },
  'roll-in': { zh: '滚入', jy: '滚入', dur: 0.5, cls: '位移' },
  'leap': { zh: '跃进', jy: '跃进', dur: 0.4, cls: '位移' },
  'grow': { zh: '放大', jy: '放大', dur: 0.5, cls: '缩放' },
  'grow-soft': { zh: '轻微放大', jy: '轻微放大', dur: 0.5, cls: '缩放' },
  'shrink': { zh: '缩小', jy: '缩小', dur: 0.4, cls: '缩放' },
  'slam': { zh: '砸下（大→小）', jy: '缩小 II', dur: 0.35, cls: '缩放' },
  'glow-blur': { zh: '发光模糊', jy: '模糊发光 / 雪光模糊', dur: 0.7, cls: '模糊光效' },
  'blur-left': { zh: '向左模糊', jy: '向左模糊', dur: 0.5, cls: '模糊光效' },
  'rise-random': { zh: '随机上升', jy: '随机上升', dur: 0.4, cls: '逐字' },
  'wave-bounce': { zh: '波浪弹入', jy: '波浪弹入', dur: 0.4, cls: '逐字' },
  'typewriter': { zh: '打字光标', jy: '打字光标', dur: 0.5, cls: '逐字' },
  'develop': { zh: '逐字显影', jy: '逐字显影', dur: 0.7, cls: '逐字' },
  'tracking-in': { zh: '字距收拢', jy: '向右集合 / 收拢', dur: 0.7, cls: '结构' },
  'echo': { zh: '回声（呐喊声波）', jy: '呐喊声波', dur: 0.5, cls: '结构' },
};

const rnd = (i: number) => { const x = Math.sin(i * 12.9898 + 4.1414) * 43758.5453; return x - Math.floor(x); };   // 确定性伪随机（渲染要可重复）
const eo = (t: number, a: number, d: number) => interpolate(t, [a, a + d], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
const eb = (t: number, a: number, d: number) => interpolate(t, [a, a + d], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.7)) });

/** 一行字 + 一个入场动画。到 until 淡出（原包出场动画只占 2%，默认只做淡出）。 */
export const MotionText: React.FC<{ th: Theme; text: string; preset: MotionId; at: number; until: number; y: number; size: number; tone?: Tone; font?: string; align?: 'center' | 'left'; x?: number; ls?: number }> =
  ({ th, text, preset, at, until, y, size, tone = 'white', font, align = 'center', x = 0, ls = 2 }) => {
    const t = useT(), dur = MOTIONS[preset].dur;
    if (t < at - 0.02 || t > until + 0.25) return null;
    const p = eo(t, at, dur), outO = 1 - lin(t, until, until + 0.2), chars = [...text];
    const base: React.CSSProperties = { position: 'absolute', top: y, ...(align === 'center' ? { left: x, right: -x, textAlign: 'center' as const } : { left: x, textAlign: 'left' as const }), fontFamily: font ?? th.fonts.display, fontSize: size, lineHeight: 1.12, whiteSpace: 'nowrap', opacity: outO };
    const tone_ = toneStyle(th, tone);
    // 逐字类：每个字自己一个 span
    const perChar = (fn: (i: number, n: number) => React.CSSProperties) => chars.map((c, i) => <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre', ...fn(i, chars.length) }}>{c}</span>);
    let inner: React.ReactNode = text, box: React.CSSProperties = {}, outer: React.CSSProperties = {};
    switch (preset) {
      case 'fade': outer = { opacity: p }; break;
      case 'slide-up': outer = { opacity: p, transform: `translateY(${(1 - p) * 30}px)` }; break;
      case 'reveal-up': outer = { clipPath: `inset(${(1 - p) * 100}% 0 0 0)`, opacity: Math.min(1, p * 3) }; break;
      case 'curtain': outer = { clipPath: `inset(0 ${(1 - p) * 50}% 0 ${(1 - p) * 50}%)`, opacity: Math.min(1, p * 2.5) }; break;
      case 'roll-in': outer = { opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 70}px)`, clipPath: `inset(0 0 ${(1 - p) * 60}% 0)`, filter: `blur(${(1 - p) * 5}px)` }; break;
      case 'leap': { const q = eb(t, at, dur); outer = { opacity: Math.min(1, p * 2.2), transform: `translateY(${(1 - q) * 56}px)` }; break; }
      case 'grow': outer = { opacity: Math.min(1, p * 1.6), transform: `scale(${0.5 + 0.5 * p})` }; break;
      case 'grow-soft': outer = { opacity: p, transform: `scale(${0.94 + 0.06 * p})` }; break;
      case 'shrink': outer = { opacity: 0.3 + 0.7 * p, transform: `scale(${1.25 - 0.25 * p})` }; break;
      case 'slam': { const q = interpolate(t, [at, at + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.exp) }); outer = { opacity: Math.min(1, q * 4), transform: `scale(${3.2 - 2.2 * q})`, filter: `blur(${(1 - q) * 10}px)` }; break; }
      case 'glow-blur': outer = { opacity: 0.2 + 0.8 * p, filter: `blur(${(1 - p) * 14}px) drop-shadow(0 0 ${(1 - p) * 26 + 6}px rgba(255,255,255,${0.9 - 0.5 * p}))` }; break;
      case 'blur-left': outer = { opacity: Math.min(1, p * 2), transform: `translateX(${(1 - p) * 90}px)`, filter: `blur(${(1 - p) * 9}px)` }; break;
      case 'tracking-in': { const lsx = interpolate(p, [0, 1], [size * 0.55, ls]); outer = { opacity: Math.min(1, p * 2), letterSpacing: lsx }; break; }
      case 'echo': {
        const e1 = lin(t, at, at + 0.7), ghosts = [0, 1, 2].map((k) => { const g = Math.max(0, e1 - k * 0.18); return <span key={k} style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', opacity: (1 - g) * 0.4 * (g > 0 ? 1 : 0), transform: `scale(${1 + g * 0.55})` }}>{text}</span>; });
        inner = <>{ghosts}<span style={{ position: 'relative', display: 'inline-block', transform: `scale(${0.85 + 0.15 * eb(t, at, 0.3)})`, opacity: Math.min(1, p * 2.5) }}>{text}</span></>; box = { position: 'relative' }; break;
      }
      case 'rise-random': inner = perChar((i) => { const pc = eo(t, at + rnd(i) * 0.18, 0.32); return { opacity: pc, transform: `translateY(${(1 - pc) * (30 + rnd(i + 9) * 50)}px)` }; }); break;
      case 'wave-bounce': inner = perChar((i) => { const pc = eb(t, at + i * 0.05, 0.4); return { opacity: Math.min(1, pc * 2), transform: `translateY(${(1 - pc) * -42}px)` }; }); break;
      case 'develop': inner = perChar((i) => { const pc = eo(t, at + i * 0.09, 0.45); return { opacity: 0.25 + 0.75 * pc, filter: `blur(${(1 - pc) * 9}px)`, color: undefined }; }); break;
      case 'typewriter': {
        const n = Math.min(chars.length, Math.max(0, Math.floor((t - at) / 0.075) + 1)), done = n >= chars.length && t > at + chars.length * 0.075 + 0.5;
        inner = <>{chars.slice(0, n).join('')}<span style={{ display: 'inline-block', width: size * 0.09, height: size * 0.86, marginLeft: size * 0.06, verticalAlign: -size * 0.06, background: '#fff', opacity: !done && Math.floor(t * 3.2) % 2 === 0 ? 0.95 : 0 }} /></>; break;
      }
    }
    return (
      <div style={base}>
        <FitBox align={align === 'center' ? 'center' : 'left'} yMid={y + size / 2} style={{}}>
          <span style={{ display: 'inline-block', ...tone_, ...box, ...outer, letterSpacing: preset === 'tracking-in' ? outer.letterSpacing : ls }}>{inner}</span>
        </FitBox>
      </div>
    );
  };
