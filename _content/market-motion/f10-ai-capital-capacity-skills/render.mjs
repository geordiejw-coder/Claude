// Render scene.html to PNG frames with headless Chromium, then encode with ffmpeg.
//
//   node render.mjs [--frames DIR] [--workers 4] [--only 90,300,540,780] [--no-encode]
//
// Requires Playwright (resolved from NODE_PATH or a local install) and ffmpeg on PATH.
// Every request the page makes must be a local file:// URL; any network request aborts the render.
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const require = createRequire(import.meta.url);
const {chromium} = require('playwright');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => {
  if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
  return acc;
}, []));
const FPS = 30, FRAMES = 900;
const framesDir = path.resolve(args.frames || path.join(HERE, 'frames'));
const workers = Number(args.workers || 4);
const only = args.only ? String(args.only).split(',').map(Number) : null;
const list = only || Array.from({length: FRAMES}, (_, i) => i);
const out = path.join(HERE, 'ai-capital-capacity-skills.mp4');
fs.mkdirSync(framesDir, {recursive: true});

const executablePath = process.env.CHROME_PATH || undefined;
// --disable-partial-raster: with partial raster, a screenshot taken every frame alternated between a fresh buffer and
// one still holding a 1 px sliver of a label from its mask reveal (seen at x 768–966, y 832 in the first F10 R3 render).
// One browser process per worker keeps each page in the foreground.
const ARGS = ['--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none', '--disable-partial-raster',
  '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows'];
const url = pathToFileURL(path.join(HERE, 'scene.html')).href + '?render=1';
const log = {maxInGlyph: 0, inGlyphFrames: [], blocked: []};

async function worker(ids) {
  const browser = await chromium.launch({headless: true, executablePath, args: ARGS});
  const page = await browser.newPage({viewport: {width: 1080, height: 1920}, deviceScaleFactor: 1});
  page.on('pageerror', e => { console.error('page error', e); process.exitCode = 1; });
  await page.route('**/*', route => {
    const u = route.request().url();
    if (u.startsWith('file://')) return route.continue();
    log.blocked.push(u); return route.abort();
  });
  await page.goto(url, {waitUntil: 'load'});
  const info = await page.evaluate(() => window.sceneReady);   // throws if Inter or the logo did not load
  for (const i of ids) {
    const s = await page.evaluate(t => { const r = window.renderAt(t); return {...r}; }, i / FPS);
    if (s.inGlyph > 0) { log.inGlyphFrames.push([i, s.inGlyph]); log.maxInGlyph = Math.max(log.maxInGlyph, s.inGlyph); }
    await page.screenshot({path: path.join(framesDir, `f${String(i).padStart(4, '0')}.png`), type: 'png'});
    if (i % 60 === 0) console.log(`frame ${i}  drawn ${s.drawn}/${s.particles}  inGlyph ${s.inGlyph}  field ${s.fieldBlueDots}+${s.fieldWhiteDots}`);
  }
  await browser.close();
  return info;
}
const t0 = Date.now();
const chunks = Array.from({length: workers}, (_, w) => list.filter((_, k) => k % workers === w));
const infos = await Promise.all(chunks.map(worker));
console.log('scene', infos[0], `rendered ${list.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
console.log('text keep-out: frames with a particle inside a glyph box:', log.inGlyphFrames.length, 'max', log.maxInGlyph);
if (log.blocked.length) { console.error('BLOCKED NETWORK REQUESTS', log.blocked); process.exit(1); }
fs.writeFileSync(path.join(framesDir, 'render-log.json'), JSON.stringify({...log, scene: infos[0]}, null, 2));

if (!only && !args['no-encode']) {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(framesDir, 'f%04d.png'),
    '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-movflags', '+faststart', '-r', String(FPS), out], {stdio: 'inherit'});
  console.log('wrote', out);
}
