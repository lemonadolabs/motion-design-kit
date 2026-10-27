# Code map

Remotion (React) renders the film frame by frame. Every component gets the film time `t` in seconds and computes its state from it, so any frame can be rendered on its own and renders are deterministic.

## Reusable as-is

| File / symbol | What it does |
| --- | --- |
| `src/lib/soft.tsx` → `arrive(t, start, rate)` | Arrive fast, land soft: covers `rate` of the remaining distance per 30fps frame. Use it for anything that settles on its own (words, cards, chips, rows). |
| `soft.tsx` → `land(t, start, dur, rate)` | Same curve, normalised to hit exactly 1 at `dur` (moves that must end exactly). |
| `soft.tsx` → `holdPush(t, start, rate)` | The slow push-in on holds (~0.12–0.25% per frame). |
| `soft.tsx` → `float(t, k, amp)` | A never-still hover (no beat bouncing). |
| `soft.tsx` → `Hairlines cam={...}` | The hairline grid. Pass the same camera as the content and it moves only with the camera. |
| `src/lib/frame.tsx` → `Stage cam={x,y,s}` | The white stage + grid filmed by a camera (stage point at screen centre, scale). Children are in stage space (1920x1080). |
| `frame.tsx` → `ProductWindow`, `WIN`, `WIN_S`, `appToStage`, `stageToScreen` | The floating product window (app space 2000x1125 placed at 0.84 scale) and coordinate conversions. |
| `src/lib/Liquid.tsx` | WebGL liquid gradient (one shared context). Used for the optional soft glow on stages. |
| `src/lib/brand.tsx` → `Mark`, `WordmarkLetters`, `BRAND_NAME` | Your logo mark (SVG paths in `src/lib/brandPaths.ts`) and your brand name set in the display font, any colour, any size. Both ship as placeholders: swap in your own. |
| `Film.tsx` → `glide(t, start, dur)` | The camera curve: cubic-bezier(0.32, 0, 0.12, 1). All camera moves use it, 0.9–1.15s. |
| `Film.tsx` → `camLerp(a, b, k)`, `pushed(cam, t, from)` | Blend two cameras (scale in log space) / add the hold push to a camera. |
| `Film.tsx` → `Line`, `LineAt` | A line of film type whose words sharpen in on their times, holding the line's width so it never shifts. `LineAt` anchors left/right/centre in stage space (for type that zooms with the camera). |
| `Film.tsx` → `Cursor`, `cursorAt(t, keys)`, `pressAt(t, at)` | macOS cursor, arc moves with arrive/land, click squash. |
| `Film.tsx` → `keyTimes(text, a, b)` | Character times for typing (the sound script uses the same formula, so keys land on the frame). |
| `Film.tsx` → `Hook` | The messy pile → neat row hook. Change `HOOK_IMGS`, `MESSY`, `NEAT` and the lines in cues. The pile can be any of your app's items (task cards, files, messages). |
| `Film.tsx` → `Title`, `Prompt` | The white title scene and the isolated prompt box scene (with optional thumbnails). |
| `Film.tsx` → `Payoff`, `End`, `measure()`, `WordPath`, `Plate` | The fly-into-the-letter ending and the gradient end card with the white logo (PLAYBOOK §9). |
| `Film.tsx` → `sampleTimes` / `LaunchFilm` | Frame blending (motion blur) inside `cues.blend.windows`, never across a scene start. |
| `scripts/sound.py` | The whole mix: synthesized taps, drifts, thumps, whooshes; recorded clicks/shutters (bring your own into `public/audio/sfx/`); typing from the keyboard recording; music bed (bring your own into `public/audio/music/`); loudness to -14 LUFS. Writes `public/audio/mix.wav`. |
| `scripts/beats.py` | Tempo, loudness per second and onset peaks of a track (to build the beat grid). |
| `scripts/sheet.py` | Contact sheet of a rendered video at chosen seconds. |
| `src/screens/_TemplateScreen.tsx` | Starting point for a new rebuilt screen (app space, 2000x1125), registered as a still in `Root.tsx`. |
| `scripts/rebuild/*` | Screenshot → code tools (capture, colors, measure, compare, crop-image). See `docs/REBUILD-UI.md`. |
| Your product's design tokens and components | Not included. If you have them (a tokens file, a component library), use them as the source for screens without a screenshot. |

## Feature-specific (rebuild per launch)

These hold the example (an ads tool). Replace them with your app's screens and data.

| File / symbol | What it is in the example |
| --- | --- |
| `src/film/ui.tsx` | The example's Creatives screen (sidebar, top bar with the Ask AI button, filter chips, item cards with metrics, the Ask AI panel, chat bubble, the board shell and retention curves) and its demo data (`ADS`, `INITIAL`, `SORTED`, `FATIGUED`, `PICKED`, `RETENTION`). Swap the data for your app's items (tasks, tracks, invoices, messages). |
| `Film.tsx` → `Intro` | "You can now [Ask AI] in Creatives." in app space: the camera starts at 3.4x on the real button (`Z0`), pans to the second phrase, the panel slides in beside it, the interface fades in, the camera eases out. Swap the button and phrases; keep the camera choreography. |
| `Film.tsx` → `P1Scene`, `P2Scene`, `PickScene`, `P3Scene` | The three product beats + the pick. Each: close on the panel (`CLOSE`), message + answer, `glide` back to `REST`, then the data changes (sort, sort + tag, board). |
| `src/screens/CreativesScreen.tsx` | The Creatives screen as a still (`Screen-Creatives`), the worked example of a rebuild. Your screens go next to it. |
| `AdImage` in `src/film/ui.tsx` | Neutral placeholder tiles wherever an image goes inside the app. The kit ships no images: put your own (generated or licensed) under `public/content/` and render them with `staticFile()` and `<Img>`. |
| `public/brand/brand-gradient*.jpg` | The end-card plates. Neutral placeholders: replace with your brand gradient. |

## Coordinates in one paragraph

Three spaces. **Screen**: the 1920x1080 frame (4K is the same layout at `--scale=2`). **Stage**: the white world the camera films (`Stage cam`); at rest it equals the screen. **App**: the product UI in a 2000x1125 box, placed on the stage inside the window at 0.84 scale (`appToStage`). Put film type in stage space, product UI in app space, and the cursor in screen space (convert with `stageToScreen` / `appToStage`). For a phone app, app space takes the capture's own proportions (for example 1170x2532) inside a phone frame or a 9:16 composition. Adapt `ProductWindow` and its constants to match.
