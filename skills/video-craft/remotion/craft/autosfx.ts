// craft/autosfx — 音效自动配：每个字块出现的那一帧响（音效挂在字块的第 0 帧；字因入场动画第 1–3 帧才看得见，所以听感上声音略早，这是对的）。
// 表来源：剪映 2-1 样片里「预设 ↔ 音效」的配对（作者另一个 session 逐个对过、量过音量），换成了本库自己合成的原创音效（tools/audio/make_sfx.py）。
// 音量 vol 是相对值（0–1），再乘 Edit 的 sfxGain（默认 0.5）：垫在人声 −16 LUFS 底下约 −24 LUFS。约 1/3 的字块安静（不配）——这是节奏，不是漏了。
import type { Beat } from '../Edit';
import type { CamFx } from './fx';
import { JY_SFX } from './jytext';

export type AutoSfx = { t: number; id: string; vol: number };

/** MotionText 预设 → 音效（剪映预设名在注释里） */
export const MOTION_SFX: Record<string, { id: string; vol: number }> = {
  'slide-up': { id: 'whoosh_short', vol: 0.55 },     // 向上滑动
  'reveal-up': { id: 'whoosh_up', vol: 0.8 },         // 向上露出（呼）
  curtain: { id: 'paper', vol: 0.7 },                 // 开幕（纸张）
  'roll-in': { id: 'cash', vol: 0.5 },                // 滚入
  leap: { id: 'punch', vol: 0.6 },                    // 跃进
  grow: { id: 'pop', vol: 0.5 },                      // 放大
  'grow-soft': { id: 'notify', vol: 0.6 },            // 轻微放大（叮）
  shrink: { id: 'hit', vol: 0.6 },                    // 缩小（撞击光）
  slam: { id: 'boom', vol: 0.55 },                    // 缩小 II（悬疑咚）
  'glow-blur': { id: 'ding', vol: 0.5 },              // 模糊发光（水滴）
  'blur-left': { id: 'whoosh_long', vol: 0.4 },       // 向左模糊（旋风）
  'rise-random': { id: 'paper', vol: 0.6 },           // 随机上升
  'wave-bounce': { id: 'chime_up', vol: 0.3 },        // 波浪弹入
  typewriter: { id: 'typing', vol: 0.9 },             // 打字光标（只放前 1.2 秒，文件本身就是 1.2 秒）
  develop: { id: 'shimmer', vol: 0.4 },               // 逐字显影（沙锤）
  'tracking-in': { id: 'thud', vol: 0.6 },            // 收拢
  echo: { id: 'boom', vol: 0.4 },                     // 呐喊声波
};

const n = (v: unknown): number | undefined => (typeof v === 'number' ? v : undefined);
const arr = (v: unknown): any[] => (Array.isArray(v) ? v : []);

/** 版式 → 音效点。每个版式里「重点词砸出来」那一下用重音效，铺垫 / 条目用轻音效。 */
export const autoSfx = (beats: Beat[], camera: CamFx[] = []): AutoSfx[] => {
  const out: AutoSfx[] = [];
  const add = (t: number | undefined, id: string, vol: number) => { if (typeof t === 'number') out.push({ t, id, vol }); };
  for (const b of beats) {
    const p = b.props as Record<string, any>;
    if (p.sfx === false) continue;
    const at = n(p.at);
    switch (b.kind) {
      case 'chest-big': add(at, 'whoosh_short', 0.45); add(n(p.bigAt) ?? (at !== undefined ? at + 0.12 : undefined), 'hit', 0.8); break;
      case 'strike-swap': add(n(p.strikeAt), 'swish', 0.6); add(n(p.nextAt), 'hit', 0.8); break;
      case 'left-stair': arr(p.rows).forEach((r) => add(n(r.at), r.big ? 'hit' : 'tick', r.big ? 0.8 : 0.6)); break;
      case 'a-to-b': add(at, 'tick', 0.6); add(n(p.bAt), 'hit', 0.8); break;
      case 'two-column': add(n(p.lineAt), 'whoosh_short', 0.5); add(n(p.left?.at), 'tick', 0.6); add(n(p.right?.at), 'tick', 0.6); break;
      case 'bars': add(n(p.leadAt), 'tick', 0.5); arr(p.bars).forEach((x) => add(n(x.at), 'pop', 0.6)); break;
      case 'vertical-wall': arr(p.chars).forEach((c) => add(n(c.at), 'tick', 0.55)); break;
      case 'dark-question': add(at, 'sub_drop', 0.5); add(n(p.bigAt), 'suspense_hit', 0.6); break;
      case 'chapter': add(at, 'hit', 0.8); arr(p.chips).forEach((c) => add(n(c.at), 'tick', 0.6)); add(n(p.punch?.at), 'hit', 0.8); break;
      case 'giant-fill': add(at, 'whoosh_up', 0.6); add(n(p.fillAt), 'boom', 0.7); break;
      case 'signature': add(at, 'ding', 0.4); break;
      case 'label-hero': add(at, 'tick', 0.5); add(n(p.heroAt) ?? (at !== undefined ? at + 0.12 : undefined), 'hit', 0.8); break;
      case 'spread-hero': add(at, 'whoosh_short', 0.5); add(n(p.bottomAt) ?? (at !== undefined ? at + 0.2 : undefined), 'punch', 0.8); break;
      case 'ghost-word': add(at, 'sub_drop', 0.4); add(n(p.lineAt), 'tick', 0.5); break;
      case 'quote-card': arr(p.items).forEach((it) => add(n(it.at), 'paper', 0.5)); break;
      case 'chapter-tag': add(at, 'pop', 0.6); break;
      case 'top-title': add(at ?? 0.2, 'swish', 0.3); break;
      case 'stack-list': arr(p.items).forEach((it) => add(n(it.at), 'tick', 0.6)); add(n(p.punch?.at), 'hit', 0.8); break;
      case 'end-cta': add(at, 'ding', 0.7); break;
      case 'jy-text': { const m = JY_SFX[p.preset as keyof typeof JY_SFX]; if (m) add(at, m.id, m.vol); break; }
      case 'white-flash': add(at, 'flash', 0.6); break;
      case 'kinetic-line': arr(p.words).forEach((w) => add(n(w.t), w.hot ? 'hit' : 'pop', w.hot ? 0.8 : 0.5)); break;
      case 'counter-slam': add(at ?? 0.1, 'tick', 0.4); add(n(p.land), 'hit', 0.85); break;
      case 'stamp': add(at, 'stamp', 0.8); break;
      case 'chat-dm': add(at !== undefined ? at + 0.35 : undefined, 'typing', 0.6); add(n(p.sendAt) ?? (at !== undefined ? at + 1.0 : undefined), 'pop', 0.7); add((n(p.sendAt) ?? (at ?? 0) + 1.0) + 0.45, 'notify', 0.4); break;
      case 'slot-row': for (let i = 0; i < (n(p.n) ?? 0) && i < 12; i++) add((at ?? 0) + 0.1 + i * 0.07, 'pop', 0.4); break;
      case 'rapid-montage': for (let i = 0; i < arr(p.images).length && i < 12; i++) add((at ?? 0) + i * (n(p.step) ?? 0.2), 'camera', 0.5); break;
      case 'title-tag': add(at ?? 0.2, 'swish', 0.4); add(at !== undefined ? at + 0.3 : undefined, 'pop', 0.4); break;
      case 'pixel-text': for (let i = 0; i < [...String(p.text ?? '')].length && i < 8; i++) add((at ?? 0) + 0.22 + i * 0.07, 'tick', 0.4); break;
      case 'drop-text': for (let i = 0; i < [...String(p.text ?? '')].length && i < 6; i++) add((at ?? 0) + 0.4 + i * 0.18, 'thud', 0.6); break;
      case 'huge-caption': add(at, 'punch', 0.7); add(at !== undefined ? at + 0.35 : undefined, 'pop', 0.5); break;
      case 'title-card': add(at, 'whoosh_up', 0.6); add(at !== undefined ? at + 0.55 : undefined, 'ding', 0.4); break;
      case 'prompt-box': add(at !== undefined ? at + 0.3 : undefined, 'typing', 0.6); add(n(p.sendAt), 'pop', 0.7); break;
      case 'glass-chart': add(at !== undefined ? at + 0.1 : undefined, 'tick', 0.5); add(at !== undefined ? at + 0.9 : undefined, 'ding', 0.6); break;
      case 'compare-tiles': add(at !== undefined ? at + 0.25 : undefined, 'tick', 0.5); add(at !== undefined ? at + 0.95 : undefined, 'success', 0.6); break;
      case 'photo-cards': for (let i = 0; i < 3; i++) add((at ?? 0) + i * (n(p.gap) ?? 0.27), 'camera', 0.5); break;
      case 'side-sticker': add(at, 'whoosh_short', 0.5); add(at !== undefined ? at + 0.35 : undefined, 'pop', 0.7); break;
      case 'particle-fill': add(at, 'whoosh_short', 0.5); for (let i = 0; i < 10; i++) add((at ?? 0) + 0.4 + i * 0.1, 'tick', 0.3); break;
      case 'side-doc': add(at, 'whoosh_short', 0.5); for (let i = 0; i < arr(p.items).length && i < 6; i++) add((at ?? 0) + 0.3 + i * (n(p.stepSec) ?? 0.55), 'tick', 0.5); break;
      case 'thumb-wall': add(at !== undefined ? at + 0.15 : undefined, 'pop', 0.6); add(at !== undefined ? at + 0.5 : undefined, 'shimmer', 0.5); break;
      case 'comment-card': add(at !== undefined ? at + 0.4 : undefined, 'ding', 0.7); break;
      case 'timeline-panel': add(at, 'whoosh_short', 0.5); for (let i = 0; i < 8; i++) add((at ?? 0) + 0.2 + i * 0.3, 'tick', 0.25); break;
      case 'drop-zone': add(at !== undefined ? at + 0.25 : undefined, 'whoosh_short', 0.5); add(at !== undefined ? at + 0.85 : undefined, 'success', 0.6); break;
      case 'palette': arr(p.colors).forEach((c) => add(n(c.at), 'pop', 0.6)); break;
      case 'before-after': add(at, 'whoosh_up', 0.5); add(at !== undefined ? at + 1.0 : undefined, 'ding', 0.4); break;
      case 'app-icons': for (let i = 0; i < arr(p.icons).length && i < 6; i++) add((at ?? 0) + 0.1 + i * 0.17, 'pop', 0.5); break;
      case 'cap-preset': add(at, 'pop', 0.5); break;
      case 'checklist': add(at, 'paper', 0.5); arr(p.items).forEach((it) => add(n(it.at), 'tick', 0.7)); break;
      case 'magazine-cover': add(at, 'camera', 0.7); break;
      case 'orbit-text': add(at, 'shimmer', 0.4); break;
      case 'scatter-text': add(at !== undefined ? at + (n(p.breakAt) ?? 0.6) : undefined, 'thud', 0.6); break;
      case 'ink-wipe': add(at, 'whoosh_long', 0.5); break;
      default: if (b.kind in MOTION_SFX) { const m = MOTION_SFX[b.kind]; add(at, m.id, m.vol); }
    }
  }
  for (const c of camera) {
    const at = c.at ?? 0;
    if (c.kind === 'punch') add(at, 'whoosh_up', 0.6);
    else if (c.kind === 'tvoff') add(at, 'sub_drop', 0.6);
    else if (c.kind === 'send') { add(at, 'whoosh_up', 0.5); add(at + 0.7, 'zip_up', 0.5); }
    else if (c.kind === 'glitch') { for (const b of c.bursts ?? []) add(b, 'flash', 0.5); }
    else if (c.kind === 'droste') { add(at, 'pop', 0.6); add(c.until !== undefined ? c.until - 0.35 : undefined, 'whoosh_up', 0.6); }
    else if (c.kind === 'handmark') { add(at, 'whoosh_short', 0.5); add(at + 0.5, 'pop', 0.5); }
    else if (c.kind === 'shape') { add(at, 'whoosh_short', 0.5); add(at + 0.3, 'chime_up', 0.4); }
    else if (c.kind === 'circle') { for (let i = 0; i < (c.peers ?? 6); i++) add((c.popAt ?? at + 0.6) + 0.12 + i * 0.13, 'pop', 0.5); }
  }
  return out.sort((a, b) => a.t - b.t);
};
