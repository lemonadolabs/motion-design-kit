# Making a launch video for any feature, step by step

The structure, motion, type, grid, sound and ending can be reused as they are. Three things change for each feature: the **copy**, the **three use cases**, and the **app screens**, which you rebuild in code from screenshots (`docs/REBUILD-UI.md`). The film in `src/film/` is one worked example: Lemonado's "Ask AI in Creatives", an ads tool. Copy its patterns, not its subject.

Budget:
- storyboard: half a day
- screen rebuilds: half a day to a day
- animation: a day
- review: two or three rounds

## 0. Before anything

- Watch `reference/ask-ai-in-creatives-1080p.mp4`. Read `docs/PLAYBOOK.md` end to end.
- Know the app and the platform: web, mobile or desktop. For a mobile app, decide between a portrait 9:16 film and a phone frame on the 16:9 stage (see `AGENTS.md`, "Platform").
- Get a **screen recording of the real feature**, or screenshots of every state. Everything you show must exist in the app today.
- Decide on **fictional demo content** that fits the app, for example:
  - tasks and projects in a project tool
  - tracks and playlists in a music app
  - invoices and clients in a finance app
  - messages and channels in a chat app
  - workouts in a fitness app
  - repos and builds in a dev tool

  Use one made-up company or account per film, and never real customer data.
- Collect what the kit doesn't include: your logo mark as SVG, your brand name, a brand gradient or texture image, a music track you have the rights to, and sound effects (see `README.md`, "Bring your own").

## 0b. Find the use cases (and ask if you can't)

Follow `docs/USE-CASES.md`:

1. Gather.
2. Write at least five candidates.
3. Score them and keep three.

If you can't find five good ones, stop and send the questions in that file to whoever knows the feature. Don't invent use cases.

## 0c. Mood board (the team edits it)

1. Copy `docs/moodboard-template.html` to `docs/<feature>-moodboard.html` (keep it in `docs/`).
2. Pre-fill what you know in `PREFILL` and send it.
3. Whoever fills it in opens it in a browser. They decide:
   - the news;
   - the use cases;
   - **what is on screen in every beat**: what's on white, which screen, the response word for word, the visible change in one sentence, and the data that proves it;
   - the demo content, the gradient and the music track.

Edits save in the browser. The board won't export until every required decision is made. Then it downloads `<feature>-brief.json`. Build from that file.

## 0d. Map the feature onto the template

The brief answers these questions. Check the answers against the template:

1. **What's the news?** One sentence people would repeat. In the example: "Creatives just got a whole lot simpler". In a project tool: "Planning just got easier".
2. **What's the entry point?** The real UI element that starts the feature: a button, a menu item, a toggle, a slash command, a gesture. It becomes the end of the sentence "You can now [element] ...".
3. **Where does it live?** For example "in Creatives", "in your inbox", "on every project", "in the terminal".
4. **Three use cases**, from simplest to most valuable. Each one needs:
   - a title (verb + outcome, at most 4 words);
   - the user's action (what's typed, clicked or tapped);
   - the **visible result**.

   Pick results from this list. They all animate well:

| Result pattern | How it animates | In the example (ads tool) | In other apps |
| --- | --- | --- | --- |
| Re-sort / re-rank | items fly from old slots to new slots, staggered | P1 (by hook rate), P2 (tired first) | tasks sort by due date; songs by plays |
| Filter | non-matching items shrink and fade, a filter chip pops in | P1 | inbox shows only unread; files only PDFs |
| Flag / tag | others fade into white, a dark tag pops onto the flagged items | P2 | "Blocked" on two tasks; "Overdue" on invoices |
| Answer in chat | bubble lands, bold result line + plain detail line | P1 to P3 | an assistant answers inside any app |
| Build an artifact | the old view clears, the artifact rises, numbers count up, charts draw | P3 (board) | a report, a playlist, an invoice, a release note |
| State change | a status flips, a check lands, a progress bar fills | (not in the example) | build passes, payment sent, workout logged |
| Share / send | cursor clicks (or finger taps) Share, "Link copied" toast | P3 | invite sent, file shared |
| Pick items | items lifted out onto white, ticked one per beat, fly into the next input | Pick scene | pick three photos, three tasks, three songs |
| A message elsewhere (Slack, email, a push notification) | rebuild that app natively, message slides in from the edge | (not in the example) | a notification on a lock screen |

5. **Payoff line:** "[Feature] in [Place]." Pick a letter in the last word to fly into. It needs a tall straight stroke: t, l, i, d, b or h.

## 1. Storyboard first (get a yes before writing code)

1. Copy `docs/storyboard-example.html` and keep the same page layout.
2. Fill in one frame per beat: time, what's on screen, copy, sound.
3. Mark each frame "Simple" (white) or "Product".
4. Send it and wait for a yes. On the example film, this saved whole rounds of re-animation.

Fill these slots (the film's grammar, see PLAYBOOK §1):

| Slot | Example film (ads tool) | Your launch |
| --- | --- | --- |
| Hook line 1 / 2 | "Creatives just got" / "a whole lot simpler." | What got better, said as news |
| The button | "Ask AI" (the real button in the app) | The real UI element that starts the feature |
| "You can now [button] ..." | "in Creatives." | Where it lives |
| Use case 1 to 3 titles | Find your winners. / Spot tired ads. / Send clients a board. | Verb + outcome, at most 4 words (a project tool: Plan your week. / Find blockers. / Share a summary.) |
| Prompt / action per use case | "Show my best video hooks" … | What a user would type, click or tap |
| Visible result per use case | grid sorts, tired ads sorted + tagged, board builds | The data visibly changing |
| Payoff | "Ask AI in Creatives." | [Feature] in [Place]. The fly-in goes into one letter of the last word |

## 1b. Images (before rebuilding anything)

The kit ships no images. Make sure the film gets every image it needs before you build.

List every image the storyboard needs:

- product screenshots or a screen recording for each screen;
- content shown inside the app: photos, avatars, covers, thumbnails, product images;
- the logo SVG;
- the brand gradient or texture.

Then, in this order:

1. **Look for them first.** Ask where the person's product and brand assets live, and check those places: their app repo's `public/` or `assets/` folders, a brand or marketing folder, a design file export, files they already dropped into this project. Use only images they confirm they have the rights to.
2. **Ask for the rest with one concrete list.** For each image, say what it is, which scene it's in, and the recommended size. Don't ask one question at a time.
3. **Demo content that must be fictional** (no real customer data): offer to generate it with an image model if they have one. Otherwise, use the kit's neutral placeholder tiles (`AdImage` in `src/film/ui.tsx`) until they supply images.
4. **Don't render a draft until every image is settled.** Each one is either supplied, or the person has agreed it stays a placeholder. Save supplied images under `public/`, for example `public/screens/` and `public/content/<brand>/`. Reference them with `staticFile()` and `<Img>`.

## 2. Music and the beat grid

1. Bring your own track: an MP3 you have the rights to use (cleared for ads, if the film will run as one). Pick one with a steady beat and one clear section change. Drop it into `public/audio/music/` and set `music.file` in `cues.json` to its file name.
2. Run `python3 scripts/beats.py public/audio/music/<track>.mp3`. It prints tempo and loudness per second. Look for the jump where the full section starts.
3. In Python, `import beats; beats.detail('<track>', t0, t1)` lists onset peaks with their times. Find the strong accents and the downbeat of the section change.
4. Set `music.offset` in `cues.json` so that downbeat lands at film 3.0s. Set `beat` to the beat length. Every scene boundary is `3.0 + k × beat`.
5. Set `music.fadeOut` to the last 1.6s of the film. `scripts/sound.py` handles loudness (step 6).

## 3. Edit the cues (`src/film/cues.json`)

This one file holds every time and most of the copy. Picture and sound both read it, so they can't drift out of sync.

- `scenes`: start and end of each beat (on the grid).
- `hook.line1 / line2`, `intro.words / words2`, `titles.*.words`, `payoff.words`: the copy, each word with the second it appears.
- `prompts.*.text` and `type`: what's typed and when (relative to the scene start).
- `p1 / p2 / p3 / pick`: the product beats' event times (message lands, answer lines, pull-back, sort, tags, board, cursor, clicks).
- `blend.windows`: where real motion blur is rendered (`[start, end]`, or `[start, end, 2]` for the strong ending blur).
- If you change the payoff word, the fly-in finds the stem of its "t" automatically. If the new word has no "t":
  1. Pick the letter you want to enter. It needs a tall straight stroke (l, i, t, d, b or h).
  2. Change the `'t'` in `measure()` and `stemOfT()` (Film.tsx) to that letter.
  3. Regenerate the glyphs (step 5).

## 4. Rebuild the app screens (the feature-specific part)

- Follow `docs/REBUILD-UI.md` for every screen:
  1. Capture the screen.
  2. Set up app space.
  3. Build it static in `src/screens/`. Start from `_TemplateScreen.tsx` and reuse parts of `src/film/ui.tsx` and your app's own tokens and components.
  4. Match it with `scripts/rebuild/` (text within 2%).
  5. Get the side-by-side approved.
  6. Then animate.
- `src/film/ui.tsx` is the example's screen (an ads dashboard with an AI panel), built this way. Its layout parts (sidebar, top bar, cards, side panel, chat bubble) fit most apps with a list or grid and a panel.
- `ADS`, `INITIAL`, `SORTED`, `FATIGUED` and `PICKED` in ui.tsx are the example's demo data. Replace them with your app's items: tasks, tracks, invoices, messages. Set the data so each use case visibly changes something.
- In `Film.tsx`, the scene components `Intro`, `P1Scene`, `P2Scene`, `PickScene` and `P3Scene` hold the product beats. Keep their camera pattern and swap the content:
  1. Start close on the panel with `CLOSE`.
  2. After the answer, `glide()` back to `REST`.
  3. Then animate the data.

  If your feature has no chat panel, start close on whatever element shows the response (a toast, a status, a row).
- The panel answers are written inline in each scene (`ansLine(...)`): a bold result line + a plain detail line.

## 5. Brand assets

- **Logo and name:** put your mark's SVG paths in `src/lib/brandPaths.ts` and set `BRAND_NAME` in `src/lib/brand.tsx`. Both ship as placeholders.
- **Gradient plate:** the kit ships neutral placeholders.
  1. Cut a 16:9 frame from your own brand gradient or texture. A light framing with one or two accents reads best.
  2. Save it as `public/brand/brand-gradient.jpg` at 3840x2160 (1920x1080 minimum).
  3. Make the richer copy:
  ```python
  from PIL import Image, ImageEnhance; import numpy as np
  im = Image.open('public/brand/brand-gradient.jpg').convert('RGB')
  a = np.asarray(ImageEnhance.Color(im).enhance(1.5)).astype(float) / 255
  Image.fromarray(((a ** 1.45) * 255).clip(0, 255).astype('uint8')).save('public/brand/brand-gradient-rich.jpg', quality=95)
  ```
- **Glyphs** (only if the payoff uses new letters): download Manrope Medium (free, from Google Fonts: https://fonts.google.com/specimen/Manrope) to `assets/fonts/Manrope-Medium.ttf`, or use your own brand font, then export outlines for every character in the payoff line:
  ```python
  # python3 - with fonttools installed
  from fontTools.ttLib import TTFont; from fontTools.pens.svgPathPen import SVGPathPen; from fontTools.pens.boundsPen import BoundsPen; import json
  f = TTFont('assets/fonts/Manrope-Medium.ttf'); gs = f.getGlyphSet(); cmap = f.getBestCmap(); hm = f['hmtx']
  text = 'Your payoff line here. '
  out = {'upm': f['head'].unitsPerEm, 'glyphs': {}, 'kern': {}}
  for ch in set(text):
      g = cmap[ord(ch)]; pen = SVGPathPen(gs); gs[g].draw(pen); out['glyphs'][ch] = {'d': pen.getCommands(), 'adv': hm[g][0]}
  bp = BoundsPen(gs); gs[cmap[ord('A')]].draw(bp); out['capHeight'] = bp.bounds[3]
  json.dump(out, open('src/film/manrope-medium-glyphs.json', 'w'))
  ```
  The shipped JSON also has kerning pairs for "Ask AI in Creatives.". Leaving `kern` empty is fine.

## 6. Sound

`scripts/sound.py` places every effect from the cues. It needs your music (step 2) and four recorded effects in `public/audio/sfx/`:

- `single-camera-click.mp3`
- `camera-shutter-click.mp3`
- `mouse-click.wav`
- `reverse-crash.wav`

Use effects you have the rights to (a royalty-free library works). Keep the same file names, or change them in `scripts/sound.py`. The script synthesizes the taps, drifts, thumps and whooshes. See PLAYBOOK §10 for which sound goes where.

If you added, removed or renamed a cue, update the matching block in `scripts/sound.py` (each scene has one, with a comment). Then run `npm run sound`. It writes `public/audio/mix.wav` and prints the loudness, which should end at -14 LUFS. Without `mix.wav`, the film renders silently.

## 7. Draft, check, review

```bash
npm run typecheck
npm run draft:fast                                   # silent, half size, ~30s: for looking
python3 scripts/sheet.py out/draft-half.mp4 out/sheet.jpg 1 4 8 12 ...   # contact sheet at chosen seconds
npx remotion still src/index.ts Launch-silent out/f.png --frame=900  # full-size still of one frame
npm run draft:sound                                  # 1080p with sound (needs mix.wav), send this for review
```

Run the checklist in PLAYBOOK §11. Version every draft (`-v1`, `-v2`, and so on). Say what you checked and what you couldn't.

## 8. Master and deliver

`npm run master` renders the 4K master into `out/` (about 15 minutes). Deliver 4K, 60fps, h264, AAC.

Sound-only changes don't need a new picture render. Rebuild the mix and remux it onto the existing video. Replace `MASTER.mp4` with the master's file name in `out/`:

```bash
DYLD_LIBRARY_PATH=node_modules/@remotion/compositor-darwin-arm64 node_modules/@remotion/compositor-darwin-arm64/ffmpeg \
  -i out/MASTER.mp4 -i public/audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest out/launch-remix.mp4
```

On Linux and Windows, ffmpeg lives in the matching `@remotion/compositor-*` package.

## 9. The post

Keep the post as short as the film: one sentence on what's new, one on what you can do with it, no link. The example went out on LinkedIn with: "You can now ask AI right inside Creatives. Find your best hooks, spot the ads getting tired, and turn your winners into a board for your client."
