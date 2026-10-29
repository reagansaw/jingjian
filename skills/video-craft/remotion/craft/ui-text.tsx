// craft/ui-text — 一位博主分享的「Claude 特效」演示片里的文字类特效（逐帧看过，30fps 下的时间写在每个组件的注释里），去掉了他的素材后重写成通用版。
// 全部用主题色；时间都是成片里的绝对秒；在 [at, until] 之外什么都不画。重点文字放在安全区内（y≥250、≤1250）。
import React from 'react';
import { AbsoluteFill, Easing, interpolate } from 'remotion';
import { FitBox, SAFE, Theme, useT } from './kit';

const C = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const W = 1080, H = 1920;
const oc = Easing.out(Easing.cubic);
/** [at, until] 窗口里的透明度：入 fi 秒、出 fo 秒 */
const winO = (t: number, a: number, b: number, fi = 0.1, fo = 0.15) => interpolate(t, [a, a + fi, b - fo, b], [0, 1, 1, 0], C);

/** 顶部标题 + 小标签 + 底部字幕条（演示片 0–0.5 秒）：标题 0.1 秒淡入并下落 6px → 0.3 秒后橙色小块横向展开成标签 → 底部小字幕条同时淡入。
 *  和 `top-title`（常驻两行栏目名）不同：它带「标签」和「底部说明」，适合一集系列的「第 N 弹 / 第 N 集」。 */
export const TitleTag: React.FC<{ th: Theme; title: string; tag?: string; caption?: string; at: number; until: number; y?: number }> = ({ th, title, tag, caption, at, until, y = SAFE.top }) => {
  const t = useT();
  if (t < at || t > until + 0.2) return null;
  const o = winO(t, at, until, 0.1, 0.2), lt = t - at, tg = interpolate(lt, [0.3, 0.37], [0, 1], { ...C, easing: oc });
  const sh = '0 3px 12px rgba(0,0,0,0.9)';
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: y + 10, textAlign: 'center', fontFamily: th.fonts.display, fontSize: 64, color: '#fff', textShadow: sh, transform: `translateY(${interpolate(lt, [0, 0.12], [-8, 0], C)}px)`, opacity: interpolate(lt, [0, 0.1], [0, 1], C) }}>
        <FitBox yMid={y + 42} style={{}}>{title}</FitBox>
      </div>
      {tag && lt > 0.28 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: y + 96, display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: th.accent2, color: '#fff', fontFamily: th.fonts.body, fontSize: 30, padding: '4px 22px', borderRadius: 8, transform: `scaleX(${0.25 + 0.75 * tg})`, opacity: tg, whiteSpace: 'nowrap' }}>{tag}</div>
        </div>
      )}
      {caption && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1180, textAlign: 'center', fontFamily: th.fonts.body, fontSize: 38, color: '#fff', textShadow: sh, opacity: interpolate(lt, [0.3, 0.45], [0, 1], C) }}>
          <FitBox yMid={1200} style={{}}>{caption}</FitBox>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** 像素字（演示片 1.7–3.4 秒）：画面压暗到 ~25%（0.25 秒）+ 点阵屏覆盖；字一个一个打出来（每 0.07 秒一个），新字带 2 帧红 / 青色分离（RGB 错位）从左滑入；
 *  打完后下面出一行小的「像素点阵」副标题。点阵字用「圆点网格当文字填充」实现。 */
export const PixelText: React.FC<{ th: Theme; text: string; sub?: string; at: number; until: number; y?: number; size?: number }> = ({ th, text, sub, at, until, y = 760, size = 190 }) => {
  const t = useT();
  if (t < at - 0.01 || t > until + 0.3) return null;
  const lt = t - at, o = winO(t, at, until, 0.12, 0.3), dim = interpolate(lt, [0, 0.25], [0, 0.78], C) * o;
  const chars = [...text], step = 0.07, t0 = 0.22, n = Math.min(chars.length, Math.max(0, Math.floor((lt - t0) / step) + 1));
  const dots: React.CSSProperties = { backgroundImage: 'radial-gradient(circle, #fff 1.5px, rgba(255,255,255,0) 2.3px)', backgroundSize: '5px 5px', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' };
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: `rgba(6,5,8,${dim})` }} />
      <AbsoluteFill style={{ opacity: o * 0.5, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.16) 1px, rgba(0,0,0,0) 1.6px)', backgroundSize: '6px 6px' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: y - size * 0.55, textAlign: 'center', fontFamily: th.fonts.display, fontSize: size, lineHeight: 1.1, opacity: o, whiteSpace: 'nowrap' }}>
        <FitBox yMid={y} style={{}}>
          {chars.slice(0, n).map((c, i) => {
            const age = (lt - t0 - i * step) / step, glitch = age >= 0 && age < 2.5;
            const sl = interpolate(age, [0, 2], [-16, 0], C);
            return (
              <span key={i} style={{ display: 'inline-block', position: 'relative', transform: `translateX(${sl}px)`, opacity: interpolate(age, [0, 1], [0.2, 1], C) }}>
                <span style={{ ...dots, filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.35))' }}>{c === ' ' ? '\u00a0' : c}</span>
                {glitch && <><span style={{ position: 'absolute', left: -4, top: 0, color: 'rgba(255,40,70,0.75)', mixBlendMode: 'screen' }}>{c === ' ' ? '\u00a0' : c}</span><span style={{ position: 'absolute', left: 4, top: 0, color: 'rgba(40,220,255,0.75)', mixBlendMode: 'screen' }}>{c === ' ' ? '\u00a0' : c}</span></>}
              </span>
            );
          })}
        </FitBox>
      </div>
      {sub && lt > t0 + chars.length * step + 0.05 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: y + size * 0.62, textAlign: 'center', fontFamily: 'monospace', fontWeight: 700, fontSize: 24, letterSpacing: 7, color: th.accent2, opacity: o * interpolate(lt - (t0 + chars.length * step), [0.05, 0.2], [0, 0.9], C) }}>{sub}</div>
      )}
    </AbsoluteFill>
  );
};

/** 掉落字（演示片 0–1 秒，v1）：大字母一个个从上面掉下来（每个间隔 ~0.18 秒，0.28 秒落地，落地回弹 ~10%），落下时带旋转，
 *  最后字母堆叠成「第 3、4 个字母比前面高 + 微倾」的一小堆，左上有一行斜体小字（gravity）。出场 0.2 秒淡出 + 模糊。 */
export const DropText: React.FC<{ th: Theme; text: string; small?: string; label?: string; at: number; until: number; y?: number; size?: number; x?: number }> = ({ th, text, small, label, at, until, y = 360, size = 170, x = SAFE.left + 10 }) => {
  const t = useT();
  if (t < at || t > until + 0.25) return null;
  const chars = [...text], o = interpolate(t, [until, until + 0.2], [1, 0], C), lt = t - at;
  const ROT = [0, 3, -8, 11, -5, 7, 0, -4], RISE = [0, 0, -0.1, -0.26, -0.18, -0.3, -0.2, -0.34];
  const adv = chars.map((c) => (/[\u0000-\u00ff]/.test(c) ? size * 0.62 : size * 1.02)), xs = adv.map((_, i) => adv.slice(0, i).reduce((a, b) => a + b, 0));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o, filter: t > until ? `blur(${(t - until) * 14}px)` : undefined }}>
      {small && <div style={{ position: 'absolute', left: x, top: y - size * 0.95, fontFamily: th.fonts.display, fontStyle: 'italic', fontSize: size * 0.2, color: 'rgba(255,255,255,0.65)', opacity: interpolate(lt, [0, 0.12], [0, 1], C) }}>{small}</div>}
      {chars.map((c, i) => {
        const t0 = 0.12 + i * 0.18, u = (lt - t0) / 0.28;
        if (u < 0) return null;
        const fall = Math.min(1, u), restY = y + RISE[i % RISE.length] * size, startY = -size * 1.4;
        let yy = startY + (restY - startY) * fall * fall;                        // 重力：位移 ∝ t²
        if (u > 1) { const b = Math.min(1, (u - 1) / 0.45); yy = restY - Math.sin(b * Math.PI) * size * 0.1 * (1 - b); }   // 落地回弹
        const rot = ROT[i % ROT.length] * interpolate(u, [0, 1.4], [2.2, 1], C) + (u < 1 ? (1 - u) * 40 : 0);
        return <div key={i} style={{ position: 'absolute', left: x + xs[i], top: yy - size * 0.55, fontFamily: th.fonts.display, fontSize: size, lineHeight: 1, color: '#F4EEDC', transform: `rotate(${rot}deg)`, filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.55))' }}>{c}</div>;
      })}
      {label && <div style={{ position: 'absolute', left: x, top: y + size * 0.62, fontFamily: th.fonts.body, fontSize: 30, color: 'rgba(255,255,255,0.7)', opacity: interpolate(lt, [0.9, 1.05], [0, 1], C) }}>{label}</div>}
    </AbsoluteFill>
  );
};

/** 巨大字幕（演示片 0.7–1.7 秒，v1）：一个很大的词（米白）从左侧滑入 + 由大变小（1.5× → 1×，0.2 秒），0.3 秒后右下角冒出一个小的强调色词（0.4× → 1×，0.1 秒弹出）；
 *  出场：两者一起淡到 30% 再消失（0.25 秒）。用在「一个大词 + 一个修饰词」：巨大 / 字幕，爆款 / 标题。 */
export const HugeCaption: React.FC<{ th: Theme; big: string; small?: string; at: number; until: number; y?: number; size?: number }> = ({ th, big, small, at, until, y = 1000, size = 190 }) => {
  const t = useT();
  if (t < at || t > until + 0.3) return null;
  const lt = t - at, o = t > until ? interpolate(t, [until, until + 0.25], [1, 0], C) : 1, a = interpolate(lt, [0, 0.2], [0, 1], { ...C, easing: oc });
  const sm = interpolate(lt, [0.3, 0.4], [0, 1], { ...C, easing: Easing.out(Easing.back(2)) });
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: y - size * 0.55, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 14, opacity: a, transform: `scale(${1.4 - 0.4 * a})`, whiteSpace: 'nowrap' }}>
        <span style={{ fontFamily: th.fonts.display, fontSize: size, lineHeight: 1, color: '#F4EEDC', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.55))' }}>{big}</span>
        {small && <span style={{ fontFamily: th.fonts.display, fontSize: size * 0.34, lineHeight: 1, color: th.accent, transform: `scale(${0.4 + 0.6 * sm})`, opacity: sm, transformOrigin: '0 100%', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))' }}>{small}</span>}
      </div>
    </AbsoluteFill>
  );
};

/** 电影字卡（演示片 3.4–4.3 秒）：整屏纯色卡（中心亮、边缘暗的径向渐层）从下往上滑入（0.3 秒，ease-out）；第一行字在滑入时同步上移 ~60px 并淡入；
 *  0.23 秒后第二行淡入（0.1 秒），两行一起向中间重新居中；停 ~0.7 秒；出场向下滑走（0.2 秒）。lines 最多 3 行，每行 ≤8 字。 */
export const TitleCard: React.FC<{ th: Theme; lines: string[]; at: number; until: number; color?: string; size?: number }> = ({ th, lines, at, until, color = '#D2622A', size = 96 }) => {
  const t = useT();
  if (t < at || t > until + 0.25) return null;
  const lt = t - at, inn = interpolate(lt, [0, 0.3], [1, 0], { ...C, easing: oc }), out = interpolate(t, [until, until + 0.2], [0, 1], { ...C, easing: Easing.in(Easing.cubic) });
  const ty = (inn + out) * H, n = lines.length;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', transform: `translateY(${ty}px)`, background: `radial-gradient(ellipse 80% 60% at 50% 45%, ${color} 0%, ${color} 40%, rgba(0,0,0,0.0) 100%), ${color}`, boxShadow: 'inset 0 0 260px rgba(0,0,0,0.35)' }}>
      {lines.slice(0, 3).map((ln, i) => {
        const li = interpolate(lt, [0.3 + 0.23 * (i - 1) + (i === 0 ? -0.3 : 0), 0.4 + 0.23 * (i - 1) + (i === 0 ? -0.3 : 0)], [0, 1], C);
        const lines_shown = Math.min(n, 1 + (lt > 0.53 ? 1 : 0) + (lt > 0.76 ? 1 : 0)), center = interpolate(lt, [0.5, 0.65], [0, 1], C);
        const yc = H * 0.46 - ((Math.min(n, lines_shown) - 1) * size * 0.62) * center + i * size * 1.18 * (lines_shown > 1 ? 1 : 0) + (1 - (i === 0 ? interpolate(lt, [0, 0.3], [0, 1], { ...C, easing: oc }) : 1)) * 60;
        return <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: yc - size * 0.6, textAlign: 'center', fontFamily: th.fonts.display, fontSize: size, lineHeight: 1.1, color: '#fff', opacity: i === 0 ? interpolate(lt, [0.05, 0.25], [0, 1], C) : li, textShadow: '0 6px 24px rgba(0,0,0,0.25)' }}><FitBox yMid={yc} style={{}}>{ln}</FitBox></div>;
      })}
    </AbsoluteFill>
  );
};

/** 打字框（演示片 1.5–2.8 秒，v1）：顶部一个药丸形输入框，从左边的圆形发送钮「展开」成长条（0.2 秒），里面的小字「PROMPT」+ 光标；
 *  每 0.13 秒打一个字；打完发送钮变成强调色并（可选）按一下；停一会儿后 0.15 秒淡出。比 `chat-dm` 简洁，放在顶部（y≥250）。 */
export const PromptBox: React.FC<{ th: Theme; text: string; at: number; until: number; label?: string; y?: number; sendAt?: number }> = ({ th, text, at, until, label = 'PROMPT', y = SAFE.top + 20, sendAt }) => {
  const t = useT();
  if (t < at || t > until + 0.2) return null;
  const lt = t - at, o = interpolate(t, [until, until + 0.15], [1, 0], C), w = interpolate(lt, [0, 0.2], [96, 860], { ...C, easing: oc }), chars = [...text];
  const n = Math.min(chars.length, Math.max(0, Math.floor((lt - 0.3) / 0.13) + 1)), done = lt > 0.3 + chars.length * 0.13;
  const sent = sendAt !== undefined && t >= sendAt, press = sent && t < sendAt + 0.12 ? 0.86 : 1;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
      <div style={{ position: 'absolute', left: SAFE.left, top: y, width: w, height: 96, borderRadius: 48, background: '#F5F0E3', boxShadow: '0 14px 34px rgba(0,0,0,0.5)', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '0 14px 0 40px', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', left: 40, top: 8, fontFamily: 'monospace', fontSize: 14, letterSpacing: 2, color: 'rgba(40,30,20,0.4)' }}>{label}</div>
        <div style={{ flex: 1, fontFamily: th.fonts.body, fontSize: 46, color: '#16110C', whiteSpace: 'nowrap', paddingTop: 12 }}>{chars.slice(0, n).join('')}<span style={{ opacity: Math.floor(lt * 3) % 2 ? 0 : 1, color: th.accent2 }}>｜</span></div>
        <div style={{ width: 70, height: 70, borderRadius: '50%', background: done ? th.accent : '#16110C', color: done ? th.onAccent : '#F5F0E3', fontSize: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${press})`, flexShrink: 0 }}>↑</div>
      </div>
    </AbsoluteFill>
  );
};
