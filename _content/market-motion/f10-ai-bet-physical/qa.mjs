// Timing and copy QA for scene.html, measured from the scene itself (no screenshots).
//
//   node qa.mjs            → prints a report and writes qa-timing.json
//
// For every one of the 900 frames it calls renderAt(t) and reads the DOM state of each text block:
// a block is "readable" on a frame when every line is at full opacity and at rest (no mask offset, no rise).
// It also records the text-keep-out counter and checks the on-screen copy against the locked strings.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30, FRAMES = 900;

const COPY = {
  title: "Abu Dhabi's AI bet is physical.",
  fig: '1GW',
  lab: 'Stargate UAE cluster announced',
  sup: 'Abu Dhabi · Announced May 2025',
  compute: 'Compute needs infrastructure.',
  final: "Read the city's next economy.",
  src: 'OpenAI · Introducing Stargate UAE · 22 May 2025',
};

const browser = await chromium.launch({headless: true});
const page = await browser.newPage({viewport: {width: 1080, height: 1920}});
const net = [];
await page.route('**/*', r => { if (r.request().url().startsWith('file://')) return r.continue(); net.push(r.request().url()); return r.abort(); });
await page.goto(pathToFileURL(path.join(HERE, 'scene.html')).href + '?render=1');
const scene = await page.evaluate(() => window.sceneReady);

const copy = await page.evaluate(() => {
  const out = {};
  for (const id of ['title', 'fig', 'lab', 'sup', 'compute', 'final', 'src'])
    out[id] = [...document.getElementById(id).querySelectorAll('[data-copy]')].map(e => e.textContent).join(' ').replace(/\s+/g, ' ').trim();
  out.allText = document.getElementById('text').textContent.replace(/\s+/g, ' ').trim();
  out.fontFamilies = [...new Set([...document.querySelectorAll('#text *')].map(e => getComputedStyle(e).fontFamily))];
  return out;
});

const rows = [];
for (let i = 0; i < FRAMES; i++) {
  rows.push(await page.evaluate(t => {
    const s = window.renderAt(t);
    const state = {};
    const lineOK = el => {
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden') return 0;
      const m = new DOMMatrixReadOnly(cs.transform === 'none' ? undefined : cs.transform);
      return Number(cs.opacity) >= 0.999 && Math.abs(m.m42) < 0.5 ? 1 : (Number(cs.opacity) > 0.001 ? 0.5 : 0);
    };
    for (const id of ['title', 'lab', 'sup', 'compute', 'final']) {
      const blk = document.getElementById(id);
      if (getComputedStyle(blk).visibility === 'hidden') { state[id] = 0; continue; }
      const v = [...blk.querySelectorAll('.mask > div')].map(lineOK);
      state[id] = Math.min(...v) === 1 ? 1 : Math.max(...v) > 0 ? 0.5 : 0;
    }
    state.fig = lineOK(document.getElementById('fig'));
    { const o = Number(getComputedStyle(document.getElementById('src')).opacity); state.src = o >= 0.999 ? 1 : o > 0.001 ? 0.5 : 0; }  // anchored by translateY(-100%), so opacity only
    return {t, inGlyph: s.inGlyph, drawn: s.drawn, particles: s.particles, ...state};
  }, i / FPS));
}
await browser.close();

// intervals where each block is readable (1) and where it is visible at all (>0)
function intervals(key, pred) {
  const out = []; let start = null;
  rows.forEach((r, i) => {
    const on = pred(r[key]);
    if (on && start === null) start = i;
    if ((!on || i === FRAMES - 1) && start !== null) { const end = on ? i + 1 : i; out.push([start / FPS, end / FPS]); start = null; }
  });
  return out;
}
const report = {scene, network: net, copy: {}, readable: {}, visible: {}, keepOut: {}, particles: {}};
for (const k in COPY) report.copy[k] = {expected: COPY[k], onScreen: copy[k], ok: copy[k] === COPY[k]};
report.copy.noOtherText = copy.allText === Object.values(COPY).join(' ') ? true : copy.allText;
report.copy.fontFamilies = copy.fontFamilies;
for (const k of ['title', 'fig', 'lab', 'sup', 'compute', 'final', 'src']) {
  report.readable[k] = intervals(k, v => v === 1).map(([a, b]) => ({from: a, to: b, seconds: +(b - a).toFixed(3)}));
  report.visible[k] = intervals(k, v => v > 0).map(([a, b]) => ({from: a, to: b}));
}
// the 1GW state is readable when figure, label and May 2025 line are all at rest together
const gwFrames = rows.filter(r => r.fig === 1 && r.lab === 1 && r.sup === 1);
report.readable.gwState = gwFrames.length ? {from: gwFrames[0].t, to: +(gwFrames.at(-1).t + 1 / FPS).toFixed(3), seconds: +(gwFrames.length / FPS).toFixed(3)} : null;
const firstSupVisible = rows.find(r => r.sup > 0)?.t, firstFigVisible = rows.find(r => r.fig > 0)?.t;
report.order = {mayLabelFirstVisible: firstSupVisible, figureFirstVisible: firstFigVisible, mayBeforeFigure: firstSupVisible < firstFigVisible};
report.finalFullyOnBy = rows.find(r => r.final === 1)?.t;
report.finalHoldsToEnd = rows.filter(r => r.t >= report.finalFullyOnBy).every(r => r.final === 1);
const lastFig = rows.filter(r => r.fig > 0).at(-1)?.t, lastSrc = rows.filter(r => r.src > 0).at(-1)?.t;
report.sourceThroughFigureExit = {figureLastVisible: lastFig, sourceLastVisible: lastSrc, ok: lastSrc >= lastFig && rows.every(r => !(r.fig > 0) || r.src > 0)};
report.keepOut = {framesWithParticleInGlyph: rows.filter(r => r.inGlyph > 0).map(r => [r.t, r.inGlyph])};
report.particles = {constantCount: new Set(rows.map(r => r.particles)).size === 1, count: rows[0].particles};
fs.writeFileSync(path.join(HERE, 'qa-timing.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
