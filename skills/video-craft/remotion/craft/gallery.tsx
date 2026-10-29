// craft/gallery — 每款版式一个 4 秒预览合成 + 注册表（library 网站直接读 CRAFT_LAYOUTS）。
// 示例文字全部是通用的「剪辑」主题，不含任何客户/真实案例。
import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { StageBg, Txt, THEME_BIZ_GOLD_RED, THEME_DARK_LIME, THEME_GUOFENG_CREAM, THEME_KNOWLEDGE_YELLOW, Theme, useCraftFonts } from './kit';
import { BrollBottom, ChapterCardBody, CompareCard, PhoneSwipe, PipBroll, PosterHero, Reporter, RetentionCard, SplitBroll, SplitScene } from './scenes';
import { MotionText, MOTIONS } from './motion';
import { EmotionWord } from './emotion';
import { GlassWord, WallDemo } from './glass';
import { ChapterTag, GhostWord, LabelHero, QuoteCard, SpreadHero } from './typo';
import { EndCta, StackList, TopTitle } from './skeleton';
import { CameraStack, CamFx, ChatDM, CounterSlam, KineticLine, RapidMontage, SlotRow, Stamp, WhiteFlash } from './fx';
import { JyTextBeat } from './jytext';
import { DropText, HugeCaption, PixelText, PromptBox, TitleCard, TitleTag } from './ui-text';
import { Checklist, MagazineCover, OrbitText, ScatterText } from './fx2';
import { AppIconRow, BeforeAfter, DropZone, Palette, TimelinePanel } from './ui-meta';
import { CommentCard, CompareTiles, GlassChart, ParticleFill, PhotoCards, SideDoc, SideSticker, ThumbWall } from './ui-data';
import { Backdrop, InkWipe, Particles } from './backdrop';
import { AtoB, Bars, Chapter, ChestBig, DarkQuestion, GiantFill, LeftStair, SignatureCard, StrikeSwap, TwoColumn, TypedQuote, VerticalWall } from './layouts';

const Scene: React.FC<{ th: Theme; children: React.ReactNode; dark?: boolean }> = ({ th, children, dark }) => {
  useCraftFonts();
  return <AbsoluteFill style={{ background: th.bg }}><StageBg th={th} />{!dark && <AbsoluteFill style={{ background: 'linear-gradient(to bottom, rgba(11,9,18,0) 52%, rgba(11,9,18,0.8) 70%, rgba(11,9,18,0.95) 100%)' }} />}{children}</AbsoluteFill>;
};
const toks = (s: string, t0: number, step = 0.14): [string, number][] => [...s].map((c, i) => [c, t0 + i * step]);

export type CraftLayout = { id: string; no: string; zh: string; use: string; avoid: string; sfx: string; dur: number; comp: React.FC };
const th = THEME_DARK_LIME, U = 3.8;

export const CRAFT_LAYOUTS: CraftLayout[] = [
  { id: 'chest-big', no: '#23', zh: '胸口小字 + 大字', use: '一句铺垫 + 一个要点词。最常用，每支口播至少 3 次。', avoid: '连续 3 句都这样，会变成「全是重点＝没有重点」。', sfx: '缩小 + 咚 / 撞击光',
    dur: U, comp: () => <Scene th={th}><ChestBig th={th} small="剪出网感的第一步" big="删停顿" at={0.4} until={3.4} /></Scene> },
  { id: 'strike-swap', no: '#24', zh: '划掉换说法', use: '纠正一个常见误区：旧说法被划掉，新说法砸出来。', avoid: '旧说法太长——划线要一笔划完，字数 ≤6。', sfx: '划线=纸张抖动 · 新词=咚',
    dur: U, comp: () => <Scene th={th}><StrikeSwap th={th} lead="很多人以为" old="特效越多越好" at={0.3} strikeAt={1.3} next="节奏" nextAt={2.0} until={3.5} /></Scene> },
  { id: 'left-stair', no: '#53', zh: '左齐阶梯', use: '三步递进：原因 → 过程 → 结果。每行比上一行缩进，上一行变暗。', avoid: '超过 3 行；每行字要短，关键词用大字。', sfx: '每行一个「叮」，最后一行换重音',
    dur: U, comp: () => <Scene th={th}><LeftStair th={th} until={3.5} rows={[{ pre: '画面太', key: '平', at: 0.3 }, { pre: '字幕一直', key: '不变', at: 1.1 }, { pre: '观众', key: '划走了', at: 1.9, big: true }]} /></Scene> },
  { id: 'a-to-b', no: '#41', zh: 'A → B 因果', use: '「越 A 越 B」「因为 A 所以 B」，用一个箭头把前后连起来。', avoid: 'A 和 B 各不超过 4 个字，否则箭头放不下。', sfx: 'A=轻 · 箭头=呼 · B=咚',
    dur: U, comp: () => <Scene th={th}><AtoB th={th} a="越乱" b="越慢" at={0.3} bAt={1.6} until={3.5} /></Scene> },
  { id: 'two-column', no: '#17', zh: '两栏对比', use: '两个方案 / 两种做法对照。中线先划下来，左右各出一组。', avoid: '两边字数差太多会失衡；每栏 ≤ 3 行。', sfx: '中线=嗖 · 左右各一个叮',
    dur: U, comp: () => <Scene th={th}><TwoColumn th={th} until={3.5} lineAt={0.3} left={{ pre: '新手一上来就', key: 'effect', tail: '加满', at: 0.5 }} right={{ pre: '高手先把', key: 'timing', tail: '对齐', at: 1.8 }} /></Scene> },
  { id: 'bars', no: '#9', zh: '荧光条', use: '两个并列要点，像荧光笔划过的重点（卖点、结果）。', avoid: '条里只放 2–5 个字；超过 2 条会抢走人脸。', sfx: '每条一个「叮」或收银机',
    dur: U, comp: () => <Scene th={th}><Bars th={th} until={3.5} lead="想要" leadAt={0.3} bars={[{ text: '有节奏', at: 0.9 }, { text: '有重点', at: 1.8 }]} /></Scene> },
  { id: 'vertical-wall', no: '#35', zh: '右墙竖排', use: '2–4 个字的重点词竖着贴右边，不挡脸，适合「情绪词 / 结论词」。', avoid: '超过 4 个字；脸在右边时要换左墙。', sfx: '每个字一下重音',
    dur: U, comp: () => <Scene th={th}><VerticalWall th={th} until={3.5} chars={[{ c: '别', at: 0.5 }, { c: '再', at: 0.9 }, { c: '乱', at: 1.3, tone: 'accent2' }, { c: '剪', at: 1.7, tone: 'accent2' }]} /></Scene> },
  { id: 'dark-question', no: '#27', zh: '压暗大问句', use: '低声、反问、悬念。四周压暗，只留一个问句，镜头同时慢慢推近。', avoid: '一支片最多 1–2 次，多了失去分量。', sfx: '疑惑音，或完全静音',
    dur: U, comp: () => <Scene th={th}><DarkQuestion th={th} small="是不是我的素材" big="不够好？" at={0.3} bigAt={0.8} until={3.5} /></Scene> },
  { id: 'chapter', no: '—', zh: '章节清单 01/02', use: '讲方法、讲步骤：大数字 + 标题 + 打勾的小卡片，画面上移让字放在胸口。', avoid: '一次只讲一个编号；卡片 ≤ 2 张。', sfx: '数字=咚 · 每张卡片=叮',
    dur: U, comp: () => <Scene th={th}><Chapter th={th} until={3.5} num="01" title="先定节奏" at={0.3} chips={[{ text: '字块 ≤ 1.5 秒', at: 1.1 }, { text: '留 1 拍呼吸', at: 1.7 }]} punch={{ text: '两个都要做', at: 2.4 }} /></Scene> },
  { id: 'giant-fill', no: '#25', zh: '巨字填满', use: '落点金句：头顶一个巨大的空心字，讲到关键句从下往上填满。', avoid: '只用 1 个字；全片最多 1 次，留给最后一句。', sfx: '空心出现=呼 · 填满=综艺咚',
    dur: U, comp: () => <Scene th={th} dark><GiantFill th={th} char="稳" at={0.3} fillAt={1.6} until={3.5} /></Scene> },
  { id: 'typed-quote', no: '#38', zh: '圆窗逐字打出', use: '金句 / 引用：黑底，上面圆形人像窗，下面一个字一个字打出你讲的话。', avoid: '每行 ≤ 9 个字；字出现的时间要对上你讲那个字的时间。', sfx: '打字声（每字一下）',
    dur: U, comp: () => <Scene th={th} dark><TypedQuote th={th} at={0.2} until={3.5} lines={[{ toks: toks('剪辑不是加特效', 0.5), size: 88 }, { toks: toks('是删掉多余的', 1.8, 0.12), size: 88 }, { toks: toks('废话', 2.7, 0.14), size: 170, tone: 'accent', pre: '「', post: '」' }]} /></Scene> },
  { id: 'signature', no: '—', zh: '签名卡', use: '片尾：名字 + 人设一句话 + 系列名。压暗底，不加重音效，留干净收尾。', avoid: '别放多于 3 行；别再出新信息。', sfx: '无（或一声很轻的叮）',
    dur: U, comp: () => <Scene th={th}><SignatureCard th={th} at={0.4} name="我是示例" slogan={['不吹 AI，只讲', '真', 'AI']} tag="示例系列 · #1" /></Scene> },
];

/** 占位人像视频（换场预览用，不放真人脸）：小幅「呼吸」的人形 + 深色背景。渲成 public/craft/standin.mp4 */
export const StandIn: React.FC = () => {
  useCraftFonts();
  const th = THEME_DARK_LIME;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 50% at 50% 38%, #26233a 0%, ${th.bg} 70%)`, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 550 - 215, top: 640 - 300, width: 430, height: 520, borderRadius: '50% 50% 46% 46%', background: 'linear-gradient(180deg,#46405e,#2a2640)' }} />
      <div style={{ position: 'absolute', left: 550 - 420, top: 640 + 260, width: 840, height: 1100, borderRadius: '46% 46% 0 0', background: 'linear-gradient(180deg,#34304a,#16141f)' }} />
    </AbsoluteFill>
  );
};

/** 换场（scenes.tsx）：每 5–10 秒把「画面」换掉。预览用占位人像。 */
const SU = 4.6, STAND = () => staticFile('craft/standin.mp4');
export const CRAFT_SCENES: CraftLayout[] = [
  { id: 'split-retention', no: '换场', zh: '上卡下脸 · 留存曲线', use: '钩子 / 讲「没人看完」：上面一张曲线卡画出来，下面是你的人像窗。开头 3 秒给观众一个「画面钩子」，不要只有字幕。', avoid: '卡里别放整段字，只放一个图 + 一个词；整支最多 2 次。', sfx: '嗖 → 高科技显示 → 无奈（划走那一下）',
    dur: SU, comp: () => <Scene th={th} dark><SplitScene th={th} a={0.2} b={SU - 0.2} src={STAND()}>{(tt) => <RetentionCard th={th} t={tt} title="总是没人看完？" />}</SplitScene></Scene> },
  { id: 'split-compare', no: '换场', zh: '上卡下脸 · 对比时间轴', use: '「乱 vs 齐」「新手 vs 高手」：上面左右两个小图对比（✗ / ✓），下面是你在讲。', avoid: '左右两边视觉量要差得明显（乱 vs 齐），不然看不出对比。', sfx: '嗖 → 疑惑（乱）→ 正确（齐）',
    dur: SU, comp: () => <Scene th={th} dark><SplitScene th={th} a={0.2} b={SU - 0.2} src={STAND()}>{(tt) => <CompareCard th={th} t={tt} leftLabel="effect 加满" rightLabel="timing 对齐" leftAt={0.4} rightAt={1.7} />}</SplitScene></Scene> },
  { id: 'phone-swipe', no: '换场', zh: '手机划走', use: '讲「观众划走」「没人看」：黑底里一部手机放着你的口播，右边三行字递进，说到关键句手机往上划走。', avoid: '字最多三行、每行 ≤6 字（右边只剩 ~360px 宽）；别和左齐阶梯连着用。', sfx: '气泡 → 点击 → 悬疑（不对劲）→ 刷（划走）',
    dur: SU, comp: () => <Scene th={th} dark><PhoneSwipe th={th} a={0.2} b={SU - 0.1} src={STAND()} swipeAt={3.3} lines={[{ text: '画面太平', at: 0.5 }, { text: '字幕一直不变', at: 1.3 }, { text: '观众就划走了', at: 2.3, big: true }]} /></Scene> },
  { id: 'reporter', no: '换场', zh: '记者出镜（抠像站前面）', use: '讲步骤 / 清单：黑底，上面一张章节卡，你被抠出来站在前面。需要逐帧抠像（macOS：Apple Vision）。', avoid: '没有抠像就别用（预览里是占位人形）；卡片里一次只讲一个编号。', sfx: '忽然出现 → 碗叮 → 提示音 → 正确',
    dur: SU, comp: () => <Scene th={th} dark><Reporter th={th} a={0.2} b={SU - 0.1} matteRange={[-1, -1]} standIn>{(tt) => <ChapterCardBody th={th} t={tt} num="01" title="先定节奏" chips={[{ text: '字块 ≤ 1.5 秒', at: 1.0 }, { text: '留 1 拍呼吸', at: 1.8 }]} punch={{ text: '两个都要做', at: 2.6 }} />}</Reporter></Scene> },
  /* —— 抖音精剪（素材类）：第一定律「每 1.5–3 秒一个视觉变化」；讲到什么名词就切什么素材 —— */
  { id: 'pip-broll', no: '精剪', zh: '全屏素材 + 小人像窗（PIP）', use: '讲到一个具体名词 / 画面（产品、场景、动物…）：素材铺满全屏，你缩成白边小圆窗继续讲。小窗位置 右上 / 左上 / 底中 轮换，别遮素材主体。', avoid: '素材没有主体时别用（看起来空）；小窗别压住标签牌；同一位置别连用 3 次。', sfx: '嗖（素材进）→ 气泡（小窗弹出）',
    dur: SU, comp: () => <Scene th={th} dark><PipBroll th={th} a={0.2} b={SU - 0.1} src={STAND()} pos="tr" label="3 号清理装置" /></Scene> },
  { id: 'split-broll', no: '精剪', zh: '上人下素材（上下分屏）', use: '要一边讲、一边给观众看东西：上面是你（脸不动），下面一条素材，用黄色标签牌给素材命名。', avoid: '素材条别放字幕（字幕放在你身上 y≤1230）；下面素材要有运动，静图就加慢推。', sfx: '刷（素材升起）→ 提示音（标签牌）',
    dur: SU, comp: () => <Scene th={th} dark><SplitBroll th={th} a={0.2} b={SU - 0.1} src={STAND()} label="3 号清理装置" /></Scene> },
  { id: 'broll-bottom', no: '精剪', zh: '底部滑入素材条', use: '你全屏不动，素材从底部滑上来盖住下半屏（~45%）。最轻的一种素材插入，适合名词一闪而过。', avoid: '素材条会盖住胸口带——此时字幕必须让开（放到条的上沿之上或暂时隐藏）。', sfx: '嗖（滑入）→ 无（让声音干净）',
    dur: SU, comp: () => <Scene th={th}><BrollBottom th={th} a={0.4} b={SU - 0.1} label="素材命名" /></Scene> },
  { id: 'poster-hero', no: '精剪', zh: '海报大字 + 压暗', use: '关键名词 / 痛点词：整屏海报或 AI 图压暗 40%，一个金（利益）或红（痛点）大字砸出来，并在镜头里慢慢长大。', avoid: '一支片只用在最关键的 2–3 个词；大字不超过 4 个字（否则字号被压得太小）。', sfx: '嘭（砸出）→ 影视咚（长到最大）',
    dur: SU, comp: () => <Scene th={th} dark><PosterHero th={th} a={0.2} b={SU - 0.1} word="天敌" tone="pain" sub="引来天敌" /></Scene> },
];

/* 字怎么搭配：5 个排版搭配（来自 1-2 / 1-3 的版式家族）。预览用占位人形。 */
export const CRAFT_TYPO: CraftLayout[] = [
  { id: 'label-hero', no: '#1', zh: '小标 + 大字叠搭', use: '一个小标签和一个大字叠在一起（如「GMV」压在「2000万」上），数字 / 关键词一眼看清；可再加一个白底红字的小标。', avoid: '标签和大字别用同色；大字 ≤ 4 个字，否则被压得太小。', sfx: '叮 → 嘭（盖章 / 撞击）',
    dur: U, comp: () => <Scene th={th}><LabelHero th={th} label="GMV" hero="2000万" at={0.4} tag="三年做到" tagAt={1.3} until={3.5} /></Scene> },
  { id: 'spread-hero', no: '#3', zh: '拉开字距的大字', use: '1–3 个字的主角词把字距拉开，横跨整个宽度，像海报标题（「不要 / 赌博」「黑马」「放弃」）。上一行黄、下一行白或红。', avoid: '超过 3 个字拉开会散；只用在最狠的一句，全片 1–2 次。', sfx: '嘭 / 拳击 / 重音',
    dur: U, comp: () => <Scene th={th}><SpreadHero th={th} top="不要" bottom="赌博" at={0.4} until={3.5} /></Scene> },
  { id: 'ghost-word', no: '#51', zh: '背景巨字（幽灵字）', use: '一个巨大的半透明字当背景（「烦」「为什么」「100%」），前面叠一句小字点题——像把主题词垫在画面底下。', avoid: '别压在脸上（本库放在胸口带）；巨字别超过 3 个，否则糊成一团。', sfx: '呼 → 咚',
    dur: U, comp: () => <Scene th={th}><GhostWord th={th} ghost="为什么" line="明明工作那么努力" at={0.3} until={3.5} /></Scene> },
  { id: 'quote-card', no: '#10', zh: '引用卡（压暗虚化）', use: '背景压暗并虚化，编号白底小标 +「引文」，关键词换黄，出处小字右对齐。适合数据、名言、研究结论。', avoid: '最多 2 条引文、每条 ≤ 2 行；出处别写太长；不要在没有出处的主观句上用。', sfx: '提示音 / 打字',
    dur: U, comp: () => <Scene th={th}><QuoteCard th={th} until={3.6} items={[{ tag: '第一', at: 0.3, lines: [[{ t: '同一个话题' }], [{ t: '你的' }, { t: '不同价值观', hl: true }, { t: '是什么' }]] }, { tag: '第二', at: 1.5, lines: [[{ t: '不要做别人的' }, { t: '平替', hl: true }]] }]} source="来源：示例研究" sourceAt={2.4} /></Scene> },
  { id: 'chapter-tag', no: '1-3·47', zh: '章节标签', use: '「01 ▶ 价值观导向」那种黄色圆角块 + 虚线框标题，标出第几点；比大数字更轻。', avoid: '一次只出一个编号；和「章节清单」二选一，别叠着用。', sfx: '叮 / 提示音',
    dur: U, comp: () => <Scene th={th}><ChapterTag th={th} num="01" title="先定节奏" at={0.3} until={3.5} /></Scene> },
];

/* 骨架：一条片的排法里最常用、也最容易漏掉的三件（来自 64 条行业成片，见 references/essence.md）。 */
export const CRAFT_SKELETON: CraftLayout[] = [
  { id: 'top-title', no: '骨架', zh: '常驻小标题', use: '整片挂在顶部的两行栏目名（白 + 强调色）：晚点划到的人也知道在讲什么。开头就出现，一直到结尾前。', avoid: '头顶有空间才放；脸太大（头顶 ≈ y230）会被盖住，要先把画面下移或腾出头顶。别写成句子，8 个字以内。', sfx: '无（它是背景信息，不响）',
    dur: U, comp: () => <Scene th={th}><TopTitle th={th} line1="口播剪辑" line2="三步剪出网感" at={0.2} until={3.7} /></Scene> },
  { id: 'stack-list', no: '骨架', zh: '累加清单（旧条变暗）', use: '讲 2–3 个要点：一条一条出现，新的一条出来时旧的变暗；最后一句金句大字压上去。', avoid: '超过 3 条（带金句）或 4 条（不带）会超出胸口带；每条 ≤8 个字。', sfx: '每条一个「叮」，金句一个重音',
    dur: U, comp: () => <Scene th={th}><StackList th={th} until={3.6} items={[{ text: '先删停顿', at: 0.4 }, { text: '再对节奏', at: 1.1 }, { text: '最后配音效', at: 1.8 }]} punch={{ text: '三步就够', at: 2.6 }} /></Scene> },
  { id: 'end-cta', no: '骨架', zh: '结尾行动（胶囊 + 箭头）', use: '片尾告诉他下一步点哪里：蓝色胶囊按钮 + 指向左下角的箭头。几乎每条行业成片的结尾都有。', avoid: '文案由用户给；没有账号 / 联系方式就别编。别和签名卡叠在一起（二选一，或胶囊在上、签名在下）。', sfx: '一声很轻的「叮」，不要重音效',
    dur: U, comp: () => <Scene th={th}><EndCta th={th} label="找我聊聊" hint="点左下角" at={0.4} until={3.6} /></Scene> },
];

/* 钩子 / 特效：镜头层（冲镜 / 震动 / 电视关机 / 缩进手机 / 变圆头像）+ 重点词动画 + 界面比喻 + 纯代码背景。来自作者做的几集真实口播，见 references/audio-pipeline.md。预览用占位人形。 */
const Cam: React.FC<{ th: Theme; fx: CamFx[]; children?: React.ReactNode }> = ({ th, fx, children }) => { useCraftFonts(); return <AbsoluteFill style={{ background: th.bg }}><CameraStack th={th} fx={fx}><StageBg th={th} /></CameraStack>{children}</AbsoluteFill>; };
export const CRAFT_FX: CraftLayout[] = [
  { id: 'camera-punch', no: '特效', zh: '开场冲镜', use: '视频第一秒：画面从 1.28 倍冲到 1.0 倍并回弹，带动态模糊。钩子的第一下，配一个嗖。', avoid: '全片只用 1 次，放在开头；脸要在画面中间偏上，否则冲镜时脸会被推出去。', sfx: '嗖 上扬（whoosh_up）',
    dur: U, comp: () => <Cam th={th} fx={[{ kind: 'punch', at: 0.1, dur: 1.2 }]}><ChestBig th={th} small="开场第一秒" big="冲进来" at={0.5} until={3.4} /></Cam> },
  { id: 'camera-shake', no: '特效', zh: '冲击震动', use: '重点词砸下的那一下，画面跟着震动 + 放大 1.06 回弹（剪映「抖动」）。只震画面，字不震。', avoid: '一支片里最多 4–6 次，每次要对着一个重击点；别连续震。', sfx: '撞击（hit）/ 轰（boom）',
    dur: U, comp: () => <Cam th={th} fx={[{ kind: 'shake', hits: [0.9, 2.2] }]}><ChestBig th={th} small="第一击" big="砸!" at={0.9} until={2.1} /><ChestBig th={th} small="第二击" big="再砸!" at={2.2} until={3.5} /></Cam> },
  { id: 'camera-tvoff', no: '特效', zh: '电视关机', use: '讲「广告一停，生意就停了」「一下子全没了」：画面压成一条线 → 一个点 → 黑，黑场一直到下一句。', avoid: '黑场要给 until，不然一路黑到片尾；只在「消失 / 结束」的句子用。', sfx: '低频下沉（sub_drop）',
    dur: U, comp: () => <Cam th={th} fx={[{ kind: 'tvoff', at: 1.2, until: 3.0 }]}><ChestBig th={th} small="广告一停" big="生意就停" at={0.2} until={1.2} /></Cam> },
  { id: 'camera-send', no: '特效', zh: '缩进手机飞走', use: '讲「把这条视频发给他」「转发」：整个画面缩进一支手机 → 停一下 → 往右上飞走。', avoid: '背景用深色星空（Backdrop），别用白底；全片最多 1 次，留给转发 / 分享的号召。', sfx: '嗖 上扬 + 拉链上滑',
    dur: U, comp: () => <Cam th={th} fx={[{ kind: 'send', at: 1.0, until: 3.2 }]}><ChestBig th={th} small="发给身边的人" big="转发" at={0.1} until={1.0} /></Cam> },
  { id: 'camera-circle', no: '特效', zh: '画面变圆头像 + 周围圆圈', use: '讲「身边的同行 / 团队 / 客户」：说话的人缩成圆头像，周围圆圈一个个弹出、连线连上他。「讲什么就画什么」的典型。', avoid: '脸的位置要告诉它（face）；圆圈最多 6 个；别和字幕、大字同时出现太多。', sfx: '啵 × N',
    dur: 4.2, comp: () => <Cam th={th} fx={[{ kind: 'circle', at: 0.6, until: 4.0, popAt: 1.3, cy: 800, R: 220 }]} /> },
  { id: 'white-flash', no: '特效', zh: '白闪', use: '钩子那一下、换场、重击点：整屏白一下（0.22 秒）再退掉。常和冲镜、大字同帧。', avoid: '一支片里最多 3–4 次；别用在安静的句子。', sfx: '闪光（flash）',
    dur: U, comp: () => <Scene th={th}><ChestBig th={th} small="结果他开了" big="8 单" at={0.6} until={3.4} /><WhiteFlash at={0.6} /></Scene> },
  { id: 'kinetic-line', no: '特效', zh: '逐词放大变色', use: '一句话一拍一词：新词放大弹入，上一词缩小变暗留在上面；重点词用强调色 + 更大。适合开头的金句。', avoid: '一句 ≤6 个词；每个词要对着他讲那个词的时间；别和字幕同时挤在胸口带。', sfx: '啵 / 重点词用撞击',
    dur: U, comp: () => <Scene th={th}><KineticLine th={th} y={1010} words={[{ t: 0.3, text: '你的' }, { t: 0.8, text: '下一张单' }, { t: 1.5, text: '就在' }, { t: 2.0, text: '同行那里', hot: true }]} until={3.5} /></Scene> },
  { id: 'counter-slam', no: '特效', zh: '数字滚动砸下', use: '具体数字（8 单、50 万、10 年）：从 0 滚到目标，越滚越慢，落地放大砸下 + 光晕。比直接出数字强很多。', avoid: '一支片 1–3 个数字；数字要是他真讲的，不要编；后缀小字写单位。', sfx: '嘀嘀 + 撞击',
    dur: U, comp: () => <Scene th={th}><CounterSlam th={th} to={8} at={0.2} land={1.7} top={420} suffix="单" until={3.5} /></Scene> },
  { id: 'stamp', no: '特效', zh: '印章字', use: '「全部都是 X」「已成交」「重点」：字像印章从大盖下来（2.2 倍 → 1 倍）+ 微倾。', avoid: '字 ≤6 个；颜色用红 / 强调色，别和大字同色；一支片 1–2 次。', sfx: '印章（stamp）',
    dur: U, comp: () => <Scene th={th}><Stamp th={th} text="全部成交" at={0.8} until={3.4} y={1050} /></Scene> },
  { id: 'chat-dm', no: '特效', zh: '聊天框发送', use: '讲「私信我 X」「留言 X」：底部弹出输入框 → 打字 → 发送 → 强调色气泡飞上去。号召动作的画面化。', avoid: '字写他真讲的关键词（≤6 个字）；放在结尾引导；别再叠结尾胶囊。', sfx: '打字 + 啵 + 提示',
    dur: 4.2, comp: () => <Scene th={th}><ChatDM th={th} text="GPS" at={0.2} sendAt={1.5} until={4.0} y={1000} /></Scene> },
  { id: 'slot-row', no: '特效', zh: '空位一个个弹出', use: '讲「至少 7 单」「十个名额」「目标」：下面摆出 N 个虚线空位，一个个弹出。', avoid: 'N ≤ 10；放在胸口带（y≈1050）；别压字幕。', sfx: '啵 × N',
    dur: U, comp: () => <Scene th={th}><SlotRow th={th} n={7} y={1050} at={0.3} until={3.5} /></Scene> },
  { id: 'rapid-montage', no: '特效', zh: '截图快闪', use: '用真截图当证据：每张 0.2 秒放大入 + 左右轻倾，最后一张停住，上面写「第 N 个」。真截图比任何动画有说服力。', avoid: '截图要你自己准备（public 里，写路径和原图像素）；遮掉别人的名字和电话；别超过 12 张。', sfx: '快门（camera）',
    dur: U, comp: () => <Scene th={th}><RapidMontage th={th} at={0.3} until={3.5} step={0.45} label="第 {n} 个" images={[1, 2, 3, 4].map((i) => ({ src: `craft/ph/shot${i}.png`, w: 540, h: 960 }))} /></Scene> },
  { id: 'jy-text-a', no: '特效', zh: '剪映文字动画 A（4 个）', use: '24 个剪映文字预设里的 4 个：向上露出 / 随机上升 / 模糊发光 / 呐喊声波。每个预设的位移 / 缩放 / 亮度 / 模糊都按剪映样片逐帧量出来的表写成，音效自动配。', avoid: '不是每个字都要动（原包 52% 的字没有动画）；一句一个预设，别连续同一个。', sfx: '预设自带（见 autosfx）',
    dur: 4.6, comp: () => <Scene th={th}><JyTextBeat th={th} text="向上露出" at={0.1} dur={1.0} preset="向上露出" y={980} size={130} tone="white" /><JyTextBeat th={th} text="随机上升" at={1.2} dur={1.0} preset="随机上升" y={980} size={130} tone="white" /><JyTextBeat th={th} text="模糊发光" at={2.3} dur={1.0} preset="模糊发光" y={980} size={130} tone="accent" /><JyTextBeat th={th} text="呐喊声波" at={3.4} dur={1.1} preset="呐喊声波" y={980} size={130} tone="accent" /></Scene> },
  { id: 'jy-text-b', no: '特效', zh: '剪映文字动画 B（4 个）', use: '缩小 II（先大后砸）/ 波浪弹入 / 打字光标 / 跃进。「弹」类预设有回弹，配综艺音；其余基本是缓出。', avoid: '弹类只给轻松的词；打字光标只给「定义 / 关键词」；别全片都弹。', sfx: '预设自带（见 autosfx）',
    dur: 4.6, comp: () => <Scene th={th}><JyTextBeat th={th} text="缩小二" at={0.1} dur={1.0} preset="缩小II" y={980} size={130} tone="white" /><JyTextBeat th={th} text="波浪弹入" at={1.2} dur={1.0} preset="波浪弹入" y={980} size={130} tone="white" /><JyTextBeat th={th} text="打字光标" at={2.3} dur={1.0} preset="打字光标" y={980} size={130} tone="accent" /><JyTextBeat th={th} text="跃进" at={3.4} dur={1.1} preset="跃进" y={980} size={150} tone="accent" /></Scene> },
  { id: 'backdrop-cosmos', no: '特效', zh: '星空背景页', use: '人缩成圆头像 / 手机时露出来的那层：深色星空三层视差 + 慢转的九宫格线，颜色来自主题。不需要任何图片。', avoid: '不要整片都用它当背景（会抢人）；只在「黑底页」场景用。', sfx: '无',
    dur: U, comp: () => <Cam th={th} fx={[]}><Backdrop th={th} kind="cosmos" /><ChestBig th={th} small="黑底页" big="星空" at={0.4} until={3.4} /></Cam> },
  { id: 'particles', no: '特效', zh: '光尘 / 萤火粒子', use: '压在画面上的氛围层：gold = 光尘往上飘，firefly = 暖色萤火会闪。给国风 / 故事感的画面一点空气。', avoid: '粒子别太密（n≤60）；快节奏的片别用，会显脏。', sfx: '无',
    dur: U, comp: () => <Scene th={th}><Particles th={th} kind="gold" n={46} at={0} until={3.6} area={[0, 700, 1080, 1700]} /><ChestBig th={th} small="氛围层" big="光尘" at={0.4} until={3.4} /></Scene> },
  { id: 'ink-wipe', no: '特效', zh: '水墨转场', use: '两段之间的转场：一团墨从中心晕开盖满再退开（blot / brush 一笔横扫 / splash 四溅 / rise 上涌）。国风、故事感。', avoid: '一支片最多 3 次；时长 0.9 秒，别压在重点词上。', sfx: '长嗖（whoosh_long）',
    dur: U, comp: () => <Scene th={th}><ChestBig th={th} small="第一段" big="之前" at={0.1} until={1.5} /><ChestBig th={th} small="第二段" big="之后" at={1.9} until={3.6} /><InkWipe at={1.0} dur={1.2} kind="brush" /></Scene> },
];

/* 文字入场动画：18 个预设（来自「2-1 文字动画和音效常用搭配」38 种动画的慢放拆解）。 */
export const CRAFT_MOTIONS: CraftLayout[] = [
  { id: 'motion-fade', no: '动画', zh: '渐显', use: '最常用的底：知识、叙述、一般句子；不抢戏（原包 110 次，第一名）。', avoid: '要强调时别用（没有冲击）；别句句都用。', sfx: '纸张 / 呼（轻），或不加',
    dur: 2.6, comp: () => <Scene th={th}><MotionText th={th} text="剪出网感" preset="fade" at={0.4} until={2.4} y={1040} size={150} /></Scene> },
  { id: 'motion-slide-up', no: '动画', zh: '向上滑动', use: '温和的信息出现：标题、条目逐行出现，上滑一点点 + 渐显。', avoid: '连续很多行同一个方向会呆板。', sfx: '呼 / 刷（轻）',
    dur: 2.6, comp: () => <Scene th={th}><MotionText th={th} text="剪出网感" preset="slide-up" at={0.4} until={2.4} y={1040} size={150} /></Scene> },
  { id: 'motion-reveal-up', no: '动画', zh: '向上露出', use: '从下往上「擦出来」：定义、结论句，有仪式感。', avoid: '字太小会看不清擦的过程。', sfx: '刷',
    dur: 2.6, comp: () => <Scene th={th}><MotionText th={th} text="剪出网感" preset="reveal-up" at={0.4} until={2.4} y={1040} size={150} /></Scene> },
  { id: 'motion-curtain', no: '动画', zh: '开幕', use: '从中间向两边展开：开场标题、章节名；知识 / 国风气质。', avoid: '快节奏连续用会拖。', sfx: '纸张抖动 / 呼',
    dur: 2.6, comp: () => <Scene th={th}><MotionText th={th} text="剪出网感" preset="curtain" at={0.4} until={2.4} y={1040} size={150} /></Scene> },
  { id: 'motion-grow', no: '动画', zh: '放大', use: '数字、要点出现：从一半大小放大到位，有「长出来」的感觉。', avoid: '别和「砸下」在同一句里一起用。', sfx: '点击 / 叮 / 弹簧',
    dur: 2.6, comp: () => <Scene th={th}><MotionText th={th} text="剪出网感" preset="grow" at={0.4} until={2.4} y={1040} size={150} /></Scene> },
  { id: 'motion-grow-soft', no: '动画', zh: '轻微放大', use: '字幕级的轻动：关键词不抢戏地强调（6% 的缩放）。', avoid: '想要冲击时别用（太轻）。', sfx: '叮（轻）',
    dur: 2.6, comp: () => <Scene th={th}><MotionText th={th} text="剪出网感" preset="grow-soft" at={0.4} until={2.4} y={1040} size={150} /></Scene> },
  { id: 'motion-shrink', no: '动画', zh: '缩小', use: '强调、反转：从略大缩到正常，有「落下来」的感觉（原包 80 次，第二名）。', avoid: '别给整句长句（缩放会让长句出界）。', sfx: '咚 / 撞击 / 水滴',
    dur: 2.6, comp: () => <Scene th={th}><MotionText th={th} text="剪出网感" preset="shrink" at={0.4} until={2.4} y={1040} size={150} /></Scene> },
  { id: 'motion-slam', no: '动画', zh: '砸下', use: '全片最重的一个词：从 3 倍大砸到 1 倍，必须配重音。', avoid: '全片最多 2–3 次；没有重击音效会很空。', sfx: '嘭 / 影视咚',
    dur: 2.6, comp: () => <Scene th={th}><MotionText th={th} text="剪出网感" preset="slam" at={0.4} until={2.4} y={1040} size={150} /></Scene> },
  { id: 'motion-glow-blur', no: '动画', zh: '发光模糊', use: '情感、玄、柔和的句子：模糊 → 清晰，带一点辉光（原包 106 次：模糊发光 + 雪光模糊 + 发光模糊）。', avoid: '快节奏的词用会糊（0.7 秒偏慢）。', sfx: '水滴 / 响铃 / 魔法',
    dur: 2.6, comp: () => <Scene th={th}><MotionText th={th} text="剪出网感" preset="glow-blur" at={0.4} until={2.4} y={1040} size={150} /></Scene> },
  { id: 'motion-blur-left', no: '动画', zh: '向左模糊', use: '换话题、有转场感的句子：从右向左带运动模糊滑入。', avoid: '放在画面右侧的字别用。', sfx: '呼 / 嗖',
    dur: 2.6, comp: () => <Scene th={th}><MotionText th={th} text="剪出网感" preset="blur-left" at={0.4} until={2.4} y={1040} size={150} /></Scene> },
  { id: 'motion-rise-random', no: '动画', zh: '随机上升', use: '知识 / 读书类的句子：每个字从不同的高度浮上来。', avoid: '字太多会乱（≤8 字）。', sfx: '纸张抖动',
    dur: 2.6, comp: () => <Scene th={th}><MotionText th={th} text="剪出网感" preset="rise-random" at={0.4} until={2.4} y={1040} size={150} /></Scene> },
  { id: 'motion-wave-bounce', no: '动画', zh: '波浪弹入', use: '轻松、俏皮、有趣的词：逐字弹起像波浪。', avoid: '严肃 / 法律 / 金融类内容不适合。', sfx: '气泡 / 啵',
    dur: 2.6, comp: () => <Scene th={th}><MotionText th={th} text="剪出网感" preset="wave-bounce" at={0.4} until={2.4} y={1040} size={150} /></Scene> },
  { id: 'motion-typewriter', no: '动画', zh: '打字光标', use: '定义、关键词、「正在输入」的感觉；配打字声最稳（原包 68 次）。', avoid: '长句太慢（每字 0.075 秒，12 字就 0.9 秒）。', sfx: '打字声（每字一下）',
    dur: 2.6, comp: () => <Scene th={th}><MotionText th={th} text="剪出网感" preset="typewriter" at={0.4} until={2.4} y={1040} size={150} /></Scene> },
  { id: 'motion-develop', no: '动画', zh: '逐字显影', use: '沉稳、文艺的句子：逐字从模糊灰色变清晰。', avoid: '整句 0.7 秒以上会拖，≤8 字。', sfx: '无，或水滴 / 空灵',
    dur: 2.6, comp: () => <Scene th={th}><MotionText th={th} text="剪出网感" preset="develop" at={0.4} until={2.4} y={1040} size={150} /></Scene> },
  { id: 'motion-leap', no: '动画', zh: '跃进', use: '有力的短词：从下方跃起到位，带一点回弹。', avoid: '不要给长句。', sfx: '叮 / 弹簧',
    dur: 2.6, comp: () => <Scene th={th}><MotionText th={th} text="剪出网感" preset="leap" at={0.4} until={2.4} y={1040} size={150} /></Scene> },
  { id: 'motion-roll-in', no: '动画', zh: '滚入', use: '数字、钱、成交：像老虎机一样滚上来。', avoid: '文字过长时滚动看不清。', sfx: '收银机 / 金币',
    dur: 2.6, comp: () => <Scene th={th}><MotionText th={th} text="剪出网感" preset="roll-in" at={0.4} until={2.4} y={1040} size={150} /></Scene> },
  { id: 'motion-tracking-in', no: '动画', zh: '字距收拢', use: '标题、金句：字从分散收拢到位，有「聚焦」感（向右集合 + 收拢，共 52 次）。', avoid: '字少于 3 个时收拢幅度不明显。', sfx: '嗖（轻）/ 呼',
    dur: 2.6, comp: () => <Scene th={th}><MotionText th={th} text="剪出网感" preset="tracking-in" at={0.4} until={2.4} y={1040} size={150} /></Scene> },
  { id: 'motion-echo', no: '动画', zh: '回声', use: '喊话、强烈情绪、「注意！」：字弹出并向外扩出回声圈（呐喊声波）。', avoid: '全片最多一两次；别给长句。', sfx: '重咚 / 撞击',
    dur: 2.6, comp: () => <Scene th={th}><MotionText th={th} text="剪出网感" preset="echo" at={0.4} until={2.4} y={1040} size={150} /></Scene> },
];

/* 行业主题：66 个行业成片的风格家族（references/industry-styles.md）。预览用占位人形。 */
export const CRAFT_THEMES: CraftLayout[] = [
  { id: 'theme-biz-gold-red', no: '主题', zh: 'A 商务金红', use: '法律、金融、贷款、房产、教育、商业认知、汽车、留学——要「可信、利落」。得意黑为主 + 金 #ffbf17 / 深红 #b71c1c（52% 的行业成片）。动画偏 渐显 / 放大 / 缩小 / 发光模糊，音效偏「呼」和撞击。', avoid: '一个版式里金 = 利益、红 = 痛点；别再加第三种强调色。', sfx: '呼 → 撞击光 / 旋风',
    dur: 3.8, comp: () => <Scene th={THEME_BIZ_GOLD_RED}><ChestBig th={THEME_BIZ_GOLD_RED} small="合同里最重要的一句" big="先看条款" at={0.3} until={2.0} /><LabelHero th={THEME_BIZ_GOLD_RED} label="记住" hero="条款" at={2.2} until={3.5} /></Scene> },
  { id: 'theme-guofeng-cream', no: '主题', zh: 'B 国风米黄', use: '养生、女性情感 / 成长、心理、情感、瑜伽、全屋定制——要「温和、有质感」。衬线体 + 米黄 #fff589 / 深红。动画偏 渐显 / 轻微放大 / 开幕 / 逐字显影，音效偏纸张和「呼」。', avoid: '原包用古典体 / 金陵体（不随仓库），本库退回思源 Heavy，质感会弱一些。', sfx: '纸张抖动 → 呼',
    dur: 3.8, comp: () => <Scene th={THEME_GUOFENG_CREAM}><ChestBig th={THEME_GUOFENG_CREAM} small="睡前只做这一件事" big="放松" at={0.3} until={2.0} /><LabelHero th={THEME_GUOFENG_CREAM} label="慢慢来" hero="呼吸" at={2.2} until={3.5} /></Scene> },
  { id: 'theme-knowledge-yellow', no: '主题', zh: 'C 知识明黄', use: '知识付费、职场、创业 IP、商业导师、二手车、房产中介、读书、财税——要「明快、讲干货」。抖音美好体做配角 + 明黄 #fff589 / 深红。动画偏 缩小 / 渐显 / 开幕 / 向左模糊，音效偏刷、纸张、打字声。', avoid: '节奏最密（约 78 字块/分、54 音效/分，15–60 秒短片的中位数）；别照搬到长片。', sfx: '刷 → 打字声',
    dur: 3.8, comp: () => <Scene th={THEME_KNOWLEDGE_YELLOW}><ChestBig th={THEME_KNOWLEDGE_YELLOW} small="涨粉的第一步" big="选题" at={0.3} until={2.0} /><LabelHero th={THEME_KNOWLEDGE_YELLOW} label="先想清楚" hero="定位" at={2.2} until={3.5} /></Scene> },
];

/* 情绪字：4 个文字类情绪字（原包「1-3」的哭泣 / 惊讶 / 非常开心 / 救命，放慢拆帧后重写）。人脸特效类（眼泪、真香翅膀）没有做。 */
export const CRAFT_EMOTIONS: CraftLayout[] = [
  { id: 'emo-cry', no: '情绪字', zh: '哭泣', use: '一个词就是一个负面情绪：字先是白色，红色像液体一样从下往上灌满（约 0.7 秒），字距拉开横跨宽度。适合「崩溃、痛、哭」这类词。', avoid: '全片 1–2 次；别给长句；红色是「痛点」色，别和本来就用红做强调的版式叠着用。', sfx: '重咚 / 叹气（无奈）',
    dur: 3.6, comp: () => <Scene th={th}><EmotionWord th={th} text="哭泣" kind="cry" at={0.3} until={3.3} /></Scene> },
  { id: 'emo-surprise', no: '情绪字', zh: '惊讶', use: '惊讶、意外、转折词：两个字一上一下错开地摆动，各带 ±8° 倾斜，循环约 1 秒，金黄色。', avoid: '字多了摆动会乱（2–3 个字最好）；严肃内容不适合。', sfx: '惊讶音 / 啵',
    dur: 3.6, comp: () => <Scene th={th}><EmotionWord th={th} text="惊讶" kind="surprise" at={0.3} until={3.3} /></Scene> },
  { id: 'emo-joy', no: '情绪字', zh: '开心', use: '开心、好消息、成功：淡黄字，背后放射状光芒随节拍明暗脉动，约 1 秒一周期。', avoid: '光芒会盖住脸后面的画面，别和大面积素材同时用；全片 1–2 次。', sfx: '叮 / 魔法 / 欢呼',
    dur: 3.6, comp: () => <Scene th={th}><EmotionWord th={th} text="非常开心" kind="joy" at={0.3} until={3.3} /></Scene> },
  { id: 'emo-shout', no: '情绪字', zh: '喊话', use: '喊话、求救、「注意！」：两个字向外倾斜，先淡入再轻轻摆动，并向外扩出回声。', avoid: '只给 2–3 个字的短词；扩出的回声会超出字本身，留够左右空间。', sfx: '重咚 / 撞击',
    dur: 3.6, comp: () => <Scene th={th}><EmotionWord th={th} text="救命" kind="shout" at={0.3} until={3.3} /></Scene> },
];

/* 抠像 + 玻璃字：字在人后、玻璃质感大字。预览用「木板墙 + 占位人形抠像」，没有真人。 */
const Raw: React.FC<{ children: React.ReactNode }> = ({ children }) => { useCraftFonts(); return <AbsoluteFill>{children}</AbsoluteFill>; };
export const CRAFT_MATTE: CraftLayout[] = [
  { id: 'glass-hero', no: '抠像', zh: '玻璃字（半透明渐层）', use: '一个主角词做成「玻璃字」：金黄渐层，但背后画面的明暗纹理会透进字里，像毛玻璃。适合开场标题、品牌词、一条片里唯一的大字。', avoid: '背后画面要有明暗起伏（木纹 / 砖墙 / 窗帘），一整片平的深色墙几乎看不出来；不能放进带 transform / opacity / filter 的外层（强光混合会失效）。', sfx: '呼 → 魔法 / 闪光',
    dur: 3.8, comp: () => <Raw><WallDemo person={false}><GlassWord th={th} text="剪出网感" size={230} at={0.3} until={3.4} y={760} /></WallDemo></Raw> },
  { id: 'text-behind', no: '抠像', zh: '字在人后（抠像）', use: '大字放在人的后面：背景 → 字 → 抠像 PNG 盖在最上面，人把字挡住一点，画面有层次感。需要逐帧抠像（macOS：Apple Vision）。', avoid: '没有抠像就别用；字要放在和视频同一个镜头容器里（才跟着手持晃动 / 推近对齐）；没有抠像的那一帧不画字，宁可没字也别盖在脸上；窗口控制在 ~3 秒内（抠像逐帧很慢）。', sfx: '咚 / 撞击',
    dur: 3.8, comp: () => <Raw><WallDemo dy={200}><Txt th={th} at={0.3} until={3.4} y={340} size={250} tone="white" anim="slam">剪出网感</Txt></WallDemo></Raw> },
  { id: 'glass-behind', no: '抠像', zh: '玻璃字在人后', use: '两者结合：金黄玻璃字放在人后面，纹理透进字里，人挡住字的一部分。最有「高级感」的一种大字。', avoid: '同「玻璃字」+「字在人后」的限制；全片最多 1 次，留给开场或最关键的一句。', sfx: '呼 → 咚 / 魔法',
    dur: 3.8, comp: () => <Raw><WallDemo dy={200}><GlassWord th={th} text="剪出网感" size={250} at={0.3} until={3.4} y={340} /></WallDemo></Raw> },
];

/* 参考「特效演示」逐帧观察后重写的 UI 类特效（文字 + 数据 + 卡片），见 references/ui-effects.md。 */
CRAFT_FX.push(
  { id: 'title-tag', no: '特效', zh: '顶部标题 + 标签 + 底说明', use: '系列感开场：顶部栏目名淡入，橙色小标签横向展开（「第二弹」「第 3 集」），底部一行小说明。', avoid: '和 top-title 二选一；标题 ≤8 字，标签 ≤4 字。', sfx: '轻划（swish）',
    dur: U, comp: () => <Scene th={th}><TitleTag th={th} title="剪辑特效" tag="第二弹" caption="一句话叫出来的剪辑特效" at={0.2} until={3.5} /></Scene> },
  { id: 'pixel-text', no: '特效', zh: '像素字（点阵屏）', use: '讲「AI / 代码 / 数据 / 科技」：画面压暗，字一个个打出，新字带红青分离，打完下面出一行小的点阵副标题。', avoid: '字 ≤6 个；全片 1 次；背景别太亮否则点阵不明显。', sfx: '打字 + 故障',
    dur: 4.0, comp: () => <Scene th={th}><PixelText th={th} text="像素字" sub="PIXEL WORDS" at={0.2} until={3.6} /></Scene> },
  { id: 'drop-text', no: '特效', zh: '掉落字', use: '强调「掉下来 / 崩了 / 塌了」：大字一个个带重力掉下、旋转、落地回弹，叠成一堆。', avoid: '字 ≤4 个；一支片 1 次；别压脸（默认在左上）。', sfx: '咚 × N（thud）',
    dur: U, comp: () => <Scene th={th}><DropText th={th} text="掉落字" small="gravity" label="drop" at={0.2} until={3.2} /></Scene> },
  { id: 'huge-caption', no: '特效', zh: '巨大字 + 小修饰词', use: '一个大词 + 右下角冒一个小的强调色词（「巨大 / 字幕」「爆款 / 标题」）。', avoid: '大词 ≤3 字；小词 ≤3 字。', sfx: '撞击 + 啵',
    dur: U, comp: () => <Scene th={th}><HugeCaption th={th} big="巨大" small="字幕" at={0.2} until={3.2} /></Scene> },
  { id: 'title-card', no: '特效', zh: '电影字卡（整屏色块）', use: '章节转场：整屏橙色卡从下往上滑入，两三行大字依次出现，停一会儿向下滑走。', avoid: '一支片最多 2 张；每行 ≤8 字；背景色用 color 换。', sfx: '嗖 + 叮',
    dur: U, comp: () => <Scene th={th}><TitleCard th={th} lines={["自动剪辑","超级简单"]} at={0.2} until={3.3} /></Scene> },
  { id: 'prompt-box', no: '特效', zh: '提示词输入框', use: '讲「一句指令搞定」：顶部药丸输入框从发送钮展开，逐字打出指令，打完发送钮亮起。', avoid: '字 ≤10；放在顶部不挡脸。', sfx: '打字 + 啵',
    dur: U, comp: () => <Scene th={th}><PromptBox th={th} text="帮我自动上特效" at={0.2} until={3.5} sendAt={2.4} /></Scene> },
  { id: 'glass-chart', no: '特效', zh: '玻璃图表（数字 + 折线）', use: '讲「观看数 / 增长」：毛玻璃卡里大数字缓动数到目标，同时绿线左→右画出。', avoid: '数据必须是他真讲的；一支片 1–2 次。', sfx: '嘀嘀 + 叮',
    dur: U, comp: () => <Scene th={th}><GlassChart th={th} label="观看数" from={3.6} to={14.5} unit="万" at={0.2} until={3.5} /></Scene> },
  { id: 'compare-tiles', no: '特效', zh: '对比数字牌（以前 / 现在）', use: '讲「以前 180 分钟，现在 3 分钟」：两块牌，一块固定，一块数字缓入缓出数到目标，变强调色并出结论。', avoid: '数字必须真实；结论句 ≤10 字。', sfx: '嘀嘀 + 叮',
    dur: 4.0, comp: () => <Scene th={th}><CompareTiles th={th} chip="01 对比" before={180} to={3} unit="分" verdict="省下 98% 时间" at={0.2} until={3.6} /></Scene> },
  { id: 'photo-cards', no: '特效', zh: '快门卡（拍立得飞入）', use: '讲「素材 / 案例 / 截图」：白边拍立得卡片从角落飞入，冲过头后落定。', avoid: 'srcs 放 public 里的图；没有就画色块。', sfx: '咔嚓 × N',
    dur: U, comp: () => <Scene th={th}><PhotoCards th={th} at={0.2} until={3.3} /></Scene> },
  { id: 'side-sticker', no: '特效', zh: '头旁贴纸', use: '讲数字结果：小卡飞到头左边，右边弹出白色数字贴纸 + 小红标签。', avoid: '贴纸字 ≤5。', sfx: '啵 + 咚',
    dur: U, comp: () => <Scene th={th}><SideSticker th={th} value="14.5万" tag="播放" at={0.2} until={3.3} /></Scene> },
  { id: 'particle-fill', no: '特效', zh: '粒子装满容器', use: '讲「一点一点累积」：上方滑下奶油色面板，橙色颗粒落进 U 形容器堆满。', avoid: '标题 ≤8 字；面板占上 40%，视频留下半。', sfx: '颗粒 tick 连打',
    dur: U, comp: () => <Scene th={th}><ParticleFill th={th} title="一点一点累积" at={0.2} until={3.5} /></Scene> },
  { id: 'side-doc', no: '特效', zh: '左文件卡 + 步骤高亮', use: '讲「流程 / 步骤」：白色文件卡从左滑入，浅橙高亮条逐项下移；人像在右。', avoid: '步骤 ≤4 项，每项 ≤8 字。', sfx: '每步一个 tick',
    dur: 4.0, comp: () => <Scene th={th}><SideDoc th={th} title="剪辑流程" items={["录一段口播","打一句指令","自动上特效","直接发布"]} at={0.2} until={3.6} /></Scene> },
  { id: 'thumb-wall', no: '特效', zh: '合集墙', use: '讲「合集 / 一共 N 个」：深色底，大标题 + 橙色药丸，下面缩略图格按列填满。', avoid: 'srcs 可放 public 里的图。', sfx: '啵 × N',
    dur: U, comp: () => <Scene th={th}><ThumbWall th={th} title="合集墙" pill="15 个特效・一句话叫出来" at={0.2} until={3.5} /></Scene> },
  { id: 'comment-card', no: '特效', zh: '留言卡（结尾 CTA）', use: '结尾：深色底，标题「留言 X」淡入，橙色药丸「送你 XX」弹出；人像缩成卡（用 camera 缩小）。', avoid: '只放结尾；关键词 ≤4 字。', sfx: '叮',
    dur: U, comp: () => <Scene th={th}><CommentCard th={th} title="留言「第二弹」" pill="送你免费特效技能包" at={0.2} until={3.6} /></Scene> },
  { id: 'timeline-panel', no: '特效', zh: '时间轴面板', use: '讲「自动剪辑 / 一条条拼起来」：深色面板滑入，时间码逐帧跳，缩略图铺满，波形 + 红色播放头扫过。', avoid: '全片 1 次；放在下巴下面（用 y），别压脸。', sfx: '滴答 + 轻划',
    dur: U, comp: () => <Scene th={th}><TimelinePanel th={th} at={0.2} until={3.4} /></Scene> },
  { id: 'drop-zone', no: '特效', zh: '拖入素材', use: '讲「把素材丢进去」：虚线卡 + 缩略图沿弧线飞入，文字变「已导入」，出现黄色对勾。', avoid: 'label 写他真讲的动作；全片 1 次。', sfx: '嗖 + 啵',
    dur: U, comp: () => <Scene th={th}><DropZone th={th} at={0.2} until={3.4} /></Scene> },
  { id: 'palette', no: '特效', zh: '色板取色', use: '讲「取色 / 配色 / 风格」：奶油卡片上滑，吸管依次落到画面上的点，色块填上颜色和色号。', avoid: '落点 x、y 要落在画面里真有那个颜色的位置；色块 ≤3 个。', sfx: '啵 × N',
    dur: 4.0, comp: () => <Scene th={th}><Palette th={th} at={0.2} until={3.6} colors={[{ hex: "#4A3731", at: 1.0, x: 300, y: 500 }, { hex: "#BABBB6", at: 1.7, x: 700, y: 560 }, { hex: "#E5783A", at: 2.4, x: 540, y: 800 }]} /></Scene> },
  { id: 'before-after', no: '特效', zh: '前后对比滑杆', use: '讲「调色前后 / 改之前改之后」：画面变灰，白色竖线把手从左扫到右，右边是调色后。', avoid: '只改画面颜色，不改人；全片 1 次。', sfx: '嗖 + 叮',
    dur: U, comp: () => <Scene th={th}><BeforeAfter th={th} at={0.2} until={3.4} /></Scene> },
  { id: 'app-icons', no: '特效', zh: '应用图标一排', use: '讲「用什么工具」：圆角图标一个个弹出，下面小字写名字；可选删掉其中一个。', avoid: '自己填名字和颜色，不放任何品牌 logo；≤5 个。', sfx: '啵 × N',
    dur: U, comp: () => <Scene th={th}><AppIconRow th={th} at={0.2} until={3.5} icons={[{ label: "工具一", color: "#D2622A" }, { label: "工具二", color: "#3F6FD2" }, { label: "工具三", color: "#2A8F5B" }, { label: "工具四", color: "#8A4FD2" }]} /></Scene> },
  { id: 'camera-glitch', no: '特效', zh: '故障（画面切片错位）', use: '讲「故障 / 出错 / 崩了 / 被打断」：2–3 帧的爆发，画面切成横带错位 + 红青分离 + 扫描线，立刻恢复。多次爆发间隔不规律，最后一次和重点词同帧。', avoid: '爆发只要 2–3 帧，别连续抖；全片 1–2 处。', sfx: '闪光（flash）',
    dur: U, comp: () => <Cam th={th} fx={[{ kind: 'glitch', bursts: [0.6, 1.5, 2.4] }]}></Cam> },
  { id: 'camera-droste', no: '特效', zh: '无限画中画', use: '讲「无限 / 循环 / 套娃 / 递归」：画面上方出现相框，框里还是这支视频，框里又有框（3 层）；最后镜头往相框里推进。', avoid: '相框放头顶上方，别压脸；全片 1 次。', sfx: '啵 + 嗖',
    dur: U, comp: () => <Cam th={th} fx={[{ kind: 'droste', at: 0.3, until: 3.4 }]}></Cam> },
  { id: 'camera-handmark', no: '特效', zh: '手绘圈标', use: '讲「看这里 / 重点是这个人 / 这个表情」：画面变灰，橙色手绘椭圆一笔圈住脸，圈里保持原色，左下角手写标签逐字写出。', avoid: '椭圆位置要对准脸（face_track.py 量）；标签 ≤6 字。', sfx: '嗖 + 啵',
    dur: U, comp: () => <Cam th={th} fx={[{ kind: 'handmark', at: 0.3, until: 3.4, label: '手绘标注' }]}></Cam> },
  { id: 'camera-shape', no: '特效', zh: '形状放大（圆窗 + 光圈）', use: '讲「聚焦 / 放大 / 重点」：奶油色底，人像缩进圆窗，橙色实线圈 + 向外扩散的同心圆，下方大标题。ring=false 时就是「标题字卡 + 圆形小窗」。', avoid: '全屏换景，一支片最多 1–2 次；标题 ≤6 字。', sfx: '嗖 + 上扬',
    dur: U, comp: () => <Cam th={th} fx={[{ kind: 'shape', at: 0.3, until: 3.4, title: '形状放大', sub: '20 / 20 · SHAPE REVEAL' }]}></Cam> },
  { id: 'checklist', no: '特效', zh: '打勾清单', use: '讲「步骤 / 待办 / 三件事」：奶油便签卡从左上角弹出，空方框逐行被橙色勾打上。', avoid: '≤4 行，每行 ≤8 字；放左上，别压脸；at＝打勾的秒数要对着他讲到那一行。', sfx: '纸张 + 滴答',
    dur: U, comp: () => <Scene th={th}><Checklist th={th} title="打勾清单" items={[{ text: "写好脚本", at: 1.0 }, { text: "录好口播", at: 1.6 }, { text: "交给 AI 剪", at: 2.2 }]} at={0.2} until={3.5} /></Scene> },
  { id: 'magazine-cover', no: '特效', zh: '杂志封面', use: '讲「登上封面 / 年度 / 第 N 期」：视频当封面照，顶部超大刊头，左下橙色大数字 + 白色标题，条形码和小标签。', avoid: '整屏封面，刊头在安全区外是例外；只放 1–1.5 秒；别和字幕同时出现。', sfx: '快门（camera）',
    dur: U, comp: () => <Scene th={th}><MagazineCover th={th} masthead="MAGAZINE" issue="NO.01 · OCT 2026" big="20 个" title="口播特效" sub="一句指令就能做" tag="特辑" at={0.2} until={3.4} /></Scene> },
  { id: 'orbit-text', no: '特效', zh: '环绕文字', use: '讲「环绕 / 围绕 / 包围」：一圈小字沿椭圆绕着头转，约 2.4 秒一圈，下方的字更大更亮。', avoid: '椭圆要比头大一圈（用人脸框算）；字别超过 20 个。', sfx: '微光',
    dur: U, comp: () => <Scene th={th}><OrbitText th={th} text="AROUND · 环绕文字 · " at={0.2} until={3.5} /></Scene> },
  { id: 'scatter-text', no: '特效', zh: '散落文字（整行打散）', use: '讲「散了 / 崩了 / 一团乱」：一行字排整齐，约 0.6 秒后每个字母带重力掉落、旋转、飘开，落到下面堆着。', avoid: '字 ≤12 个；和 drop-text 不同，这个是一整行被打散。', sfx: '咚',
    dur: U, comp: () => <Scene th={th}><ScatterText th={th} text="版本 2.0" at={0.2} until={3.5} /></Scene> },
);
