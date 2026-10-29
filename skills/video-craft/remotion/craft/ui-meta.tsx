// craft/ui-meta — 「界面比喻」类特效（第二批）：用剪辑软件 / 应用界面的样子把「讲的事」画出来。参考演示片逐帧观察后重写，无任何对方素材。
import React from 'react';
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import { SAFE, Theme, useT } from './kit';

const C = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const oc = Easing.out(Easing.cubic);
const rnd = (i: number) => { const x = Math.sin(i * 91.7 + 13.3) * 43758.5453; return x - Math.floor(x); };
const win = (t: number, a: number, b: number, fi = 0.12, fo = 0.15) => interpolate(t, [a, a + fi, b - fo, b], [0, 1, 1, 0], C);
const pad = (n: number, w = 2) => String(Math.floor(n)).padStart(w, '0');

/** 时间轴（参考 5.4–6.4 秒）：深色圆角面板从左滑入；标题 + 逐帧跳动的等宽时间码；黄色字幕轨条、胶片缩略图左→右铺满、绿 / 橙两条波形、红色播放头扫过。讲「自动剪辑 / 一条条拼起来」。 */
export const TimelinePanel: React.FC<{ th: Theme; label?: string; at: number; until: number; y?: number }> = ({ th, label = 'Timeline', at, until, y = 960 }) => {
  const t = useT();
  if (t < at || t > until + 0.2) return null;
  const lt = t - at, o = win(t, at, until, 0.05, 0.15), sx = interpolate(lt, [0, 0.2], [-700, 0], { ...C, easing: oc }), head = interpolate(lt, [0.15, until - at - 0.1], [0, 1], C);
  const tc = `00:00:${pad(Math.floor(lt))}:${pad((lt % 1) * 30)}`, w = 900, h = 330;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
      <div style={{ position: 'absolute', left: 90 + sx, top: y - h / 2, width: w, height: h, borderRadius: 30, background: 'rgba(16,26,22,0.94)', border: '1.5px solid rgba(255,255,255,0.14)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 28, top: 20, fontFamily: th.fonts.body, fontSize: 30, color: 'rgba(255,255,255,0.8)' }}>{label}</div>
        <div style={{ position: 'absolute', right: 28, top: 20, fontFamily: 'monospace', fontSize: 30, color: th.accent }}>{tc}</div>
        <div style={{ position: 'absolute', left: 28, top: 80, width: w - 56, height: 38, borderRadius: 8, background: '#E9C93B' }} />
        <div style={{ position: 'absolute', left: 28, top: 132, width: w - 56, height: 80, display: 'flex', gap: 4 }}>
          {Array.from({ length: 14 }, (_, i) => <div key={i} style={{ flex: 1, borderRadius: 6, background: `hsl(${(i * 31) % 360},25%,${30 + rnd(i) * 20}%)`, opacity: interpolate(lt, [0.1 + i * 0.03, 0.2 + i * 0.03], [0, 1], C) }} />)}
        </div>
        {[0, 1].map((r) => <svg key={r} width={w - 56} height={48} style={{ position: 'absolute', left: 28, top: 226 + r * 50 }}>{Array.from({ length: 70 }, (_, i) => { const a = (4 + 20 * Math.abs(Math.sin(i * 0.7 + r) * rnd(i + r * 9))); return <rect key={i} x={i * ((w - 56) / 70)} y={24 - a / 2} width={5} height={a} rx={2} fill={r ? '#F08A3C' : '#35E07A'} />; })}</svg>)}
        <div style={{ position: 'absolute', left: 28 + (w - 56) * head, top: 70, width: 4, height: h - 80, background: '#FF3B30', boxShadow: '0 0 10px #FF3B30' }} />
      </div>
    </AbsoluteFill>
  );
};

/** 拖入素材（参考 4.4–5.6 秒）：虚线圆角卡 + ↓ 图标 + 「拖入原始素材」；一张竖版缩略图沿弧线飞进去并缩小；文字换成「已导入」，黄点涨成黄色对勾圆。 */
export const DropZone: React.FC<{ th: Theme; label?: string; doneLabel?: string; src?: string; at: number; until: number; y?: number }> = ({ th, label = '拖入原始素材', doneLabel = '已导入素材', src, at, until, y = 980 }) => {
  const t = useT();
  if (t < at || t > until + 0.2) return null;
  const lt = t - at, o = win(t, at, until, 0.15, 0.2), k = interpolate(lt, [0.25, 0.8], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) }), done = lt > 0.8, chk = interpolate(lt, [0.8, 1.0], [0, 1], { ...C, easing: Easing.out(Easing.back(2)) });
  const cx = 540, cy = y, sx = 900, sy = y - 520, px = sx + (cx - sx) * k - Math.sin(k * Math.PI) * 120, py = sy + (cy - sy) * k, sc = 1 - 0.7 * k;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
      <div style={{ position: 'absolute', left: 190, top: y - 150, width: 700, height: 300, borderRadius: 36, border: '4px dashed rgba(120,200,150,0.7)', background: 'rgba(14,34,26,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, boxShadow: '0 20px 50px rgba(0,0,0,0.45)' }}>
        {!done && <div style={{ fontSize: 70, color: 'rgba(160,230,190,0.9)' }}>↓</div>}
        {done && <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F2D230', color: '#1a1405', fontSize: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${chk})` }}>✓</div>}
        <div style={{ fontFamily: th.fonts.body, fontSize: 44, color: '#fff' }}>{done ? doneLabel : label}</div>
      </div>
      {k < 1 && <div style={{ position: 'absolute', left: px - 90 * sc, top: py - 160 * sc, width: 180 * sc, height: 320 * sc, borderRadius: 16, overflow: 'hidden', background: 'linear-gradient(160deg,#7a5cff,#3fb6ff)', boxShadow: '0 14px 30px rgba(0,0,0,0.5)' }}>{src && <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}</div>}
    </AbsoluteFill>
  );
};

/** 色板取色（参考 8.6–10.2 秒）：奶油色卡片上滑，3 个空色块；吸管图标依次飞到画面上的点，落点冒一圈波纹，色块填上颜色 + 色号。
 *  colors 里写 { hex, at, x, y }：x/y 是吸管落点（成片坐标，应落在画面里有那个颜色的位置）。 */
export const Palette: React.FC<{ th: Theme; title?: string; colors: { hex: string; at: number; x: number; y: number }[]; at: number; until: number; y?: number }> = ({ th, title = 'SAMPLED', colors, at, until, y = 1060 }) => {
  const t = useT();
  if (t < at || t > until + 0.2) return null;
  const lt = t - at, o = win(t, at, until, 0.05, 0.2), up = interpolate(lt, [0, 0.25], [120, 0], { ...C, easing: oc });
  const cur = [...colors].reverse().find((c) => t >= c.at) ?? colors[0], prev = colors[Math.max(0, colors.indexOf(cur) - 1)];
  const u = interpolate(t - cur.at, [-0.3, 0], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) }), ex = prev.x + (cur.x - prev.x) * u, ey = prev.y + (cur.y - prev.y) * u;
  const ring = interpolate(t - cur.at, [0, 0.35], [0, 1], C);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
      <div style={{ position: 'absolute', left: 90, top: y - 150 + up, width: 900, height: 300, borderRadius: 34, background: '#F4EEDC', boxShadow: '0 20px 50px rgba(0,0,0,0.45)', padding: '26px 36px', boxSizing: 'border-box' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 26, letterSpacing: 4, color: 'rgba(40,30,20,0.5)' }}>{title}</div>
        <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
          {colors.map((c, i) => <div key={i} style={{ flex: 1 }}><div style={{ height: 150, borderRadius: 20, background: t >= c.at ? c.hex : 'rgba(0,0,0,0.06)', border: '2px dashed rgba(0,0,0,0.12)' }} /><div style={{ marginTop: 10, fontFamily: 'monospace', fontSize: 28, color: '#16110C', opacity: t >= c.at ? 1 : 0 }}>{c.hex}</div></div>)}
        </div>
      </div>
      {t < colors[colors.length - 1].at + 0.6 && <>
        <div style={{ position: 'absolute', left: cur.x - 40 * ring, top: cur.y - 40 * ring, width: 80 * ring, height: 80 * ring, borderRadius: '50%', border: '4px solid #fff', opacity: 1 - ring }} />
        <div style={{ position: 'absolute', left: ex, top: ey - 56, fontSize: 56, transform: 'rotate(-20deg)', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))' }}>💧</div>
      </>}
    </AbsoluteFill>
  );
};

/** 前后对比滑杆（参考 7.5–9.6 秒）：整个画面先变灰（「调色前」）；白色竖线 + 圆形 ◀▶ 把手从左扫到右，线右边是调色后（暖色），反复摆动。用 backdrop-filter 实现，不改视频本身。 */
export const BeforeAfter: React.FC<{ th: Theme; before?: string; after?: string; at: number; until: number; swings?: number }> = ({ th, before = '调色前', after = '调色后', at, until, swings = 1.5 }) => {
  const t = useT();
  if (t < at || t > until + 0.2) return null;
  const lt = t - at, o = win(t, at, until, 0.1, 0.15), n = until - at, p = 0.5 - 0.5 * Math.cos(Math.min(1, lt / n) * Math.PI * 2 * (swings / 1.5) * 0.75 + Math.PI), x = 1080 * (0.08 + 0.84 * p);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: x, height: 1920, backdropFilter: 'grayscale(1) contrast(0.9) brightness(0.9)', WebkitBackdropFilter: 'grayscale(1) contrast(0.9) brightness(0.9)' }} />
      <div style={{ position: 'absolute', left: x, top: 0, width: 1080 - x, height: 1920, background: 'rgba(255,170,90,0.10)', mixBlendMode: 'soft-light' }} />
      <div style={{ position: 'absolute', left: x - 2, top: 0, width: 4, height: 1920, background: '#fff', boxShadow: '0 0 14px rgba(255,255,255,0.7)' }} />
      <div style={{ position: 'absolute', left: x - 36, top: 960 - 36, width: 72, height: 72, borderRadius: '50%', background: '#fff', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, boxShadow: '0 6px 18px rgba(0,0,0,0.5)' }}>◀▶</div>
      <div style={{ position: 'absolute', left: Math.max(70, x - 260), top: SAFE.top + 20, fontFamily: th.fonts.body, fontSize: 34, color: '#fff', textShadow: '0 3px 10px rgba(0,0,0,0.8)' }}>{before}</div>
      <div style={{ position: 'absolute', left: Math.min(x + 40, 800), top: SAFE.top + 20, fontFamily: th.fonts.body, fontSize: 34, color: '#fff', textShadow: '0 3px 10px rgba(0,0,0,0.8)' }}>{after}</div>
    </AbsoluteFill>
  );
};

/** 应用图标一排（参考 3.3–4.4 秒）：几个圆角方块图标一个个弹出（0→1.25→1，间隔 ~0.17 秒），下面各有小灰字；最后可选「删掉第 N 个」（缩成点，其余左移补位）。
 *  icons：[{ label, color, glyph? }]，glyph 是图标里的一个字 / 符号。没有任何品牌 logo——自己填名字和颜色。 */
export const AppIconRow: React.FC<{ th: Theme; icons: { label: string; color: string; glyph?: string }[]; at: number; until: number; y?: number; removeIndex?: number; removeAt?: number }> = ({ th, icons, at, until, y = 1020, removeIndex, removeAt }) => {
  const t = useT();
  if (t < at || t > until + 0.2) return null;
  const o = win(t, at, until, 0.05, 0.15), size = 150, gap = 34, rm = removeIndex !== undefined && removeAt !== undefined ? interpolate(t, [removeAt, removeAt + 0.3], [0, 1], { ...C, easing: Easing.in(Easing.cubic) }) : 0;
  const n = icons.length, slotW = size + gap;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
      {icons.map((ic, i) => {
        const p = interpolate(t, [at + 0.1 + i * 0.17, at + 0.1 + i * 0.17 + 0.3], [0, 1], { ...C, easing: Easing.out(Easing.back(2.6)) });
        const gone = removeIndex === i ? rm : 0, shift = removeIndex !== undefined && i > removeIndex ? -rm * slotW : 0;
        const total = (n - (rm > 0.01 && removeIndex !== undefined ? rm : 0)) * slotW - gap, x0 = (1080 - total) / 2;
        return (
          <div key={i} style={{ position: 'absolute', left: x0 + i * slotW + shift, top: y - size / 2, width: size, textAlign: 'center', transform: `scale(${p * (1 - gone)})`, opacity: 1 - gone * 0.8 }}>
            <div style={{ width: size, height: size, borderRadius: 36, background: ic.color, boxShadow: '0 12px 28px rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: th.fonts.display, fontSize: 76, color: '#fff' }}>{ic.glyph ?? ic.label[0]}</div>
            <div style={{ marginTop: 12, fontFamily: th.fonts.body, fontSize: 28, color: 'rgba(255,255,255,0.7)' }}>{ic.label}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
