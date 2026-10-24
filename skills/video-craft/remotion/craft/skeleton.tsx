// craft/skeleton — 「骨架」三件：常驻小标题 / 累加清单（旧条变暗）/ 结尾行动（胶囊 + 箭头）。
// 来源：64 条行业成片的共同排法（references/essence.md §三 §四 §五）；原创实现。
// 安全区：小标题整块在 y≥250；结尾胶囊和箭头整个 ≤1250；字都走 FitBox（量宽 → 缩小 → 推回）。
import React from 'react';
import { FitBox, SAFE, Theme, Txt, Zone, env, lin, out3, pop, useT } from './kit';

type Base = { th: Theme; until: number };

/* 常驻小标题（essence §五）：整片都挂在顶部的两行小标题——上一行白（带斜线更像栏目名），下一行强调色。
   晚点划到的人也知道在讲什么。原片放得比安全区高，这里整块放在 y≥250。不放进 Zone（Zone 会把它往下拉进胸口带）。 */
export const TopTitle: React.FC<Base & { line1: string; line2: string; at?: number; size1?: number; size2?: number }> = ({ th, line1, line2, at = 0.2, until, size1 = 44, size2 = 62 }) => {
  const t = useT(), o = env(t, at, until, 0.35, 0.3), p = out3(t, at, at + 0.4);
  if (o <= 0) return null;
  const y1 = SAFE.top + 14, y2 = y1 + size1 * 1.25;
  const shadow = '0 3px 10px rgba(0,0,0,0.95), 0 0 3px rgba(0,0,0,0.9)';
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o, transform: `translateY(${(1 - p) * -18}px)` }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: y1, fontFamily: th.fonts.body, fontSize: size1, lineHeight: 1.1, whiteSpace: 'nowrap', letterSpacing: 2 }}>
        <FitBox align="left" yMid={y1 + size1 / 2} style={{ color: '#fff', textShadow: shadow, marginLeft: SAFE.left }}>{`/${line1}/`}</FitBox>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: y2, fontFamily: th.fonts.display, fontSize: size2, lineHeight: 1.1, whiteSpace: 'nowrap', letterSpacing: 2 }}>
        <FitBox align="left" yMid={y2 + size2 / 2} style={{ color: th.accent, textShadow: shadow, marginLeft: SAFE.left }}>{line2}</FitBox>
      </div>
    </div>
  );
};

/* 累加清单（essence §三 套路 2）：「1. … 2. … 3. …」一条一条出现，新的一条出来时旧的变暗；可选最后压一句金句大字。
   最多 4 条；带金句时最多 3 条（再多就超出胸口带 y1250）。 */
export const StackList: React.FC<Base & { items: { text: string; at: number }[]; punch?: { text: string; at: number }; size?: number }> = ({ th, items, punch, until, size = 54 }) => {
  const gap = size * 1.4, y0 = 1040;                  // 版式坐标（Zone 里再上移 150 → 真实 y≈890 起，在下巴之下）
  const list = items.slice(0, punch ? 3 : 4);          // 有金句时最多 3 条，否则最后一行会超过 y1250
  return (
    <Zone>
      {list.map((it, i) => (
        <Txt key={i} th={th} at={it.at} until={until} y={y0 + i * gap} x={SAFE.left + 6} align="left" size={size} font={th.fonts.body} tone="accent" anim="left"
          dimAt={i < list.length - 1 ? list[i + 1].at : punch?.at}>{`${i + 1}.${it.text}`}</Txt>
      ))}
      {punch && <Txt th={th} at={punch.at} until={until} y={y0 + list.length * gap} size={96} tone="white" anim="slam">{punch.text}</Txt>}
    </Zone>
  );
};

/* 结尾行动（essence §四）：蓝色胶囊按钮「找我聊聊」+ 向左下角点的箭头。胶囊放胸口带下沿，箭头在它左边上下跳。
   说明：这是画面元素，**文案由用户给**（账号 / 联系方式没有就别编）。箭头的方向是「指向平台的头像 / 关注按钮」，位置在 y≤1250 内。 */
export const EndCta: React.FC<Base & { label: string; at: number; hint?: string; arrow?: boolean; color?: string; cy?: number }> = ({ th, label, at, until, hint, arrow = true, color = '#2F7BFF', cy = 1150 }) => {
  const t = useT(), p = pop(t, at, 0.34), o = Math.min(1, p * 1.5) * (1 - lin(t, until, until + 0.22));
  if (t < at - 0.02 || t > until + 0.25) return null;
  const size = 76, pulse = 1 + 0.035 * Math.sin((t - at) * 6.2), bob = Math.sin((t - at) * 7) * 12;
  // cy = 胶囊中线（真实坐标，不放进 Zone）；有字幕时往上挪（例如 1020），别和字幕撞在一起
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      {arrow && (
        <svg width={220} height={220} viewBox="0 0 100 100" style={{ position: 'absolute', left: SAFE.left, top: cy - 215 + bob, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.7))' }}>
          {/* 指向左下角的粗箭头：杆 + 头 */}
          <path d="M78 22 L34 66" stroke="#FFC21A" strokeWidth="14" strokeLinecap="round" fill="none" />
          <path d="M22 78 L22 46 M22 78 L54 78" stroke="#FFC21A" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, top: cy - size * 0.72, display: 'flex', justifyContent: 'center', transform: `scale(${(0.7 + 0.3 * p) * pulse})`, transformOrigin: '50% 50%' }}>
        <div style={{ fontFamily: th.fonts.hand, fontSize: size, color: '#fff', background: color, borderRadius: size * 0.62, padding: `${size * 0.14}px ${size * 0.7}px ${size * 0.2}px`, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          <FitBox yMid={cy} style={{ color: '#fff' }}>{label}</FitBox>
        </div>
      </div>
      {hint && <Txt th={th} at={at + 0.3} until={until} y={cy + size * 0.95} size={46} font={th.fonts.body} anim="up">{hint}</Txt>}
    </div>
  );
};
