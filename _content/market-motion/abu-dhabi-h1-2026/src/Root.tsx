import React from 'react';
import {Composition, continueRender, delayRender, staticFile} from 'remotion';
import {Film} from './Film';
import {DURATION, FPS, H, W} from './world';

// Inter (variable) from the sp_ce pack, ASSETS/fonts/Inter-VariableFont_slnt_wght.ttf, is the ONLY
// typeface in the film, registered as family "Inter" across the 100–900 weight axis.
// Rendering fails if it does not load, so no fallback face can ever be substituted.
const fontHandle = delayRender('Loading Inter Variable');
const inter = new FontFace('Inter', `url(${staticFile('fonts/Inter-VariableFont_slnt_wght.ttf')}) format('truetype')`, {weight: '100 900', style: 'normal'});
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
