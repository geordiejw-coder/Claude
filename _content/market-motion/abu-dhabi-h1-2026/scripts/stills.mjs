// Renders individual frames (seconds given as args) to out/stills/ for review.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const browserExecutable = process.env.REMOTION_BROWSER || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const secs = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'AbuDhabiH12026', browserExecutable});
fs.mkdirSync('out/stills', {recursive: true});
for (const s of secs) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(s * composition.fps));
  const output = `out/stills/f${String(frame).padStart(3, '0')}.png`;
  await renderStill({serveUrl, composition, frame, output, browserExecutable, imageFormat: 'png'});
  console.log(output);
}
