// craft/ui-behind — 「字在人后」的 Edit 版：写在 edit.json 的 `behind` 数组里，和视频同一个镜头容器（跟着推近 / 平移）。
// 层次：视频 → 字 → 抠像（人=不透明）。抠像按「源视频帧号」命名：`mk_subject_matte.py 视频 起 止 public/matte/xxx`。
// fail-closed：窗口外或没有抠像的帧，不画字。
import React from 'react';
import { Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { FitBox, Theme } from './kit';

export type BehindItem = {
  text: string; at: number; until: number;
  /** 抠像目录（public/ 下），文件名 <帧号>.webp */
  matte: string; from: number; to: number;
  y?: number; size?: number; small?: string; tone?: 'cream' | 'accent' | 'white';
};
const C = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

export const BehindWord: React.FC<{ th: Theme; item: BehindItem }> = ({ th, item }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps;
  const { text, at, until, matte, from, to, y = 620, size = 420, small, tone = 'cream' } = item;
  if (t < at || t > until || f < from || f > to) return null;
  const lt = t - at, a = interpolate(lt, [0, 0.12], [0, 1], { ...C, easing: Easing.out(Easing.cubic) }), o = a * interpolate(t, [until - 0.15, until], [1, 0], C);
  const col = tone === 'accent' ? th.accent : tone === 'white' ? '#fff' : '#F4EEDC';
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: y - size * 0.55, textAlign: 'center', fontFamily: th.fonts.display, fontSize: size, lineHeight: 1.1, color: col, opacity: o, transform: `scale(${1.25 - 0.25 * a})`, textShadow: '0 10px 40px rgba(0,0,0,0.45)', whiteSpace: 'nowrap' }}>
        <FitBox yMid={y} style={{}}>{text}</FitBox>
      </div>
      {small && <div style={{ position: 'absolute', left: 0, right: 0, top: y + size * 0.5, textAlign: 'center', fontFamily: th.fonts.display, fontSize: size * 0.16, color: th.accent, opacity: o * interpolate(lt, [0.25, 0.4], [0, 1], C) }}>{small}</div>}
      <Img src={staticFile(`${matte}/${f}.webp`)} style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920 }} />
    </>
  );
};
