# Rebuilding the product in code (any feature)

**The rule: never put screenshots or screen recordings in the film. Capture the real product, then rebuild every screen you show as code.** Rebuilt UI stays sharp at any zoom (4K, 5x close-ups), every element can move on its own, and text, filters and numbers can be changed to make the point clear. Screenshots are only the reference you measure against.

The example's screen in `src/film/ui.tsx` (an ads dashboard with an AI panel) was built exactly this way. Render the rebuild with `npx remotion still src/index.ts Screen-Creatives out/stills/creatives.png` and compare it with the product shots in `reference/ask-ai-in-creatives-1080p.mp4` to see the level of detail to aim for.

## 1. Capture

- Open the feature in your real app with realistic demo data: full screen in the browser or the desktop app, or on a phone or simulator for mobile. Record the whole flow you want to show (QuickTime, Screen Studio, the iOS or Android screen recorder), and take screenshots of every state: empty, input, loading, result. If you're working with an AI agent, give it these screenshots.
- Pull full-resolution frames from the recording:
  ```bash
  python3 scripts/rebuild/capture.py recording.mov --every 5            # find the moments
  python3 scripts/rebuild/capture.py recording.mov 12.5 40 --app 0 0 3420 1902   # the app area → 2000 px wide
  ```
  Frames land in a `screens` folder inside `reference/` (the script creates it). Plain screenshots work the same way: put them there too. Work from the largest captures you have: 2000 px wide minimum for web and desktop, native resolution for phones. Images pasted into a chat are often downscaled to about 1024 px, which is too small.
- Note every state change you'll animate (what appears, what moves, what changes value).

## 2. App space

Lay out each screen in **app space: the screenshot scaled to 2000 px wide (2000 x 1125 for a 16:9 app window)**. Measurements then copy 1:1 from the screenshot into code as absolute positions. The film places app space inside the product window at 0.84 scale (`ProductWindow`, `appToStage`).

For a phone app, use the capture's own proportions as app space (for example 1170 x 2532), and place it in a phone frame or a 9:16 composition. Adapt `ProductWindow` to match.

## 3. Build it, static first

1. Copy `src/screens/_TemplateScreen.tsx` to `src/screens/<Name>Screen.tsx` and register a still for it in `src/Root.tsx` (2000 x 1125, like `Screen-Creatives`).
2. **Reuse before writing.** `src/film/ui.tsx` has the example's app shell and common parts. They're a good starting point for any screen with a list or grid and a side panel: `AppBg`, `Sidebar`, `TopBar` (tabs, filter pills, the dark Ask AI button), `Chip`, `Card` (an item card with metrics, checkbox, tag, ring; rename and restyle it for tasks, tracks, files), `Panel` (side panel), `Bubble`, `UsedMemory`, `BoardShell`, `Curve`. If your product has a design system (tokens, a component library), use it as the source of truth, especially for screens you have no screenshot of. Never build a screen from guesses: get a screenshot first.
3. **Positions:** absolute, measured from the screenshot.
4. **Type:** your app's own fonts, sizes from the screenshot. (The example uses Inter for all UI and Manrope only for headings, greetings and metric values, as in the app.)
5. **Colours:** your product's exact tokens win, if you have them. To match a screenshot:
   ```bash
   python3 scripts/rebuild/colors.py screenshot.png --at 300,15 1000,600 --text 68,128,115,148
   ```
   Surfaces: averaged patch. Text: darkest pixels (they come out a step light from anti-aliasing; snap to your product's text colours).
6. **Images inside the UI** (photos, avatars, covers, thumbnails, product images): use original assets the person has the rights to. If you only have a screenshot, crop and paint out the badges your components draw themselves:
   ```bash
   python3 scripts/rebuild/crop-image.py screenshot.png 319,146,719,678 public/content/demo/01.jpg --paint 330,155,370,195
   ```
   Any content that would be customer data on screen (names, photos, numbers) must be **fictional**: one made-up company or account per film. Generate the images or use licensed ones, save them under `public/content/<name>/`, and render them with `staticFile()` and `<Img>`. Until then the `AdImage` placeholder tiles hold the slots. Never use real customer data.
7. **Icons:** your app's own icon set. The example uses lucide-react (installed) and `src/lib/icons.tsx` for platform logos.

## 4. Match it

```bash
npx remotion still src/index.ts Screen-<Name> out/stills/<name>.png
python3 scripts/rebuild/measure.py screenshot.png out/stills/<name>.png "title=405,694,700,713,120" "label=325,729,420,746,170"
python3 scripts/rebuild/compare.py screenshot.png out/stills/<name>.png out/compare/<name>
```

- Get every text width within ~2% (`measure.py` ratio 0.98–1.02). Fix size or letter-spacing, never scale the element as a bitmap.
- Backgrounds within a few RGB units. Check the 50/50 blend: drift shows as a double image.
- Two passes usually do it. Eyeballing does not.
- **Gate:** send the side-by-side (`<name>-side-by-side.jpg`) for approval before animating anything.

## 5. Then edit it to make the point

Once it's faithful, change it for the film, deliberately:

- **Simplify the chrome:** keep only the navigation items a viewer needs to recognise the product. Use a fictional workspace and user (the example: workspace "Vitalé", user "Alex · Acme Agency").
- **Fit the shot:** change the layout where it helps the wide shot (the example's Creatives grid uses four columns instead of three so more ads fit).
- **Data that tells the story:** set the numbers so the result is obvious. The example has a clear winner and two clearly tired ads; a project tool might have two clearly overdue tasks. Fictional data only. No invented features.
- **Placeholders** (gray bars) for text nobody can read in the time it's on screen.
- **Bigger where it's read:** text in the close-up (a chat answer, a toast, a status) can sit slightly larger than in the app so it reads.

## 6. Animate it

Every element is a component, so animate state, not pixels:

- Elements appear with `arrive()` (fast, soft landing, blur clearing), staggered 0.05–0.06s.
- The camera films the window: start close on the part that changes (`CLOSE` = 1.45x on the panel), `glide()` back to the full window (`REST`) after a 0.7s read, then let the data change. Never move the camera while the content moves.
- Results = data changing: cards re-sort (`slotXY` old → new with `glide`), rows filter out (fade + shrink), tags pop on, values count up, charts draw (`Curve`), a new artifact rises (`BoardShell`).
- Typing: every character, timed by `keyTimes()` (the sound script uses the same times, so keys land on the frame).
- The cursor moves in screen space; convert app → screen with `appToStage` + `stageToScreen`.

## Fidelity rules (learned the hard way)

- When something looks low-res, fix the rendering, not the design. Never scale UI as a bitmap: lay it out at size.
- Canvases (charts, the orb) draw at device pixel ratio and redraw every frame.
- No gradient-clipped text (`background-clip: text` drops out in headless Chrome at 4K). Colour per letter, or use SVG.
- Live text vanishes past ~40x zoom: for extreme zooms draw text from glyph outlines (the ending does this).
- One WebGL context for every gradient canvas (`Liquid.tsx`).
