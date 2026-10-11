# 给无 BGM 的成片混 BGM：钩子后淡入、金句/引用/收尾自动压低、结尾淡出，再 loudnorm 到 −15 LUFS / TP −2。
# 用法：mix_bgm.py <无BGM成片.mp4> <BGM.mp3> <输出.mp4> --map <rec-map.json> [--start 秒] [--gain dB]
#   --start：从 BGM 的第几秒开始用（挑一段鼓点清楚的）；--gain：相对默认电平再加/减几 dB（默认 0）
# 依赖：numpy、ffmpeg。--map 是 build_master.py 产出的 rec-map.json；压低窗口（下面 4 个）按你的片子改（秒数 = 补停顿后的时间）。
import sys,json,subprocess,os,tempfile,numpy as np
args=sys.argv[1:]; opt={'--start':0.0,'--gain':0.0}
for k in list(opt):
    if k in args: i=args.index(k); opt[k]=float(args[i+1]); del args[i:i+2]
if '--map' not in args: sys.exit('需要 --map <rec-map.json>')
mapf=args[args.index('--map')+1]; del args[args.index('--map'):args.index('--map')+2]
vid,bgm,out=args
MAP=json.load(open(mapf))
M=lambda t: t+sum(c['p'] for c in MAP['cuts'] if c['c']<=t)
SR=44100; tmp=tempfile.mkdtemp()
run=lambda *a: subprocess.run(a,check=True,capture_output=True)
run("ffmpeg","-nostdin","-y","-i",vid,"-vn","-ac","2","-ar",str(SR),f"{tmp}/v.wav")
dur=float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f"{tmp}/v.wav"]))
# BGM：从 start 起，不够长就循环（先放大到足够长再截）；统一到 −31 LUFS（垫在 −16 的人声下面）
run("ffmpeg","-nostdin","-y","-stream_loop","6","-ss",str(opt['--start']),"-i",bgm,"-t",str(dur+1),"-ac","2","-ar",str(SR),"-af","loudnorm=I=-31:TP=-4",f"{tmp}/b.wav")
rd=lambda f: np.frombuffer(subprocess.run(["ffmpeg","-nostdin","-v","error","-i",f,"-f","f32le","-ac","2","-ar",str(SR),"-"],capture_output=True).stdout,dtype=np.float32).reshape(-1,2)
v,b=rd(f"{tmp}/v.wav"),rd(f"{tmp}/b.wav"); n=len(v); b=b[:n]
t=np.arange(n)/SR
lin=lambda a,c: np.clip((t-a)/(c-a),0,1)
sm=lambda a,c: (lambda x: x*x*(3-2*x))(lin(a,c))
g=lin(M(4.6),M(4.6)+1.2)*(1-lin(dur-1.6,dur))
for a,c,d in [(M(6.7),M(8.7),0.55),(M(35.6),M(38.9),0.35),(M(48.5),M(54.2),0.4),(M(56.2),dur,0.3)]:
    g=g*(1+(d-1)*sm(a-0.25,a+0.25)*(1-sm(c-0.25,c+0.25)))
g=g*(10**(opt['--gain']/20))
mix=v+b*g[:,None]
open(f"{tmp}/m.f32","wb").write(mix.astype(np.float32).tobytes())
run("ffmpeg","-nostdin","-y","-f","f32le","-ar",str(SR),"-ac","2","-i",f"{tmp}/m.f32","-i",vid,"-map","1:v","-map","0:a","-af","loudnorm=I=-15:TP=-2:LRA=11","-c:v","libx264","-crf","22","-preset","medium","-pix_fmt","yuv420p","-c:a","aac","-b:a","192k","-ar","48000","-shortest",out)
print("ok",out)
