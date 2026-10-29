# 从 remotion/craft/gallery.tsx 的注册表生成 docs/library.html（数据内嵌）+ 每款的封面图。
# 用法：python3 tools/build_library.py     （先把 docs/previews/<id>.mp4 渲好）
import re,json,os,subprocess,sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=os.environ.get("GALLERY_TSX") or os.path.join(ROOT,"remotion/craft/gallery.tsx")
src=open(SRC,encoding="utf-8").read()
ents=re.findall(r"\{ id: '([^']+)', no: '([^']+)', zh: '([^']+)', use: '([^']*)', avoid: '([^']*)', sfx: '([^']*)',\s*\n\s*dur: [^\n]*?comp: \(\) => (.*?) \},?\n",src)

def parse_attrs(j):
    """<Comp a="x" b={1} c={[{ k: 'v' }]} /> → dict（只认字面量；th / children 跳过）。认不出的返回 None。"""
    m=re.match(r"<([A-Za-z0-9]+)\s",j)
    if not m: return None
    i=m.end(); out={}
    while i<len(j):
        while i<len(j) and j[i] in " \n": i+=1
        if j.startswith("/>",i) or j[i]==">": break
        k=re.match(r"([A-Za-z0-9_]+)",j[i:])
        if not k: return None
        name=k.group(1); i+=k.end()
        if j[i:i+1]!="=": out[name]=True; continue
        i+=1
        if j[i]=='"':
            e=j.index('"',i+1); val=j[i+1:e]; i=e+1
        elif j[i]=="{":
            d=0; e=i
            while True:
                c=j[e]
                if c in "{[(": d+=1
                elif c in "}])": d-=1
                elif c in "'\"":
                    e=j.index(c,e+1)
                if d==0: break
                e+=1
            expr=j[i+1:e]; i=e+1
            if name in("th","children"): continue
            js=re.sub(r"'([^']*)'",lambda mm:json.dumps(mm.group(1),ensure_ascii=False),expr)
            js=re.sub(r"([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:",r'\1"\2":',js)
            try: val=json.loads(js)
            except Exception: return None
        else: return None
        if name not in("th","children"): out[name]=val
    return out
KINDS=set(re.findall(r"'?([a-z][a-z-]*)'?\s*:\s*[A-Z][A-Za-z0-9]*[,}\s]",open(os.path.join(ROOT,"remotion/Edit.tsx"),encoding="utf-8").read().split("const REG")[1].split("export const KINDS")[0]))
data=[]
for id_,no,zh,use,avoid,sfx,jsx in ents:
    j=re.sub(r"<Scene[^>]*>","",jsx); j=j.replace("</Scene>","").strip()
    j=j.replace("src={STAND()}","src={faceVideo}")
    j=re.sub(r"(?<=>)(?=<)","\n",j)
    beat=None
    if id_ in KINDS and j.count("<")<=3 and not j.startswith("<Cam") :
        mm=re.search(r"<[A-Za-z0-9]+\s[^<]*?/>",j.split("</")[0] if "</" in j else j,re.S)
        pa=parse_attrs(mm.group(0)) if mm else None
        if pa is not None: beat=dict(kind=id_,props=pa)
    data.append(dict(id=id_,no=no,zh=zh,use=use,avoid=avoid,sfx=sfx,snippet=j,beat=json.dumps(beat,ensure_ascii=False,indent=1) if beat else ""))
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
