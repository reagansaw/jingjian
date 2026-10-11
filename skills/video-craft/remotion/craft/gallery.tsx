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
