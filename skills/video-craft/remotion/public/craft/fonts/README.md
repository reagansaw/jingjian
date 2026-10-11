# 字体放这里（不随库分发，请自己下载并核对授权）

组件用这三个文件名（缺了会自动退到系统自带中文字体，能出片，但字形不一样、没有那么「有网感」）：

| 文件名 | 字体 | 用在 | 官方来源（自己核对授权） |
|---|---|---|---|
| `SourceHanSerifSC-Heavy.otf` | 思源宋体 Heavy | 大字 / 钩子（`th.fonts.display`） | Adobe `source-han-serif` 的 GitHub 发布页（SIL OFL） |
| `SmileySans.otf` | 得意黑 | 胶囊 / 标签（`th.fonts.hand`） | `atelier-anchor/smiley-sans` 的 GitHub 发布页（SIL OFL） |
| `DouyinSans.otf` | 抖音美好体 | 字幕 / 小字（`th.fonts.body`） | 抖音美好体官网（作者记得是免费商用，**请你自己去官网确认授权再用**） |

想换字体：改 `craft/kit.tsx` 里的 `FONT_FILES`（名字 → 文件）。
