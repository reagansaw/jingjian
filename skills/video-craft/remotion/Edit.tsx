// Edit：把「一条口播视频 + 一份 beats 清单」合成成片。所有版式都来自 craft/，字全部守安全区（x60–1010 / y250–1250）。
// 用法：npx remotion render index.ts Edit out.mp4 --props=edit.json    （edit.json 的写法见 edit.example.json 和 README）
import React from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { SafeGuides, StageBg, THEMES, Theme, useCraftFonts } from './craft/kit';
import { AtoB, Bars, Chapter, ChestBig, DarkQuestion, GiantFill, LeftStair, SignatureCard, StrikeSwap, TwoColumn, VerticalWall } from './craft/layouts';
import { ChapterTag, GhostWord, LabelHero, QuoteCard, SpreadHero } from './craft/typo';
import { EndCta, StackList, TopTitle } from './craft/skeleton';
import { CaptionItem, Captions } from './craft/captions';
import { autoSfx } from './craft/autosfx';
import { DropText, HugeCaption, PixelText, PromptBox, TitleCard, TitleTag } from './craft/ui-text';
import { AppIconRow, BeforeAfter, DropZone, Palette, TimelinePanel } from './craft/ui-meta';
import { CommentCard, CompareTiles, GlassChart, ParticleFill, PhotoCards, SideDoc, SideSticker, ThumbWall } from './craft/ui-data';
import { Checklist, MagazineCover, OrbitText, ScatterText } from './craft/fx2';
import { CapPreset } from './craft/cappreset';
import { BehindItem, BehindWord } from './craft/ui-behind';
import { CamFx, CameraStack, ChatDM, CounterSlam, KineticLine, RapidMontage, SlotRow, Stamp, WhiteFlash } from './craft/fx';
import { JyTextBeat } from './craft/jytext';
import { InkWipe, Mist, PaperGrain, Particles } from './craft/backdrop';

// kind → 组件。props 就是版式库每张卡「代码」里的那些属性（at / until 单位是秒；th 自动带上）。
const REG: Record<string, React.FC<any>> = {
  'chest-big': ChestBig, 'strike-swap': StrikeSwap, 'left-stair': LeftStair, 'a-to-b': AtoB, 'two-column': TwoColumn, bars: Bars,
  'vertical-wall': VerticalWall, 'dark-question': DarkQuestion, chapter: Chapter, 'giant-fill': GiantFill, signature: SignatureCard,
  'label-hero': LabelHero, 'spread-hero': SpreadHero, 'ghost-word': GhostWord, 'quote-card': QuoteCard, 'chapter-tag': ChapterTag,
  'top-title': TopTitle, 'stack-list': StackList, 'end-cta': EndCta,
  // 钩子 / 特效（craft/fx.tsx、jytext.tsx、backdrop.tsx）
  'jy-text': JyTextBeat, 'white-flash': WhiteFlash, 'kinetic-line': KineticLine, 'counter-slam': CounterSlam, stamp: Stamp, 'chat-dm': ChatDM,
  'slot-row': SlotRow, 'rapid-montage': RapidMontage, particles: Particles, mist: Mist, 'paper-grain': PaperGrain, 'ink-wipe': InkWipe,
  // UI 类特效（craft/ui-text.tsx、ui-data.tsx）
  'title-tag': TitleTag, 'pixel-text': PixelText, 'drop-text': DropText, 'huge-caption': HugeCaption, 'title-card': TitleCard, 'prompt-box': PromptBox,
  'glass-chart': GlassChart, 'compare-tiles': CompareTiles, 'photo-cards': PhotoCards, 'side-sticker': SideSticker, 'particle-fill': ParticleFill,
  'side-doc': SideDoc, 'thumb-wall': ThumbWall, 'comment-card': CommentCard,
  'cap-preset': CapPreset, checklist: Checklist, 'magazine-cover': MagazineCover, 'orbit-text': OrbitText, 'scatter-text': ScatterText,
  'timeline-panel': TimelinePanel, 'drop-zone': DropZone, palette: Palette, 'before-after': BeforeAfter, 'app-icons': AppIconRow,
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
  /** 音效：t 秒处播 public/sfx/<file>。手写的；自动配的见 autoSfx */
  sfx: { t: number; file: string; volume?: number }[];
  /** 自动配音效：每个版式 / 重点词出现的那一帧响（用 public/sfx/ 里自带的原创合成音效，表在 craft/autosfx.ts）。某个版式不要就在它的 props 里写 "sfx": false */
  autoSfx: boolean;
  /** 自动音效的总音量（默认 0.5：垫在人声底下约 −24 LUFS）。觉得吵就调小 */
  sfxGain: number;
  /** 镜头特效（包住视频层，字不受影响）：[{ kind: 'punch'|'shake'|'tvoff'|'send'|'circle', at, until?, … }]，参数见 references/edit-json.md */
  camera: CamFx[];
  /** 胸口压暗渐变的强度 0–1（默认 0.75）：素材的胸口带是白衣服 / 亮背景时，字会糊——压暗它。0 = 不加。版式库预览里一直有这层，Edit 以前漏了 */
  scrim: number;
  /** 字幕：[{ from, to, text }]（秒）。用 `python3 ../tools/make_captions.py` 从转写 + 校对后的文字生成，每条 ≤12 字宽 */
  captions: CaptionItem[];
  /** 字幕里要换强调色的词 */
  captionHl: string[];
  /** 字幕字号，默认 54 */
  captionSize: number;
  /** 字在人后（需要抠像，仅 macOS 生成）：见 craft/ui-behind.tsx */
  behind: BehindItem[];
  /** 局部改镜头（高级剪辑师的「给字腾位置」）：窗口内平滑切到另一个 shiftY / zoom（0.2 秒缓入缓出）。例：{ at:4.5, until:5.7, shiftY:140, zoom:1.0 } 让头顶露出空位放字 */
  reframe: { at: number; until: number; shiftY?: number; zoom?: number }[];
  /** 视频被下移 / 缩小后露出的边：'blur' = 用放大虚化的同一支视频补，'none' = 主题底色 */
  fill: 'blur' | 'none';
  /** 画出安全区红框（检查用；出片前关掉） */
  guides: boolean;
};
export const defaultEdit: EditProps = {
  src: null, durationSec: 8, theme: 'dark-lime', cuts: [3, 6], zoom: [1.0, 1.12], shiftY: 0, scrim: 0.75, camera: [], captions: [], captionHl: [], captionSize: 54, sfx: [], behind: [], reframe: [], fill: 'blur', autoSfx: true, sfxGain: 0.5, guides: false,
  beats: [
    { kind: 'top-title', props: { line1: '口播剪辑', line2: '三步剪出网感', at: 0.2, until: 7.6 } },
    { kind: 'chest-big', props: { small: '剪出网感的第一步', big: '删停顿', at: 0.6, until: 3.4 } },
    { kind: 'stack-list', props: { items: [{ text: '先删停顿', at: 3.6 }, { text: '再对节奏', at: 4.3 }, { text: '最后配音效', at: 5.0 }], punch: { text: '三步就够', at: 5.8 }, until: 7.0 } },
    { kind: 'end-cta', props: { label: '找我聊聊', hint: '点左下角', at: 6.4, until: 7.8 } },
  ],
};

const rgba = (hex: string, a: number) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const zoomAt = (t: number, cuts: number[], zoom: [number, number]) => { const i = cuts.filter((c) => c <= t).length; return i % 2 === 1 ? zoom[1] : zoom[0]; };

export const Edit: React.FC<EditProps> = ({ src, theme, beats, cuts, zoom = [1.0, 1.12], shiftY = 0, scrim = 0.75, camera = [], behind = [], reframe = [], fill = 'blur', captions = [], captionHl = [], captionSize = 54, sfx, autoSfx: useAuto = true, sfxGain = 0.5, guides }) => {
  useCraftFonts();
  const th: Theme = THEMES[theme] ?? THEMES['dark-lime'];
  const { fps } = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const z0 = zoomAt(t, cuts, zoom);
  let z = z0, sy = shiftY;
  for (const r of reframe) {
    const k = interpolate(t, [r.at, r.at + 0.2, r.until - 0.2, r.until], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
    if (r.zoom !== undefined) z += (r.zoom - z0) * k;
    if (r.shiftY !== undefined) sy += (r.shiftY - shiftY) * k;
  }
  return (
    <AbsoluteFill style={{ background: th.bg }}>
      <CameraStack th={th} fx={camera}>
        {src && fill === 'blur' && (sy !== 0 || z < 1) && <AbsoluteFill style={{ transform: 'scale(1.5)', filter: 'blur(40px) brightness(0.6)' }}><OffthreadVideo src={staticFile(src)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></AbsoluteFill>}
        <AbsoluteFill style={{ transform: `translateY(${sy}px) scale(${z})`, transformOrigin: '50% 38%' }}>
          {src ? <OffthreadVideo src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <StageBg th={th} />}
          {behind.map((b, i) => <BehindWord key={i} th={th} item={b} />)}
        </AbsoluteFill>
      </CameraStack>
      {scrim > 0 && <AbsoluteFill style={{ background: `linear-gradient(to bottom, ${rgba(th.bg, 0)} 40%, ${rgba(th.bg, 0.72 * scrim)} 54%, ${rgba(th.bg, 0.92 * scrim)} 100%)` }} />}
      {beats.map((b, i) => {
        const C = REG[b.kind];
        if (!C) throw new Error(`未知版式 "${b.kind}"。可用：${KINDS.join(', ')}`);
        return <C key={i} th={th} {...b.props} />;
      })}
      {captions.length > 0 && <Captions th={th} items={captions} hl={captionHl} size={captionSize} />}
      {sfx.map((s, i) => <Sequence key={`m${i}`} from={Math.round(s.t * fps)}><Audio src={staticFile(`sfx/${s.file}`)} volume={s.volume ?? 0.8} /></Sequence>)}
      {useAuto && autoSfx(beats, camera).map((s, i) => <Sequence key={`a${i}`} from={Math.max(0, Math.round(s.t * fps))}><Audio src={staticFile(`sfx/${s.id}.mp3`)} volume={Math.min(1, s.vol * sfxGain)} /></Sequence>)}
      {guides && <SafeGuides />}
    </AbsoluteFill>
  );
};
