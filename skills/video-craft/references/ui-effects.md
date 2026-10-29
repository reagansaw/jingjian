# UI 类特效（14 个）

来自一位博主的「Claude 特效」演示片，逐帧（30fps）拆解后用自己的代码重写，没有用到对方的素材、字体或画面。
全部是 `edit.json` 的 beat kind，时间用成片里的绝对秒（`at` / `until`），颜色走主题。

| kind | 一句话 | 关键参数 |
|---|---|---|
| title-tag | 顶部标题 + 小标签 + 底说明 | title, tag, caption |
| pixel-text | 画面压暗，点阵字逐个打出，新字红青分离 | text, sub |
| drop-text | 大字带重力一个个掉下、回弹 | text, small, label |
| huge-caption | 大词 + 右下角小强调词 | big, small |
| title-card | 整屏色卡从下滑入，1–3 行字 | lines, color |
| prompt-box | 顶部提示词输入框逐字打出 | text, sendAt |
| glass-chart | 毛玻璃卡：数字缓动 + 折线画出 | label, from, to, unit |
| compare-tiles | 以前 / 现在两块数字牌 + 结论句 | before, to, verdict |
| photo-cards | 拍立得卡片飞入 | srcs, slots |
| side-sticker | 头旁小卡 + 数字贴纸 | value, tag |
| particle-fill | 颗粒落进容器堆满 | title |
| side-doc | 左文件卡 + 步骤高亮 | title, items |
| thumb-wall | 合集缩略图墙 | title, pill, srcs |
| comment-card | 结尾 CTA 底 + 药丸 | title, pill |

注意：`side-doc` / `comment-card` 只画底和面板，要把人像推到右边 / 缩成卡，用 `zoom` / `shiftY` 或 camera 层。
数字类（glass-chart、compare-tiles）必须是说话人真讲过的数字。
已自动配音效（autosfx.ts）。还没做：抠像类（换背景、字躲人后需要 matte，仅 macOS）、拖入素材 / 时间轴 / 色板 / 手机框 / 调色滑杆等「界面比喻」第二批。

## 用法要点（实测）
- 特效默认居中、放胸口带；盖脸时的处理见 SKILL.md §3.2b（`behind` 字在人后、`shiftY`+虚化补边）。
- 主题 `sans-orange`：全用得意黑 + 橙色强调，参考片的黑体感觉。
- 示范（用作者自己的口播）：特效按台词时间点放（`at` = 说到那个词的秒），不是固定间隔。

## 第二批：界面比喻（`craft/ui-meta.tsx`）
| kind | 一句话 | 关键参数 |
|---|---|---|
| timeline-panel | 时间轴面板：时间码、缩略图、波形、红色播放头 | label, y |
| drop-zone | 拖入素材：缩略图飞入 → 已导入 + 对勾 | label, doneLabel, src |
| palette | 色板取色：吸管落点 + 色块填色 | colors:[{hex,at,x,y}] |
| before-after | 前后对比滑杆（画面变灰 → 扫出调色后） | before, after |
| app-icons | 应用图标一排弹出，可删掉其中一个 | icons:[{label,color,glyph}], removeIndex, removeAt |
没有放任何品牌 logo：名字、颜色都自己填。

大卡片（glass-chart、compare-tiles）有 `scale` 参数（默认 1）：脸大、下巴下面放不下时用 0.5–0.65 缩小，`place_check.py` 会按缩放后的高度算。side-sticker 放在头的左右两侧，不参与「上下」检查。

## 第三批（`craft/fx2.tsx`，参考「20 个口播特效」演示片，30fps 逐帧拆解）
镜头层（写在 `camera`）：
- `glitch`：`{ kind:'glitch', bursts:[秒…], frames?:3, strength?:1 }`。2–3 帧爆发：7 条横带错位 ±60px + 红青分离 ±9px + 扫描线，爆发过后立刻恢复。
- `droste`：`{ kind:'droste', at, until, frame?:[cx,cy,宽], depth?:3 }`。无限画中画，结尾镜头推进相框。
- `handmark`：`{ kind:'handmark', at, until, ellipse:[cx,cy,rx,ry], label? }`。画面变灰，橙色手绘椭圆一笔圈脸，标签逐字写出。椭圆用 `face_track.py` 的人脸框算。
- `shape`：`{ kind:'shape', at, until, cx?, cy?, R?, title?, sub?, ring?:true, bg?, ink? }`。奶油底 + 圆窗 + 扩散光圈；`ring:false` = 标题字卡 + 圆形小窗。
叠加层（写在 `beats`）：`checklist`（items:[{text, at}]）、`magazine-cover`（masthead, big, title…）、`orbit-text`（text, cx, cy, rx, ry）、`scatter-text`（text, breakAt）。

## 还没做的（作者共享的「17 effects」轮播图列出的名字，需要抠像或更多开发）
orbit（照片绕人转）· glass type（玻璃字）· phone mock-up（手机框 + 资料卡）· doodle boil（人物白描边 + 涂鸦）· UI world · green screen（抠像换深色背景）· frame break（人从相框里穿出来）· paper cut（人物白边贴纸 + 便签）· vertigo（滑动变焦）· pull-back reveal（拉远揭示）· headline wall · digital zoom（黑白 + 推近 + 字）· chart grow（柱状图长高）· couch wall（墙上拍立得）· zoom-through cut（穿越式模糊推进转场）。
