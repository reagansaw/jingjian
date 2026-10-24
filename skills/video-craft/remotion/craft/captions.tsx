// craft/captions — 字幕（逐句，时间对着他讲的那个字）。每条最多一行、宽度 ≤12（中文 1、英文 / 数字 0.55），底边贴 y≤1230，整条走 FitBox（超出安全区就缩小）。
// 字幕的 from / to 用 tools/make_captions.py 从「whisper 逐字时间 + 校对后的文字」生成。重点词（hl）换强调色。
import React from 'react';
import { FitBox, SAFE, Theme, out3, useT } from './kit';

export type CaptionItem = { from: number; to: number; text: string };

export const Captions: React.FC<{ th: Theme; items: CaptionItem[]; hl?: string[]; size?: number; bottom?: number }> = ({ th, items, hl = [], size = 54, bottom = SAFE.bottom - 20 }) => {
  const t = useT();
  const it = items.find((c) => t >= c.from && t < c.to);
  if (!it) return null;
  const p = out3(t, it.from, it.from + 0.12);
  const top = bottom - size * 1.2, shadow = '0 3px 10px rgba(0,0,0,0.95), 0 0 3px rgba(0,0,0,0.9)';
  const keys = [...hl].filter(Boolean).sort((a, b) => b.length - a.length).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = keys.length ? it.text.split(new RegExp(`(${keys.join('|')})`, 'g')) : [it.text];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top, textAlign: 'center', opacity: Math.min(1, p * 2), transform: `scale(${0.94 + 0.06 * p})`, fontFamily: th.fonts.body, fontSize: size, lineHeight: 1.2, whiteSpace: 'nowrap', letterSpacing: 1 }}>
      <FitBox yMid={top + size * 0.6} style={{ color: '#fff', textShadow: shadow }}>
        {parts.map((s, i) => (keys.length && i % 2 === 1 ? <span key={i} style={{ color: th.accent }}>{s}</span> : <React.Fragment key={i}>{s}</React.Fragment>))}
      </FitBox>
    </div>
  );
};
