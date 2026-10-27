# Motion design kit for product launch videos

A Remotion kit for making a short launch or demo video for a feature in your app: SaaS, mobile, consumer or dev tools. It gives you a 14-beat template, rules for motion, type and sound, and tools that help you rebuild your app's screens in code from screenshots. It was built at [Lemonado](https://lemonado.io) for their own launch videos. Their "Ask AI in Creatives" launch (42.5s, 16:9, 4K, 60fps, no voice-over) is included as one worked example. It happens to be an ads tool, but the kit doesn't assume yours is.

Watch `reference/ask-ai-in-creatives-1080p.mp4` first. That is the bar.

## Quick start with Claude

Open Claude Code (or Cursor, or Codex) in an empty folder and paste this:

```
Clone https://github.com/lemonadolabs/motion-design-kit and read AGENTS.md. Then help me make a launch video: first ask me which app it's for and which feature I want to show, and ask me for screenshots of the product.
```

The agent reads `AGENTS.md`, then asks what your app is, which platform it runs on (web, mobile or desktop), what the feature does, and for screenshots or a screen recording. Then it walks you through the use cases, the mood board, the storyboard, the screen rebuilds and the renders. The kit ships no images, so the agent will also find or ask for your screenshots, logo and any images the video needs (it looks in the places you point it to first, then asks for the rest in one list).

## Quick start by hand

You need Node 18+ and Python 3.9+.

```bash
npm install                      # Remotion and its bundled ffmpeg
pip install -r requirements.txt  # numpy, scipy, Pillow, fonttools (sound and rebuild tools)
npm run dev                      # Remotion Studio: scrub the example film in the browser
npm run draft                    # 1080p render to out/
```

The kit ships with no music, sound effects or images. The example film renders silently, with neutral placeholder tiles where its demo images go. To add sound, put in your own track and sound effects (SFX) (see "Bring your own"), then run `npm run sound` to build `public/audio/mix.wav`. Renders use the mix from then on. `npm run master` renders the 4K master (about 15 minutes).

## Make a launch video for your feature

Read in this order:

1. `docs/PLAYBOOK.md`: the 14-beat template and every rule (copy, motion, type sizes, colour, the grid, camera, fades, sound, music, the ending).
2. `docs/NEW-LAUNCH.md`: step by step, from use cases to delivery.
3. `docs/USE-CASES.md`: how to find the three use cases, and the questions to ask your team when you can't.
4. `docs/moodboard-template.html`: the editable mood board. It makes you decide what is on screen in every beat, then exports a brief. Open it in a browser.
5. `docs/REBUILD-UI.md`: the rule (no screenshots in the film) and the process for rebuilding an app screen in code, with the tools in `scripts/rebuild/`.
6. `docs/CODE-MAP.md`: what every file does, which parts you can reuse as-is, and which belong to the example.

`docs/storyboard-example.html` is an example storyboard page to copy.

## What's inside

| Path | What |
| --- | --- |
| `src/film/` | The example film. `cues.json` holds every time in the film (one source for picture and sound). `Film.tsx` has all scenes. `ui.tsx` is the example's rebuilt app screen (an ads dashboard with an AI chat panel). `manrope-medium-glyphs.json` holds font outlines for the fly-in ending. |
| `src/screens/` | Rebuilt screens as stills at screenshot size, for comparing against your captures. `_TemplateScreen.tsx` is the starting point for a new one. |
| `src/lib/` | The shared motion and brand library: `soft.tsx` (arrive/land/holdPush easing, the hairline grid), `frame.tsx` (white stage, floating app window, camera), `Liquid.tsx` (WebGL gradient), `brand.tsx` and `brandPaths.ts` (your logo mark and brand name, placeholders for now), `icons.tsx`, `grammar.tsx` (fonts). |
| `public/brand/` | `brand-gradient.jpg` and `brand-gradient-rich.jpg`: neutral placeholder images for the end card. Replace them with your own. |
| `public/audio/keys/` | A real keyboard recording, cut into single strokes for typing sounds. |
| `scripts/` | `sound.py` (the whole mix), `beats.py` (find a track's beat grid), `sheet.py` (contact sheet of a render), `_ff.py` (uses Remotion's ffmpeg). |
| `scripts/rebuild/` | Screenshot-to-code tools: `capture.py` (frames from a screen recording), `colors.py` (exact colours), `measure.py` (text widths compared with the screenshot), `compare.py` (side-by-side and overlay), `crop-image.py` (cut images out, paint out UI badges). |
| `docs/` | Playbook, new-launch guide, use-case guide, mood board (`moodboard-template.html`), rebuild guide, code map, example storyboard. |
| `reference/` | `ask-ai-in-creatives-1080p.mp4`, the finished example film. |

## Bring your own

- **Screenshots or a screen recording** of the real feature, in every state. The agent rebuilds them in code (`docs/REBUILD-UI.md`). Use your app's own design tokens and components if you have them.
- **Demo content.** Fictional data that fits your app, for example tasks in a project tool, tracks in a music app, invoices in a finance app, messages in a chat app, or workouts in a fitness app. If your screens show images (photos, covers, thumbnails), use generated or licensed ones and put them in `public/`. The example's image slots render as neutral tiles (`AdImage` in `src/film/ui.tsx`).
- **Music.** Drop an MP3 you have the rights to into `public/audio/music/`, then set its file name and start offset under `music` in `src/film/cues.json`. `docs/NEW-LAUNCH.md` §2 shows how to find its beat grid.
- **Sound effects.** Put your own SFX (a royalty-free library works) into `public/audio/sfx/`. Use the file names `scripts/sound.py` expects (`single-camera-click.mp3`, `camera-shutter-click.mp3`, `mouse-click.wav`, `reverse-crash.wav`), or change the names in `scripts/sound.py`. The script synthesizes the taps, drifts, thumps and whooshes, so those four files are all you need.
- **Brand gradient.** Replace `public/brand/brand-gradient.jpg` and `brand-gradient-rich.jpg` with your own brand gradient. Keep the same file names, at 1920x1080 or larger (3840x2160 for a sharp 4K master).
- **Logo and name.** Put your mark in `src/lib/brandPaths.ts` (SVG paths) and set `BRAND_NAME` in `src/lib/brand.tsx`.

## License and rights

The code and docs are free to use and adapt. The kit includes no images, music or sound effects, and the reference film is silent. Only use images, tracks and effects you have the rights to, and check that the license covers paid ads if you plan to run the video as an ad. Fonts load from Google Fonts (Manrope and Inter, SIL Open Font License).

The Lemonado name, the example film and the example product screen are Lemonado's and are here only as a reference. Don't reuse them in your own videos.
