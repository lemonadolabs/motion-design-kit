// The worked example of a rebuilt screen: Creatives → Ads with the Ask AI panel open,
// rendered at app size (2000 x 1125) so it can be overlaid on the reference screenshot.
//   npx remotion still src/index.ts Screen-Creatives out/stills/creatives.png
//   python3 scripts/rebuild/compare.py reference/screens/<your-capture>.png out/stills/creatives.png out/compare/creatives
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ADS, AppBg, Card, INITIAL, Panel, Sidebar, TopBar, slotXY, A} from '../film/ui';

export const CreativesScreen: React.FC = () => (
  <AbsoluteFill style={{width: 2000, height: 1125}}>
    <AppBg />
    <Sidebar />
    <TopBar open={1} sort="Hook rate" count={3} />
    {INITIAL.map((img, slot) => {
      const s = slotXY(slot, 1);
      return <Card key={img} ad={ADS[img]} w={s.w} check={slot < 3 ? 1 : 0} style={{left: s.x, top: s.y}} />;
    })}
    <Panel>
      <div style={{fontSize: 18, color: A.text3}}>Ask about the 3 selected ads.</div>
    </Panel>
  </AbsoluteFill>
);
