# Caption style presets (657 portrait styles)

Source: four packs from a set of JianYing caption presets (191 + 318 + 160 + 152, about 800 presets, 657 unique portrait styles after de-duplication) (each is a compound clip with 1–10 text segments; each segment has position, scale, colour, stroke, shadow, font, in / out / loop animation and keyframes). `tools/jy_preset_extract.py` converts them into style specs in `remotion/craft/caption-presets.json` (numbers and styles only: **no** original text — the sample text was mostly the author's brand and was replaced by placeholders — no preview images, no font files). ids are `cap-001…` (the original folder names contained creators' names / nicknames, which are not carried over). Gallery: `docs/caption-presets.html`.

Usage (`beats` in `edit.json`):
```json
{ "kind": "cap-preset", "props": { "preset": "cap-040", "texts": ["Point one", "Point two", "Point three"], "at": 1.2 } }
```
- `texts` replace the text per segment in order; text longer than the spec is shrunk automatically. `at` = start second of the whole preset (segments have their own offsets inside).
- `dy` shifts the whole preset up/down (px), `k` scales it, `tone` recolours everything (e.g. `"#FFD27A"`), `speed` changes playback speed.
- **Keep the face clear**: `python3 tools/place_check.py edit.json face.json --fix` computes each segment's vertical extent from its position and size and proposes `dy` when it hits the head.
- Auto SFX: one `pop` at the start. Add finer sounds via `sfx` yourself.

## Honest limits
- **Animations are name-based approximations**: the 84 in-animation names are grouped (fade / grow / slide / reveal-wipe / blur / bounce / flip / typewriter / per-character) and redrawn with generic curves, not measured frame by frame; the direction is right, curve details may differ from JianYing.
- **Font-size conversion is an estimate**: JianYing size 15 ≈ 75 px (estimated from the preset cover images).
- **Different fonts**: the original preset fonts are not bundled; rendering falls back by class (serif / sans / hand / condensed) to this library's fonts, so glyph shapes differ; check font licences yourself.
- Texture fills (2) are approximated with a flat colour; presets with stickers / shapes / effects / masks (35) only draw the text part.
- Previews are still frames with sample text; there are no video previews.
- The source is a paid asset pack: this library takes only style numbers and redraws them in its own code; it does not distribute the other party's files, previews or fonts.

## Categories
Each preset has a `cat` (the topic word in its name): 2-line captions, keywords, 4 big characters, golden lines, key info, three-part captions, opening copy, question, numbering, number display, scrolling comments… The gallery can filter by category. "Other" = presets whose original name was only a number.
