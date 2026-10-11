// craft/scenes — 「换场层」：每 5–10 秒把「画面」换掉（不只换字），避免整支都是同一个正脸。
// 全部用代码画（不花 AI 点数）：留存曲线卡 / 时间轴对比卡 / 手机划走 / 上卡下脸 / 记者出镜（抠像站前面）。
// 安全区同样要守：卡片 y 250–650、人像窗 y 690–1230、手机 y 270–1150，所有字 x 60–1010（y>900 右 950）。
import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame } from 'remotion';
import { FitBox, SAFE, Theme, Txt, W, H, env, lin, mix, out3, pop, sm, useT } from './kit';

const FACE = { x: 550, y: 640 };   // 底片里脸的中心（rec.mp4 原始构图）

/** 同一条口播视频裁出脸，放进一个窗（圆/圆角）。zoom = 视频缩放；faceY = 脸在窗里的纵向位置 0–1 */
export const FaceCard: React.FC<{ src: string; w: number; h: number; zoom: number; faceY?: number; style?: React.CSSProperties }> = ({ src, w, h, zoom, faceY = 0.45, style }) => (
  <div style={{ position: 'relative', width: w, height: h, overflow: 'hidden', background: '#16141f', ...style }}>
    <OffthreadVideo src={src} muted style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${w / 2 - zoom * FACE.x}px, ${h * faceY - zoom * FACE.y}px) scale(${zoom})` }} />
  </div>
);

const cardBox = (th: Theme): React.CSSProperties => ({ borderRadius: 40, overflow: 'hidden', background: 'linear-gradient(180deg, rgba(24,19,48,0.97), rgba(13,10,26,0.98))', border: `2px solid ${th.accent2}99`, boxShadow: `0 30px 80px rgba(0,0,0,0.65), 0 0 60px ${th.accent2}38` });

/** 上面一张内容卡，下面一个人像窗。内容卡里放什么由 children 决定。 */
export const SplitScene: React.FC<{ th: Theme; a: number; b: number; src: string; cardH?: number; children: (t: number) => React.ReactNode }> = ({ th, a, b, src, cardH = 400, children }) => {
  const t = useT();
  const o = env(t, a, b, 0.25, 0.22);
  if (o <= 0) return null;
  const p = out3(t, a, a + 0.34), q = pop(t, a + 0.1, 0.34), faceH = 540, faceY0 = SAFE.top + cardH + 40;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: `${th.bg}F2` }} />
      <div style={{ position: 'absolute', left: SAFE.left, top: SAFE.top + (1 - p) * -60, width: SAFE.right - SAFE.left, height: cardH, ...cardBox(th) }}>{children(t - a)}</div>
      <div style={{ position: 'absolute', left: 150, top: faceY0, transform: `scale(${0.9 + 0.1 * q})`, opacity: Math.min(1, q * 1.4), borderRadius: 44, overflow: 'hidden', boxShadow: `0 0 0 5px ${th.accent2}E6, 0 24px 70px rgba(0,0,0,0.7), 0 0 60px ${th.accent2}59` }}>
        <FaceCard src={src} w={780} h={Math.min(faceH, SAFE.bottom - faceY0 - 10)} zoom={0.8} faceY={0.42} />
      </div>
    </AbsoluteFill>
  );
};

/* ---- 内容卡 1：观众留存曲线（讲「没人看完」）---- */
export const RetentionCard: React.FC<{ th: Theme; t: number; title: string }> = ({ th, t, title }) => {
  const draw = out3(t, 0.25, 1.5), mark = pop(t, 1.15, 0.3);
  const d = 'M 70 120 C 150 124, 190 250, 260 292 S 480 330, 880 346';
  return (
    <svg width={SAFE.right - SAFE.left} height={400} viewBox="0 0 950 400" style={{ position: 'absolute', inset: 0 }}>
      <text x={40} y={62} fontFamily={th.fonts.hand} fontSize={44} fill="#fff">{title}</text>
      <text x={40} y={102} fontFamily={th.fonts.body} fontSize={26} fill={th.soft}>观众留存</text>
      <line x1={60} y1={360} x2={900} y2={360} stroke="#ffffff33" strokeWidth={2} /><line x1={60} y1={110} x2={60} y2={360} stroke="#ffffff33" strokeWidth={2} />
      <text x={64} y={392} fontSize={22} fill="#ffffff88" fontFamily={th.fonts.body}>0 秒</text><text x={840} y={392} fontSize={22} fill="#ffffff88" fontFamily={th.fonts.body}>结束</text>
      <path d={d + ' L 880 360 L 70 360 Z'} fill={`${th.accent2}22`} opacity={draw} />
      <path d={d} fill="none" stroke={th.accent} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} style={{ filter: `drop-shadow(0 0 14px ${th.accent}88)` }} />
      <g opacity={Math.min(1, mark * 1.5)} transform={`translate(260 ${292})`}>
        <line x1={0} y1={0} x2={0} y2={64} stroke="#ff4d6d" strokeWidth={4} strokeDasharray="8 8" /><circle r={13 * mark} fill="#ff4d6d" />
        <text x={22} y={62} fontFamily={th.fonts.hand} fontSize={34} fill="#ff4d6d">划走</text>
      </g>
    </svg>
  );
};

/* ---- 内容卡 2：时间轴对比（乱加特效 vs 节奏对齐）---- */
const COLORS = ['#8255FA', '#95D024', '#FF4D6D', '#FFBF17', '#38BDF8', '#F472B6'];
export const CompareCard: React.FC<{ th: Theme; t: number; leftLabel: string; rightLabel: string; leftAt: number; rightAt: number }> = ({ th, t, leftLabel, rightLabel, leftAt, rightAt }) => {
  const pl = out3(t, leftAt, leftAt + 0.5), pr = out3(t, rightAt, rightAt + 0.5);
  const messy = Array.from({ length: 13 }, (_, i) => ({ row: i % 6, x: (i * 53) % 150, w: 60 + ((i * 37) % 90), c: COLORS[i % 6] }));
  const rows = [0, 1, 2];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* 左：乱 */}
      <div style={{ position: 'absolute', left: 36, top: 36, width: 405, height: 250, opacity: pl }}>
        {messy.map((m, i) => <div key={i} style={{ position: 'absolute', top: m.row * 40, left: m.x + (i % 3) * 18, width: m.w * pl, height: 30, borderRadius: 8, background: m.c, opacity: 0.9 }} />)}
      </div>
      <div style={{ position: 'absolute', left: 36, top: 304, width: 405, textAlign: 'center', opacity: pl, fontFamily: th.fonts.hand, fontSize: 40, color: '#fff' }}><FitBox yMid={SAFE.top + 330} style={{}}>{leftLabel} <span style={{ color: '#ff4d6d' }}>✗</span></FitBox></div>
      <div style={{ position: 'absolute', left: 479, top: 40, width: 3, height: 320, background: '#ffffff44' }} />
      {/* 右：齐 */}
      <div style={{ position: 'absolute', left: 519, top: 36, width: 405, height: 250, opacity: pr }}>
        {[0, 1, 2, 3].map((k) => <div key={k} style={{ position: 'absolute', top: 0, bottom: 0, left: 20 + k * 100, width: 3, background: '#ffffff33' }} />)}
        {rows.map((r) => [0, 1, 2, 3].map((k) => <div key={r + '-' + k} style={{ position: 'absolute', top: 14 + r * 70, left: 20 + k * 100 + 6, width: 76 * pr, height: 44, borderRadius: 10, background: th.accent, opacity: 0.55 + r * 0.2 }} />))}
      </div>
      <div style={{ position: 'absolute', left: 519, top: 304, width: 405, textAlign: 'center', opacity: pr, fontFamily: th.fonts.hand, fontSize: 40, color: '#fff' }}><FitBox yMid={SAFE.top + 330} style={{}}>{rightLabel} <span style={{ color: th.accent }}>✓</span></FitBox></div>
    </div>
  );
};

/** 手机划走：黑底，手机里放着你的口播，右边三行字；到 swipeAt 手机往上划走 */
export const PhoneSwipe: React.FC<{ th: Theme; a: number; b: number; src: string; swipeAt: number; lines: { text: string; at: number; big?: boolean }[] }> = ({ th, a, b, src, swipeAt, lines }) => {
  const t = useT();
  const o = env(t, a, b, 0.2, 0.2);
  if (o <= 0) return null;
  const pin = out3(t, a, a + 0.35), sw = lin(t, swipeAt, swipeAt + 0.32), up = sw * sw * 1500;
  const PW = 480, PH = 840, PX = SAFE.left, PY = 290;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: `${th.bg}F5` }} />
      <div style={{ position: 'absolute', left: PX, top: PY + (1 - pin) * 120 - up, width: PW, height: PH, borderRadius: 60, padding: 10, background: '#2a2740', boxShadow: '0 30px 90px rgba(0,0,0,0.7)', opacity: Math.min(1, pin * 1.5), transform: `rotate(${-sw * 6}deg)` }}>
        <FaceCard src={src} w={PW - 20} h={PH - 20} zoom={0.9} faceY={0.34} style={{ borderRadius: 50 }} />
        <div style={{ position: 'absolute', right: 26, top: 470, display: 'flex', flexDirection: 'column', gap: 24 }}>{['♥', '✦', '➤'].map((c, i) => <div key={i} style={{ width: 54, height: 54, borderRadius: '50%', background: '#00000066', color: '#fff', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c}</div>)}</div>
        <div style={{ position: 'absolute', left: 30, right: 30, bottom: 30, height: 6, borderRadius: 3, background: '#ffffff44' }}><div style={{ width: `${12 + lin(t, a, swipeAt) * 18}%`, height: '100%', borderRadius: 3, background: '#fff' }} /></div>
      </div>
      {lines.map((l, i) => <Txt key={i} th={th} at={l.at} until={b - 0.05} y={560 + i * 128} x={PX + PW + 40} align="left" size={l.big ? 64 : 52} font={th.fonts.body} tone={l.big ? 'accent2' : 'white'} anim={l.big ? 'slam' : 'left'}>{l.text}</Txt>)}
    </AbsoluteFill>
  );
};

/** 记者出镜：黑底，上面一张内容卡，他（抠像）站在前面下半屏。matteRange = 抠像有的帧范围。 */
export const Reporter: React.FC<{ th: Theme; a: number; b: number; matteRange: [number, number]; cardH?: number; standIn?: boolean; children: (t: number) => React.ReactNode }> = ({ th, a, b, matteRange, cardH = 380, standIn, children }) => {
  const t = useT(), frame = useCurrentFrame();
  const o = env(t, a, b, 0.25, 0.22);
  if (o <= 0) return null;
  const p = out3(t, a, a + 0.34), S = 0.66, tx = 540 - S * FACE.x, ty = 960 - S * FACE.y, has = frame >= matteRange[0] && frame <= matteRange[1];
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 50% at 50% 55%, #26203e 0%, ${th.bg} 75%)` }} />
      <div style={{ position: 'absolute', left: SAFE.left, top: SAFE.top + (1 - p) * -50, width: SAFE.right - SAFE.left, height: cardH, ...cardBox(th) }}>{children(t - a)}</div>
      {!has && standIn && <div style={{ position: 'absolute', left: 540 - 230, top: 830 + (1 - p) * 80, width: 460, height: 700, borderRadius: '46% 46% 0 0', background: 'linear-gradient(180deg,#3a3650,#1c1a2a)', opacity: 0.85 }}><div style={{ position: 'absolute', left: 80, top: -170, width: 300, height: 360, borderRadius: '50%', background: 'linear-gradient(180deg,#46405e,#2a2640)' }} /></div>}
      {has && <Img src={staticFile(`craft/matte/rec/${frame}.webp`)} style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty + (1 - p) * 80}px) scale(${S})`, filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))' }} />}
    </AbsoluteFill>
  );
};

/** 章节清单卡（放进 Reporter 的卡里）：大数字 + 标题 + 打勾 + 一句收尾 */
export const ChapterCardBody: React.FC<{ th: Theme; t: number; num: string; title: string; chips: { text: string; at: number }[]; punch: { text: string; at: number } }> = ({ th, t, num, title, chips, punch }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <div style={{ position: 'absolute', left: 40, top: 14, fontFamily: th.fonts.hand, fontStyle: 'italic', fontSize: 120, color: th.accent, opacity: out3(t, 0.1, 0.4) }}>{num}</div>
    <div style={{ position: 'absolute', left: 240, top: 44, fontFamily: th.fonts.display, fontSize: 66, color: '#fff', opacity: out3(t, 0.2, 0.5), transform: `translateX(${(1 - out3(t, 0.2, 0.5)) * -40}px)` }}><FitBox align="left" yMid={SAFE.top + 80} style={{}}>{title}</FitBox></div>
    {chips.map((c, i) => <div key={i} style={{ position: 'absolute', left: 40 + i * 450, top: 190, width: 430, height: 84, borderRadius: 20, display: 'flex', alignItems: 'center', padding: '0 22px', boxSizing: 'border-box', background: `${th.accent}1F`, border: `3px solid ${th.accent}`, font: '600 40px "PingFang SC"', color: '#fff', opacity: Math.min(1, pop(t, c.at, 0.24) * 1.6), transform: `scale(${0.7 + 0.3 * pop(t, c.at, 0.24)})` }}>{c.text}<span style={{ marginLeft: 'auto', color: th.accent, fontSize: 52, fontWeight: 900 }}>✓</span></div>)}
    <div style={{ position: 'absolute', left: 40, top: 292, fontFamily: th.fonts.display, fontSize: 60, color: th.accent, opacity: Math.min(1, pop(t, punch.at, 0.24) * 1.6) }}><FitBox align="left" yMid={SAFE.top + 320} style={{}}>{punch.text}</FitBox></div>
  </div>
);

/* ================= 抖音精剪（参考片：剪辑 kiki 粗剪 vs 精剪）=================
   第一定律：每 1.5–3 秒一个视觉变化，音频连续、只换画面层。下面 4 个是「素材（B-roll）」类版式：讲到什么名词就切什么素材。
   素材（B-roll）= 实拍 / stock / AI 图或视频，作为 children 传进来；不传就是占位画面（预览用）。 */

/** 占位素材：渐层 + 大字「B-ROLL」。真用时换成 <OffthreadVideo> / <Img>。 */
export const BrollPlaceholder: React.FC<{ th: Theme; hue?: number; word?: string }> = ({ th, hue = 200, word = 'B-ROLL' }) => {
  const t = useT();
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: `linear-gradient(160deg, hsl(${hue} 55% 22%), hsl(${(hue + 60) % 360} 50% 12%))` }}>
      <div style={{ position: 'absolute', left: -120, top: 120, width: 700, height: 700, borderRadius: '50%', background: `hsl(${(hue + 30) % 360} 70% 45% / .35)`, transform: `translate(${t * 14}px, ${t * 8}px)` }} />
      <div style={{ position: 'absolute', right: -160, bottom: 80, width: 800, height: 800, borderRadius: '50%', background: `hsl(${(hue + 120) % 360} 60% 40% / .30)`, transform: `translate(${-t * 12}px, ${-t * 6}px)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: th.fonts.hand, fontSize: 120, letterSpacing: 8, color: 'rgba(255,255,255,0.16)' }}>{word}</div>
    </AbsoluteFill>
  );
};

/** 黄色标签牌：给素材命名（参考片里「3号海洋塑料清理装置」那种）。文字走 FitBox，不会出安全区。 */
export const LabelTag: React.FC<{ th: Theme; at: number; until: number; text: string; x?: number; y: number }> = ({ th, at, until, text, x = SAFE.left, y }) => {
  const t = useT(), p = pop(t, at, 0.3), o = Math.min(1, p * 1.5) * (1 - lin(t, until, until + 0.2));
  if (t < at - 0.02 || t > until + 0.25) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: o, transform: `scale(${0.7 + 0.3 * p}) rotate(-2deg)`, transformOrigin: '0 50%' }}>
      <FitBox align="left" yMid={y + 40} style={{ fontFamily: th.fonts.hand, fontSize: 50, color: '#1a1405', background: '#FFD21F', borderRadius: 14, padding: '4px 26px 8px', boxShadow: '0 10px 26px rgba(0,0,0,0.5)' }}>{text}</FitBox>
    </div>
  );
};

/** 全屏素材 + 小人像窗（PIP）：素材铺满，你缩成白边小窗，位置 tr/tl/bc 轮换（别遮素材的主体）。 */
export const PipBroll: React.FC<{ th: Theme; a: number; b: number; src: string; pos?: 'tr' | 'tl' | 'bc'; label?: string; broll?: React.ReactNode }> = ({ th, a, b, src, pos = 'tr', label, broll }) => {
  const t = useT(), o = env(t, a, b, 0.2, 0.2);
  if (o <= 0) return null;
  const p = pop(t, a + 0.15, 0.34), S = 270, XY = { tr: [SAFE.right - S - 20, SAFE.top + 40], tl: [SAFE.left + 10, SAFE.top + 40], bc: [(W - S) / 2, SAFE.bottom - S - 30] }[pos];
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.05 * lin(t, a, b)})` }}>{broll ?? <BrollPlaceholder th={th} />}</AbsoluteFill>
      <div style={{ position: 'absolute', left: XY[0], top: XY[1], width: S, height: S, borderRadius: '50%', overflow: 'hidden', border: '6px solid #fff', boxShadow: '0 14px 40px rgba(0,0,0,0.6)', transform: `scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 1.5) }}>
        <FaceCard src={src} w={S - 12} h={S - 12} zoom={0.4} faceY={0.5} />
      </div>
      {label && <LabelTag th={th} at={a + 0.3} until={b - 0.1} text={label} y={SAFE.bottom - 150} />}
    </AbsoluteFill>
  );
};

/** 上人下素材：上面是你（脸不动），下面一条素材；素材命名用标签牌。 */
export const SplitBroll: React.FC<{ th: Theme; a: number; b: number; src: string; label?: string; broll?: React.ReactNode }> = ({ th, a, b, src, label, broll }) => {
  const t = useT(), o = env(t, a, b, 0.2, 0.2), p = out3(t, a, a + 0.34);
  if (o <= 0) return null;
  const SPLIT = 1040;
  return (
    <AbsoluteFill style={{ opacity: o, background: th.bg }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: SPLIT }}><FaceCard src={src} w={W} h={SPLIT} zoom={1.0} faceY={0.46} /></div>
      <div style={{ position: 'absolute', left: 0, top: SPLIT + (1 - p) * (H - SPLIT), width: W, height: H - SPLIT, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${1 + 0.06 * lin(t, a, b)})` }}>{broll ?? <BrollPlaceholder th={th} hue={150} />}</div>
      </div>
      <div style={{ position: 'absolute', left: 0, top: SPLIT - 4, width: W, height: 8, background: th.accent, opacity: p }} />
      {label && <LabelTag th={th} at={a + 0.4} until={b - 0.1} text={label} y={SPLIT + 36} />}
    </AbsoluteFill>
  );
};

/** 底部滑入素材条：你全屏不动，素材从底部滑上来盖住下半屏（45%）。字幕让开：字幕放在素材条上沿之上。 */
export const BrollBottom: React.FC<{ th: Theme; a: number; b: number; label?: string; broll?: React.ReactNode }> = ({ th, a, b, label, broll }) => {
  const t = useT(), o = env(t, a, b, 0.05, 0.25), p = out3(t, a, a + 0.38);
  if (o <= 0) return null;
  const TOP = 1060;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: 'absolute', left: 0, top: TOP + (1 - p) * (H - TOP), width: W, height: H - TOP, overflow: 'hidden', boxShadow: '0 -20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${1 + 0.06 * lin(t, a, b)})` }}>{broll ?? <BrollPlaceholder th={th} hue={20} />}</div>
      </div>
      {label && <LabelTag th={th} at={a + 0.45} until={b - 0.1} text={label} y={TOP + 36} />}
    </AbsoluteFill>
  );
};

/** 海报大字：整屏 AI 海报/素材 + 压暗 40% + 一个金/红的 hero 大字（关键名词才出，会跨镜头长大）。 */
export const PosterHero: React.FC<{ th: Theme; a: number; b: number; word: string; tone?: 'accent' | 'pain'; sub?: string; broll?: React.ReactNode }> = ({ th, a, b, word, tone = 'accent', sub, broll }) => {
  const t = useT(), o = env(t, a, b, 0.2, 0.2), p = out3(t, a + 0.1, a + 0.45);
  if (o <= 0) return null;
  const grow = 0.92 + 0.2 * lin(t, a, b), col = tone === 'pain' ? 'linear-gradient(180deg,#FFB3B3 0%,#FF3B4E 50%,#B5121F 100%)' : th.gAccent;
  const size = Math.min(300, ((SAFE.rightLow - SAFE.left) / Math.max(1, [...word].length)) * 0.95);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill>{broll ?? <BrollPlaceholder th={th} hue={280} word="" />}</AbsoluteFill>
      <AbsoluteFill style={{ background: 'rgba(0,0,0,0.4)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', transform: `scale(${grow * (0.8 + 0.2 * p)})`, opacity: p, fontFamily: th.fonts.display, fontSize: size, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
        <FitBox yMid={640 + size / 2} style={{ background: col, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.7))' }}>{word}</FitBox>
      </div>
      {sub && <Txt th={th} at={a + 0.5} until={b - 0.1} y={640 + size * 1.25} size={52} font={th.fonts.body} anim="up">{sub}</Txt>}
    </AbsoluteFill>
  );
};

export { mix, sm };
