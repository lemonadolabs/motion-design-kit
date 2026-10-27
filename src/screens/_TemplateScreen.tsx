// Start every new screen from this file. Copy it to src/screens/<Name>Screen.tsx and register a
// still for it in src/Root.tsx (2000 x 1125). Process: docs/REBUILD-UI.md.
//
// Rules: lay everything out in app space (the reference screenshot scaled to 2000 px wide) with
// absolute positions measured from the screenshot. Inter for UI type, the app's own colours
// (sample them with scripts/rebuild/colors.py, snap to your product's design tokens). Reuse the pieces in
// src/film/ui.tsx (AppBg, Sidebar, TopBar, Card, Panel, Bubble, Chip...) before writing new ones.
// Text nobody can read in the shot → gray placeholder bars. Data → a fictional brand.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AppBg, Sidebar} from '../film/ui';

export const TemplateScreen: React.FC = () => (
  <AbsoluteFill style={{width: 2000, height: 1125}}>
    <AppBg />
    <Sidebar />
    {/* main area starts at x 316; the right edge is 1984 (or 1595 when a side panel is open) */}
  </AbsoluteFill>
);
