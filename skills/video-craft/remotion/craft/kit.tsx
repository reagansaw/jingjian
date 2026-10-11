// craft/kit — 口播版式的通用零件。时间一律是「合成开始后的秒数」，不依赖任何稿子。
// 来源：实战成片里反复用的 8 个零件，去掉了时间锚点 / 人脸轨迹 / 故事专用场景。
import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender } from 'remotion';

export const W = 1080, H = 1920;

/* ---------- 安全区（维护者定的；社媒竖屏 UI 会盖住边缘）----------
   上 250：状态栏/搜索栏 · 下 1250：下面 35% 是文案 + CTA 按钮 · 左 60 · 右 1010（y>900 的右侧有互动按钮 → 950）
   所有「字」必须整个落在里面。Txt / FitBox 会自动缩小 + 推回；字幕最多两行、每行 ≤12 字。 */
export const SAFE = { top: 250, bottom: 1250, left: 60, right: 1010, rightLow: 950, lowFrom: 900 };
export const safeRight = (yMid: number) => (yMid > SAFE.lowFrom ? SAFE.rightLow : SAFE.right);
/** 「胸口带」：脸（下巴约 y 860）以下到安全区下沿 1250 之间，只有 ~390px。版式的字都按 1050 起排，再整体上移 CHEST_DY 落进这一带。 */
export const CHEST_DY = -150;
export const ZoneCtx = createContext(0);
/** 把一整个版式的字整体移进胸口带（背景/暗角不要放进来） */
export const Zone: React.FC<{ dy?: number; children: React.ReactNode }> = ({ dy = CHEST_DY, children }) => (
  <ZoneCtx.Provider value={dy}><div style={{ position: 'absolute', inset: 0, transform: `translateY(${dy}px)` }}>{children}</div></ZoneCtx.Provider>
);
/** 估算一行字的宽度（中日韩 ≈1em，英文数字 ≈0.58em，加字距）——给逐字打出这种「宽度会变」的字提前算好缩放 */
export const estW = (text: string, size: number, ls = 2) => [...text].reduce((a, c) => a + (/[\u0000-\u00ff]/.test(c) ? size * 0.58 : size) + ls, 0);
export const fitSize = (text: string, size: number, maxW = SAFE.rightLow - SAFE.left, ls = 2) => Math.min(size, size * (maxW / Math.max(1, estW(text, size, ls))));

/** 量真实宽度，超出安全区就缩小，再把位置推回安全区内。align 决定缩放的原点。 */
export const FitBox: React.FC<{ align?: 'center' | 'left' | 'right'; yMid: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ align = 'center', yMid, style, children }) => {
  const ref = useRef<HTMLSpanElement>(null), dy = useContext(ZoneCtx);
  const [m, setM] = useState({ s: 1, dx: 0 });
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const w = el.offsetWidth; if (!w) return;
    let l = 0, n: HTMLElement | null = el; while (n) { l += n.offsetLeft; n = n.offsetParent as HTMLElement | null; }
    const L = SAFE.left + 6, R = safeRight(yMid + dy) - 10, s = Math.min(1, (R - L) / w), sw = w * s;   // 留一点余量：字距/投影会比量出来的宽几个像素
    const bl = align === 'center' ? l + w / 2 - sw / 2 : align === 'left' ? l : l + w - sw, br = bl + sw;
    const dx = bl < L ? L - bl : br > R ? R - br : 0;
    if (Math.abs(s - m.s) > 0.002 || Math.abs(dx - m.dx) > 0.5) setM({ s, dx });
  });
  return <span ref={ref} style={{ ...style, display: 'inline-block', transform: `translateX(${m.dx}px) scale(${m.s})`, transformOrigin: align === 'center' ? '50% 50%' : align === 'left' ? '0 50%' : '100% 50%' }}>{children}</span>;
};

/* ---------- 主题：颜色 + 字体。换主题 = 换一个对象 ---------- */
export type Tone = 'white' | 'chrome' | 'accent' | 'accent2';
export type Theme = {
  name: string;
  bg: string;             // 黑底面板底色
  accent: string;         // 主强调色（荧光/金/红）
  accent2: string;        // 副强调色（紫/…）
  soft: string;           // 淡色（小标题）
  onAccent: string;       // 压在强调色底上的字色
  gAccent: string; gAccent2: string; gChrome: string;   // 渐层字（上亮下暗）
  fonts: { display: string; body: string; hand: string };
};
export const THEME_DARK_LIME: Theme = {
  name: 'dark-lime', bg: '#0B0912', accent: '#95D024', accent2: '#8255FA', soft: '#B9A2FF', onAccent: '#10140A',
  gAccent: 'linear-gradient(180deg,#DFFF8E 0%,#95D024 48%,#5B8A0E 100%)',
  gAccent2: 'linear-gradient(180deg,#E6DCFF 0%,#A486FF 45%,#6A3CE8 100%)',
  gChrome: 'linear-gradient(180deg,#FFFFFF 0%,#EDEAF8 45%,#A9A3C4 100%)',
  fonts: { display: 'CraftSong', body: 'CraftDouyin', hand: 'CraftSmiley' },
};
export const THEME_DARK_GOLD: Theme = {
  name: 'dark-gold', bg: '#0C0B09', accent: '#FFBF17', accent2: '#B71C1C', soft: '#E9D9A6', onAccent: '#1A1405',
  gAccent: 'linear-gradient(180deg,#FFF1B0 0%,#FFBF17 50%,#B07A00 100%)',
  gAccent2: 'linear-gradient(180deg,#FFB3B3 0%,#E53935 50%,#8E1313 100%)',
  gChrome: 'linear-gradient(180deg,#FFFFFF 0%,#F1ECDD 45%,#B4AB92 100%)',
  fonts: { display: 'CraftSong', body: 'CraftDouyin', hand: 'CraftSmiley' },
};

/* ---------- 行业主题（来自 66 个行业成片的风格家族，见 references/industry-styles.md）---------- */
const hex2 = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixHex = (a: string, b: string, t: number) => '#' + hex2(a).map((v, i) => Math.round(v + (hex2(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
/** 由「强调色」生成渐层字（上亮下暗）+ 其余主题字段。 */
export const makeTheme = (o: { name: string; bg: string; accent: string; accent2: string; soft: string; onAccent: string; fonts: Theme['fonts'] }): Theme => ({
  ...o,
  gAccent: `linear-gradient(180deg,${mixHex(o.accent, '#ffffff', 0.55)} 0%,${o.accent} 50%,${mixHex(o.accent, '#000000', 0.42)} 100%)`,
  gAccent2: `linear-gradient(180deg,${mixHex(o.accent2, '#ffffff', 0.6)} 0%,${mixHex(o.accent2, '#ffffff', 0.12)} 45%,${mixHex(o.accent2, '#000000', 0.35)} 100%)`,
  gChrome: 'linear-gradient(180deg,#FFFFFF 0%,#F1ECDD 45%,#B4AB92 100%)',
});
const F = { song: 'CraftSong', smiley: 'CraftSmiley', douyin: 'CraftDouyin' };   // 本库自带的三种可商用字体
/** A 商务金红：法律 / 金融 / 贷款 / 房产 / 教育（52% 的行业成片）。原包常用得意黑 + 金 #ffbf17 + 深红 #b71c1c。 */
export const THEME_BIZ_GOLD_RED = makeTheme({ name: 'biz-gold-red', bg: '#0C0B09', accent: '#FFBF17', accent2: '#B71C1C', soft: '#E9D9A6', onAccent: '#1A1405', fonts: { display: F.smiley, body: F.song, hand: F.smiley } });
/** B 国风米黄：养生 / 女性情感 / 心理。原包常用古典体（**不随仓库**，这里退回思源 Heavy）+ 米黄 #fff589 + 深红。 */
export const THEME_GUOFENG_CREAM = makeTheme({ name: 'guofeng-cream', bg: '#0D0B09', accent: '#FFF589', accent2: '#B71C1C', soft: '#E9D7A4', onAccent: '#1A1708', fonts: { display: F.song, body: F.song, hand: F.song } });
/** C 知识明黄：知识付费 / 职场 / 创业 IP。原包常用抖音美好体 + 思源宋体 + 明黄 #fff589 + 深红。 */
export const THEME_KNOWLEDGE_YELLOW = makeTheme({ name: 'knowledge-yellow', bg: '#0B0A10', accent: '#FFF589', accent2: '#B71C1C', soft: '#FFDC8B', onAccent: '#1A1708', fonts: { display: F.song, body: F.douyin, hand: F.smiley } });
export const THEMES = { 'dark-lime': THEME_DARK_LIME, 'biz-gold-red': THEME_BIZ_GOLD_RED, 'guofeng-cream': THEME_GUOFENG_CREAM, 'knowledge-yellow': THEME_KNOWLEDGE_YELLOW } as const;

/* ---------- 字体（全部可商用：思源宋体 OFL / 得意黑 OFL / 抖音美好体 免费商用）---------- */
export const FONT_FILES: [string, string][] = [
  ['CraftSong', 'fonts/SourceHanSerifSC-Heavy.otf'],
  ['CraftSmiley', 'fonts/SmileySans.otf'],
  ['CraftDouyin', 'fonts/DouyinSans.otf'],
];
export const FONT_BASE = 'craft/';   // 字体放 public/craft/fonts/；独立 repo 里改成 ''
export const useCraftFonts = () => {
  const [h] = useState(() => delayRender('craft-fonts'));
  useEffect(() => {
    // 字体文件缺了不要卡渲染：退到系统自带的中文字体（Mac: 宋体-简 / 苹方；Win: 微软雅黑；Linux: Noto CJK）。字形会不同，但字照样出。
    const FALLBACK: Record<string, string> = { CraftSong: "local('Songti SC'), local('Noto Serif CJK SC'), local('SimSun')", CraftSmiley: "local('PingFang SC'), local('Noto Sans CJK SC'), local('Microsoft YaHei')", CraftDouyin: "local('PingFang SC'), local('Noto Sans CJK SC'), local('Microsoft YaHei')" };
    const load = (name: string, src: string) => new FontFace(name, src).load().then((ff) => { (document as any).fonts.add(ff); });
    Promise.all(FONT_FILES.map(([name, file]) => load(name, `url(${staticFile(FONT_BASE + file)})`).catch(() => load(name, FALLBACK[name]).catch(() => undefined))))
      .then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
  }, [h]);
};

/** 原包教学工程里统一的「硬投影」：黑色、透明度 0.9、偏下偏右、边缘很硬（距离 5 / 角度 −45° / 扩散 0.025）。CSS 近似；剪映的「距离 5」不是 px。
 *  本库默认用柔投影（见 toneStyle），没有改成这个；要还原原包质感：`style={{ textShadow: SHADOW_PACK }}`。 */
export const SHADOW_PACK = '4px 4px 2px rgba(0,0,0,0.9)';

/* ---------- 缓动 / 时间 ---------- */
const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
export const lin = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
export const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
export const out3 = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
export const pop = (t: number, t0: number, d = 0.3) => interpolate(t, [t0, t0 + d], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.8)) });
export const env = (t: number, a: number, b: number, fi = 0.22, fo = 0.2) => Math.min(lin(t, a, a + fi), 1 - lin(t, b - fo, b));
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;
export const useT = () => { const { fps } = useVideoConfig(); return useCurrentFrame() / fps; };

/* ---------- 字的颜色：白 / 银 / 强调 / 副强调 ---------- */
export const toneStyle = (th: Theme, tone: Tone): React.CSSProperties => {
  if (tone === 'white') return { color: '#fff', textShadow: '0 4px 16px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.9)' };
  const g = tone === 'accent' ? th.gAccent : tone === 'accent2' ? th.gAccent2 : th.gChrome;
  const glow = tone === 'accent' ? ` drop-shadow(0 0 26px ${th.accent}47)` : tone === 'accent2' ? ` drop-shadow(0 0 28px ${th.accent2}73)` : '';
  // 渐层字（background-clip:text）会继承父层 text-shadow，影子盖在渐层上变黑一坨 → 一律关掉
  return { background: g, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', textShadow: 'none', display: 'inline-block', filter: `drop-shadow(0 6px 18px rgba(0,0,0,0.85))${glow}` };
};

/* ================= 零件 ================= */
export type Anim = 'pop' | 'slam' | 'blur' | 'up' | 'left';

/** 一段字：入场动画 + 到时间淡出。slam=从大缩小(重击) pop=弹出 blur=模糊聚焦 up=上滑 left=左滑入 */
export const Txt: React.FC<{ th: Theme; at: number; until: number; y: number; size: number; children: React.ReactNode; tone?: Tone; font?: string; x?: number;
  align?: 'center' | 'left' | 'right'; rot?: number; anim?: Anim; ls?: number; dimAt?: number; w?: number }> =
  ({ th, at, until, y, size, children, tone = 'white', font, x = 0, align = 'center', rot = 0, anim = 'pop', ls = 2, dimAt, w }) => {
    const t = useT();
    if (t < at - 0.02 || t > until + 0.22) return null;
    const dur = anim === 'blur' ? 0.5 : 0.24;
    const p = interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing: anim === 'pop' ? Easing.out(Easing.back(1.8)) : Easing.out(Easing.cubic) });
    const o = Math.min(1, p * 1.6) * (1 - lin(t, until, until + 0.2)) * (dimAt ? mix(1, 0.42, lin(t, dimAt - 0.05, dimAt + 0.2)) : 1);
    const tr = anim === 'pop' ? `scale(${0.6 + 0.4 * p})` : anim === 'slam' ? `scale(${1.55 - 0.55 * p})` : anim === 'up' ? `translateY(${(1 - p) * 34}px)` : anim === 'left' ? `translateX(${(1 - p) * -60}px)` : `scale(${1.08 - 0.08 * p})`;
    const pos: React.CSSProperties = align === 'center' ? { left: x, right: -x, textAlign: 'center' } : align === 'left' ? { left: x, textAlign: 'left' } : { right: x, textAlign: 'right' };
    return (
      <div style={{ position: 'absolute', top: y, ...pos, width: w, opacity: o, transform: `${tr} rotate(${rot}deg)`, transformOrigin: align === 'center' ? '50% 50%' : align === 'left' ? '0 50%' : '100% 50%',
        fontFamily: font ?? th.fonts.display, fontSize: size, lineHeight: 1.12, letterSpacing: ls, whiteSpace: 'nowrap', filter: (anim === 'blur' || anim === 'slam') && p < 1 ? `blur(${(1 - p) * 12}px)` : undefined }}>
        <FitBox align={align} yMid={y + size / 2} style={toneStyle(th, tone)}>{children}</FitBox>
      </div>
    );
  };

/** 手画的一笔划掉 */
export const Strike: React.FC<{ th: Theme; at: number; until: number; x: number; y: number; w: number; color?: string; sw?: number }> = ({ th, at, until, x, y, w, color, sw = 12 }) => {
  const t = useT();
  if (t < at || t > until + 0.22) return null;
  const p = out3(t, at, at + 0.24), o = 1 - lin(t, until, until + 0.2);
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: o }}>
      <path d={`M ${x} ${y + 6} C ${x + w * 0.3} ${y - 14}, ${x + w * 0.62} ${y + 16}, ${x + w} ${y - 6}`} fill="none" stroke={color ?? th.accent2} strokeWidth={sw} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))' }} />
    </svg>
  );
};

/** 竖排大字（贴右墙），一个字一个字砸出来 */
export const VHero: React.FC<{ th: Theme; chars: { c: string; at: number; tone?: Tone }[]; until: number; x?: number; top?: number; size?: number }> = ({ th, chars, until, x = 850, top = SAFE.top + 20, size = 170 }) => {
  const t = useT();
  if (t < chars[0].at - 0.05 || t > until + 0.3) return null;
  const o = 1 - lin(t, until, until + 0.25);
  return (
    <div style={{ position: 'absolute', left: x - size / 2, top, width: size, opacity: o, fontFamily: th.fonts.display, fontSize: size, lineHeight: 1.04, textAlign: 'center' }}>
      {chars.map((ch, i) => {
        const p = interpolate(t, [ch.at, ch.at + 0.2], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
        return <div key={i} style={{ opacity: Math.min(1, p * 1.6), transform: `scale(${1.55 - 0.55 * p})`, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined }}>
          <span style={{ ...toneStyle(th, ch.tone ?? 'chrome'), display: 'inline-block' }}>{ch.c}</span></div>;
      })}
    </div>
  );
};

/** 一个字一个字打出来（每个字钉在你讲那个字的时间），后面跟光标。toks = [字, 秒][] */
export const Typed: React.FC<{ th: Theme; toks: [string, number][]; until: number; x: number; y: number; size: number; tone?: Tone; font?: string; cursor?: boolean; pre?: string; post?: string }> =
  ({ th, toks, until, x, y, size, tone = 'white', font, cursor = true, pre = '', post = '' }) => {
    const t = useT();
    if (t < toks[0][1] - 0.15 || t > until + 0.22) return null;
    const full = pre + toks.map(([c]) => c).join('') + post;
    size = fitSize(full, size, SAFE.rightLow - x);          // 整句打完的宽度不能出安全区（打字过程中字号不跳）
    const o = lin(t, toks[0][1] - 0.15, toks[0][1] - 0.02) * (1 - lin(t, until, until + 0.2));
    const n = toks.filter(([, at]) => t >= at - 0.03).length, done = n >= toks.length && t > toks[toks.length - 1][1] + 0.45;
    const shown = toks.slice(0, n).map(([c], i) => (/^[A-Za-z]/.test(c) ? (i > 0 ? ' ' : '') + c + ' ' : c)).join('').replace(/\s+/g, ' ').trim();
    const cur = cursor && !done && Math.floor(t * 3.2) % 2 === 0;
    return (
      <div style={{ position: 'absolute', left: x, top: y, opacity: o, fontFamily: font ?? th.fonts.display, fontSize: size, lineHeight: 1.15, letterSpacing: 2, whiteSpace: 'nowrap' }}>
        <span style={{ ...toneStyle(th, tone), display: 'inline-block' }}>{n > 0 ? pre : ''}{shown}{n >= toks.length ? post : ''}</span>
        <span style={{ display: 'inline-block', width: size * 0.1, height: size * 0.86, marginLeft: size * 0.07, verticalAlign: -size * 0.06, background: tone === 'accent' ? th.accent : '#fff', opacity: cur ? 0.95 : 0 }} />
      </div>
    );
  };

/** 荧光条 / 标签 */
export const Pill: React.FC<{ th: Theme; color?: string; children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ th, color, children, size = 50, style }) => {
  const c = color ?? th.accent;
  return (
    <div style={{ position: 'absolute', fontFamily: th.fonts.hand, fontSize: size, whiteSpace: 'nowrap', color: c === th.accent ? th.onAccent : '#fff', background: c, borderRadius: size * 0.32, padding: `${size * 0.08}px ${size * 0.44}px ${size * 0.12}px`, ...style }}>{children}</div>
  );
};

/** 把一段「秒数 → 进度」的入场做成通用 hook：返回 0→1 的弹出进度 */
export const usePop = (at: number, d = 0.24) => pop(useT(), at, d);

/** 台面：版式预览用的背景。有视频就铺视频，没有就是深色渐层 + 一个人形占位 */
export const StageBg: React.FC<{ th: Theme; children?: React.ReactNode }> = ({ th, children }) => (
  <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 50% at 50% 38%, #26233a 0%, ${th.bg} 70%)`, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 540 - 210, top: 300, width: 420, height: 520, borderRadius: '50% 50% 46% 46%', background: 'linear-gradient(180deg,#3a3650,#1c1a2a)', opacity: 0.7 }} />
    <div style={{ position: 'absolute', left: 540 - 380, top: 760, width: 760, height: 700, borderRadius: '46% 46% 0 0', background: 'linear-gradient(180deg,#2c2940,#16141f)', opacity: 0.7 }} />
    {children}
  </div>
);

/** 检查用：画出安全区（上 250 / 下 1250 / 左 60 / 右 1010，y>900 右 950）。渲染时传 guides 打开，一眼看出哪个字越界。 */
export const SafeGuides: React.FC = () => (
  <svg width={W} height={H} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    <rect x={SAFE.left} y={SAFE.top} width={SAFE.right - SAFE.left} height={SAFE.bottom - SAFE.top} fill="none" stroke="#ff2d55" strokeWidth={3} strokeDasharray="14 10" />
    <line x1={SAFE.rightLow} y1={SAFE.lowFrom} x2={SAFE.rightLow} y2={SAFE.bottom} stroke="#ff2d55" strokeWidth={3} strokeDasharray="14 10" />
    <line x1={SAFE.rightLow} y1={SAFE.lowFrom} x2={SAFE.right} y2={SAFE.lowFrom} stroke="#ff2d55" strokeWidth={3} strokeDasharray="14 10" />
    <text x={SAFE.left + 8} y={SAFE.top + 30} fill="#ff2d55" fontSize={26}>安全区 250–1250 · 60–1010（y&gt;900 右 950）</text>
  </svg>
);
