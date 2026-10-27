# Playbook: the feature launch video

For any feature in any product. Distilled from the example film (Lemonado's "Ask AI in Creatives" launch), which went through six review rounds. Every rule here came from a note on a real draft. Follow them by default; change one only when the person approving the film asks.

## 1. The shape (a template for any feature)

About 40 seconds, 16:9, 4K (3840x2160), 60fps, no voice-over. Music and sound design carry it, and the words are written on screen. The same 14 beats work for any feature in any app. The right-hand column shows how the example film (Ask AI in Creatives, an ads tool) filled them.

For a mobile app, the beats stay the same. Render portrait 9:16, or put the app in a phone frame on the 16:9 stage, and use taps in place of cursor clicks.

| # | Beat | Time | Template (any feature) | Example film (ads tool) |
| --- | --- | --- | --- | --- |
| 1 | Hook | 0 – 3.0 | The "before": a messy pile of the things the feature deals with (cards, tasks, files, messages), then it snaps into order. Two lines saying it's news. | Ad cards tumble in; "Creatives just got" / "a whole lot simpler."; on "simpler." the cards snap into a neat row. |
| 2 | Intro | 3.0 – 9.0 | On the music's drop: "You can now [the real UI element] [where it lives]." Press it. Its panel/screen comes in beside it, the rest of the product fades in around them, the camera eases out to the full window. One continuous shot. | "You can now [Ask AI] in Creatives." → chat panel slides in → Creatives fades in → zoom out. |
| 3 | Title 1 | 9.0 – 11.25 | Use case 1 as a plain promise on white. | "Find your winners." |
| 4 | Action 1 | 11.25 – 13.5 | The input in isolation on white (prompt box, button, picker, toggle): the user's action. | Prompt box: "Show my best video hooks". |
| 5 | Product 1 | 13.5 – 17.25 | Close on where the response lands, then pull back and show the data visibly change. | Answer in the chat → grid sorts by hook rate → ring on the winner. |
| 6–8 | Use case 2 | 17.25 – 25.5 | Same three steps. | "Spot tired ads." → "Any ads getting tired?" → tired ads sorted to the front and tagged. |
| 9–12 | Use case 3 | 25.5 – 36.75 | Same three steps; the last one can add a "pick" beat (isolated items on white) and should end in something shareable. | "Send clients a board." → pick 3 → "Make a board for my client" → board builds → Share → "Link copied". |
| 13 | Payoff | 36.75 – 39.75 | "[Feature] in [Place]." The last word is filled with the brand gradient and the camera flies into one of its letters (§9). | "Ask AI in Creatives." |
| 14 | Logo | 39.75 – 42.5 | The gradient becomes the end card; your white logo, fast. | Same, with the Lemonado logo. |

The same template in a project tool could look like this. Hook: "Planning just got" / "a lot faster." over a pile of task cards. Intro: "You can now [Plan my week] in Projects." Use case 1: "Plan your week.", then "Sort by due date" typed into the input, then the tasks sort themselves by due date. Use case 2: "Find blockers.", then two tasks get a "Blocked" tag. Use case 3: "Share a summary.", then a weekly summary builds, then Share.

The rhythm that makes it work: **simple visual on white → the real product doing it**, back and forth. Each use case is the same three steps (title, action, product), so the viewer learns the pattern once and then just watches. Three use cases is the right number; scale the timing on the beat grid if a feature needs more or less.

**Picking the three use cases:** each one must be something the feature does today and a job your users recognise. It must also show as a *visible change* in the product: a sort, a filter, a tag, a number counting, a chart drawing, a status flipping, a new item or message appearing. Order them from simplest to most valuable. End on the one that produces something the user would share, send or save (`docs/USE-CASES.md`).

**Rebuilding the product:** every product shot is rebuilt in code from screenshots of the real feature (`docs/REBUILD-UI.md`). Never film or animate screenshots.

## 2. Copy

- Open by saying it's new, not with a generic hook. The example opens with "Creatives just got a whole lot simpler.", then "You can now [button] in Creatives."
- One row per line, at most four words. Big lines 140px, supporting lines 50px. Nothing else.
- Use-case titles are plain promises: verb + outcome. The example uses "Find your winners.", "Spot tired ads." and "Send clients a board.". A project tool might use "Plan your week."
- Actions are what a user would actually type, click or tap. Keep them short enough to type in about a second (the example: "Show my best video hooks").
- Answers or responses: one bold line (the result) + one plain line (the detail). Keep your product's real format. The example keeps "Used memory", the bold result and the gray count.
- No em dashes anywhere on screen. No invented features: everything shown must exist in the product today. Demo data is fictional and fits the app.

## 3. Motion (master prompt, every shot)

```
Motion rules for every shot:
- Arrive fast, land soft: each frame covers 12–19% of the remaining distance.
  Never constant speed, never a dead stop.
- Nothing ever freezes: holds keep a slow push-in (~0.25% per frame).
- Every move lasts at least 0.3s; big moves 0.5–0.75s.
- Stagger grouped elements 2–4 frames apart.
- Motion blur follows direction and speed, fades as things settle; fast
  moves get real in-between frames blended, never blended across a cut.
- Text stays still at least 8 frames before it moves.
- One focal point per frame.
- Cuts land on the beat or 2 frames before it; morphs start ~4 frames early.
```

How this film applies it (and what changed after review):

- **Element arrivals** (cards, words, chips, bubbles): `arrive(t, start, 0.2–0.24)` = 20–24% of the remaining distance per 30fps frame, with a blur that clears as it lands (words: blur 10px → 0, rise 18px).
- **Camera moves are slower than element moves.** v1 used 0.3–0.5s camera moves and the review called them "way too fast and stiff, no time to read". Camera moves are now **0.9–1.15s** on `cubic-bezier(0.32, 0, 0.12, 1)` (`glide()` in Film.tsx): eases off the mark (no jolt), fast in the middle, long soft landing.
- **Reading time:** after the last answer line appears, hold about **0.7s** before the camera pulls back. Pauses inside a scene are fine; between scenes stay short.
- **Never move the frame while the content moves.** Pull back first, then the grid reshuffles.
- **Holds push in:** `holdPush(t, start, 0.0012–0.0018)` on every shot (slightly gentler than the master rate so wide product shots don't run off the edges).
- **Staggers:** grid cards 0.06s apart, answer lines 0.06–0.1s, picked cards 0.06s.
- **Fades:** what has been seen fades toward white (a 72% white veil on cards), so the eye lands on the new thing. Scene exits blur out over 0.2s into the cut.
- **Motion blur:** 5 real in-between frames over a 180° shutter in `cues.blend.windows`; never across a cut. The ending uses 8 samples over a full frame plus speed blur (§9).
- **Cursor:** macOS arrow, moves on an arc with arrive-fast/land-soft, small squash on click, fades out after its last click.

## 4. Type

- **Film type:** Manrope, weight 500 only. Big lines 140px, letter-spacing -0.04em. Supporting lines 50px, -0.025em. Colour ink `#0B152B`. Muted supporting text `rgba(11,21,43,0.42)`.
- **Words appear one at a time** and sharpen in; unsaid words hold their space (hidden), so the line never shifts.
- **Product UI** keeps your app's own type and colours. In the example: Inter 400/500/600, stone neutrals (`#1c1917` ink, `#44403c`, `#78716c`, `#a8a29e`).
- **Prompt box text:** Inter 50px in a 1180px-wide white box (radius 36, soft shadow), send button 76px circle (gray when empty, ink when typed).

## 5. The white world and the grid

- Stage is pure white `#FFFFFF`.
- **Hairline grid:** verticals every 640px (at 640 / 1280 at rest), horizontal rules every 540px (at 270 dashed and 810 solid at rest), colour `rgba(11,21,43,0.09)`, 1px. Dashes 12px.
- **The grid is fixed in space.** It never drifts on its own; it only moves with the camera (zooms, pans, pull-backs), in exact sync with the content. Every scene passes the same camera to the grid and to its content (`<Stage cam={...}>` does this). It extends far past the frame so pullbacks never show its edges.
- **Product window:** the app sits in a floating window on the stage at 0.84 scale (1680x945 on a 1920x1080 frame), radius 22px, edge `rgba(11,21,43,0.06)`, shadow `0 40px 100px rgba(80,40,30,0.18)`. The app is laid out in "app space" (2000x1125) so measurements copy straight from screenshots.
- No grain on objects (cards, UI, type). The only grain is inside the brand gradient texture itself.

## 6. Colour

- Ink `#0B152B` for film type, white stage, your product's own neutrals in product UI. If your brand ink is a different near-black, use it everywhere the film uses `#0B152B`.
- The brand gradient is **a real brand texture**: your hero background, a gradient image from your brand kit, or a photo-like texture. Never a CSS gradient wash. Save a 16:9 frame of it as `public/brand/brand-gradient.jpg` (the kit ships a neutral placeholder). The example frames its texture so it's mostly soft pink with one coral fold and yellow on the right. A framing that was mostly one strong colour was rejected ("too red"): keep it light, with one or two accents.
- Accents in product UI come from your product. The example uses the dark Ask AI button (`#1c1917`), a peach chat bubble `#FCDCD3` with border `#F5BDAE`, and a gradient ring on the winning card (`#e0609a → #ec4e38 → #ef9a3a`).
- Keep a short "never" list for your brand. The example's: no coral `#EE6A38` accent, no orange badges, no green checks.

## 7. Product shots

- Rebuild the UI in code from screenshots and a screen recording of the real feature; never animate screenshots. Full process: `docs/REBUILD-UI.md`. Text, filters and numbers can then be changed to make the point clear.
- One fictional company or account per film, with demo data that fits the app (the example uses a made-up drinks brand, Vitalé). Never real customer data.
- Simplify the chrome: keep only the navigation items a viewer needs to recognise the product. Use a fictional workspace and user name (the example: workspace "Vitalé", user "Alex · Acme Agency").
- Placeholders (gray bars) for text nobody has time to read.
- Close-up on where the response lands for the message and answer (the example: camera at 1.45x on the chat panel), then pull back to the full window for the result.
- When a result is shown, change the data visibly (sort, filter, build), don't only highlight.
- When a new artifact takes over, remove what's no longer needed. In the example, the chat panel slides away when the board appears.

## 8. Music and the beat grid

- One track under the whole film. Bring your own: an MP3 you have the rights to use (in ads, if the film will run as one), in `public/audio/music/`, named under `music.file` in `cues.json`. The kit ships no music.
- Pick a track with a steady beat and one clear section change (a drop or a build into a fuller section). Start it so that section change lands on the first big cut (film 3.0s). The example's track starts at **8.998s** into the file (`music.offset`).
- Find the grid with `python3 scripts/beats.py track.mp3` (tempo + loudness per second) and `beats.detail(...)` (onset peaks with times). The example's track: accents every 1.5s, beat **0.7502s**.
- **Every scene boundary sits on the grid** (`3.0 + k × 0.7502`). Big moments (the drop, the button press, the pick clicks) land on beats too.
- The music fades out over the last 1.6s (`music.fadeOut`).

## 9. The ending: flying into the letter

The hardest shot. Do it exactly like this or it looks cheap:

1. "Creatives." is drawn from **real glyph outlines** (Manrope Medium → `manrope-medium-glyphs.json`, SVG paths). Live text vanishes in Chrome past ~40x zoom; outlines stay razor sharp at 260x.
2. The word is a **mask onto the brand gradient**. Before the zoom, the letters show a **richer copy** of the texture (saturation x1.5, gamma 1.45) so a pale gradient reads on white; it fades back to the normal plate as the zoom completes.
3. The camera goes **straight in** about the stem of the lowercase "t" (found automatically by rasterising the glyph). No sideways drift.
4. The zoom **accelerates all the way** (log-scale on u^2.4 over 1.35s): slow enough at first to read the letters, then the letter's edges pass in a few frames so you never register being inside a letter.
5. **Window effect:** the gradient behind the letters zooms **out** (1.9x → 1x) as the camera flies in, like walking up to a window and seeing more of the view.
6. **Depth of field:** the gradient starts blurred (26px) and sharpens over the second half, fully sharp when it fills the frame.
7. **Speed blur:** the letters get Gaussian blur that scales with zoom speed (up to 36px), plus 8-sample, full-frame motion blur on the last 0.65s.
8. The end card continues the plate's exact transform, so the cut is invisible (mean pixel difference ~5/255). The white logo arrives in ~0.25s.

## 10. Sound

No voice, so sound does a lot. All placed from `cues.json` by `scripts/sound.py`. The recorded effects (camera click, shutter, mouse click, reverse crash) aren't included: bring your own into `public/audio/sfx/` with the same file names, or change the names in `scripts/sound.py`. The taps, drifts, thumps and whooshes are synthesized by the script.

- **No bells, dings or cinematic impacts** (the big impact on the logo was rejected). Clicks, camera shutters, soft taps, low air drifts, sub thumps, whooshes only on big moves.
- Each item landing in the hook (ad cards in the example): one crisp camera click, panned to where it lands.
- Words appearing: a soft felt tap per word.
- The snap into a row: a quick run of small clicks + a light thump. A reverse crash builds into the drop; a deep sub thump on the drop.
- Button press, checkbox ticks, Share: real mouse-click recording.
- **Typing:** a real keyboard recording, one stroke per character, landing on the frame the character appears (`public/audio/keys/`, included). Synthesized keys were rejected.
- Chat message landing: a low tap; each answer line: a softer, higher tap.
- Camera moves: a low air drift the length of the move. Grid reshuffle / board appearing: a camera shutter + a tap per card.
- The fly-in: a rising whoosh that **peaks when the letter edges fly past** (about 80% in) plus a soft low swell. Fast-motion effects land at the moment of fastest motion, slightly early rather than late.
- Logo: a soft swell and a light tap. Nothing loud.
- **Levels:** music alone at about -18 LUFS, effects pinned on top (never normalised from their own peak), typing 7 dB under the effects, whole mix mastered to **-14 LUFS**, peaks under -1 dBFS.

## 11. Review checklist (before sending any draft)

- [ ] Contact sheet of the whole film (`python3 scripts/sheet.py out/x.mp4 out/sheet.jpg`) and full-size stills of every product close-up.
- [ ] Every line ≤ 4 words, 140/50px, Manrope 500, no em dashes.
- [ ] Every camera move ≥ 0.9s; ≥ 0.7s to read after each answer.
- [ ] Grid moves only with the camera.
- [ ] Nothing on screen is real customer data. Every feature shown exists today.
- [ ] Cuts on the beat grid. Mix at -14 LUFS.
- [ ] The ending: crisp letters, straight in, no white flash, invisible cut to the end card.
- [ ] Say what you checked (frames, stills, loudness) and what you didn't (watching in motion, listening).

## 12. What was tried and rejected

- Big numbered titles ("01 Find your winners") → replaced by plain titles.
- Typing out the titles letter by letter → titles sharpen in by word; typing only happens in input fields.
- A hard match cut from the big button into the product → jumpy; replaced by the continuous chat-then-interface fade.
- A supporting line under "You can now [Ask AI]" → replaced by "in Creatives." arriving beside the button as the camera pans.
- Highlighting tired ads without sorting them → sort them (change the data, don't only highlight).
- The chat panel staying on screen while the board is shown → it slides away.
- A gradient drawn in CSS / a too-red framing → the real hero texture, mostly pink.
- A static gradient behind cut-out letters, sideways drift during the zoom, a slow zoom that lets you see you're inside a "t" → §9.
- A cinematic impact on the logo → soft swell.
