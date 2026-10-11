// craft/glass — 「玻璃字」和「字在人后」。原创实现；配方来自作者之前一个项目里反复用过的做法。
//
// 【玻璃字 GlassWord】半透明的渐层字：颜色还是金黄，但背后画面的明暗纹理会透进字里，像一块毛玻璃。
//   做法 = 同一个字叠两层：底层普通半透明渐层（baseAlpha 0.28，定住颜色 + 一点投影）+ 上层「强光」混合（mix-blend-mode: hard-light，lightAlpha 1，
//   把背后的纹理透进字里）。
//   🔴 硬规则：两层**不能被任何带 transform / opacity / filter 的外层包住**，否则强光混合只会混到「透明底」，看不到背后纹理。
//   所以本组件不能走 FitBox / Zone（它们都用 transform）——自己用 fitSize 估算字号，入场动画只动「每一层自己的透明度 / top / 字号」。
//   🔴 它要混合的「背后画面」必须和它在同一个镜头容器里（同一个 stacking context）：把它放进你放视频的那个 div 里面，而不是外面。
//   ⚠ 背后画面要有明暗起伏（木纹、砖墙、窗帘）才看得出玻璃感；一整片平的深色墙几乎看不出来。
//
// 【字在人后 TextBehind】层次：背景画面 → 字 → 抠像 PNG（人 = 不透明，其余透明）盖在最上面 = 字被人挡住一点。
//   抠像素材要和画面逐帧对齐：字和抠像都放在**和视频同一个镜头容器**里（跟着手持晃动 / 推近一起走，字才像「贴在墙上」）。
//   抠像用 macOS Vision 逐帧出（人：tools/mk_matte.py；任意主体如猫 / 产品：tools/subjectlift.swift）。仅 macOS。
//   没有抠像的那一帧**不画字**（fail-closed）：宁可没字，也不要字盖在脸上。
import React from 'react';
import { Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { SAFE, Theme, W, H, fitSize, lin, out3, useT } from './kit';

export const GLASS: Record<'gold' | 'pearl' | 'rose' | 'aqua', string> = {
  gold: 'linear-gradient(180deg, rgba(255,240,140,0.92) 0%, rgba(255,205,40,0.9) 45%, rgba(230,150,0,0.9) 100%)',
  pearl: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(225,232,250,0.9) 50%, rgba(170,182,215,0.9) 100%)',
  rose: 'linear-gradient(180deg, rgba(255,214,225,0.94) 0%, rgba(255,140,170,0.9) 50%, rgba(214,70,120,0.9) 100%)',
  aqua: 'linear-gradient(180deg, rgba(200,255,250,0.94) 0%, rgba(80,225,215,0.9) 50%, rgba(20,150,170,0.9) 100%)',
};

/** 玻璃字。x = 水平中心（默认 540），y = 字块顶部。size 太大会按安全区宽度自动缩小（不用 transform）。 */
export const GlassWord: React.FC<{ th: Theme; text: string; size: number; at: number; until: number; y: number; x?: number; grad?: keyof typeof GLASS | string; italic?: boolean;
  baseAlpha?: number; lightAlpha?: number; font?: string; maxW?: number }> = ({ th, text, size, at, until, y, x = W / 2, grad = 'gold', italic = true, baseAlpha = 0.28, lightAlpha = 1, font, maxW }) => {
  const t = useT();
  if (t < at - 0.02 || t > until + 0.25) return null;
  const p = out3(t, at, at + 0.35), o = p * (1 - lin(t, until, until + 0.2));
  const mw = maxW ?? Math.min(2 * (x - SAFE.left), 2 * (SAFE.rightLow - x));
  const sz = fitSize(text, size, mw, -size * 0.03) * (0.92 + 0.08 * p);                               // 入场：字号从 92% 长到 100%（不用 transform）
  const bg = (GLASS as Record<string, string>)[grad] ?? grad;
  const st: React.CSSProperties = { fontFamily: font ?? th.fonts.hand, fontSize: sz, fontWeight: 800, fontStyle: italic ? 'italic' : 'normal', lineHeight: 1, letterSpacing: -sz * 0.03, whiteSpace: 'nowrap',
    backgroundImage: bg, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent' };
  const box: React.CSSProperties = { position: 'absolute', left: x - mw / 2, width: mw, top: y + (1 - p) * 30, textAlign: 'center' };   // 容器本身没有 opacity / transform / filter
  return (
    <div style={box}>
      <div style={{ ...st, opacity: baseAlpha * o, filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.28))' }}>{text}</div>
      <div style={{ ...st, position: 'absolute', left: 0, right: 0, top: 0, opacity: lightAlpha * o, mixBlendMode: 'hard-light' }}>{text}</div>
    </div>
  );
};

/** 字在人后：把 children（字）和抠像叠在一起。放进「和视频同一个镜头容器」里，坐标用视频的 1080×1920。
 *  matteSrc(frame) 返回这一帧的抠像 PNG 路径；返回 null = 这一帧没有抠像 → 不画字。 */
export const TextBehind: React.FC<{ matteSrc: (frame: number) => string | null; children: React.ReactNode }> = ({ matteSrc, children }) => {
  const frame = useCurrentFrame(), src = matteSrc(frame);
  if (!src) return null;
  return (
    <>
      {children}
      <Img src={src} style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }} />
    </>
  );
};

/** 预览用的「墙」：有明暗起伏（木板条 + 暗角），玻璃字才看得出透明感。 */
export const TexturedWall: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,214,150,0.35), rgba(0,0,0,0) 70%), repeating-linear-gradient(90deg, #5b4331 0 70px, #8a6a4a 70px 100px, #4a3626 100px 150px, #9a7a58 150px 170px)' }} />
);
/** 预览：墙 + 字 + 占位人形抠像（没有真人）。children = 字（GlassWord 或别的）。 */
export const WallDemo: React.FC<{ children: React.ReactNode; person?: boolean; dy?: number }> = ({ children, person = true, dy = 0 }) => {
  const { fps } = useVideoConfig();
  void fps;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', isolation: 'isolate', background: '#000' }}>
      <TexturedWall />
      {children}
      {person && <Img src={staticFile('craft/standin-matte.png')} style={{ position: 'absolute', left: 0, top: dy, width: W, height: H }} />}
    </div>
  );
};

/** 给字腾出「头顶空间」：把整个镜头容器（视频 + 字 + 抠像）往下移 dy，顶部露出的 dy 像素用视频顶部那一条的**镜像**补上。
 *  为什么要这样：字在人后时，人只能遮住字的「一点点」（≤20%），字必须一眼读得清。画面里头顶没有空间（头顶 ≈ y 230，安全区上沿 250），
 *  字只能放在头的高度，头必然挡掉中间一大块。所以先把人往下移，让字放在头顶上方，头只盖住字的下缘。
 *  children 用「容器坐标」（= 视频坐标，容器下移后屏幕 y = 容器 y + dy）。
 *  ⚠ 镜像补顶只适合「视频顶部那 dy 像素里没有人」（只有墙 / 背景）的素材；有人的话会镜像出半个头。 */
export const Headroom: React.FC<{ src: string; startFrom?: number; dy: number; children: React.ReactNode }> = ({ src, startFrom = 0, dy, children }) => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: dy, overflow: 'hidden' }}>
      <OffthreadVideo src={src} startFrom={startFrom} muted style={{ position: 'absolute', left: 0, top: dy, width: W, height: H, transformOrigin: '0 0', transform: 'scaleY(-1)' }} />
    </div>
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translateY(${dy}px)`, isolation: 'isolate' }}>
      <OffthreadVideo src={src} startFrom={startFrom} muted style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }} />
      {children}
    </div>
  </div>
);
