// Timing, copy, source and share-field QA for scene.html, measured from the scene itself (no screenshots).
//   NODE_PATH=... node qa.mjs   → prints a summary and writes qa-timing.json
// A block is "readable" on a frame when every mask line is at full opacity and at rest, every figure is at full
// opacity with no rise, and (for data beats) its source is at full opacity.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30, FRAMES = 900;

const COPY = {
  title: ["A future economy", "needs more than", "a headline."],
  b1: ['US$1.5bn', 'Microsoft investment in G42 announced', 'April 2024', 'Microsoft · 16 Apr 2024'],
  b2: ['1GW', 'Stargate UAE cluster announced', 'Abu Dhabi · May 2025', 'OpenAI · 22 May 2025'],
  b3: ['95%', 'Public-sector employees', 'completed AI training', 'Abu Dhabi · 2025', 'Abu Dhabi DGE · 2025 review · 8 Jan 2026'],
  ov: ['US$1.5bn', 'Investment.', 'Microsoft · 16 Apr 2024', '1GW', 'Planned computing capacity.', 'OpenAI · 22 May 2025',
       '95%', 'Skills already developed.', 'Abu Dhabi DGE · 2025 review · 8 Jan 2026'],
  final: ['Look at the', 'foundations of the', 'next economy.'],
};
const BLOCKS = Object.keys(COPY);

const browser = await chromium.launch({headless: true});
const page = await browser.newPage({viewport: {width: 1080, height: 1920}});
const net = [];
await page.route('**/*', r => { if (r.request().url().startsWith('file://')) return r.continue(); net.push(r.request().url()); return r.abort(); });
await page.goto(pathToFileURL(path.join(HERE, 'scene.html')).href + '?render=1');
const scene = await page.evaluate(() => window.sceneReady);

const copy = await page.evaluate(blocks => {
  const out = {};
  for (const id of blocks) out[id] = [...document.getElementById(id).querySelectorAll('.ink')].filter(e => !e.parentElement.closest('.ink')).map(e => e.textContent.trim());
  out.__all = [...document.getElementById('text').querySelectorAll('.ink')].filter(e => !e.parentElement.closest('.ink')).map(e => e.textContent.trim());
  out.__fonts = [...new Set([...document.querySelectorAll('#text *')].map(e => getComputedStyle(e).fontFamily))];
  out.__figSizes = [...document.querySelectorAll('#ov .sum')].map(e => getComputedStyle(e).fontSize);
  return out;
}, BLOCKS);

const rows = [];
for (let i = 0; i < FRAMES; i++) {
  rows.push(await page.evaluate(([t, blocks]) => {
    const s = window.renderAt(t);
    const op = el => getComputedStyle(el).visibility === 'hidden' ? 0 : Number(el.style.opacity === '' ? 1 : el.style.opacity);
    const atRest = el => { const tr = el.style.transform || ''; const m = tr.match(/-?[\d.]+/); return !m || Math.abs(parseFloat(m[0])) < 0.05; };
    const r = {t, inGlyph: s.inGlyph, particles: s.particles, blue: s.fieldBlueDots, white: s.fieldWhiteDots};
    for (const id of blocks) {
      const blk = document.getElementById(id);
      if (getComputedStyle(blk).visibility === 'hidden') { r[id] = 0; continue; }
      const parts = [...blk.querySelectorAll('.mask > div'), ...blk.querySelectorAll('.fig'), ...blk.querySelectorAll('.src')];
      const full = parts.every(p => op(p) >= 0.999 && (p.classList.contains('src') || atRest(p)));
      r[id] = full ? 1 : parts.some(p => op(p) > 0.001) ? 0.5 : 0;
    }
    // figure ↔ source pairing, per beat and per overview row
    r.pairs = [];
    for (const id of ['b1', 'b2', 'b3']) { const b = document.getElementById(id); r.pairs.push([op(b.querySelector('.fig')), op(b.querySelector('.src'))]); }
    for (const row of document.querySelectorAll('#ov .row')) { const m = row.querySelectorAll('.mask > div'); r.pairs.push([op(row.querySelector('.fig')), op(m[m.length - 1])]); }
    r.b3fig = op(document.querySelector('#b3 .fig'));
    return r;
  }, [i / FPS, BLOCKS]));
}
await browser.close();

function intervals(key) {
  const out = []; let start = null;
  rows.forEach((r, i) => { const on = r[key] === 1; if (on && start === null) start = i; if ((!on || i === FRAMES - 1) && start !== null) { out.push({from: +(start / FPS).toFixed(3), to: +((on ? i + 1 : i) / FPS).toFixed(3), seconds: +(((on ? i + 1 : i) - start) / FPS).toFixed(3)}); start = null; } });
  return out;
}
const R = {scene, network: net, copy: {}, readable: {}, checks: {}};
for (const id of BLOCKS) R.copy[id] = {expected: COPY[id], onScreen: copy[id], ok: JSON.stringify(copy[id]) === JSON.stringify(COPY[id])};
R.copy.noOtherText = JSON.stringify(copy.__all) === JSON.stringify(BLOCKS.flatMap(b => COPY[b]));
R.copy.fonts = copy.__fonts;
R.copy.overviewFigureSizes = copy.__figSizes;
for (const id of BLOCKS) R.readable[id] = intervals(id);
const longest = id => Math.max(0, ...R.readable[id].map(x => x.seconds));
R.checks.dataHolds = {b1: longest('b1'), b2: longest('b2'), b3: longest('b3'), ok: ['b1', 'b2', 'b3'].every(b => longest(b) >= 2.5)};
R.checks.overviewHold = {seconds: longest('ov'), ok: longest('ov') >= 4.5};
R.checks.titleHold = longest('title');
const finalOn = rows.find(r => r.final === 1)?.t;
R.checks.final = {fullyOnAt: finalOn, holdsToEnd: rows.filter(r => r.t >= finalOn).every(r => r.final === 1)};
// order: data states fall in their windows
R.checks.windows = {
  b1: R.readable.b1.map(x => [x.from, x.to]), b2: R.readable.b2.map(x => [x.from, x.to]), b3: R.readable.b3.map(x => [x.from, x.to]), ov: R.readable.ov.map(x => [x.from, x.to]),
};
R.checks.sourcesWhileFigures = {violations: rows.flatMap(r => r.pairs.map((p, k) => p[0] > 0.001 && p[1] < 0.999 * Math.min(1, p[0] + 1e-9) && p[1] < p[0] ? [r.t, k, p] : null).filter(Boolean)).slice(0, 20)};
R.checks.sourcesWhileFigures.ok = R.checks.sourcesWhileFigures.violations.length === 0;
const first95 = rows.find(r => r.b3fig > 0);
R.checks.splitBeforeNumber = {first95Frame: first95?.t, blueDots: first95?.blue, whiteDots: first95?.white, ok: first95?.blue === 950 && first95?.white === 50};
R.checks.fieldDuringHold = rows.filter(r => r.b3 === 1).every(r => r.blue === 950 && r.white === 50);
R.checks.keepOut = {framesWithParticleInGlyph: rows.filter(r => r.inGlyph > 0).length};
R.checks.particles = {constant: new Set(rows.map(r => r.particles)).size === 1, count: rows[0].particles};
fs.writeFileSync(path.join(HERE, 'qa-timing.json'), JSON.stringify(R, null, 2));
console.log(JSON.stringify({network: R.network, copyOk: BLOCKS.every(b => R.copy[b].ok), noOtherText: R.copy.noOtherText, fonts: R.copy.fonts, ovSizes: R.copy.overviewFigureSizes, readable: R.readable, checks: R.checks}, null, 1));
