# Sound pipeline + synthesised sound effects + hooks & effects (from "ordinary" to "not ordinary")

Answers: **why your video still looks ordinary, what the author's real talking-head episodes (a Qimen series / a story film / a podcast) did extra, and how every student can do it.**
The other files cover parts (layouts / fonts / motion); this one covers **sound** (denoise / tightening / mastering / sound effects) and **hooks and "draw what you say" effects**.

## Source and reliability (read first)
- It comes from the **actual practice** of the author's real talking-head episodes (Ivy Qimen "Six-Harmony co-broke" v4, Podcast EP1, story film EP1, the Vanta series), written up as notes by the session that cut them; this library only moved over the parts **not tied to private footage** and rewrote them as general versions. Every item is marked done / not done / not verified.
- **Verified** (on the author's macOS Apple Silicon 8 GB machine, with the author's own two talking-head clips): `align.py` + `tighten.py` (alignment and tightening to a finished file), `make_captions.py`, `denoise.py`, `vocals.py`, `transcribe.py`, `master.sh`, `qa.py` all ran end to end; 34 synthesised sound effects were generated and their spectrograms checked; the new components in `fx.tsx` etc. pass the type check and were rendered as stills / previews.
- **Not verified**: Windows / Linux; a full install from `setup.sh` on a clean machine (only a dependency-resolution `--dry-run` was done — not enough disk); the faster-whisper back end; whether the synthesised sound effects **sound good** (the author's workflow has no ears: only duration / peak / spectrum were measured — it takes a human ear).

## 1. Why "ordinary" — the comparison
| What the author did extra | Where | In this library |
|---|---|---|
| A 3–8 s **hook triple**: **script** (his strongest line + one concrete number) + **picture** (white flash / punch-in / word-by-word colour pop / number slam) + **sound** | `essence.md` §1 + `fx.tsx` | `camera-punch`, `white-flash`, `kinetic-line`, `counter-slam` |
| A sound effect on every text, **placed on the text's frame 0** (the text only becomes visible 1–3 frames later because of its entrance animation, so it sounds slightly early, never late) | `autosfx.ts` | `Edit`'s `autoSfx` (on by default) |
| **Draw what you say** (shrink into a circle avatar, two of her side by side, the picture shrinks into a phone and flies away, TV off, a real screenshot in a phone frame); **change the picture at most every 5 s** | `fx.tsx` | `camera-circle` / `camera-send` / `camera-tvoff` / `rapid-montage` / `chat-dm` |
| Captions always one line, short, white; accent colour only for emphasis; **3D thickness shadow instead of a black outline** | `depth3d()`, `captions.tsx` | `Captions`, `depth3d`, `jy-text` |
| **Clean the sound first**: denoise → tighten away pauses / re-takes / fillers → master to −15 LUFS | `tools/audio/` | below |
| 24 JianYing text animations with sound effects paired automatically | `jytext.tsx` | `jy-text` (two independently measured sets that agree where they overlap — see `motion-measured.md`) |
| Traditional-style ambience (starfield / paper grain / particles / ink wipe) | `backdrop.tsx` | `backdrop-cosmos`, `particles`, `ink-wipe` |

## 2. The sound pipeline (`tools/audio/`, one script per step)
```bash
bash tools/audio/setup.sh                                  # once: two isolated virtual envs (denoise / everything else) under ~/.cache/video-craft/
python3 tools/audio/denoise.py   in.mp4 clean.mp4          # 1 denoise (only useful for ambient noise)
python3 tools/audio/vocals.py    in.mp4 vocals.wav         # 1' only when there is BGM / music under the speech
python3 tools/audio/transcribe.py clean.mp4 tx/ --prompt "topic words, names, English words"   # 2 transcribe twice (normal + fillers), lists low-confidence words
#   → proofread: every word below 0.6 confidence must be confirmed with the speaker; write script.txt (see below)
python3 tools/audio/tighten.py --src clean.mp4 --script script.txt --out tight.mp4 --meta tight.json   # 3 tighten + captions
bash tools/audio/master.sh        out.mp4 final.mp4        # 4 master to −15 LUFS / −2 dBTP
python3 tools/audio/qa.py         final.mp4                # 5 QA (loudness + per-frame dark scan)
```
**Denoise (DeepFilterNet3)**: the author's measurement on one 26 s café talking-head clip, using the dB gap "speech p90 − pause p10" (bigger = cleaner):

| Method | Speech | Pause | Gap |
|---|---|---|---|
| Original | −19.4 | −42.1 | 22.7 dB |
| Demucs vocals only | −19.4 | −42.4 | 23.0 (almost useless) |
| Demucs + a chain of ffmpeg filters | −14.5 | −40.1 | 25.6 |
| **DeepFilterNet3 full strength** | −12.1 | **−71.3** | **59.2** ← the author listened to A/B and picked this |
| DeepFilterNet3 `--atten-lim 18` | −12.2 | −50.1 | 37.9 |

- **Ambient noise** (café / air-con / street) → DeepFilterNet; **music under the speech** → Demucs; both → Demucs then DF (**this combination was not measured**).
- **Pin the versions**: deepfilternet 0.5.6 depends on `torchaudio.backend.common.AudioMetaData`, which torchaudio ≥ 2.1 removed, so it breaks → torch 2.0.1 + torchaudio 2.0.2 + Python 3.11, installed **separately** from the other environment.
- On the author's own two clips (close mic, quiet room) denoising changed almost nothing (gap 36.2 → 36.7 dB) — **recordings with a low noise floor don't need it**.
- Compared: ffmpeg `afftdn` (weak). **Not compared**: RNNoise, JianYing's built-in denoise.

**Tightening (`tighten.py`)**: force-align to characters (torchaudio MMS_FA) → delete re-takes / fillers → squeeze pauses → change speed → per-segment loudness −16 LUFS → captions.
- `script.txt` = the words actually spoken in the original, proofread. `[re-take]` hard delete; `{ah}{la}` soft delete (only deleted if there is a pause before the previous word); write digits as digits (read as Chinese numerals for alignment).
- Pause rule: a gap > 0.45 s is treated as a drawn-out sound / "uh" and cut up to just before the next word's onset; 0.20–0.45 s only has its silence cut, leaving 0.05 s each side.
- Speech-rate target **4.5–5.0 syllables/s** (don't speed up what is already fast; use `--speed 1.05–1.08` only when too slow). The author's clip measured 5.47, so no speed-up.
- Transcription **mishears** (mixed languages / accents / proper nouns): in this library's measurement 「销冠」 became 「消关」 and 「me time」 became 「秘态」; large-v3 with a topic prompt is much better but you still have to ask the speaker. Give `--prompt` topic words.
- Why two passes: a normal pass washes away "uh" and "OK"; **the filler (disf) pass is the one that shows re-takes and fillers**. After tightening, transcribe the result once more with the disf pass to find leftovers.

**Mastering**: `loudnorm=I=-15:TP=-2` + `alimiter`. A 2:42 video of the author's measured −15.1 LUFS / true peak −2.0 dB; an 18-second clip here measured −15.6 / −2.4. Platforms turn down anything too loud, so don't exceed it.

## 3. Sound effects (an original synthesised set, 34 of them)
- Why synthesised: JianYing's 2-1 / 2-2 sound packs are someone else's material that students can't get and that can't be redistributed; this library synthesises an **original** set with plain maths (sine / noise / filtering / envelopes), so there is no licensing issue and it ships with the repo (`remotion/public/sfx/`, about 350 KB). Regenerate with `python3 tools/audio/make_sfx.py` (needs numpy + ffmpeg; `--audition` makes an audition track that announces each name, using macOS `say`).
- **Quality takes a human ear**: only duration / peak / spectrum shape were measured (the whoosh-up frequency rises, the ding is a few parallel harmonics, the typing is 10 clicks). **If one sounds bad, change the parameters of its function in `make_sfx.py` and rerun.** The first version's whooshes used "block-wise band-pass" and had a ~50 Hz flutter (it would sound like "tu-tu-tu"); they now use short-time Fourier synthesis.
- Named by **purpose**, not by "what it sounds like": `whoosh_up/down/short/long`, `swish`, `pop`, `click`, `tick`, `tap`, `ding`, `bell_long`, `chime_up`, `success`, `notify`, `boom`, `thud`, `hit`, `slam`, `sub_drop`, `punch`, `shimmer`, `flash`, `sweep_light`, `magic`, `typing`, `paper`, `camera`, `coin`, `cash`, `stamp`, `riser`, `suspense_hit`, `heartbeat`, `zip_up`.
- **Sound ↔ animation pairing** comes from the JianYing 2-1 sample (each text segment has a sound on the same frame; the author's other session checked each pair and measured the volumes): see `remotion/craft/autosfx.ts` (preset / layout / effect → sfx id + relative volume). `Edit`'s `autoSfx: true` (default) pairs automatically; `sfxGain` (default 0.5) sets the master level, sitting under the voice at −16 LUFS at about −24 LUFS; to turn one layout off write `"sfx": false` in its props. **About 1/3 of text blocks stay silent** — that's rhythm.
- **About "sound 1–3 frames before the text"**: the sound sits on the text segment's frame 0; because of the entrance animation the text only becomes visible on frames 1–3, so it sounds slightly early, **never late**. (Measured in the project file, the sound starts on the same frame as the text: 89.6%; the two statements don't conflict.)
- Not done: **ducking** (automatically lowering effects / BGM while speaking), reverb space, an assessment of commercial external sound libraries.

## 4. BGM (not bundled)
- **No BGM is bundled**: the author's 《诸神降临》 has an unknown source and licence; other songs weren't checked either. Students find a legal source themselves (their own work / paid licence / a library whose terms allow commercial use — check the terms before using).
- Mix with the existing `tools/mix_bgm.py` (fade in / duck on punchlines / fade out, −15 LUFS). The author's Qimen videos: BGM fixed at 0.447× for the whole video (≈ −7 dB), looped, 0.5 s fade-in at the start, 2 s fade-out at the end, **no ducking**, relying on the master's loudnorm to level everything. The story film is delivered **without BGM**; the author adds it in JianYing.
- Music already under the speech (someone else's video / an event) is removed with `vocals.py` (Demucs).

## 5. Fonts (not bundled; list)
| Font | Used for | Licence (as far as I know) |
|---|---|---|
| Source Han Serif / Sans (思源宋体 / 思源黑体) | big text / captions | Adobe + Google, **SIL OFL, free for commercial use** |
| Smiley Sans (得意黑) | labels / pills | **SIL OFL, free for commercial use** |
| Douyin Sans (抖音美好体) | captions / small text | published by ByteDance as a **free commercial** font (the author learned this from the pack's note; **not checked on the official site**) |
| LXGW WenKai (霞鹜文楷) | traditional / kai style | SIL OFL (layout not tested) |
| FZCuJinLJW (方正粗金陵), Aa研宋, 造字工房 series | the author's Qimen top-of-head big text / emphasis lines | **licence unknown or paid** → **cannot go in the public skill**; students use the OFL fonts above instead |
| macOS system fonts (Songti SC / 行楷 / 魏碑 / 楷体) | captions | Apple system fonts; the author didn't check "commercial use inside a video"; Windows students don't have them |
Put them in `remotion/public/craft/fonts/` (file names in the README there); if missing it falls back to the system CJK font (renders, different letterforms). **Download and check the licence yourself.**

## 6. Effects cheat sheet (`craft/fx.tsx`, `jytext.tsx`, `backdrop.tsx`)
| Component | What it does | Goes in edit.json's |
|---|---|---|
| `camera: punch` | opening punch-in 1.28→1.0 with bounce + motion blur | `camera` |
| `camera: shake` (`hits:[seconds…]`) | impact shake + 1.06× pop; the picture only, not the text | `camera` |
| `camera: tvoff` (`at`,`until`) | TV switch-off (line → dot → black); **give `until`** | `camera` |
| `camera: send` | the picture shrinks into a phone → flies away | `camera` |
| `camera: circle` (`face:[x,y]`,`peers`,`popAt`) | shrink to a circle avatar + circles around it with lines | `camera` |
| `white-flash` | white flash 0.22 s | `beats` |
| `kinetic-line` (`words:[{t,text,hot?}]`) | word-by-word pop with colour | `beats` |
| `counter-slam` (`to`,`land`,`suffix`) | a number counts up and slams | `beats` |
| `stamp` | stamp text pressed down from big | `beats` |
| `chat-dm` (`text`,`sendAt`) | chat box types → sends → bubble flies away | `beats` |
| `slot-row` (`n`) | N empty slots pop in one by one | `beats` |
| `rapid-montage` (`images:[{src,w,h}]`,`step`,`label`) | real screenshots flashing (**bring your own screenshots**) | `beats` |
| `jy-text` (`preset`: 24 JianYing presets) | JianYing text animation + 3D thickness shadow | `beats` |
| `particles` / `mist` / `paper-grain` / `ink-wipe` | ambience layers / ink-wash transition (pure code) | `beats` |
**When not to use**: abstract decoration (star-net scribbles over a face — the author was told "I don't know what it's drawing"); big text over 3 characters on the head (the head covers it); more than one accent colour in a frame; the same effect twice in a row.
**"Draw what you say" is the core**: act the sentence out with the speaker's own picture (shrink to a circle avatar, two of them side by side, shrink into a phone and fly away, TV off) — far stronger than pasting assets or abstract lines; if you have a real screenshot, use it instead of making an animation.

## 7. Not done / platform limits (honest)
| Thing | Limit | Alternative |
|---|---|---|
| `mlx_whisper` transcription | Apple Silicon only | faster-whisper (CPU / CUDA, slower; **untested**) |
| MMS_FA forced alignment | cross-platform (pip) | — |
| DeepFilterNet3 / Demucs | cross-platform, versions pinned; **Windows untested** | — |
| Transparent-person matting (text behind the person) | **macOS only** (Vision) | RobustVideoMatting / MediaPipe / rembg (**not done**) |
| Depth-parallax backgrounds (any image + depth map → real 2.5D) | needs three.js + a depth model; Depth Anything V2 **Large is non-commercial (CC-BY-NC, to be verified)**, Small is Apache | **not moved over** |
| 2.5D photo parallax (`make_parallax`), the Qimen nine-palace chart, the eight-deities report etc. | tied to Qimen / Ivy content | not moved over |
| Leftover-filler QA | needs another transcription of the result | use the disf pass of `transcribe.py` by hand |
