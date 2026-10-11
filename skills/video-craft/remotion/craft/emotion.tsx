// craft/emotion — 「情绪字」：一个词就是一个情绪（哭泣 / 惊讶 / 非常开心 / 救命）。原创实现。
// 来源：剪映口播模板包「1-3」里 4 个情绪字演示，每个放慢拆帧（12 帧，间隔 0.12s）后的观察：
//   哭泣  = 情绪加载：字先是白色，红色像液体从下往上灌满（~0.7s）；字距拉得很开；负面 = 深红
//   惊讶  = 波浪：两个字一上一下错开地摆动，±8° 倾斜，循环 ~1s；金黄
//   开心  = 文字泛光：淡黄字，背后放射状光芒随节拍明暗脉动，~1s 一周期
//   救命  = 扩音器：两个字向外倾斜，先淡入、再轻轻摆动并向外扩出回声（原包的循环周期 3s，这里的摆动是近似）
// 原包把情绪字放在人头上方；本库的画面里头上没有安全空间，所以放在胸口带（y≈880–1250），字距拉开横跨宽度。
// ⚠ 只有「文字」这一半。原包的「嘤嘤嘤 / 眼泪」「真香 光晕翅膀」是剪映内置的**人脸特效**（难过 / 真香 / 大头），不是文字，这里没有做（需要人脸跟踪）。
import React from 'react';
import { Easing, interpolate } from 'remotion';
import { FitBox, SAFE, Theme, Zone, lin, out3, pop, useT } from './kit';

export type EmoKind = 'cry' | 'surprise' | 'joy' | 'shout';
export const EMO: Record<EmoKind, { zh: string; jy: string; loop: number; color: string; grad: string }> = {
  cry: { zh: '哭泣', jy: '情绪加载', loop: 1.27, color: '#E53935', grad: 'linear-gradient(180deg,#FF8A80 0%,#E53935 45%,#8E1313 100%)' },
  surprise: { zh: '惊讶', jy: '波浪', loop: 0.98, color: '#FFBF17', grad: 'linear-gradient(180deg,#FFF1B0 0%,#FFBF17 50%,#B07A00 100%)' },
  joy: { zh: '开心', jy: '文字泛光', loop: 0.98, color: '#FFF589', grad: 'linear-gradient(180deg,#FFFFFF 0%,#FFF589 45%,#FFC83D 100%)' },
  shout: { zh: '喊话', jy: '扩音器', loop: 3.0, color: '#FFBF17', grad: 'linear-gradient(180deg,#FFF1B0 0%,#FFBF17 50%,#B07A00 100%)' },
};
const TAU = Math.PI * 2;

export const EmotionWord: React.FC<{ th: Theme; text: string; kind: EmoKind; at: number; until: number; y?: number; size?: number; spanW?: number }> = ({ th, text, kind, at, until, y = 1010, size, spanW = 800 }) => {
  const t = useT();
  if (t < at - 0.02 || t > until + 0.25) return null;
  const chars = [...text], n = chars.length, E = EMO[kind];
  const sz = size ?? Math.min(210, Math.floor(spanW / Math.max(1, n) / 1.05));
  const ls = n >= 2 && n <= 3 ? Math.max(8, (spanW - n * sz) / n) : 6;                       // 2–3 个字：字距拉开横跨宽度；更长的词保持正常字距
  const p = pop(t, at, 0.32), o = Math.min(1, p * 1.6) * (1 - lin(t, until, until + 0.2)), lt = t - at, ph = (lt / E.loop) * TAU;
  const base: React.CSSProperties = { fontFamily: th.fonts.display, fontSize: sz, lineHeight: 1.15, letterSpacing: ls, whiteSpace: 'pre', textShadow: '4px 4px 2px rgba(0,0,0,0.9)' };
  const grad = (g: string): React.CSSProperties => ({ background: g, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', textShadow: 'none', filter: 'drop-shadow(4px 4px 2px rgba(0,0,0,0.85))' });
  let body: React.ReactNode, behind: React.ReactNode = null;

  if (kind === 'cry') {
    const f = interpolate(lt, [0.05, 0.75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });   // 红色从下往上灌满
    body = (
      <span style={{ position: 'relative', display: 'inline-block' }}>
        <span style={{ ...base, color: '#fff' }}>{text}</span>
        <span style={{ ...base, ...grad(E.grad), position: 'absolute', left: 0, top: 0, clipPath: `inset(${(1 - f) * 100}% 0 0 0)` }}>{text}</span>
      </span>
    );
  } else if (kind === 'surprise') {
    // ⚠ 渐变字（background-clip:text）一旦子元素各自 transform 就不渲染——渐变必须放在「每个字自己」身上
    body = <span style={{ ...base, display: 'inline-block' }}>{chars.map((c, i) => (
      <span key={i} style={{ ...grad(E.grad), display: 'inline-block', transform: `translateY(${Math.sin(ph + i * Math.PI) * sz * 0.09}px) rotate(${(i % 2 ? 1 : -1) * (6 + 2 * Math.sin(ph + i * Math.PI))}deg)` }}>{c}</span>))}</span>;
  } else if (kind === 'joy') {
    const pulse = 0.5 + 0.5 * Math.sin(ph);
    behind = (
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: 1500, height: 760, marginLeft: -750, marginTop: -380, pointerEvents: 'none', opacity: (0.45 + 0.5 * pulse) * Math.min(1, p * 1.6),
        background: 'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,214,64,0.65) 0deg 3deg, rgba(255,214,64,0) 3deg 11deg)',
        WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 12%, transparent 62%)', maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 12%, transparent 62%)' }} />
    );
    body = <span style={{ ...base, ...grad(E.grad), display: 'inline-block', filter: `drop-shadow(0 0 ${10 + 22 * pulse}px rgba(255,214,64,${0.55 + 0.4 * pulse})) drop-shadow(4px 4px 2px rgba(0,0,0,0.85))` }}>{text}</span>;
  } else {
    const fade = out3(t, at, at + 0.4), pulseS = 1 + 0.045 * Math.sin(lt * TAU / 0.75), mid = (n - 1) / 2;
    const ec = ((lt % 1.5) / 1.5);   // 回声：每 1.5s 一圈，向外扩并淡出
    body = (
      <span style={{ position: 'relative', display: 'inline-block', opacity: fade }}>
        <span style={{ ...base, ...grad(E.grad), position: 'absolute', left: 0, top: 0, opacity: (1 - ec) * 0.35, transformOrigin: '50% 50%', transform: `scale(${1 + ec * 0.45})` }}>{text}</span>
        <span style={{ ...base, display: 'inline-block' }}>{chars.map((c, i) => (
          <span key={i} style={{ ...grad(E.grad), display: 'inline-block', transform: `translateY(${(i - mid) * sz * 0.06}px) rotate(${(i - mid) * 26 / Math.max(1, n - 1)}deg) scale(${pulseS})` }}>{c}</span>))}</span>
      </span>
    );
  }
  return (
    <Zone>
      <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: o, transform: `scale(${0.7 + 0.3 * Math.min(1, p)})` }}>
        {behind}
        <FitBox yMid={y + sz / 2} style={{}}>{body}</FitBox>
      </div>
    </Zone>
  );
};
export { SAFE };
