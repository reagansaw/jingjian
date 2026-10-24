// Edit：把「一条口播视频 + 一份 beats 清单」合成成片。所有版式都来自 craft/，字全部守安全区（x60–1010 / y250–1250）。
// 用法：npx remotion render index.ts Edit out.mp4 --props=edit.json    （edit.json 的写法见 edit.example.json 和 README）
import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { SafeGuides, StageBg, THEMES, Theme, useCraftFonts } from './craft/kit';
import { AtoB, Bars, Chapter, ChestBig, DarkQuestion, GiantFill, LeftStair, SignatureCard, StrikeSwap, TwoColumn, VerticalWall } from './craft/layouts';
import { ChapterTag, GhostWord, LabelHero, QuoteCard, SpreadHero } from './craft/typo';
import { EndCta, StackList, TopTitle } from './craft/skeleton';
import { CaptionItem, Captions } from './craft/captions';

// kind → 组件。props 就是版式库每张卡「代码」里的那些属性（at / until 单位是秒；th 自动带上）。
const REG: Record<string, React.FC<any>> = {
  'chest-big': ChestBig, 'strike-swap': StrikeSwap, 'left-stair': LeftStair, 'a-to-b': AtoB, 'two-column': TwoColumn, bars: Bars,
  'vertical-wall': VerticalWall, 'dark-question': DarkQuestion, chapter: Chapter, 'giant-fill': GiantFill, signature: SignatureCard,
  'label-hero': LabelHero, 'spread-hero': SpreadHero, 'ghost-word': GhostWord, 'quote-card': QuoteCard, 'chapter-tag': ChapterTag,
  'top-title': TopTitle, 'stack-list': StackList, 'end-cta': EndCta,
};
export const KINDS = Object.keys(REG);

export type Beat = { kind: string; props: Record<string, unknown> };
export type EditProps = {
  /** public/ 下的视频文件名（1080×1920）。不填 = 用占位人形，方便先看版式 */
  src: string | null;
  durationSec: number;
  theme: keyof typeof THEMES;
  beats: Beat[];
  /** 硬切推近的时间点（秒）：相邻两段在 zoom[0] / zoom[1] 之间交替 */
  cuts: number[];
  /** 两档缩放。默认 [1.0, 1.12]（剪映数据：中位 1.1×）；实战跳切常用 [1.15, 1.2]；脸很大（特写）时用 [1.12, 1.2] 配 shiftY */
  zoom: [number, number];
  /** 整个画面上移多少像素（负数 = 上移）。脸很大时用 -120，把下巴以下让给字（SKILL.md §3.2）；要配 zoom ≥1.12，否则底边会露 */
  shiftY: number;
  /** 音效：t 秒处播 public/sfx/<file>（文件你自己准备，只用有权使用的） */
  sfx: { t: number; file: string; volume?: number }[];
  /** 胸口压暗渐变的强度 0–1（默认 0.75）：素材的胸口带是白衣服 / 亮背景时，字会糊——压暗它。0 = 不加。版式库预览里一直有这层，Edit 以前漏了 */
  scrim: number;
  /** 字幕：[{ from, to, text }]（秒）。用 `python3 ../tools/make_captions.py` 从转写 + 校对后的文字生成，每条 ≤12 字宽 */
  captions: CaptionItem[];
  /** 字幕里要换强调色的词 */
  captionHl: string[];
  /** 字幕字号，默认 54 */
  captionSize: number;
  /** 画出安全区红框（检查用；出片前关掉） */
  guides: boolean;
};
export const defaultEdit: EditProps = {
  src: null, durationSec: 8, theme: 'dark-lime', cuts: [3, 6], zoom: [1.0, 1.12], shiftY: 0, scrim: 0.75, captions: [], captionHl: [], captionSize: 54, sfx: [], guides: false,
  beats: [
    { kind: 'top-title', props: { line1: '口播剪辑', line2: '三步剪出网感', at: 0.2, until: 7.6 } },
    { kind: 'chest-big', props: { small: '剪出网感的第一步', big: '删停顿', at: 0.6, until: 3.4 } },
    { kind: 'stack-list', props: { items: [{ text: '先删停顿', at: 3.6 }, { text: '再对节奏', at: 4.3 }, { text: '最后配音效', at: 5.0 }], punch: { text: '三步就够', at: 5.8 }, until: 7.0 } },
    { kind: 'end-cta', props: { label: '找我聊聊', hint: '点左下角', at: 6.4, until: 7.8 } },
  ],
};

const rgba = (hex: string, a: number) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const zoomAt = (t: number, cuts: number[], zoom: [number, number]) => { const i = cuts.filter((c) => c <= t).length; return i % 2 === 1 ? zoom[1] : zoom[0]; };

export const Edit: React.FC<EditProps> = ({ src, theme, beats, cuts, zoom = [1.0, 1.12], shiftY = 0, scrim = 0.75, captions = [], captionHl = [], captionSize = 54, sfx, guides }) => {
  useCraftFonts();
  const th: Theme = THEMES[theme] ?? THEMES['dark-lime'];
  const { fps } = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const z = zoomAt(t, cuts, zoom);
  return (
    <AbsoluteFill style={{ background: th.bg }}>
      <AbsoluteFill style={{ transform: `translateY(${shiftY}px) scale(${z})`, transformOrigin: '50% 38%' }}>
        {src ? <OffthreadVideo src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <StageBg th={th} />}
      </AbsoluteFill>
      {scrim > 0 && <AbsoluteFill style={{ background: `linear-gradient(to bottom, ${rgba(th.bg, 0)} 40%, ${rgba(th.bg, 0.72 * scrim)} 54%, ${rgba(th.bg, 0.92 * scrim)} 100%)` }} />}
      {beats.map((b, i) => {
        const C = REG[b.kind];
        if (!C) throw new Error(`未知版式 "${b.kind}"。可用：${KINDS.join(', ')}`);
        return <C key={i} th={th} {...b.props} />;
      })}
      {captions.length > 0 && <Captions th={th} items={captions} hl={captionHl} size={captionSize} />}
      {sfx.map((s, i) => <Sequence key={i} from={Math.round(s.t * fps)}><Audio src={staticFile(`sfx/${s.file}`)} volume={s.volume ?? 0.8} /></Sequence>)}
      {guides && <SafeGuides />}
    </AbsoluteFill>
  );
};
