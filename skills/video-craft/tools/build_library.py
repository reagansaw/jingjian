# 从 remotion/craft/gallery.tsx 的注册表生成 docs/library.html（数据内嵌）+ 每款的封面图。
# 用法：python3 tools/build_library.py     （先把 docs/previews/<id>.mp4 渲好）
import re,json,os,subprocess,sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=os.environ.get("GALLERY_TSX") or os.path.join(ROOT,"remotion/craft/gallery.tsx")
src=open(SRC,encoding="utf-8").read()
ents=re.findall(r"\{ id: '([^']+)', no: '([^']+)', zh: '([^']+)', use: '([^']*)', avoid: '([^']*)', sfx: '([^']*)',\s*\n\s*dur: [^\n]*?comp: \(\) => (.*?) \},?\n",src)
data=[]
for id_,no,zh,use,avoid,sfx,jsx in ents:
    j=re.sub(r"<Scene[^>]*>","",jsx); j=j.replace("</Scene>","").strip()
    j=j.replace("src={STAND()}","src={faceVideo}")
    j=re.sub(r"(?<=>)(?=<)","\n",j)
    data.append(dict(id=id_,no=no,zh=zh,use=use,avoid=avoid,sfx=sfx,snippet=j))
order={'#':0}
print(len(data),"entries")
P=os.path.join(ROOT,"docs/previews")
POSTER={'theme-biz-gold-red':1.7,'theme-guofeng-cream':1.7,'theme-knowledge-yellow':1.7,'typed-quote':3.5,'phone-swipe':2.9,'strike-swap':2.9,'giant-fill':2.9,'chapter':3.0,'split-compare':3.1,'reporter':2.9,'signature':2.7}   # 每款挑最能看出效果的一秒
for d in data:
    mp4=f"{P}/{d['id']}.mp4"
    if os.path.exists(mp4):
        dur=float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",mp4]))
        ss=min(POSTER.get(d["id"],2.8),max(0.2,dur-0.35))      # 取帧时间不能超过视频长度（超了 ffmpeg 不报错也不出图）
        out=f"{P}/{d['id']}.jpg"
        if os.path.exists(out): os.remove(out)
        subprocess.run(["ffmpeg","-nostdin","-v","error","-y","-ss",f"{ss:.2f}","-i",mp4,"-frames:v","1","-vf","scale=360:-2","-q:v","4",out],check=True)
        assert os.path.exists(out),("封面没生成",d["id"])
    else: print("缺预览",d['id'])
tpl=open(os.path.join(ROOT,"tools/library.template.html"),encoding="utf-8").read()
i18n=json.load(open(os.path.join(ROOT,"tools/i18n.json"),encoding="utf-8"))
missing=[d["id"] for d in data if d["id"] not in i18n["entries"]]
if missing: print("⚠ 缺英文：",missing)
html=tpl.replace("/*DATA*/[]",json.dumps(data,ensure_ascii=False)).replace("/*I18N*/{}",json.dumps(i18n,ensure_ascii=False)).replace("/*STYLE*/{}",json.dumps({k:v for k,v in json.load(open(os.path.join(ROOT,"tools/style-data.json"),encoding="utf-8")).items() if k in ("sfx_pairs","offset","volume")},ensure_ascii=False))
open(os.path.join(ROOT,"docs/library.html"),"w",encoding="utf-8").write(html)
json.dump(data,open(os.path.join(ROOT,"docs/data.json"),"w",encoding="utf-8"),ensure_ascii=False,indent=1)
print("docs/library.html 已生成")
