import React from 'react';
import {Composition, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {Film} from './Film';
import {DURATION, FPS, H, W} from './world';

// Inter (OFL) is bundled locally so renders never depend on the network.
for (const weight of ['300', '400', '500', '600']) {
  loadFont({family: 'Inter', url: staticFile(`fonts/inter-latin-${weight}-normal.woff2`), weight, format: 'woff2'});
}

export const RemotionRoot: React.FC = () => (
  <Composition id="AbuDhabiH12026" component={Film} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
);
