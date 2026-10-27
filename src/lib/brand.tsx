import React from 'react';
import {MARK_MOON, MARK_WEDGE} from './brandPaths';
import {display} from './grammar';

export const MARK_RATIO = 26 / 28.6; // width / height

/** Your logo mark (placeholder shapes in brandPaths.ts). `shimmer` 0..1 sweeps a light band across it. */
export const Mark: React.FC<{
  size: number; // height in px
  color?: string;
  shimmer?: number;
  id?: string;
  style?: React.CSSProperties;
}> = ({size, color = '#0B152B', shimmer, id = 'mk', style}) => {
  const w = size * MARK_RATIO;
  const fill = shimmer === undefined ? color : `url(#${id}-sh)`;
  const x = -10 + shimmer! * 46;
  return (
    <svg width={w} height={size} viewBox="0 0 26 28.6" style={{display: 'block', overflow: 'visible', ...style}}>
      {shimmer !== undefined && (
        <defs>
          <linearGradient id={`${id}-sh`} gradientUnits="userSpaceOnUse" x1={x - 9} y1={-4} x2={x + 9} y2={30}>
            <stop offset="0" stopColor={color} stopOpacity={0.82} />
            <stop offset="0.5" stopColor={color} stopOpacity={1} />
            <stop offset="1" stopColor={color} stopOpacity={0.82} />
          </linearGradient>
        </defs>
      )}
      <path d={MARK_MOON} fill={fill} />
      <path d={MARK_WEDGE} fill={fill} />
    </svg>
  );
};

/** Your brand name, set in the display font. Change BRAND_NAME to your company. */
export const BRAND_NAME = 'Your brand';

export const WordmarkLetters: React.FC<{height: number; color?: string; shimmer?: number; id?: string}> = ({
  height,
  color = '#0B152B',
}) => (
  <div style={{fontFamily: display, fontWeight: 500, fontSize: height * 1.25, lineHeight: 1, letterSpacing: '-0.04em', color, whiteSpace: 'nowrap'}}>
    {BRAND_NAME}
  </div>
);
