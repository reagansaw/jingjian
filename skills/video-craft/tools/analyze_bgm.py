# 给一批 mp3 估算 BPM / 节拍清晰度 / 响度 / 起伏，筛出适合短视频口播垫底的（有鼓点、不吵、不太炸）。
# 用法：analyze_bgm.py <输出json> <文件...>   （依赖 numpy、ffmpeg）
import sys,json,subprocess,os,numpy as np
SR=8000
def load(f,start=20,dur=40):
    raw=subprocess.run(["ffmpeg","-nostdin","-v","error","-ss",str(start),"-t",str(dur),"-i",f,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True).stdout
    return np.frombuffer(raw,dtype=np.float32)
def analyze(f,total):
    x=load(f,start=min(20,max(0,total/4)))
    if len(x)<SR*10: return None
    hop=SR//100                        # 10ms
    n=len(x)//hop; e=np.sqrt((x[:n*hop].reshape(n,hop)**2).mean(1))+1e-9
    on=np.maximum(0,np.diff(np.log(e)))                 # 起音强度
    on=on-on.mean(); ac=np.correlate(on,on,"full")[len(on)-1:]; ac/=ac[0]+1e-9
    lo,hi=int(60/160*100),int(60/70*100)               # 70–160 BPM
    k=lo+int(np.argmax(ac[lo:hi])); bpm=6000/k
    while bpm<90: bpm*=2
    while bpm>150: bpm/=2
    strength=float(ac[k])
    db=20*np.log10(e); rng=float(np.percentile(db,90)-np.percentile(db,10))   # 动态范围
    lufs_like=float(20*np.log10(np.sqrt((x**2).mean())+1e-9))
    return dict(bpm=round(bpm),beat=round(strength,3),range=round(rng,1),level=round(lufs_like,1))
out=sys.argv[1]; res={}
for f in sys.argv[2:]:
    try:
        tot=float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f],stderr=subprocess.DEVNULL) or 0)
        r=analyze(f,tot)
        if r: r['dur']=round(tot); res[os.path.basename(f)]=r
    except Exception as e: pass
json.dump(res,open(out,"w"),ensure_ascii=False)
print(len(res),"首已分析")
