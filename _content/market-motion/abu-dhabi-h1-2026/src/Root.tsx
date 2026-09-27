import React from 'react';
import {Composition, continueRender, delayRender, staticFile} from 'remotion';
import {Film} from './Film';
import {DURATION, FPS, H, W} from './world';

// Inter Variable (rsms Inter 4, SIL OFL) is the ONLY typeface in the film. It is bundled
// locally and registered as family "Inter" across the full 100–900 weight axis.
// Rendering fails if it does not load, so no fallback face can ever be substituted.
const fontHandle = delayRender('Loading Inter Variable');
const inter = new FontFace('Inter', `url(${staticFile('fonts/InterVariable-latin.woff2')}) format('woff2')`, {weight: '100 900', style: 'normal'});
inter
  .load()
  .then((f) => {
    document.fonts.add(f);
    return document.fonts.ready;
  })
  .then(() => {
    for (const w of [300, 400, 600, 700, 800]) {
      if (!document.fonts.check(`${w} 40px Inter`)) throw new Error(`Inter ${w} not available`);
    }
    continueRender(fontHandle);
  })
  .catch((e) => {
    throw new Error(`Inter Variable failed to load: ${e}`);
  });

export const RemotionRoot: React.FC = () => (
  <Composition id="AbuDhabiH12026" component={Film} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
);
