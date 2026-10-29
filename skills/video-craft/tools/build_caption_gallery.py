# 生成 docs/caption-presets.html（字幕样式预设图鉴，中英双语，数据内嵌）。用法：python3 tools/build_caption_gallery.py
# 先在 remotion 工程里 `node scripts/render-cap-stills.mjs` 渲出 docs/caption-presets/<id>.jpg
import json,os,re,collections
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
specs=json.load(open(os.path.join(ROOT,"remotion/craft/caption-presets.json"),encoding="utf-8"))
rows=[]
for s in specs:
    anims=collections.OrderedDict()
    for g in s["segs"]:
        for k in ("in","out","loop"):
            if g[k]: anims[g[k]["name"]]=1
    fonts=sorted({st["font"] for g in s["segs"] for st in g["styles"]})
    beat=dict(kind="cap-preset",props=dict(preset=s["id"],texts=["第一段","第二段","第三段"][:len(s["segs"])],at=0.5))
    rows.append(dict(id=s["id"],name=s["name"],real=s.get("real",{"n":0,"proj":0}),cat=s.get("cat","其他"),segs=len(s["segs"]),dur=s["dur"],anims=list(anims),fonts=fonts,extras=s["extras"],beat=json.dumps(beat,ensure_ascii=False,indent=1)))
html=open(os.path.join(ROOT,"tools/caption_gallery.template.html"),encoding="utf-8").read().replace("/*DATA*/[]",json.dumps(rows,ensure_ascii=False))
open(os.path.join(ROOT,"docs/caption-presets.html"),"w",encoding="utf-8").write(html); print(len(rows),"→ docs/caption-presets.html")
