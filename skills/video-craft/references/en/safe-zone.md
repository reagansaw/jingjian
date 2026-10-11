# Safe-zone rules (the skill must understand them; every layout must obey them)

Source: two corrections by the maintainer on finished videos: "don't put the text too low, it gets covered, put it in the safe zone" and "captions too long, text too far to the side".

## Numbers (1080×1920)
| Edge | Value | Reason |
|---|---|---|
| Top | 250 | Status bar / search bar |
| Bottom | 1250 | The bottom 35% is caption copy + CTA button |
| Left | 60 | Screen edge |
| Right | 1010; **950 when y>900** | Interaction buttons on the right (like/comment/share) |
That is: all text sits entirely inside x 60–1010, y 250–1250; for text with y>900 the right boundary pulls in to 950.

## The problem with real-person talking heads: a large face
In a close-up talking head the face occupies y≈230–940 (chin about 860–940), so the "chest band" (胸口带) is only y≈880–1250, about 370px, too little for traditional layouts.
The approach: (1) shift the whole frame up 120px and scale it up ≥1.12× at the same time (otherwise the bottom edge shows); (2) lay out the layout coordinates starting from y≈1050, and use `<Zone>` to shift the whole thing up 150px into the chest band; (3) when the ending needs a giant word / signature, shrink the person and make room.

## Mechanism (kit.tsx)
- `SAFE`: the safe-zone constants; `safeRight(y)`: returns the right boundary for a given y.
- `Txt` / `FitBox`: **measure the real width** at render time, shrink if it exceeds, then push the position back inside the safe zone (leaving a 6/10px margin). All layouts' text goes through them.
- `fitSize` / `estW`: for text typed out character by character (the width changes), precompute the font size from the width of the whole sentence, so the size doesn't jump while typing.
- Captions: **at most two lines, each line ≤12 characters**, break lines at punctuation, stack upward with the bottom edge at 1230.
- Vertical `VHero`: top≥270, x≤850 (right edge ≤945), shrinks if there are many characters, the whole column doesn't exceed 1250.
- Round-window portrait / giant word / signature card: all ≥250, ≤1250.
- Check: `SafeGuides` (render `CraftDemo-guides`, which draws a red dashed box), to see at a glance which text goes out of bounds.

## Not done yet (honest)
- There is no automated "out-of-bounds detection": for now it relies on FitBox's auto-shrink + push, plus eyeballing the red box. A next step could be a script that samples a frame per layout and measures each text box via the DOM, reporting out-of-bounds ones.
- Text typed character by character, the highlight on the "真" character of the signature card, etc. are estimated/nested, and can still be off by a few pixels.
