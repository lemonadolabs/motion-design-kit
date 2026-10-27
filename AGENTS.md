# AGENTS.md: motion design kit

You are helping someone make a launch or demo video for a feature in their own app, in the style of `reference/ask-ai-in-creatives-1080p.mp4`. The app could be anything: a SaaS dashboard, a mobile app, a consumer product, a developer tool. The film in `src/film/` is one worked example. It is Lemonado's "Ask AI in Creatives" launch, and Lemonado's product is an ads tool. Don't assume the person's app is like it, or that the person is a marketer.

Keep the example's grammar: structure, motion, timing, type, sound and ending. Swap in the person's app, copy, use cases, demo content, brand and sound.

## Start by asking

Before reading code or planning beats, find out:

1. **What the app is** and who uses it, in one or two sentences.
2. **Platform:** web, mobile (iOS or Android) or desktop. This decides the frame (see "Platform" below).
3. **The feature:** what it does, where it lives, and the exact button, gesture, menu item or command that starts it.
4. **Screenshots or a screen recording** of every state of the real feature (empty, input, loading, result), as large as possible. For web and desktop, that means 2000 px wide or more. For phones, native resolution.
5. **Where the video will run** (website, social, app store, in-app, changelog) and in which aspect ratio.

Then adapt. If something doesn't fit the template (no text input, no list that changes), map it to the closest result pattern in `docs/NEW-LAUNCH.md` §0d. Tell the person what you changed.

## Read, in order

1. `README.md` (what's here, how to render, what the person must bring)
2. `docs/PLAYBOOK.md` (every rule; follow it by default, since each rule came from review notes on a real film)
3. `docs/NEW-LAUNCH.md` (the process)
4. `docs/USE-CASES.md` (finding the use cases, and the questions to ask when you can't)
5. `docs/REBUILD-UI.md` (rebuilding app screens in code from screenshots)
6. `docs/CODE-MAP.md` (where things are in the code)

## Platform

- **Web or desktop:** use the example's setup as it is. The app sits in a floating window on a 16:9 white stage, laid out in 2000x1125 app space.
- **Mobile:** every beat, motion rule, type rule and sound rule still applies. Either render a portrait 9:16 film, or keep 16:9 and put the app in a phone frame on the white stage. Lay out the screen at the capture's own proportions (for example 1170x2532 for a recent iPhone), not 2000x1125.

  To do this, adapt `ProductWindow` in `src/lib/frame.tsx` and add a composition in `src/Root.tsx`. Taps replace cursor clicks: show a soft touch circle instead of the macOS arrow.

## What the person has to bring

The kit ships without these. Ask early, but don't block on the ones you don't need yet:

- **Screenshots or a screen recording** (see above).
- **Demo content:** fictional data that fits the app, such as tasks, tracks, invoices, messages, workouts or files. If the screens show images, the person supplies generated or licensed ones. Never use real customer data.
- **Brand:**
  - their logo mark as SVG, which goes in `src/lib/brandPaths.ts`;
  - their brand name, which goes in `BRAND_NAME` in `src/lib/brand.tsx`;
  - a brand gradient or texture image, which replaces `public/brand/brand-gradient.jpg` and `brand-gradient-rich.jpg` (same names, 1920x1080 or larger);
  - their app's design tokens or components, if they have them.
- **Music:** an MP3 they have the rights to use, in `public/audio/music/`, named in `cues.json` under `music`.
- **Sound effects:** their own SFX (a royalty-free library works) in `public/audio/sfx/`. Use the names `scripts/sound.py` loads, or change the names there.

Until the music and SFX exist, `npm run sound` can't build `public/audio/mix.wav`, so the film renders silently. That's fine for picture drafts.

## How to work

1. **Use cases first.** Find the best three per `docs/USE-CASES.md`. Gather them from the feature, the person's docs, launch material and users. Write at least five candidates and score them. **If you can't get five good candidates, stop and ask the person the questions in that file. Never invent use cases or start the video without them.**
2. **Mood board, edited by the person.** Copy `docs/moodboard-template.html` to `docs/<feature>-moodboard.html`. Pre-fill what you know in its `PREFILL` object, and hand it over. The person edits it in the browser:
   - the news lines and the chosen use cases;
   - exactly what is on screen in every beat: what's on white, which screen, the response word for word, what visibly changes, and the data;
   - the demo content, gradient and music.

   It won't export until every decision is made. Build only from the exported `*-brief.json`.
3. **Storyboard before code.** Turn the brief into a storyboard page (copy `docs/storyboard-example.html`), with one frame per beat showing time, screen, copy and sound. Get a yes before building.
4. **Images.** The kit ships no images, so make sure the film gets every image it needs before you build.

   First, list every image the storyboard needs:
   - product screenshots or a screen recording for each screen;
   - content shown inside the app, such as photos, avatars, covers, thumbnails and product images;
   - the logo SVG;
   - the brand gradient or texture.

   Then, in this order:
   1. **Look for them first.** Ask where the person's product and brand assets live, and check those places: their app repo's `public/` or `assets/` folders, a brand or marketing folder, a design file export, files they already dropped into this project. Use only images they confirm they have the rights to.
   2. **Ask for the rest in one concrete list.** For each image, give what it is, which scene it's in and the recommended size. Don't ask one question at a time.
   3. **Fictional demo content** (never real customer data): offer to generate it with an image model if they have one. Otherwise use the kit's neutral placeholder tiles (`AdImage` in `src/film/ui.tsx`) until they supply images.
   4. **No draft render until every image is settled:** each one is either supplied, or the person has agreed it stays a placeholder. Save supplied images under `public/` (for example `public/screens/` and `public/content/<brand>/`) and reference them with `staticFile()` and `<Img>`.
5. **Facts.** Only show features that exist in the app today. What the app does, who it's for and how it's described come from the person or their docs. Never guess them. Demo data is fictional and fits the app.
6. **Rebuild, never screenshot.** Rebuild each screen in code in app space. Match it to the screenshot with `scripts/rebuild/` (text widths within 2%). Get the side-by-side approved, then animate. Never put a screenshot or screen recording in the film.
7. **Change content, not grammar.** Keep the structure, camera, timing grid, type sizes, grid, sound plan and ending from the playbook. Change the copy, use cases, screens, data, brand colours and logo.
8. **One timing source.** Every time goes in `src/film/cues.json`. Never hard-code a time in a component.
9. **Check before sending:**
   - run `npm run typecheck`;
   - make a contact sheet of the whole film and full-size stills of every product close-up;
   - go through the PLAYBOOK §11 checklist.

   Say what you checked and what you didn't. You can't watch it in motion or listen to it.
10. **Edit notes:** when the person gives notes on a draft, make the changes and send the new version. Don't stop to present a plan.
11. **Copy rules:** lead with the news. At most 4 words per line, no em dashes, and plain words the app's users would say.

## Commands

```bash
npm install && pip install -r requirements.txt
npm run dev          # Remotion Studio
npm run sound        # rebuild the mix after any cue change (needs music + SFX)
npm run draft:fast   # silent half-size draft
npm run draft        # 1080p, silent
npm run draft:sound  # 1080p with sound (after npm run sound), for review
npm run master       # 4K master
```
