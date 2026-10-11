// craft/layouts — 12 款口播版式。每款 = 一个组件，参数是文字 + 时间（秒）。
// 编号对应剪映「70口播工程 · 1-2 文字排版形式参考」图鉴的第几款（#xx），方便学生对照。
//
// 【安全区 —— 每款都必须守，见 kit.tsx 的 SAFE】上 250 / 下 1250 / 左 60 / 右 1010（y>900 时右 950）。
// 人脸很大（下巴约 y 860，已把画面上移），所以字只能放在「胸口带」：y ≈ 880–1250。
// 所有版式的坐标都按 y≈1050 起排，再由 <Zone> 整体上移 CHEST_DY 落进胸口带；文字由 Txt/FitBox 自动量宽、超出就缩小并推回。
import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { FitBox, Pill, SAFE, Strike, Theme, Tone, Txt, Typed, VHero, W, H, Zone, env, lin, mix, out3, pop, sm, toneStyle, useT } from './kit';

type Base = { th: Theme; until: number };

/* #23 胸口小字 + 大字：一句铺垫 + 一个要点词（最常用，重点单独放大） */
export const ChestBig: React.FC<Base & { small: string; big: string; at: number; bigAt?: number; tone?: Tone; bigSize?: number }> = ({ th, small, big, at, bigAt, until, tone = 'accent', bigSize = 190 }) => (
  <Zone>
    <Txt th={th} at={at} until={until} y={1050} size={54} font={th.fonts.body} anim="up">{small}</Txt>
    <Txt th={th} at={bigAt ?? at + 0.12} until={until} y={1108} size={bigSize} tone={tone} anim="slam">{big}</Txt>
  </Zone>
);

/* #24 划掉：旧说法（银色）被手画一笔划掉，再换新说法 */
export const StrikeSwap: React.FC<Base & { lead: string; old: string; at: number; strikeAt: number; next?: string; nextAt?: number; oldSize?: number }> = ({ th, lead, old, at, strikeAt, until, next, nextAt, oldSize = 130 }) => {
  const t = useT();
  const gone = next && nextAt !== undefined ? sm(t, nextAt - 0.05, nextAt + 0.15) : 0;
  const sz = Math.min(oldSize, (SAFE.rightLow - SAFE.left) / (old.length * 1.04)), sw = old.length * sz * 1.0;   // 旧说法太长就缩，划线跟着缩
  return (
    <Zone>
      <Txt th={th} at={at} until={until} y={1056} size={54} font={th.fonts.body} anim="up">{lead}</Txt>
      <div style={{ opacity: 1 - gone }}>
        <Txt th={th} at={at + 0.1} until={until} y={1120} size={sz} tone="chrome" anim="pop">{old}</Txt>
        <Strike th={th} at={strikeAt} until={until} x={(W - sw) / 2} y={1120 + sz * 0.62} w={sw} />
      </div>
      {next && nextAt !== undefined && <Txt th={th} at={nextAt} until={until} y={1100} size={oldSize * 1.3} tone="accent" anim="slam">{next}</Txt>}
    </Zone>
  );
};

/* #53 左齐阶梯：每一行比上一行缩进更多，上一行变暗（适合「A / B / 结果」递进） */
export const LeftStair: React.FC<Base & { rows: { pre: string; key: string; at: number; big?: boolean }[]; y0?: number }> = ({ th, rows, until, y0 = 980 }) => (
  <Zone>
    {rows.map((r, i) => {
      const last = i === rows.length - 1;
      const y = y0 + i * 100 + (last && r.big ? 6 : 0);
      return (
        <Txt key={i} th={th} at={r.at} until={until} y={y} x={SAFE.left + i * 44} align="left" size={last && r.big ? 58 : 50} font={th.fonts.body} anim={last && r.big ? 'slam' : 'left'} dimAt={rows[i + 1]?.at}>
          {r.pre}<span style={{ fontFamily: th.fonts.display, fontSize: last && r.big ? 112 : 92, marginLeft: 12, verticalAlign: -8, ...toneStyle(th, last && r.big ? 'accent2' : 'accent') }}>{r.key}</span>
        </Txt>
      );
    })}
  </Zone>
);

/* #41 A → B：左边一个词，箭头划过去，右边结果砸出来（因果 / 前后对比） */
export const AtoB: React.FC<Base & { a: string; b: string; at: number; bAt: number }> = ({ th, a, b, at, bAt, until }) => {
  const t = useT();
  const p = out3(t, bAt - 0.3, bAt - 0.05);
  const aSize = 112, ax = SAFE.left + a.length * aSize + 30, bx = ax + 150;
  const bSize = Math.min(b.length <= 2 ? 176 : b.length === 3 ? 140 : 108, ((SAFE.rightLow - bx) / Math.max(1, b.length)) * 0.98);   // B 接在箭头后，剩下多宽就用多宽
  return (
    <Zone>
      <Txt th={th} at={at} until={until} y={1130} x={SAFE.left} align="left" size={aSize} tone="chrome" anim="left">{a}</Txt>
      {t >= bAt - 0.3 && t < until + 0.2 && (
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: 1 - lin(t, until - 0.1, until + 0.1) }}>
          <path d={`M ${ax} 1190 L ${ax + 110} 1190`} stroke={th.accent} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
          <path d={`M ${ax + 80} 1158 L ${ax + 118} 1190 L ${ax + 80} 1222`} fill="none" stroke={th.accent} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" opacity={lin(t, bAt - 0.18, bAt - 0.08)} />
        </svg>)}
      <Txt th={th} at={bAt} until={until} y={1190 - bSize * 0.62} x={bx} align="left" size={bSize} tone="accent" anim="slam">{b}</Txt>
    </Zone>
  );
};

/* #17 两栏对比：中线划下来，左右各一组（A 方案 ｜ B 方案）。两栏各 430 宽，装得下才不会出界 */
export type Col = { pre: string; key: string; tail?: string; at: number };
export const TwoColumn: React.FC<Base & { left: Col; right: Col; lineAt?: number }> = ({ th, left, right, until, lineAt }) => {
  const t = useT(), la = lineAt ?? left.at, CW = 430, LX = SAFE.left, RX = 560;
  const col = (c: Col, x: number, tone: Tone) => (
    <>
      <Txt th={th} at={c.at} until={until} y={1034} x={x} w={CW} align="left" size={46} font={th.fonts.body} anim="up">{c.pre}</Txt>
      <Txt th={th} at={c.at + 0.05} until={until} y={1100} x={x} w={CW} align="left" size={88} font={th.fonts.hand} tone={tone} anim="pop" ls={0}>{c.key}</Txt>
      {c.tail && <Txt th={th} at={c.at + 0.4} until={until} y={1210} x={x} w={CW} align="left" size={52} font={th.fonts.body} anim="up">{c.tail}</Txt>}
    </>
  );
  return (
    <Zone>
      {t >= la - 0.05 && t < until + 0.2 && <div style={{ position: 'absolute', left: 528, top: 1010, width: 4, height: 290 * out3(t, la, la + 0.3), background: 'rgba(255,255,255,0.75)', opacity: 1 - lin(t, until - 0.1, until + 0.1) }} />}
      {col(left, LX, 'accent')}{col(right, RX, 'chrome')}
    </Zone>
  );
};

/* #9 荧光条：一句铺垫 + 两条荧光色的条（并列要点，像荧光笔划过的重点） */
export const Bars: React.FC<Base & { lead: string; leadAt: number; bars: { text: string; at: number }[] }> = ({ th, lead, leadAt, bars, until }) => {
  const t = useT();
  return (
    <Zone>
      <Txt th={th} at={leadAt} until={until} y={1034} size={60} font={th.fonts.body} anim="up">{lead}</Txt>
      {bars.map((b, i) => t >= b.at - 0.02 && t < until + 0.3 ? (
        <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: 1122 + i * 104, textAlign: 'center', opacity: Math.min(1, pop(t, b.at, 0.24) * 1.6) * (1 - lin(t, until - 0.1, until + 0.1)) }}>
          <FitBox yMid={1122 + i * 104 + 50} style={{ fontFamily: th.fonts.hand, fontSize: 80, color: th.onAccent, background: th.accent, borderRadius: 18, padding: '2px 38px 8px', boxShadow: '0 12px 30px rgba(0,0,0,0.5)' }}>
            <span style={{ display: 'inline-block', transform: `scale(${0.6 + 0.4 * pop(t, b.at, 0.24)}) rotate(${i % 2 ? 1.5 : -1.5}deg)` }}>{b.text}</span>
          </FitBox>
        </div>) : null)}
    </Zone>
  );
};

/* #35 右墙竖排：重点词竖着贴在右边墙上，不挡脸（2–4 个字最好）。不进胸口带——它在上半屏的右墙，但整列必须在 y 270 以下、x 950 以内 */
export const VerticalWall: React.FC<Base & { chars: { c: string; at: number; tone?: Tone }[]; x?: number; top?: number; size?: number }> = ({ th, chars, until, x = 850, top = SAFE.top + 20, size }) => {
  const sz = size ?? Math.min(170, Math.floor((SAFE.bottom - top - 60) / (chars.length * 1.04)));   // 字多就缩，整列不超过安全区下沿
  return <VHero th={th} chars={chars} until={until} x={x} top={top} size={sz} />;
};

/* #27 压暗 + 大问句：四周压暗，只留一个问句（情绪低、悬念、反问） */
export const DarkQuestion: React.FC<Base & { small: string; big: string; at: number; bigAt?: number }> = ({ th, small, big, at, bigAt, until }) => {
  const t = useT();
  const v = env(t, at - 0.2, until + 0.1, 0.5, 0.3) * 0.96;
  return (
    <>
      <AbsoluteFill style={{ opacity: v, background: 'radial-gradient(ellipse 70% 46% at 50% 38%, rgba(4,2,10,0.15) 0%, rgba(4,2,10,0.96) 100%)' }} />
      <Zone>
        <Txt th={th} at={at} until={until} y={1090} size={58} font={th.fonts.body} anim="blur">{small}</Txt>
        <Txt th={th} at={bigAt ?? at + 0.4} until={until} y={1166} size={160} tone="accent2" anim="blur">{big}</Txt>
      </Zone>
    </>
  );
};

/* 章节清单 01 / 02：大数字 + 标题 + 打勾的小卡片（讲方法、讲步骤）。整块压进胸口带，高度 ≤ 360 */
export const Chapter: React.FC<Base & { num: string; title: string; at: number; chips: { text: string; at: number }[]; punch?: { text: string; at: number } }> = ({ th, num, title, at, chips, punch, until }) => {
  const t = useT(), CW = 440, gap = 20;
  return (
    <Zone dy={-110}>
      <Txt th={th} at={at} until={until} y={900} x={SAFE.left} align="left" size={150} font={th.fonts.hand} tone="accent" anim="slam" ls={0}><i>{num}</i></Txt>
      <Txt th={th} at={at + 0.05} until={until} y={930} x={SAFE.left + 210} align="left" size={76} tone="chrome" anim="left">{title}</Txt>
      {chips.map((c, i) => t >= c.at - 0.02 && t < until + 0.2 ? (
        <div key={i} style={{ position: 'absolute', left: SAFE.left + i * (CW + gap), top: 1070, width: CW, height: 96, borderRadius: 22, display: 'flex', alignItems: 'center', padding: '0 24px', background: `${th.accent}1F`, border: `3px solid ${th.accent}`, boxSizing: 'border-box',
          font: '600 44px "PingFang SC"', color: '#fff', opacity: Math.min(1, pop(t, c.at, 0.24) * 1.6) * (1 - lin(t, until - 0.1, until + 0.1)), transform: `scale(${0.7 + 0.3 * pop(t, c.at, 0.24)})` }}>
          {c.text}<span style={{ marginLeft: 'auto', color: th.accent, fontSize: 58, fontWeight: 900 }}>✓</span></div>) : null)}
      {punch && <Txt th={th} at={punch.at} until={until} y={1186} x={SAFE.left} align="left" size={88} tone="accent" anim="left">{punch.text}</Txt>}
    </Zone>
  );
};

/* #25 巨字填满：头顶一个巨大的空心字，讲到关键句从下往上填满（落点金句）。top ≥ 250（安全区上沿） */
export const GiantFill: React.FC<Base & { char: string; at: number; fillAt: number; size?: number; top?: number }> = ({ th, char, at, fillAt, until, size = 400, top = SAFE.top }) => {
  const t = useT();
  if (t < at - 0.02 || t > until + 0.25) return null;
  const p = out3(t, at, at + 0.25), fill = sm(t, fillAt, fillAt + 0.9), o = Math.min(1, p * 1.5) * (1 - lin(t, until, until + 0.2));
  const base: React.CSSProperties = { position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: th.fonts.display, fontSize: size, lineHeight: 1.1 };
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${1.4 - 0.4 * p})`, transformOrigin: `540px ${top + size * 0.55}px`, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined }}>
      <div style={{ ...base, color: `${th.accent2}38`, WebkitTextStroke: `6px ${th.accent2}` }}>{char}</div>
      <div style={{ ...base, color: th.accent, clipPath: `inset(${(1 - fill) * 100}% 0 0 0)`, filter: `drop-shadow(0 0 40px ${th.accent}73)` }}>{char}</div>
    </AbsoluteFill>
  );
};

/* #38 圆窗逐字打出：黑底，上面一个圆形人像窗，下面一个字一个字打出你讲的话（金句、引用）
   window = 圆窗里放什么（通常是同一条口播视频裁出人脸）。圆窗 400，窗顶 ≥ 270；字在 y 760–1240 之内，整行自动缩进安全宽度。 */
export const TypedQuote: React.FC<Base & { at: number; lines: { toks: [string, number][]; size?: number; tone?: Tone; pre?: string; post?: string }[]; window?: React.ReactNode }> = ({ th, at, lines, window, until }) => {
  const t = useT();
  const o = env(t, at, until, 0.3, 0.25);
  if (o <= 0) return null;
  let y = 760;
  return (
    <AbsoluteFill style={{ opacity: o, background: th.bg }}>
      <div style={{ position: 'absolute', left: 340, top: SAFE.top + 20, width: 400, height: 400, borderRadius: '50%', overflow: 'hidden', boxShadow: `0 0 0 5px ${th.accent2}E6, 0 0 60px ${th.accent2}80`, background: '#1c1a2a' }}>{window}</div>
      <div style={{ position: 'absolute', left: SAFE.left + 20, top: 690, fontFamily: th.fonts.display, fontSize: 130, lineHeight: 1, color: th.accent2 }}>“</div>
      {lines.map((l, i) => {
        const size = l.size ?? 80, yy = y; y += size * 1.15 + 18;
        const next = lines[i + 1]?.toks[0][1] ?? Infinity;
        return <Typed key={i} th={th} toks={l.toks} until={until} x={SAFE.left + 30} y={yy} size={size} tone={l.tone} pre={l.pre} post={l.post} cursor={t < next} />;
      })}
    </AbsoluteFill>
  );
};

/* #3 字在人后：字贴在墙上，上面再盖一层抠出来的人（需要逐帧抠像 matteSrc；没有就退回字在人前）。字放在头两侧，会被夹进安全区 */
export const BehindPerson: React.FC<Base & { chars: { c: string; at: number; x: number; y?: number; tone?: Tone }[]; at: number; matteSrc?: (frame: number) => string | null; size?: number }> = ({ th, chars, at, until, matteSrc, size = 230 }) => {
  const t = useT(), frame = useCurrentFrame();
  const src = matteSrc?.(frame);
  const half = size / 2;
  return (
    <>
      {chars.map((ch, i) => {
        if (t < ch.at - 0.02 || t > until + 0.2) return null;
        const p = pop(t, ch.at, 0.22), o = Math.min(1, p * 1.6) * (1 - lin(t, until, until + 0.18));
        const x = Math.max(SAFE.left + half, Math.min(SAFE.right - half, ch.x)), y = Math.max(SAFE.top + half, ch.y ?? 560);   // 整个字夹进安全区
        return <div key={i} style={{ position: 'absolute', left: x - size, top: y - size * 0.6, width: size * 2, textAlign: 'center', fontFamily: th.fonts.display, fontSize: size, lineHeight: 1.2, opacity: o,
          transform: `scale(${1.5 - 0.5 * Math.min(1, p)})`, filter: p < 1 ? `blur(${(1 - p) * 12}px)` : undefined }}><span style={{ ...toneStyle(th, ch.tone ?? 'accent') }}>{ch.c}</span></div>;
      })}
      {src && t >= at && t <= until + 0.2 && <Img src={src} style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }} />}
    </>
  );
};

/* 签名卡：名字 + 人设一句话 + 系列名（片尾，不加重音效，留干净收尾）。整块 ≤ y 1240 */
export const SignatureCard: React.FC<{ th: Theme; at: number; name: string; slogan: [string, string, string]; tag?: string; y?: number }> = ({ th, at, name, slogan, tag, y = 980 }) => {
  const t = useT();
  if (t < at) return null;
  const p = out3(t, at, at + 0.4), l2 = out3(t, at + 0.25, at + 0.6);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(to bottom, rgba(6,4,14,0) 55%, rgba(6,4,14,0.7) 70%)', opacity: p }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 24}px)`, fontFamily: th.fonts.hand, fontSize: 52, color: '#fff', letterSpacing: 8 }}>{name}</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: y + 70, textAlign: 'center', opacity: p, transform: `scale(${1.06 - 0.06 * p})`, fontFamily: th.fonts.display, fontSize: 92, letterSpacing: 2, whiteSpace: 'nowrap' }}>
        <FitBox yMid={y + 116} style={{}}>
          <span style={{ ...toneStyle(th, 'chrome'), marginRight: '0.04em' }}>{slogan[0]}</span><span style={{ ...toneStyle(th, 'accent') }}>{slogan[1]}</span><span style={{ ...toneStyle(th, 'chrome'), marginLeft: '0.22em' }}>{slogan[2]}</span>
        </FitBox>
      </div>
      <div style={{ position: 'absolute', left: 340, top: y + 190, width: 400, height: 4, background: `linear-gradient(90deg, transparent, ${th.accent2}, ${th.accent}, transparent)`, opacity: l2, transform: `scaleX(${l2})` }} />
      {tag && <div style={{ position: 'absolute', left: 0, right: 0, top: y + 208, textAlign: 'center', opacity: l2, fontFamily: th.fonts.hand, fontSize: 36, color: th.soft, letterSpacing: 3 }}>{tag}</div>}
    </AbsoluteFill>
  );
};

export { Pill, mix };
