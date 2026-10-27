import React from 'react';
import {Composition} from 'remotion';
import {LaunchFilm} from './film/Film';
import {FPS, TOTAL} from './film/timeline';
import {CreativesScreen} from './screens/CreativesScreen';
import {TemplateScreen} from './screens/_TemplateScreen';

export const RemotionRoot: React.FC = () => (
  <>
    {/* Full film with the pre-mixed audio. Needs public/audio/mix.wav: add your music + SFX, then `npm run sound`. */}
    <Composition id="Launch-16x9" component={LaunchFilm} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
    {/* Picture only: fast drafts and stills. */}
    <Composition id="Launch-silent" component={LaunchFilm} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} defaultProps={{audio: false}} />
    {/* Rebuilt screens as stills at app size, to compare with the reference screenshots (docs/REBUILD-UI.md). */}
    <Composition id="Screen-Creatives" component={CreativesScreen} durationInFrames={1} fps={FPS} width={2000} height={1125} />
    <Composition id="Screen-Template" component={TemplateScreen} durationInFrames={1} fps={FPS} width={2000} height={1125} />
  </>
);
