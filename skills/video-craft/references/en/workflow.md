# Workflow commands (how it's done on this machine, macOS; other systems need different tools)

## 1. Transcribe (word-level timing)
```bash
uvx --from mlx-whisper mlx_whisper "video.mp4" --model mlx-community/whisper-large-v3-turbo \
  --language zh --condition-on-previous-text False --word-timestamps True \
  --output-format all --output-name rec --output-dir out/
```
- On an 8GB-RAM machine: don't run other heavy work during transcription; 67 seconds of audio takes about 1–2 minutes.
- A video with no voice produces hallucinations ("请不吝点赞…", i.e. "please don't hesitate to like…") → confirm there is a voice first.
- Transcription errors: mixed Chinese/English speech, accented words. **The proofread captions are authoritative.**

## 2. Pad pauses (`tools/build_master.py`: `--video --words --pauses --out`)
Idea: at the "start time of the next word" between sentences, freeze the last frame of the previous segment for `p` seconds (`tpad stop_mode=clone`), pad the audio with `p` seconds of silence (`apad`), then `concat`.
- The cut point is the midpoint between "end of the previous word" and "start of the next word", snapped to 1/30 second.
- Output `rec-map.json`: each cut point `{c, p}`; in the composition use `M(t) = t + Σ(p for c ≤ t)` to convert original-video time to time after pause padding.
- How much to pad: 0.35 after the hook, 0.3–0.45 before key words, 0.2–0.3 elsewhere, about 3–4 seconds per minute in total.

## 3. Matting (macOS only, optional)
`tools/mk_matte.py <video> <start_frame> <end_frame> <out_dir>` (compile `tools/personmatte.swift` first; Swift + Apple Vision `VNGeneratePersonSegmentationRequest`) → per-frame RGBA webp, **matte only the segment you will use** (75 frames takes about 1 minute, 300 frames about 4 minutes).

## 4. Render
```bash
# Preview one layout (a still with the safe-zone red box)
LITE_ONLY=craft node out/stills-lite.mjs '[["CraftDemo-guides","name",12.3]]'
# The whole video
CONCURRENCY=2 LITE_ONLY=craft node out/render-lite.mjs CraftDemo out.mp4
```
- The render process doesn't necessarily exit when it finishes: for long renders wrap it in `perl -e 'alarm 1500; exec @ARGV' …`, and after rendering check for leftover headless chrome.
- Don't run other heavy work during rendering (on an 8GB machine it's 2–3× slower).

## 5. Loudness
`ffmpeg -i in.mp4 -af "loudnorm=I=-15:TP=-2:LRA=11" ...`; check with: `-af ebur128=peak=true`.

## 6. Optional: add BGM
`python3 tools/mix_bgm.py <final-video-without-BGM.mp4> <bgm.mp3> <out.mp4> --start seconds --gain dB`
BGM is automatic: fades in 1.2 seconds after the hook, ducks on punchline/quote/ending, fades out at the end. **Not added by default**.
