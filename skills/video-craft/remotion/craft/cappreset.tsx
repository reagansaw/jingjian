// craft/cappreset — 字幕样式预设（147 款，竖屏 117 款可用）：从「剪映字幕预设」文件夹抽出来的样式规格（位置 / 缩放 / 颜色 / 描边 / 阴影 / 字体类别 / 入场·出场·循环动画 / 关键帧），用自己的代码重画。
// 规格文件 caption-presets.json 由 tools/jy_preset_extract.py 生成：只含数字和样式，**不含**原文字（品牌字已换成 {{n}} 占位）、预览图、字体文件。
// 动画是按名字归类后用通用曲线近似的（没有逐款逐帧量过）：同名动画的「手感方向」对，曲线细节不保证和剪映一样。
// 用法（edit.json 的 beats）：{ "kind": "cap-preset", "props": { "preset": "J136-三段字幕", "texts": ["第一点","第二点","第三点"], "at": 1.2 } }
import React from 'react';
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import { useT } from './kit';
import SPECS from './caption-presets.json';

type Style = { range: [number, number]; fill: { type: string; color?: string; angle?: number; stops?: [number, string][] }; size: number; font: string; stroke: { w: number; color: string } | null; shadows: { dist: number; angle: number; alpha: number; blur: number; color: string }[] };
type Anim = { name: string; dur: number } | null;
type Seg = { n: number; lines: number; start: number; dur: number; x: number; y: number; scale: number; rot: number; alpha: number; align: number; ls: number; spacing: number; styles: Style[]; in: Anim; out: Anim; loop: Anim; kf: Record<string, [number, number][]> };
export type CapSpec = { id: string; name: string; canvas: [number, number]; dur: number; extras: string[]; segs: Seg[] };
export const CAP_PRESETS = SPECS as unknown as CapSpec[];
const BY_ID: Record<string, CapSpec> = Object.fromEntries(CAP_PRESETS.map((p) => [p.id, p]));
const C = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const K = 5;   // 剪映字号 → 1080 宽画布像素：size 15 ≈ 75px（按预设封面图量的近似值）
const FONTS: Record<string, string> = { serif: 'CraftSong', sans: 'CraftSmiley', hand: 'CraftSmiley', condensed: "Anton, Impact, 'CraftSmiley'" };
const rnd = (i: number) => { const x = Math.sin(i * 91.7 + 13.3) * 43758.5453; return x - Math.floor(x); };
const back = (p: number, s = 1.9) => Easing.out(Easing.back(s))(p);
const out3 = Easing.out(Easing.cubic);

type Fx = { o: number; x: number; y: number; sx: number; sy: number; rot: number; blur: number; rx: number; ry: number; clip?: [number, number, number, number]; shown?: number };   // shown：打字机已显示的字数比例
const ID: Fx = { o: 1, x: 0, y: 0, sx: 1, sy: 1, rot: 0, blur: 0, rx: 0, ry: 0 };

/** 动画名 → 通用曲线。p：0→1（入场 0=刚开始 1=到位；出场 0=开始离开 1=消失）；ci/n：第几个字 / 共几个字（逐字类动画用）。 */
export const animFx = (name: string, kind: 'in' | 'out' | 'loop', p: number, ci: number, n: number, tsec = 0, px = 75): { fx: Fx; perChar: boolean } => {
  const f: Fx = { ...ID }; let perChar = false;
  const e = kind === 'in' ? 1 - p : p;           // e：离「完全显示」的距离 0..1
  const has = (re: RegExp) => re.test(name);
  if (kind === 'loop') {
    const w = Math.sin(tsec * 9);
    if (has(/调皮|晃动|扭动|摇摆|钟摆/)) f.rot = w * 4; else if (has(/波浪|环绕/)) f.y = Math.sin(tsec * 6 + ci * 0.6) * px * 0.12; else if (has(/拉住|折叠/)) f.sy = 1 + Math.sin(tsec * 3) * 0.04;
    return { fx: f, perChar: has(/波浪|环绕/) };
  }
  const fade = (k = 1) => { f.o = Math.max(0, 1 - e * k); };
  if (has(/打字|居中打字|预览打字/)) { f.shown = kind === 'in' ? p : 1 - p; return { fx: f, perChar: false }; }
  if (has(/逐字|随机|跳跳糖|粒子|镂空|星光闪闪|波浪弹入|集合|落下|上升/)) {
    perChar = true; const d = 0.5, st = Math.min(0.5, 0.5 / Math.max(1, n) * 2), lp = Math.max(0, Math.min(1, (p - (kind === 'in' ? ci * st * d : (n - 1 - ci) * st * d)) / (1 - st * d * (n - 1 > 0 ? Math.min(n - 1, 6) : 0))));
    const ee = kind === 'in' ? 1 - Math.min(1, lp) : Math.min(1, lp), r = rnd(ci + 3);
    f.o = Math.max(0, 1 - ee * 1.6);
    if (has(/旋/)) f.rot = ee * (r > 0.5 ? 180 : -180);
    else if (has(/翻转/)) f.rx = ee * 90;
    else if (has(/落下|下降/)) f.y = -ee * px * 1.4;
    else if (has(/上升/)) f.y = ee * px * 1.2;
    else if (has(/集合|粒子|汇聚/)) { f.x = (r - 0.5) * ee * px * 5; f.y = (rnd(ci + 9) - 0.5) * ee * px * 4; }
    else { f.sx = f.sy = 1 - ee * 0.7; f.y = ee * px * 0.5; }
    return { fx: f, perChar };
  }
  if (has(/渐显|渐隐|消散|溶解|辉光|冰雪|流光|闪烁散开/)) { fade(); if (has(/消散|溶解|散开/)) f.blur = e * 6; return { fx: f, perChar }; }
  if (has(/模糊|晕开|雪光|扭曲|发光|叠影/)) { fade(1.2); f.blur = e * 14; if (has(/向左/)) f.x = -e * px * 1.2; if (has(/滚动/)) f.y = e * px * 1.2; return { fx: f, perChar }; }
  if (has(/向.*(露出|擦除|擦开)|日出|开幕/)) {
    const dir = (name.match(/向(.)/) ?? [])[1] ?? '上', v = 1 - e;
    f.clip = has(/开幕/) ? [0.5 - v * 0.5, 0, 0.5 - v * 0.5, 0] : has(/日出/) ? [0, 1 - v, 0, 0] : dir === '右' ? [0, 0, 1 - v, 0] : dir === '左' ? [1 - v, 0, 0, 0] : dir === '下' ? [0, 0, 0, 1 - v] : [0, 1 - v, 0, 0];
    return { fx: f, perChar };
  }
  if (has(/滑动|飞入|飞出|缓入|环绕滑入|滑动上升|滑动下落|顶出|甩出|螺旋|炸开/)) {
    const dir = (name.match(/向(.)/) ?? [])[1];
    const d = px * 2.2 * e; fade(1.4);
    if (dir === '左') f.x = -d; else if (dir === '右') f.x = d; else if (dir === '下') f.y = d; else if (has(/下落|螺旋/)) f.y = d; else f.y = -d;
    if (has(/向上/) && kind === 'out') f.y = -d; if (has(/向下/) && kind === 'in') f.y = -d;
    if (has(/旋转|螺旋/)) f.rot = e * 120; if (has(/炸开/)) { f.sx = f.sy = 1 + e * 1.2; }
    return { fx: f, perChar };
  }
  if (has(/折叠|翻动|翻转|空翻|翻书|躺下|圆柱|滚入|站起/)) { f.rx = e * (kind === 'out' ? -80 : 80); if (has(/水平|滚入/)) { f.ry = e * 90; f.rx = 0; } fade(1.2); return { fx: f, perChar }; }
  if (has(/弹|跃进|震动|呐喊|碰碰|便利|弹簧|弹弓|伸缩/)) {
    const q = kind === 'in' ? back(p, 2.4) : 1 - back(1 - p, 1.2);
    f.sx = f.sy = 0.4 + 0.6 * q; f.o = Math.min(1, kind === 'in' ? p * 4 : 1 - p * 1.6); if (has(/左/)) f.x = -(1 - q) * px * 1.5; if (has(/左上/)) f.y = (1 - q) * px; if (has(/上弹/)) f.y = (1 - q) * px * 1.4;
    return { fx: f, perChar };
  }
  if (has(/缩小/)) { f.sx = f.sy = 1 + e * 0.8; fade(1.3); return { fx: f, perChar }; }
  if (has(/轻微放大|慢速放大/)) { f.sx = f.sy = 1 - e * 0.1; fade(1.3); return { fx: f, perChar }; }
  if (has(/放大|生长|缩放|吸入|吸出|汇聚|收拢|二段/)) { const q = kind === 'in' ? out3(p) : p; f.sx = f.sy = kind === 'in' ? 0.45 + 0.55 * q : 1 - 0.55 * q; if (has(/吸入|汇聚|收拢/)) f.sx = f.sy = 1 + e * 0.6; if (has(/二段/)) f.sx = f.sy = p < 0.6 ? 0.5 + p * 1.1 : 1.16 - (p - 0.6) * 0.4; fade(1.5); return { fx: f, perChar }; }
  fade(1.2); f.sy = f.sx = 1 - e * 0.15; return { fx: f, perChar };
};

const track = (tr: [number, number][] | undefined, t: number, dflt: number) => {
  if (!tr || !tr.length) return dflt; if (tr.length === 1) return tr[0][1];
  return interpolate(t, tr.map((a) => a[0]), tr.map((a) => a[1]), C);
};
const styleAt = (st: Style[], i: number) => st.find((s) => i >= s.range[0] && i < s.range[1]) ?? st[0];

const SegView: React.FC<{ seg: Seg; text: string; lt: number; dy: number; k: number; tone?: string }> = ({ seg, text, lt, dy, k, tone }) => {
  const chars = [...text], n = Math.max(1, chars.length), baseSize = (seg.styles[0]?.size ?? 15) * K;
  const sc = track(seg.kf.scale, lt, seg.scale), rot = track(seg.kf.rot, lt, seg.rot), alpha = track(seg.kf.alpha, lt, seg.alpha);
  const cx = seg.kf.x ? 540 + track(seg.kf.x, lt, 0) * 540 : seg.x, cy = (seg.kf.y ? 960 - track(seg.kf.y, lt, 0) * 960 : seg.y) + dy;
  const px = baseSize * sc * Math.min(1, (seg.n + 0.6) / Math.max(1, [...text.replace(/\n/g, '')].length)) * k;
  const tIn = seg.in ? Math.min(1, lt / Math.max(0.05, seg.in.dur)) : 1, tOut = seg.out ? Math.min(1, Math.max(0, (lt - (seg.dur - seg.out.dur)) / Math.max(0.05, seg.out.dur))) : 0;
  const inFx = seg.in ? animFx(seg.in.name, 'in', tIn, 0, n, lt, px) : { fx: ID, perChar: false }, outFx = seg.out && tOut > 0 ? animFx(seg.out.name, 'out', tOut, 0, n, lt, px) : { fx: ID, perChar: false };
  const loop = seg.loop ? animFx(seg.loop.name, 'loop', 0, 0, n, lt, px) : { fx: ID, perChar: false };
  const whole = (a: Fx, b: Fx) => ({ o: a.o * b.o, x: a.x + b.x, y: a.y + b.y, sx: a.sx * b.sx, sy: a.sy * b.sy, rot: a.rot + b.rot, blur: a.blur + b.blur, rx: a.rx + b.rx, ry: a.ry + b.ry });
  const pc = inFx.perChar || outFx.perChar, wf = whole(inFx.perChar ? ID : inFx.fx, outFx.perChar ? ID : outFx.fx);
  const clip = inFx.fx.clip ?? (outFx.fx.clip ? outFx.fx.clip : undefined), shown = Math.min(inFx.fx.shown ?? 1, outFx.fx.shown ?? 1);
  const toneColor = tone;
  return (
    <div style={{ position: 'absolute', left: cx, top: cy, transform: `translate(-50%,-50%) translate(${wf.x}px,${wf.y}px) rotate(${rot + wf.rot + loop.fx.rot}deg) scale(${wf.sx},${wf.sy}) perspective(900px) rotateX(${wf.rx}deg) rotateY(${wf.ry}deg)`, opacity: alpha * wf.o, filter: wf.blur ? `blur(${wf.blur}px)` : undefined,
      clipPath: clip ? `inset(${clip[1] * 100}% ${clip[2] * 100}% ${clip[3] * 100}% ${clip[0] * 100}%)` : undefined, textAlign: seg.align === 3 ? 'right' : seg.align === 0 ? 'left' : 'center', whiteSpace: 'pre', lineHeight: 1.12 + seg.spacing, fontSize: px, letterSpacing: seg.ls * px }}>
      {chars.map((c, i) => {
        const s = styleAt(seg.styles, i), cf = pc ? animFx((inFx.perChar ? seg.in! : seg.out!).name, inFx.perChar ? 'in' : 'out', inFx.perChar ? tIn : tOut, i, n, lt, px).fx : ID, lp = seg.loop && loop.perChar ? animFx(seg.loop.name, 'loop', 0, i, n, lt, px).fx : ID;
        const hidden = shown < 1 && i / n >= shown;
        const sh = s.shadows.map((w) => `${Math.cos((w.angle * Math.PI) / 180) * w.dist * 1.2}px ${-Math.sin((w.angle * Math.PI) / 180) * w.dist * 1.2}px ${Math.max(1, w.blur * px * 1.5)}px ${w.color}${Math.round(w.alpha * 255).toString(16).padStart(2, '0')}`).join(',');
        const fillCss: React.CSSProperties = toneColor ? { color: toneColor } : s.fill.type === 'gradient' && s.fill.stops ? { backgroundImage: `linear-gradient(${180 - (s.fill.angle ?? 90)}deg, ${s.fill.stops.map(([p, col]) => `${col} ${Math.round(p * 100)}%`).join(',')})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' } : { color: s.fill.color ?? '#fff' };
        return <span key={i} style={{ display: c === '\n' ? 'inline' : 'inline-block', fontFamily: FONTS[s.font] ?? FONTS.sans, opacity: hidden ? 0 : cf.o * (1 - 0), transform: pc || lp.y ? `translate(${cf.x}px,${cf.y + lp.y}px) rotate(${cf.rot}deg) scale(${cf.sx},${cf.sy}) rotateX(${cf.rx}deg)` : undefined, filter: shOnly(sh, s.fill.type === 'gradient'), textShadow: s.fill.type === 'gradient' ? undefined : sh || undefined, WebkitTextStroke: s.stroke ? `${Math.max(1, s.stroke.w * px * 2)}px ${s.stroke.color}` : undefined, paintOrder: 'stroke fill', ...fillCss }}>{c === ' ' ? ' ' : c}</span>;
      })}
    </div>
  );
};
const shOnly = (sh: string, grad: boolean) => (grad && sh ? `drop-shadow(${sh.split(',')[0]})` : undefined);

/** 字幕样式预设：preset = 预设 id（见 CAP_PRESETS）；texts = 按段顺序替换的文字（少给的段用占位字，多给的忽略）；at = 开始秒；dy = 整体上下移（用 place_check 算）；k = 整体缩放；tone = 统一改色（可选）。 */
export const CapPreset: React.FC<{ preset: string; texts?: string[]; at: number; dy?: number; k?: number; tone?: string; speed?: number }> = ({ preset, texts = [], at, dy = 0, k = 1, tone, speed = 1 }) => {
  const t = useT(), spec = BY_ID[preset];
  if (!spec) throw new Error(`没有这个字幕预设 "${preset}"。可用 id 见 caption-presets.json`);
  const lt = (t - at) * speed;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {spec.segs.map((s, i) => lt >= s.start && lt <= s.start + s.dur ? <SegView key={i} seg={s} text={texts[i] ?? '示范文字'.slice(0, Math.max(2, s.n)).padEnd(s.n, '字').slice(0, s.n)} lt={lt - s.start} dy={dy} k={k} tone={tone} /> : null)}
    </AbsoluteFill>
  );
};
