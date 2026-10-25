#!/usr/bin/env python3
"""转写：普通一遍（拿正字）+ 「口头禅」一遍（disf，看得到 嗯 / 呃 / 重讲 / OK）。输出 whisper 格式的 JSON（segments[].words[].{word,start,end,probability}）。
用法：python3 transcribe.py in.mp4 out/ [--lang zh] [--prompt "主题词，名字，英文词"] [--no-disf]
  out/words.json   普通转写（字幕 / 对稿用）      out/disf.json   口头禅转写（找要删的 呃 嗯 重讲 用）
后端：macOS + Apple Silicon → mlx-whisper（large-v3-turbo）；其它 → faster-whisper（large-v3，CPU 较慢）。**faster-whisper 这条路作者没测过。**
⚠ 识别会听错字（中英混说、口音、专有名词）：低置信度（probability < 0.6）的词一定要和说话的人确认，字幕以校对后的为准。--prompt 给点主题词能明显提高准确率。
   作者实测：turbo 不给提示 → 「销冠」听成「消关」「me time」听成「秘态」；large-v3 + 主题提示好很多，但「mì-tài」这种仍要问本人。
"""
import argparse, json, os, platform, subprocess, sys

DISF = "嗯……呃，那个，我我我觉得啊，ok，就是说……"       # 逼模型把口头禅写出来（普通转写会把 呃 / OK 洗掉）

def mlx(wav, out_json, lang, prompt):
    cmd = ["uvx", "--from", "mlx-whisper", "mlx_whisper", wav, "--model", "mlx-community/whisper-large-v3-turbo", "--language", lang,
           "--condition-on-previous-text", "False", "--word-timestamps", "True", "--output-format", "json", "--output-name", os.path.basename(out_json)[:-5], "--output-dir", os.path.dirname(out_json) or "."]
    if prompt: cmd += ["--initial-prompt", prompt]
    subprocess.run(cmd, check=True)

def faster(wav, out_json, lang, prompt):
    from faster_whisper import WhisperModel
    m = WhisperModel("large-v3", device="cpu", compute_type="int8")
    segs, _ = m.transcribe(wav, language=lang, word_timestamps=True, initial_prompt=prompt or None, condition_on_previous_text=False)
    data = {"language": lang, "segments": [{"start": s.start, "end": s.end, "text": s.text, "words": [{"word": w.word, "start": w.start, "end": w.end, "probability": w.probability} for w in (s.words or [])]} for s in segs]}
    json.dump(data, open(out_json, "w"), ensure_ascii=False, indent=1)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("src"); ap.add_argument("outdir"); ap.add_argument("--lang", default="zh")
    ap.add_argument("--prompt", default=""); ap.add_argument("--no-disf", action="store_true")
    a = ap.parse_args(); os.makedirs(a.outdir, exist_ok=True); wav = os.path.join(a.outdir, "audio16k.wav")
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", a.src, "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
    run = mlx if (platform.system() == "Darwin" and platform.machine() == "arm64") else faster
    run(wav, os.path.join(a.outdir, "words.json"), a.lang, a.prompt)
    if not a.no_disf: run(wav, os.path.join(a.outdir, "disf.json"), a.lang, DISF)
    d = json.load(open(os.path.join(a.outdir, "words.json")))
    low = [(w["word"].strip(), round(w["start"], 1), round(w.get("probability", 1), 2)) for s in d["segments"] for w in s.get("words", []) if w.get("probability", 1) < 0.6]
    print(f"转写完成 → {a.outdir}/words.json" + ("" if a.no_disf else f"、disf.json") + f"\n低置信度（<0.6）{len(low)} 个，请和说话的人确认：{low[:25]}")

if __name__ == "__main__": main()
