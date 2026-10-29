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
json.dump({"name": "video-craft", "version": VERSION, "description": DESC, "author": {"name": AUTHOR}, "keywords": ["video", "remotion", "talking-head", "douyin", "short-video"]},
          open(os.path.join(OUT, ".claude-plugin", "plugin.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
json.dump({"name": "video-craft", "owner": {"name": AUTHOR}, "metadata": {"description": DESC},
           "plugins": [{"name": "video-craft", "source": "./", "description": DESC, "version": VERSION}]},
          open(os.path.join(OUT, ".claude-plugin", "marketplace.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
n = sum(len(f) for _, _, f in os.walk(OUT))
print(f"已生成 {OUT}（{n} 个文件）")
