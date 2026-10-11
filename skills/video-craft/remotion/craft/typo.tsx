// craft/typo — 5 个「字怎么搭配」的排版版式。来源：剪映口播模板包「1-2 文字排版形式参考」（59 帧逐帧看）+「1-3」(56 个演示) 的版式家族；原创实现。
// 搭配规则（来自 81–88 个版式的统计，详见 references/typography-pairing.md）：
//   颜色 ≤2 种（80% 的版式只用 1–2 种）：白 = 底，黄 = 重点/利益，红 = 痛点/转折；字体 ≤2 种（衬线粗体做主角 + 无衬线做配角）；
//   同一版式里最大字 : 最小字 中位数 1.5×（IQR 1.2–2.58×），≥4× 只给「主角词」。
// 安全区同样要守：所有字走 Zone/Txt/FitBox（量宽 → 缩小 → 推回）。
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FitBox, SAFE, Theme, Tone, Txt, W, Zone, env, lin, out3, pop, toneStyle, useT } from './kit';

type Base = { th: Theme; until: number };

/* 小标 + 大字叠搭（1-2 #1、#2、#7、#8）：小标签（黄）压在大字（白）的左上角，像贴上去的；可再加一个白底红字的小标。 */
export const LabelHero: React.FC<Base & { label: string; hero: string; at: number; heroAt?: number; tag?: string; tagAt?: number; labelTone?: Tone; heroSize?: number }> = ({ th, label, hero, at, heroAt, until, tag, tagAt, labelTone = 'accent', heroSize = 190 }) => {
  const t = useT();
  return (
    <Zone>
      <Txt th={th} at={at} until={until} y={1010} x={SAFE.left + 6} align="left" size={52} font={th.fonts.body} tone={labelTone} anim="left">{label}</Txt>
      <Txt th={th} at={heroAt ?? at + 0.12} until={until} y={1052} x={SAFE.left + 56} align="left" size={heroSize} tone="white" anim="slam">{hero}</Txt>
      {tag && t >= (tagAt ?? at + 0.5) - 0.02 && t < until + 0.25 && (
        <div style={{ position: 'absolute', left: SAFE.left + 56, top: 1052 + heroSize * 1.18, opacity: Math.min(1, pop(t, tagAt ?? at + 0.5, 0.26) * 1.6) * (1 - lin(t, until, until + 0.2)) }}>
          <FitBox align="left" yMid={1052 + heroSize * 1.18 + 28} style={{ fontFamily: th.fonts.body, fontSize: 44, color: '#B71C1C', background: '#fff', borderRadius: 10, padding: '2px 18px 4px' }}>{tag}</FitBox>
        </div>)}
    </Zone>
  );
};

/* 拉开字距的大字（1-2 #3 不要/赌博、#31 黑马、#42 放弃）：1–3 个字的主角词，字距拉到横跨整个宽度，像海报标题。上一行黄、下一行白（或红）。 */
export const SpreadHero: React.FC<Base & { top: string; bottom: string; at: number; bottomAt?: number; topTone?: Tone; bottomTone?: Tone; spanW?: number }> = ({ th, top, bottom, at, bottomAt, until, topTone = 'accent', bottomTone = 'white', spanW = 860 }) => {
  const spread = (s: string, size: number) => { const n = [...s].length; return n > 1 ? Math.max(6, (spanW - n * size) / n) : 0; };   // 字距加在每个字后面（含最后一个），总宽 = n·size + n·ls
  return (
    <Zone>
      <Txt th={th} at={at} until={until} y={1000} size={120} tone={topTone} anim="slam" ls={spread(top, 120)}>{top}</Txt>
      <Txt th={th} at={bottomAt ?? at + 0.2} until={until} y={1112} size={200} tone={bottomTone} anim="slam" ls={spread(bottom, 200)}>{bottom}</Txt>
    </Zone>
  );
};

/* 背景巨字 / 幽灵字（1-2 #25 烦、#51 重新活一次、1-3 #11 为什么、#35 100%）：一个巨大的半透明字当背景，前面叠一句小字点题。 */
export const GhostWord: React.FC<Base & { ghost: string; line: string; at: number; lineAt?: number; tone?: 'white' | 'pain' | 'accent2'; ghostSize?: number }> = ({ th, ghost, line, at, lineAt, until, tone = 'pain', ghostSize = 340 }) => {
  const t = useT(), p = out3(t, at, at + 0.4), o = Math.min(1, p * 1.5) * (1 - lin(t, until, until + 0.2));
  const col = tone === 'pain' ? 'rgba(255,59,78,0.30)' : tone === 'accent2' ? `${th.accent2}55` : 'rgba(255,255,255,0.18)';
  if (t < at - 0.02 || t > until + 0.25) return null;
  return (
    <Zone>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 960, textAlign: 'center', opacity: o, transform: `scale(${1.15 - 0.15 * p})`, fontFamily: th.fonts.display, fontSize: ghostSize, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
        <FitBox yMid={960 + ghostSize / 2} style={{ color: col, textShadow: 'none' }}>{ghost}</FitBox>
      </div>
      <Txt th={th} at={lineAt ?? at + 0.2} until={until} y={1150} size={62} font={th.fonts.body} anim="up">{line}</Txt>
    </Zone>
  );
};

/* 引用卡（1-2 #10、#11、#13、#26、#34；1-3 #38–39）：背景压暗 + 虚化，编号小标（白底黑字）+「引文」，关键词换黄；出处小字右对齐、灰色。 */
export type QLine = { t: string; hl?: boolean }[];
export const QuoteCard: React.FC<Base & { items: { tag?: string; lines: QLine[]; at: number }[]; source?: string; sourceAt?: number }> = ({ th, items, until, source, sourceAt }) => {
  const t = useT(), first = items[0].at - 0.2, o = env(t, first, until, 0.3, 0.25);
  if (o <= 0) return null;
  let y = 470;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: 'rgba(10,8,16,0.62)', backdropFilter: 'blur(16px)' }} />
      {items.map((it, k) => {
        const top = y, h = (it.tag ? 78 : 0) + it.lines.length * 70 + 44; y += h; const p = out3(t, it.at, it.at + 0.3);
        if (t < it.at - 0.02) return null;
        return (
          <div key={k} style={{ position: 'absolute', left: 0, right: 0, top: top + (1 - p) * 24, opacity: p, textAlign: 'center' }}>
            {it.tag && <div style={{ marginBottom: 14 }}><FitBox yMid={top + 30} style={{ fontFamily: th.fonts.hand, fontSize: 40, color: '#111', background: '#fff', borderRadius: 10, padding: '2px 24px 5px' }}>{it.tag}</FitBox></div>}
            {it.lines.map((ln, i) => (
              <div key={i} style={{ height: 70 }}>
                <FitBox yMid={top + 90 + i * 70} style={{ fontFamily: th.fonts.body, fontSize: 54, lineHeight: '70px', color: '#fff', textShadow: '0 4px 14px rgba(0,0,0,0.8)' }}>
                  {i === 0 && '“'}{ln.map((s, j) => <span key={j} style={s.hl ? { color: th.accent === '#95D024' ? '#fff589' : th.accent } : undefined}>{s.t}</span>)}{i === it.lines.length - 1 && '”'}
                </FitBox>
              </div>))}
          </div>
        );
      })}
      {source && t >= (sourceAt ?? items[items.length - 1].at + 0.4) - 0.02 && (
        <div style={{ position: 'absolute', left: SAFE.left, right: W - SAFE.rightLow, top: y + 4, textAlign: 'right', opacity: out3(t, sourceAt ?? items[items.length - 1].at + 0.4, (sourceAt ?? items[items.length - 1].at + 0.4) + 0.3), fontFamily: th.fonts.body, fontSize: 32, color: '#a9a5b8' }}>{source}</div>
      )}
    </AbsoluteFill>
  );
};

/* 章节标签（1-3 #47、#48）：黄色圆角块（斜体编号）+ 箭头 + 虚线框标题。比大数字轻，用来标「第几点」。 */
export const ChapterTag: React.FC<Base & { num: string; title: string; at: number; color?: string }> = ({ th, num, title, at, until, color = '#FFB300' }) => {
  const t = useT(), p = pop(t, at, 0.34), o = Math.min(1, p * 1.5) * (1 - lin(t, until, until + 0.2));
  if (t < at - 0.02 || t > until + 0.25) return null;
  return (
    <Zone>
      <div style={{ position: 'absolute', left: SAFE.left, top: 1040, display: 'flex', alignItems: 'center', opacity: o, transform: `translateX(${(1 - p) * -60}px)` }}>
        <div style={{ width: 150, height: 116, borderRadius: 14, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: th.fonts.hand, fontStyle: 'italic', fontSize: 82, color: '#1a1405', position: 'relative' }}>
          {num}<div style={{ position: 'absolute', right: -22, top: '50%', marginTop: -20, width: 0, height: 0, borderTop: '20px solid transparent', borderBottom: '20px solid transparent', borderLeft: `24px solid ${color}` }} />
        </div>
        <div style={{ marginLeft: 36, height: 116, border: `3px dashed ${color}`, borderRadius: 10, display: 'flex', alignItems: 'center', padding: '0 28px', fontFamily: th.fonts.display, fontSize: 58, color: '#fff', textShadow: '0 4px 14px rgba(0,0,0,0.8)', maxWidth: SAFE.rightLow - SAFE.left - 210 }}>
          <FitBox align="left" yMid={1040 + 58} style={{}}>{title}</FitBox>
        </div>
      </div>
    </Zone>
  );
};
