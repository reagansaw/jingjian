#!/usr/bin/env python3
"""合并多个 jy_preset_extract.py 的输出：去重（位置 / 样式 / 动画完全一样的只留一个）、只留竖屏（宽 ≤ 高）、名字去掉前缀（「温12-」「谢-」「J180-」「123.」）和尾号、id 重新编成 cap-001…，并给每款一个分类（名字里的主题词，如「关键词」「2句字幕」）。
用法：python3 merge_cap_specs.py <输出.json> <in1.json> [in2.json …]   （隐私映射 <in>.private-map.json 不进仓库）"""
import json, re, sys, collections
out, ins = sys.argv[1], sys.argv[2:]
rows = []
for f in ins:
    pm = {}
    try: pm = json.load(open(f.replace(".json", ".private-map.json")))
    except Exception: pass
    for x in json.load(open(f)):
        x["_orig"] = pm.get(x["id"], x["id"]); rows.append(x)
seen, res = set(), []
for x in rows:
    if x["canvas"][0] > x["canvas"][1]: continue
    sig = json.dumps([x["canvas"], x["segs"]], sort_keys=True)
    if sig in seen: continue
    seen.add(sig); res.append(x)
OK = ("字幕", "关键词", "金句", "重点", "疑问", "开场", "序号", "并列", "覆盖", "大字", "数字", "框架", "弹幕", "趣味", "情绪", "展示", "标题", "排版", "文字", "组合", "引导", "总结", "结尾", "分列", "对比", "步骤", "时间", "人物", "名言", "警示", "灵感", "替换", "分割", "条目", "列表")   # 只保留带这些描述词的名字；其余（多半是编号 / 创作者昵称）一律用「样式N」
def clean(o):
    n = re.sub(r"^(温|谢)?\d+[-_.．]*", "", o); n = re.sub(r"^[JD]\d+[-_.]*", "", n); n = re.sub(r"^(谢|温)[-_]", "", n)
    n = re.sub(r"[-_]\d+(-\d+)*$", "", n); n = re.sub(r"\d+$", "", n).strip("-_. ")
    n = re.sub(r"^\d+月更新", "", n)
    return n if (re.search(r"[一-鿿]{2,}", n) and any(w in n for w in OK)) else ""
cnt = collections.Counter(); private = {}
for i, x in enumerate(res, 1):
    o = x["_orig"]; n = clean(o); private["cap-%03d" % i] = o
    x["id"] = "cap-%03d" % i; x["name"] = n or "样式%d" % i; x["cat"] = n or "其他"; x["canvas"] = [1080, 1920]
    for k in ("_orig",): x.pop(k, None)
    cnt[x["cat"]] += 1
json.dump(private, open(out.replace(".json", ".private-map.json"), "w"), ensure_ascii=False)
json.dump(res, open(out, "w"), ensure_ascii=False, separators=(",", ":"))
print(len(res), "款 →", out); print(cnt.most_common(25))
