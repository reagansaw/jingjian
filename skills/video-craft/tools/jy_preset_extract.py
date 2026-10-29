#!/usr/bin/env python3
"""把「剪映字幕预设」文件夹（每个预设 = <名字>/preset_draft/draft_content.json，是一个组合片段）转成本库的样式规格 JSON。
只取**数字和样式**（位置 / 缩放 / 颜色 / 描边 / 阴影 / 字体类别 / 动画名和时长 / 关键帧），不取文字内容（示例文字多是作者的品牌字，一律换成 {{n}} 占位）、不取预览图、不取字体文件。
用法：python3 jy_preset_extract.py <预设文件夹> <输出.json>
规格：{ id, name, canvas:[w,h], dur, segs:[{ n(字数), lines, start, dur, x, y(1080×1920 像素中心), scale, rot, alpha, align, ls, spacing, styles:[{range,fill,stroke,shadows,font,fontName,size}], in:{name,dur}, out:{…}, loop:{…}, kf:{x:[[t,v]…],y,scale,rot,alpha} }] }"""
import glob, json, os, re, sys
SERIF = ("宋", "Serif", "金陵", "古印", "明朝", "楷", "隶")
CONDENSED = ("Anton", "Bebas", "Oswald")
def font_role(name):
    if any(k in name for k in CONDENSED): return "condensed"
    if any(k in name for k in SERIF): return "serif"
    if any(k in name for k in ("手写", "江湖", "油漆", "毛笔", "书法", "行书")): return "hand"
    return "sans"
def hexc(c): return "#%02X%02X%02X" % tuple(round(max(0, min(1, v)) * 255) for v in c[:3])
def fill_of(st):
    fc = st.get("fill", {}).get("content", {}); rt = fc.get("render_type", "solid")
    if rt == "solid" or "solid" in fc: return {"type": "solid", "color": hexc(fc.get("solid", {}).get("color", [1, 1, 1]))}
    if rt == "gradient":
        g = fc["gradient"]; return {"type": "gradient", "angle": g.get("angle", 90), "stops": [[round(p, 3), hexc(c)] for p, c in zip(g.get("percent", [0, 1]), g.get("color", [[1, 1, 1], [1, 1, 1]]))]}
    return {"type": "texture"}   # 贴图填充：用主题色近似
def name_clean(folder):
    return re.sub(r"^[A-Za-z]*\d+[-_ ]*", "", folder) or folder
def extract(path):
    folder = os.path.basename(os.path.dirname(os.path.dirname(path)))
    d = json.load(open(path)); inn = d["materials"]["drafts"][0]["draft"]; m = inn["materials"]
    texts = {t["id"]: t for t in m.get("texts", [])}; anims = {a["id"]: a for a in m.get("material_animations", [])}
    W, H = 1080, 1920; segs = []
    for tr in inn["tracks"]:
        if tr["type"] != "text": continue
        for s in tr["segments"]:
            t = texts.get(s["material_id"])
            if not t: continue
            try: c = json.loads(t["content"])
            except Exception: continue
            txt = c.get("text", ""); n = len(txt.replace("\n", ""))
            if not n: continue
            styles = []
            for st in c.get("styles", []):
                fn = ""; ft = t.get("fonts") or []
                for f in ft:
                    if f.get("effect_id") == (st.get("font") or {}).get("id"): fn = f.get("title", "")
                if not fn and ft: fn = ft[0].get("title", "")
                stroke = st.get("strokes", [{}])[0] if st.get("strokes") else None
                styles.append({"range": st.get("range", [0, n]), "fill": fill_of(st), "size": st.get("size", 15), "fontName": fn, "font": font_role(fn),
                               "stroke": ({"w": round(stroke["width"], 4), "color": hexc(stroke["content"]["solid"]["color"])} if stroke and stroke.get("content", {}).get("solid") else None),
                               "shadows": [{"dist": round(sh.get("distance", 5), 2), "angle": sh.get("angle", -45), "alpha": round(sh.get("alpha", 0.5), 3), "blur": round(sh.get("diffuse", 0.03), 3), "color": hexc(sh.get("content", {}).get("solid", {}).get("color", [0, 0, 0]))} for sh in st.get("shadows", [])]})
            clip = s["clip"]; ins = outs = loop = None
            for ref in s.get("extra_material_refs", []):
                for a in (anims.get(ref, {}).get("animations") or []):
                    v = {"name": a["name"], "dur": round(a["duration"] / 1e6, 3)}
                    if a["type"] == "in": ins = v
                    elif a["type"] == "out": outs = v
                    elif a["type"] == "loop": loop = v
            kf = {}
            for k in s.get("common_keyframes") or []:
                key = {"KFTypePositionX": "x", "KFTypePositionY": "y", "KFTypeScaleX": "scale", "KFTypeRotation": "rot", "KFTypeGlobalAlpha": "alpha"}.get(k["property_type"])
                if key: kf[key] = [[round(p["time_offset"] / 1e6, 3), round(p["values"][0], 4)] for p in k["keyframe_list"]]
            segs.append({"n": n, "lines": txt.count("\n") + 1, "start": round(s["target_timerange"]["start"] / 1e6, 3), "dur": round(s["target_timerange"]["duration"] / 1e6, 3),
                         "x": round(W / 2 + clip["transform"]["x"] * W / 2), "y": round(H / 2 - clip["transform"]["y"] * H / 2), "scale": round(clip["scale"]["x"], 3), "rot": round(clip["rotation"], 2), "alpha": clip.get("alpha", 1.0),
                         "align": int(t.get("alignment", 1)), "ls": round(float(t.get("letter_spacing", 0)), 3), "spacing": round(float(t.get("line_spacing", 0.02)), 3),
                         "styles": styles, "in": ins, "out": outs, "loop": loop, "kf": kf})
    if not segs: return None
    dur = max(s["start"] + s["dur"] for s in segs)
    return {"id": folder, "name": name_clean(folder), "canvas": [inn["canvas_config"]["width"], inn["canvas_config"]["height"]], "dur": round(dur, 3),
            "extras": [k for k in ("stickers", "shapes", "effects", "video_effects", "common_mask", "videos") if m.get(k)], "segs": segs}
if __name__ == "__main__":
    root, out = sys.argv[1], sys.argv[2]; res = []
    for f in sorted(glob.glob(os.path.join(root, "*/preset_draft/draft_content.json"))):
        try:
            r = extract(f)
            if r: res.append(r)
        except Exception as e: print("跳过", f.split("/")[-3], e, file=sys.stderr)
    # 匿名化：id 一律 cap-001…（原文件夹名里有创作者名字 / 昵称）；名字只保留「J123-三段字幕」这种描述性的部分
    private = {}
    for i, r in enumerate(res, 1):
        orig = r["id"]; r["id"] = "cap-%03d" % i; private[r["id"]] = orig
        r["name"] = r["name"] if re.match(r"^[JD]\d+-", orig) else "样式%d" % i
    json.dump(private, open(out.replace(".json", ".private-map.json"), "w"), ensure_ascii=False)
    json.dump(res, open(out, "w"), ensure_ascii=False, separators=(",", ":"))
    print(len(res), "个预设 →", out, os.path.getsize(out) // 1024, "KB")
