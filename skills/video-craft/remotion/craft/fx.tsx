// craft/fx — 「钩子 + 讲什么画什么」特效：镜头层（冲镜 / 震动 / 电视关机 / 缩进手机 / 变圆头像）+ 重点词动画（数字砸下 / 印章 / 逐词弹出 / 白闪）+ 界面比喻（聊天框 / 空位 / 截图快闪）。
// 来源：作者做的几集真实口播（奇门 / 故事片 / 播客）里反复用、又没有绑定素材的那部分，去掉了人名和私有素材后重写成通用版：全部用主题色，不依赖任何图。
// 约定：overlay 类（WhiteFlash / KineticLine / CounterSlam / Stamp / ChatDM / SlotRow / RapidMontage）的时间都是「成片里的绝对秒数」，在 [at, until] 之外什么都不画。
//       camera 类（PunchIn / Shake / TvOff / SendFly / CircleCam）包住视频层，在窗口之外原样透传；用 Edit 的 camera 数组配置。
// 安全区：重点文字放在 y≥250、≤1250；打字 / 数字这类「会变宽」的走 FitBox。
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from 'remotion';
import { FitBox, SAFE, Theme, useT } from './kit';
import { Backdrop } from './backdrop';

const C = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const W = 1080, H = 1920;
const win = (t: number, a: number, b: number, fi = 0.12, fo = 0.15) => interpolate(t, [a, a + fi, b - fo, b], [0, 1, 1, 0], C);

/** 把 #RRGGBB 按系数变深 / 变浅（f<1 变深） */
export const shade = (hex: string, f: number) => {
  const n = parseInt(hex.replace('#', ''), 16), c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
};
/** 3D 厚度阴影（取代黑描边）：同色系深色一层层往下叠（连环 drop-shadow 会累加成「侧面」），最后一层软投影。作者的规矩：字不要黑描边，看起来很业余。 */
export const depth3d = (color: string, size: number) => {
  const o = Math.max(1, size / 70), a = shade(color, 0.62), b = shade(color, 0.36);
  return `drop-shadow(0 ${o}px 0 ${a}) drop-shadow(0 ${o}px 0 ${a}) drop-shadow(0 ${o}px 0 ${b}) drop-shadow(0 ${o}px 0 ${b}) drop-shadow(0 ${size * 0.07}px ${size * 0.1}px rgba(0,0,0,0.6))`;
};

/* ============ 镜头层（包住视频） ============ */
type Kids = { children: React.ReactNode };

/** 开场冲镜：1.28 → 1.0 回弹 + 动态模糊（剪映「放大冲入」）。 */
export const PunchIn: React.FC<Kids & { at?: number; dur?: number; from?: number; origin?: string }> = ({ at = 0, dur = 0.9, from = 1.28, origin = '50% 38%', children }) => {
  const t = useT() - at;
  if (t < 0 || t > dur) return <AbsoluteFill>{children}</AbsoluteFill>;
  const p = interpolate(t, [0, 0.4], [0, 1], { ...C, easing: Easing.out(Easing.back(1.8)) });
  const sc = from - (from - 1) * p + interpolate(t, [0.4, dur], [0, 0.06], C);
  return <AbsoluteFill style={{ transform: `scale(${sc})`, transformOrigin: origin, filter: p < 0.95 ? `blur(${(1 - p) * 10}px)` : undefined }}>{children}</AbsoluteFill>;
};

/** 冲击点：每个 hit 之后 0.32 秒内震动 + 放大 1.06 回弹（剪映「抖动」）。只包画面层，字不震——所以放在 Edit 的 camera 里而不是 beats 里。 */
export const Shake: React.FC<Kids & { hits: number[] }> = ({ hits, children }) => {
  const t = useT(), h = hits.find((x) => t >= x && t < x + 0.32);
  if (h === undefined) return <AbsoluteFill>{children}</AbsoluteFill>;
  const u = (t - h) / 0.32, amp = (1 - u) * (1 - u);
  return <AbsoluteFill style={{ transform: `translate(${Math.sin(u * 46) * 16 * amp}px,${Math.cos(u * 39) * 11 * amp}px) scale(${1 + 0.06 * amp})` }}>{children}</AbsoluteFill>;
};

/** 旧电视关机：画面压成一条线 → 一个点 → 黑，黑场一直到 until。用在「广告一停，生意就停了」这种句子。 */
export const TvOff: React.FC<Kids & { at: number; until?: number }> = ({ at, until, children }) => {
  const t = useT(), end = until ?? at + 1.2;
  if (t < at || t >= end) return <AbsoluteFill>{children}</AbsoluteFill>;
  const sy = interpolate(t, [at, at + 0.18], [1, 0.006], { ...C, easing: Easing.in(Easing.cubic) });
  const sx = interpolate(t, [at + 0.18, at + 0.34], [1, 0.004], { ...C, easing: Easing.in(Easing.cubic) });
  const dot = interpolate(t, [at + 0.3, at + 0.55], [1, 0], C);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <AbsoluteFill style={{ transform: `scale(${sx},${sy})`, filter: `brightness(${1 + 2.5 * (1 - sy)})`, opacity: t > at + 0.34 ? 0 : 1 }}>{children}</AbsoluteFill>
      {t > at + 0.3 && <div style={{ position: 'absolute', left: W / 2 - 10, top: H / 2 - 10, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 0 30px 10px rgba(255,255,255,0.8)', opacity: dot }} />}
    </AbsoluteFill>
  );
};

/** 「把这条视频发给他」：整个画面缩进一支手机 → 停一下 → 往右上飞走。 */
export const SendFly: React.FC<Kids & { th: Theme; at: number; until?: number }> = ({ th, at, until, children }) => {
  const t = useT(), end = until ?? at + 1.2;
  if (t < at || t >= end) return <AbsoluteFill>{children}</AbsoluteFill>;
  const p = interpolate(t, [at, at + 0.35], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const fl = interpolate(t, [at + 0.7, at + 1.05], [0, 1], { ...C, easing: Easing.in(Easing.cubic) });
  const sc = (1 - 0.55 * p) * (1 - 0.75 * fl), k = 1 / Math.max(sc, 0.2);
  return (
    <AbsoluteFill>
      <Backdrop th={th} kind="cosmos" grid={false} />
      <AbsoluteFill style={{ transform: `translate(${fl * 760}px,${-fl * 1300}px) rotate(${fl * 25}deg) scale(${sc})`, borderRadius: 70 * p * k, overflow: 'hidden',
        boxShadow: p > 0.05 ? `0 0 0 ${26 * p * k}px #15161A, 0 0 0 ${32 * p * k}px #6B6E75` : undefined }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 「画面缩成圆头像 + 周围圆圈弹出连线」：讲「身边的同行 / 团队 / 客户」这种句子，用自己的画面去演。
 *  face = 脸在画面里的中心 [x,y]（缩的时候以它为中心）；peers = 周围几个圆圈（最多 6）。 */
const PEER_POS = [[-330, -250], [330, -250], [-400, 90], [400, 90], [-230, 380], [230, 380]];
export const CircleCam: React.FC<Kids & { th: Theme; at: number; until?: number; cy?: number; R?: number; face?: [number, number]; peers?: number; popAt?: number }> = ({ th, at, until, cy = 760, R = 230, face = [540, 700], peers = 6, popAt, children }) => {
  const t = useT() - at, end = (until ?? at + 3) - at;
  if (t < 0 || t >= end) return <AbsoluteFill>{children}</AbsoluteFill>;
  const p = interpolate(t, [0, 0.4], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) });
  const rr = interpolate(p, [0, 0.45, 1], [1400, 560, R]), ring = interpolate(t, [0.3, 0.55], [0, 1], C), pa = popAt === undefined ? 0.6 : popAt - at;
  const [FX, FY] = face, pos = PEER_POS.slice(0, peers), A = th.accent;
  return (
    <AbsoluteFill>
      <Backdrop th={th} kind="cosmos" grid={false} />
      <AbsoluteFill style={{ clipPath: `circle(${rr}px at ${W / 2}px ${cy}px)` }}>
        <AbsoluteFill style={{ transformOrigin: `${FX}px ${FY}px`, transform: `translate(${(W / 2 - FX) * p}px,${(cy - FY) * p}px) scale(${1 - 0.5 * p})` }}>{children}</AbsoluteFill>
      </AbsoluteFill>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs><filter id="cc_g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter></defs>
        <circle cx={W / 2} cy={cy} r={R + 4} fill="none" stroke={A} strokeWidth={8} opacity={ring} />
        <circle cx={W / 2} cy={cy} r={R + 18} fill="none" stroke={A} strokeWidth={14} opacity={0.35 * ring} filter="url(#cc_g)" />
        {pos.map(([dx, dy], i) => {
          const ti = pa + i * 0.13, lp = interpolate(t, [ti, ti + 0.3], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
          const len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, x1 = W / 2 + ux * (R + 8), y1 = cy + uy * (R + 8), x2 = W / 2 + dx - ux * 78, y2 = cy + dy - uy * 78;
          return lp > 0 ? <line key={i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * lp} y2={y1 + (y2 - y1) * lp} stroke={A} strokeWidth={4} opacity={0.85} /> : null;
        })}
      </svg>
      {pos.map(([dx, dy], i) => {
        const ti = pa + 0.12 + i * 0.13;
        if (t < ti) return null;
        const k = interpolate(t, [ti, ti + 0.25], [0, 1], { ...C, easing: Easing.out(Easing.back(2.2)) }), r = 72;
        return (
          <div key={i} style={{ position: 'absolute', left: W / 2 + dx - r, top: cy + dy - r, width: r * 2, height: r * 2, borderRadius: '50%', overflow: 'hidden', transform: `scale(${k})`,
            background: 'radial-gradient(circle at 50% 35%, #2A3A5C, #0C1426)', boxShadow: `0 0 0 5px ${A}, 0 0 26px ${A}88, 0 14px 26px rgba(0,0,0,0.6)` }}>
            <svg width={r * 2} height={r * 2} viewBox="-50 -50 100 100"><circle cx={0} cy={-12} r={17} fill="#E9DCC0" opacity={0.92} /><path d="M -34 40 Q -32 6 0 6 Q 32 6 34 40 Z" fill="#E9DCC0" opacity={0.92} /></svg>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ============ 重点词动画（overlay） ============ */
/** 白闪（0.22 秒）：钩子那一下、换场、重击点。 */
export const WhiteFlash: React.FC<{ at: number; dur?: number; color?: string }> = ({ at, dur = 0.22, color = '#FFF8E6' }) => {
  const t = useT();
  if (t < at || t > at + dur) return null;
  return <AbsoluteFill style={{ background: color, opacity: interpolate(t, [at, at + dur], [0.95, 0], C), pointerEvents: 'none' }} />;
};

/** 逐词放大变色（剪映 J180）：新的一拍大字弹入，上一拍缩小变暗留在上面；hot = 强调色 + 更大。words 的 t 是绝对秒。 */
export const KineticLine: React.FC<{ th: Theme; words: { t: number; text: string; hot?: boolean }[]; y: number; until?: number }> = ({ th, words, y, until }) => {
  const t = useT(), shown = words.filter((w) => t >= w.t);
  if (!shown.length || (until !== undefined && t > until + 0.2)) return null;
  const fo = until === undefined ? 1 : interpolate(t, [until, until + 0.2], [1, 0], C);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: fo }}>
      {shown.map((w, i) => {
        const age = shown.length - 1 - i;
        if (age > 1) return null;
        const p = interpolate(t, [w.t, w.t + 0.22], [0, 1], { ...C, easing: Easing.out(Easing.back(2.2)) });
        const size = age === 0 ? (w.hot ? 190 : 120) : 70, yy = age === 0 ? y : y - (shown[shown.length - 1].hot ? 170 : 130), hot = age === 0 && w.hot;
        return (
          <div key={i} style={{ position: 'absolute', left: SAFE.left, right: W - SAFE.right, top: yy - size / 2, textAlign: 'center', fontFamily: th.fonts.display, fontSize: size, lineHeight: 1,
            transform: `scale(${age === 0 ? 0.4 + 0.6 * p : 1})`, opacity: age === 0 ? Math.min(1, p * 1.6) : 0.85 }}>
            <FitBox yMid={yy} style={hot ? { background: th.gAccent, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: `${depth3d(th.accent, size)} drop-shadow(0 0 24px ${th.accent}99)` }
              : { color: '#fff', filter: depth3d('#CFCFCF', size) }}>{w.text}</FitBox>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** 数字滚动砸下（剪映 J172）：从 0 滚到 to，越滚越慢，落地放大砸下 + 光晕。suffix 是后面的小字（「单」「万」「%」）。
 *  位置：top = 上沿 y，x = 中心 x（默认居中）。**脸很大的素材别放在头顶 / 脸上**——放脸旁边（例如 x=820, top=260）。 */
export const CounterSlam: React.FC<{ th: Theme; to?: number; at?: number; land: number; top?: number; x?: number; suffix?: string; until?: number; size?: number }> = ({ th, to = 8, at = 0.1, land, top = 300, x = W / 2, suffix = '', until, size = 250 }) => {
  const t = useT();
  if (t < at || (until !== undefined && t > until + 0.2)) return null;
  const u = interpolate(t, [at, land], [0, 1], { ...C, easing: Easing.out(Easing.quad) }), n = Math.min(to, Math.floor(u * (to + 0.999))), done = t >= land;
  const k = done ? interpolate(t, [land, land + 0.2], [1.6, 1], { ...C, easing: Easing.out(Easing.back(2.5)) }) : 1, glow = done ? interpolate(t, [land, land + 0.5], [1, 0.4], C) : 0.2;
  const fo = until === undefined ? 1 : interpolate(t, [until, until + 0.2], [1, 0], C);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: fo }}>
      <div style={{ position: 'absolute', top, left: 0, right: 0, textAlign: 'center', transform: `translateX(${x - W / 2}px) scale(${k})`, fontFamily: th.fonts.display, fontSize: size, lineHeight: 1,
        background: th.gAccent, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: `${depth3d(th.accent, size)} drop-shadow(0 0 ${20 + 30 * glow}px ${th.accent}${Math.round(60 + 90 * glow).toString(16).padStart(2, '0')})` }}>
        {n}<span style={{ fontSize: size * 0.52 }}>{suffix}</span>
      </div>
    </AbsoluteFill>
  );
};

/** 印章字：从大盖下来（2.2× → 1×）+ 微倾。用在「全部都是 X」「已成交」「重点」。 */
export const Stamp: React.FC<{ th: Theme; text: string; at: number; until: number; y: number; color?: string; size?: number }> = ({ th, text, at, until, y, color = '#D23A2A', size = 110 }) => {
  const t = useT();
  if (t < at || t > until) return null;
  const k = interpolate(t, [at, at + 0.16], [2.2, 1], { ...C, easing: Easing.in(Easing.quad) }), o = interpolate(t, [at, at + 0.08, until - 0.15, until], [0, 1, 1, 0], C);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
      <div style={{ position: 'absolute', top: y - size * 0.72, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${k}) rotate(-4deg)` }}>
        <div style={{ background: color, color: '#FFF6E4', fontFamily: th.fonts.display, fontSize: size, padding: `${size * 0.09}px ${size * 0.36}px`, borderRadius: 10, whiteSpace: 'nowrap',
          boxShadow: `inset 0 0 0 6px ${shade(color, 0.85)}, inset 0 0 0 11px rgba(255,246,228,0.85), 0 18px 40px rgba(0,0,0,0.55)` }}>
          <FitBox yMid={y} style={{}}>{text}</FitBox>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ============ 界面比喻（讲什么画什么） ============ */
/** 底部弹出聊天输入框 → 打字 → 发送 → 强调色气泡飞到上方。讲「私信我 X」「留言 X」。at = 弹出，typeAt = 开始打字，sendAt = 发送。 */
export const ChatDM: React.FC<{ th: Theme; text: string; at: number; until: number; sendAt?: number; placeholder?: string; y?: number }> = ({ th, text, at, until, sendAt, placeholder = '发消息…', y = 1000 }) => {
  const t = useT();
  if (t < at || t > until) return null;
  const lt = t - at, send = (sendAt ?? at + 1.0) - at, up = interpolate(lt, [0, 0.3, until - at - 0.25, until - at], [0, 1, 1, 0], { ...C, easing: Easing.out(Easing.cubic) });
  const chars = [...text], typed = chars.slice(0, Math.floor(interpolate(lt, [0.35, 0.35 + Math.max(0.3, chars.length * 0.1)], [0, chars.length + 0.99], C))).join('');
  const fly = interpolate(lt, [send, send + 0.45], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) }), press = lt >= send && lt < send + 0.12 ? 0.88 : 1;
  const bx = 160 + (640 - 160) * fly, by = y + 60 + (y - 560 - (y + 60)) * fly - Math.sin(fly * Math.PI) * 160;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 70, right: 70, top: y + (1 - up) * 300, height: 110, opacity: up, borderRadius: 55, background: 'rgba(247,240,223,0.97)', boxShadow: '0 18px 40px rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', padding: '0 20px 0 44px', boxSizing: 'border-box' }}>
        <div style={{ flex: 1, fontFamily: th.fonts.body, fontSize: 52, color: lt < send ? '#16110C' : 'rgba(22,17,12,0.3)' }}>
          {lt < send ? <>{typed}<span style={{ color: th.accent2, opacity: Math.floor(lt * 4) % 2 ? 0 : 1 }}>｜</span></> : placeholder}
        </div>
        <div style={{ width: 84, height: 84, borderRadius: '50%', background: th.accent2, transform: `scale(${press})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 44 }}>➤</div>
      </div>
      {lt >= send && (
        <div style={{ position: 'absolute', left: bx, top: by, padding: '14px 36px', borderRadius: '44px 44px 8px 44px', fontFamily: th.fonts.display, fontSize: 88, whiteSpace: 'nowrap',
          background: th.gAccent, color: th.onAccent, transform: `scale(${0.6 + 0.4 * fly})`, boxShadow: `0 16px 36px rgba(0,0,0,0.55), 0 0 30px ${th.accent}88` }}>
          {text}{fly >= 1 && <span style={{ fontFamily: th.fonts.body, fontSize: 28, marginLeft: 14, opacity: 0.7 }}>✓✓</span>}
        </div>
      )}
    </AbsoluteFill>
  );
};

/** N 个空位（虚线圈 + 序号）一个个弹出：讲「至少 7 单」「十个名额」「目标」。 */
export const SlotRow: React.FC<{ th: Theme; n: number; y: number; at: number; until: number }> = ({ th, n, y, at, until }) => {
  const t = useT();
  if (t < at || t > until + 0.2) return null;
  const o = interpolate(t, [until - 0.2, until], [1, 0], C), gap = Math.min(112, 860 / Math.max(1, n)), x0 = W / 2 - ((n - 1) * gap) / 2, r = Math.min(44, gap * 0.42);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
      {Array.from({ length: n }).map((_, i) => {
        const k = interpolate(t, [at + 0.1 + i * 0.07, at + 0.35 + i * 0.07], [0, 1], { ...C, easing: Easing.out(Easing.back(2)) });
        return <div key={i} style={{ position: 'absolute', left: x0 + i * gap - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `5px dashed ${th.accent}`, transform: `scale(${k})`,
          background: 'rgba(10,8,4,0.45)', boxShadow: '0 8px 18px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: th.fonts.display, fontSize: r * 0.9, color: th.accent }}>{i + 1}</div>;
      })}
    </AbsoluteFill>
  );
};

/** 截图快闪：一张张证据图（真截图 > 动画）每张 step 秒，放大入 + 左右轻倾，最后一张停住；上面写「第 N 个」。images 放在 public/ 下，src 是相对 public 的路径，w/h 是原图像素。
 *  label 里的 {n} 会换成第几张。 */
export const RapidMontage: React.FC<{ th: Theme; images: { src: string; w: number; h: number }[]; at: number; until: number; step?: number; label?: string; y?: number }> = ({ th, images, at, until, step = 0.2, label = '第 {n} 个', y = 820 }) => {
  const t = useT();
  if (t < at || t > until + 0.2 || !images.length) return null;
  const i = Math.min(images.length - 1, Math.floor((t - at) / step)), c = images[i], lt = t - at - i * step, p = interpolate(lt, [0, 0.12], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  const w = Math.min(900, c.w), h = (w * c.h) / c.w, hh = Math.min(h, 1000), ww = (hh / h) * w, fo = interpolate(t, [until, until + 0.2], [1, 0], C);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: fo }}>
      <AbsoluteFill style={{ background: 'rgba(10,7,4,0.55)', backdropFilter: 'blur(10px)' }} />
      <div style={{ position: 'absolute', left: (W - ww) / 2 - 12, top: y - hh / 2, width: ww + 24, padding: 12, boxSizing: 'border-box', background: '#F7F0DF', borderRadius: 8, boxShadow: '0 30px 60px rgba(0,0,0,0.6)', transform: `rotate(${i % 2 ? 2.5 : -2.5}deg) scale(${1.18 - 0.18 * p})` }}>
        <Img src={staticFile(c.src)} style={{ width: ww, height: hh, display: 'block' }} />
      </div>
      <div style={{ position: 'absolute', top: SAFE.top + 20, left: 0, right: 0, textAlign: 'center', fontFamily: th.fonts.display, fontSize: 100, color: '#fff', filter: depth3d('#CFCFCF', 100) }}>
        <FitBox yMid={SAFE.top + 70} style={{}}>{label.replace('{n}', String(i + 1))}</FitBox>
      </div>
    </AbsoluteFill>
  );
};

/* ============ 镜头层的统一入口（Edit 的 camera 数组） ============ */
export type CamFx = { kind: 'punch' | 'shake' | 'tvoff' | 'send' | 'circle'; at?: number; until?: number; dur?: number; from?: number; hits?: number[]; cy?: number; R?: number; face?: [number, number]; peers?: number; popAt?: number };
export const CameraStack: React.FC<{ th: Theme; fx: CamFx[]; children: React.ReactNode }> = ({ th, fx, children }) => (
  <>{[...fx].reverse().reduce<React.ReactNode>((acc, f) => {
    switch (f.kind) {
      case 'punch': return <PunchIn at={f.at} dur={f.dur} from={f.from}>{acc}</PunchIn>;
      case 'shake': return <Shake hits={f.hits ?? []}>{acc}</Shake>;
      case 'tvoff': return <TvOff at={f.at ?? 0} until={f.until}>{acc}</TvOff>;
      case 'send': return <SendFly th={th} at={f.at ?? 0} until={f.until}>{acc}</SendFly>;
      case 'circle': return <CircleCam th={th} at={f.at ?? 0} until={f.until} cy={f.cy} R={f.R} face={f.face} peers={f.peers} popAt={f.popAt}>{acc}</CircleCam>;
      default: return acc;
    }
  }, children)}</>
);
