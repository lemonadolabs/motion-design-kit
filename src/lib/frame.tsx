// The product frame: every product shot sits in this window on the white, lined stage,
// so it is clear we are inside the product (same design as the product montage before
// "faster."). A stage camera can still zoom into the window; the lines move with it.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Liquid} from './Liquid';
import {Hairlines} from './soft';
import {APP_H, APP_W} from './constants';

/** Window scale on the stage (app px -> stage px) and its placement. */
export const WIN_S = 0.84;
export const WIN = {w: APP_W * WIN_S, h: APP_H * WIN_S, x: 960 - (APP_W * WIN_S) / 2, y: 540 - (APP_H * WIN_S) / 2};
/** Where an app point lands on the stage. */
export const appToStage = (x: number, y: number) => ({x: WIN.x + x * WIN_S, y: WIN.y + y * WIN_S});

export type StageCam = {x: number; y: number; s: number};
export const STAGE_REST: StageCam = {x: 960, y: 540, s: 1};
/** Where a stage point lands on screen. */
export const stageToScreen = (cam: StageCam, x: number, y: number) => ({x: 960 + (x - cam.x) * cam.s, y: 540 + (y - cam.y) * cam.s});

/** The white stage with its lines, filmed by `cam` (stage point at screen centre, scale). */
export const Stage: React.FC<{cam?: StageCam; lines?: boolean; glow?: number; t: number; children: React.ReactNode}> = ({cam = STAGE_REST, lines = true, glow = 0.22, t, children}) => (
  <AbsoluteFill style={{background: '#FFFFFF', overflow: 'hidden'}}>
    {lines && <Hairlines cam={{s: cam.s, ox: 0, oy: 0, x: 960 - cam.x * cam.s, y: 540 - cam.y * cam.s}} />}
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(${960 - cam.x * cam.s}px, ${540 - cam.y * cam.s}px) scale(${cam.s})`}}>
      {glow > 0 && (
        <div style={{position: 'absolute', left: 960 - 800, top: 560 - 350, width: 1600, height: 700, filter: 'blur(70px)', opacity: glow}}>
          <Liquid t={t} w={1600} h={700} seed={3.3} zoom={0.5} />
        </div>
      )}
      {children}
    </div>
  </AbsoluteFill>
);

/** The product window: rounded, hairline edge, a soft shadow. Children are laid out in app space. */
export const ProductWindow: React.FC<{children: React.ReactNode; dx?: number; dy?: number; scale?: number; r?: number; opacity?: number; style?: React.CSSProperties}> = ({
  children,
  dx = 0,
  dy = 0,
  scale = 1,
  r = 0,
  opacity = 1,
  style,
}) => {
  const s = WIN_S * scale;
  const w = APP_W * s;
  const h = APP_H * s;
  return (
    <div style={{position: 'absolute', left: 960 - w / 2 + dx, top: 540 - h / 2 + dy, width: w, height: h, borderRadius: 26 * s, overflow: 'hidden', boxShadow: '0 0 0 1px rgba(11,21,43,0.06), 0 40px 100px rgba(80,40,30,0.18)', transform: r ? `rotate(${r}deg)` : undefined, opacity, ...style}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: APP_W, height: APP_H, transform: `scale(${s})`, transformOrigin: '0 0'}}>{children}</div>
    </div>
  );
};
