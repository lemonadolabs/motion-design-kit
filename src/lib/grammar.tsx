// Fonts and asset helpers shared by the film. Manrope = film type (always weight 500),
// Inter = product UI. Both load from Google Fonts at render time.
import {staticFile} from 'remotion';
import {loadFont as loadManrope} from '@remotion/google-fonts/Manrope';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';

export const display = loadManrope('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin']}).fontFamily;
export const ui = loadInter('normal', {weights: ['400', '500', '600'], subsets: ['latin']}).fontFamily;

/** Film ink (all film type) and the app's ink. */
export const C = {ink: '#0B152B', white: '#FFFFFF'};

export const pub = (p: string) => staticFile(p);
