// The soft world (8.1s onward): white, hairlines on thirds, long-tailed eases, a
// never-still float, and the logo mark filled with the liquid gradient.
import React from 'react';
import {getInputProps} from 'remotion';
import {MARK_RATIO} from './brand';
import {MARK_MOON, MARK_WEDGE} from './brandPaths';
import {Liquid} from './Liquid';

export const MASK = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 26 28.6'><path d='${MARK_MOON}'/><path d='${MARK_WEDGE}'/></svg>`,
)}")`;

// Long-tailed eases: fast start, slow settle.
export const expo = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
/** Arrive fast, land soft: covers 15% of the remaining distance per 30fps frame, never a dead stop. */
export const arrive = (t: number, start: number, rate = 0.15) => (t <= start ? 0 : 1 - Math.pow(1 - rate, (t - start) * 30));
/** Slow push-in for holds: ~0.25% per 30fps frame (compounding), from the start of the shot. */
export const holdPush = (t: number, start: number, rate = 0.0025) => Math.pow(1 + rate, Math.max(0, t - start) * 30);
/** A move that arrives fast and lands soft (~15% of the remaining distance per 30fps frame),
 * normalised so it reaches exactly 1 at `dur` (the last step is tiny, then the hold push takes over). */
export const land = (t: number, start: number, dur: number, rate = 0.15) => {
  if (t <= start) return 0;
  if (t >= start + dur) return 1;
  return (1 - Math.pow(1 - rate, (t - start) * 30)) / (1 - Math.pow(1 - rate, dur * 30));
};
export const quint = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2);

/** Subtle, never-still float: two incommensurate sines per axis. */
export const float = (t: number, k: number, amp = 1) => ({
  x: (Math.sin(t * 0.63 + k * 2.1) * 1.2 + Math.sin(t * 1.07 + k) * 0.6) * amp,
  y: (Math.sin(t * 0.91 + k * 1.3) * 2.4 + Math.sin(t * 0.47 + k * 0.7) * 1.2) * amp,
  r: Math.sin(t * 0.71 + k * 1.9) * 0.2 * amp,
});

// Hairlines on thirds: verticals at 640 / 1280, rules at 270 (dashed) / 810 at rest. They are a
// fixed grid in space: they never drift on their own, they only move when the camera does. A
// scene passes the same camera it applies to its content (`s` scale about `ox, oy`, then `x, y`
// offset), so the lines move exactly with what is on screen. The grid runs far past the frame
// so pullbacks never show its edges.
export const GRID = {x: [640, 1280], y: [270, 810]};
export type LineCam = {s?: number; x?: number; y?: number; ox?: number; oy?: number};

export const Hairlines: React.FC<{opacity?: number; cam?: LineCam}> = ({opacity = 1, cam = {}}) => {
  // Blog stills (`clean`) drop the stage grid so the UI sits on plain white.
  if ((getInputProps() as {clean?: boolean}).clean) return null;
  const {s = 1, x = 0, y = 0, ox = 960, oy = 540} = cam;
  const c = 'rgba(11,21,43,0.09)';
  const px = (X: number) => ox + (X - ox) * s + x;
  const py = (Y: number) => oy + (Y - oy) * s + y;
  const lines: React.ReactNode[] = [];
  for (let k = -6; k <= 8; k++) {
    const X = px(640 * k);
    if (X < -2 || X > 1922) continue;
    lines.push(<div key={`v${k}`} style={{position: 'absolute', left: Math.round(X), top: 0, width: 1, height: 1080, background: c}} />);
  }
  for (let k = -6; k <= 7; k++) {
    const Y = py(270 + 540 * k);
    if (Y < -2 || Y > 1082) continue;
    const dashed = k % 2 === 0;
    lines.push(
      <div
        key={`h${k}`}
        style={{position: 'absolute', left: 0, right: 0, top: Math.round(Y), height: 1, ...(dashed ? {backgroundImage: `linear-gradient(90deg, ${c} 50%, transparent 50%)`, backgroundSize: `${12 * s}px 1px`, backgroundPosition: `${(px(0) % (12 * s)).toFixed(2)}px 0`} : {background: c})}}
      />,
    );
  }
  return <div style={{position: 'absolute', inset: 0, opacity, overflow: 'hidden', pointerEvents: 'none'}}>{lines}</div>;
};

/** The logo mark (src/lib/brandPaths.ts) with the liquid gradient inside. `h` = height in px. */
export const LiquidMark: React.FC<{t: number; h: number; seed?: number}> = ({t, h, seed = 0.3}) => {
  const w = h * MARK_RATIO;
  return (
    <div style={{width: w, height: h, WebkitMaskImage: MASK, maskImage: MASK, WebkitMaskSize: '100% 100%', maskSize: '100% 100%'}}>
      <Liquid t={t} w={w} h={h} seed={seed} zoom={0.5} />
    </div>
  );
};
