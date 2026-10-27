// Ask AI in Creatives, launch clip (25s, no voice). Music + sound design carry it; every cut sits
// on the track's beat grid. All times live in cues.json (picture and sound share it).
import cues from './cues.json';

export {cues};
export const FPS = 60;
export const W = 1920;
export const H = 1080;
export const TOTAL = Math.round(cues.duration * FPS);
export const scenes = cues.scenes as Record<keyof typeof cues.scenes, [number, number]>;
export type SceneKey = keyof typeof cues.scenes;
