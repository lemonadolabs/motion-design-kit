// The example launch film (Lemonado, "Ask AI in Creatives"), no voice. See docs/storyboard-example.html:
// it opens by saying it's new, then
// cuts back and forth between simple isolated visuals on the white stage (the button, a prompt box,
// lifted-out cards) and the real product doing the thing. All times: cues.json.
import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {Check} from 'lucide-react';
import {FPS, cues, scenes, SceneKey} from './timeline';
import GLYPHS from './manrope-medium-glyphs.json';
import {display, ui} from '../lib/grammar';
import {Hairlines, arrive, float, holdPush, land, quint} from '../lib/soft';
import {Liquid} from '../lib/Liquid';
import {ProductWindow, Stage, StageCam, WIN, WIN_S, appToStage, stageToScreen} from '../lib/frame';
import {Mark, WordmarkLetters} from '../lib/brand';
import {
  A, ADS, AppBg, BoardShell, Bubble, Card, Chip, Curve, FATIGUED, INITIAL, Link2, PANEL, PICKED, Panel, RETENTION, Rise, SORTED, Sidebar, TopBar, UsedMemory,
  askBtn, cardH, slotXY, AdImage,
} from './ui';

const INK = '#0B152B';
const MUTED = 'rgba(11,21,43,0.42)';
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const easeIn = (x: number) => clamp01(x) ** 3;
const lin = (t: number, a: number, d: number) => clamp01((t - a) / d);
const camLerp = (a: StageCam, b: StageCam, k: number): StageCam => ({x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k))});
const pushed = (c: StageCam, t: number, from: number, rate = 0.0018): StageCam => ({...c, s: c.s * holdPush(t, from, rate)});
const REST: StageCam = {x: 960, y: 540, s: 1};
/** Smooth camera move: cubic-bezier(0.32, 0, 0.12, 1) — eases off the mark, arrives fast, lands long and soft. */
const bez = (x1: number, y1: number, x2: number, y2: number) => (u: number) => {
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  let s = u;
  for (let i = 0; i < 8; i++) {
    const x = 3 * (1 - s) ** 2 * s * x1 + 3 * (1 - s) * s * s * x2 + s ** 3 - u;
    const dx = 3 * (1 - s) ** 2 * x1 + 6 * (1 - s) * s * (x2 - x1) + 3 * s * s * (1 - x2);
    if (Math.abs(dx) < 1e-6) break;
    s -= x / dx;
  }
  return 3 * (1 - s) ** 2 * s * y1 + 3 * (1 - s) * s * s * y2 + s ** 3;
};
const GLIDE = bez(0.32, 0, 0.12, 1);
const glide = (t: number, start: number, dur: number) => GLIDE(clamp01((t - start) / dur));
/** Close on the Ask AI panel's conversation (header to the answer), grid peeking in on the left. */
const CLOSE: StageCam = (() => {
  const p = appToStage(PANEL.x + PANEL.w / 2, 400);
  return {x: p.x - 190 / 1.45, y: p.y, s: 1.45};
})();
const appToScreen = (cam: StageCam, x: number, y: number) => {
  const s = appToStage(x, y);
  return stageToScreen(cam, s.x, s.y);
};

// ---------- shared pieces ----------

/** One line of film type, each word sharpening in on its time; the line can blur out. */
const Line: React.FC<{t: number; words: [string, number][]; y?: number; size?: number; out?: number; outDur?: number; color?: (w: string, i: number) => React.ReactNode}> = ({
  t, words, y = 540, size = 140, out = 1e9, outDur = 0.14, color,
}) => {
  const o = quint(lin(t, out, outDur));
  if (o >= 1) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, transform: 'translateY(-50%)', textAlign: 'center', fontFamily: display, fontWeight: 500, fontSize: size, letterSpacing: '-0.04em', lineHeight: 1.1, color: INK, whiteSpace: 'pre', opacity: 1 - o, filter: o > 0 ? `blur(${o * 12}px)` : undefined}}>
      {words.map(([w, at], i) => {
        if (t < at) return <span key={i} style={{visibility: 'hidden'}}>{w + (i < words.length - 1 ? ' ' : '')}</span>;
        const k = arrive(t, at, 0.22);
        const b = Math.max(0, 1 - k * 1.3);
        return (
          <span key={i} style={{display: 'inline-block', opacity: Math.min(1, k * 1.8), filter: b > 0.01 ? `blur(${b * 10}px)` : undefined, transform: `translateY(${b * 18}px)`}}>
            {color ? color(w, i) : w}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </div>
  );
};

/** macOS arrow cursor in screen space; `press` 0..1 squashes it. */
const Cursor: React.FC<{x: number; y: number; press?: number; opacity?: number; size?: number}> = ({x, y, press = 0, opacity = 1, size = 40}) => (
  <svg width={size} height={size * 1.45} viewBox="0 0 20 29" style={{position: 'absolute', left: x - size * 0.12, top: y - size * 0.06, opacity, transform: `scale(${1 - 0.16 * press})`, transformOrigin: '10% 5%', filter: 'drop-shadow(0 4px 8px rgba(11,21,43,0.28))', overflow: 'visible'}}>
    <path d="M2 1.5 L2 22.5 L7.3 17.6 L10.9 26.2 L14.3 24.8 L10.8 16.4 L18 16.2 Z" fill="#111" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);
const pressAt = (t: number, at: number) => (t < at ? 0 : Math.sin(Math.PI * clamp01((t - at) / 0.16)));

/** A cursor path: each key {t, x, y} is reached by `t` with an arrive-fast/land-soft move and a slight arc. */
type CK = {t: number; x: number; y: number};
const cursorAt = (t: number, keys: CK[], dur = 0.3) => {
  let p = {x: keys[0].x, y: keys[0].y};
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    const k = land(t, b.t - dur, dur, 0.17);
    if (k <= 0) break;
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const arc = Math.sin(Math.PI * k) * Math.min(40, dist * 0.08);
    const nx = dist ? -(b.y - a.y) / dist : 0;
    const ny = dist ? (b.x - a.x) / dist : 0;
    p = {x: lerp(a.x, b.x, k) + nx * arc, y: lerp(a.y, b.y, k) + ny * arc};
  }
  return p;
};

/** Typed character times between a and b (uniform with a tiny deterministic swing; the sound script uses the same formula). */
export const keyTimes = (text: string, a: number, b: number) => {
  const n = text.length;
  return Array.from({length: n}, (_, i) => a + ((b - a) * i) / Math.max(1, n - 1) + (i > 0 && i < n - 1 ? 0.012 * Math.sin(i * 2.7) : 0));
};

// ---------- the Creatives screen ----------

type GridCard = {img: number; slot: number; x?: number; y?: number; w?: number; opacity?: number; scale?: number; check?: number; veil?: number; tag?: number; ring?: number; hookHi?: number};
const Screen: React.FC<{
  open: number; sort: string; count?: number; press?: number; cards: GridCard[]; chips?: number; gridOpacity?: number; panel?: React.ReactNode; board?: React.ReactNode; boardK?: number;
}> = ({open, sort, count, press, cards, chips = 0, gridOpacity = 1, panel, board}) => (
  <>
    <AppBg />
    <Sidebar />
    <TopBar open={open} sort={sort} count={count} press={press} />
    {chips > 0 && (
      <>
        <Chip x={316} k={chips}>Format is video<span style={{color: A.text4}}>×</span></Chip>
        <div style={{position: 'absolute', left: 500, top: 132, height: 36, display: 'flex', alignItems: 'center', fontFamily: ui, fontSize: 15, color: A.text3, opacity: chips}}>Clear all</div>
      </>
    )}
    <div style={{position: 'absolute', inset: 0, opacity: gridOpacity}}>
      {cards.map((c) => {
        const s = slotXY(c.slot, open);
        const x = c.x ?? s.x;
        const y = c.y ?? s.y;
        const w = c.w ?? s.w;
        return (
          <Card
            key={c.img}
            ad={ADS[c.img]}
            w={w}
            check={c.check}
            veil={c.veil}
            tag={c.tag}
            ring={c.ring}
            hookHi={c.hookHi}
            style={{left: x, top: y, opacity: c.opacity ?? 1, transform: c.scale !== undefined ? `scale(${c.scale})` : undefined}}
          />
        );
      })}
    </div>
    {board}
    <Panel slide={open}>{panel}</Panel>
  </>
);

// ---------- 0 – 3.0  "Creatives just got / a whole lot simpler." ----------
const H = cues.hook;
const HOOK_IMGS = [7, 4, 9, 1, 6, 3];
const MESSY = [
  {x: 330, y: 300, w: 250, h: 330, r: -8},
  {x: 1590, y: 285, w: 250, h: 330, r: 7},
  {x: 300, y: 795, w: 230, h: 300, r: 6},
  {x: 1630, y: 800, w: 230, h: 300, r: -6},
  {x: 770, y: 165, w: 190, h: 250, r: 10},
  {x: 1190, y: 925, w: 190, h: 250, r: -9},
];
const NEAT = MESSY.map((_, i) => ({x: 960 + (i - 2.5) * 186, y: 868, w: 160, h: 210, r: 0}));

const Hook: React.FC<{t: number}> = ({t}) => {
  const exit = easeIn((t - H.exit) / 0.14);
  const cam = pushed({...REST, s: 1 + exit * 0.06}, t, 0);
  return (
    <Stage cam={cam} t={t} glow={0}>
      {HOOK_IMGS.map((img, i) => {
        const at = H.cards[i];
        if (t < at) return null;
        const k = arrive(t, at, 0.2);
        const snap = land(t, H.snap + i * 0.04, 0.42, 0.18);
        const a = MESSY[i];
        const b = NEAT[i];
        const fl = float(t, i, 1 - snap);
        const x = lerp(a.x, b.x, snap) + fl.x;
        const y = lerp(a.y, b.y, snap) + fl.y + (1 - k) * 60;
        const w = lerp(a.w, b.w, snap);
        const h = lerp(a.h, b.h, snap);
        const r = lerp(a.r, b.r, snap) + (1 - k) * (i % 2 ? 22 : -22);
        const dim = 1 - 0.6 * arrive(t, H.dim, 0.14);
        const sc = 1.35 - 0.35 * k;
        return (
          <div key={i} style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: 18, overflow: 'hidden', boxShadow: '0 24px 60px rgba(80,40,30,0.16)', transform: `rotate(${r}deg) scale(${sc})`, opacity: Math.min(1, k * 1.7) * dim * (1 - exit), filter: k < 0.97 ? `blur(${(1 - k) * 14}px)` : undefined}}>
            <AdImage n={img} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
        );
      })}
      <Line t={t} words={H.line1 as [string, number][]} out={H.line1Out} />
      {t >= (H.line2[0][1] as number) && <Line t={t} words={H.line2 as [string, number][]} out={H.exit} />}
    </Stage>
  );
};

// ---------- 3.0 – 8.25  "You can now [Ask AI]" → the chat slides in beside it → the product fades in around them ----------
// One continuous shot in app space: the big button IS the app's Ask AI button, filmed close.
const IN = cues.intro;
const Z0 = 3.4; // close on the button: 104 x 40 app px → ~297 x 114 on screen
const ASK = (() => {
  const b = askBtn(1);
  return {app: b, c: appToStage(b.x + b.w / 2, b.y + b.h / 2), left: appToStage(b.x, 0).x};
})();
const TEXT_W = 780; // "You can now" at 140px, screen px (measured on a still)
const GAP_PX = 34;
const INTRO_C0: StageCam = (() => {
  const btnW = ASK.app.w * WIN_S * Z0;
  const comp = TEXT_W + GAP_PX + btnW; // composition width on screen
  const btnScreenX = 960 + comp / 2 - btnW / 2;
  return {x: ASK.c.x - (btnScreenX - 960) / Z0, y: ASK.c.y, s: Z0};
})();
const TEXT2_W = 760; // "in Creatives." at 140px, screen px
const INTRO_C0B: StageCam = (() => {
  const btnW = ASK.app.w * WIN_S * Z0;
  const comp = btnW + GAP_PX + TEXT2_W;
  const btnScreenX = 960 - comp / 2 + btnW / 2;
  return {x: ASK.c.x - (btnScreenX - 960) / Z0, y: ASK.c.y, s: Z0};
})();
const INTRO_C1: StageCam = (() => {
  const l = appToStage(ASK.app.x, 0).x;
  const r = appToStage(PANEL.x + PANEL.w, 0).x;
  const top = appToStage(0, PANEL.y).y;
  const s = 1.5;
  return {x: (l + r) / 2, y: top + (540 - 110) / s, s};
})();

/** Fixed window frame (same place as ProductWindow) whose surface and shadow can fade in. */
const FadeWindow: React.FC<{surface: number; children: React.ReactNode}> = ({surface, children}) => (
  <div style={{position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 26 * WIN_S, overflow: 'hidden', boxShadow: `0 0 0 1px rgba(11,21,43,${0.06 * surface}), 0 40px 100px rgba(80,40,30,${0.18 * surface})`}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 2000, height: 1125, transform: `scale(${WIN_S})`, transformOrigin: '0 0'}}>{children}</div>
  </div>
);

const Intro: React.FC<{t: number}> = ({t}) => {
  const start = scenes.intro[0];
  const m1 = glide(t, IN.move1[0], IN.move1[1]);
  const m2 = glide(t, IN.move2[0], IN.move2[1]);
  const pan = glide(t, IN.pan[0], IN.pan[1]);
  const c0 = pushed(camLerp(INTRO_C0, INTRO_C0B, pan), t, start, 0.0012);
  const cam = pushed(camLerp(camLerp(c0, INTRO_C1, m1), REST, m2), t, IN.move2[0] + IN.move2[1], 0.0012);
  const bk = arrive(t, IN.btn, 0.16);
  const press = pressAt(t, IN.press);
  const textOut = glide(t, IN.textOut[0], IN.textOut[1]);
  const pk = glide(t, IN.panel[0], IN.panel[1]);
  const face = glide(t, IN.iface[0], IN.iface[1]);
  // type in stage space, sized so it reads at 140 / 50 px in the close shot
  const fs = 140 / Z0;
  const textRight = ASK.left - GAP_PX / Z0;
  const text2Left = appToStage(ASK.app.x + ASK.app.w, 0).x + GAP_PX / Z0;
  const btnTarget = {x: ASK.c.x + 6 / Z0, y: ASK.c.y + 8 / Z0};
  const cur = cursorAt(t, [{t: IN.cursor[0], x: btnTarget.x + 420 / Z0, y: btnTarget.y + 330 / Z0}, {t: IN.cursor[1], x: btnTarget.x, y: btnTarget.y}], 0.5);
  const sc = stageToScreen(cam, cur.x, cur.y);
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} glow={0}>
        <FadeWindow surface={face}>
          <div style={{position: 'absolute', inset: 0, opacity: face, filter: face < 0.98 ? `blur(${(1 - face) * 6}px)` : undefined}}>
            <AppBg />
            <Sidebar />
            <TopBar open={1} sort="Spend" part="rest" />
            {INITIAL.map((img, slot) => {
              const s = slotXY(slot, 1);
              return <Card key={img} ad={ADS[img]} w={s.w} style={{left: s.x, top: s.y}} />;
            })}
          </div>
          <div style={{position: 'absolute', inset: 0, opacity: Math.min(1, bk * 1.8), transform: `translateY(${(1 - bk) * 30}px)`, filter: bk < 0.97 ? `blur(${(1 - bk) * 4}px)` : undefined}}>
            <TopBar open={1} sort="Spend" part="ask" press={press} />
          </div>
          {pk > 0 && (
            <div style={{position: 'absolute', inset: 0, opacity: pk, filter: pk < 0.98 ? `blur(${(1 - pk) * 5}px)` : undefined}}>
              <Panel slide={1 - (1 - pk) * 0.2}>
                <Rise k={arrive(t, IN.panel[0] + 0.4, 0.18)}><div style={{fontSize: 18, color: A.text3, marginBottom: 18}}>Ask anything about your ads.</div></Rise>
                {['Best hooks this week', 'Which ads are fatiguing?', 'Compare Meta and TikTok'].map((q, i) => (
                  <Rise key={q} k={arrive(t, IN.panel[0] + 0.5 + i * 0.06, 0.2)} style={{marginBottom: 10}}>
                    <div style={{display: 'inline-flex', height: 38, alignItems: 'center', padding: '0 14px', borderRadius: 11, border: `1px solid ${A.line}`, background: '#fff', fontSize: 15.5, color: A.text2}}>{q}</div>
                  </Rise>
                ))}
              </Panel>
            </div>
          )}
        </FadeWindow>
        {/* the line and its supporting line, outside the window, in stage space */}
        <div style={{position: 'absolute', left: textRight - 1200, width: 1200, top: ASK.c.y, height: 0, opacity: 1 - textOut}}>
          <LineAt t={t} words={IN.words as [string, number][]} size={fs} align="right" />
        </div>
        <div style={{position: 'absolute', left: text2Left, width: 1200, top: ASK.c.y, height: 0, opacity: 1 - textOut}}>
          <LineAt t={t} words={IN.words2 as [string, number][]} size={fs} align="left" />
        </div>
      </Stage>
      {t >= IN.cursor[0] && <Cursor x={sc.x} y={sc.y} press={press} opacity={Math.min(1, (t - IN.cursor[0]) * 8) * (1 - glide(t, IN.press + 0.25, 0.3))} size={48} />}
    </AbsoluteFill>
  );
};

/** Line of film type anchored at a point (left/right/centre), words sharpening in on their times. */
const LineAt: React.FC<{t: number; words: [string, number][]; size: number; align: 'left' | 'right' | 'center'}> = ({t, words, size, align}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 0, transform: 'translateY(-50%)', textAlign: align, fontFamily: display, fontWeight: 500, fontSize: size, letterSpacing: '-0.04em', lineHeight: 1.1, color: INK, whiteSpace: 'pre'}}>
    {words.map(([w, at], i) => {
      const sp = i < words.length - 1 ? ' ' : '';
      if (t < at) return <span key={i} style={{visibility: 'hidden'}}>{w + sp}</span>;
      const k = arrive(t, at, 0.2);
      const b = Math.max(0, 1 - k * 1.3);
      return <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', opacity: Math.min(1, k * 1.8), filter: b > 0.01 ? `blur(${(b * 10 * size) / 140}px)` : undefined, transform: `translateY(${(b * 18 * size) / 140}px)`}}>{w + sp}</span>;
    })}
  </div>
);

// ---------- title on white (words sharpen in; typing only happens in the prompt fields) ----------
const Title: React.FC<{t: number; scene: 'title1' | 'title2' | 'title3'}> = ({t, scene}) => {
  const [s0, s1] = scenes[scene];
  const c = (cues.titles as unknown as Record<string, {words: [string, number][]}>)[scene];
  const cam = pushed(REST, t, s0, 0.0016);
  return (
    <Stage cam={cam} t={t} glow={0}>
      <Line t={t} words={c.words.map(([w, at]) => [w, s0 + at] as [string, number])} out={s1 - 0.2} outDur={0.2} />
    </Stage>
  );
};

// ---------- prompt on white ----------
type PromptCfg = {text: string; type: number[]; send: number; exit: number};
const BOX = {w: 1180, x: 960, y: 540};
const THUMB = 84;
const thumbCentre = (i: number, h: number) => ({x: BOX.x - BOX.w / 2 + 44 + THUMB / 2 + i * (THUMB + 14), y: BOX.y - h / 2 + 40 + THUMB / 2});
const PROMPT3_H = 300;

const Prompt: React.FC<{t: number; scene: 'prompt1' | 'prompt2' | 'prompt3'}> = ({t, scene}) => {
  const start = scenes[scene][0];
  const c = (cues.prompts as Record<string, PromptCfg>)[scene];
  const lt = t - start;
  const thumbs = scene === 'prompt3';
  const h = thumbs ? PROMPT3_H : 220;
  const k = thumbs ? 1 : arrive(lt, 0, 0.24);
  const ex = easeIn((lt - c.exit) / (scenes[scene][1] - start - c.exit));
  const times = keyTimes(c.text, c.type[0], c.type[1]);
  const n = times.filter((x) => lt >= x).length;
  const typing = n > 0 && lt < c.send;
  const press = pressAt(lt, c.send);
  const cam = pushed(REST, t, start, 0.0018);
  return (
    <Stage cam={cam} t={t} glow={0}>
      <div style={{position: 'absolute', left: BOX.x - BOX.w / 2, top: BOX.y - h / 2, width: BOX.w, height: h, borderRadius: 36, background: '#fff', boxShadow: '0 0 0 1px rgba(11,21,43,0.07), 0 30px 80px rgba(80,40,30,0.14)', opacity: Math.min(1, k * 1.6) * (1 - ex), transform: `translateY(${(1 - k) * 40 - ex * 90}px) scale(${(0.93 + 0.07 * k) * (1 - 0.08 * ex)})`, filter: k < 0.97 || ex > 0 ? `blur(${(1 - k) * 12 + ex * 10}px)` : undefined, fontFamily: ui}}>
        {thumbs && (
          <div style={{position: 'absolute', left: 44 + 3 * (THUMB + 14) + 6, top: 40, height: THUMB, display: 'flex', alignItems: 'center', fontSize: 26, color: A.text3, opacity: arrive(lt, 0.08, 0.2)}}>3 selected</div>
        )}
        <div style={{position: 'absolute', left: 46, right: 140, top: thumbs ? 158 : 50, fontSize: 50, letterSpacing: '-0.01em', color: n ? A.ink : A.text4, whiteSpace: 'nowrap'}}>
          {n ? c.text.slice(0, n) : 'Ask about your ads...'}
          {typing && <span style={{display: 'inline-block', width: 3, height: 52, background: A.ink, marginLeft: 3, verticalAlign: -8}} />}
        </div>
        <div style={{position: 'absolute', right: 30, bottom: 30, width: 76, height: 76, borderRadius: 38, background: n ? A.ink : '#E7E2DE', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 - 0.12 * press})`}}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
        </div>
      </div>
      {thumbs &&
        PICKED.map((img, i) => {
          const p = thumbCentre(i, h);
          return (
            <div key={img} style={{position: 'absolute', left: p.x - THUMB / 2, top: p.y - THUMB / 2 - ex * 90, width: THUMB, height: THUMB, borderRadius: 16, overflow: 'hidden', opacity: 1 - ex, boxShadow: '0 0 0 1px rgba(11,21,43,0.06)'}}>
              <AdImage n={img} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
          );
        })}
    </Stage>
  );
};

// ---------- product beats ----------
const P1 = cues.p1;
const ansLine = (t: number, at: number, node: React.ReactNode, mb = 10) => <Rise k={arrive(t, at, 0.24)} style={{marginBottom: mb}}>{node}</Rise>;

const P1Scene: React.FC<{t: number}> = ({t}) => {
  const start = scenes.p1[0];
  const cam = pushed(camLerp(CLOSE, REST, glide(t, P1.pull[0], P1.pull[1])), t, start, 0.0016);
  const sorted = t >= P1.out;
  const cards: GridCard[] = [];
  if (!sorted) INITIAL.forEach((img, slot) => cards.push({img, slot}));
  else {
    INITIAL.filter((img) => !SORTED.includes(img)).forEach((img, j) => {
      const k = glide(t, P1.out + j * 0.04, 0.35);
      if (k < 1) cards.push({img, slot: INITIAL.indexOf(img), opacity: 1 - k, scale: 1 - 0.1 * k});
    });
    SORTED.forEach((img, ns) => {
      const os = INITIAL.indexOf(img);
      const to = slotXY(ns, 1);
      const from = os >= 0 ? slotXY(os, 1) : {...to, y: 1240 + (ns - 4) * 60};
      const k = glide(t, P1.move + ns * 0.06, 0.7);
      cards.push({img, slot: ns, x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k), ring: ns === 0 ? glide(t, P1.ring, 0.6) : 0, hookHi: arrive(t, P1.move + 0.6 + ns * 0.06, 0.2)});
    });
  }
  return (
    <Stage cam={cam} t={t} glow={0}>
      <ProductWindow>
        <Screen
          open={1}
          sort={sorted ? 'Hook rate' : 'Spend'}
          cards={cards}
          chips={sorted ? arrive(t, P1.chips, 0.24) : 0}
          panel={
            <>
              <Bubble k={arrive(t, P1.bubble, 0.26)} text={cues.prompts.prompt1.text} />
              {ansLine(t, P1.ans[0], <UsedMemory />, 4)}
              {ansLine(t, P1.ans[1], <div style={{fontSize: 20, fontWeight: 600}}>Format is video</div>)}
              {ansLine(t, P1.ans[2], <div style={{fontSize: 18.5, color: A.text2}}>Sorted by hook rate, highest first</div>, 14)}
              {ansLine(t, P1.ans[3], <div style={{fontSize: 15.5, color: A.text3}}>6 ads match.</div>)}
            </>
          }
        />
      </ProductWindow>
    </Stage>
  );
};

const P2 = cues.p2;
const FATIGUE_ORDER = [...FATIGUED, ...SORTED.filter((img) => !FATIGUED.includes(img))];
const P2Scene: React.FC<{t: number}> = ({t}) => {
  const start = scenes.p2[0];
  const cam = pushed(camLerp(CLOSE, REST, glide(t, P2.pull[0], P2.pull[1])), t, start, 0.0016);
  const sorted = t >= P2.move;
  const cards: GridCard[] = FATIGUE_ORDER.map((img, ns) => {
    const os = SORTED.indexOf(img);
    const f = FATIGUED.indexOf(img);
    const from = slotXY(os, 1);
    const to = slotXY(ns, 1);
    const k = glide(t, P2.move + ns * 0.06, 0.7);
    return {img, slot: ns, x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k), hookHi: 1, veil: f < 0 ? arrive(t, P2.veil + 0.2 + ns * 0.035, 0.16) * 1 : 0, tag: f >= 0 ? arrive(t, P2.tags[f], 0.28) : 0};
  });
  return (
    <Stage cam={cam} t={t} glow={0}>
      <ProductWindow>
        <Screen
          open={1}
          sort={sorted ? 'Fatigue' : 'Hook rate'}
          cards={cards}
          chips={1}
          panel={
            <>
              <Bubble k={arrive(t, P2.bubble, 0.26)} text={cues.prompts.prompt2.text} />
              {ansLine(t, P2.ans[0], <UsedMemory />, 4)}
              {ansLine(t, P2.ans[1], <div style={{fontSize: 20, fontWeight: 600}}>2 ads are fatiguing</div>)}
              {ansLine(t, P2.ans[2], <div style={{fontSize: 18.5, color: A.text2, lineHeight: 1.4}}>Hook rate down 38% in 7 days. Sorted to the top so you can refresh them first.</div>)}
            </>
          }
        />
      </ProductWindow>
    </Stage>
  );
};

// ---------- 13.5 – 15.0  pick three, on white ----------
const PK = cues.pick;
const ISO = {w: 330, h: 500, img: 370, y: 540};
const isoX = (i: number) => 960 + (i - 1) * 400;
const PickScene: React.FC<{t: number}> = ({t}) => {
  const start = scenes.pick[0];
  const cam = pushed(REST, t, start, 0.0018);
  const ex = easeIn((t - PK.exit) / (scenes.pick[1] - PK.exit));
  const checkPos = (i: number) => ({x: isoX(i) - ISO.w / 2 + 36, y: ISO.y - ISO.h / 2 + 36});
  const cur = cursorAt(t, [{t: PK.cursor, x: 1560, y: 1020}, ...PK.clicks.map((c, i) => ({t: c - 0.03, x: checkPos(i).x + 4, y: checkPos(i).y + 6}))], 0.27);
  const press = Math.max(...PK.clicks.map((c) => pressAt(t, c)));
  const screenCur = stageToScreen(cam, cur.x, cur.y);
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} glow={0}>
        {PICKED.map((img, i) => {
          const k = arrive(t, PK.cards[i], 0.2);
          const ad = ADS[img];
          const ck = t >= PK.clicks[i] ? arrive(t, PK.clicks[i], 0.3) : 0;
          // exit: the image flies into its thumbnail slot in the next prompt box
          const to = thumbCentre(i, PROMPT3_H);
          const cx = lerp(isoX(i), to.x, ex);
          const cy = lerp(ISO.y, to.y + (ISO.h - ISO.img) / 2 * (1 - ex) * 0, ex);
          const sc = lerp(1, THUMB / ISO.w, ex);
          return (
            <div key={img} style={{position: 'absolute', left: cx - ISO.w / 2, top: cy - ISO.h / 2, width: ISO.w, height: ISO.h, borderRadius: 26, background: `rgba(255,255,255,${1 - ex})`, boxShadow: `0 0 0 1px rgba(11,21,43,${0.06 * (1 - ex)}), 0 26px 70px rgba(80,40,30,${0.14 * (1 - ex)})`, overflow: 'hidden', opacity: Math.min(1, k * 1.7), transform: `translateY(${(1 - k) * 50}px) scale(${(0.86 + 0.14 * k) * sc})`, filter: k < 0.97 ? `blur(${(1 - k) * 12}px)` : undefined}}>
              <div style={{position: 'absolute', left: 0, top: 0, width: ISO.w, height: lerp(ISO.img, ISO.h, ex), overflow: 'hidden', borderRadius: ex > 0 ? 26 : 0}}>
                <AdImage n={img} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              </div>
              <div style={{position: 'absolute', left: 26, top: ISO.img + 18, opacity: 1 - ex * 3, fontFamily: ui}}>
                <div style={{fontFamily: display, fontWeight: 500, fontSize: 60, letterSpacing: '-0.04em', color: INK, lineHeight: 1}}>{ad.hook!.toFixed(1)}%</div>
                <div style={{fontSize: 20, color: A.text3, marginTop: 8}}>Hook rate</div>
              </div>
              <div style={{position: 'absolute', left: 20, top: 20, width: 44, height: 44, borderRadius: 12, background: ck > 0 ? A.ink : 'rgba(255,255,255,0.92)', border: ck > 0 ? 'none' : '2px solid rgba(28,25,23,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.22 * Math.sin(Math.PI * ck)})`, opacity: 1 - ex * 3}}>
                {ck > 0 && <Check size={28} color="#fff" strokeWidth={3} />}
              </div>
            </div>
          );
        })}
      </Stage>
      {t >= PK.cursor && <Cursor x={screenCur.x} y={screenCur.y} press={press} opacity={(1 - ex * 3) * Math.min(1, (t - PK.cursor) * 12)} size={46} />}
    </AbsoluteFill>
  );
};

// ---------- 16.5 – 19.5  the board builds ----------
const P3 = cues.p3;
const SHARE = {x: 1984 - 32 - 130, y: 70 + 34, w: 130, h: 48};
const P3Scene: React.FC<{t: number}> = ({t}) => {
  const start = scenes.p3[0];
  const cam = pushed(camLerp(CLOSE, REST, glide(t, P3.pull[0], P3.pull[1])), t, start, 0.0014);
  const gridOut = glide(t, P3.gridOut, 0.3);
  const shut = glide(t, P3.close[0], P3.close[1]);
  const open = 1 - shut;
  const bk = arrive(t, P3.board, 0.2);
  const ready = t >= P3.ready;
  const cards: GridCard[] = SORTED.map((img, slot) => ({img, slot, hookHi: 1, check: PICKED.includes(img) ? 1 : 0}));
  const shareC = {x: SHARE.x + SHARE.w / 2, y: SHARE.y + SHARE.h / 2};
  const cur = cursorAt(t, [{t: P3.cursor[0], x: 1400, y: 780}, {t: P3.cursor[1], x: shareC.x + 8, y: shareC.y + 6}], 0.5);
  const sc = appToScreen(cam, cur.x, cur.y);
  const press = pressAt(t, P3.share);
  const toast = arrive(t, P3.toast, 0.24);
  const colW = (1668 - 64 - 48) / 3;
  return (
    <AbsoluteFill>
      <Stage cam={cam} t={t} glow={0}>
        <ProductWindow>
          <Screen
            open={open}
            sort="Hook rate"
            count={3}
            cards={cards}
            chips={1 - gridOut}
            gridOpacity={1 - gridOut}
            board={
              t >= P3.board && (
                <BoardShell k={bk} open={open}>
                  <div style={{position: 'absolute', left: 32, top: 26, fontSize: 15, color: A.text3}}>Studio · Board</div>
                  <div style={{position: 'absolute', left: 32, top: 50, fontFamily: display, fontWeight: 600, fontSize: 36, letterSpacing: '-0.02em'}}>Top video hooks</div>
                  <div style={{position: 'absolute', left: 32, top: 98, fontSize: 16, color: A.text3}}>Vitalé · Oct 14 - 21, 2026</div>
                  <div style={{position: 'absolute', left: SHARE.x - 316 - (1984 - 1595) * open, top: SHARE.y - 70, width: SHARE.w, height: SHARE.h, borderRadius: 12, background: A.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, fontSize: 17, fontWeight: 600, transform: `scale(${1 - 0.08 * press})`}}>
                    <Link2 size={18} strokeWidth={2.2} />Share
                  </div>
                  {PICKED.map((img, i) => {
                    const ck = arrive(t, P3.cols[i], 0.22);
                    const cv = land(t, P3.curves[0] + i * 0.07, P3.curves[1], 0.12);
                    const ad = ADS[img];
                    return (
                      <div key={img} style={{position: 'absolute', left: 32 + i * (colW + 24), top: 150, width: colW, height: 800, borderRadius: 18, border: `1px solid ${A.line}`, overflow: 'hidden', opacity: Math.min(1, ck * 1.6), transform: `translateY(${(1 - ck) * 40}px)`}}>
                        <div style={{height: 400, overflow: 'hidden'}}><AdImage n={img} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>
                        <div style={{padding: '18px 22px'}}>
                          <div style={{fontSize: 17, fontWeight: 600}}>{ad.title}</div>
                          <div style={{fontSize: 15, color: A.text3, marginTop: 18}}>Hook rate</div>
                          <div style={{fontFamily: display, fontWeight: 600, fontSize: 52, letterSpacing: '-0.03em', marginTop: 2}}>{(ad.hook! * Math.min(1, cv * 1.15)).toFixed(1)}%</div>
                          <div style={{fontSize: 15, color: A.text3, marginTop: 18, marginBottom: 12}}>Where viewers drop off</div>
                          <Curve data={RETENTION[i]} w={colW - 44} h={160} k={cv} id={`c${i}`} />
                        </div>
                      </div>
                    );
                  })}
                  {toast > 0 && (
                    <div style={{position: 'absolute', right: 32, top: 92, height: 40, borderRadius: 20, background: A.ink, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', fontSize: 15.5, fontWeight: 500, opacity: Math.min(1, toast * 1.6), transform: `translateY(${(1 - toast) * 12}px)`}}>
                      <Check size={16} strokeWidth={2.6} />Link copied
                    </div>
                  )}
                </BoardShell>
              )
            }
            panel={
              <>
                <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16}}>
                  {PICKED.map((img) => (
                    <div key={img} style={{width: 40, height: 40, borderRadius: 9, overflow: 'hidden'}}><AdImage n={img} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>
                  ))}
                  <span style={{fontSize: 15.5, color: A.text3, marginLeft: 4}}>3 selected</span>
                </div>
                <Bubble k={arrive(t, P3.bubble, 0.26)} text={cues.prompts.prompt3.text} />
                {!ready && t >= P3.building && ansLine(t, P3.building, <Shimmer t={t} text="Building your board..." />)}
                {ready && (
                  <>
                    {ansLine(t, P3.ready, <div style={{fontSize: 20, fontWeight: 600}}>Board ready</div>)}
                    {ansLine(t, P3.ready + 0.06, (
                      <div style={{display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${A.line}`, borderRadius: 14, padding: '12px 14px', background: '#fff'}}>
                        <div style={{width: 38, height: 38, borderRadius: 9, background: '#F3EEEA', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Link2 size={18} color={A.text2} /></div>
                        <div><div style={{fontSize: 16.5, fontWeight: 600}}>Top video hooks</div><div style={{fontSize: 14, color: A.text3}}>Studio · 3 ads</div></div>
                      </div>
                    ))}
                  </>
                )}
              </>
            }
          />
        </ProductWindow>
      </Stage>
      {t >= P3.cursor[0] && <Cursor x={sc.x} y={sc.y} press={press} opacity={Math.min(1, (t - P3.cursor[0]) * 10)} size={40} />}
    </AbsoluteFill>
  );
};

const Shimmer: React.FC<{t: number; text: string}> = ({t, text}) => (
  <div style={{fontSize: 18.5, display: 'flex'}}>
    {text.split('').map((ch, i) => {
      const w = 0.5 + 0.5 * Math.sin(t * 9 - i * 0.35);
      return <span key={i} style={{color: `rgba(28,25,23,${0.3 + 0.55 * w})`, whiteSpace: 'pre'}}>{ch}</span>;
    })}
  </div>
);

// ---------- 19.5 – 22.5  payoff ----------
const PO = cues.payoff;
const GRAD = ['#e0609a', '#ec4e38', '#ef7d2a'];
const hexMix = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(',')})`;
};
const gradAt = (u: number) => (u < 0.5 ? hexMix(GRAD[0], GRAD[1], u * 2) : hexMix(GRAD[1], GRAD[2], (u - 0.5) * 2));

// The payoff line is SVG so the letters stay vector-crisp at any zoom. "Creatives." is a window
// onto the brand gradient (the hero waves texture), fixed in screen space; the camera flies into
// the stem of its "t", and once inside, the gradient fills the frame and becomes the end card.
const PLATE = staticFile('brand/brand-gradient.jpg');
// The same texture, deepened, so the word reads on white; it eases back to the plate as we enter the letter.
const PLATE_RICH = staticFile('brand/brand-gradient-rich.jpg');
const Plate: React.FC<{t: number; from: number}> = ({t, from}) => (
  <AbsoluteFill>
    <Img src={PLATE} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${holdPush(t, from, 0.0012)})`}} />
  </AbsoluteFill>
);
const FS = 140;
const PLATE_START = 1.9;
const LINE_Y = 510;
const GSC = FS / GLYPHS.upm;
const LS = -0.04 * FS;
type Glyph = {d: string; adv: number};
type Laid = {x: number; ch: string}[];
type Metrics = {words: Laid[]; base: number; stem: {x: number; y: number; w: number}};
const layWord = (w: string, x0: number): {glyphs: Laid; end: number} => {
  const glyphs: Laid = [];
  let x = x0;
  for (let i = 0; i < w.length; i++) {
    const ch = w[i];
    glyphs.push({x, ch});
    const g = (GLYPHS.glyphs as Record<string, Glyph>)[ch];
    const kern = i + 1 < w.length ? ((GLYPHS.kern as Record<string, number>)[ch + w[i + 1]] ?? 0) : 0;
    x += (g.adv + kern) * GSC + LS;
  }
  return {glyphs, end: x};
};
let STEM_CACHE: {sx: number; sw: number} | null = null;
const stemOfT = () => {
  if (STEM_CACHE) return STEM_CACHE;
  // rasterise the "t" outline and take its densest columns as the stem
  const g = (GLYPHS.glyphs as Record<string, Glyph>).t;
  const W = Math.ceil(g.adv * GSC) + 8;
  const H = Math.ceil(FS * 1.2);
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d')!;
  ctx.translate(4, FS);
  ctx.scale(GSC, -GSC);
  ctx.fill(new Path2D(g.d));
  const data = ctx.getImageData(0, 0, W, H).data;
  const counts = Array.from({length: W}, (_, cx) => {
    let n = 0;
    for (let y = 0; y < H; y++) n += data[(y * W + cx) * 4 + 3] > 128 ? 1 : 0;
    return n;
  });
  const max = Math.max(...counts);
  const cols = counts.map((n, i) => (n > max * 0.75 ? i : -1)).filter((i) => i >= 0);
  STEM_CACHE = {sx: (cols[0] + cols[cols.length - 1]) / 2 - 4, sw: cols[cols.length - 1] - cols[0] + 1};
  return STEM_CACHE;
};
const measure = (words: string[]): Metrics => {
  const space = (GLYPHS.glyphs as Record<string, Glyph>)[' '].adv * GSC + LS;
  const widths = words.map((w) => layWord(w, 0).end - LS);
  const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
  let x = 960 - total / 2;
  const laid = words.map((w, i) => {
    const l = layWord(w, x);
    x += widths[i] + space;
    return l.glyphs;
  });
  const base = LINE_Y + (GLYPHS.capHeight * GSC) / 2;
  const last = laid[laid.length - 1];
  const tg = last.find((g) => g.ch === 't')!;
  const st = stemOfT();
  return {words: laid, base, stem: {x: tg.x + st.sx, y: base - FS * 0.24, w: st.sw}};
};
const WordPath: React.FC<{glyphs: Laid; base: number; fill: string; opacity: number; dy: number; filter?: string}> = ({glyphs, base, fill, opacity, dy, filter}) => (
  <g fill={fill} fillOpacity={opacity} filter={filter}>
    {glyphs.map((g, i) => (
      <path key={i} d={(GLYPHS.glyphs as Record<string, Glyph>)[g.ch].d} transform={`translate(${g.x} ${base + dy}) scale(${GSC} ${-GSC})`} />
    ))}
  </g>
);

const Payoff: React.FC<{t: number}> = ({t}) => {
  const start = scenes.payoff[0];
  const words = PO.words.map(([w]) => w as string);
  const m = measure(words);
  const hp = holdPush(t, start, 0.0016);
  const u = clamp01((t - PO.zoom[0]) / PO.zoom[1]);
  // Accelerate all the way in (log space): slow enough at first to read the letters, then fast,
  // so the edges of the "t" are gone in a blink and you never register being inside a letter.
  const E = (x: number) => Math.pow(clamp01(x), 2.4);
  const e = E(u);
  const de = (E(u + 0.01) - E(u - 0.01)) / (0.02 * PO.zoom[1]); // de/dt
  const sEnd = (2.6 * 1920) / m.stem.w; // stem wider than 2.4x the frame: covers it from the t's own position
  const s = Math.exp(Math.log(sEnd) * e);
  const T = m.stem;
  const t0 = {x: 960 + (T.x - 960) * hp, y: 540 + (T.y - 540) * hp};
  const P = t0; // straight in: the camera scales about the "t" where it sits, no sideways drift
  const k = hp * s;
  const tf = `translate(${P.x - T.x * k} ${P.y - T.y * k}) scale(${k})`;
  const cam: StageCam = {x: T.x - (P.x - 960) / k, y: T.y - (P.y - 540) / k, s: k};
  // The gradient rides along with the letters (slower than the camera), so it reads as one surface.
  // Like looking through a window as you walk up to it: the view behind opens up (zooms out).
  const ps = hp * lerp(PLATE_START, 1, Math.pow(clamp01(u), 1.3));
  // Speed blur on the letters: grows with how fast the zoom is moving.
  const lnS = Math.log((2.6 * 1920) / m.stem.w);
  const speed = de * lnS; // d(ln scale)/dt
  const mb = Math.min(36, Math.max(0, speed - 1.2) * 2.6);
  // Depth of field: the view behind the letters starts soft and sharpens as more of it opens up.
  const sm = (a: number, b: number, x: number) => {
    const k = clamp01((x - a) / (b - a));
    return k * k * (3 - 2 * k);
  };
  const pb = 26 * (1 - sm(0.5, 0.97, u));
  const ptf = `translate(${P.x - T.x * ps} ${P.y - T.y * ps}) scale(${ps})`;
  return (
    <AbsoluteFill style={{background: '#fff'}}>
      <Stage cam={cam} t={t} glow={0}>{null}</Stage>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <defs>
          {PO.words.map(([, at], i) => {
            const kk = arrive(t, at as number, 0.22);
            const b = Math.max(0, 1 - kk * 1.3);
            return (
              <filter key={i} id={`pw${i}`} x="-20%" y="-50%" width="140%" height="200%">
                <feGaussianBlur stdDeviation={b * 10} />
              </filter>
            );
          })}
          <filter id="plate-blur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation={pb} edgeMode="duplicate" />
          </filter>
          <filter id="speed-blur" x="-50%" y="-50%" width="200%" height="200%" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation={mb} />
          </filter>
          <mask id="cr-mask" maskUnits="userSpaceOnUse" x={0} y={0} width={1920} height={1080}>
            <rect width={1920} height={1080} fill="#000" />
            <g filter={mb > 0.2 ? 'url(#speed-blur)' : undefined}><g transform={tf}>
              {(() => {
                const i = words.length - 1;
                const at = PO.words[i][1] as number;
                if (t < at) return null;
                const kk = arrive(t, at, 0.22);
                const b = Math.max(0, 1 - kk * 1.3);
                return <WordPath glyphs={m.words[i]} base={m.base} dy={b * 18} fill="#fff" opacity={Math.min(1, kk * 1.8)} filter={b > 0.01 ? `url(#pw${i})` : undefined} />;
              })()}
            </g></g>
          </mask>
        </defs>
        <g filter={mb > 0.2 ? 'url(#speed-blur)' : undefined}><g transform={tf}>
          {words.slice(0, -1).map((w, i) => {
            const at = PO.words[i][1] as number;
            if (t < at) return null;
            const kk = arrive(t, at, 0.22);
            const b = Math.max(0, 1 - kk * 1.3);
            return <WordPath key={i} glyphs={m.words[i]} base={m.base} dy={b * 18} fill={INK} opacity={Math.min(1, kk * 1.8)} filter={b > 0.01 ? `url(#pw${i})` : undefined} />;
          })}
        </g></g>
        <g mask="url(#cr-mask)">
          <g filter={pb > 0.2 ? 'url(#plate-blur)' : undefined}><g transform={ptf}>
            <image href={PLATE} x={0} y={0} width={1920} height={1080} preserveAspectRatio="xMidYMid slice" />
            <image href={PLATE_RICH} x={0} y={0} width={1920} height={1080} preserveAspectRatio="xMidYMid slice" opacity={1 - clamp01((e - 0.45) / 0.45)} />
          </g></g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- 22.5 – 25  logo ----------
const End: React.FC<{t: number}> = ({t}) => {
  const at = cues.end.logo;
  const a = arrive(t, at + 0.02, 0.2);
  const T = measure(PO.words.map(([w]) => w as string)).stem;
  const hpEnd = holdPush(at, scenes.payoff[0], 0.0016);
  const t0 = {x: 960 + (T.x - 960) * hpEnd, y: 540 + (T.y - 540) * hpEnd}; // where the payoff's zoom left the plate
  const ps = hpEnd * holdPush(t, at, 0.0012);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Img src={PLATE} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(${t0.x - T.x * ps}px, ${t0.y - T.y * ps}px) scale(${ps})`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 540, transform: `translateY(-50%) scale(${(0.95 + 0.05 * a) * holdPush(t, at, 0.0014)})`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30, opacity: a, filter: a < 0.99 ? `blur(${(1 - a) * 8}px)` : undefined}}>
        <Mark size={112} color="#fff" />
        <WordmarkLetters height={80} color="#fff" />
      </div>
    </AbsoluteFill>
  );
};

// ---------- film ----------
const REGISTRY: Record<SceneKey, React.FC<{t: number}>> = {
  hook: Hook,
  intro: Intro,
  title1: ({t}) => <Title t={t} scene="title1" />,
  title2: ({t}) => <Title t={t} scene="title2" />,
  title3: ({t}) => <Title t={t} scene="title3" />,
  prompt1: ({t}) => <Prompt t={t} scene="prompt1" />,
  p1: P1Scene,
  prompt2: ({t}) => <Prompt t={t} scene="prompt2" />,
  p2: P2Scene,
  pick: PickScene,
  prompt3: ({t}) => <Prompt t={t} scene="prompt3" />,
  p3: P3Scene,
  payoff: Payoff,
  end: End,
};

// Frame blending on fast moves (5 samples over a 180° shutter), never across a cut.
const SAMPLES = 5;
const SHUTTER = 0.5 / FPS;
const WINDOWS = cues.blend.windows as [number, number][];
const BARRIERS = Object.values(scenes).map((s) => s[0]).sort((a, b) => a - b);
const sampleTimes = (t: number): number[] => {
  const w = (WINDOWS as number[][]).find(([a, b]) => t >= a && t < b);
  if (!w) return [t];
  const mult = w[2] ?? 1;
  const n = mult > 1 ? 8 : SAMPLES;
  let floor = 0;
  for (const b of BARRIERS) if (b <= t + 1e-6) floor = b;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const x = t - (i * SHUTTER * mult) / (n - 1);
    if (x >= floor - 1e-6) out.push(x);
  }
  return out;
};

export const LaunchFilm: React.FC<{audio?: boolean}> = ({audio = true}) => {
  const t = useCurrentFrame() / FPS;
  const key = (Object.keys(scenes) as SceneKey[]).find((k) => t >= scenes[k][0] && t < scenes[k][1]) ?? 'end';
  const Scene = REGISTRY[key];
  return (
    <AbsoluteFill style={{background: '#fff'}}>
      {sampleTimes(t).map((x, i) => (
        <AbsoluteFill key={i} style={{opacity: 1 / (i + 1)}}>
          <Scene t={x} />
        </AbsoluteFill>
      ))}
      {audio && <Audio src={staticFile('audio/mix.wav')} />}
    </AbsoluteFill>
  );
};

export {Hairlines, Liquid};
