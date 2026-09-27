// Verifies the render (dimensions, fps, duration, codec) and that every number
// the composition can put on screen as a settled value is one of the locked facts.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';

const LOCKED = {
  transactions: '15,500',
  transactionsYoy: '+103.6% y/y',
  salesValue: 'AED 67.8bn',
  salesValueYoy: '+177.9% y/y',
  offPlan: '82.7%',
  offPlanRemainder: '17.3%', // derived: 100 − 82.7, shown only as the quiet remainder label
  scope: 'City series excludes residential complexes, duplexes and penthouses.',
  source: 'Source: Cavendish Maxwell, Abu Dhabi City residential series · H1 2026',
  priceHeadline: '+21.6%', priceApartments: '+24.4%', priceVillas: '+6.3%',
  priceSource: 'Source: CBRE UAE Real Estate Market Review · Q2 2026',
  rateApartments: 'AED 17,200', rateVillasTownhouses: 'AED 12,100', rateUnit: '/ SQM',
  rateSource: 'Source: Savills Abu Dhabi Residential Market · Q2 2026',
  rateCaveat: 'Average transaction rates; project mix affects comparison.',
  legal: 'The Prop Co Real Estate Space LLC OPC · Broker Licence No. 202400892044',
};

let ok = true;
const check = (cond, msg) => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${msg}`); if (!cond) ok = false; };

// ---- data file matches locked facts
const d = JSON.parse(fs.readFileSync('data/market.json', 'utf8'));
const m = d.metrics;
check(m.transactions.display === LOCKED.transactions && m.transactions.value === 15500, 'transactions = 15,500');
check(m.transactions.yoy.display === LOCKED.transactionsYoy, 'transactions y/y = +103.6%');
check(m.salesValue.display === LOCKED.salesValue && m.salesValue.valueAedBn === 67.8, 'sales value = AED 67.8bn');
check(m.salesValue.yoy.display === LOCKED.salesValueYoy, 'sales value y/y = +177.9%');
check(m.offPlanShare.display === LOCKED.offPlan && m.offPlanShare.value === 82.7, 'off-plan share = 82.7%');
check(m.offPlanShare.remainder.display === LOCKED.offPlanRemainder && Math.abs(100 - 82.7 - m.offPlanShare.remainder.value) < 1e-9, 'remainder = 17.3% (100 − 82.7)');
check(d.market === 'Abu Dhabi City' && d.period === 'H1 2026', 'scope = Abu Dhabi City, H1 2026');
check(d.scopeNote === LOCKED.scope, 'scope note text');
check(d.source.full === LOCKED.source, 'source text');
check(d.summaryLine.join(' · ') === '15,500 sales · AED 67.8bn · 82.7% off-plan', 'summary line');
const pm = d.priceMomentum, cp = d.currentPricing;
check(pm.residential.display === LOCKED.priceHeadline && pm.residential.value === 21.6 && pm.residential.suffix === 'Y/Y', 'CBRE residential prices = +21.6% Y/Y');
check(pm.apartments.display === LOCKED.priceApartments && pm.apartments.value === 24.4, 'CBRE apartments = +24.4%');
check(pm.villas.display === LOCKED.priceVillas && pm.villas.value === 6.3, 'CBRE villas = +6.3%');
check(pm.source === LOCKED.priceSource, 'CBRE source line');
check(cp.apartments.display === LOCKED.rateApartments && cp.apartments.value === 17200 && cp.apartments.unit === LOCKED.rateUnit, 'Savills apartments = AED 17,200 / SQM');
check(cp.villasTownhouses.display === LOCKED.rateVillasTownhouses && cp.villasTownhouses.value === 12100 && cp.villasTownhouses.label === 'Villas & Townhouses', 'Savills villas & townhouses = AED 12,100 / SQM');
check(cp.source === LOCKED.rateSource && cp.caveat === LOCKED.rateCaveat, 'Savills source + caveat');
check(d.legal === LOCKED.legal, 'legal line');
// Display strings must agree with their numeric values (no re-rounding).
check(Number(pm.residential.display.replace(/[+%]/g, '')) === pm.residential.value, 'CBRE display/value agree');
check(Number(cp.apartments.display.replace(/[^\d]/g, '')) === cp.apartments.value && Number(cp.villasTownhouses.display.replace(/[^\d]/g, '')) === cp.villasTownhouses.value, 'Savills display/value agree');

// ---- no hard-coded numeric claims in the typography source
const film = ['src/Film.tsx', 'src/PublisherScenes.tsx', 'src/Ending.tsx', 'src/theme.tsx'].map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const jsxText = [...film.matchAll(/>([^<>{}]+)</g)].map((x) => x[1].trim()).filter((s) => /\d/.test(s) && !/[;=(){}&|\n]/.test(s));
const allowed = ['01 / 05', '02 / 05', '03 / 05', '04 / 05', '05 / 05', 'H1 2026'];
const stray = jsxText.filter((s) => !allowed.some((a) => s.includes(a)));
check(stray.length === 0, `no stray literal numbers in on-screen JSX text${stray.length ? ': ' + stray.join(' | ') : ''}`);

// ---- brand system / render hygiene
const src = fs.readdirSync('src').map((f) => fs.readFileSync(`src/${f}`, 'utf8')).join('\n');
check(!/SlotString|landedCount\(t\)\.toLocaleString|count-up/i.test(src.replace(/\/\/.*$/gm, '')), 'no rolling digits or count-up in the typography');
check(!/Arial|Helvetica|sans-serif|system-ui/.test(src), 'no fallback / substitute font families referenced');
check(/export const FONT = 'Inter';/.test(src), 'Inter is the only registered family');

// ---- design-system pack (sp_ce-design-system-pack): no-conflict items for this job
const PACK = '../../../sp_ce-design-system-pack';
const same = (a, b) => fs.readFileSync(a).equals(fs.readFileSync(b));
check(same('tokens/design-tokens.json', `${PACK}/design-tokens.json`), 'tokens/design-tokens.json is the pack file, byte-for-byte');
check(same('public/fonts/Inter-VariableFont_slnt_wght.ttf', `${PACK}/ASSETS/fonts/Inter-VariableFont_slnt_wght.ttf`), 'Inter loaded from the pack ASSETS/fonts file, byte-for-byte');
check(!/#[0-9A-Fa-f]{6}\b/.test(['theme.tsx', 'Film.tsx', 'PublisherScenes.tsx', 'Ending.tsx', 'Field.tsx', 'SceneParticles.tsx', 'publisherLayout.ts'].map((f) => fs.readFileSync(`src/${f}`, 'utf8')).join('\n')), 'no typed hex colours: all colours referenced by token name');
check(!/rgba\(\s*\d/.test(['theme.tsx', 'Film.tsx', 'PublisherScenes.tsx', 'Ending.tsx', 'publisherLayout.ts'].map((f) => fs.readFileSync(`src/${f}`, 'utf8')).join('\n')), 'no literal rgba() colours in typography/layout (token-derived only)');
const holds = JSON.parse(execFileSync('npx', ['tsx', 'scripts/holds.ts'], {stdio: ['ignore', 'pipe', 'ignore']}).toString());
for (const h of holds.holds) check(h.seconds >= (h.name.startsWith('H1 three') ? 4.5 : 2.5), `hold ${h.seconds}s: ${h.name}`);
check(!/#090D16|rgba\(9,13,22|rgba\(214,224,255|rgba\(28,40,78/.test(src), 'palette: no off-brand navy / tinted greys remain');
check(fs.readFileSync('public/brand/sp_ce-logo.svg', 'utf8') === fs.readFileSync('../../../small.svg', 'utf8'), 'end logo is the supplied official SVG, byte-for-byte');

// ---- render properties
const file = 'out/abu-dhabi-h1-2026.mp4';
check(fs.existsSync(file), `${file} exists`);
if (fs.existsSync(file)) {
  const out = execFileSync('npx', ['remotion', 'ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
    'stream=codec_name,profile,width,height,r_frame_rate,nb_frames,pix_fmt:format=duration', '-of', 'json', file], {stdio: ['ignore', 'pipe', 'ignore']}).toString();
  const j = JSON.parse(out.slice(out.indexOf('{')));
  const s = j.streams[0];
  const dur = Number(j.format.duration);
  console.log('      ', JSON.stringify({...s, duration: dur}));
  check(s.codec_name === 'h264', 'codec H.264');
  check(s.width === 1080 && s.height === 1920, '1080 × 1920');
  check(s.r_frame_rate === '30/1', '30 fps');
  // Duration comes from the hold time-map (scripts/holds.ts).
  check(Number(s.nb_frames) === holds.frames && Math.abs(dur - holds.frames / 30) < 0.05, `duration ${dur.toFixed(3)}s = ${holds.frames} frames (time-map)`);
  check(s.pix_fmt === 'yuv420p', 'yuv420p (phone/social compatible)');
  const audio = execFileSync('npx', ['remotion', 'ffprobe', '-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', file], {stdio: ['ignore', 'pipe', 'ignore']}).toString().trim();
  check(audio === '', 'no audio track (no narration)');
}
console.log(ok ? '\nALL CHECKS PASSED' : '\nSOME CHECKS FAILED');
process.exit(ok ? 0 : 1);
