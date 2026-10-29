#!/usr/bin/env python3
"""把 skill 打成 Claude Code plugin（同时也是一个 marketplace）：
   python3 tools/build_plugin.py [输出目录]      默认 ../video-craft-plugin
输出：
   .claude-plugin/plugin.json + marketplace.json
   skills/video-craft/…   （SKILL.md、references、remotion、tools、docs，不含 node_modules / 本地产物）
   README.md              （仓库首页）
这个目录就是要 push 到 GitHub 的东西：用户  /plugin marketplace add <owner>/<repo>  →  /plugin install video-craft@video-craft。
仓库名：jingjian；作者 Reagan Saw；**无 LICENSE**（默认保留所有权利：别人可以在 GitHub 上看和 fork，但没有授权复制 / 再分发；要让学生合法使用，之后要补一个）。"""
import json, os, shutil, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(os.path.dirname(ROOT), "video-craft-plugin")
VERSION = "0.2.0"
AUTHOR = "Reagan Saw"        # 只放名字，不放邮箱等个人联系方式（会公开）
DESC = "把真人口播竖屏短视频剪出「网感」：Remotion 版式库（文字版式 / 换场 / 精剪 / 动画 / 情绪字 / 骨架）、安全区规则、音效配对、可运行的起步项目。中英双语。"
EXCLUDE = shutil.ignore_patterns("node_modules", "out", ".DS_Store", "edit.json", "input*", "*.local.*", "__pycache__")

if os.path.exists(OUT):
    # 只清自己生成的东西，不碰 OUT 里的 .git
    for n in os.listdir(OUT):
        if n == ".git": continue
        p = os.path.join(OUT, n); shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)
os.makedirs(os.path.join(OUT, ".claude-plugin"), exist_ok=True)
dst = os.path.join(OUT, "skills", "video-craft")
shutil.copytree(ROOT, dst, ignore=EXCLUDE)
shutil.copy(os.path.join(ROOT, "README.md"), os.path.join(OUT, "README.md"))

# GitHub Pages（仓库根目录当站点根）：根目录放一个导航页，指向两个图鉴
open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write("""<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>video-craft</title>
<style>:root{--bg:#0b0a10;--ink:#f2eee4;--muted:#9a95a8;--line:#2a2638;--panel:#15131d;--accent:#ff8a3d}@media(prefers-color-scheme:light){:root{--bg:#f6f2ea;--ink:#1b140c;--muted:#6d6558;--line:#e4dccb;--panel:#fff;--accent:#d2622a}}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 system-ui,-apple-system,"PingFang SC",sans-serif}main{max-width:720px;margin:0 auto;padding:48px 16px}h1{margin:0 0 8px}p{color:var(--muted)}a.c{display:block;margin:14px 0;padding:18px 20px;border:1px solid var(--line);border-radius:14px;background:var(--panel);color:var(--ink);text-decoration:none}a.c b{display:block;font-size:18px;color:var(--accent)}a.c span{color:var(--muted);font-size:14px}</style></head><body><main>
<h1>video-craft</h1><p>口播剪出网感：给 Claude Code 用的口播剪辑 skill + 版式库 + 字幕样式预设。<br>A talking-head editing skill for Claude Code, with a layout library and caption style presets.</p>
<a class="c" href="skills/video-craft/docs/library.html"><b>版式库 · Layout library</b><span>100 张卡：文字版式、特效、动画、换场…每张有可复制的代码和给 AI 的指令 / 100 cards with copyable code and an AI prompt</span></a>
<a class="c" href="skills/video-craft/docs/caption-presets.html"><b>字幕样式预设 · Caption style presets</b><span>657 款，可按分类 / 段数 / 真实使用筛选 / 657 styles, filterable</span></a>
<a class="c" href="https://github.com/reagansaw/jingjian"><b>GitHub</b><span>安装方法和说明 / install and docs</span></a>
</main></body></html>""")
json.dump({"name": "video-craft", "version": VERSION, "description": DESC, "author": {"name": AUTHOR}, "keywords": ["video", "remotion", "talking-head", "douyin", "short-video"]},
          open(os.path.join(OUT, ".claude-plugin", "plugin.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
json.dump({"name": "video-craft", "owner": {"name": AUTHOR}, "metadata": {"description": DESC},
           "plugins": [{"name": "video-craft", "source": "./", "description": DESC, "version": VERSION}]},
          open(os.path.join(OUT, ".claude-plugin", "marketplace.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
n = sum(len(f) for _, _, f in os.walk(OUT))
print(f"已生成 {OUT}（{n} 个文件）")
